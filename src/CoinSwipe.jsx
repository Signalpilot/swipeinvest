import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { createChart } from 'lightweight-charts';

// ============================================================================
// COINSWIPE v2.0 - Tinder for Crypto (Degen Edition)
// ============================================================================

// Categories for filtering
const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🔥' },
  { id: 'trending', label: 'Trending', emoji: '📈' },
  { id: 'meme', label: 'Meme', emoji: '🐸' },
  { id: 'defi', label: 'DeFi', emoji: '🏦' },
  { id: 'ai', label: 'AI', emoji: '🤖' },
  { id: 'l1', label: 'L1', emoji: '⛓️' },
  { id: 'l2', label: 'L2', emoji: '🔷' },
  { id: 'bluechip', label: 'Blue Chip', emoji: '💎' },
];

// Affiliate links
const AFFILIATE_LINKS = {
  coinbase: 'https://advanced.coinbase.com/join/YAHNU27',
  binance: 'https://www.binance.com/activity/referral-entry/CPA?ref=CPA_003NFBSRRH',
  bybit: 'https://www.bybit.com/invite?ref=LW6W7',
};

// Stablecoins to filter out (no point swiping on $1 pegged coins)
const STABLECOIN_IDS = [
  'tether', 'usdc', 'dai', 'usds', 'usdd', 'usdt', 'tusd', 'usdp', 'gusd', 'busd',
  'frax', 'lusd', 'susd', 'eurs', 'eurt', 'ustc', 'fdusd', 'pyusd', 'usdg',
  'first-digital-usd', 'ethena-usde', 'usde', 'crvusd', 'true-usd', 'pax-dollar',
  'gemini-dollar', 'stasis-euro', 'origin-dollar', 'liquity-usd', 'magic-internet-money',
];

