import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { createChart } from 'lightweight-charts';

// ============================================================================
// SWIPEINVEST v2.0 - Tinder for Investments
// Swipe crypto AND stocks. TradingView charts, keyboard shortcuts & more!
// ============================================================================

// TradingView symbol mapping (CoinGecko ID -> TradingView full symbol with exchange)
// Using USDT pairs on Binance as they have the best liquidity
const TRADINGVIEW_SYMBOLS = {
  'bitcoin': 'BINANCE:BTCUSDT',
  'ethereum': 'BINANCE:ETHUSDT',
  'solana': 'BINANCE:SOLUSDT',
  'cardano': 'BINANCE:ADAUSDT',
  'dogecoin': 'BINANCE:DOGEUSDT',
  'ripple': 'BINANCE:XRPUSDT',
  'polkadot': 'BINANCE:DOTUSDT',
  'avalanche-2': 'BINANCE:AVAXUSDT',
  'chainlink': 'BINANCE:LINKUSDT',
  'polygon': 'BINANCE:MATICUSDT',
  'uniswap': 'BINANCE:UNIUSDT',
  'litecoin': 'BINANCE:LTCUSDT',
  'cosmos': 'BINANCE:ATOMUSDT',
  'stellar': 'BINANCE:XLMUSDT',
  'monero': 'BINANCE:XMRUSDT',
  'ethereum-classic': 'BINANCE:ETCUSDT',
  'filecoin': 'BINANCE:FILUSDT',
  'hedera': 'BINANCE:HBARUSDT',
  'internet-computer': 'BINANCE:ICPUSDT',
  'vechain': 'BINANCE:VETUSDT',
  'aave': 'BINANCE:AAVEUSDT',
  'the-sandbox': 'BINANCE:SANDUSDT',
  'decentraland': 'BINANCE:MANAUSDT',
  'axie-infinity': 'BINANCE:AXSUSDT',
  'eos': 'BINANCE:EOSUSDT',
  'tezos': 'BINANCE:XTZUSDT',
  'theta-token': 'BINANCE:THETAUSDT',
  'maker': 'BINANCE:MKRUSDT',
  'fantom': 'BINANCE:FTMUSDT',
  'neo': 'BINANCE:NEOUSDT',
  'flow': 'BINANCE:FLOWUSDT',
  'chiliz': 'BINANCE:CHZUSDT',
  'enjincoin': 'BINANCE:ENJUSDT',
  'basic-attention-token': 'BINANCE:BATUSDT',
  'curve-dao-token': 'BINANCE:CRVUSDT',
  'loopring': 'BINANCE:LRCUSDT',
  'compound': 'BINANCE:COMPUSDT',
  'yearn-finance': 'BINANCE:YFIUSDT',
  'sushi': 'BINANCE:SUSHIUSDT',
  '1inch': 'BINANCE:1INCHUSDT',
  'render-token': 'BINANCE:RENDERUSDT',
  'injective-protocol': 'BINANCE:INJUSDT',
  'gala': 'BINANCE:GALAUSDT',
  'immutable-x': 'BINANCE:IMXUSDT',
  'apecoin': 'BINANCE:APEUSDT',
  'arbitrum': 'BINANCE:ARBUSDT',
  'optimism': 'BINANCE:OPUSDT',
  'sui': 'BINANCE:SUIUSDT',
  'pepe': 'BINANCE:PEPEUSDT',
  'bonk': 'BINANCE:BONKUSDT',
  'floki': 'BINANCE:FLOKIUSDT',
  'shiba-inu': 'BINANCE:SHIBUSDT',
  'fetch-ai': 'BINANCE:FETUSDT',
  'near': 'BINANCE:NEARUSDT',
  'aptos': 'BINANCE:APTUSDT',
  'sei-network': 'BINANCE:SEIUSDT',
  'toncoin': 'OKX:TONUSDT',
  'tron': 'BINANCE:TRXUSDT',
  'bitcoin-cash': 'BINANCE:BCHUSDT',
};

// Categories for filtering - CRYPTO
const CRYPTO_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🔥' },
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
  robinhood: 'https://join.robinhood.com/swipeinvest',
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
  const stockMeta = STOCK_LIST.find(s => s.symbol === stock.symbol);
  const categories = stockMeta?.category || [];

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
  const stockMeta = STOCK_LIST.find(s => s.symbol === stock.symbol);

  if (categories.includes('trending')) vibes.push({ text: 'Trending', emoji: '🔥', color: 'from-orange-500 to-red-500' });
  if (categories.includes('ai')) vibes.push({ text: 'AI', emoji: '🤖', color: 'from-purple-500 to-pink-500' });
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

