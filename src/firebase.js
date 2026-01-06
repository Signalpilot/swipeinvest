// Firebase Configuration for Swipefolio
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Swipefolio Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBtziKGoOU5xkWYU02ejnsz0-mA8LAHSI4",
  authDomain: "swipefolio-1c2f0.firebaseapp.com",
  projectId: "swipefolio-1c2f0",
  storageBucket: "swipefolio-1c2f0.firebasestorage.app",
  messagingSenderId: "378538752218",
  appId: "1:378538752218:web:875d3de9cefb80ccd9cde3",
  measurementId: "G-MMLH3ET3F9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return { user: null, error: error.message };
  }
};

export const signInWithApple = async () => {
  try {
    const result = await signInWithPopup(auth, appleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    console.error('Apple sign-in error:', error);
    return { user: null, error: error.message };
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    // If user doesn't exist, create account
    if (error.code === 'auth/user-not-found') {
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return { user: result.user, error: null };
      } catch (createError) {
        return { user: null, error: createError.message };
      }
    }
    return { user: null, error: error.message };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export { onAuthStateChanged };

// ============================================================================
// FIRESTORE - Community Features
// ============================================================================

// --- User Profile ---
export const saveUserProfile = async (userId, data) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { error: null };
  } catch (error) {
    console.error('Save profile error:', error);
    return { error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    return { data: docSnap.exists() ? docSnap.data() : null, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// --- Swipe Tracking (APE/RUG) ---
export const saveSwipe = async (userId, coinId, coinData, direction) => {
  try {
    const swipeRef = doc(db, 'users', userId, 'swipes', coinId);
    await setDoc(swipeRef, {
      coinId,
      symbol: coinData.symbol,
      name: coinData.name,
      image: coinData.image,
      direction, // 'ape' or 'rug'
      priceAtSwipe: coinData.current_price,
      swipedAt: serverTimestamp()
    });

    // Update user's swipe stats for leaderboard
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      totalSwipes: increment(1),
      apeCount: increment(direction === 'ape' ? 1 : 0),
      rugCount: increment(direction === 'rug' ? 1 : 0),
      lastSwipeAt: serverTimestamp()
    }, { merge: true });

    // Update coin's APE/RUG count for social proof & matching
    const coinStatsRef = doc(db, 'coinStats', coinId);
    if (direction === 'ape') {
      await setDoc(coinStatsRef, {
        apeCount: increment(1),
        apers: arrayUnion(userId),
        symbol: coinData.symbol,
        name: coinData.name,
        image: coinData.image,
        lastUpdated: serverTimestamp()
      }, { merge: true });
    } else if (direction === 'rug') {
      await setDoc(coinStatsRef, {
        rugCount: increment(1),
        symbol: coinData.symbol,
        name: coinData.name,
        image: coinData.image,
        lastUpdated: serverTimestamp()
      }, { merge: true });
    }

    return { error: null };
  } catch (error) {
    console.error('Save swipe error:', error);
    return { error: error.message };
  }
};

export const getUserSwipes = async (userId) => {
  try {
    const swipesRef = collection(db, 'users', userId, 'swipes');
    const q = query(swipesRef, orderBy('swipedAt', 'desc'));
    const snapshot = await getDocs(q);
    const swipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { data: swipes, error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

// --- Investor Matching ---
export const getInvestorMatches = async (userId) => {
  try {
    // Get user's APEd coins
    const userSwipesRef = collection(db, 'users', userId, 'swipes');
    const userSwipesQ = query(userSwipesRef, where('direction', '==', 'ape'));
    const userSwipes = await getDocs(userSwipesQ);
    const userApes = userSwipes.docs.map(d => d.id);

    if (userApes.length === 0) return { data: [], error: null };

    // Find other users who APEd the same coins
    const matchScores = {};

    for (const coinId of userApes.slice(0, 10)) { // Limit to avoid too many queries
      const coinStatsRef = doc(db, 'coinStats', coinId);
      const coinStats = await getDoc(coinStatsRef);
      if (coinStats.exists()) {
        const apers = coinStats.data().apers || [];
        for (const aperId of apers) {
          if (aperId !== userId) {
            matchScores[aperId] = (matchScores[aperId] || 0) + 1;
          }
        }
      }
    }

    // Get user profiles for matches
    const matches = [];
    const sortedMatches = Object.entries(matchScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    for (const [matchUserId, score] of sortedMatches) {
      const userDoc = await getDoc(doc(db, 'users', matchUserId));
      if (userDoc.exists()) {
        matches.push({
          id: matchUserId,
          ...userDoc.data(),
          matchScore: score,
          commonCoins: score
        });
      }
    }

    return { data: matches, error: null };
  } catch (error) {
    console.error('Get matches error:', error);
    return { data: [], error: error.message };
  }
};

// --- Chat Rooms (per-coin) ---
export const sendChatMessage = async (coinId, userId, userDisplayName, userPhoto, message) => {
  try {
    const messagesRef = collection(db, 'chatRooms', coinId, 'messages');
    const newMsgRef = doc(messagesRef);
    await setDoc(newMsgRef, {
      userId,
      userDisplayName: userDisplayName || 'Anonymous',
      userPhoto: userPhoto || null,
      message,
      createdAt: serverTimestamp()
    });
    return { error: null };
  } catch (error) {
    console.error('Send message error:', error);
    return { error: error.message };
  }
};

export const subscribeToChatRoom = (coinId, callback) => {
  const messagesRef = collection(db, 'chatRooms', coinId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(50));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).reverse();
    callback(messages);
  });
};

export const getChatRoomStats = async (coinId) => {
  try {
    const messagesRef = collection(db, 'chatRooms', coinId, 'messages');
    const snapshot = await getDocs(messagesRef);
    return { messageCount: snapshot.size, error: null };
  } catch (error) {
    return { messageCount: 0, error: error.message };
  }
};

// --- 1-on-1 Matching ---
export const sendMatchRequest = async (fromUserId, toUserId) => {
  try {
    const requestRef = doc(db, 'matchRequests', `${fromUserId}_${toUserId}`);
    await setDoc(requestRef, {
      from: fromUserId,
      to: toUserId,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const acceptMatchRequest = async (fromUserId, toUserId) => {
  try {
    // Update request status
    const requestRef = doc(db, 'matchRequests', `${fromUserId}_${toUserId}`);
    await updateDoc(requestRef, { status: 'accepted' });

    // Create mutual connection
    const conn1 = doc(db, 'users', fromUserId, 'connections', toUserId);
    const conn2 = doc(db, 'users', toUserId, 'connections', fromUserId);
    await setDoc(conn1, { connectedAt: serverTimestamp() });
    await setDoc(conn2, { connectedAt: serverTimestamp() });

    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const getMatchRequests = async (userId) => {
  try {
    const requestsRef = collection(db, 'matchRequests');
    const q = query(requestsRef, where('to', '==', userId), where('status', '==', 'pending'));
    const snapshot = await getDocs(q);

    const requests = [];
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const fromUser = await getDoc(doc(db, 'users', data.from));
      if (fromUser.exists()) {
        requests.push({
          id: docSnap.id,
          ...data,
          fromUser: fromUser.data()
        });
      }
    }

    return { data: requests, error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

export const getUserConnections = async (userId) => {
  try {
    const connectionsRef = collection(db, 'users', userId, 'connections');
    const snapshot = await getDocs(connectionsRef);

    const connections = [];
    for (const connDoc of snapshot.docs) {
      const userDoc = await getDoc(doc(db, 'users', connDoc.id));
      if (userDoc.exists()) {
        connections.push({
          id: connDoc.id,
          ...userDoc.data(),
          connectedAt: connDoc.data().connectedAt
        });
      }
    }

    return { data: connections, error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

// --- Direct Messages ---
export const sendDirectMessage = async (fromUserId, toUserId, message) => {
  try {
    // Create consistent chat ID (alphabetically sorted)
    const chatId = [fromUserId, toUserId].sort().join('_');
    const messagesRef = collection(db, 'directMessages', chatId, 'messages');
    const newMsgRef = doc(messagesRef);
    await setDoc(newMsgRef, {
      from: fromUserId,
      message,
      createdAt: serverTimestamp()
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const subscribeToDirectMessages = (userId1, userId2, callback) => {
  const chatId = [userId1, userId2].sort().join('_');
  const messagesRef = collection(db, 'directMessages', chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(100));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).reverse();
    callback(messages);
  });
};

// --- Get Coin Stats (for social proof) ---
export const getCoinStats = async (coinId) => {
  try {
    const coinStatsRef = doc(db, 'coinStats', coinId);
    const docSnap = await getDoc(coinStatsRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const apeCount = data.apeCount || 0;
      const rugCount = data.rugCount || 0;
      const totalSwipes = apeCount + rugCount;
      const apeRatio = totalSwipes > 0 ? Math.round((apeCount / totalSwipes) * 100) : null;
      return {
        data: {
          ...data,
          apeCount,
          rugCount,
          totalSwipes,
          apeRatio
        },
        error: null
      };
    }
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const getCoinStatsBatch = async (coinIds) => {
  try {
    const stats = {};
    // Fetch in parallel for better performance
    const promises = coinIds.map(async (coinId) => {
      const result = await getCoinStats(coinId);
      if (result.data) {
        stats[coinId] = result.data;
      }
    });
    await Promise.all(promises);
    return { data: stats, error: null };
  } catch (error) {
    return { data: {}, error: error.message };
  }
};

// --- Trending Coins (by APE count) ---
export const getTrendingCoins = async () => {
  try {
    const coinStatsRef = collection(db, 'coinStats');
    const q = query(coinStatsRef, orderBy('apeCount', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    const trending = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { data: trending, error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

// --- Leaderboard (Top Swipers) ---
export const getLeaderboard = async (limitCount = 10) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('totalSwipes', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);

    const leaderboard = snapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        id: doc.id,
        rank: index + 1,
        displayName: data.displayName || 'Anonymous',
        photoURL: data.photoURL,
        totalSwipes: data.totalSwipes || 0,
        apeCount: data.apeCount || 0,
        rugCount: data.rugCount || 0,
        apeRate: data.totalSwipes > 0
          ? Math.round((data.apeCount / data.totalSwipes) * 100)
          : 0
      };
    });

    return { data: leaderboard, error: null };
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return { data: [], error: error.message };
  }
};

// --- Get User Rank ---
export const getUserRank = async (userId) => {
  try {
    // Get user's total swipes
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return { rank: null, error: null };

    const userSwipes = userDoc.data().totalSwipes || 0;

    // Count users with more swipes
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('totalSwipes', '>', userSwipes));
    const snapshot = await getDocs(q);

    return { rank: snapshot.size + 1, totalSwipes: userSwipes, error: null };
  } catch (error) {
    return { rank: null, error: error.message };
  }
};

// ============================================================================
// PORTFOLIO CLOUD SYNC
// ============================================================================

// --- Save Portfolio to Cloud ---
export const savePortfolioToCloud = async (userId, portfolio) => {
  try {
    const portfolioRef = doc(db, 'users', userId, 'data', 'portfolio');
    await setDoc(portfolioRef, {
      positions: portfolio,
      lastSyncedAt: serverTimestamp(),
      positionCount: portfolio.length
    });
    return { error: null };
  } catch (error) {
    console.error('Save portfolio error:', error);
    return { error: error.message };
  }
};

// --- Load Portfolio from Cloud ---
export const loadPortfolioFromCloud = async (userId) => {
  try {
    const portfolioRef = doc(db, 'users', userId, 'data', 'portfolio');
    const docSnap = await getDoc(portfolioRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        data: data.positions || [],
        lastSyncedAt: data.lastSyncedAt,
        error: null
      };
    }
    return { data: [], lastSyncedAt: null, error: null };
  } catch (error) {
    console.error('Load portfolio error:', error);
    return { data: [], error: error.message };
  }
};

// --- Save User Stats to Cloud ---
export const saveStatsToCloud = async (userId, stats) => {
  try {
    const statsRef = doc(db, 'users', userId, 'data', 'stats');
    await setDoc(statsRef, {
      ...stats,
      lastSyncedAt: serverTimestamp()
    });
    return { error: null };
  } catch (error) {
    console.error('Save stats error:', error);
    return { error: error.message };
  }
};

// --- Load User Stats from Cloud ---
export const loadStatsFromCloud = async (userId) => {
  try {
    const statsRef = doc(db, 'users', userId, 'data', 'stats');
    const docSnap = await getDoc(statsRef);

    if (docSnap.exists()) {
      return { data: docSnap.data(), error: null };
    }
    return { data: null, error: null };
  } catch (error) {
    console.error('Load stats error:', error);
    return { data: null, error: error.message };
  }
};

// ============================================================================
// STREAK TRACKING
// ============================================================================

// Helper to get today's date key (YYYY-MM-DD)
const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// Helper to get yesterday's date key
const getYesterdayKey = () => {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// --- Update Streak on Swipe ---
export const updateStreak = async (userId) => {
  try {
    const streakRef = doc(db, 'users', userId, 'data', 'streak');
    const streakDoc = await getDoc(streakRef);
    const today = getTodayKey();
    const yesterday = getYesterdayKey();

    let streakData = {
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today,
      totalActiveDays: 1,
      streakStartDate: today
    };

    if (streakDoc.exists()) {
      const existing = streakDoc.data();

      if (existing.lastActiveDate === today) {
        // Already active today, no update needed
        return { data: existing, error: null };
      } else if (existing.lastActiveDate === yesterday) {
        // Continue streak!
        streakData = {
          currentStreak: (existing.currentStreak || 0) + 1,
          longestStreak: Math.max(existing.longestStreak || 0, (existing.currentStreak || 0) + 1),
          lastActiveDate: today,
          totalActiveDays: (existing.totalActiveDays || 0) + 1,
          streakStartDate: existing.streakStartDate || today
        };
      } else {
        // Streak broken, start new
        streakData = {
          currentStreak: 1,
          longestStreak: existing.longestStreak || 1,
          lastActiveDate: today,
          totalActiveDays: (existing.totalActiveDays || 0) + 1,
          streakStartDate: today
        };
      }
    }

    await setDoc(streakRef, {
      ...streakData,
      updatedAt: serverTimestamp()
    });

    return { data: streakData, error: null };
  } catch (error) {
    console.error('Update streak error:', error);
    return { data: null, error: error.message };
  }
};

// --- Get User Streak ---
export const getUserStreak = async (userId) => {
  try {
    const streakRef = doc(db, 'users', userId, 'data', 'streak');
    const streakDoc = await getDoc(streakRef);

    if (streakDoc.exists()) {
      const data = streakDoc.data();
      const today = getTodayKey();
      const yesterday = getYesterdayKey();

      // Check if streak is still valid
      if (data.lastActiveDate !== today && data.lastActiveDate !== yesterday) {
        // Streak is broken
        return {
          data: {
            ...data,
            currentStreak: 0,
            isActive: false
          },
          error: null
        };
      }

      return {
        data: {
          ...data,
          isActive: data.lastActiveDate === today
        },
        error: null
      };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Get streak error:', error);
    return { data: null, error: error.message };
  }
};

// ============================================================================
// PUSH NOTIFICATIONS (Firebase Cloud Messaging)
// ============================================================================

// Initialize messaging (lazy load to avoid SSR issues)
let messaging = null;
const getMessagingInstance = () => {
  if (typeof window !== 'undefined' && !messaging) {
    try {
      messaging = getMessaging(app);
    } catch (error) {
      console.error('Failed to initialize FCM:', error);
    }
  }
  return messaging;
};

// VAPID key for web push (Firebase Console > Project Settings > Cloud Messaging > Web Push certificates)
const VAPID_KEY = 'BHFzhayIO-ulnpO3L1WLyS_Fi_Hibf-iXgiujMoITULJ81Q6esgZk0N3mp9QHDzPQmkd1hV1XBG3h8HJY9cYhmE';

// --- Request Notification Permission ---
export const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      return { granted: false, error: 'Notifications not supported in this browser' };
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      return { granted: true, error: null };
    } else if (permission === 'denied') {
      return { granted: false, error: 'Notification permission denied' };
    } else {
      return { granted: false, error: 'Notification permission dismissed' };
    }
  } catch (error) {
    console.error('Request permission error:', error);
    return { granted: false, error: error.message };
  }
};

// --- Get FCM Token ---
export const getFCMToken = async () => {
  try {
    const messagingInstance = getMessagingInstance();
    if (!messagingInstance) {
      return { token: null, error: 'Messaging not available' };
    }

    // Check if service worker is registered
    const registration = await navigator.serviceWorker.ready;

    const token = await getToken(messagingInstance, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log('[FCM] Token obtained:', token.substring(0, 20) + '...');
      return { token, error: null };
    } else {
      return { token: null, error: 'No registration token available' };
    }
  } catch (error) {
    console.error('Get FCM token error:', error);
    return { token: null, error: error.message };
  }
};

// --- Save Notification Token to Firestore ---
export const saveNotificationToken = async (userId, token) => {
  try {
    const tokenRef = doc(db, 'users', userId, 'notificationTokens', token);
    await setDoc(tokenRef, {
      token,
      createdAt: serverTimestamp(),
      platform: 'web',
      userAgent: navigator.userAgent
    });

    // Also update user document with notifications enabled flag
    await setDoc(doc(db, 'users', userId), {
      notificationsEnabled: true,
      lastTokenUpdate: serverTimestamp()
    }, { merge: true });

    return { error: null };
  } catch (error) {
    console.error('Save token error:', error);
    return { error: error.message };
  }
};

// --- Remove Notification Token ---
export const removeNotificationToken = async (userId, token) => {
  try {
    const tokenRef = doc(db, 'users', userId, 'notificationTokens', token);
    await deleteDoc(tokenRef);
    return { error: null };
  } catch (error) {
    console.error('Remove token error:', error);
    return { error: error.message };
  }
};

// --- Listen for Foreground Messages ---
export const onForegroundMessage = (callback) => {
  const messagingInstance = getMessagingInstance();
  if (!messagingInstance) {
    console.warn('Messaging not available for foreground listener');
    return () => {};
  }

  return onMessage(messagingInstance, (payload) => {
    console.log('[FCM] Foreground message received:', payload);
    callback(payload);
  });
};

// --- Get User Notification Settings ---
export const getNotificationSettings = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        data: {
          notificationsEnabled: data.notificationsEnabled || false,
          priceAlerts: data.priceAlerts !== false, // default true
          communityAlerts: data.communityAlerts !== false, // default true
          streakReminders: data.streakReminders !== false // default true
        },
        error: null
      };
    }
    return {
      data: {
        notificationsEnabled: false,
        priceAlerts: true,
        communityAlerts: true,
        streakReminders: true
      },
      error: null
    };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// --- Update Notification Settings ---
export const updateNotificationSettings = async (userId, settings) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...settings,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};