const isStablecoin = (coin) => {
  const id = coin.id?.toLowerCase() || '';
  const symbol = coin.symbol?.toLowerCase() || '';
  const name = coin.name?.toLowerCase() || '';

  // Check against known stablecoin IDs
  if (STABLECOIN_IDS.includes(id)) return true;

  // Check for common stablecoin patterns
  if (symbol.includes('usd') || symbol.includes('eur') || symbol.includes('gbp')) return true;
  if (name.includes('usd coin') || name.includes('stablecoin') || name.includes('dollar')) return true;

  // Check if price is pegged around $1 with very low volatility (likely a stablecoin)
  const price = coin.current_price;
  const change = Math.abs(coin.price_change_percentage_24h || 0);
  if (price > 0.98 && price < 1.02 && change < 0.5) return true;

  return false;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getRiskLevel = (marketCap) => {
  if (marketCap > 100000000000) return { emoji: '💎', label: 'Blue Chip', color: 'text-cyan-400', bg: 'bg-cyan-500/20' };
  if (marketCap > 10000000000) return { emoji: '🟢', label: 'Large Cap', color: 'text-green-400', bg: 'bg-green-500/20' };
  if (marketCap > 1000000000) return { emoji: '🟡', label: 'Mid Cap', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
  if (marketCap > 100000000) return { emoji: '🟠', label: 'Small Cap', color: 'text-orange-400', bg: 'bg-orange-500/20' };
  return { emoji: '💀', label: 'Degen', color: 'text-purple-400', bg: 'bg-purple-500/20' };
};

const getCoinCategory = (coin) => {
  const id = coin.id?.toLowerCase() || '';
  const name = coin.name?.toLowerCase() || '';
  const categories = [];

  // Meme coins
  const memeKeywords = ['doge', 'shib', 'pepe', 'floki', 'bonk', 'wojak', 'meme', 'inu', 'elon', 'moon', 'safe'];
  if (memeKeywords.some(k => id.includes(k) || name.includes(k))) {
    categories.push('meme');
  }

  // AI coins
  const aiKeywords = ['render', 'fetch', 'singularity', 'ocean', 'ai', 'neural', 'gpt', 'bittensor'];
  if (aiKeywords.some(k => id.includes(k) || name.includes(k))) {
    categories.push('ai');
  }

  // DeFi
  const defiIds = ['uniswap', 'aave', 'compound', 'maker', 'curve', 'sushi', 'pancake', 'lido', 'rocket-pool'];
  if (defiIds.some(d => id.includes(d))) {
    categories.push('defi');
  }

  // L1s
  const l1Ids = ['bitcoin', 'ethereum', 'solana', 'cardano', 'avalanche', 'sui', 'near', 'aptos', 'sei'];
  if (l1Ids.some(l => id.includes(l))) {
    categories.push('l1');
  }

  // L2s
  const l2Ids = ['arbitrum', 'optimism', 'polygon', 'base', 'zksync', 'starknet', 'mantle'];
  if (l2Ids.some(l => id.includes(l))) {
    categories.push('l2');
  }

  // Blue chips by market cap
  if (coin.market_cap > 50000000000) {
    categories.push('bluechip');
  }

  // Trending (high 24h volume relative to mcap or big price move)
  if (coin.price_change_percentage_24h > 10 ||
      (coin.total_volume > coin.market_cap * 0.15)) {
    categories.push('trending');
  }

  return categories;
};

const getVibes = (coin) => {
  const vibes = [];
  const categories = getCoinCategory(coin);

  if (categories.includes('trending')) vibes.push({ text: 'Trending', emoji: '🔥', color: 'from-orange-500 to-red-500' });
  if (categories.includes('ai')) vibes.push({ text: 'AI', emoji: '🤖', color: 'from-purple-500 to-pink-500' });
  if (categories.includes('meme')) vibes.push({ text: 'Meme', emoji: '🐸', color: 'from-green-500 to-emerald-500' });
  if (categories.includes('defi')) vibes.push({ text: 'DeFi', emoji: '🏦', color: 'from-blue-500 to-cyan-500' });
  if (categories.includes('l1')) vibes.push({ text: 'L1', emoji: '⛓️', color: 'from-yellow-500 to-orange-500' });
  if (categories.includes('l2')) vibes.push({ text: 'L2', emoji: '🔷', color: 'from-indigo-500 to-purple-500' });

  if (coin.price_change_percentage_24h > 20) vibes.push({ text: 'Pumping', emoji: '🚀', color: 'from-green-400 to-emerald-400' });
  if (coin.price_change_percentage_24h < -15) vibes.push({ text: 'Dipping', emoji: '📉', color: 'from-red-500 to-pink-500' });

  return vibes.slice(0, 3);
};

const formatNumber = (num) => {
  if (!num) return '$0';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(0)}`;
};

const formatPrice = (price) => {
  if (!price) return '$0';
  if (price >= 1000) return `$${price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.0001) return `$${price.toFixed(6)}`;
  if (price >= 0.00000001) return `$${price.toFixed(10)}`;
  return `$${price.toExponential(2)}`;
};

const formatPnL = (pnl) => {
  const sign = pnl >= 0 ? '+' : '';
  return `${sign}${pnl.toFixed(2)}%`;
};

// ============================================================================
// SOUND EFFECTS (Web Audio API) - Subtle, pleasant sounds
// ============================================================================

const playSound = (type) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    // Soft filter to remove harshness
    filter.type = 'lowpass';
    filter.frequency.value = 2000;

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = 'sine';

    const now = audioContext.currentTime;

    if (type === 'ape') {
      // Soft pop - quick pleasant chirp
      oscillator.frequency.setValueAtTime(600, now);
      oscillator.frequency.exponentialRampToValueAtTime(900, now + 0.06);
      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      oscillator.stop(now + 0.1);
    } else if (type === 'rug') {
      // Soft thud - gentle low tone
      oscillator.frequency.setValueAtTime(250, now);
      oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.08);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      oscillator.stop(now + 0.1);
    } else if (type === 'superape') {
      // Pleasant ding - like a notification
      oscillator.frequency.setValueAtTime(880, now);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      oscillator.stop(now + 0.15);
    } else if (type === 'match') {
      // Celebratory chime - two quick notes
      oscillator.frequency.setValueAtTime(784, now); // G5
      oscillator.frequency.setValueAtTime(1047, now + 0.1); // C6
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.setValueAtTime(0.15, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      oscillator.stop(now + 0.25);
    } else {
      oscillator.stop(now + 0.15);
    }

    oscillator.start(now);
  } catch (e) {
    // Audio not supported
  }
};

// ============================================================================
// MINI CHART COMPONENT (TradingView Lightweight Charts)
// ============================================================================

const MiniChart = ({ data, positive, height = 60 }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length < 2) return;

    // Clean up existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: 'transparent',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: { visible: false },
      timeScale: { visible: false },
      handleScroll: false,
      handleScale: false,
      crosshair: {
        mode: 0,
      },
    });

    const areaSeries = chart.addAreaSeries({
      lineColor: positive ? '#22c55e' : '#ef4444',
      topColor: positive ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
      bottomColor: positive ? 'rgba(34, 197, 94, 0.0)' : 'rgba(239, 68, 68, 0.0)',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    // Convert data to chart format
    const chartData = data.map((price, index) => ({
      time: index,
      value: price,
    }));

    areaSeries.setData(chartData);
    chart.timeScale().fitContent();
    chartRef.current = chart;

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, positive, height]);

  if (!data || data.length < 2) return null;

  return (
    <div
      ref={chartContainerRef}
      className="w-full"
      style={{ height: `${height}px` }}
    />
  );
};

