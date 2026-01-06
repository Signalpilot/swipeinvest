import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { createChart } from 'lightweight-charts';
import {
  auth,
  signInWithGoogle,
  signInWithApple,
  signInWithEmail,
  logOut,
  onAuthStateChanged,
  saveUserProfile,
  getUserProfile,
  saveSwipe,
  getInvestorMatches,
  sendChatMessage,
  subscribeToChatRoom,
  sendMatchRequest,
  acceptMatchRequest,
  getMatchRequests,
  getUserConnections,
  sendDirectMessage,
  subscribeToDirectMessages,
  getTrendingCoins,
  getCoinStatsBatch,
  getLeaderboard,
  getUserRank,
  savePortfolioToCloud,
  loadPortfolioFromCloud,
  saveStatsToCloud,
  loadStatsFromCloud,
  updateStreak,
  getUserStreak,
  requestNotificationPermission,
  getFCMToken,
  saveNotificationToken,
  onForegroundMessage,
  getNotificationSettings,
  updateNotificationSettings,
  followUser,
  unfollowUser,
  isFollowing,
  getFollowing,
  getFollowers,
  getActivityFeed,
  getWeeklyChallenges,
  joinChallenge,
  hasJoinedChallenge,
  getChallengeLeaderboard,
  getUserChallengeStats,
  getUserBadges,
  CHALLENGE_TYPES
} from './firebase';

// ============================================================================
// SWIPEFOLIO - Swipe. Match. Invest.
// Discover crypto & stocks with Tinder-style swiping. Match with like-minded investors.
// ============================================================================

// TradingView symbol mapping - Top 200+ coins (CoinGecko ID -> TradingView symbol)
const TRADINGVIEW_SYMBOLS = {
  // Top 50 - All verified working
  'bitcoin': 'BINANCE:BTCUSDT',
  'ethereum': 'BINANCE:ETHUSDT',
  'tether': 'BINANCE:USDTUSD',
  'ripple': 'BINANCE:XRPUSDT',
  'bnb': 'BINANCE:BNBUSDT',
  'binancecoin': 'BINANCE:BNBUSDT',
  'solana': 'BINANCE:SOLUSDT',
  'usd-coin': 'BINANCE:USDCUSDT',
  'dogecoin': 'BINANCE:DOGEUSDT',
  'cardano': 'BINANCE:ADAUSDT',
  'tron': 'BINANCE:TRXUSDT',
  'avalanche-2': 'BINANCE:AVAXUSDT',
  'chainlink': 'BINANCE:LINKUSDT',
  'toncoin': 'OKX:TONUSDT',
  'shiba-inu': 'BINANCE:SHIBUSDT',
  'polkadot': 'BINANCE:DOTUSDT',
  'bitcoin-cash': 'BINANCE:BCHUSDT',
  'leo-token': 'BITFINEX:LEOUSD',
  'unus-sed-leo': 'BITFINEX:LEOUSD',
  'litecoin': 'BINANCE:LTCUSDT',
  'uniswap': 'BINANCE:UNIUSDT',
  'near': 'BINANCE:NEARUSDT',
  'dai': 'COINBASE:DAIUSD',
  'stellar': 'BINANCE:XLMUSDT',
  'aptos': 'BINANCE:APTUSDT',
  'internet-computer': 'BINANCE:ICPUSDT',
  'ethereum-classic': 'BINANCE:ETCUSDT',
  'monero': 'KRAKEN:XMRUSD',
  'render-token': 'BINANCE:RENDERUSDT',
  'hedera': 'BINANCE:HBARUSDT',
  'filecoin': 'BINANCE:FILUSDT',
  'cosmos': 'BINANCE:ATOMUSDT',
  'arbitrum': 'BINANCE:ARBUSDT',
  'mantra': 'BINANCE:OMUSDT',
  'mantra-dao': 'BINANCE:OMUSDT',
  'crypto-com-chain': 'COINBASE:CROUSD',
  'okb': 'OKX:OKBUSDT',
  'whitebit': 'MEXC:WBTUSDT',
  'injective-protocol': 'BINANCE:INJUSDT',
  'vechain': 'BINANCE:VETUSDT',
  'immutable-x': 'BINANCE:IMXUSDT',
  'sui': 'BINANCE:SUIUSDT',
  'fetch-ai': 'BINANCE:FETUSDT',
  'theta-token': 'BINANCE:THETAUSDT',
  'kaspa': 'MEXC:KASUSDT',
  'optimism': 'BINANCE:OPUSDT',
  'polygon': 'BINANCE:MATICUSDT',
  'matic-network': 'BINANCE:MATICUSDT',
  // 51-100
  'maker': 'BINANCE:MKRUSDT',
  'aave': 'BINANCE:AAVEUSDT',
  'the-graph': 'BINANCE:GRTUSDT',
  'fantom': 'BINANCE:FTMUSDT',
  'algorand': 'BINANCE:ALGOUSDT',
  'eos': 'BINANCE:EOSUSDT',
  'stacks': 'BINANCE:STXUSDT',
  'flow': 'BINANCE:FLOWUSDT',
  'gala': 'BINANCE:GALAUSDT',
  'axie-infinity': 'BINANCE:AXSUSDT',
  'the-sandbox': 'BINANCE:SANDUSDT',
  'decentraland': 'BINANCE:MANAUSDT',
  'tezos': 'BINANCE:XTZUSDT',
  'neo': 'BINANCE:NEOUSDT',
  'chiliz': 'BINANCE:CHZUSDT',
  'enjincoin': 'BINANCE:ENJUSDT',
  'iota': 'BINANCE:IOTAUSDT',
  'quant-network': 'COINBASE:QNTUSD',
  'xdc-network': 'KUCOIN:XDCUSDT',
  'flare-networks': 'COINBASE:FLRUSD',
  'worldcoin-wld': 'BINANCE:WLDUSDT',
  'sei-network': 'BINANCE:SEIUSDT',
  'celestia': 'BINANCE:TIAUSDT',
  'blur': 'BINANCE:BLURUSDT',
  'mina-protocol': 'BINANCE:MINAUSDT',
  'conflux-token': 'BINANCE:CFXUSDT',
  'dydx': 'BINANCE:DYDXUSDT',
  'kava': 'BINANCE:KAVAUSDT',
  'pancakeswap-token': 'BINANCE:CAKEUSDT',
  'synthetix-network-token': 'BINANCE:SNXUSDT',
  'rocket-pool': 'BINANCE:RPLUSDT',
  'curve-dao-token': 'BINANCE:CRVUSDT',
  'gmx': 'BINANCE:GMXUSDT',
  '1inch': 'BINANCE:1INCHUSDT',
  // 101-150
  'compound-governance-token': 'COINBASE:COMPUSD',
  'compound': 'COINBASE:COMPUSD',
  'zcash': 'BINANCE:ZECUSDT',
  'dash': 'BINANCE:DASHUSDT',
  'basic-attention-token': 'BINANCE:BATUSDT',
  'yearn-finance': 'BINANCE:YFIUSDT',
  'sushi': 'BINANCE:SUSHIUSDT',
  'loopring': 'BINANCE:LRCUSDT',
  'iotex': 'BINANCE:IOTXUSDT',
  'zilliqa': 'BINANCE:ZILUSDT',
  'ankr': 'BINANCE:ANKRUSDT',
  'ocean-protocol': 'BINANCE:OCEANUSDT',
  'harmony': 'BINANCE:ONEUSDT',
  'kusama': 'BINANCE:KSMUSDT',
  'ravencoin': 'BINANCE:RVNUSDT',
  'waves': 'BINANCE:WAVESUSDT',
  'celo': 'BINANCE:CELOUSDT',
  'kadena': 'KUCOIN:KDAUSDT',
  'livepeer': 'COINBASE:LPTUSD',
  'skale': 'COINBASE:SKLUSD',
  'audius': 'COINBASE:AUDIOUSD',
  'ren': 'BINANCE:RENUSDT',
  'band-protocol': 'BINANCE:BANDUSDT',
  'storj': 'BINANCE:STORJUSDT',
  'golem': 'BINANCE:GLMUSDT',
  'oasis-network': 'BINANCE:ROSEUSDT',
  'nervos-network': 'BINANCE:CKBUSDT',
  'wax': 'BINANCE:WAXPUSDT',
  'ontology': 'BINANCE:ONTUSDT',
  'icon': 'BINANCE:ICXUSDT',
  // 151-200
  'siacoin': 'BINANCE:SCUSDT',
  'ark': 'BINANCE:ARKUSDT',
  'reserve-rights-token': 'BINANCE:RSRUSDT',
  'status': 'BINANCE:SNTUSDT',
  'numeraire': 'COINBASE:NMRUSD',
  'bluzelle': 'BINANCE:BLZUSDT',
  'nkn': 'BINANCE:NKNUSDT',
  'cartesi': 'BINANCE:CTSIUSDT',
  'orchid-protocol': 'COINBASE:OXTUSD',
  'civic': 'BINANCE:CVCUSDT',
  'origintrail': 'KUCOIN:TRACUSDT',
  'request-network': 'BINANCE:REQUSDT',
  'polymath': 'KUCOIN:POLYUSDT',
  'measurable-data-token': 'BINANCE:MDTUSDT',
  'dent': 'BINANCE:DENTUSDT',
  'metal': 'BINANCE:MTLUSDT',
  'lisk': 'BINANCE:LSKUSDT',
  'verge': 'BINANCE:XVGUSDT',
  'telcoin': 'KUCOIN:TELUSDT',
  'alpha-finance': 'BINANCE:ALPHAUSDT',
  'reef': 'BINANCE:REEFUSDT',
  'power-ledger': 'BINANCE:POWRUSDT',
  'tribe-2': 'COINBASE:TRIBEUSD',
  'dodo': 'BINANCE:DODOUSDT',
  'venus': 'BINANCE:XVSUSDT',
  'mask-network': 'BINANCE:MASKUSDT',
  'safepal': 'BINANCE:SFPUSDT',
  // Meme coins
  'pepe': 'BINANCE:PEPEUSDT',
  'bonk': 'BINANCE:BONKUSDT',
  'floki': 'BINANCE:FLOKIUSDT',
  'apecoin': 'BINANCE:APEUSDT',
  'dogwifcoin': 'BINANCE:WIFUSDT',
  'brett': 'BYBIT:BRETTUSDT',
  'mog-coin': 'BYBIT:MOGUSDT',
  'cat-in-a-dogs-world': 'BYBIT:MEWUSDT',
  'popcat': 'BYBIT:POPCATUSDT',
  'book-of-meme': 'BINANCE:BOMEUSDT',
  // Stablecoins & wrapped
  'wrapped-bitcoin': 'BINANCE:WBTCBTC',
  'staked-ether': 'BINANCE:STETHETH',
  'frax': 'COINBASE:FRAXUSD',
  // Layer 2 & newer
  'hyperliquid': 'BYBIT:HYPEUSDT',
  'jupiter': 'BYBIT:JUPUSDT',
  'jito-governance-token': 'BYBIT:JTOUSDT',
  'pyth-network': 'BYBIT:PYTHUSDT',
  'wormhole': 'BYBIT:WUSDT',
  'ethena': 'BINANCE:ENAUSDT',
  'ondo-finance': 'BYBIT:ONDOUSDT',
  'pendle': 'BINANCE:PENDLEUSDT',
  'eigenlayer': 'BINANCE:EIGENUSDT',
  'bittensor': 'BYBIT:TAOUSDT',
  // Exchange tokens
  'kucoin-shares': 'KUCOIN:KCSUSDT',
  'gate-token': 'GATEIO:GTUSDT',
  'bitget-token': 'BITGET:BGBUSDT',
  'mx-token': 'MEXC:MXUSDT',
  'huobi-token': 'HTX:HTUSDT',
  // AI & Gaming
  'singularitynet': 'BINANCE:AGIXUSDT',
  'akash-network': 'KUCOIN:AKTUSDT',
  'render': 'BINANCE:RENDERUSDT',
  'arweave': 'BINANCE:ARUSDT',
  'worldcoin': 'BINANCE:WLDUSDT',
  'iotaai': 'BINANCE:IOTAUSDT',
  'illuvium': 'BINANCE:ILVUSDT',
  'stepn': 'BINANCE:GMTUSDT',
  'magic': 'BINANCE:MAGICUSDT',
  'treasure': 'KUCOIN:MAGICUSDT',
  // DeFi protocols
  'lido-dao': 'BINANCE:LDOUSDT',
  'thorchain': 'BINANCE:RUNEUSDT',
  'just': 'BINANCE:JSTUSDT',
  'convex-finance': 'BINANCE:CVXUSDT',
  'ribbon-finance': 'BINANCE:RBNUSDT',
  'spell-token': 'BINANCE:SPELLUSDT',
  'joe': 'BINANCE:JOEUSDT',
  'raydium': 'BYBIT:RAYUSDT',
  'orca': 'KUCOIN:ORCAUSDT',
  'marinade': 'BYBIT:MNDEUSD',
  // More L1/L2
  'mantle': 'BYBIT:MNTUSDT',
  'base-protocol': 'COINBASE:BASEUSD',
  'scroll': 'BINANCE:SCROLLUSDT',
  'linea': 'BYBIT:LINEAUSDT',
  'zksync': 'BINANCE:ZKUSDT',
  'starknet': 'BINANCE:STRKUSDT',
  'blast': 'BYBIT:BLASTUSDT',
  'mode': 'BYBIT:MODEUSDT',
  'manta-network': 'BINANCE:MANTAUSDT',
  'beam': 'MEXC:BEAMUSDT',
  'ronin': 'BINANCE:RONUSDT',
  'echelon-prime': 'BYBIT:PRIMEUSDT',
  'astar': 'BINANCE:ASTRUSDT',
  'moonbeam': 'BINANCE:GLMRUSDT',
  'moonriver': 'KUCOIN:MOVRUSDT',
  'metis-token': 'KUCOIN:METISUSDT',
  'canto': 'KUCOIN:CANTOUSDT',
  // More meme coins
  'memecoin': 'BYBIT:MEMEUSDT',
  'turbo': 'BINANCE:TURBOUSDT',
  'neiro': 'BINANCE:NEIROUSDT',
  'moodeng': 'BYBIT:MOODENGUSDT',
  'goatseus-maximus': 'BYBIT:GOATUSDT',
  'ponke': 'BYBIT:PONKEUSDT',
  'gigachad': 'BYBIT:GIGAUSDT',
  'mother-iggy': 'BYBIT:MOTHERUSDT',
  'myro': 'BYBIT:MYROUSDT',
  'wen': 'BYBIT:WENUSDT',
  'slerf': 'BYBIT:SLERFUSDT',
  'jeo-boden': 'BYBIT:BODENUSDT',
  // RWA & utility
  'chainlink-ccip': 'BINANCE:LINKUSDT',
  'tokenfi': 'KUCOIN:TOKENUSDT',
  'polymesh': 'KUCOIN:POLYXUSDT',
  'centrifuge': 'COINBASE:CFGUSD',
  'maple': 'COINBASE:MPLUSD',
  'clearpool': 'KUCOIN:CPOOLUSDT',
  // Privacy coins
  'zcash': 'BINANCE:ZECUSDT',
  'secret': 'BINANCE:SCRTUSDT',
  'oasis-network': 'BINANCE:ROSEUSDT',
  'dusk-network': 'BINANCE:DUSKUSDT',
  // Infrastructure
  'helium': 'COINBASE:HNTUSD',
  'iotex': 'BINANCE:IOTXUSDT',
  'deeper-network': 'KUCOIN:DPRUSDT',
  'flux': 'KUCOIN:FLUXUSDT',
  'dvpn': 'KUCOIN:DVPNUSDT',
  // Additional top 200-300 coins
  'first-digital-usd': 'BINANCE:FDUSDUSDT',
  'ethena-usde': 'BYBIT:USDEUSDT',
  'virtual-protocol': 'BYBIT:VIRTUALUSDT',
  'fartcoin': 'BYBIT:FARTCOINUSDT',
  'ai16z': 'BYBIT:AI16ZUSDT',
  'pudgy-penguins': 'BYBIT:PENGUUSDT',
  'usual': 'BINANCE:USUALUSDT',
  'movement': 'BINANCE:MOVEUSDT',
  'grass': 'BYBIT:GRASSUSDT',
  'morpho': 'COINBASE:MORPHOUSD',
  'aerodrome-finance': 'BYBIT:AEROUSDT',
  'sonic-svm': 'BYBIT:SONICUSDT',
  'io': 'BINANCE:IOUSDT',
  'aixbt': 'BYBIT:AIXBTUSDT',
  'zerebro': 'BYBIT:ZEREBROUSDT',
  'safe': 'BYBIT:SAFEUSDT',
  'pnut': 'BINANCE:PNUTUSDT',
  'act-i-the-ai-prophecy': 'BINANCE:ACTUSDT',
  'cookie-dao': 'BYBIT:COOKIEUSDT',
  'spx6900': 'BYBIT:SPX6900USDT',
  'cow-protocol': 'COINBASE:COWUSD',
  'pumpfun': 'BYBIT:PUMPUSDT',
  'griffain': 'BYBIT:GRIFFAINUSDT',
  'swarms': 'BYBIT:SWARMSUSDT',
  'onyxcoin': 'MEXC:XCNUSDT',
  'fasttoken': 'KUCOIN:FTNUSDT',
  'layerzero': 'BINANCE:ZROUSDT',
  'ether-fi': 'BINANCE:ETHFIUSDT',
  'ai-rig-complex': 'BYBIT:ARCUSDT',
  // More DeFi & Infrastructure
  'frax-share': 'BINANCE:FXSUSDT',
  'frax-ether': 'COINBASE:FRXETHUSD',
  'ribbon-finance': 'BINANCE:RBNUSDT',
  'amp-token': 'COINBASE:AMPUSD',
  'threshold': 'COINBASE:TUSD',
  'keep-network': 'COINBASE:KEEPUSD',
  'nucypher': 'COINBASE:NUUSD',
  'fetch-ai': 'BINANCE:FETUSDT',
  'ocean-protocol': 'BINANCE:OCEANUSDT',
  'singularitynet': 'BINANCE:AGIXUSDT',
  // Gaming & Metaverse
  'enjin-coin': 'BINANCE:ENJUSDT',
  'ultra': 'KUCOIN:UOSUSDT',
  'yield-guild-games': 'BINANCE:YGGUSDT',
  'vulcan-forged': 'KUCOIN:PYRUSDT',
  'mobox': 'BINANCE:MBLUSDT',
  'alien-worlds': 'BINANCE:TLMUSDT',
  'star-atlas': 'BYBIT:ATLASUSDT',
  'gods-unchained': 'COINBASE:GODSUSD',
  'merit-circle': 'BYBIT:MCUSDT',
  'bigtime': 'BYBIT:BIGTIMEUSDT',
  'beam-2': 'BYBIT:BEAMUSDT',
  'xai-blockchain': 'BINANCE:XAIUSDT',
  'pixels': 'BINANCE:PIXELUSDT',
  'portal': 'BINANCE:PORTALUSDT',
  // More L1/L2 chains
  'gnosis': 'BINANCE:GNOUSDT',
  'wemix-token': 'KUCOIN:WEMIXUSDT',
  'syscoin': 'BINANCE:SYSUSDT',
  'elrond-erd-2': 'BINANCE:EGLDUSDT',
  'multiversx': 'BINANCE:EGLDUSDT',
  'klaytn': 'BINANCE:KLAYUSDT',
  'oasys': 'BYBIT:OASUSDT',
  'core': 'BYBIT:COREUSDT',
  'lukso-token': 'KUCOIN:LYXUSDT',
  'coreum': 'KUCOIN:COREUMUST',
  'radix': 'BITFINEX:XRDUSD',
  'velas': 'KUCOIN:VLXUSDT',
  'aurora': 'KUCOIN:AURORAUSDT',
  'boba-network': 'KUCOIN:BOBAUSDT',
  'omax': 'MEXC:OMAXUSDT',
  // DeFi protocols continued
  'osmosis': 'BINANCE:OSMOUSDT',
  'injective': 'BINANCE:INJUSDT',
  'fraxswap': 'BINANCE:FXSUSDT',
  'gains-network': 'BINANCE:GNSUSDT',
  'vertex-protocol': 'BYBIT:VRTXUSDT',
  'kyberswap': 'BINANCE:KNCUSDT',
  'dodo-exchange': 'BINANCE:DODOUSDT',
  'paraswap': 'COINBASE:PSPUSD',
  'quickswap': 'COINBASE:QUICKUSD',
  'balancer': 'BINANCE:BALUSDT',
  'bancor': 'COINBASE:BNTUSD',
  'uma': 'COINBASE:UMAUSD',
  'mirror-protocol': 'BINANCE:MIRUSDT',
  'perpetual-protocol': 'BINANCE:PERPUSDT',
  'api3': 'BINANCE:API3USDT',
  'dodo': 'BINANCE:DODOUSDT',
  // More tokens 250-300
  'woo-network': 'BINANCE:WOOUSDT',
  'ssv-network': 'BINANCE:SSVUSDT',
  'dymension': 'BINANCE:DYMUSDT',
  'altlayer': 'BINANCE:ALTUSDT',
  'mavia': 'BINANCE:MAVIAUSDT',
  'portal-2': 'BINANCE:PORTALUSDT',
  'pixel': 'BINANCE:PIXELUSDT',
  'aevo': 'BINANCE:AEVOUSDT',
  'banana-gun': 'BINANCE:BANANAUSDT',
  'renzo': 'BINANCE:REZUSDT',
  'lista-dao': 'BINANCE:LISTAUSDT',
  'zeta-chain': 'BINANCE:ZETAUSDT',
  'sleepless-ai': 'BINANCE:AIUSDT',
  'nft-prompt': 'BINANCE:NFTUSDT',
  'myneighboralice': 'BINANCE:ALICEUSDT',
  'high-street': 'BINANCE:HIGHUSDT',
  'bouncebit': 'BINANCE:BBUSDT',
  'omni-network': 'BINANCE:OMNIUSDT',
  'saga': 'BINANCE:SAGAUSDT',
  'tnsr': 'BINANCE:TNSRUSDT',
  'wormhole': 'BINANCE:WUSDT',
  'wen-token': 'BYBIT:WENUSDT',
  'parcl': 'BYBIT:PRCLUSDT',
  'kamino': 'BYBIT:KMNOUSDT',
  'sanctum': 'BYBIT:CLOUDUSDT',
  'drift-protocol': 'BYBIT:DRIFTUSDT',
  'tensor': 'BYBIT:TNSORUSDT',
  'nosana': 'BYBIT:NOSUSDT',
  // Old but still active
  'qtum': 'BINANCE:QTUMUSDT',
  'decred': 'BINANCE:DCRUSDT',
  'horizen': 'BINANCE:ZENUSDT',
  'digibyte': 'KUCOIN:DGBUSDT',
  'komodo': 'BINANCE:KMDUSDT',
  'stratis': 'BINANCE:STRAXUSDT',
  'nano': 'BINANCE:NANOUSDT',
  'nem': 'BINANCE:XEMUSDT',
  'ardor': 'BINANCE:ARDRUSDT',
  'electroneum': 'KUCOIN:ETNUSDT',
  'factom': 'KUCOIN:FCTUSDT',
  'bytom': 'KUCOIN:BTMUSDT',
  'wanchain': 'BINANCE:WANUSDT',
  'aelf': 'BINANCE:ELFUSDT',
  'zcoin': 'BINANCE:FIRUSDT',
  'firo': 'BINANCE:FIRUSDT',
  'beam-coin': 'BINANCE:BEAMUSDT',
  'grin': 'KUCOIN:GRINUSDT',
  'pivx': 'BINANCE:PIVXUSDT',
  'syscoin': 'BINANCE:SYSUSDT',
  // Recent listings
  'usual-usd': 'BINANCE:USD0USDT',
  'solv-protocol': 'BINANCE:SOLVUSDT',
  'vine': 'BYBIT:VINEUSDT',
  'paal-ai': 'BYBIT:PAALUSDT',
  'nosana': 'BYBIT:NOSUSDT',
  'michi': 'BYBIT:MICHIUSDT',
  'chillguy': 'BYBIT:CHILLGUYUSDT',
  'agent-ai': 'BYBIT:AIAGENUSDT',
};