// Fetch stocks from Finnhub
const fetchStocksFromFinnhub = async () => {
  const symbols = STOCK_LIST.map(s => s.symbol);
  const apiKey = FINNHUB_KEY();

  // Fetch quotes for all stocks (Finnhub allows 60/min so we're fine)
  const quotes = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
        );
        if (!response.ok) return null;
        const data = await response.json();
        return { symbol, ...data };
      } catch (e) {
        return null;
      }
    })
  );

  // Transform to our format
  return quotes
    .filter(q => q && q.c > 0) // Filter out failed/invalid quotes
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

const getVibes = (asset) => {
  // Handle both crypto and stocks
  if (asset.isStock) {
    return getStockVibes(asset);
  }

  const vibes = [];
  const categories = getCoinCategory(asset);

  if (categories.includes('trending')) vibes.push({ text: 'Trending', emoji: '🔥', color: 'from-orange-500 to-red-500' });
  if (categories.includes('ai')) vibes.push({ text: 'AI', emoji: '🤖', color: 'from-purple-500 to-pink-500' });
  if (categories.includes('meme')) vibes.push({ text: 'Meme', emoji: '🐸', color: 'from-green-500 to-emerald-500' });
  if (categories.includes('defi')) vibes.push({ text: 'DeFi', emoji: '🏦', color: 'from-blue-500 to-cyan-500' });
  if (categories.includes('l1')) vibes.push({ text: 'L1', emoji: '⛓️', color: 'from-yellow-500 to-orange-500' });
  if (categories.includes('l2')) vibes.push({ text: 'L2', emoji: '🔷', color: 'from-indigo-500 to-purple-500' });

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
// COMMUNITY SENTIMENT (Phase 1 - Simulated, feels real)
// ============================================================================

const getCommunitySentiment = (coin) => {
  // Generate realistic-looking sentiment based on coin properties
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
      ? ['#22c55e', '#4ade80', '#86efac', '#fbbf24', '#f59e0b', '#a855f7'] // Green + gold
      : ['#ef4444', '#f87171', '#fca5a5', '#a855f7', '#c084fc']; // Red + purple

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
      size: 2 + Math.random() * 4,
    })), [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-gradient-to-r from-purple-400 to-cyan-400"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.2, 0.8, 0.2],
            scale: [0.8, 1.2, 0.8],
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
const PulseRings = ({ active, color = 'purple' }) => {
  if (!active) return null;

  const colorClasses = {
    purple: 'border-purple-500',
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
const GlowText = ({ children, color = 'purple', className = '' }) => {
  const glowColors = {
    purple: 'text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]',
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

const SwipeCard = ({ coin, onSwipe, isTop, style, zIndex, onTap }) => {
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
    const dragDistance = Math.sqrt(
      Math.pow(info.offset.x, 2) + Math.pow(info.offset.y, 2)
    );
    const dragTime = Date.now() - (dragStartRef.current?.time || 0);

    // If minimal drag (less than 20px) and quick tap (less than 200ms), treat as tap
    if (dragDistance < 20 && dragTime < 200 && isTop && onTap) {
      onTap(coin);
      return;
    }

    if (info.offset.x > threshold || velocity > 500) {
      onSwipe('right');
    } else if (info.offset.x < -threshold || velocity < -500) {
      onSwipe('left');
    }
  };

  // Direct click handler for chart tap
  const handleCardClick = (e) => {
    // Only trigger if not dragging
    if (!dragStartRef.current?.time || Date.now() - dragStartRef.current.time > 200) return;
    if (isTop && onTap) {
      onTap(coin);
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
          boxShadow: '0 24px 48px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset, 0 -20px 40px -20px rgba(139,92,246,0.15) inset',
        }}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.08] via-transparent to-cyan-500/[0.05] pointer-events-none" />

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

        {/* Coin Header */}
        <div className="relative p-6 pb-4">
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
                className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(51,65,85,0.8) 0%, rgba(30,41,59,0.9) 100%)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08) inset',
                }}
              >
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-16 h-16 object-contain transition-transform duration-300 group-hover:scale-110"
                  draggable={false}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<span class="text-3xl font-black bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent">${coin.symbol?.toUpperCase().slice(0,3) || '?'}</span>`;
                  }}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-extrabold truncate tracking-tight">{coin.name}</h2>
              <p className="text-slate-400 font-semibold uppercase tracking-widest text-sm">${coin.symbol}</p>
            </div>
          </div>
        </div>

        {/* Price Section - Compact */}
        <div className="px-5 pb-2">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-black tracking-tight">{formatPrice(coin.current_price)}</p>
              <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                <span className="text-sm font-bold">
                  {isPositive ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%
                </span>
                <span className="text-slate-500 text-xs">24h</span>
              </div>
            </div>

            {/* Mini Chart */}
            <div className="w-24">
              <SparklineSVG data={sparklineData.slice(-24)} positive={isPositive} />
            </div>
          </div>

          {/* View Chart Button - Compact */}
          {isTop && onTap && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => {
                e.stopPropagation();
                onTap(coin);
              }}
              className="w-full mt-2 py-2 px-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center gap-2 active:scale-95 transition-transform touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <span className="text-purple-300 font-semibold text-xs">View Full Chart</span>
            </motion.button>
          )}
        </div>

        {/* Vibes/Tags - Compact */}
        {vibes.length > 0 && (
          <div className="px-5 pb-2">
            <div className="flex flex-wrap gap-1.5">
              {vibes.map((vibe, i) => (
                <span
                  key={i}
                  className={`bg-gradient-to-r ${vibe.color} px-2 py-1 rounded-full text-[10px] font-bold shadow-lg`}
                >
                  {vibe.emoji} {vibe.text}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid - Compact */}
        <div className="px-5 pb-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800/60 backdrop-blur-sm p-2 rounded-lg border border-white/5">
              <p className="text-slate-500 text-xs font-medium">Market Cap</p>
              <p className="font-bold text-sm">{formatNumber(coin.market_cap)}</p>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-sm p-2 rounded-lg border border-white/5">
              <p className="text-slate-500 text-xs font-medium">24h Volume</p>
              <p className="font-bold text-sm">{formatNumber(coin.total_volume)}</p>
            </div>
          </div>
        </div>

        {/* Community Sentiment - Compact */}
        {(() => {
          const sentiment = getCommunitySentiment(coin);
          return (
            <div className="px-5 pb-2">
              <div className="bg-slate-800/40 backdrop-blur-sm p-2 rounded-lg border border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 text-xs font-medium">👥 Community</span>
                  <span className="text-slate-500 text-xs">
                    {sentiment.userCount.toLocaleString()} today
                  </span>
                </div>
                {/* APE Rate Bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        sentiment.apeRate > 70 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                        sentiment.apeRate > 45 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
                        'bg-gradient-to-r from-red-500 to-pink-400'
                      }`}
                      style={{ width: `${sentiment.apeRate}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${
                    sentiment.apeRate > 70 ? 'text-green-400' :
                    sentiment.apeRate > 45 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    🦍 {sentiment.apeRate}%
                  </span>
                </div>
                {/* Top Comment */}
                <p className="text-slate-500 text-[10px] mt-1 italic truncate">
                  "{sentiment.topComment}" - @trader_{Math.abs(coin.id.charCodeAt(0) % 999)}
                </p>
              </div>
            </div>
          );
        })()}

        {/* Risk Level - Compact */}
        <div className="px-5 pb-3">
          <div className={`flex items-center justify-between ${risk.bg} backdrop-blur-sm p-2 rounded-lg border border-white/5`}>
            <span className="text-slate-400 text-xs font-medium">Risk</span>
            <span className={`font-bold text-sm ${risk.color} flex items-center gap-1`}>
              <span>{risk.emoji}</span>
              {risk.label}
            </span>
          </div>
        </div>

        {/* Swipe hint for top card */}
        {isTop && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
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
  // Get full TradingView symbol - use NASDAQ for stocks, Binance for crypto
  const tvSymbol = coin.isStock
    ? `NASDAQ:${coin.symbol?.toUpperCase()}`
    : (TRADINGVIEW_SYMBOLS[coin.id] || `BINANCE:${coin.symbol?.toUpperCase()}USDT`);
  const risk = getRiskLevel(coin.market_cap);
  const vibes = getVibes(coin);
  const isPositive = coin.price_change_percentage_24h >= 0;

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

        {/* TradingView Chart - Larger */}
        <div className="h-[400px] sm:h-[450px] bg-slate-950">
          <iframe
            src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${tvSymbol}&interval=60&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=0f172a&studies=[]&theme=dark&style=1&timezone=exchange&withdateranges=1&showpopupbutton=0&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&showwatermark=0&locale=en&utm_source=swipeinvest&utm_medium=widget&utm_campaign=chart`}
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
      className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/20"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎲</span>
          <span className="font-bold text-sm">Daily Prediction</span>
        </div>
        <span className="text-xs text-slate-400">🏆 Win points!</span>
      </div>

      <p className="text-sm text-slate-300 mb-3">
        Will <span className="font-bold text-purple-300">${featuredCoin.symbol.toUpperCase()}</span> hit{' '}
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
// LEADERBOARD COMPONENT
// ============================================================================

const Leaderboard = ({ portfolio }) => {
  // Generate fake leaderboard with user included
  const fakeTraders = [
    { name: 'DiamondHands', gain: 127, avatar: '💎' },
    { name: 'DeFiDegen', gain: 89, avatar: '🦄' },
    { name: 'MoonBoy', gain: 72, avatar: '🌙' },
    { name: 'CryptoKing', gain: 58, avatar: '👑' },
    { name: 'ApeStrong', gain: 45, avatar: '🦍' },
    { name: 'WhaleAlert', gain: 38, avatar: '🐋' },
    { name: 'SatoshiFan', gain: 29, avatar: '₿' },
    { name: 'HODLer', gain: 22, avatar: '💪' },
  ];

  // Calculate user's gain (simplified)
  const userGain = portfolio.length > 0 ? 12 + (portfolio.length * 3) : 0;
  const userRank = fakeTraders.filter(t => t.gain > userGain).length + 1;

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
        </div>
        <span className="text-xs text-slate-400">This Week</span>
      </div>

      {/* Top 3 */}
      <div className="space-y-2 mb-3">
        {fakeTraders.slice(0, 3).map((trader, i) => (
          <div key={trader.name} className="flex items-center gap-3">
            <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
            <span className="text-sm">{trader.avatar}</span>
            <span className="text-sm font-medium flex-1">@{trader.name}</span>
            <span className="text-green-400 text-sm font-bold">+{trader.gain}%</span>
          </div>
        ))}
      </div>

      {/* User rank */}
      <div className="bg-purple-500/20 rounded-lg p-2 flex items-center gap-3 border border-purple-500/30">
        <span className="text-sm font-bold text-purple-400">#{userRank}</span>
        <span className="text-sm">😎</span>
        <span className="text-sm font-medium flex-1">You</span>
        <span className={`text-sm font-bold ${userGain > 0 ? 'text-green-400' : 'text-slate-400'}`}>
          {userGain > 0 ? `+${userGain}%` : 'Start swiping!'}
        </span>
      </div>
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 text-white overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Aurora Light Beams - Finex style curtains */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main aurora curtains */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% 0%, rgba(139,92,246,0.3) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 40% 0%, rgba(168,85,247,0.25) 0%, transparent 45%),
              radial-gradient(ellipse 70% 45% at 60% 0%, rgba(139,92,246,0.2) 0%, transparent 50%),
              radial-gradient(ellipse 50% 35% at 80% 0%, rgba(99,102,241,0.25) 0%, transparent 40%)
            `,
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Vertical light streaks */}
        {[15, 30, 45, 55, 70, 85].map((left, i) => (
          <motion.div
            key={i}
            className="absolute top-0"
            style={{
              left: `${left}%`,
              width: '120px',
              height: '70%',
              background: `linear-gradient(180deg,
                rgba(139,92,246,${0.15 + (i % 3) * 0.05}) 0%,
                rgba(168,85,247,${0.1 + (i % 2) * 0.05}) 40%,
                transparent 100%)`,
              filter: 'blur(30px)',
              transform: 'translateX(-50%)',
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              height: ['65%', '75%', '65%'],
            }}
            transition={{
              duration: 5 + i * 0.8,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Accent streaks - brighter, thinner */}
        {[25, 50, 75].map((left, i) => (
          <motion.div
            key={`accent-${i}`}
            className="absolute top-0"
            style={{
              left: `${left}%`,
              width: '4px',
              height: '50%',
              background: `linear-gradient(180deg,
                rgba(168,85,247,0.8) 0%,
                rgba(139,92,246,0.4) 50%,
                transparent 100%)`,
              filter: 'blur(2px)',
              transform: 'translateX(-50%)',
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              height: ['45%', '55%', '45%'],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.6,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

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
            className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-xl"
          />
          <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
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
          <span className="text-white">Swipe. </span>
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Invest.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl text-slate-400 text-center mb-8 max-w-lg leading-relaxed"
        >
          Your all-in-one app for discovering crypto and stocks.
          <br className="hidden sm:block" />
          Swipe right to invest. Build your portfolio effortlessly.
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
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%)',
            boxShadow: '0 20px 40px -10px rgba(139,92,246,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset',
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
            style={{ boxShadow: '0 0 40px rgba(236,72,153,0.6)' }}
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
        className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-6 max-w-sm w-full border border-purple-500/30 shadow-2xl"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Crown icon */}
        <div className="text-center mb-4">
          <span className="text-6xl">👑</span>
        </div>

        <h2 className="text-2xl font-black text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          You're on Fire!
        </h2>

        <p className="text-slate-400 text-center mb-4">
          You've used all {FREE_DAILY_SWIPES} free swipes today. Upgrade to Premium for unlimited swiping!
        </p>

        {/* Premium features */}
        <div className="bg-slate-800/50 rounded-2xl p-4 mb-4 border border-white/5">
          <p className="text-sm font-bold text-purple-400 mb-3">Premium Features:</p>
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
            localStorage.setItem('swipeinvest_premium', 'true');
            onClose();
          }}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 py-3 rounded-xl font-bold text-lg mb-3 hover:opacity-90 transition"
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
          className="text-purple-400 hover:text-purple-300"
        >
          Start trading on Coinbase →
        </a>
      </p>
    </div>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

// Helper to get today's date key
const getTodayKey = () => new Date().toISOString().split('T')[0];

export default function SwipeInvest() {
  // Views: 'landing', 'swipe', 'portfolio'
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

  // Get current categories based on asset type
  const currentCategories = assetType === 'crypto' ? CRYPTO_CATEGORIES : STOCK_CATEGORIES;

  // Get current assets based on asset type
  const currentAssets = assetType === 'crypto' ? coins : stocks;

  // Load from localStorage
  useEffect(() => {
    const savedPortfolio = localStorage.getItem('coinswipe_portfolio');
    const savedStats = localStorage.getItem('coinswipe_stats_v2');
    const savedLanded = localStorage.getItem('coinswipe_landed');
    const savedPremium = localStorage.getItem('swipeinvest_premium');
    const savedSwipes = localStorage.getItem('swipeinvest_swipes');

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
        localStorage.setItem('swipeinvest_swipes', JSON.stringify({ date: getTodayKey(), count: 0 }));
      }
    }

    // Load prediction vote (reset weekly)
    const savedPrediction = localStorage.getItem('swipeinvest_prediction');
    if (savedPrediction) {
      const { week, vote } = JSON.parse(savedPrediction);
      const currentWeek = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
      if (week === currentWeek) {
        setPredictionVote(vote);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('coinswipe_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem('coinswipe_stats_v2', JSON.stringify(stats));
  }, [stats]);

  // Fetch coins from CoinCap API (more reliable than CoinGecko, no rate limits)
  useEffect(() => {
    const fetchCoins = async () => {
      setLoading(true);

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        // Use CoinCap API - more reliable, no aggressive rate limits
        // Add cache-busting timestamp to prevent stale prices
        const response = await fetch(
          `https://api.coincap.io/v2/assets?limit=100&_t=${Date.now()}`,
          {
            signal: controller.signal,
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
          }
        );
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`CoinCap API failed: ${response.status}`);
        }

        const json = await response.json();
        const data = json.data;

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Invalid API response');
        }

        // Transform CoinCap data to match our expected format
        const transformed = data.map((coin, index) => {
          const price = parseFloat(coin.priceUsd) || 0;
          const change = parseFloat(coin.changePercent24Hr) || 0;
          const marketCap = parseFloat(coin.marketCapUsd) || 0;
          const volume = parseFloat(coin.volumeUsd24Hr) || 0;

          // Generate fake sparkline based on price change
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
            market_cap: marketCap,
            market_cap_rank: index + 1,
            total_volume: volume,
            price_change_percentage_24h: change,
            high_24h: price * (1 + Math.abs(change) / 200),
            low_24h: price * (1 - Math.abs(change) / 200),
            sparkline_in_7d: { price: sparklineData },
          };
        });

        // Filter out stablecoins and shuffle for variety
        const filtered = transformed.filter(coin => !isStablecoin(coin));
        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        setCoins(shuffled);

        // Build price map
        const prices = {};
        transformed.forEach(coin => {
          prices[coin.id] = coin.current_price;
        });
        setCurrentPrices(prices);
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('API Error:', error.message);
        // Use mock data as fallback
        const mockData = getMockCoins();
        setCoins(mockData);
        // Also set mock prices
        const mockPrices = {};
        mockData.forEach(coin => {
          mockPrices[coin.id] = coin.current_price;
        });
        setCurrentPrices(mockPrices);
      }
      setLoading(false);
    };

    fetchCoins();

    // Refresh prices every 30 seconds (CoinCap has no rate limits)
    const interval = setInterval(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(
          `https://api.coincap.io/v2/assets?limit=100&_t=${Date.now()}`,
          {
            signal: controller.signal,
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
          }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          if (json.data && Array.isArray(json.data)) {
            const prices = {};
            json.data.forEach(coin => {
              prices[coin.id] = parseFloat(coin.priceUsd) || 0;
            });
            setCurrentPrices(prices);

            // Check for matches (>5% gain)
            checkForMatches(prices);
          }
        }
      } catch (e) {
        clearTimeout(timeoutId);
        // Silently fail price refresh
      }
    }, 30000);

    return () => clearInterval(interval);
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
    localStorage.setItem('swipeinvest_swipes', JSON.stringify({ date: getTodayKey(), count: newCount }));

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
    const text = `${emoji} My $${pos.symbol?.toUpperCase()} paper trade on SwipeInvest:\n\nEntry: ${formatPrice(pos.priceAtSwipe)}\nNow: ${formatPrice(currentPrices[pos.id] || pos.priceAtSwipe)}\nPnL: ${formatPnL(pnl)}\n\nSwipe to invest! 📈\n\n#SwipeInvest #Crypto #Stocks #PaperTrading`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Handle prediction vote
  const handlePredictionVote = (vote) => {
    setPredictionVote(vote);
    const currentWeek = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    localStorage.setItem('swipeinvest_prediction', JSON.stringify({ week: currentWeek, vote }));
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
    <div className="min-h-screen text-white flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0f1a 0%, #1a1040 40%, #0f172a 100%)',
      }}
    >
      {/* Subtle Grid Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Aurora Background - More Dramatic */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Main aurora glow from top */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px]"
          style={{
            background: 'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(139,92,246,0.4) 0%, rgba(168,85,247,0.2) 40%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Center card glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[600px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, transparent 60%)',
            filter: 'blur(60px)',
          }}
          animate={{ opacity: [0.5, 0.8, 0.5], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Side glows */}
        <div
          className="absolute top-1/4 -left-20 w-[400px] h-[500px] opacity-40"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.4) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute top-1/3 -right-20 w-[400px] h-[500px] opacity-40"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.35) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        {/* Vertical aurora beams - More visible */}
        {[15, 35, 50, 65, 85].map((left, i) => (
          <motion.div
            key={i}
            className="absolute top-0"
            style={{
              left: `${left}%`,
              width: i === 2 ? '150px' : '80px',
              height: '80%',
              background: `linear-gradient(180deg,
                rgba(139,92,246,${i === 2 ? 0.3 : 0.2}) 0%,
                rgba(168,85,247,${i === 2 ? 0.15 : 0.1}) 40%,
                transparent 100%)`,
              filter: 'blur(20px)',
              transform: 'translateX(-50%)',
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              height: ['75%', '85%', '75%'],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            }}
          />
        ))}

        {/* Accent beam lines */}
        {[25, 50, 75].map((left, i) => (
          <motion.div
            key={`line-${i}`}
            className="absolute top-0"
            style={{
              left: `${left}%`,
              width: '2px',
              height: '60%',
              background: 'linear-gradient(180deg, rgba(168,85,247,0.6) 0%, rgba(139,92,246,0.2) 50%, transparent 100%)',
              transform: 'translateX(-50%)',
            }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2 + i, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Floating Sparkles - More of them */}
      <FloatingSparkles count={35} />

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

      {/* Header - Glassmorphism */}
      <header
        className="relative z-10 flex justify-between items-center p-4 border-b border-white/[0.08]"
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
            className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
            style={{ boxShadow: '0 8px 20px rgba(168,85,247,0.4)' }}
          >
            <span className="text-xl">{assetType === 'crypto' ? '🪙' : '📈'}</span>
          </motion.div>
          <span className="text-xl font-display font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hidden sm:inline">
            SwipeInvest
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

      {/* Category Pills - Glassmorphism */}
      <div
        className="relative z-10 flex gap-2 p-3 overflow-x-auto scrollbar-hide"
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all"
            style={selectedCategory === cat.id ? {
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              boxShadow: '0 4px 15px rgba(139,92,246,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset',
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

      {/* Community Features - Mobile Only (horizontal scroll) */}
      {currentAssets.length > 0 && (
        <div className="lg:hidden flex gap-3 px-3 pb-2 overflow-x-auto scrollbar-hide">
          <div className="flex-shrink-0 w-64">
            <DailyPrediction
              coins={currentAssets}
              onVote={handlePredictionVote}
              userVote={predictionVote}
            />
          </div>
          <div className="flex-shrink-0 w-64">
            <Leaderboard portfolio={portfolio} />
          </div>
        </div>
      )}

      {/* Card Stack Area with Community Sidebar on Desktop */}
      <div className="flex-1 flex items-stretch p-4 relative overflow-hidden">
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
            // Card stack
            <div className="relative w-full max-w-[340px] h-[560px] flex items-center justify-center">
              <AnimatePresence mode="popLayout">
                {filteredCoins.slice(currentIndex, currentIndex + 3).map((coin, i) => (
                  <SwipeCard
                    key={coin.id}
                    coin={coin}
                    isTop={i === 0}
                    onSwipe={handleSwipe}
                    onTap={(coin) => setDetailModal(coin)}
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

        {/* Community Sidebar - Desktop Only */}
        {currentAssets.length > 0 && (
          <div className="hidden lg:flex flex-col gap-4 w-72 pl-4">
            <DailyPrediction
              coins={currentAssets}
              onVote={handlePredictionVote}
              userVote={predictionVote}
            />
            <Leaderboard portfolio={portfolio} />
          </div>
        )}
      </div>

      {/* Swipes Counter (for free users) */}
      {!isPremium && currentIndex < filteredCoins.length && (
        <div className="relative z-10 flex justify-center">
          <div className="bg-slate-800/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {swipesToday}/{FREE_DAILY_SWIPES} swipes
            </span>
            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  swipesToday >= FREE_DAILY_SWIPES - 5 ? 'bg-orange-500' : 'bg-purple-500'
                }`}
                style={{ width: `${Math.min(100, (swipesToday / FREE_DAILY_SWIPES) * 100)}%` }}
              />
            </div>
            {swipesToday >= FREE_DAILY_SWIPES - 5 && swipesToday < FREE_DAILY_SWIPES && (
              <span className="text-orange-400 text-xs">⚡ {FREE_DAILY_SWIPES - swipesToday} left</span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons - Glassmorphism Bar */}
      {currentIndex < filteredCoins.length && (
        <div
          className="relative z-10 flex justify-center items-center gap-4 p-4 pb-6"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(15,23,42,0.8) 30%)',
          }}
        >
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
            whileHover={{ scale: 1.15, rotate: -5 }}
            whileTap={{ scale: 0.85, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={() => handleSwipe('left')}
            className="relative w-18 h-18 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center border-2 border-red-500/50 hover:border-red-500 shadow-lg hover:shadow-red-500/30 text-4xl p-5 group"
          >
            <span className="group-hover:animate-bounce">🚫</span>
            <div className="absolute inset-0 rounded-full bg-red-500/0 group-hover:bg-red-500/10 transition-all duration-300" />
          </motion.button>

          {/* Super APE */}
          <motion.button
            whileHover={{ scale: 1.2, y: -5 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={() => handleSwipe('right', true)}
            className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center border-2 border-blue-400 shadow-lg hover:shadow-blue-500/50 text-3xl group"
          >
            <motion.span
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⭐
            </motion.span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/0 to-white/20" />
          </motion.button>

          {/* APE (Like) */}
          <motion.button
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.85, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={() => handleSwipe('right')}
            className="relative w-18 h-18 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center border-2 border-green-400 shadow-lg hover:shadow-green-500/50 text-4xl p-5 group"
          >
            <span className="group-hover:animate-bounce">🦍</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/0 to-white/20" />
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

function getMockStocks() {
  return [
    { id: 'aapl', symbol: 'aapl', name: 'Apple', image: 'https://logo.clearbit.com/apple.com', current_price: 198.50, market_cap: 3000000000000, market_cap_rank: 1, total_volume: 45000000000, price_change_percentage_24h: 1.23, high_24h: 200, low_24h: 196, isStock: true, sector: 'tech', categories: ['tech', 'bluechip'], sparkline_in_7d: { price: Array.from({length: 24}, () => 195 + Math.random() * 6) } },
    { id: 'msft', symbol: 'msft', name: 'Microsoft', image: 'https://logo.clearbit.com/microsoft.com', current_price: 425.80, market_cap: 2800000000000, market_cap_rank: 2, total_volume: 28000000000, price_change_percentage_24h: 0.85, high_24h: 428, low_24h: 422, isStock: true, sector: 'tech', categories: ['tech', 'bluechip'], sparkline_in_7d: { price: Array.from({length: 24}, () => 420 + Math.random() * 10) } },
    { id: 'nvda', symbol: 'nvda', name: 'NVIDIA', image: 'https://logo.clearbit.com/nvidia.com', current_price: 145.20, market_cap: 1200000000000, market_cap_rank: 3, total_volume: 52000000000, price_change_percentage_24h: 3.45, high_24h: 148, low_24h: 141, isStock: true, sector: 'tech', categories: ['tech', 'ai', 'bluechip', 'trending'], sparkline_in_7d: { price: Array.from({length: 24}, () => 140 + Math.random() * 10) } },
    { id: 'googl', symbol: 'googl', name: 'Alphabet', image: 'https://logo.clearbit.com/google.com', current_price: 175.30, market_cap: 1800000000000, market_cap_rank: 4, total_volume: 22000000000, price_change_percentage_24h: -0.45, high_24h: 177, low_24h: 174, isStock: true, sector: 'tech', categories: ['tech', 'bluechip'], sparkline_in_7d: { price: Array.from({length: 24}, () => 173 + Math.random() * 4) } },
    { id: 'amzn', symbol: 'amzn', name: 'Amazon', image: 'https://logo.clearbit.com/amazon.com', current_price: 186.40, market_cap: 1500000000000, market_cap_rank: 5, total_volume: 35000000000, price_change_percentage_24h: 1.89, high_24h: 188, low_24h: 183, isStock: true, sector: 'tech', categories: ['tech', 'bluechip'], sparkline_in_7d: { price: Array.from({length: 24}, () => 182 + Math.random() * 7) } },
    { id: 'tsla', symbol: 'tsla', name: 'Tesla', image: 'https://logo.clearbit.com/tesla.com', current_price: 248.90, market_cap: 700000000000, market_cap_rank: 6, total_volume: 85000000000, price_change_percentage_24h: 5.67, high_24h: 255, low_24h: 240, isStock: true, sector: 'tech', categories: ['tech', 'meme', 'trending'], sparkline_in_7d: { price: Array.from({length: 24}, () => 235 + Math.random() * 20) } },
    { id: 'meta', symbol: 'meta', name: 'Meta', image: 'https://logo.clearbit.com/meta.com', current_price: 512.60, market_cap: 900000000000, market_cap_rank: 7, total_volume: 18000000000, price_change_percentage_24h: 2.12, high_24h: 518, low_24h: 505, isStock: true, sector: 'tech', categories: ['tech', 'bluechip'], sparkline_in_7d: { price: Array.from({length: 24}, () => 500 + Math.random() * 20) } },
    { id: 'jpm', symbol: 'jpm', name: 'JPMorgan', image: 'https://logo.clearbit.com/jpmorganchase.com', current_price: 198.75, market_cap: 450000000000, market_cap_rank: 8, total_volume: 8000000000, price_change_percentage_24h: 0.34, high_24h: 200, low_24h: 197, isStock: true, sector: 'finance', categories: ['finance', 'bluechip', 'dividend'], sparkline_in_7d: { price: Array.from({length: 24}, () => 196 + Math.random() * 4) } },
    { id: 'gme', symbol: 'gme', name: 'GameStop', image: 'https://logo.clearbit.com/gamestop.com', current_price: 28.45, market_cap: 8500000000, market_cap_rank: 50, total_volume: 15000000000, price_change_percentage_24h: 12.34, high_24h: 30, low_24h: 25, isStock: true, sector: 'retail', categories: ['meme', 'trending'], sparkline_in_7d: { price: Array.from({length: 24}, () => 24 + Math.random() * 6) } },
    { id: 'amc', symbol: 'amc', name: 'AMC', image: 'https://logo.clearbit.com/amctheatres.com', current_price: 4.85, market_cap: 2200000000, market_cap_rank: 80, total_volume: 8000000000, price_change_percentage_24h: 8.76, high_24h: 5.20, low_24h: 4.50, isStock: true, sector: 'entertainment', categories: ['meme', 'trending'], sparkline_in_7d: { price: Array.from({length: 24}, () => 4.3 + Math.random() * 0.8) } },
    { id: 'pltr', symbol: 'pltr', name: 'Palantir', image: 'https://logo.clearbit.com/palantir.com', current_price: 23.80, market_cap: 52000000000, market_cap_rank: 20, total_volume: 45000000000, price_change_percentage_24h: 4.56, high_24h: 24.50, low_24h: 22.80, isStock: true, sector: 'tech', categories: ['tech', 'ai', 'meme'], sparkline_in_7d: { price: Array.from({length: 24}, () => 22 + Math.random() * 3) } },
    { id: 'ko', symbol: 'ko', name: 'Coca-Cola', image: 'https://logo.clearbit.com/coca-cola.com', current_price: 62.40, market_cap: 270000000000, market_cap_rank: 12, total_volume: 8000000000, price_change_percentage_24h: 0.12, high_24h: 62.80, low_24h: 62.00, isStock: true, sector: 'consumer', categories: ['dividend', 'bluechip'], sparkline_in_7d: { price: Array.from({length: 24}, () => 61.5 + Math.random() * 1.5) } },
    { id: 'lly', symbol: 'lly', name: 'Eli Lilly', image: 'https://logo.clearbit.com/lilly.com', current_price: 785.30, market_cap: 680000000000, market_cap_rank: 9, total_volume: 4500000000, price_change_percentage_24h: 2.89, high_24h: 792, low_24h: 770, isStock: true, sector: 'healthcare', categories: ['healthcare', 'trending'], sparkline_in_7d: { price: Array.from({length: 24}, () => 765 + Math.random() * 30) } },
    { id: 'xom', symbol: 'xom', name: 'Exxon Mobil', image: 'https://logo.clearbit.com/exxonmobil.com', current_price: 108.90, market_cap: 420000000000, market_cap_rank: 11, total_volume: 12000000000, price_change_percentage_24h: -1.23, high_24h: 111, low_24h: 107, isStock: true, sector: 'energy', categories: ['energy', 'dividend'], sparkline_in_7d: { price: Array.from({length: 24}, () => 106 + Math.random() * 5) } },
  ];
}