// Fallback SVG sparkline for when lightweight-charts isn't available
const SparklineSVG = ({ data, positive }) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const width = 120;
  const height = 50;
  const padding = 4;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const fillPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <svg width={width} height={height} className="w-full">
      <defs>
        <linearGradient id={`gradient-${positive ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={positive ? '#22c55e' : '#ef4444'} stopOpacity="0.4" />
          <stop offset="100%" stopColor={positive ? '#22c55e' : '#ef4444'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        fill={`url(#gradient-${positive ? 'up' : 'down'})`}
        points={fillPoints}
      />
      <polyline
        fill="none"
        stroke={positive ? '#22c55e' : '#ef4444'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

// ============================================================================
// SWIPEABLE CARD COMPONENT (Framer Motion Physics)
// ============================================================================

const SwipeCard = ({ coin, onSwipe, isTop, style, zIndex }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const apeOpacity = useTransform(x, [0, 100], [0, 1]);
  const rugOpacity = useTransform(x, [-100, 0], [1, 0]);

  const risk = getRiskLevel(coin.market_cap);
  const vibes = getVibes(coin);
  const sparklineData = coin.sparkline_in_7d?.price || [];
  const isPositive = coin.price_change_percentage_24h >= 0;

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    const velocity = info.velocity.x;

    if (info.offset.x > threshold || velocity > 500) {
      onSwipe('right');
    } else if (info.offset.x < -threshold || velocity < -500) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      className="absolute w-full max-w-[340px]"
      style={{
        x,
        rotate,
        zIndex,
        ...style,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{
        x: x.get() > 0 ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.2 }
      }}
    >
      {/* Card Container */}
      <div className="relative bg-gradient-to-b from-slate-800/90 to-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10">

        {/* APE Stamp */}
        <motion.div
          className="absolute top-8 left-4 z-30 pointer-events-none"
          style={{ opacity: apeOpacity }}
        >
          <div className="border-4 border-green-500 text-green-500 px-6 py-3 rounded-xl font-black text-3xl rotate-[-15deg] bg-green-500/10 backdrop-blur-sm shadow-lg shadow-green-500/20">
            APE 🦍
          </div>
        </motion.div>

        {/* RUG Stamp */}
        <motion.div
          className="absolute top-8 right-4 z-30 pointer-events-none"
          style={{ opacity: rugOpacity }}
        >
          <div className="border-4 border-red-500 text-red-500 px-6 py-3 rounded-xl font-black text-3xl rotate-[15deg] bg-red-500/10 backdrop-blur-sm shadow-lg shadow-red-500/20">
            RUG 🚫
          </div>
        </motion.div>

        {/* Coin Header */}
        <div className="relative p-6 pb-4">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10" />

          {/* Rank badge */}
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-bold border border-white/10">
            #{coin.market_cap_rank || '?'}
          </div>

          {/* Hot badge */}
          {coin.price_change_percentage_24h > 15 && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg shadow-orange-500/30">
              🔥 HOT
            </div>
          )}

          {/* Coin image and name */}
          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-xl overflow-hidden ring-2 ring-white/10">
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-16 h-16 object-contain"
                  draggable={false}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<span class="text-3xl font-black bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent">${coin.symbol?.toUpperCase().slice(0,3) || '?'}</span>`;
                  }}
                />
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 blur-xl -z-10" />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-black truncate">{coin.name}</h2>
              <p className="text-slate-400 font-bold uppercase tracking-wider">${coin.symbol}</p>
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className="px-6 pb-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-black tracking-tight">{formatPrice(coin.current_price)}</p>
              <div className={`flex items-center gap-2 mt-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                <span className="text-lg font-bold">
                  {isPositive ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%
                </span>
                <span className="text-slate-500 text-sm">24h</span>
              </div>
            </div>

            {/* Mini Chart */}
            <div className="w-28">
              <SparklineSVG data={sparklineData.slice(-24)} positive={isPositive} />
            </div>
          </div>
        </div>

        {/* Vibes/Tags */}
        {vibes.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {vibes.map((vibe, i) => (
                <span
                  key={i}
                  className={`bg-gradient-to-r ${vibe.color} px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}
                >
                  {vibe.emoji} {vibe.text}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/60 backdrop-blur-sm p-3 rounded-xl border border-white/5">
              <p className="text-slate-500 text-xs font-medium mb-1">Market Cap</p>
              <p className="font-bold text-lg">{formatNumber(coin.market_cap)}</p>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-sm p-3 rounded-xl border border-white/5">
              <p className="text-slate-500 text-xs font-medium mb-1">24h Volume</p>
              <p className="font-bold text-lg">{formatNumber(coin.total_volume)}</p>
            </div>
          </div>
        </div>

        {/* Risk Level */}
        <div className="px-6 pb-6">
          <div className={`flex items-center justify-between ${risk.bg} backdrop-blur-sm p-3 rounded-xl border border-white/5`}>
            <span className="text-slate-400 text-sm font-medium">Risk Level</span>
            <span className={`font-bold ${risk.color} flex items-center gap-2`}>
              <span className="text-xl">{risk.emoji}</span>
              {risk.label}
            </span>
          </div>
        </div>

        {/* Swipe hint for top card */}
        {isTop && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
            <p className="text-slate-600 text-xs font-medium">Swipe or use buttons below</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// MATCH MODAL COMPONENT
// ============================================================================

const MatchModal = ({ coin, pnl, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-8 max-w-sm w-full text-center border border-white/10 shadow-2xl"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Celebration animation */}
        <div className="text-7xl mb-4 animate-bounce">🎉</div>

        <h2 className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
          IT'S A MATCH!
        </h2>

        <p className="text-slate-400 mb-6">
          Your ape paid off! {coin.name} is pumping!
        </p>

        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-700 overflow-hidden">
            <img src={coin.image} alt={coin.name} className="w-full h-full object-cover" />
          </div>
          <div className="text-left">
            <p className="font-bold text-xl">{coin.symbol?.toUpperCase()}</p>
            <p className="text-green-400 font-bold text-2xl">{formatPnL(pnl)}</p>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href={`${AFFILIATE_LINKS.coinbase}?entry=match_${coin.symbol}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-gradient-to-r from-green-500 to-emerald-500 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg shadow-green-500/30"
          >
            Buy More {coin.symbol?.toUpperCase()} 🚀
          </a>
          <button
            onClick={onClose}
            className="block w-full bg-slate-700 py-3 rounded-xl font-medium hover:bg-slate-600 transition"
          >
            Keep Swiping
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// LANDING PAGE COMPONENT
// ============================================================================

const LandingPage = ({ onStart, stats }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 text-white overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
            <span className="text-5xl">🪙</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-black text-center mb-4"
        >
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            CoinSwipe
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl md:text-2xl text-slate-400 text-center mb-8 max-w-md"
        >
          Tinder for Crypto. Swipe right to ape. Swipe left to avoid the rug.
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4 max-w-sm w-full mb-8"
        >
          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-center">
            <div className="text-3xl mb-2">🦍</div>
            <p className="text-sm font-medium">Swipe Right = APE</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-center">
            <div className="text-3xl mb-2">🚫</div>
            <p className="text-sm font-medium">Swipe Left = RUG</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm font-medium">Track Paper PnL</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <p className="text-sm font-medium">Match Alerts</p>
          </div>
        </motion.div>

        {/* Stats */}
        {stats && (stats.totalSwipes > 0 || stats.totalApes > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-6 mb-8 text-center"
          >
            <div>
              <p className="text-3xl font-black text-purple-400">{stats.totalSwipes || 0}</p>
              <p className="text-slate-500 text-sm">Total Swipes</p>
            </div>
            <div>
              <p className="text-3xl font-black text-green-400">{stats.totalApes || 0}</p>
              <p className="text-slate-500 text-sm">Apes</p>
            </div>
            <div>
              <p className="text-3xl font-black text-cyan-400">{stats.portfolioValue || '$0'}</p>
              <p className="text-slate-500 text-sm">Paper Value</p>
            </div>
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onStart}
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 px-12 py-5 rounded-2xl font-black text-xl hover:opacity-90 transition shadow-2xl shadow-purple-500/30 hover:shadow-pink-500/40"
        >
          Start Swiping 🚀
        </motion.button>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-slate-600 text-xs mt-8 max-w-sm text-center"
        >
          Not financial advice. Paper trading only. DYOR. Don't invest more than you can afford to lose.
        </motion.p>
      </div>
    </div>
  );
};

// ============================================================================
// PORTFOLIO VIEW COMPONENT
// ============================================================================

const PortfolioView = ({ portfolio, currentPrices, onBack, onRemove, onShare }) => {
  // Calculate PnL for each position
  const positions = useMemo(() => {
    return portfolio.map(pos => {
      const currentPrice = currentPrices[pos.id] || pos.priceAtSwipe;
      const pnl = ((currentPrice - pos.priceAtSwipe) / pos.priceAtSwipe) * 100;
      return {
        ...pos,
        currentPrice,
        pnl,
      };
    }).sort((a, b) => b.pnl - a.pnl);
  }, [portfolio, currentPrices]);

  const totalPnL = positions.length > 0
    ? positions.reduce((sum, p) => sum + p.pnl, 0) / positions.length
    : 0;

  const winners = positions.filter(p => p.pnl > 0).length;
  const losers = positions.filter(p => p.pnl < 0).length;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-800 rounded-xl transition"
          >
            <span className="text-2xl">←</span>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Your Portfolio</h1>
            <p className="text-slate-400 text-sm">{positions.length} positions</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 p-4 pt-0">
          <div className="bg-slate-800/60 rounded-xl p-3 text-center">
            <p className={`text-2xl font-black ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPnL(totalPnL)}
            </p>
            <p className="text-slate-500 text-xs">Avg PnL</p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-green-400">{winners}</p>
            <p className="text-slate-500 text-xs">Winners</p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-red-400">{losers}</p>
            <p className="text-slate-500 text-xs">Losers</p>
          </div>
        </div>
      </div>

      {/* Positions List */}
      <div className="p-4 space-y-3">
        {positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-6xl mb-4">🦍</span>
            <h2 className="text-xl font-bold text-slate-400 mb-2">No Apes Yet</h2>
            <p className="text-slate-500 mb-6">Start swiping right to build your portfolio!</p>
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-xl font-bold hover:opacity-90 transition"
            >
              Start Swiping
            </button>
          </div>
        ) : (
          positions.map((pos) => (
            <motion.div
              key={pos.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-slate-800/60 rounded-2xl p-4 border ${pos.pnl > 5 ? 'border-green-500/30' : pos.pnl < -5 ? 'border-red-500/30' : 'border-white/5'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-700 overflow-hidden flex-shrink-0">
                  <img
                    src={pos.image}
                    alt={pos.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold truncate">{pos.name}</h3>
                    <span className="text-slate-500 text-sm">${pos.symbol?.toUpperCase()}</span>
                    {pos.isSuperApe && <span className="text-sm">⭐</span>}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400">Entry: {formatPrice(pos.priceAtSwipe)}</span>
                    <span className="text-slate-600">→</span>
                    <span>{formatPrice(pos.currentPrice)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-xl font-black ${pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPnL(pos.pnl)}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {new Date(pos.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                <a
                  href={`${AFFILIATE_LINKS.coinbase}?entry=portfolio_${pos.symbol}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 py-2 rounded-lg font-medium text-center text-sm hover:opacity-90 transition"
                >
                  Buy Real
                </a>
                <button
                  onClick={() => onShare(pos)}
                  className="bg-slate-700 px-4 py-2 rounded-lg hover:bg-slate-600 transition text-sm"
                >
                  🐦
                </button>
                <button
                  onClick={() => onRemove(pos.id)}
                  className="bg-slate-700 px-4 py-2 rounded-lg hover:bg-red-500/50 transition text-sm"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Exchange CTAs */}
      {positions.length > 0 && (
        <div className="sticky bottom-0 p-4 bg-slate-900/95 backdrop-blur-sm border-t border-white/10">
          <p className="text-center text-slate-500 text-sm mb-3">
            Ready to ape for real? 💰
          </p>
          <div className="grid grid-cols-3 gap-2">
            <a
              href={AFFILIATE_LINKS.coinbase}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 py-3 rounded-xl text-center font-bold hover:bg-blue-700 transition text-sm"
            >
              Coinbase
            </a>
            <a
              href={AFFILIATE_LINKS.binance}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-yellow-500 text-black py-3 rounded-xl text-center font-bold hover:bg-yellow-400 transition text-sm"
            >
              Binance
            </a>
            <a
              href={AFFILIATE_LINKS.bybit}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-500 py-3 rounded-xl text-center font-bold hover:bg-orange-600 transition text-sm"
            >
              Bybit
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function CoinSwipe() {
  // Views: 'landing', 'swipe', 'portfolio'
  const [view, setView] = useState('landing');
  const [coins, setCoins] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [portfolio, setPortfolio] = useState([]);
  const [currentPrices, setCurrentPrices] = useState({});
  const [stats, setStats] = useState({ aped: 0, rugged: 0, superAped: 0 });
  const [history, setHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [matchModal, setMatchModal] = useState(null);

  // Load from localStorage
  useEffect(() => {
    const savedPortfolio = localStorage.getItem('coinswipe_portfolio');
    const savedStats = localStorage.getItem('coinswipe_stats_v2');
    const savedLanded = localStorage.getItem('coinswipe_landed');

    if (savedPortfolio) setPortfolio(JSON.parse(savedPortfolio));
    if (savedStats) setStats(JSON.parse(savedStats));
    if (savedLanded) setView('swipe');
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('coinswipe_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem('coinswipe_stats_v2', JSON.stringify(stats));
  }, [stats]);

  // Fetch coins from CoinGecko
  useEffect(() => {
    const fetchCoins = async () => {
      setLoading(true);
      try {
        // Fetch top 100 coins with sparkline
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h'
        );
        if (!response.ok) throw new Error('CoinGecko API failed');
        const data = await response.json();

        // Filter out stablecoins and shuffle for variety
        const filtered = data.filter(coin => !isStablecoin(coin));
        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        setCoins(shuffled);

        // Build price map
        const prices = {};
        data.forEach(coin => {
          prices[coin.id] = coin.current_price;
        });
        setCurrentPrices(prices);
      } catch (error) {
        console.error('API Error:', error);
        // Use mock data as fallback
        setCoins(getMockCoins());
      }
      setLoading(false);
    };

    fetchCoins();

    // Refresh prices every 60 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'
        );
        if (response.ok) {
          const data = await response.json();
          const prices = {};
          data.forEach(coin => {
            prices[coin.id] = coin.current_price;
          });
          setCurrentPrices(prices);

          // Check for matches (>5% gain)
          checkForMatches(prices);
        }
      } catch (e) {
        // Silently fail price refresh
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Check for match alerts
  const checkForMatches = useCallback((prices) => {
    portfolio.forEach(pos => {
      const currentPrice = prices[pos.id];
      if (currentPrice) {
        const pnl = ((currentPrice - pos.priceAtSwipe) / pos.priceAtSwipe) * 100;
        if (pnl >= 5 && !pos.matchShown) {
          // Show match modal!
          setMatchModal({ coin: pos, pnl });
          if (soundEnabled) playSound('match');

          // Mark as shown
          setPortfolio(prev => prev.map(p =>
            p.id === pos.id ? { ...p, matchShown: true } : p
          ));
        }
      }
    });
  }, [portfolio, soundEnabled]);

  // Filter coins by category
  const filteredCoins = useMemo(() => {
    return coins.filter(coin => {
      if (selectedCategory === 'all') return true;
      return getCoinCategory(coin).includes(selectedCategory);
    });
  }, [coins, selectedCategory]);

  // Handle swipe
  const handleSwipe = (direction, isSuper = false) => {
    if (currentIndex >= filteredCoins.length) return;

    const coin = filteredCoins[currentIndex];

    // Save to history for undo
    setHistory(prev => [...prev.slice(-20), { coin, index: currentIndex, direction, isSuper }]);

    if (direction === 'right') {
      // APE - add to portfolio with entry price
      const position = {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        image: coin.image,
        priceAtSwipe: coin.current_price,
        timestamp: Date.now(),
        isSuperApe: isSuper,
        matchShown: false,
      };

      // Don't add duplicates
      if (!portfolio.find(p => p.id === coin.id)) {
        setPortfolio(prev => [...prev, position]);
      }

      if (isSuper) {
        setStats(prev => ({ ...prev, superAped: prev.superAped + 1 }));
        if (soundEnabled) playSound('superape');
      } else {
        setStats(prev => ({ ...prev, aped: prev.aped + 1 }));
        if (soundEnabled) playSound('ape');
      }
    } else {
      // RUG - pass
      setStats(prev => ({ ...prev, rugged: prev.rugged + 1 }));
      if (soundEnabled) playSound('rug');
    }

    setCurrentIndex(prev => prev + 1);
  };

  // Undo
  const handleUndo = () => {
    if (history.length === 0) return;

    const lastAction = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setCurrentIndex(prev => prev - 1);

    if (lastAction.direction === 'right') {
      setPortfolio(prev => prev.filter(p => p.id !== lastAction.coin.id));
      if (lastAction.isSuper) {
        setStats(prev => ({ ...prev, superAped: Math.max(0, prev.superAped - 1) }));
      } else {
        setStats(prev => ({ ...prev, aped: Math.max(0, prev.aped - 1) }));
      }
    } else {
      setStats(prev => ({ ...prev, rugged: Math.max(0, prev.rugged - 1) }));
    }
  };

  // Reset/Shuffle
  const handleReset = () => {
    const shuffled = [...coins].sort(() => Math.random() - 0.5);
    setCoins(shuffled);
    setCurrentIndex(0);
    setHistory([]);
  };

  // Remove from portfolio
  const removeFromPortfolio = (coinId) => {
    setPortfolio(prev => prev.filter(p => p.id !== coinId));
  };

  // Share to Twitter
  const shareToTwitter = (pos) => {
    const pnl = ((currentPrices[pos.id] || pos.priceAtSwipe) - pos.priceAtSwipe) / pos.priceAtSwipe * 100;
    const emoji = pnl >= 0 ? '🟢' : '🔴';
    const text = `${emoji} My $${pos.symbol?.toUpperCase()} paper trade on CoinSwipe:\n\nEntry: ${formatPrice(pos.priceAtSwipe)}\nNow: ${formatPrice(currentPrices[pos.id] || pos.priceAtSwipe)}\nPnL: ${formatPnL(pnl)}\n\nSwipe to ape! 🦍\n\n#CoinSwipe #Crypto #PaperTrading`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Start swiping
  const handleStart = () => {
    setView('swipe');
    localStorage.setItem('coinswipe_landed', 'true');
  };

  // Calculate landing page stats
  const landingStats = useMemo(() => ({
    totalSwipes: stats.aped + stats.rugged + stats.superAped,
    totalApes: stats.aped + stats.superAped,
    portfolioValue: portfolio.length > 0 ? `${portfolio.length} coins` : '$0',
  }), [stats, portfolio]);

  // ============================================================================
  // RENDER
  // ============================================================================

  // Landing Page
  if (view === 'landing') {
    return <LandingPage onStart={handleStart} stats={landingStats} />;
  }

  // Portfolio View
  if (view === 'portfolio') {
    return (
      <PortfolioView
        portfolio={portfolio}
        currentPrices={currentPrices}
        onBack={() => setView('swipe')}
        onRemove={removeFromPortfolio}
        onShare={shareToTwitter}
      />
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-6xl mb-4"
          >
            🪙
          </motion.div>
          <p className="text-slate-400">Loading coins...</p>
        </div>
      </div>
    );
  }

  // Main Swipe View
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Match Modal */}
      <AnimatePresence>
        {matchModal && (
          <MatchModal
            coin={matchModal.coin}
            pnl={matchModal.pnl}
            onClose={() => setMatchModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <span className="text-xl">🪙</span>
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            CoinSwipe
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button
            onClick={() => setView('portfolio')}
            className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl hover:bg-slate-700 transition"
          >
            <span className="text-green-400">🦍</span>
            <span className="font-bold">{portfolio.length}</span>
          </button>
        </div>
      </header>

      {/* Category Pills */}
      <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide border-b border-white/5">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCategory(cat.id); setCurrentIndex(0); setHistory([]); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition text-sm font-medium ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Card Stack Area */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {currentIndex >= filteredCoins.length ? (
          // End of cards
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center px-6"
          >
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="text-2xl font-black mb-2">That's All Folks!</h2>
            <p className="text-slate-400 mb-6">
              You've swiped through {filteredCoins.length} coins
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setView('portfolio')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-4 rounded-xl font-bold hover:opacity-90 transition shadow-lg shadow-green-500/20"
              >
                View Portfolio ({portfolio.length})
              </button>
              <button
                onClick={handleReset}
                className="bg-slate-800 px-8 py-4 rounded-xl font-bold hover:bg-slate-700 transition"
              >
                🔀 Shuffle & Restart
              </button>
            </div>
          </motion.div>
        ) : (
          // Card stack
          <div className="relative w-full max-w-[340px] h-[520px] flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              {filteredCoins.slice(currentIndex, currentIndex + 3).map((coin, i) => (
                <SwipeCard
                  key={coin.id}
                  coin={coin}
                  isTop={i === 0}
                  onSwipe={handleSwipe}
                  zIndex={3 - i}
                  style={{
                    scale: 1 - i * 0.05,
                    y: i * 8,
                    opacity: 1 - i * 0.15,
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {currentIndex < filteredCoins.length && (
        <div className="flex justify-center items-center gap-4 p-4">
          {/* Undo */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleUndo}
            disabled={history.length === 0}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition text-2xl ${
              history.length === 0
                ? 'bg-slate-800/50 text-slate-700 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-yellow-500/20 border-2 border-slate-700 hover:border-yellow-500'
            }`}
          >
            ↩️
          </motion.button>

          {/* RUG (Pass) */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => handleSwipe('left')}
            className="w-18 h-18 bg-slate-800 rounded-full flex items-center justify-center hover:bg-red-500/20 border-2 border-slate-700 hover:border-red-500 transition shadow-lg text-4xl p-5"
          >
            🚫
          </motion.button>

          {/* Super APE */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => handleSwipe('right', true)}
            className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-500/20 border-2 border-slate-700 hover:border-blue-500 transition text-3xl"
          >
            ⭐
          </motion.button>

          {/* APE (Like) */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => handleSwipe('right')}
            className="w-18 h-18 bg-slate-800 rounded-full flex items-center justify-center hover:bg-green-500/20 border-2 border-slate-700 hover:border-green-500 transition shadow-lg text-4xl p-5"
          >
            🦍
          </motion.button>

          {/* Shuffle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleReset}
            className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center hover:bg-purple-500/20 border-2 border-slate-700 hover:border-purple-500 transition text-2xl"
          >
            🔀
          </motion.button>
        </div>
      )}

      {/* Progress Bar */}
      {filteredCoins.length > 0 && currentIndex < filteredCoins.length && (
        <div className="px-6 pb-4">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${(currentIndex / filteredCoins.length) * 100}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
          </div>
          <p className="text-center text-slate-600 text-xs mt-2">
            {currentIndex + 1} / {filteredCoins.length}
            {selectedCategory !== 'all' && ` (${CATEGORIES.find(c => c.id === selectedCategory)?.label})`}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MOCK DATA FALLBACK
// ============================================================================

function getMockCoins() {
  return [
    { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', current_price: 98234, market_cap: 1940000000000, market_cap_rank: 1, total_volume: 42000000000, price_change_percentage_24h: 2.34, sparkline_in_7d: { price: Array.from({length: 168}, () => 95000 + Math.random() * 5000) } },
    { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', current_price: 3456, market_cap: 415000000000, market_cap_rank: 2, total_volume: 18000000000, price_change_percentage_24h: -1.23, sparkline_in_7d: { price: Array.from({length: 168}, () => 3300 + Math.random() * 300) } },
    { id: 'solana', symbol: 'sol', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', current_price: 198, market_cap: 95000000000, market_cap_rank: 5, total_volume: 4200000000, price_change_percentage_24h: 5.67, sparkline_in_7d: { price: Array.from({length: 168}, () => 180 + Math.random() * 30) } },
    { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png', current_price: 0.32, market_cap: 47000000000, market_cap_rank: 8, total_volume: 2100000000, price_change_percentage_24h: 12.45, sparkline_in_7d: { price: Array.from({length: 168}, () => 0.28 + Math.random() * 0.08) } },
    { id: 'pepe', symbol: 'pepe', name: 'Pepe', image: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg', current_price: 0.0000234, market_cap: 9800000000, market_cap_rank: 18, total_volume: 2300000000, price_change_percentage_24h: 18.76, sparkline_in_7d: { price: Array.from({length: 168}, () => 0.000018 + Math.random() * 0.000008) } },
    { id: 'shiba-inu', symbol: 'shib', name: 'Shiba Inu', image: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png', current_price: 0.0000225, market_cap: 13200000000, market_cap_rank: 15, total_volume: 650000000, price_change_percentage_24h: 6.78, sparkline_in_7d: { price: Array.from({length: 168}, () => 0.00002 + Math.random() * 0.000005) } },
    { id: 'bonk', symbol: 'bonk', name: 'Bonk', image: 'https://assets.coingecko.com/coins/images/28600/large/bonk.jpg', current_price: 0.0000312, market_cap: 2100000000, market_cap_rank: 52, total_volume: 450000000, price_change_percentage_24h: 24.56, sparkline_in_7d: { price: Array.from({length: 168}, () => 0.000024 + Math.random() * 0.00001) } },
    { id: 'floki', symbol: 'floki', name: 'FLOKI', image: 'https://assets.coingecko.com/coins/images/16746/large/PNG_image.png', current_price: 0.000189, market_cap: 1800000000, market_cap_rank: 58, total_volume: 320000000, price_change_percentage_24h: 15.23, sparkline_in_7d: { price: Array.from({length: 168}, () => 0.00016 + Math.random() * 0.00004) } },
    { id: 'uniswap', symbol: 'uni', name: 'Uniswap', image: 'https://assets.coingecko.com/coins/images/12504/large/uni.jpg', current_price: 14.20, market_cap: 8500000000, market_cap_rank: 22, total_volume: 340000000, price_change_percentage_24h: -0.45, sparkline_in_7d: { price: Array.from({length: 168}, () => 13.5 + Math.random() * 1.5) } },
    { id: 'aave', symbol: 'aave', name: 'Aave', image: 'https://assets.coingecko.com/coins/images/12645/large/AAVE.png', current_price: 268, market_cap: 4000000000, market_cap_rank: 32, total_volume: 180000000, price_change_percentage_24h: 2.10, sparkline_in_7d: { price: Array.from({length: 168}, () => 255 + Math.random() * 25) } },
    { id: 'render-token', symbol: 'rndr', name: 'Render', image: 'https://assets.coingecko.com/coins/images/11636/large/rndr.png', current_price: 8.90, market_cap: 4600000000, market_cap_rank: 28, total_volume: 280000000, price_change_percentage_24h: 7.23, sparkline_in_7d: { price: Array.from({length: 168}, () => 8 + Math.random() * 1.5) } },
    { id: 'fetch-ai', symbol: 'fet', name: 'Fetch.ai', image: 'https://assets.coingecko.com/coins/images/5681/large/Fetch.jpg', current_price: 2.15, market_cap: 5400000000, market_cap_rank: 25, total_volume: 320000000, price_change_percentage_24h: 9.45, sparkline_in_7d: { price: Array.from({length: 168}, () => 1.9 + Math.random() * 0.4) } },
    { id: 'arbitrum', symbol: 'arb', name: 'Arbitrum', image: 'https://assets.coingecko.com/coins/images/16547/large/photo_2023-03-29_21.47.00.jpeg', current_price: 0.78, market_cap: 3100000000, market_cap_rank: 38, total_volume: 290000000, price_change_percentage_24h: 3.45, sparkline_in_7d: { price: Array.from({length: 168}, () => 0.72 + Math.random() * 0.1) } },
    { id: 'sui', symbol: 'sui', name: 'Sui', image: 'https://assets.coingecko.com/coins/images/26375/large/sui_asset.jpeg', current_price: 4.23, market_cap: 13400000000, market_cap_rank: 14, total_volume: 1200000000, price_change_percentage_24h: 8.90, sparkline_in_7d: { price: Array.from({length: 168}, () => 3.8 + Math.random() * 0.6) } },
    { id: 'cardano', symbol: 'ada', name: 'Cardano', image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png', current_price: 0.98, market_cap: 34000000000, market_cap_rank: 9, total_volume: 890000000, price_change_percentage_24h: -3.21, sparkline_in_7d: { price: Array.from({length: 168}, () => 0.92 + Math.random() * 0.12) } },
  ];
}