// Check if a coin has a verified TradingView symbol
const hasVerifiedChart = (coin) => {
  // ONLY show chart if we have a verified mapping
  if (TRADINGVIEW_SYMBOLS[coin.id]) return true;
  // Stocks are always on NASDAQ/NYSE - TradingView handles routing
  if (coin.isStock) return true;
  // No fallback - if not in our mapping, don't show chart
  return false;
};

// Get TradingView symbol - with smart fallback for major coins
const getTradingViewSymbol = (coin) => {
  // Check our verified mapping first (best quality)
  if (TRADINGVIEW_SYMBOLS[coin.id]) {
    return TRADINGVIEW_SYMBOLS[coin.id];
  }

  // For stocks, use NASDAQ (most common)
  if (coin.isStock) {
    return `NASDAQ:${coin.symbol?.toUpperCase()}`;
  }

  // Smart fallback for top coins not in our mapping
  // Try BINANCE first (most comprehensive), then BYBIT
  const symbol = coin.symbol?.toUpperCase();
  return `BINANCE:${symbol}USDT`;
};

// Categories for filtering - CRYPTO
const CRYPTO_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🔥' },
  { id: 'top50', label: 'Top 50', emoji: '🏆' },
  { id: 'top100', label: 'Top 100', emoji: '💯' },
  { id: 'top200', label: 'Top 200', emoji: '📊' },
  { id: 'trending', label: 'Trending', emoji: '📈' },
  { id: 'meme', label: 'Meme', emoji: '🐸' },
  { id: 'defi', label: 'DeFi', emoji: '🏦' },
  { id: 'ai', label: 'AI', emoji: '🤖' },
  { id: 'l1', label: 'L1', emoji: '⛓️' },
  { id: 'l2', label: 'L2', emoji: '🔷' },
  { id: 'bluechip', label: 'Blue Chip', emoji: '💎' },
];

// Categories for filtering - STOCKS
const STOCK_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🔥' },
  { id: 'trending', label: 'Trending', emoji: '📈' },
  { id: 'tech', label: 'Tech', emoji: '💻' },
  { id: 'finance', label: 'Finance', emoji: '🏦' },
  { id: 'healthcare', label: 'Health', emoji: '🏥' },
  { id: 'energy', label: 'Energy', emoji: '⚡' },
  { id: 'meme', label: 'Meme', emoji: '🚀' },
  { id: 'dividend', label: 'Dividend', emoji: '💰' },
];

// Popular stocks to track (symbol -> metadata)
const STOCK_LIST = [
  // Tech Giants
  { symbol: 'AAPL', name: 'Apple', sector: 'tech', category: ['tech', 'bluechip'] },
  { symbol: 'MSFT', name: 'Microsoft', sector: 'tech', category: ['tech', 'bluechip'] },
  { symbol: 'GOOGL', name: 'Alphabet', sector: 'tech', category: ['tech', 'bluechip'] },
  { symbol: 'AMZN', name: 'Amazon', sector: 'tech', category: ['tech', 'bluechip'] },
  { symbol: 'META', name: 'Meta', sector: 'tech', category: ['tech', 'bluechip'] },
  { symbol: 'NVDA', name: 'NVIDIA', sector: 'tech', category: ['tech', 'ai', 'bluechip'] },
  { symbol: 'TSLA', name: 'Tesla', sector: 'tech', category: ['tech', 'meme', 'trending'] },
  { symbol: 'AMD', name: 'AMD', sector: 'tech', category: ['tech', 'ai'] },
  { symbol: 'INTC', name: 'Intel', sector: 'tech', category: ['tech', 'dividend'] },
  { symbol: 'CRM', name: 'Salesforce', sector: 'tech', category: ['tech'] },
  { symbol: 'ORCL', name: 'Oracle', sector: 'tech', category: ['tech', 'dividend'] },
  { symbol: 'ADBE', name: 'Adobe', sector: 'tech', category: ['tech'] },
  { symbol: 'NFLX', name: 'Netflix', sector: 'tech', category: ['tech'] },
  { symbol: 'PYPL', name: 'PayPal', sector: 'tech', category: ['tech', 'finance'] },
  { symbol: 'SQ', name: 'Block', sector: 'tech', category: ['tech', 'finance'] },
  { symbol: 'SHOP', name: 'Shopify', sector: 'tech', category: ['tech'] },
  { symbol: 'UBER', name: 'Uber', sector: 'tech', category: ['tech'] },
  { symbol: 'ABNB', name: 'Airbnb', sector: 'tech', category: ['tech'] },
  { symbol: 'SNAP', name: 'Snap', sector: 'tech', category: ['tech', 'meme'] },
  { symbol: 'PLTR', name: 'Palantir', sector: 'tech', category: ['tech', 'ai', 'meme'] },
  // AI Stocks
  { symbol: 'AI', name: 'C3.ai', sector: 'tech', category: ['tech', 'ai', 'trending'] },
  { symbol: 'PATH', name: 'UiPath', sector: 'tech', category: ['tech', 'ai'] },
  { symbol: 'SNOW', name: 'Snowflake', sector: 'tech', category: ['tech', 'ai'] },
  // Finance
  { symbol: 'JPM', name: 'JPMorgan', sector: 'finance', category: ['finance', 'bluechip', 'dividend'] },
  { symbol: 'BAC', name: 'Bank of America', sector: 'finance', category: ['finance', 'dividend'] },
  { symbol: 'WFC', name: 'Wells Fargo', sector: 'finance', category: ['finance', 'dividend'] },
  { symbol: 'GS', name: 'Goldman Sachs', sector: 'finance', category: ['finance'] },
  { symbol: 'MS', name: 'Morgan Stanley', sector: 'finance', category: ['finance', 'dividend'] },
  { symbol: 'V', name: 'Visa', sector: 'finance', category: ['finance', 'bluechip'] },
  { symbol: 'MA', name: 'Mastercard', sector: 'finance', category: ['finance', 'bluechip'] },
  { symbol: 'AXP', name: 'American Express', sector: 'finance', category: ['finance', 'dividend'] },
  { symbol: 'BRK-B', name: 'Berkshire B', sector: 'finance', category: ['finance', 'bluechip'] },
  { symbol: 'C', name: 'Citigroup', sector: 'finance', category: ['finance', 'dividend'] },
  // Healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'healthcare', category: ['healthcare', 'dividend', 'bluechip'] },
  { symbol: 'UNH', name: 'UnitedHealth', sector: 'healthcare', category: ['healthcare', 'bluechip'] },
  { symbol: 'PFE', name: 'Pfizer', sector: 'healthcare', category: ['healthcare', 'dividend'] },
  { symbol: 'ABBV', name: 'AbbVie', sector: 'healthcare', category: ['healthcare', 'dividend'] },
  { symbol: 'MRK', name: 'Merck', sector: 'healthcare', category: ['healthcare', 'dividend'] },
  { symbol: 'LLY', name: 'Eli Lilly', sector: 'healthcare', category: ['healthcare', 'trending'] },
  { symbol: 'TMO', name: 'Thermo Fisher', sector: 'healthcare', category: ['healthcare'] },
  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil', sector: 'energy', category: ['energy', 'dividend'] },
  { symbol: 'CVX', name: 'Chevron', sector: 'energy', category: ['energy', 'dividend'] },
  { symbol: 'COP', name: 'ConocoPhillips', sector: 'energy', category: ['energy', 'dividend'] },
  { symbol: 'NEE', name: 'NextEra Energy', sector: 'energy', category: ['energy'] },
  // Meme Stocks
  { symbol: 'GME', name: 'GameStop', sector: 'retail', category: ['meme', 'trending'] },
  { symbol: 'AMC', name: 'AMC', sector: 'entertainment', category: ['meme', 'trending'] },
  { symbol: 'BBBY', name: 'Bed Bath Beyond', sector: 'retail', category: ['meme'] },
  { symbol: 'BB', name: 'BlackBerry', sector: 'tech', category: ['meme', 'tech'] },
  // Consumer
  { symbol: 'WMT', name: 'Walmart', sector: 'retail', category: ['dividend', 'bluechip'] },
  { symbol: 'COST', name: 'Costco', sector: 'retail', category: ['bluechip'] },
  { symbol: 'HD', name: 'Home Depot', sector: 'retail', category: ['dividend'] },
  { symbol: 'NKE', name: 'Nike', sector: 'consumer', category: ['bluechip'] },
  { symbol: 'SBUX', name: 'Starbucks', sector: 'consumer', category: ['dividend'] },
  { symbol: 'MCD', name: 'McDonald\'s', sector: 'consumer', category: ['dividend', 'bluechip'] },
  { symbol: 'KO', name: 'Coca-Cola', sector: 'consumer', category: ['dividend', 'bluechip'] },
  { symbol: 'PEP', name: 'PepsiCo', sector: 'consumer', category: ['dividend'] },
  { symbol: 'DIS', name: 'Disney', sector: 'entertainment', category: ['bluechip'] },
  // More Tech
  { symbol: 'IBM', name: 'IBM', sector: 'tech', category: ['tech', 'dividend'] },
  { symbol: 'CSCO', name: 'Cisco', sector: 'tech', category: ['tech', 'dividend'] },
  { symbol: 'QCOM', name: 'Qualcomm', sector: 'tech', category: ['tech', 'ai'] },
  { symbol: 'TXN', name: 'Texas Instruments', sector: 'tech', category: ['tech', 'dividend'] },
  { symbol: 'AVGO', name: 'Broadcom', sector: 'tech', category: ['tech', 'ai'] },
  { symbol: 'MU', name: 'Micron', sector: 'tech', category: ['tech', 'ai'] },
  { symbol: 'AMAT', name: 'Applied Materials', sector: 'tech', category: ['tech', 'ai'] },
  { symbol: 'LRCX', name: 'Lam Research', sector: 'tech', category: ['tech'] },
  { symbol: 'NOW', name: 'ServiceNow', sector: 'tech', category: ['tech', 'ai'] },
  { symbol: 'PANW', name: 'Palo Alto', sector: 'tech', category: ['tech'] },
  { symbol: 'CRWD', name: 'CrowdStrike', sector: 'tech', category: ['tech', 'trending'] },
  { symbol: 'DDOG', name: 'Datadog', sector: 'tech', category: ['tech'] },
  { symbol: 'ZS', name: 'Zscaler', sector: 'tech', category: ['tech'] },
  { symbol: 'NET', name: 'Cloudflare', sector: 'tech', category: ['tech'] },
  { symbol: 'TWLO', name: 'Twilio', sector: 'tech', category: ['tech'] },
  { symbol: 'OKTA', name: 'Okta', sector: 'tech', category: ['tech'] },
  { symbol: 'ZM', name: 'Zoom', sector: 'tech', category: ['tech'] },
  { symbol: 'DOCU', name: 'DocuSign', sector: 'tech', category: ['tech'] },
  { symbol: 'ROKU', name: 'Roku', sector: 'tech', category: ['tech', 'meme'] },
  { symbol: 'PINS', name: 'Pinterest', sector: 'tech', category: ['tech'] },
  { symbol: 'LYFT', name: 'Lyft', sector: 'tech', category: ['tech'] },
  { symbol: 'DASH', name: 'DoorDash', sector: 'tech', category: ['tech'] },
  { symbol: 'COIN', name: 'Coinbase', sector: 'tech', category: ['tech', 'trending'] },
  { symbol: 'HOOD', name: 'Robinhood', sector: 'tech', category: ['tech', 'meme'] },
  { symbol: 'SOFI', name: 'SoFi', sector: 'tech', category: ['tech', 'finance', 'meme'] },
  { symbol: 'RBLX', name: 'Roblox', sector: 'tech', category: ['tech', 'meme'] },
  { symbol: 'U', name: 'Unity', sector: 'tech', category: ['tech'] },
  { symbol: 'ARM', name: 'ARM Holdings', sector: 'tech', category: ['tech', 'ai', 'trending'] },
  { symbol: 'SMCI', name: 'Super Micro', sector: 'tech', category: ['tech', 'ai', 'trending'] },
  { symbol: 'MRVL', name: 'Marvell', sector: 'tech', category: ['tech', 'ai'] },
  { symbol: 'ON', name: 'ON Semi', sector: 'tech', category: ['tech'] },
  { symbol: 'ADI', name: 'Analog Devices', sector: 'tech', category: ['tech'] },
  // More Finance
  { symbol: 'BLK', name: 'BlackRock', sector: 'finance', category: ['finance', 'bluechip'] },
  { symbol: 'SCHW', name: 'Schwab', sector: 'finance', category: ['finance'] },
  { symbol: 'USB', name: 'US Bancorp', sector: 'finance', category: ['finance', 'dividend'] },
  { symbol: 'PNC', name: 'PNC', sector: 'finance', category: ['finance', 'dividend'] },
  { symbol: 'TFC', name: 'Truist', sector: 'finance', category: ['finance', 'dividend'] },
  { symbol: 'COF', name: 'Capital One', sector: 'finance', category: ['finance'] },
  { symbol: 'SPGI', name: 'S&P Global', sector: 'finance', category: ['finance'] },
  { symbol: 'ICE', name: 'ICE', sector: 'finance', category: ['finance'] },
  { symbol: 'CME', name: 'CME Group', sector: 'finance', category: ['finance'] },
  { symbol: 'MCO', name: 'Moody\'s', sector: 'finance', category: ['finance'] },
  // Healthcare expansion
  { symbol: 'AMGN', name: 'Amgen', sector: 'healthcare', category: ['healthcare', 'dividend'] },
  { symbol: 'GILD', name: 'Gilead', sector: 'healthcare', category: ['healthcare', 'dividend'] },
  { symbol: 'BIIB', name: 'Biogen', sector: 'healthcare', category: ['healthcare'] },
  { symbol: 'REGN', name: 'Regeneron', sector: 'healthcare', category: ['healthcare'] },
  { symbol: 'VRTX', name: 'Vertex', sector: 'healthcare', category: ['healthcare'] },
  { symbol: 'MRNA', name: 'Moderna', sector: 'healthcare', category: ['healthcare', 'trending'] },
  { symbol: 'BMY', name: 'Bristol Myers', sector: 'healthcare', category: ['healthcare', 'dividend'] },
  { symbol: 'CVS', name: 'CVS Health', sector: 'healthcare', category: ['healthcare', 'dividend'] },
  { symbol: 'CI', name: 'Cigna', sector: 'healthcare', category: ['healthcare'] },
  { symbol: 'HUM', name: 'Humana', sector: 'healthcare', category: ['healthcare'] },
  { symbol: 'ELV', name: 'Elevance', sector: 'healthcare', category: ['healthcare'] },
  { symbol: 'ISRG', name: 'Intuitive Surgical', sector: 'healthcare', category: ['healthcare'] },
  { symbol: 'DHR', name: 'Danaher', sector: 'healthcare', category: ['healthcare'] },
  { symbol: 'SYK', name: 'Stryker', sector: 'healthcare', category: ['healthcare'] },
  { symbol: 'MDT', name: 'Medtronic', sector: 'healthcare', category: ['healthcare', 'dividend'] },
  { symbol: 'ZTS', name: 'Zoetis', sector: 'healthcare', category: ['healthcare'] },
  // Energy expansion
  { symbol: 'SLB', name: 'Schlumberger', sector: 'energy', category: ['energy'] },
  { symbol: 'EOG', name: 'EOG Resources', sector: 'energy', category: ['energy', 'dividend'] },
  { symbol: 'PXD', name: 'Pioneer Natural', sector: 'energy', category: ['energy', 'dividend'] },
  { symbol: 'MPC', name: 'Marathon Petroleum', sector: 'energy', category: ['energy', 'dividend'] },
  { symbol: 'PSX', name: 'Phillips 66', sector: 'energy', category: ['energy', 'dividend'] },
  { symbol: 'VLO', name: 'Valero', sector: 'energy', category: ['energy', 'dividend'] },
  { symbol: 'OXY', name: 'Occidental', sector: 'energy', category: ['energy'] },
  { symbol: 'HAL', name: 'Halliburton', sector: 'energy', category: ['energy'] },
  { symbol: 'DVN', name: 'Devon Energy', sector: 'energy', category: ['energy', 'dividend'] },
  { symbol: 'FANG', name: 'Diamondback', sector: 'energy', category: ['energy', 'dividend'] },
  // Consumer & Retail expansion
  { symbol: 'TGT', name: 'Target', sector: 'retail', category: ['dividend'] },
  { symbol: 'LOW', name: 'Lowe\'s', sector: 'retail', category: ['dividend'] },
  { symbol: 'TJX', name: 'TJ Maxx', sector: 'retail', category: [] },
  { symbol: 'ROST', name: 'Ross Stores', sector: 'retail', category: [] },
  { symbol: 'DG', name: 'Dollar General', sector: 'retail', category: [] },
  { symbol: 'DLTR', name: 'Dollar Tree', sector: 'retail', category: [] },
  { symbol: 'LULU', name: 'Lululemon', sector: 'retail', category: ['trending'] },
  { symbol: 'BURL', name: 'Burlington', sector: 'retail', category: [] },
  { symbol: 'GPS', name: 'Gap', sector: 'retail', category: [] },
  { symbol: 'ETSY', name: 'Etsy', sector: 'retail', category: [] },
  { symbol: 'EBAY', name: 'eBay', sector: 'retail', category: [] },
  { symbol: 'CHWY', name: 'Chewy', sector: 'retail', category: ['meme'] },
  { symbol: 'W', name: 'Wayfair', sector: 'retail', category: ['meme'] },
  { symbol: 'YUM', name: 'Yum Brands', sector: 'consumer', category: ['dividend'] },
  { symbol: 'CMG', name: 'Chipotle', sector: 'consumer', category: [] },
  { symbol: 'DPZ', name: 'Domino\'s', sector: 'consumer', category: [] },
  { symbol: 'QSR', name: 'Restaurant Brands', sector: 'consumer', category: ['dividend'] },
  { symbol: 'DKNG', name: 'DraftKings', sector: 'consumer', category: ['meme', 'trending'] },
  { symbol: 'MGM', name: 'MGM Resorts', sector: 'consumer', category: [] },
  { symbol: 'WYNN', name: 'Wynn Resorts', sector: 'consumer', category: [] },
  { symbol: 'LVS', name: 'Las Vegas Sands', sector: 'consumer', category: [] },
  // Industrial
  { symbol: 'CAT', name: 'Caterpillar', sector: 'industrial', category: ['dividend', 'bluechip'] },
  { symbol: 'DE', name: 'John Deere', sector: 'industrial', category: ['dividend'] },
  { symbol: 'HON', name: 'Honeywell', sector: 'industrial', category: ['dividend'] },
  { symbol: 'UPS', name: 'UPS', sector: 'industrial', category: ['dividend'] },
  { symbol: 'FDX', name: 'FedEx', sector: 'industrial', category: [] },
  { symbol: 'UNP', name: 'Union Pacific', sector: 'industrial', category: ['dividend'] },
  { symbol: 'BA', name: 'Boeing', sector: 'industrial', category: ['bluechip'] },
  { symbol: 'LMT', name: 'Lockheed Martin', sector: 'industrial', category: ['dividend'] },
  { symbol: 'RTX', name: 'RTX', sector: 'industrial', category: ['dividend'] },
  { symbol: 'GD', name: 'General Dynamics', sector: 'industrial', category: ['dividend'] },
  { symbol: 'NOC', name: 'Northrop Grumman', sector: 'industrial', category: ['dividend'] },
  { symbol: 'GE', name: 'GE Aerospace', sector: 'industrial', category: ['trending'] },
  // Communications
  { symbol: 'T', name: 'AT&T', sector: 'communications', category: ['dividend'] },
  { symbol: 'VZ', name: 'Verizon', sector: 'communications', category: ['dividend'] },
  { symbol: 'TMUS', name: 'T-Mobile', sector: 'communications', category: [] },
  { symbol: 'CMCSA', name: 'Comcast', sector: 'communications', category: ['dividend'] },
  { symbol: 'CHTR', name: 'Charter', sector: 'communications', category: [] },
  // Materials
  { symbol: 'LIN', name: 'Linde', sector: 'materials', category: ['bluechip'] },
  { symbol: 'APD', name: 'Air Products', sector: 'materials', category: ['dividend'] },
  { symbol: 'SHW', name: 'Sherwin-Williams', sector: 'materials', category: [] },
  { symbol: 'FCX', name: 'Freeport-McMoRan', sector: 'materials', category: [] },
  { symbol: 'NEM', name: 'Newmont', sector: 'materials', category: ['dividend'] },
  // Real Estate
  { symbol: 'AMT', name: 'American Tower', sector: 'realestate', category: ['dividend'] },
  { symbol: 'PLD', name: 'Prologis', sector: 'realestate', category: ['dividend'] },
  { symbol: 'CCI', name: 'Crown Castle', sector: 'realestate', category: ['dividend'] },
  { symbol: 'EQIX', name: 'Equinix', sector: 'realestate', category: ['dividend'] },
  { symbol: 'SPG', name: 'Simon Property', sector: 'realestate', category: ['dividend'] },
  { symbol: 'O', name: 'Realty Income', sector: 'realestate', category: ['dividend'] },
  // More meme stocks
  { symbol: 'RIVN', name: 'Rivian', sector: 'auto', category: ['meme', 'trending'] },
  { symbol: 'LCID', name: 'Lucid', sector: 'auto', category: ['meme'] },
  { symbol: 'NIO', name: 'NIO', sector: 'auto', category: ['meme', 'trending'] },
  { symbol: 'XPEV', name: 'XPeng', sector: 'auto', category: ['meme'] },
  { symbol: 'LI', name: 'Li Auto', sector: 'auto', category: ['meme'] },
  { symbol: 'SPCE', name: 'Virgin Galactic', sector: 'aerospace', category: ['meme'] },
  { symbol: 'PLUG', name: 'Plug Power', sector: 'energy', category: ['meme'] },
  { symbol: 'FCEL', name: 'FuelCell', sector: 'energy', category: ['meme'] },
  { symbol: 'CLOV', name: 'Clover Health', sector: 'healthcare', category: ['meme'] },
  { symbol: 'WISH', name: 'Wish', sector: 'retail', category: ['meme'] },
  { symbol: 'OPEN', name: 'Opendoor', sector: 'realestate', category: ['meme'] },
  { symbol: 'UPST', name: 'Upstart', sector: 'finance', category: ['meme', 'ai'] },
  { symbol: 'AFRM', name: 'Affirm', sector: 'finance', category: ['tech', 'meme'] },
];

// For backwards compatibility
const CATEGORIES = CRYPTO_CATEGORIES;

// Affiliate links - Crypto exchanges & Stock brokers
const AFFILIATE_LINKS = {
  // Crypto
  coinbase: 'https://advanced.coinbase.com/join/YAHNU27',
  binance: 'https://www.binance.com/activity/referral-entry/CPA?ref=CPA_003NFBSRRH',
  bybit: 'https://www.bybit.com/invite?ref=LW6W7',
  kraken: 'https://www.kraken.com',
  kucoin: 'https://www.kucoin.com',
  // Stocks
  robinhood: 'https://join.robinhood.com/swipefolio',
  webull: 'https://www.webull.com',
  etoro: 'https://www.etoro.com',
  interactivebrokers: 'https://www.interactivebrokers.com',
};

// Monetization constants
const FREE_DAILY_SWIPES = 25;
const PREMIUM_PRICE = '$4.99/month';

// Stablecoins to filter out (no point swiping on $1 pegged coins)
const STABLECOIN_IDS = [
  'tether', 'usdc', 'dai', 'usds', 'usdd', 'usdt', 'tusd', 'usdp', 'gusd', 'busd',
  'frax', 'lusd', 'susd', 'eurs', 'eurt', 'ustc', 'fdusd', 'pyusd', 'usdg',
  'first-digital-usd', 'ethena-usde', 'usde', 'crvusd', 'true-usd', 'pax-dollar',
  'gemini-dollar', 'stasis-euro', 'origin-dollar', 'liquity-usd', 'magic-internet-money',
  'syrup-usdc', 'syrupusdc', 'wrapped-bitcoin', 'wrapped-ether', 'staked-ether',
  'tether-gold', 'pax-gold', 'usdd', 'usual-usd', 'paypal-usd', 'tether-eurt',
];

// Patterns that indicate stablecoins or wrapped assets
const STABLECOIN_PATTERNS = ['usd', 'eur', 'gbp', 'jpy', 'syrup', 'wrapped', 'wbtc', 'weth', 'steth'];

const isStablecoin = (coin) => {
  const id = coin.id?.toLowerCase() || '';
  const symbol = coin.symbol?.toLowerCase() || '';
  const name = coin.name?.toLowerCase() || '';

  // Check against known stablecoin IDs
  if (STABLECOIN_IDS.includes(id)) return true;

  // Check for common stablecoin/wrapped patterns in symbol or name
  for (const pattern of STABLECOIN_PATTERNS) {
    if (symbol.includes(pattern) || id.includes(pattern)) return true;
  }

  if (name.includes('usd coin') || name.includes('stablecoin') || name.includes('dollar')) return true;
  if (name.includes('wrapped') || name.includes('staked')) return true;

  // Check if price is pegged around $1 with very low volatility (likely a stablecoin)
  const price = coin.current_price;
  const change = Math.abs(coin.price_change_percentage_24h || 0);
  if (price > 0.98 && price < 1.02 && change < 0.5) return true;

  return false;
};

// Finnhub API key - Get free key at https://finnhub.io/
// Users can set their own key in localStorage: localStorage.setItem('finnhub_key', 'YOUR_KEY')
const FINNHUB_KEY = () => localStorage.getItem('finnhub_key') || 'demo'; // 'demo' works for basic quotes

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Get stock category from our stock list metadata
const getStockCategory = (stock) => {
  const stockSymbol = stock.symbol?.toUpperCase();
  const stockMeta = STOCK_LIST.find(s => s.symbol === stockSymbol);
  const categories = [...(stockMeta?.category || [])];

  // Add trending if big move
  if (Math.abs(stock.price_change_percentage_24h || 0) > 5) {
    if (!categories.includes('trending')) categories.push('trending');
  }

  return categories;
};

// Get vibes for stocks
const getStockVibes = (stock) => {
  const vibes = [];
  const categories = getStockCategory(stock);
  const stockSymbol = stock.symbol?.toUpperCase();
  const stockMeta = STOCK_LIST.find(s => s.symbol === stockSymbol);

  if (categories.includes('trending')) vibes.push({ text: 'Trending', emoji: '🔥', color: 'from-orange-500 to-red-500' });
  if (categories.includes('ai')) vibes.push({ text: 'AI', emoji: '🤖', color: 'from-blue-500 to-cyan-500' });
  if (categories.includes('meme')) vibes.push({ text: 'Meme', emoji: '🚀', color: 'from-green-500 to-emerald-500' });
  if (categories.includes('tech')) vibes.push({ text: 'Tech', emoji: '💻', color: 'from-blue-500 to-cyan-500' });
  if (categories.includes('finance')) vibes.push({ text: 'Finance', emoji: '🏦', color: 'from-yellow-500 to-orange-500' });
  if (categories.includes('dividend')) vibes.push({ text: 'Dividend', emoji: '💰', color: 'from-green-500 to-teal-500' });
  if (categories.includes('healthcare')) vibes.push({ text: 'Health', emoji: '🏥', color: 'from-red-500 to-pink-500' });
  if (categories.includes('energy')) vibes.push({ text: 'Energy', emoji: '⚡', color: 'from-amber-500 to-yellow-500' });

  // Sector badge
  if (stockMeta?.sector && vibes.length < 2) {
    const sectorEmoji = {
      tech: '💻', finance: '🏦', healthcare: '🏥', energy: '⚡',
      retail: '🛒', consumer: '🛍️', entertainment: '🎬'
    };
    vibes.push({
      text: stockMeta.sector.charAt(0).toUpperCase() + stockMeta.sector.slice(1),
      emoji: sectorEmoji[stockMeta.sector] || '📊',
      color: 'from-slate-500 to-slate-600'
    });
  }

  if (stock.price_change_percentage_24h > 8) vibes.push({ text: 'Pumping', emoji: '🚀', color: 'from-green-400 to-emerald-400' });
  if (stock.price_change_percentage_24h < -8) vibes.push({ text: 'Dipping', emoji: '📉', color: 'from-red-500 to-pink-500' });

  return vibes.slice(0, 3);
};

// Fetch stocks from Yahoo Finance (batch API - all stocks in one call)
const fetchStocksFromFinnhub = async () => {
  const allSymbols = STOCK_LIST.map(s => s.symbol);

  // Yahoo Finance batch API - gets ALL stocks in one request!
  try {
    const symbolsParam = allSymbols.join(',');
    const response = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsParam}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (response.ok) {
      const data = await response.json();
      const results = data.quoteResponse?.result || [];

      if (results.length > 0) {
        console.log(`Yahoo Finance: ${results.length} stocks loaded`);
        const quotes = results.map(quote => ({
          symbol: quote.symbol,
          c: quote.regularMarketPrice || 0,
          pc: quote.regularMarketPreviousClose || quote.regularMarketPrice,
          h: quote.regularMarketDayHigh || quote.regularMarketPrice,
          l: quote.regularMarketDayLow || quote.regularMarketPrice
        }));
        return transformQuotes(quotes);
      }
    }
  } catch (e) {
    console.log('Yahoo Finance error:', e.message);
  }

  // Fallback: use mock data with realistic prices
  console.log('Using mock stock data');
  const quotes = STOCK_LIST.map(stock => {
    // Realistic base prices for major stocks
    const knownPrices = {
      'AAPL': 195, 'MSFT': 420, 'NVDA': 145, 'GOOGL': 175, 'AMZN': 185,
      'TSLA': 250, 'META': 510, 'JPM': 200, 'V': 280, 'MA': 470,
      'UNH': 520, 'JNJ': 155, 'WMT': 165, 'PG': 160, 'HD': 380,
      'XOM': 110, 'CVX': 155, 'BAC': 38, 'PFE': 28, 'ABBV': 175,
      'KO': 62, 'PEP': 175, 'COST': 740, 'MCD': 295, 'NKE': 105,
      'DIS': 95, 'NFLX': 485, 'AMD': 155, 'INTC': 45, 'CRM': 265,
      'GS': 450, 'MS': 95, 'WFC': 55, 'C': 58, 'AXP': 220
    };
    const basePrice = knownPrices[stock.symbol] || (30 + Math.random() * 200);
    const variation = basePrice * 0.03 * (Math.random() - 0.5);
    return {
      symbol: stock.symbol,
      c: basePrice + variation,
      pc: basePrice,
      h: basePrice * 1.02,
      l: basePrice * 0.98
    };
  });
  return transformQuotes(quotes);
};

// Transform quotes to our stock format
const transformQuotes = (quotes) => {
  return quotes
    .filter(q => q && q.c > 0)
    .map((quote, index) => {
      const stockMeta = STOCK_LIST.find(s => s.symbol === quote.symbol);
      const price = quote.c || 0; // Current price
      const prevClose = quote.pc || price;
      const change = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0;
      const high = quote.h || price;
      const low = quote.l || price;

      // Estimate market cap (rough, based on known large caps)
      const marketCapEstimates = {
        'AAPL': 3000000000000, 'MSFT': 2800000000000, 'GOOGL': 1800000000000,
        'AMZN': 1500000000000, 'NVDA': 1200000000000, 'META': 900000000000,
        'TSLA': 700000000000, 'BRK-B': 800000000000, 'V': 500000000000,
        'JPM': 450000000000, 'JNJ': 400000000000, 'WMT': 400000000000,
      };
      const marketCap = marketCapEstimates[quote.symbol] || (price * 1000000000); // Default estimate

      // Generate sparkline from daily movement
      const sparklineData = Array.from({ length: 24 }, (_, i) => {
        const progress = i / 23;
        return prevClose + (price - prevClose) * progress + (Math.random() - 0.5) * price * 0.01;
      });

      return {
        id: quote.symbol.toLowerCase(),
        symbol: quote.symbol.toLowerCase(),
        name: stockMeta?.name || quote.symbol,
        image: `https://logo.clearbit.com/${stockMeta?.name?.toLowerCase().replace(/[^a-z]/g, '')}.com`,
        current_price: price,
        market_cap: marketCap,
        market_cap_rank: index + 1,
        total_volume: (quote.v || 0) * price, // Volume * price = dollar volume
        price_change_percentage_24h: change,
        high_24h: high,
        low_24h: low,
        sparkline_in_7d: { price: sparklineData },
        isStock: true,
        sector: stockMeta?.sector,
        categories: stockMeta?.category || [],
      };
    });
};

const getRiskLevel = (marketCap) => {
  if (marketCap > 100000000000) return { emoji: '💎', label: 'Blue Chip', color: 'text-cyan-400', bg: 'bg-cyan-500/20' };
  if (marketCap > 10000000000) return { emoji: '🟢', label: 'Large Cap', color: 'text-green-400', bg: 'bg-green-500/20' };
  if (marketCap > 1000000000) return { emoji: '🟡', label: 'Mid Cap', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
  if (marketCap > 100000000) return { emoji: '🟠', label: 'Small Cap', color: 'text-orange-400', bg: 'bg-orange-500/20' };
  return { emoji: '💀', label: 'Degen', color: 'text-blue-400', bg: 'bg-blue-500/20' };
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

  // Top rankings by market cap rank
  const rank = coin.market_cap_rank;
  if (rank && rank <= 50) categories.push('top50');
  if (rank && rank <= 100) categories.push('top100');
  if (rank && rank <= 200) categories.push('top200');

  // Trending (high 24h volume relative to mcap or big price move)
  if (coin.price_change_percentage_24h > 10 ||
      (coin.total_volume > coin.market_cap * 0.15)) {
    categories.push('trending');
  }

  return categories;
};

const getVibes = (asset) => {
  // Handle both crypto and stocks
  if (asset.isStock) {
    return getStockVibes(asset);
  }

  const vibes = [];
  const categories = getCoinCategory(asset);

  if (categories.includes('trending')) vibes.push({ text: 'Trending', emoji: '🔥', color: 'from-orange-500 to-red-500' });
  if (categories.includes('ai')) vibes.push({ text: 'AI', emoji: '🤖', color: 'from-blue-500 to-cyan-500' });
  if (categories.includes('meme')) vibes.push({ text: 'Meme', emoji: '🐸', color: 'from-green-500 to-emerald-500' });
  if (categories.includes('defi')) vibes.push({ text: 'DeFi', emoji: '🏦', color: 'from-blue-500 to-cyan-500' });
  if (categories.includes('l1')) vibes.push({ text: 'L1', emoji: '⛓️', color: 'from-yellow-500 to-orange-500' });
  if (categories.includes('l2')) vibes.push({ text: 'L2', emoji: '🔷', color: 'from-indigo-500 to-blue-500' });

  if (asset.price_change_percentage_24h > 20) vibes.push({ text: 'Pumping', emoji: '🚀', color: 'from-green-400 to-emerald-400' });
  if (asset.price_change_percentage_24h < -15) vibes.push({ text: 'Dipping', emoji: '📉', color: 'from-red-500 to-pink-500' });

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
// COMMUNITY SENTIMENT (Real Firestore data with simulated fallback)
// ============================================================================

const getCommunitySentiment = (coin, coinStats = null) => {
  // Use REAL Firestore data if available
  if (coinStats && coinStats.totalSwipes > 0) {
    const apeRate = coinStats.apeRatio;
    const userCount = coinStats.totalSwipes;

    // Generate comment based on real sentiment
    const bullishComments = [
      "Diamond hands only 💎",
      "This is the way 🚀",
      "Accumulating more",
      "Bullish AF",
      "Still early",
      "LFG 🔥",
      "Moon soon",
      "Buy the dip",
    ];

    const bearishComments = [
      "Be careful here",
      "Taking profits",
      "Waiting for lower",
      "Risky at this level",
      "Overextended imo",
      "Not financial advice",
    ];

    const hash = coin.id.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
    const seed = Math.abs(hash);
    const commentPool = apeRate > 60 ? bullishComments : bearishComments;
    const topComment = commentPool[seed % commentPool.length];

    return {
      apeRate: Math.round(apeRate),
      userCount,
      topComment,
      sentiment: apeRate > 70 ? 'bullish' : apeRate > 45 ? 'neutral' : 'bearish',
      isReal: true, // Flag to show this is real community data
    };
  }

  // FALLBACK: Generate simulated sentiment based on coin properties
  // This creates consistent sentiment per coin (seeded by coin id hash)
  const hash = coin.id.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  const seed = Math.abs(hash);

  // Base APE rate influenced by:
  // - Price change (positive = more bullish)
  // - Market cap (bigger = more trust)
  // - Volume (higher = more interest)
  let baseRate = 50;

  // Price momentum affects sentiment
  if (coin.price_change_percentage_24h > 10) baseRate += 25;
  else if (coin.price_change_percentage_24h > 5) baseRate += 15;
  else if (coin.price_change_percentage_24h > 0) baseRate += 8;
  else if (coin.price_change_percentage_24h > -5) baseRate -= 5;
  else if (coin.price_change_percentage_24h > -10) baseRate -= 15;
  else baseRate -= 25;

  // Blue chips get more trust
  if (coin.market_cap > 100000000000) baseRate += 10;
  else if (coin.market_cap > 10000000000) baseRate += 5;
  else if (coin.market_cap < 1000000000) baseRate -= 5;

  // Add some pseudo-random variation (consistent per coin)
  const variation = ((seed % 20) - 10);
  const apeRate = Math.max(15, Math.min(95, baseRate + variation));

  // Generate fake user count (higher for popular coins)
  const baseUsers = coin.market_cap > 50000000000 ? 2000 :
                    coin.market_cap > 10000000000 ? 800 :
                    coin.market_cap > 1000000000 ? 300 : 100;
  const userCount = baseUsers + (seed % 500);

  // Generate top comment based on sentiment
  const bullishComments = [
    "Diamond hands only 💎",
    "This is the way 🚀",
    "Accumulating more",
    "Bullish AF",
    "Still early",
    "LFG 🔥",
    "Moon soon",
    "Buy the dip",
  ];

  const bearishComments = [
    "Be careful here",
    "Taking profits",
    "Waiting for lower",
    "Risky at this level",
    "Overextended imo",
    "Not financial advice",
  ];

  const commentPool = apeRate > 60 ? bullishComments : bearishComments;
  const topComment = commentPool[seed % commentPool.length];

  return {
    apeRate: Math.round(apeRate),
    userCount,
    topComment,
    sentiment: apeRate > 70 ? 'bullish' : apeRate > 45 ? 'neutral' : 'bearish',
    isReal: false, // Flag to show this is simulated data
  };
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
// EPIC ANIMATION COMPONENTS
// ============================================================================

// Confetti Explosion - triggers on APE swipe
const Confetti = ({ trigger, type = 'ape' }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!trigger) return;

    const colors = type === 'ape'
      ? ['#22c55e', '#4ade80', '#86efac', '#fbbf24', '#f59e0b', '#5b8aff'] // Green + gold + blue
      : ['#ef4444', '#f87171', '#fca5a5', '#5b8aff', '#76ddff']; // Red + blue

    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 30 + 35,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 4,
      velocityX: (Math.random() - 0.5) * 30,
      velocityY: Math.random() * -20 - 10,
      rotation: Math.random() * 360,
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
    }));

    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1500);
  }, [trigger, type]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: `${p.x}%`,
              y: `${p.y}%`,
              scale: 1,
              rotate: p.rotation,
              opacity: 1,
            }}
            animate={{
              x: `${p.x + p.velocityX}%`,
              y: `${p.y + p.velocityY + 100}%`,
              scale: 0,
              rotate: p.rotation + 720,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.shape === 'circle' ? '50%' : '2px',
              boxShadow: `0 0 10px ${p.color}`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Floating Sparkles Background
const FloatingSparkles = ({ count = 20 }) => {
  const sparkles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      size: 1 + Math.random() * 2,
    })), [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            background: 'rgba(91,138,255,0.6)',
          }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Pulse Ring Effect for buttons
const PulseRings = ({ active, color = 'blue' }) => {
  if (!active) return null;

  const colorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
    gold: 'border-yellow-400',
  };

  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`absolute inset-0 rounded-full border-2 ${colorClasses[color]}`}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{
            duration: 1.5,
            delay: i * 0.4,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </>
  );
};

// Video Background Component - Signal Pilot style
const VideoBackground = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* Video Background */}
      {!videoError && (
        <video
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ pointerEvents: 'none' }}
        >
          <source src="/videos/starfield-bg.mp4" type="video/mp4" />
        </video>
      )}

      {/* Fallback CSS starfield (shows while video loads or if it fails) */}
      {(!videoLoaded || videoError) && (
        <div className="absolute inset-0 bg-[#05070d]">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: Math.random() * 0.5 + 0.2,
                animation: `twinkle ${2 + Math.random() * 2}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Subtle overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(5,7,13,0.15)' }}
      />
    </div>
  );
};

// Swipe Trail Effect
const SwipeTrail = ({ direction }) => {
  const isRight = direction === 'right';

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute top-1/2 ${isRight ? 'left-1/2' : 'right-1/2'} w-4 h-4 rounded-full`}
          style={{
            background: isRight
              ? `radial-gradient(circle, rgba(34,197,94,0.8) 0%, transparent 70%)`
              : `radial-gradient(circle, rgba(239,68,68,0.8) 0%, transparent 70%)`,
          }}
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            scale: [0, 3, 0],
            x: isRight ? [0, 100 + i * 20, 200] : [0, -100 - i * 20, -200],
            y: Math.sin(i) * 50,
            opacity: [1, 0.8, 0],
          }}
          transition={{
            duration: 0.6,
            delay: i * 0.05,
            ease: 'easeOut',
          }}
        />
      ))}
    </motion.div>
  );
};

// Glow Text Effect
const GlowText = ({ children, color = 'blue', className = '' }) => {
  const glowColors = {
    blue: 'text-blue-400 drop-shadow-[0_0_15px_rgba(91,138,255,0.8)]',
    green: 'text-green-400 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]',
    red: 'text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]',
    gold: 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]',
    cyan: 'text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]',
  };

  return (
    <motion.span
      className={`${glowColors[color]} ${className}`}
      animate={{ textShadow: ['0 0 10px currentColor', '0 0 20px currentColor', '0 0 10px currentColor'] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {children}
    </motion.span>
  );
};

// ============================================================================
// SWIPEABLE CARD COMPONENT (Framer Motion Physics)
// ============================================================================

const SwipeCard = ({ coin, onSwipe, isTop, style, zIndex, onTap, coinStats }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const apeOpacity = useTransform(x, [0, 100], [0, 1]);
  const rugOpacity = useTransform(x, [-100, 0], [1, 0]);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const risk = getRiskLevel(coin.market_cap);
  const vibes = getVibes(coin);
  const sparklineData = coin.sparkline_in_7d?.price || [];
  const isPositive = coin.price_change_percentage_24h >= 0;

  const handleDragStart = (event, info) => {
    dragStartRef.current = { x: info.point.x, y: info.point.y, time: Date.now() };
  };

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    const minDistanceForVelocity = 30; // Must move at least 30px before velocity counts

    // Only process actual swipes, not taps or accidental micro-movements
    // Require EITHER sufficient distance OR (velocity + minimum distance)
    const absOffset = Math.abs(info.offset.x);

    if (info.offset.x > threshold || (velocity > 500 && absOffset > minDistanceForVelocity)) {
      onSwipe('right');
    } else if (info.offset.x < -threshold || (velocity < -500 && absOffset > minDistanceForVelocity)) {
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
      onDragStart={handleDragStart}
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
      {/* Card Container - Finex-inspired glassmorphism */}
      <div
        className="relative rounded-3xl overflow-hidden border border-white/[0.08]"
        style={{
          background: 'linear-gradient(145deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 24px 48px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset, 0 -20px 40px -20px rgba(91,138,255,0.15) inset',
        }}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.08] via-transparent to-cyan-500/[0.05] pointer-events-none" />

        {/* APE Stamp */}
        <motion.div
          className="absolute top-8 left-4 z-30 pointer-events-none"
          style={{ opacity: apeOpacity }}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="border-[3px] border-emerald-400 text-emerald-400 px-6 py-3 rounded-2xl font-black text-3xl rotate-[-15deg] backdrop-blur-md"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.05) 100%)',
              boxShadow: '0 8px 32px rgba(16,185,129,0.3), 0 0 0 1px rgba(16,185,129,0.1) inset',
            }}
          >
            APE 🦍
          </motion.div>
        </motion.div>

        {/* RUG Stamp */}
        <motion.div
          className="absolute top-8 right-4 z-30 pointer-events-none"
          style={{ opacity: rugOpacity }}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="border-[3px] border-rose-400 text-rose-400 px-6 py-3 rounded-2xl font-black text-3xl rotate-[15deg] backdrop-blur-md"
            style={{
              background: 'linear-gradient(135deg, rgba(244,63,94,0.2) 0%, rgba(244,63,94,0.05) 100%)',
              boxShadow: '0 8px 32px rgba(244,63,94,0.3), 0 0 0 1px rgba(244,63,94,0.1) inset',
            }}
          >
            RUG 🚫
          </motion.div>
        </motion.div>

        {/* Coin Header - Compact */}
        <div className="relative p-4 pb-3">
          {/* Rank badge - refined glassmorphism */}
          <div
            className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-semibold"
            style={{
              background: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            #{coin.market_cap_rank || '?'}
          </div>

          {/* Hot badge - with glow */}
          {coin.price_change_percentage_24h > 15 && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
                boxShadow: '0 4px 20px rgba(249,115,22,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset',
              }}
            >
              🔥 HOT
            </motion.div>
          )}

          {/* Coin image and name */}
          <div className="flex items-center gap-4 relative">
            <div className="relative group">
              {/* Animated glow behind image */}
              <motion.div
                animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl blur-xl -z-10"
                style={{
                  background: `radial-gradient(circle, ${isPositive ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'} 0%, transparent 70%)`,
                }}
              />
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(51,65,85,0.8) 0%, rgba(30,41,59,0.9) 100%)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08) inset',
                }}
              >
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-110"
                  draggable={false}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<span class="text-3xl font-black bg-gradient-to-br from-blue-400 to-cyan-400 bg-clip-text text-transparent">${coin.symbol?.toUpperCase().slice(0,3) || '?'}</span>`;
                  }}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-extrabold truncate tracking-tight">{coin.name}</h2>
              <p className="text-slate-400 font-semibold uppercase tracking-widest text-xs">${coin.symbol}</p>
            </div>
          </div>
        </div>

        {/* Price Section - Compact */}
        <div className="px-4 pb-1.5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-black tracking-tight">{formatPrice(coin.current_price)}</p>
              <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                <span className="text-xs font-bold">
                  {isPositive ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%
                </span>
                <span className="text-slate-500 text-[10px]">24h</span>
              </div>
            </div>

            {/* Mini Chart + View Chart Button Combined */}
            <div className="flex items-center gap-2">
              <div className="w-20">
                <SparklineSVG data={sparklineData.slice(-24)} positive={isPositive} />
              </div>
              {isTop && onTap && (
                <div
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerMove={(e) => e.stopPropagation()}
                  onPointerUp={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  style={{ touchAction: 'manipulation' }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onTap(coin);
                    }}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 active:scale-95 transition-transform touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <span className="text-[10px] font-medium text-blue-400">View Chart</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vibes/Tags - Ultra Compact */}
        {vibes.length > 0 && (
          <div className="px-4 pb-1.5">
            <div className="flex flex-wrap gap-1">
              {vibes.slice(0, 3).map((vibe, i) => (
                <span
                  key={i}
                  className={`bg-gradient-to-r ${vibe.color} px-1.5 py-0.5 rounded-full text-[9px] font-bold`}
                >
                  {vibe.emoji} {vibe.text}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid - Ultra Compact */}
        <div className="px-4 pb-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-slate-800/60 p-1.5 rounded-lg border border-white/5">
              <p className="text-slate-500 text-[10px]">Market Cap</p>
              <p className="font-bold text-xs">{formatNumber(coin.market_cap)}</p>
            </div>
            <div className="bg-slate-800/60 p-1.5 rounded-lg border border-white/5">
              <p className="text-slate-500 text-[10px]">24h Volume</p>
              <p className="font-bold text-xs">{formatNumber(coin.total_volume)}</p>
            </div>
          </div>
        </div>

        {/* Community & Risk - Combined Ultra Compact Row */}
        {(() => {
          const sentiment = getCommunitySentiment(coin, coinStats);
          return (
            <div className="px-4 pb-1.5">
              <div className="flex gap-1.5">
                {/* Community Mini - Shows real data when available */}
                <div className={`flex-1 p-1.5 rounded-lg border ${
                  sentiment.isReal
                    ? 'bg-blue-500/10 border-blue-500/20'
                    : 'bg-slate-800/40 border-white/5'
                }`}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[10px]">{sentiment.isReal ? '🦍' : '👥'}</span>
                    <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          sentiment.apeRate > 70 ? 'bg-green-500' :
                          sentiment.apeRate > 45 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${sentiment.apeRate}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold ${
                      sentiment.apeRate > 70 ? 'text-green-400' :
                      sentiment.apeRate > 45 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {sentiment.apeRate}%
                    </span>
                    {sentiment.isReal && (
                      <span className="text-[8px] text-blue-400 font-semibold">LIVE</span>
                    )}
                  </div>
                </div>
                {/* Risk Mini */}
                <div className={`${risk.bg} p-1.5 rounded-lg border border-white/5 flex items-center gap-1`}>
                  <span className="text-[10px]">{risk.emoji}</span>
                  <span className={`font-bold text-[10px] ${risk.color}`}>{risk.label}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Swipe hint for top card */}
        {isTop && (
          <div className="pb-3 flex justify-center">
            <p className="text-slate-600 text-xs font-medium">← Rug • Swipe • Ape →</p>
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
// COIN DETAIL MODAL WITH TRADINGVIEW CHART
// ============================================================================

const CoinDetailModal = ({ coin, onClose, onApe, onRug }) => {
  // Get full TradingView symbol - multi-exchange support
  const tvSymbol = getTradingViewSymbol(coin);
  const risk = getRiskLevel(coin.market_cap);
  const vibes = getVibes(coin);
  const isPositive = coin.price_change_percentage_24h >= 0;
  const [shareStatus, setShareStatus] = useState(null); // 'copied' or 'shared'

  // Share card functionality
  const handleShare = async () => {
    const shareText = `🦍 I'm watching $${coin.symbol?.toUpperCase()} on Swipefolio!\n\n` +
      `💰 ${formatPrice(coin.current_price)}\n` +
      `${isPositive ? '📈' : '📉'} ${isPositive ? '+' : ''}${coin.price_change_percentage_24h?.toFixed(2)}% (24h)\n` +
      `🏆 Rank #${coin.market_cap_rank}\n\n` +
      `Swipe to discover crypto & stocks! 🚀`;

    const shareUrl = coin.isStock
      ? `https://finance.yahoo.com/quote/${coin.symbol?.toUpperCase()}`
      : `https://www.coingecko.com/en/coins/${coin.id}`;

    // Try native Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${coin.name} ($${coin.symbol?.toUpperCase()})`,
          text: shareText,
          url: shareUrl
        });
        setShareStatus('shared');
        setTimeout(() => setShareStatus(null), 2000);
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log('Share failed, falling back to clipboard');
        }
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setShareStatus('copied');
      setTimeout(() => setShareStatus(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/95 backdrop-blur-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-hidden border border-white/10 shadow-2xl flex flex-col"
        style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(139,92,246,0.1)' }}
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden">
              <img src={coin.image} alt={coin.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{coin.name}</h2>
              <p className="text-slate-400 text-sm">${coin.symbol?.toUpperCase()} • #{coin.market_cap_rank}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition text-2xl"
          >
            ✕
          </button>
        </div>

        {/* TradingView Chart - Uses advanced chart with symbol search enabled */}
        <div className="h-[400px] sm:h-[450px] bg-slate-950">
          <iframe
            src={`https://www.tradingview.com/widgetembed/?symbol=${tvSymbol}&interval=60&symboledit=1&saveimage=0&toolbarbg=0f172a&studies=[]&theme=dark&style=1&timezone=exchange&withdateranges=1&studies_overrides={}&overrides={}&enabled_features=["header_symbol_search"]&disabled_features=["header_compare"]&locale=en&utm_source=swipefolio`}
            style={{ width: '100%', height: '100%' }}
            frameBorder="0"
            allowTransparency="true"
            scrolling="no"
            allowFullScreen
          />
        </div>

        {/* Price & Stats */}
        <div className="p-4 space-y-4 overflow-auto flex-1">
          {/* Current Price */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-black">{formatPrice(coin.current_price)}</p>
              <p className={`text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}% (24h)
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-lg ${risk.bg}`}>
              <span className={`font-bold ${risk.color}`}>{risk.emoji} {risk.label}</span>
            </div>
          </div>

          {/* Vibes */}
          {vibes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {vibes.map((vibe, i) => (
                <span key={i} className={`bg-gradient-to-r ${vibe.color} px-3 py-1.5 rounded-full text-xs font-bold`}>
                  {vibe.emoji} {vibe.text}
                </span>
              ))}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/60 p-3 rounded-xl">
              <p className="text-slate-500 text-xs">Market Cap</p>
              <p className="font-bold text-lg">{formatNumber(coin.market_cap)}</p>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl">
              <p className="text-slate-500 text-xs">24h Volume</p>
              <p className="font-bold text-lg">{formatNumber(coin.total_volume)}</p>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl">
              <p className="text-slate-500 text-xs">24h High</p>
              <p className="font-bold text-lg">{formatPrice(coin.high_24h || coin.current_price * 1.02)}</p>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl">
              <p className="text-slate-500 text-xs">24h Low</p>
              <p className="font-bold text-lg">{formatPrice(coin.low_24h || coin.current_price * 0.98)}</p>
            </div>
          </div>

          {/* External Links */}
          <div className="flex gap-2">
            <a
              href={coin.isStock
                ? `https://finance.yahoo.com/quote/${coin.symbol?.toUpperCase()}`
                : `https://www.coingecko.com/en/coins/${coin.id}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-slate-800 py-2 rounded-lg text-center text-sm font-medium hover:bg-slate-700 transition"
            >
              {coin.isStock ? 'Yahoo Finance ↗' : 'CoinGecko ↗'}
            </a>
            <a
              href={`https://www.tradingview.com/chart/?symbol=${tvSymbol}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-slate-800 py-2 rounded-lg text-center text-sm font-medium hover:bg-slate-700 transition"
            >
              TradingView ↗
            </a>
          </div>

          {/* BUY NOW - Referral links with coin name visible */}
          <div className="flex gap-2">
            {coin.isStock ? (
              <>
                <a
                  href={AFFILIATE_LINKS.robinhood}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-xl text-center font-bold shadow-lg transition hover:opacity-90 bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/30 text-sm"
                >
                  💰 Buy {coin.symbol?.toUpperCase()} on Robinhood
                </a>
                <a
                  href={AFFILIATE_LINKS.webull}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-xl text-center font-bold shadow-lg transition hover:opacity-90 bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-500/30 text-sm"
                >
                  📈 Webull
                </a>
              </>
            ) : (
              <>
                <a
                  href={AFFILIATE_LINKS.coinbase}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-xl text-center font-bold shadow-lg transition hover:opacity-90 bg-gradient-to-r from-blue-500 to-cyan-500 shadow-blue-500/30 text-sm"
                >
                  💰 Buy {coin.symbol?.toUpperCase()} on Coinbase
                </a>
                <a
                  href={AFFILIATE_LINKS.binance}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-xl text-center font-bold shadow-lg transition hover:opacity-90 bg-gradient-to-r from-yellow-500 to-orange-500 shadow-yellow-500/30 text-black text-sm"
                >
                  📊 Binance
                </a>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-white/10 flex gap-3">
          <button
            onClick={() => { onRug(); onClose(); }}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
          >
            <span className="text-xl">🚫</span> RUG
          </button>
          <button
            onClick={handleShare}
            className="bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-500 px-4 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
          >
            {shareStatus === 'copied' ? (
              <><span className="text-xl">✓</span> Copied!</>
            ) : shareStatus === 'shared' ? (
              <><span className="text-xl">✓</span> Shared!</>
            ) : (
              <><span className="text-xl">📤</span> Share</>
            )}
          </button>
          <button
            onClick={() => { onApe(); onClose(); }}
            className="flex-1 bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
          >
            <span className="text-xl">🦍</span> APE
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// FEAR & GREED INDEX COMPONENT
// ============================================================================

const FearGreedIndex = ({ value, label }) => {
  const getColor = (val) => {
    if (val <= 25) return 'text-red-500';
    if (val <= 45) return 'text-orange-500';
    if (val <= 55) return 'text-yellow-500';
    if (val <= 75) return 'text-lime-500';
    return 'text-green-500';
  };

  const getEmoji = (val) => {
    if (val <= 25) return '😱';
    if (val <= 45) return '😰';
    if (val <= 55) return '😐';
    if (val <= 75) return '😊';
    return '🤑';
  };

  if (!value) return null;

  return (
    <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full text-sm">
      <span>{getEmoji(value)}</span>
      <span className={`font-bold ${getColor(value)}`}>{value}</span>
      <span className="text-slate-400 hidden sm:inline">{label}</span>
    </div>
  );
};

// ============================================================================
// DAILY PREDICTION COMPONENT
// ============================================================================

const DailyPrediction = ({ coins, onVote, userVote }) => {
  // Pick a featured coin for today's prediction (consistent per day)
  const today = new Date().toISOString().split('T')[0];
  const dayHash = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0);

  const trendingCoins = coins.filter(c =>
    Math.abs(c.price_change_percentage_24h) > 3 && c.market_cap > 1000000000
  );
  const featuredCoin = trendingCoins[dayHash % Math.max(1, trendingCoins.length)] || coins[0];

  if (!featuredCoin) return null;

  // Generate prediction target based on current price and momentum
  const isUp = featuredCoin.price_change_percentage_24h > 0;
  const targetMove = isUp ? 10 : -10;
  const targetPrice = featuredCoin.current_price * (1 + targetMove / 100);

  // Simulated community votes (seeded by coin + date)
  const voteHash = (featuredCoin.id + today).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const baseApeVotes = 50 + (voteHash % 30);
  const apeVotes = userVote === 'ape' ? baseApeVotes + 1 : baseApeVotes;
  const rugVotes = 100 - apeVotes + (userVote === 'rug' ? 1 : 0);
  const totalVotes = apeVotes + rugVotes;
  const apePercent = Math.round((apeVotes / totalVotes) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm rounded-2xl p-4 border border-blue-500/20"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎲</span>
          <span className="font-bold text-sm">Daily Prediction</span>
        </div>
        <span className="text-xs text-slate-400">🏆 Win points!</span>
      </div>

      <p className="text-sm text-slate-300 mb-3">
        Will <span className="font-bold text-blue-300">${featuredCoin.symbol.toUpperCase()}</span> hit{' '}
        <span className="font-bold text-white">{formatPrice(targetPrice)}</span> this week?
      </p>

      {/* Vote bars */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs w-16">🦍 APE</span>
          <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${apePercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs font-bold text-green-400 w-10 text-right">{apePercent}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs w-16">🚫 RUG</span>
          <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 to-pink-400"
              initial={{ width: 0 }}
              animate={{ width: `${100 - apePercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs font-bold text-red-400 w-10 text-right">{100 - apePercent}%</span>
        </div>
      </div>

      {/* Vote buttons or status */}
      {!userVote ? (
        <div className="flex gap-2">
          <button
            onClick={() => onVote('ape')}
            className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 py-2 rounded-lg text-sm font-bold transition"
          >
            🦍 APE
          </button>
          <button
            onClick={() => onVote('rug')}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 py-2 rounded-lg text-sm font-bold transition"
          >
            🚫 RUG
          </button>
        </div>
      ) : (
        <div className="text-center py-2 bg-slate-800/50 rounded-lg">
          <p className="text-sm">
            Your prediction: <span className={userVote === 'ape' ? 'text-green-400' : 'text-red-400'}>
              {userVote === 'ape' ? '🦍 APE' : '🚫 RUG'}
            </span> ✓
          </p>
          <p className="text-xs text-slate-500 mt-1">Results in {7 - new Date().getDay()} days</p>
        </div>
      )}

      <p className="text-xs text-slate-500 text-center mt-2">
        {totalVotes.toLocaleString()} traders voted
      </p>
    </motion.div>
  );
};

// ============================================================================
// STREAK BADGE COMPONENT
// ============================================================================

const StreakBadge = ({ streak, compact = false }) => {
  if (!streak || streak.currentStreak === 0) {
    if (compact) return null;
    return (
      <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5 text-center">
        <p className="text-slate-500 text-xs">Swipe daily to build your streak!</p>
      </div>
    );
  }

  const getStreakEmoji = (days) => {
    if (days >= 30) return '👑';
    if (days >= 14) return '💎';
    if (days >= 7) return '🔥';
    if (days >= 3) return '⚡';
    return '✨';
  };

  const getStreakColor = (days) => {
    if (days >= 30) return 'from-yellow-500 to-orange-500';
    if (days >= 14) return 'from-cyan-500 to-blue-500';
    if (days >= 7) return 'from-orange-500 to-red-500';
    if (days >= 3) return 'from-blue-500 to-cyan-500';
    return 'from-slate-500 to-slate-400';
  };

  const getStreakLabel = (days) => {
    if (days >= 30) return 'Legend';
    if (days >= 14) return 'Diamond';
    if (days >= 7) return 'On Fire';
    if (days >= 3) return 'Rising';
    return 'Starting';
  };

  if (compact) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${getStreakColor(streak.currentStreak)}`}
      >
        <span className="text-sm">{getStreakEmoji(streak.currentStreak)}</span>
        <span className="font-bold text-sm">{streak.currentStreak}</span>
        <span className="text-[10px] opacity-80">day{streak.currentStreak !== 1 ? 's' : ''}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 rounded-xl p-4 border border-white/5"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm flex items-center gap-2">
          {getStreakEmoji(streak.currentStreak)} Daily Streak
        </h3>
        {streak.isActive && (
          <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
            Active today
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="text-center flex-1">
          <p className={`text-3xl font-black bg-gradient-to-r ${getStreakColor(streak.currentStreak)} bg-clip-text text-transparent`}>
            {streak.currentStreak}
          </p>
          <p className="text-slate-500 text-[10px]">Current</p>
        </div>
        <div className="text-center flex-1 border-l border-white/10">
          <p className="text-xl font-bold text-slate-300">{streak.longestStreak || 0}</p>
          <p className="text-slate-500 text-[10px]">Best</p>
        </div>
        <div className="text-center flex-1 border-l border-white/10">
          <p className="text-xl font-bold text-slate-300">{streak.totalActiveDays || 0}</p>
          <p className="text-slate-500 text-[10px]">Total Days</p>
        </div>
      </div>

      <div className={`text-center py-2 rounded-lg bg-gradient-to-r ${getStreakColor(streak.currentStreak)} bg-opacity-20`}>
        <span className="text-sm font-bold">{getStreakLabel(streak.currentStreak)} Status</span>
      </div>
    </motion.div>
  );
};

// ============================================================================
// LEADERBOARD COMPONENT
// ============================================================================

const Leaderboard = ({ portfolio, user, leaderboardData, userRankData }) => {
  // Fallback fake traders when no real data
  const fakeTraders = [
    { displayName: 'DiamondHands', totalSwipes: 127, apeRate: 78 },
    { displayName: 'DeFiDegen', totalSwipes: 89, apeRate: 65 },
    { displayName: 'MoonBoy', totalSwipes: 72, apeRate: 82 },
    { displayName: 'CryptoKing', totalSwipes: 58, apeRate: 71 },
    { displayName: 'ApeStrong', totalSwipes: 45, apeRate: 90 },
  ];

  // Use real data or fallback
  const traders = leaderboardData?.length > 0 ? leaderboardData : fakeTraders;
  const isRealData = leaderboardData?.length > 0;

  // User rank from real data or estimated
  const userRank = userRankData?.rank || (portfolio.length > 0 ? Math.floor(Math.random() * 50) + 10 : null);
  const userSwipes = userRankData?.totalSwipes || portfolio.length;

  // Generate avatar based on ape rate
  const getAvatar = (apeRate) => {
    if (apeRate >= 80) return '🦍';
    if (apeRate >= 60) return '💎';
    if (apeRate >= 40) return '📊';
    return '🎯';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-4 border border-white/5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <span className="font-bold text-sm">Top Swipers</span>
          {isRealData && (
            <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-semibold">LIVE</span>
          )}
        </div>
        <span className="text-xs text-slate-400">All Time</span>
      </div>

      {/* Top 3 */}
      <div className="space-y-2 mb-3">
        {traders.slice(0, 3).map((trader, i) => (
          <div key={trader.id || trader.displayName} className="flex items-center gap-3">
            <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
            {trader.photoURL ? (
              <img src={trader.photoURL} alt="" className="w-5 h-5 rounded-full" />
            ) : (
              <span className="text-sm">{getAvatar(trader.apeRate)}</span>
            )}
            <span className="text-sm font-medium flex-1 truncate">
              {trader.displayName?.split(' ')[0] || 'Anonymous'}
            </span>
            <div className="text-right">
              <span className="text-cyan-400 text-sm font-bold">{trader.totalSwipes}</span>
              <span className="text-slate-500 text-[10px] ml-1">swipes</span>
            </div>
          </div>
        ))}
      </div>

      {/* More traders */}
      {traders.length > 3 && (
        <div className="space-y-1.5 mb-3 pt-2 border-t border-white/5">
          {traders.slice(3, 5).map((trader, i) => (
            <div key={trader.id || trader.displayName} className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-5 text-center">#{i + 4}</span>
              <span className="flex-1 truncate">{trader.displayName?.split(' ')[0] || 'Anonymous'}</span>
              <span className="text-cyan-400/70">{trader.totalSwipes}</span>
            </div>
          ))}
        </div>
      )}

      {/* User rank */}
      {user ? (
        <div className="bg-blue-500/20 rounded-lg p-2 flex items-center gap-3 border border-blue-500/30">
          <span className="text-sm font-bold text-blue-400">#{userRank || '?'}</span>
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full" />
          ) : (
            <span className="text-sm">😎</span>
          )}
          <span className="text-sm font-medium flex-1">You</span>
          <div className="text-right">
            <span className="text-cyan-400 text-sm font-bold">{userSwipes}</span>
            <span className="text-slate-500 text-[10px] ml-1">swipes</span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-700/30 rounded-lg p-2 text-center border border-white/5">
          <span className="text-xs text-slate-400">Sign in to see your rank</span>
        </div>
      )}
    </motion.div>
  );
};

// ============================================================================
// LANDING PAGE COMPONENT
// ============================================================================

const LandingPage = ({ onStart, stats }) => {
  // Floating emojis for epic vibes
  const floatingEmojis = useMemo(() => [
    { emoji: '🚀', left: '10%', delay: 0 },
    { emoji: '💎', left: '25%', delay: 0.5 },
    { emoji: '🦍', left: '40%', delay: 1 },
    { emoji: '📈', left: '55%', delay: 1.5 },
    { emoji: '🔥', left: '70%', delay: 2 },
    { emoji: '⭐', left: '85%', delay: 2.5 },
    { emoji: '💰', left: '15%', delay: 0.3 },
    { emoji: '🎯', left: '80%', delay: 1.2 },
  ], []);

  return (
    <div className="min-h-screen text-white overflow-hidden relative">
      {/* Video Starfield Background */}
      <VideoBackground />

      {/* Content wrapper with z-index above video */}
      <div className="relative z-10 min-h-screen flex flex-col">

      {/* Floating Emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingEmojis.map((item, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            style={{ left: item.left, bottom: '-60px' }}
            animate={{
              y: [0, -window.innerHeight - 100],
              rotate: [0, 360],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              delay: item.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {item.emoji}
          </motion.div>
        ))}
      </div>

      <FloatingSparkles count={15} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Logo with glow pulse */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="mb-8 relative"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl blur-xl"
          />
          <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl"
            >
              🪙
            </motion.span>
          </div>
        </motion.div>

        {/* Title - Finex style with gradient accent */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-display font-bold text-center mb-4 tracking-tight"
        >
          <span className="text-white">Swipe. Match. </span>
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Invest.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl text-slate-400 text-center mb-8 max-w-lg leading-relaxed"
        >
          Discover crypto & stocks. Match with like-minded investors.
          <br className="hidden sm:block" />
          Build your portfolio together.
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
              <p className="text-3xl font-black text-blue-400">{stats.totalSwipes || 0}</p>
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

        {/* CTA Button - Finex-style with shimmer */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          onClick={onStart}
          className="relative group px-12 py-5 rounded-2xl font-display font-bold text-xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #5b8aff 0%, #76ddff 100%)',
            boxShadow: '0 20px 40px -10px rgba(91,138,255,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset',
          }}
        >
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
          {/* Glow effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
            style={{ boxShadow: '0 0 40px rgba(118,221,255,0.6)' }}
          />
          <span className="relative z-10 flex items-center gap-2">
            Start Swiping
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              🚀
            </motion.span>
          </span>
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

        {/* How PnL Works - Info Banner */}
        {positions.length > 0 && (
          <div className="mx-4 mb-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-300 text-xs text-center">
              📊 <span className="font-medium">Paper Trading:</span> Swipe right = Entry price saved • PnL updates every 30 sec
            </p>
          </div>
        )}
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
              className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 rounded-xl font-bold hover:opacity-90 transition"
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
                  href={pos.isStock
                    ? AFFILIATE_LINKS.robinhood
                    : `${AFFILIATE_LINKS.coinbase}?entry=portfolio_${pos.symbol}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 py-2 rounded-lg font-medium text-center text-sm hover:opacity-90 transition ${
                    pos.isStock
                      ? 'bg-gradient-to-r from-green-600 to-green-500'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500'
                  }`}
                >
                  {pos.isStock ? 'Buy on Robinhood' : 'Buy Real'}
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

      {/* Exchange CTAs - Dynamic based on portfolio content */}
      {positions.length > 0 && (() => {
        const hasStocks = positions.some(p => p.isStock);
        const hasCrypto = positions.some(p => !p.isStock);
        return (
          <div className="sticky bottom-0 p-4 bg-slate-900/95 backdrop-blur-sm border-t border-white/10">
            <p className="text-center text-slate-500 text-sm mb-3">
              Ready to ape for real? 💰
            </p>
            <div className="grid grid-cols-3 gap-2">
              {hasCrypto ? (
                <>
                  <a href={AFFILIATE_LINKS.coinbase} target="_blank" rel="noopener noreferrer"
                    className="bg-blue-600 py-3 rounded-xl text-center font-bold hover:bg-blue-700 transition text-sm">
                    Coinbase
                  </a>
                  <a href={AFFILIATE_LINKS.binance} target="_blank" rel="noopener noreferrer"
                    className="bg-yellow-500 text-black py-3 rounded-xl text-center font-bold hover:bg-yellow-400 transition text-sm">
                    Binance
                  </a>
                  <a href={AFFILIATE_LINKS.bybit} target="_blank" rel="noopener noreferrer"
                    className="bg-orange-500 py-3 rounded-xl text-center font-bold hover:bg-orange-600 transition text-sm">
                    Bybit
                  </a>
                </>
              ) : (
                <>
                  <a href={AFFILIATE_LINKS.robinhood} target="_blank" rel="noopener noreferrer"
                    className="bg-green-500 py-3 rounded-xl text-center font-bold hover:bg-green-400 transition text-sm">
                    Robinhood
                  </a>
                  <a href={AFFILIATE_LINKS.webull} target="_blank" rel="noopener noreferrer"
                    className="bg-orange-500 py-3 rounded-xl text-center font-bold hover:bg-orange-400 transition text-sm">
                    Webull
                  </a>
                  <a href={AFFILIATE_LINKS.etoro} target="_blank" rel="noopener noreferrer"
                    className="bg-emerald-600 py-3 rounded-xl text-center font-bold hover:bg-emerald-500 transition text-sm">
                    eToro
                  </a>
                </>
              )}
            </div>
            {hasStocks && hasCrypto && (
              <p className="text-center text-slate-600 text-xs mt-2">
                You have both stocks & crypto - browse more options above!
              </p>
            )}
          </div>
        );
      })()}
    </div>
  );
};

// ============================================================================
// PREMIUM UPSELL MODAL
// ============================================================================

const PremiumModal = ({ onClose, swipesUsed, assetType }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-6 max-w-sm w-full border border-blue-500/30 shadow-2xl"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Crown icon */}
        <div className="text-center mb-4">
          <span className="text-6xl">👑</span>
        </div>

        <h2 className="text-2xl font-black text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          You're on Fire!
        </h2>

        <p className="text-slate-400 text-center mb-4">
          You've used all {FREE_DAILY_SWIPES} free swipes today. Upgrade to Premium for unlimited swiping!
        </p>

        {/* Premium features */}
        <div className="bg-slate-800/50 rounded-2xl p-4 mb-4 border border-white/5">
          <p className="text-sm font-bold text-blue-400 mb-3">Premium Features:</p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Unlimited daily swipes
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Advanced filters (market cap, volume)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Price alerts & notifications
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Export portfolio to CSV
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span> No ads
            </li>
          </ul>
        </div>

        {/* Price */}
        <div className="text-center mb-4">
          <span className="text-3xl font-black text-white">{PREMIUM_PRICE}</span>
          <p className="text-slate-500 text-sm">Cancel anytime</p>
        </div>

        {/* CTA Buttons */}
        <button
          onClick={() => {
            // TODO: Integrate with Google Play Billing
            alert('Premium coming soon! For now, enjoy unlimited swipes 🎉');
            localStorage.setItem('swipefolio_premium', 'true');
            onClose();
          }}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 py-3 rounded-xl font-bold text-lg mb-3 hover:opacity-90 transition"
        >
          Upgrade to Premium
        </button>

        <button
          onClick={onClose}
          className="w-full text-slate-500 py-2 text-sm hover:text-slate-300 transition"
        >
          Maybe later
        </button>

        {/* Or trade now */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-slate-500 text-center mb-2">Or start trading now:</p>
          <div className="flex gap-2">
            {assetType === 'crypto' ? (
              <>
                <a href={AFFILIATE_LINKS.coinbase} target="_blank" rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 py-2 rounded-lg text-center text-xs font-bold hover:bg-blue-500 transition">
                  Coinbase
                </a>
                <a href={AFFILIATE_LINKS.binance} target="_blank" rel="noopener noreferrer"
                  className="flex-1 bg-yellow-500 text-black py-2 rounded-lg text-center text-xs font-bold hover:bg-yellow-400 transition">
                  Binance
                </a>
              </>
            ) : (
              <>
                <a href={AFFILIATE_LINKS.robinhood} target="_blank" rel="noopener noreferrer"
                  className="flex-1 bg-green-500 py-2 rounded-lg text-center text-xs font-bold hover:bg-green-400 transition">
                  Robinhood
                </a>
                <a href={AFFILIATE_LINKS.webull} target="_blank" rel="noopener noreferrer"
                  className="flex-1 bg-orange-500 py-2 rounded-lg text-center text-xs font-bold hover:bg-orange-400 transition">
                  Webull
                </a>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// AD BANNER COMPONENT (placeholder for AdMob)
// ============================================================================

const AdBanner = ({ slot = 'bottom' }) => {
  // This is a placeholder - replace with actual AdMob component
  // For React: use @react-native-admob/admob or react-native-google-mobile-ads
  return (
    <div className="bg-slate-800/50 border border-white/5 rounded-lg p-2 text-center">
      <p className="text-slate-600 text-xs">
        {/* AdMob Banner - slot: {slot} */}
        <a
          href={AFFILIATE_LINKS.coinbase}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300"
        >
          Start trading on Coinbase →
        </a>
      </p>
    </div>
  );
};

// ============================================================================
// BOTTOM NAVIGATION COMPONENT
// ============================================================================

const BottomNav = ({ activeTab, onTabChange, portfolioCount, isPremium }) => {
  const tabs = [
    { id: 'discover', icon: '🔥', label: 'Discover' },
    { id: 'portfolio', icon: '💼', label: 'Portfolio', badge: portfolioCount },
    { id: 'community', icon: '🏆', label: 'Community' },
    { id: 'account', icon: '👤', label: 'Account', premium: isPremium },
  ];

  return (
    <nav
      className="relative z-20 flex justify-around items-center px-2 py-2 border-t border-white/10 shrink-0"
      style={{
        background: 'rgba(15,23,42,0.95)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {tabs.map(tab => (
        <motion.button
          key={tab.id}
          whileTap={{ scale: 0.9 }}
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all relative ${
            activeTab === tab.id
              ? 'text-blue-400'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-blue-500/10 rounded-xl"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <span className="text-xl relative">
            {tab.icon}
            {tab.badge > 0 && (
              <span className="absolute -top-1 -right-2 bg-green-500 text-white text-[10px] font-bold px-1.5 rounded-full">
                {tab.badge}
              </span>
            )}
            {tab.premium && (
              <span className="absolute -top-1 -right-2 text-yellow-400 text-[10px]">⭐</span>
            )}
          </span>
          <span className="text-[10px] font-medium relative">{tab.label}</span>
        </motion.button>
      ))}
    </nav>
  );
};

// ============================================================================
// ACCOUNT TAB COMPONENT
// ============================================================================

// Investment Style Options
const INVESTMENT_STYLES = [
  { id: 'diamond', emoji: '💎', label: 'Diamond Hands', desc: 'HODL forever, never sell' },
  { id: 'degen', emoji: '🦍', label: 'Degen Ape', desc: 'High risk, high reward' },
  { id: 'swing', emoji: '📊', label: 'Swing Trader', desc: 'Ride the waves' },
  { id: 'value', emoji: '🎯', label: 'Value Hunter', desc: 'Undervalued gems only' },
  { id: 'whale', emoji: '🐋', label: 'Whale Watcher', desc: 'Follow the big money' },
  { id: 'meme', emoji: '🚀', label: 'Meme Lord', desc: 'DOGE, PEPE, BONK life' },
];

const AccountTab = ({ isPremium, onUpgrade, swipesToday, stats, user, onUserChange, userProfile, onProfileUpdate, userStreak, notificationSettings, onEnableNotifications }) => {
  const [showSignUp, setShowSignUp] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(userProfile?.investmentStyle || null);
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [editingBio, setEditingBio] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  // Update investment style
  const handleStyleSelect = async (styleId) => {
    setSelectedStyle(styleId);
    if (user && onProfileUpdate) {
      await onProfileUpdate({ investmentStyle: styleId });
    }
  };

  // Save bio
  const handleSaveBio = async () => {
    if (user && onProfileUpdate) {
      await onProfileUpdate({ bio });
      setEditingBio(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const { user: newUser, error: authError } = await signInWithGoogle();
    setLoading(false);
    if (authError) {
      setError(authError);
    } else if (newUser) {
      setShowSignUp(false);
      onUserChange(newUser);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    setError('');
    const { user: newUser, error: authError } = await signInWithApple();
    setLoading(false);
    if (authError) {
      setError(authError);
    } else if (newUser) {
      setShowSignUp(false);
      onUserChange(newUser);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    setError('');
    const { user: newUser, error: authError } = await signInWithEmail(email, password);
    setLoading(false);
    if (authError) {
      setError(authError);
    } else if (newUser) {
      setShowSignUp(false);
      setShowEmailForm(false);
      onUserChange(newUser);
    }
  };

  const handleSignOut = async () => {
    await logOut();
    onUserChange(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Profile Section */}
      <div className="bg-slate-800/50 rounded-2xl p-4 mb-4 border border-white/5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-3xl overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              '👤'
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user?.displayName || 'Guest User'}</h2>
            <p className="text-slate-400 text-sm">
              {user?.email || 'Sign up to sync across devices'}
            </p>
          </div>
        </div>
        {user ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className="w-full bg-slate-700 py-3 rounded-xl font-bold hover:bg-slate-600 transition"
          >
            Sign Out
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSignUp(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 py-3 rounded-xl font-bold"
          >
            Create Account
          </motion.button>
        )}
      </div>

      {/* Premium Status */}
      <div className={`rounded-2xl p-4 mb-4 border ${
        isPremium
          ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
          : 'bg-slate-800/50 border-white/5'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold flex items-center gap-2">
              {isPremium ? '⭐ Premium Member' : '🆓 Free Plan'}
            </h3>
            <p className="text-slate-400 text-sm">
              {isPremium ? 'Unlimited swipes, no ads' : `${FREE_DAILY_SWIPES - swipesToday} swipes left today`}
            </p>
          </div>
          {!isPremium && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onUpgrade}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 rounded-xl text-sm font-bold"
            >
              Upgrade
            </motion.button>
          )}
        </div>
        {!isPremium && (
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
              style={{ width: `${(swipesToday / FREE_DAILY_SWIPES) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-slate-800/50 rounded-2xl p-4 mb-4 border border-white/5">
        <h3 className="font-bold mb-3">Your Stats</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-black text-blue-400">{stats.aped + stats.rugged}</p>
            <p className="text-slate-500 text-xs">Total Swipes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-green-400">{stats.aped}</p>
            <p className="text-slate-500 text-xs">Apes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-blue-400">{stats.superAped || 0}</p>
            <p className="text-slate-500 text-xs">Super Apes</p>
          </div>
        </div>
      </div>

      {/* Daily Streak */}
      {user && (
        <div className="mb-4">
          <StreakBadge streak={userStreak} />
        </div>
      )}

      {/* Investment Style */}
      {user && (
        <div className="bg-slate-800/50 rounded-2xl p-4 mb-4 border border-white/5">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            Investment Style
            {selectedStyle && (
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                {INVESTMENT_STYLES.find(s => s.id === selectedStyle)?.emoji}
              </span>
            )}
          </h3>
          <p className="text-slate-400 text-xs mb-3">Choose your trading personality</p>
          <div className="grid grid-cols-2 gap-2">
            {INVESTMENT_STYLES.map(style => (
              <motion.button
                key={style.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStyleSelect(style.id)}
                className={`p-3 rounded-xl text-left transition-all ${
                  selectedStyle === style.id
                    ? 'bg-blue-500/20 border-2 border-blue-500'
                    : 'bg-slate-700/50 border-2 border-transparent hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{style.emoji}</span>
                  <span className="font-bold text-sm">{style.label}</span>
                </div>
                <p className="text-slate-400 text-[10px]">{style.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Bio Section */}
      {user && (
        <div className="bg-slate-800/50 rounded-2xl p-4 mb-4 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Bio</h3>
            {!editingBio && (
              <button
                onClick={() => setEditingBio(true)}
                className="text-blue-400 text-xs hover:underline"
              >
                Edit
              </button>
            )}
          </div>
          {editingBio ? (
            <div className="space-y-2">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 160))}
                placeholder="Tell others about your investment journey..."
                className="w-full h-20 bg-slate-700/50 rounded-xl p-3 text-sm border border-white/10 focus:outline-none focus:border-blue-500 resize-none"
                maxLength={160}
              />
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs">{bio.length}/160</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingBio(false); setBio(userProfile?.bio || ''); }}
                    className="px-3 py-1 text-slate-400 text-sm hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBio}
                    className="px-4 py-1 bg-blue-500 rounded-lg text-sm font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-300 text-sm">
              {bio || <span className="text-slate-500 italic">No bio yet. Tell others about yourself!</span>}
            </p>
          )}
        </div>
      )}

      {/* Settings */}
      <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5">
        <h3 className="font-bold mb-3">Settings</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <div>
              <span className="text-slate-300">Push Notifications</span>
              <p className="text-slate-500 text-xs mt-0.5">Price alerts, streak reminders</p>
            </div>
            {user ? (
              notificationSettings?.notificationsEnabled ? (
                <span className="text-green-400 text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Enabled
                </span>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    setNotifLoading(true);
                    await onEnableNotifications();
                    setNotifLoading(false);
                  }}
                  disabled={notifLoading}
                  className="px-3 py-1 bg-blue-500 rounded-lg text-xs font-medium disabled:opacity-50"
                >
                  {notifLoading ? 'Enabling...' : 'Enable'}
                </motion.button>
              )
            ) : (
              <span className="text-slate-500 text-xs">Sign in first</span>
            )}
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-slate-300">Dark Mode</span>
            <span className="text-green-400">✓ Always</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-slate-300">Version</span>
            <span className="text-slate-500">1.0.0</span>
          </div>
        </div>
      </div>

      {/* Sign Up Modal */}
      <AnimatePresence>
        {showSignUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => { setShowSignUp(false); setShowEmailForm(false); setError(''); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 rounded-2xl p-6 w-full max-w-sm border border-white/10"
            >
              <h2 className="text-2xl font-bold mb-4 text-center">Join Swipefolio</h2>
              <p className="text-slate-400 text-center mb-6">Sign up to sync your portfolio and match with other investors!</p>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              {showEmailForm ? (
                <form onSubmit={handleEmailSignIn} className="space-y-3">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 py-3 rounded-xl font-medium disabled:opacity-50"
                  >
                    {loading ? 'Signing in...' : 'Continue'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    className="w-full text-slate-400 text-sm hover:text-white"
                  >
                    ← Back to options
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleAppleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 rounded-xl font-medium hover:bg-slate-100 transition disabled:opacity-50"
                  >
                    <span>🍎</span> Continue with Apple
                  </button>
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-blue-600 py-3 rounded-xl font-medium hover:bg-blue-500 transition disabled:opacity-50"
                  >
                    <span>G</span> Continue with Google
                  </button>
                  <button
                    onClick={() => setShowEmailForm(true)}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-slate-800 py-3 rounded-xl font-medium hover:bg-slate-700 transition border border-white/10 disabled:opacity-50"
                  >
                    <span>✉️</span> Continue with Email
                  </button>
                </div>
              )}

              <p className="text-slate-600 text-xs text-center mt-4">
                By signing up, you agree to our Terms & Privacy Policy
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// COMMUNITY TAB COMPONENT
// ============================================================================

// Chat moderation utilities
const BANNED_WORDS = [
  // Profanity
  'fuck', 'shit', 'ass', 'bitch', 'dick', 'porn', 'xxx', 'cock', 'cunt', 'pussy',
  'nigger', 'faggot', 'retard', 'kike', 'spic', 'chink',
  // Crypto scam patterns
  'scam', 'rugpull', 'rug pull', 'ponzi', 'pump and dump',
  'send btc', 'send eth', 'send sol', 'send usdt', 'send crypto',
  'double your', 'guaranteed profit', 'guaranteed returns', '100x guaranteed',
  'dm me for', 'message me for', 'contact me for',
  'whatsapp', 'telegram group', 'join my group', 'private group',
  'free money', 'free crypto', 'free bitcoin', 'giveaway',
  'investment opportunity', 'make money fast', 'get rich quick',
  'send me your', 'share your wallet', 'give me your seed', 'seed phrase',
  'private key', 'wallet connect', 'verify your wallet',
  'click this link', 'click here', 'bit.ly', 'tinyurl',
  'elon musk', 'official giveaway', 'airdrop claim',
  'recover your funds', 'stolen funds', 'hack recovery',
  'trust wallet support', 'metamask support', 'binance support',
  // Phishing patterns
  'customer service', 'tech support', 'account suspended',
  'verify account', 'confirm identity', 'kyc verification',
  // Spam patterns
  'follow me', 'follow for follow', 'like and subscribe',
  'check my profile', 'check my bio', 'link in bio'
];

const filterProfanity = (text) => {
  let filtered = text.toLowerCase();
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(word.replace(/\s+/g, '\\s*'), 'gi');
    if (regex.test(filtered)) {
      return { isClean: false, reason: 'Message contains inappropriate content' };
    }
  }
  return { isClean: true, filtered: text };
};

const MESSAGE_COOLDOWN = 10000; // 10 seconds between messages
const MAX_MESSAGE_LENGTH = 500;
const lastMessageTimes = new Map(); // Track per-user cooldowns

const canSendMessage = (userId) => {
  const lastTime = lastMessageTimes.get(userId) || 0;
  const now = Date.now();
  if (now - lastTime < MESSAGE_COOLDOWN) {
    const waitTime = Math.ceil((MESSAGE_COOLDOWN - (now - lastTime)) / 1000);
    return { allowed: false, waitTime };
  }
  return { allowed: true };
};

const recordMessageSent = (userId) => {
  lastMessageTimes.set(userId, Date.now());
};

const CommunityTab = ({ coins, portfolio, predictionVote, onPredictionVote, user, leaderboardData, userRankData }) => {
  const [activeSection, setActiveSection] = useState('matches');
  const [investorMatches, setInvestorMatches] = useState([]);
  const [connections, setConnections] = useState([]);
  const [matchRequests, setMatchRequests] = useState([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [dmPartner, setDmPartner] = useState(null);
  const [dmMessages, setDmMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [chatError, setChatError] = useState(null);
  const [cooldownTime, setCooldownTime] = useState(0);
  const messagesEndRef = useRef(null);

  // Follow System state
  const [followingList, setFollowingList] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [followingStatus, setFollowingStatus] = useState({}); // { [userId]: true/false }

  // Weekly Challenges state
  const [challenges, setChallenges] = useState([]);
  const [joinedChallenges, setJoinedChallenges] = useState({});
  const [challengeLeaderboards, setChallengeLeaderboards] = useState({});
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [userBadges, setUserBadges] = useState([]);

  // Load investor matches
  useEffect(() => {
    if (user && activeSection === 'matches') {
      setLoading(true);
      getInvestorMatches(user.uid).then(({ data }) => {
        setInvestorMatches(data);
        setLoading(false);
      });
    }
  }, [user, activeSection]);

  // Load connections and requests
  useEffect(() => {
    if (user && activeSection === 'connections') {
      getUserConnections(user.uid).then(({ data }) => setConnections(data));
      getMatchRequests(user.uid).then(({ data }) => setMatchRequests(data));
    }
  }, [user, activeSection]);

  // Load trending coins
  useEffect(() => {
    if (activeSection === 'trending') {
      getTrendingCoins().then(({ data }) => setTrendingCoins(data));
    }
  }, [activeSection]);

  // Load following/followers list
  useEffect(() => {
    if (user && activeSection === 'following') {
      setLoading(true);
      Promise.all([
        getFollowing(user.uid),
        getFollowers(user.uid),
        getActivityFeed(user.uid)
      ]).then(([followingRes, followersRes, feedRes]) => {
        setFollowingList(followingRes.data || []);
        setFollowersList(followersRes.data || []);
        setActivityFeed(feedRes.data || []);
        setLoading(false);
      }).catch(err => {
        console.error('Error loading follow data:', err);
        setLoading(false);
      });
    }
  }, [user, activeSection]);

  // Check following status for matches
  useEffect(() => {
    if (user && investorMatches.length > 0) {
      const checkStatus = async () => {
        const statuses = {};
        for (const match of investorMatches) {
          statuses[match.id] = await isFollowing(user.uid, match.id);
        }
        setFollowingStatus(statuses);
      };
      checkStatus();
    }
  }, [user, investorMatches]);

  // Load weekly challenges
  useEffect(() => {
    if (activeSection === 'challenges') {
      setLoading(true);
      getWeeklyChallenges().then(({ data }) => {
        setChallenges(data || []);
        setLoading(false);
      });

      // Load user badges
      if (user) {
        getUserBadges(user.uid).then(({ data }) => setUserBadges(data || []));
      }
    }
  }, [activeSection, user]);

  // Check which challenges user has joined
  useEffect(() => {
    if (user && challenges.length > 0) {
      const checkJoined = async () => {
        const joined = {};
        for (const challenge of challenges) {
          joined[challenge.id] = await hasJoinedChallenge(user.uid, challenge.id);
        }
        setJoinedChallenges(joined);
      };
      checkJoined();
    }
  }, [user, challenges]);

  // Load leaderboard for selected challenge
  useEffect(() => {
    if (selectedChallenge) {
      getChallengeLeaderboard(selectedChallenge.id).then(({ data }) => {
        setChallengeLeaderboards(prev => ({
          ...prev,
          [selectedChallenge.id]: data || []
        }));
      });
    }
  }, [selectedChallenge]);

  // Subscribe to chat room
  useEffect(() => {
    if (selectedChatRoom) {
      const unsubscribe = subscribeToChatRoom(selectedChatRoom.id, (messages) => {
        setChatMessages(messages);
      });
      return () => unsubscribe();
    }
  }, [selectedChatRoom]);

  // Subscribe to DMs
  useEffect(() => {
    if (user && dmPartner) {
      const unsubscribe = subscribeToDirectMessages(user.uid, dmPartner.id, (messages) => {
        setDmMessages(messages);
      });
      return () => unsubscribe();
    }
  }, [user, dmPartner]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, dmMessages]);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => setCooldownTime(cooldownTime - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    setChatError(null);

    // Check message length
    if (newMessage.length > MAX_MESSAGE_LENGTH) {
      setChatError(`Message too long (max ${MAX_MESSAGE_LENGTH} characters)`);
      return;
    }

    // Check rate limit
    const cooldownCheck = canSendMessage(user.uid);
    if (!cooldownCheck.allowed) {
      setCooldownTime(cooldownCheck.waitTime);
      setChatError(`Wait ${cooldownCheck.waitTime}s before sending another message`);
      return;
    }

    // Check profanity filter
    const filterResult = filterProfanity(newMessage);
    if (!filterResult.isClean) {
      setChatError(filterResult.reason);
      return;
    }

    // Record message time for rate limiting
    recordMessageSent(user.uid);

    if (selectedChatRoom) {
      await sendChatMessage(
        selectedChatRoom.id,
        user.uid,
        user.displayName,
        user.photoURL,
        newMessage.trim()
      );
    } else if (dmPartner) {
      await sendDirectMessage(user.uid, dmPartner.id, newMessage.trim());
    }
    setNewMessage('');
  };

  const handleConnect = async (targetUserId) => {
    if (!user) return;
    await sendMatchRequest(user.uid, targetUserId);
    // Refresh matches
    const { data } = await getInvestorMatches(user.uid);
    setInvestorMatches(data);
  };

  const handleAcceptRequest = async (fromUserId) => {
    if (!user) return;
    await acceptMatchRequest(fromUserId, user.uid);
    // Refresh connections and requests
    getUserConnections(user.uid).then(({ data }) => setConnections(data));
    getMatchRequests(user.uid).then(({ data }) => setMatchRequests(data));
  };

  // Follow/Unfollow handlers
  const handleFollow = async (targetUserId) => {
    if (!user) return;
    await followUser(user.uid, targetUserId);
    setFollowingStatus(prev => ({ ...prev, [targetUserId]: true }));
    // Refresh following list if on that tab
    if (activeSection === 'following') {
      const following = await getFollowing(user.uid);
      setFollowingList(following);
    }
  };

  const handleUnfollow = async (targetUserId) => {
    if (!user) return;
    await unfollowUser(user.uid, targetUserId);
    setFollowingStatus(prev => ({ ...prev, [targetUserId]: false }));
    // Refresh following list if on that tab
    if (activeSection === 'following') {
      const following = await getFollowing(user.uid);
      setFollowingList(following);
    }
  };

  // Join challenge handler
  const handleJoinChallenge = async (challengeId) => {
    if (!user) return;
    await joinChallenge(user.uid, challengeId);
    setJoinedChallenges(prev => ({ ...prev, [challengeId]: true }));
    // Refresh challenges to update participant count
    const { data } = await getWeeklyChallenges();
    setChallenges(data || []);
  };

  // Not logged in
  if (!user) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <h2 className="text-xl font-bold">Community</h2>
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-500/30 text-center">
          <div className="text-4xl mb-3">🔐</div>
          <h3 className="font-bold text-lg mb-2">Sign In to Join</h3>
          <p className="text-slate-400 text-sm mb-4">
            Sign in to match with investors, join chat rooms, and connect 1-on-1!
          </p>
        </div>

        {/* Still show daily prediction */}
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5">
          <DailyPrediction coins={coins} onVote={onPredictionVote} userVote={predictionVote} />
        </div>
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5">
          <Leaderboard portfolio={portfolio} user={user} leaderboardData={leaderboardData} userRankData={userRankData} />
        </div>
      </div>
    );
  }

  // Chat Room View
  if (selectedChatRoom) {
    return (
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <button onClick={() => setSelectedChatRoom(null)} className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {selectedChatRoom.image && (
            <img src={selectedChatRoom.image} className="w-8 h-8 rounded-full" alt="" />
          )}
          <div>
            <h3 className="font-bold">{selectedChatRoom.symbol?.toUpperCase()} Chat</h3>
            <p className="text-xs text-slate-400">{chatMessages.length} messages</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 ${msg.userId === user.uid ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 overflow-hidden">
                {msg.userPhoto ? (
                  <img src={msg.userPhoto} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm">
                    {msg.userDisplayName?.[0] || '?'}
                  </div>
                )}
              </div>
              <div className={`max-w-[70%] ${msg.userId === user.uid ? 'text-right' : ''}`}>
                <p className="text-xs text-slate-400 mb-1">{msg.userDisplayName}</p>
                <div className={`p-2 rounded-lg ${msg.userId === user.uid ? 'bg-blue-600' : 'bg-slate-700'}`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 space-y-2">
          {chatError && (
            <p className="text-red-400 text-xs">{chatError}</p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                setChatError(null);
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={cooldownTime > 0 ? `Wait ${cooldownTime}s...` : "Type a message..."}
              disabled={cooldownTime > 0}
              maxLength={MAX_MESSAGE_LENGTH}
              className="flex-1 bg-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={cooldownTime > 0}
              className="px-4 py-2 bg-blue-600 rounded-lg font-medium text-sm hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cooldownTime > 0 ? cooldownTime : 'Send'}
            </button>
          </div>
          <p className="text-xs text-slate-500">{newMessage.length}/{MAX_MESSAGE_LENGTH}</p>
        </div>
      </div>
    );
  }

  // DM View
  if (dmPartner) {
    return (
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <button onClick={() => setDmPartner(null)} className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
            {dmPartner.photoURL ? (
              <img src={dmPartner.photoURL} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm">
                {dmPartner.displayName?.[0] || '?'}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold">{dmPartner.displayName}</h3>
            <p className="text-xs text-slate-400">Direct Message</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {dmMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === user.uid ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-lg ${msg.from === user.uid ? 'bg-blue-600' : 'bg-slate-700'}`}>
                <p className="text-sm">{msg.message}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 space-y-2">
          {chatError && (
            <p className="text-red-400 text-xs">{chatError}</p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                setChatError(null);
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={cooldownTime > 0 ? `Wait ${cooldownTime}s...` : "Type a message..."}
              disabled={cooldownTime > 0}
              maxLength={MAX_MESSAGE_LENGTH}
              className="flex-1 bg-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={cooldownTime > 0}
              className="px-4 py-2 bg-blue-600 rounded-lg font-medium text-sm hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {cooldownTime > 0 ? cooldownTime : 'Send'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">Community</h2>

      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'matches', label: 'Matches', emoji: '💙' },
          { id: 'following', label: 'Following', emoji: '👥' },
          { id: 'challenges', label: 'Challenges', emoji: '🏆' },
          { id: 'chatrooms', label: 'Chat Rooms', emoji: '💬' },
          { id: 'connections', label: 'Connections', emoji: '🤝' },
          { id: 'trending', label: 'Trending', emoji: '🔥' },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeSection === section.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {section.emoji} {section.label}
          </button>
        ))}
      </div>

      {/* Investor Matches Section */}
      {activeSection === 'matches' && (
        <div className="space-y-3">
          <p className="text-slate-400 text-sm">People who APE the same coins as you</p>
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading matches...</div>
          ) : investorMatches.length === 0 ? (
            <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-white/5">
              <div className="text-4xl mb-3">🦍</div>
              <p className="text-slate-400">Swipe more to find your matches!</p>
              <p className="text-xs text-slate-500 mt-2">APE coins to match with like-minded investors</p>
            </div>
          ) : (
            investorMatches.map((match) => (
              <div key={match.id} className="bg-slate-800/50 rounded-xl p-4 border border-white/5 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                  {match.photoURL ? (
                    <img src={match.photoURL} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">
                      {match.displayName?.[0] || '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{match.displayName}</h4>
                  <p className="text-xs text-blue-400">{match.commonCoins} coins in common</p>
                </div>
                <div className="flex gap-2">
                  {followingStatus[match.id] ? (
                    <button
                      onClick={() => handleUnfollow(match.id)}
                      className="px-3 py-1.5 bg-slate-600 rounded-lg text-sm font-medium hover:bg-slate-500 transition-colors"
                    >
                      Following
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFollow(match.id)}
                      className="px-3 py-1.5 bg-purple-600 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors"
                    >
                      Follow
                    </button>
                  )}
                  <button
                    onClick={() => handleConnect(match.id)}
                    className="px-3 py-1.5 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
                  >
                    Connect
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Following Section */}
      {activeSection === 'following' && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="flex gap-4">
            <div className="flex-1 bg-slate-800/50 rounded-xl p-4 border border-white/5 text-center">
              <p className="text-2xl font-bold text-purple-400">{followingList.length}</p>
              <p className="text-xs text-slate-400">Following</p>
            </div>
            <div className="flex-1 bg-slate-800/50 rounded-xl p-4 border border-white/5 text-center">
              <p className="text-2xl font-bold text-cyan-400">{followersList.length}</p>
              <p className="text-xs text-slate-400">Followers</p>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <span>📡</span> Activity Feed
            </h3>
            {loading ? (
              <div className="text-center py-8 text-slate-400">Loading activity...</div>
            ) : activityFeed.length === 0 ? (
              <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-white/5">
                <div className="text-4xl mb-3">📡</div>
                <p className="text-slate-400">No activity yet</p>
                <p className="text-xs text-slate-500 mt-2">Follow investors to see their swipes here!</p>
              </div>
            ) : (
              activityFeed.slice(0, 20).map((activity, idx) => (
                <div key={idx} className="bg-slate-800/50 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                    {activity.userPhotoURL ? (
                      <img src={activity.userPhotoURL} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm">
                        {activity.userDisplayName?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.userDisplayName}</span>
                      <span className="text-slate-400">
                        {activity.swipeDirection === 'right' ? ' APEd ' : ' RUGged '}
                      </span>
                      <span className="font-medium text-blue-400">${activity.coinSymbol?.toUpperCase()}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {activity.swipedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                    </p>
                  </div>
                  <span className="text-2xl">
                    {activity.swipeDirection === 'right' ? '🦍' : '🚫'}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Following List */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-400">People You Follow</h3>
            {followingList.length === 0 ? (
              <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-white/5">
                <p className="text-slate-500 text-sm">Not following anyone yet</p>
              </div>
            ) : (
              followingList.map((person) => (
                <div key={person.id} className="bg-slate-800/50 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                    {person.photoURL ? (
                      <img src={person.photoURL} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm">
                        {person.displayName?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{person.displayName}</h4>
                  </div>
                  <button
                    onClick={() => handleUnfollow(person.id)}
                    className="px-3 py-1.5 bg-slate-600 rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                  >
                    Unfollow
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Followers List */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-400">Your Followers</h3>
            {followersList.length === 0 ? (
              <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-white/5">
                <p className="text-slate-500 text-sm">No followers yet</p>
              </div>
            ) : (
              followersList.map((person) => (
                <div key={person.id} className="bg-slate-800/50 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                    {person.photoURL ? (
                      <img src={person.photoURL} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm">
                        {person.displayName?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{person.displayName}</h4>
                  </div>
                  {!followingStatus[person.id] && (
                    <button
                      onClick={() => handleFollow(person.id)}
                      className="px-3 py-1.5 bg-purple-600 rounded-lg text-xs font-medium hover:bg-purple-500 transition-colors"
                    >
                      Follow Back
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Weekly Challenges Section */}
      {activeSection === 'challenges' && (
        <div className="space-y-4">
          {/* Week indicator */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span>🏆</span> Weekly Challenges
                </h3>
                <p className="text-sm text-slate-400">Compete with the community!</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Resets in</p>
                <p className="font-mono text-yellow-400">
                  {(() => {
                    const now = new Date();
                    const dayOfWeek = now.getDay();
                    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
                    return `${daysUntilMonday}d`;
                  })()}
                </p>
              </div>
            </div>
          </div>

          {/* User Badges */}
          {userBadges.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
              <h4 className="text-sm font-medium text-slate-400 mb-3">Your Badges</h4>
              <div className="flex flex-wrap gap-2">
                {userBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full text-sm border border-purple-500/30"
                    title={badge.description}
                  >
                    {badge.emoji} {badge.title}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Challenge Cards */}
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading challenges...</div>
          ) : selectedChallenge ? (
            // Challenge Detail View with Leaderboard
            <div className="space-y-4">
              <button
                onClick={() => setSelectedChallenge(null)}
                className="flex items-center gap-2 text-slate-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Challenges
              </button>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30">
                <div className="text-center">
                  <span className="text-5xl">{selectedChallenge.emoji}</span>
                  <h3 className="font-bold text-xl mt-3">{selectedChallenge.title}</h3>
                  <p className="text-slate-400 text-sm mt-1">{selectedChallenge.description}</p>
                  <div className="mt-3 inline-block px-3 py-1 bg-yellow-500/20 rounded-full text-yellow-400 text-sm">
                    Prize: {selectedChallenge.reward}
                  </div>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <span>📊</span> Leaderboard
                </h4>
                {(challengeLeaderboards[selectedChallenge.id] || []).length === 0 ? (
                  <p className="text-center text-slate-500 py-4">No participants yet. Be the first!</p>
                ) : (
                  <div className="space-y-2">
                    {(challengeLeaderboards[selectedChallenge.id] || []).map((entry) => (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          entry.rank === 1 ? 'bg-yellow-500/20 border border-yellow-500/30' :
                          entry.rank === 2 ? 'bg-slate-400/20 border border-slate-400/30' :
                          entry.rank === 3 ? 'bg-orange-600/20 border border-orange-600/30' :
                          'bg-slate-700/50'
                        }`}
                      >
                        <span className="text-lg font-bold w-8">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                          {entry.photoURL ? (
                            <img src={entry.photoURL} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm">
                              {entry.displayName?.[0] || '?'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium truncate">{entry.displayName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{entry.score}</p>
                          <p className="text-xs text-slate-400">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Challenge List
            <div className="space-y-3">
              {challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="bg-slate-800/50 rounded-xl p-4 border border-white/5 hover:border-purple-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{challenge.emoji}</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{challenge.title}</h4>
                      <p className="text-sm text-slate-400">{challenge.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-slate-500">
                          👥 {challenge.participants || 0} joined
                        </span>
                        <span className="text-xs text-yellow-400">
                          🎁 {challenge.reward}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {joinedChallenges[challenge.id] ? (
                        <button
                          onClick={() => setSelectedChallenge(challenge)}
                          className="px-4 py-2 bg-green-600 rounded-lg text-sm font-medium hover:bg-green-500 transition-colors"
                        >
                          View
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinChallenge(challenge.id)}
                          className="px-4 py-2 bg-purple-600 rounded-lg text-sm font-medium hover:bg-purple-500 transition-colors"
                        >
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {challenges.length === 0 && (
                <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-white/5">
                  <div className="text-4xl mb-3">🏆</div>
                  <p className="text-slate-400">No active challenges</p>
                  <p className="text-xs text-slate-500 mt-2">Check back soon!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chat Rooms Section */}
      {activeSection === 'chatrooms' && (
        <div className="space-y-3">
          <p className="text-slate-400 text-sm">Join discussions about your favorite coins</p>
          {portfolio.slice(0, 10).map((pos) => (
            <button
              key={pos.id}
              onClick={() => setSelectedChatRoom({ id: pos.id, symbol: pos.symbol, image: pos.image })}
              className="w-full bg-slate-800/50 rounded-xl p-4 border border-white/5 flex items-center gap-3 hover:border-blue-500/30 transition-colors text-left"
            >
              <img src={pos.image} className="w-10 h-10 rounded-full" alt={pos.symbol} />
              <div className="flex-1">
                <h4 className="font-medium">${pos.symbol?.toUpperCase()} Chat</h4>
                <p className="text-xs text-slate-400">Join the conversation</p>
              </div>
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
          {portfolio.length === 0 && (
            <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-white/5">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-slate-400">APE some coins to unlock their chat rooms!</p>
            </div>
          )}
        </div>
      )}

      {/* Connections Section */}
      {activeSection === 'connections' && (
        <div className="space-y-4">
          {/* Pending Requests */}
          {matchRequests.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-400">Pending Requests</h3>
              {matchRequests.map((req) => (
                <div key={req.id} className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
                    {req.fromUser?.photoURL ? (
                      <img src={req.fromUser.photoURL} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {req.fromUser?.displayName?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{req.fromUser?.displayName}</h4>
                    <p className="text-xs text-blue-400">Wants to connect</p>
                  </div>
                  <button
                    onClick={() => handleAcceptRequest(req.from)}
                    className="px-3 py-1.5 bg-green-600 rounded-lg text-sm font-medium hover:bg-green-500"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Your Connections */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-400">Your Connections</h3>
            {connections.length === 0 ? (
              <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-white/5">
                <div className="text-4xl mb-3">🤝</div>
                <p className="text-slate-400">No connections yet</p>
                <p className="text-xs text-slate-500 mt-2">Connect with investors from the Matches tab</p>
              </div>
            ) : (
              connections.map((conn) => (
                <button
                  key={conn.id}
                  onClick={() => setDmPartner(conn)}
                  className="w-full bg-slate-800/50 rounded-xl p-4 border border-white/5 flex items-center gap-3 hover:border-blue-500/30 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
                    {conn.photoURL ? (
                      <img src={conn.photoURL} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {conn.displayName?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{conn.displayName}</h4>
                    <p className="text-xs text-green-400">Connected</p>
                  </div>
                  <span className="text-sm text-blue-400">Message</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Trending Section */}
      {activeSection === 'trending' && (
        <div className="space-y-3">
          <p className="text-slate-400 text-sm">Most APEd coins by the community</p>
          {trendingCoins.length === 0 ? (
            <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-white/5">
              <div className="text-4xl mb-3">🔥</div>
              <p className="text-slate-400">No trending data yet</p>
              <p className="text-xs text-slate-500 mt-2">Be the first to APE!</p>
            </div>
          ) : (
            trendingCoins.map((coin, i) => (
              <div key={coin.id} className="bg-slate-800/50 rounded-xl p-4 border border-white/5 flex items-center gap-3">
                <span className="text-lg font-bold text-slate-500 w-6">#{i + 1}</span>
                {coin.image && <img src={coin.image} className="w-8 h-8 rounded-full" alt="" />}
                <div className="flex-1">
                  <h4 className="font-medium">{coin.name || coin.symbol?.toUpperCase()}</h4>
                  <p className="text-xs text-slate-400">${coin.symbol?.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">{coin.apeCount}</p>
                  <p className="text-xs text-slate-400">APEs</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Daily Prediction */}
      <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5">
        <DailyPrediction coins={coins} onVote={onPredictionVote} userVote={predictionVote} />
      </div>

      {/* Leaderboard */}
      <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5">
        <Leaderboard portfolio={portfolio} user={user} leaderboardData={leaderboardData} userRankData={userRankData} />
      </div>
    </div>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

// Helper to get today's date key
const getTodayKey = () => new Date().toISOString().split('T')[0];

export default function Swipefolio() {
  // Tab-based navigation: 'discover', 'portfolio', 'community', 'account'
  const [activeTab, setActiveTab] = useState('discover');
  // Legacy view state for landing page
  const [view, setView] = useState('landing');
  const [assetType, setAssetType] = useState('crypto'); // 'crypto' or 'stocks'
  const [coins, setCoins] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [portfolio, setPortfolio] = useState([]);
  const [currentPrices, setCurrentPrices] = useState({});
  const [stats, setStats] = useState({ aped: 0, rugged: 0, superAped: 0 });
  const [history, setHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [matchModal, setMatchModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null); // For coin/stock detail with TradingView
  const [fearGreed, setFearGreed] = useState({ value: null, label: '' }); // Fear & Greed index
  const [marketStatus, setMarketStatus] = useState('open'); // 'open', 'closed', 'premarket'

  // Monetization state
  const [isPremium, setIsPremium] = useState(false);
  const [swipesToday, setSwipesToday] = useState(0);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0); // Incremented to trigger confetti
  const [swipeEffect, setSwipeEffect] = useState(null); // 'left' or 'right' for trail effect

  // Community features state
  const [predictionVote, setPredictionVote] = useState(null); // 'ape' or 'rug'
  const [showCommunity, setShowCommunity] = useState(false); // Mobile collapsible
  const [user, setUser] = useState(null); // Firebase auth user
  const [coinStats, setCoinStats] = useState({}); // Real community swipe stats from Firestore
  const [leaderboardData, setLeaderboardData] = useState([]); // Real leaderboard from Firestore
  const [userRankData, setUserRankData] = useState(null); // User's rank data
  const [userProfile, setUserProfile] = useState(null); // User's profile data (bio, investment style)
  const [userStreak, setUserStreak] = useState(null); // User's streak data
  const [notificationSettings, setNotificationSettings] = useState(null); // Push notification settings

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log('User signed in:', currentUser.email);
        // Save/update user profile in Firestore
        await saveUserProfile(currentUser.uid, {
          displayName: currentUser.displayName || 'Anonymous',
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          createdAt: currentUser.metadata?.creationTime
        });

        // Load portfolio and stats from cloud
        const [portfolioResult, statsResult] = await Promise.all([
          loadPortfolioFromCloud(currentUser.uid),
          loadStatsFromCloud(currentUser.uid)
        ]);

        // Merge cloud portfolio with local (cloud takes priority, but keep unique local items)
        if (portfolioResult.data && portfolioResult.data.length > 0) {
          const localPortfolio = JSON.parse(localStorage.getItem('swipefolio_portfolio') || '[]');
          const cloudIds = new Set(portfolioResult.data.map(p => p.id));
          const uniqueLocal = localPortfolio.filter(p => !cloudIds.has(p.id));
          const merged = [...portfolioResult.data, ...uniqueLocal];
          setPortfolio(merged);
          localStorage.setItem('swipefolio_portfolio', JSON.stringify(merged));
          console.log('📦 Portfolio synced from cloud:', merged.length, 'positions');
        }

        // Load stats from cloud (use cloud if available, otherwise keep local)
        if (statsResult.data) {
          setStats(statsResult.data);
          localStorage.setItem('swipefolio_stats', JSON.stringify(statsResult.data));
          console.log('📊 Stats synced from cloud');
        }

        // Load user profile (bio, investment style)
        const { data: profileData } = await getUserProfile(currentUser.uid);
        if (profileData) {
          setUserProfile(profileData);
          console.log('👤 Profile loaded:', profileData.investmentStyle || 'no style set');
        }

        // Load user streak
        const { data: streakData } = await getUserStreak(currentUser.uid);
        if (streakData) {
          setUserStreak(streakData);
          console.log('🔥 Streak loaded:', streakData.currentStreak || 0, 'days');
        }

        // Load notification settings
        const { data: notifData } = await getNotificationSettings(currentUser.uid);
        if (notifData) {
          setNotificationSettings(notifData);
          console.log('🔔 Notification settings loaded:', notifData.notificationsEnabled ? 'enabled' : 'disabled');
        }
      } else {
        setUserProfile(null);
        setUserStreak(null);
        setNotificationSettings(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle profile update
  const handleProfileUpdate = async (updates) => {
    if (!user) return;
    const { error } = await saveUserProfile(user.uid, updates);
    if (!error) {
      setUserProfile(prev => ({ ...prev, ...updates }));
      console.log('👤 Profile updated');
    }
  };

  // Handle enabling push notifications
  const handleEnableNotifications = async () => {
    if (!user) return;

    try {
      // Step 1: Request permission
      const { granted, error: permError } = await requestNotificationPermission();
      if (!granted) {
        console.warn('🔔 Notification permission not granted:', permError);
        return;
      }
      console.log('🔔 Notification permission granted');

      // Step 2: Get FCM token
      const { token, error: tokenError } = await getFCMToken();
      if (!token) {
        console.error('🔔 Failed to get FCM token:', tokenError);
        return;
      }
      console.log('🔔 FCM token obtained');

      // Step 3: Save token to Firestore
      await saveNotificationToken(user.uid, token);
      console.log('🔔 Token saved to Firestore');

      // Step 4: Update local state
      setNotificationSettings(prev => ({
        ...prev,
        notificationsEnabled: true
      }));

      console.log('🔔 Push notifications enabled successfully!');
    } catch (error) {
      console.error('🔔 Error enabling notifications:', error);
    }
  };

  // Listen for foreground notifications
  useEffect(() => {
    if (!notificationSettings?.notificationsEnabled) return;

    const unsubscribe = onForegroundMessage((payload) => {
      // Show in-app notification toast
      console.log('🔔 Foreground message:', payload);
      // Could add a toast notification here
    });

    return () => unsubscribe();
  }, [notificationSettings?.notificationsEnabled]);

  // Get current categories based on asset type
  const currentCategories = assetType === 'crypto' ? CRYPTO_CATEGORIES : STOCK_CATEGORIES;

  // Get current assets based on asset type
  const currentAssets = assetType === 'crypto' ? coins : stocks;

  // Load from localStorage
  useEffect(() => {
    const savedPortfolio = localStorage.getItem('swipefolio_portfolio');
    const savedStats = localStorage.getItem('swipefolio_stats');
    const savedLanded = localStorage.getItem('swipefolio_landed');
    const savedPremium = localStorage.getItem('swipefolio_premium');
    const savedSwipes = localStorage.getItem('swipefolio_swipes');

    if (savedPortfolio) setPortfolio(JSON.parse(savedPortfolio));
    if (savedStats) setStats(JSON.parse(savedStats));
    if (savedLanded) setView('swipe');
    if (savedPremium === 'true') setIsPremium(true);

    // Load swipes - reset if it's a new day
    if (savedSwipes) {
      const { date, count } = JSON.parse(savedSwipes);
      if (date === getTodayKey()) {
        setSwipesToday(count);
      } else {
        // New day, reset counter
        localStorage.setItem('swipefolio_swipes', JSON.stringify({ date: getTodayKey(), count: 0 }));
      }
    }

    // Load prediction vote (reset weekly)
    const savedPrediction = localStorage.getItem('swipefolio_prediction');
    if (savedPrediction) {
      const { week, vote } = JSON.parse(savedPrediction);
      const currentWeek = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
      if (week === currentWeek) {
        setPredictionVote(vote);
      }
    }
  }, []);

  // Save to localStorage and cloud (debounced)
  const cloudSyncTimeoutRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('swipefolio_portfolio', JSON.stringify(portfolio));

    // Sync to cloud if user is logged in (debounced to avoid too many writes)
    if (user && portfolio.length > 0) {
      if (cloudSyncTimeoutRef.current) {
        clearTimeout(cloudSyncTimeoutRef.current);
      }
      cloudSyncTimeoutRef.current = setTimeout(() => {
        savePortfolioToCloud(user.uid, portfolio);
        console.log('☁️ Portfolio synced to cloud');
      }, 2000); // Wait 2 seconds before syncing to avoid rapid writes
    }
  }, [portfolio, user]);

  useEffect(() => {
    localStorage.setItem('swipefolio_stats', JSON.stringify(stats));

    // Sync stats to cloud if user is logged in (debounced)
    if (user) {
      if (cloudSyncTimeoutRef.current) {
        clearTimeout(cloudSyncTimeoutRef.current);
      }
      cloudSyncTimeoutRef.current = setTimeout(() => {
        saveStatsToCloud(user.uid, stats);
        console.log('☁️ Stats synced to cloud');
      }, 2000);
    }
  }, [stats, user]);

  // Data source tracking
  const [dataSource, setDataSource] = useState('loading'); // 'live', 'cached', 'mock'

  // Fetch coins with MULTIPLE API FALLBACKS
  useEffect(() => {
    const fetchCoins = async () => {
      setLoading(true);
      setDataSource('loading');

      // Try CoinGecko first (most reliable), then CoinCap, then mock
      const apis = [
        {
          name: 'CoinGecko',
          url: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=true&price_change_percentage=24h',
          transform: (data) => data.map(coin => ({
            id: coin.id,
            symbol: coin.symbol?.toLowerCase() || '',
            name: coin.name,
            image: coin.image,
            current_price: coin.current_price || 0,
            market_cap: coin.market_cap || 0,
            market_cap_rank: coin.market_cap_rank || 0,
            total_volume: coin.total_volume || 0,
            price_change_percentage_24h: coin.price_change_percentage_24h || 0,
            high_24h: coin.high_24h || coin.current_price,
            low_24h: coin.low_24h || coin.current_price,
            sparkline_in_7d: coin.sparkline_in_7d || { price: [] },
          }))
        },
        {
          name: 'CoinCap',
          url: 'https://api.coincap.io/v2/assets?limit=250',
          transform: (json) => {
            const data = json.data || json;
            return data.map((coin, index) => {
              const price = parseFloat(coin.priceUsd) || 0;
              const change = parseFloat(coin.changePercent24Hr) || 0;
              const sparklineData = Array.from({ length: 24 }, (_, i) => {
                const progress = i / 23;
                const startPrice = price / (1 + change / 100);
                return startPrice + (price - startPrice) * progress + (Math.random() - 0.5) * price * 0.02;
              });
              return {
                id: coin.id,
                symbol: coin.symbol?.toLowerCase() || '',
                name: coin.name,
                image: `https://assets.coincap.io/assets/icons/${coin.symbol?.toLowerCase()}@2x.png`,
                current_price: price,
                market_cap: parseFloat(coin.marketCapUsd) || 0,
                market_cap_rank: index + 1,
                total_volume: parseFloat(coin.volumeUsd24Hr) || 0,
                price_change_percentage_24h: change,
                high_24h: price * 1.02,
                low_24h: price * 0.98,
                sparkline_in_7d: { price: sparklineData },
              };
            });
          }
        }
      ];

      for (const api of apis) {
        try {
          console.log(`Trying ${api.name} API...`);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const response = await fetch(api.url, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
          });
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`${api.name} returned ${response.status}`);
          }

          const json = await response.json();
          const transformed = api.transform(json);

          if (!transformed || transformed.length === 0) {
            throw new Error(`${api.name} returned empty data`);
          }

          // Filter out stablecoins and shuffle
          const filtered = transformed.filter(coin => !isStablecoin(coin));
          const shuffled = [...filtered].sort(() => Math.random() - 0.5);
          setCoins(shuffled);

          // Build price map
          const prices = {};
          transformed.forEach(coin => {
            prices[coin.id] = coin.current_price;
          });
          setCurrentPrices(prices);

          console.log(`✅ ${api.name} API success! Got ${transformed.length} coins`);
          setDataSource('live');
          setLoading(false);
          return; // Success! Exit the loop
        } catch (error) {
          console.warn(`❌ ${api.name} failed:`, error.message);
          continue; // Try next API
        }
      }

      // All APIs failed - use mock data
      console.error('All APIs failed, using mock data');
      const mockData = getMockCoins();
      setCoins(mockData);
      const mockPrices = {};
      mockData.forEach(coin => { mockPrices[coin.id] = coin.current_price; });
      setCurrentPrices(mockPrices);
      setDataSource('mock');
      setLoading(false);
    };

    fetchCoins();

    // REAL-TIME: Connect to CoinCap WebSocket for live price updates
    let ws = null;
    const connectWebSocket = () => {
      try {
        ws = new WebSocket('wss://ws.coincap.io/prices?assets=bitcoin,ethereum,solana,dogecoin,cardano,ripple,polkadot,chainlink,uniswap,litecoin,pepe,shiba-inu,bonk,sui,arbitrum');

        ws.onopen = () => {
          console.log('✅ WebSocket connected - real-time prices enabled');
          setDataSource('live');
        };

        ws.onmessage = (msg) => {
          try {
            const data = JSON.parse(msg.data);
            setCurrentPrices(prev => {
              const updated = { ...prev };
              Object.keys(data).forEach(id => {
                updated[id] = parseFloat(data[id]);
              });
              return updated;
            });
          } catch (e) {}
        };

        ws.onerror = () => {
          console.warn('WebSocket error, falling back to polling');
        };

        ws.onclose = () => {
          console.log('WebSocket closed, reconnecting in 5s...');
          setTimeout(connectWebSocket, 5000);
        };
      } catch (e) {
        console.warn('WebSocket not supported');
      }
    };

    connectWebSocket();

    // Fallback: Poll every 30 seconds if WebSocket fails
    const interval = setInterval(async () => {
      if (ws && ws.readyState === WebSocket.OPEN) return; // WebSocket is working

      try {
        // Try Binance API (very reliable)
        const response = await fetch('https://api.binance.com/api/v3/ticker/price');
        if (response.ok) {
          const data = await response.json();
          const prices = { ...currentPrices };
          const symbolMap = {
            'BTCUSDT': 'bitcoin', 'ETHUSDT': 'ethereum', 'SOLUSDT': 'solana',
            'DOGEUSDT': 'dogecoin', 'ADAUSDT': 'cardano', 'XRPUSDT': 'ripple'
          };
          data.forEach(item => {
            const id = symbolMap[item.symbol];
            if (id) prices[id] = parseFloat(item.price);
          });
          setCurrentPrices(prices);
          setDataSource('live');
        }
      } catch (e) {
        // Try CoinGecko as backup
        try {
          const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,dogecoin,cardano,ripple&vs_currencies=usd'
          );
          if (response.ok) {
            const data = await response.json();
            const prices = { ...currentPrices };
            Object.keys(data).forEach(id => { prices[id] = data[id].usd; });
            setCurrentPrices(prices);
            setDataSource('live');
          }
        } catch (e2) {}
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, []);

  // Fetch Fear & Greed Index
  useEffect(() => {
    const fetchFearGreed = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch('https://api.alternative.me/fng/?limit=1', {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data[0]) {
            setFearGreed({
              value: parseInt(data.data[0].value),
              label: data.data[0].value_classification
            });
          }
        }
      } catch (e) {
        clearTimeout(timeoutId);
        // Silently fail
      }
    };
    fetchFearGreed();
  }, []);

  // Fetch community coin stats (real APE/RUG ratios) when coins load
  useEffect(() => {
    if (coins.length === 0) return;

    const fetchCoinStats = async () => {
      // Get stats for visible coins (current + next few in stack)
      const visibleCoins = coins.slice(currentIndex, currentIndex + 5);
      const coinIds = visibleCoins.map(c => c.id);

      if (coinIds.length === 0) return;

      const { data, error } = await getCoinStatsBatch(coinIds);
      if (!error && data) {
        setCoinStats(prev => ({ ...prev, ...data }));
      }
    };

    fetchCoinStats();
  }, [coins, currentIndex]);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      const { data, error } = await getLeaderboard(10);
      if (!error && data) {
        setLeaderboardData(data);
      }
    };

    fetchLeaderboardData();
    // Refresh leaderboard every 60 seconds
    const interval = setInterval(fetchLeaderboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch user rank when user changes
  useEffect(() => {
    if (!user) {
      setUserRankData(null);
      return;
    }

    const fetchUserRankData = async () => {
      const { rank, totalSwipes, error } = await getUserRank(user.uid);
      if (!error) {
        setUserRankData({ rank, totalSwipes });
      }
    };

    fetchUserRankData();
  }, [user, stats]); // Refetch when stats change (user swipes)

  // Fetch stocks from Finnhub when switching to stocks mode
  useEffect(() => {
    if (assetType !== 'stocks') return;
    if (stocks.length > 0) return; // Already loaded

    const fetchStocks = async () => {
      setLoading(true);
      try {
        const stockData = await fetchStocksFromFinnhub();
        if (stockData && stockData.length > 0) {
          // Shuffle for variety
          const shuffled = [...stockData].sort(() => Math.random() - 0.5);
          setStocks(shuffled);

          // Build price map
          const prices = { ...currentPrices };
          stockData.forEach(stock => {
            prices[stock.id] = stock.current_price;
          });
          setCurrentPrices(prices);
        } else {
          // API returned empty, use mock data
          console.log('Finnhub returned empty, using mock stocks');
          const mockData = getMockStocks();
          setStocks(mockData);
          const prices = { ...currentPrices };
          mockData.forEach(stock => {
            prices[stock.id] = stock.current_price;
          });
          setCurrentPrices(prices);
        }
      } catch (error) {
        console.error('Stock fetch error:', error);
        // Use mock stocks as fallback
        const mockData = getMockStocks();
        setStocks(mockData);
        const prices = { ...currentPrices };
        mockData.forEach(stock => {
          prices[stock.id] = stock.current_price;
        });
        setCurrentPrices(prices);
      }
      setLoading(false);
    };

    fetchStocks();
  }, [assetType]);

  // Check US market hours
  useEffect(() => {
    const checkMarketHours = () => {
      const now = new Date();
      const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const hours = nyTime.getHours();
      const minutes = nyTime.getMinutes();
      const day = nyTime.getDay();

      // Weekend
      if (day === 0 || day === 6) {
        setMarketStatus('closed');
        return;
      }

      const timeInMinutes = hours * 60 + minutes;
      const marketOpen = 9 * 60 + 30; // 9:30 AM
      const marketClose = 16 * 60; // 4:00 PM

      if (timeInMinutes < marketOpen - 30) {
        setMarketStatus('closed');
      } else if (timeInMinutes < marketOpen) {
        setMarketStatus('premarket');
      } else if (timeInMinutes < marketClose) {
        setMarketStatus('open');
      } else {
        setMarketStatus('closed');
      }
    };

    checkMarketHours();
    const interval = setInterval(checkMarketHours, 60000);
    return () => clearInterval(interval);
  }, []);

  // Filter assets by category (must be before keyboard shortcuts)
  const filteredCoins = useMemo(() => {
    const assets = assetType === 'crypto' ? coins : stocks;
    return assets.filter(asset => {
      if (selectedCategory === 'all') return true;
      if (assetType === 'crypto') {
        return getCoinCategory(asset).includes(selectedCategory);
      } else {
        return getStockCategory(asset).includes(selectedCategory);
      }
    });
  }, [coins, stocks, selectedCategory, assetType]);

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

  // Keyboard shortcuts for power users
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input field
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
      );
      if (isTyping) return;

      // Only in swipe view and when no modal is open
      if (view !== 'swipe' || matchModal || detailModal) return;
      if (currentIndex >= filteredCoins.length) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handleSwipe('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSwipe('right');
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleSwipe('right', true); // Super ape
          break;
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          setDetailModal(filteredCoins[currentIndex]); // Open detail modal
          break;
        case 'z':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            handleUndo();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, matchModal, detailModal, currentIndex, filteredCoins]);

  // Handle swipe
  const handleSwipe = (direction, isSuper = false) => {
    if (currentIndex >= filteredCoins.length) return;

    // Check swipe limit for free users
    if (!isPremium && swipesToday >= FREE_DAILY_SWIPES) {
      setShowPremiumModal(true);
      return;
    }

    // Increment swipe counter
    const newCount = swipesToday + 1;
    setSwipesToday(newCount);
    localStorage.setItem('swipefolio_swipes', JSON.stringify({ date: getTodayKey(), count: newCount }));

    const coin = filteredCoins[currentIndex];

    // Save to history for undo
    setHistory(prev => [...prev.slice(-20), { coin, index: currentIndex, direction, isSuper }]);

    // Trigger visual effects!
    setSwipeEffect(direction);
    setTimeout(() => setSwipeEffect(null), 600);

    if (direction === 'right') {
      // CONFETTI EXPLOSION! 🎉
      setConfettiTrigger(prev => prev + 1);

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
        isStock: coin.isStock || false, // Track if this is a stock for proper affiliate links
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

    // Save swipe to Firestore for community features (if user is logged in)
    if (user) {
      const swipeDirection = direction === 'right' ? 'ape' : 'rug';
      saveSwipe(user.uid, coin.id, coin, swipeDirection);

      // Update local coinStats immediately for responsive UI
      setCoinStats(prev => {
        const existing = prev[coin.id] || { apeCount: 0, rugCount: 0, totalSwipes: 0 };
        const newApeCount = existing.apeCount + (swipeDirection === 'ape' ? 1 : 0);
        const newRugCount = existing.rugCount + (swipeDirection === 'rug' ? 1 : 0);
        const newTotal = newApeCount + newRugCount;
        return {
          ...prev,
          [coin.id]: {
            ...existing,
            apeCount: newApeCount,
            rugCount: newRugCount,
            totalSwipes: newTotal,
            apeRatio: newTotal > 0 ? Math.round((newApeCount / newTotal) * 100) : null
          }
        };
      });

      // Update streak
      updateStreak(user.uid).then(({ data }) => {
        if (data) {
          setUserStreak(data);
        }
      });
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
    const text = `${emoji} My $${pos.symbol?.toUpperCase()} paper trade on Swipefolio:\n\nEntry: ${formatPrice(pos.priceAtSwipe)}\nNow: ${formatPrice(currentPrices[pos.id] || pos.priceAtSwipe)}\nPnL: ${formatPnL(pnl)}\n\nSwipe. Match. Invest! 📈\n\n#Swipefolio #Crypto #Stocks #PaperTrading`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Handle prediction vote
  const handlePredictionVote = (vote) => {
    setPredictionVote(vote);
    const currentWeek = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    localStorage.setItem('swipefolio_prediction', JSON.stringify({ week: currentWeek, vote }));
  };

  // Start swiping
  const handleStart = () => {
    setView('swipe');
    localStorage.setItem('swipefolio_landed', 'true');
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

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Render Portfolio Tab content (inline for cleaner mobile UX)
  const renderPortfolioTab = () => (
    <div className="flex-1 overflow-y-auto">
      <PortfolioView
        portfolio={portfolio}
        currentPrices={currentPrices}
        onBack={() => setActiveTab('discover')}
        onRemove={removeFromPortfolio}
        onShare={shareToTwitter}
        embedded={true}
      />
    </div>
  );

  // Main App with Bottom Navigation
  return (
    <div className="h-[100dvh] text-white flex flex-col relative overflow-hidden">
      {/* Video Starfield Background - Signal Pilot style */}
      <VideoBackground />

      {/* Content wrapper - above video */}
      <div className="relative z-10 flex-1 flex flex-col h-full">

      {/* Floating Sparkles - Reduced */}
      <FloatingSparkles count={15} />

      {/* Confetti Explosion on APE! */}
      <Confetti trigger={confettiTrigger} type="ape" />

      {/* Swipe Trail Effect */}
      <AnimatePresence>
        {swipeEffect && <SwipeTrail direction={swipeEffect} />}
      </AnimatePresence>

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

      {/* Coin Detail Modal with TradingView */}
      <AnimatePresence>
        {detailModal && (
          <CoinDetailModal
            coin={detailModal}
            onClose={() => setDetailModal(null)}
            onApe={() => handleSwipe('right')}
            onRug={() => handleSwipe('left')}
          />
        )}
      </AnimatePresence>

      {/* Premium Upsell Modal */}
      <AnimatePresence>
        {showPremiumModal && (
          <PremiumModal
            onClose={() => setShowPremiumModal(false)}
            swipesUsed={swipesToday}
            assetType={assetType}
          />
        )}
      </AnimatePresence>

      {/* DISCOVER TAB CONTENT */}
      {activeTab === 'discover' && (
        <>
      {/* Header - Glassmorphism - Compact */}
      <header
        className="relative z-10 flex justify-between items-center px-3 py-2 border-b border-white/[0.08] shrink-0"
        style={{
          background: 'rgba(15,23,42,0.7)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg"
            style={{ boxShadow: '0 8px 20px rgba(91,138,255,0.4)' }}
          >
            <span className="text-xl">{assetType === 'crypto' ? '🪙' : '📈'}</span>
          </motion.div>
          <span className="text-xl font-display font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hidden sm:inline">
            Swipefolio
          </span>
          {/* Asset Type Toggle */}
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => { setAssetType('crypto'); setSelectedCategory('all'); setCurrentIndex(0); }}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                assetType === 'crypto'
                  ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🪙 Crypto
            </button>
            <button
              onClick={() => { setAssetType('stocks'); setSelectedCategory('all'); setCurrentIndex(0); }}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                assetType === 'stocks'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📈 Stocks
            </button>
          </div>
          {/* Fear & Greed Index (crypto) or Market Status (stocks) */}
          {assetType === 'crypto' ? (
            <FearGreedIndex value={fearGreed.value} label={fearGreed.label} />
          ) : (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
              marketStatus === 'open' ? 'bg-green-500/20 text-green-400' :
              marketStatus === 'premarket' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                marketStatus === 'open' ? 'bg-green-400 animate-pulse' :
                marketStatus === 'premarket' ? 'bg-yellow-400' :
                'bg-red-400'
              }`} />
              {marketStatus === 'open' ? 'Market Open' :
               marketStatus === 'premarket' ? 'Pre-Market' : 'Market Closed'}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Data source indicator */}
          {dataSource === 'mock' && (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full animate-pulse">
              ⚠️ Cached
            </span>
          )}
          {dataSource === 'live' && (
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
              ● Live
            </span>
          )}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </header>

      {/* Category Pills - Glassmorphism - Compact */}
      <div
        className="relative z-10 flex gap-1.5 px-2 py-1.5 overflow-x-auto scrollbar-hide shrink-0"
        style={{
          background: 'rgba(15,23,42,0.5)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {currentCategories.map(cat => (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setSelectedCategory(cat.id); setCurrentIndex(0); setHistory([]); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium transition-all"
            style={selectedCategory === cat.id ? {
              background: 'linear-gradient(135deg, #5b8aff 0%, #76ddff 100%)',
              boxShadow: '0 4px 15px rgba(91,138,255,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset',
            } : {
              background: 'rgba(30,41,59,0.8)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span>{cat.emoji}</span>
            <span className={selectedCategory === cat.id ? 'text-white' : 'text-slate-300'}>{cat.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Community Features moved to Community Tab on mobile */}

      {/* Card Stack Area with Community Sidebar on Desktop */}
      <div className="flex-1 min-h-0 flex items-stretch p-2 sm:p-4 relative overflow-hidden">
        {/* Main Card Area */}
        <div className="flex-1 flex items-center justify-center relative">
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
            // Card stack - uses available height
            <div className="relative w-full max-w-[340px] h-full max-h-[520px] flex items-center justify-center">
              <AnimatePresence mode="popLayout">
                {filteredCoins.slice(currentIndex, currentIndex + 3).map((coin, i) => (
                  <SwipeCard
                    key={coin.id}
                    coin={coin}
                    isTop={i === 0}
                    onSwipe={handleSwipe}
                    onTap={hasVerifiedChart(coin) ? (coin) => setDetailModal(coin) : null}
                    zIndex={3 - i}
                    coinStats={coinStats[coin.id]}
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

        {/* Community Sidebar - Desktop Only */}
        {currentAssets.length > 0 && (
          <div className="hidden lg:flex flex-col gap-4 w-72 pl-4">
            <DailyPrediction
              coins={currentAssets}
              onVote={handlePredictionVote}
              userVote={predictionVote}
            />
            <Leaderboard portfolio={portfolio} user={user} leaderboardData={leaderboardData} userRankData={userRankData} />
          </div>
        )}
      </div>

      {/* Swipes Counter (for free users) - Compact */}
      {!isPremium && currentIndex < filteredCoins.length && (
        <div className="relative z-10 flex justify-center shrink-0">
          <div className="bg-slate-800/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {swipesToday}/{FREE_DAILY_SWIPES}
            </span>
            <div className="w-12 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  swipesToday >= FREE_DAILY_SWIPES - 5 ? 'bg-orange-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, (swipesToday / FREE_DAILY_SWIPES) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons - Compact Bar */}
      {currentIndex < filteredCoins.length && (
        <div
          className="relative z-10 flex justify-center items-center gap-3 px-4 py-2 pb-4 shrink-0"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(15,23,42,0.8) 30%)',
          }}
        >
          {/* Undo */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleUndo}
            disabled={history.length === 0}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition text-xl ${
              history.length === 0
                ? 'bg-slate-800/50 text-slate-700 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-yellow-500/20 border-2 border-slate-700 hover:border-yellow-500'
            }`}
          >
            ↩️
          </motion.button>

          {/* RUG (Pass) */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={() => handleSwipe('left')}
            className="relative w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center border-2 border-red-500/50 hover:border-red-500 shadow-lg text-3xl group"
          >
            <span>🚫</span>
          </motion.button>

          {/* Super APE */}
          <motion.button
            whileHover={{ scale: 1.15, y: -3 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={() => handleSwipe('right', true)}
            className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center border-2 border-blue-400 shadow-lg text-2xl"
          >
            ⭐
          </motion.button>

          {/* APE (Like) */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={() => handleSwipe('right')}
            className="relative w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center border-2 border-green-400 shadow-lg text-3xl"
          >
            🦍
          </motion.button>

          {/* Shuffle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleReset}
            className="w-11 h-11 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-500/20 border-2 border-slate-700 hover:border-blue-500 transition text-xl"
          >
            🔀
          </motion.button>

          {/* Progress indicator integrated */}
          <span className="text-slate-500 text-xs ml-1">
            {currentIndex + 1}/{filteredCoins.length}
          </span>
        </div>
      )}
        </>
      )}

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <div className="flex-1 overflow-y-auto">
          <PortfolioView
            portfolio={portfolio}
            currentPrices={currentPrices}
            onBack={() => setActiveTab('discover')}
            onRemove={removeFromPortfolio}
            onShare={shareToTwitter}
          />
        </div>
      )}

      {/* Community Tab */}
      {activeTab === 'community' && (
        <CommunityTab
          coins={currentAssets}
          portfolio={portfolio}
          predictionVote={predictionVote}
          onPredictionVote={handlePredictionVote}
          user={user}
          leaderboardData={leaderboardData}
          userRankData={userRankData}
        />
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <AccountTab
          isPremium={isPremium}
          onUpgrade={() => setShowPremiumModal(true)}
          swipesToday={swipesToday}
          stats={stats}
          user={user}
          onUserChange={setUser}
          userProfile={userProfile}
          onProfileUpdate={handleProfileUpdate}
          userStreak={userStreak}
          notificationSettings={notificationSettings}
          onEnableNotifications={handleEnableNotifications}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        portfolioCount={portfolio.length}
        isPremium={isPremium}
      />
      </div>
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

function getMockStocks() {
  // Generate mock data from the full STOCK_LIST
  return STOCK_LIST.map((stock, index) => {
    // Generate realistic mock prices based on typical ranges
    const basePrices = {
      'AAPL': 195, 'MSFT': 420, 'NVDA': 145, 'GOOGL': 175, 'AMZN': 185,
      'TSLA': 250, 'META': 510, 'JPM': 200, 'V': 280, 'MA': 470,
      'UNH': 520, 'JNJ': 155, 'WMT': 165, 'PG': 160, 'HD': 380,
      'XOM': 110, 'CVX': 155, 'PFE': 28, 'ABBV': 175, 'MRK': 125,
      'KO': 62, 'PEP': 175, 'COST': 740, 'MCD': 295, 'NKE': 105,
      'DIS': 95, 'NFLX': 485, 'AMD': 155, 'INTC': 45, 'CRM': 265,
      'ORCL': 125, 'ADBE': 530, 'CSCO': 52, 'TXN': 175, 'QCOM': 170,
      'BA': 195, 'CAT': 345, 'GE': 165, 'MMM': 105, 'HON': 215,
      'RTX': 95, 'LMT': 455, 'NOC': 475, 'GD': 285, 'DE': 380
    };

    const basePrice = basePrices[stock.symbol] || (50 + Math.random() * 300);
    const priceVariation = basePrice * 0.02;
    const currentPrice = basePrice + (Math.random() - 0.5) * priceVariation * 2;
    const priceChange = (Math.random() - 0.5) * 6;

    return {
      id: stock.symbol.toLowerCase(),
      symbol: stock.symbol.toLowerCase(),
      name: stock.name,
      image: `https://logo.clearbit.com/${stock.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      current_price: Math.round(currentPrice * 100) / 100,
      market_cap: Math.floor(Math.random() * 2000000000000) + 10000000000,
      market_cap_rank: index + 1,
      total_volume: Math.floor(Math.random() * 50000000000) + 1000000000,
      price_change_percentage_24h: Math.round(priceChange * 100) / 100,
      high_24h: Math.round((currentPrice * 1.02) * 100) / 100,
      low_24h: Math.round((currentPrice * 0.98) * 100) / 100,
      isStock: true,
      sector: stock.sector,
      categories: stock.category || [],
      sparkline_in_7d: {
        price: Array.from({length: 24}, () => currentPrice * (0.97 + Math.random() * 0.06))
      }
    };
  });
}
