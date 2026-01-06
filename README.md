# Swipefolio - Swipe. Match. Invest.

Discover your next investment by swiping. Build your portfolio the fun way with crypto AND stocks. Match with like-minded investors!

## Features

- **Swipe Interface** - Drag cards left to pass (RUG), right to invest (APE)
- **Crypto & Stocks** - Toggle between crypto and stock markets
- **Real-time Data** - CoinCap API for crypto, Finnhub API for stocks
- **Category Filters** - Filter by Meme, DeFi, AI, Tech, Finance, and more
- **TradingView Charts** - Lightweight charts on each card
- **Super APE** - Star your absolute favorites
- **Undo** - Made a mistake? Go back one swipe
- **Paper PnL Tracking** - Track your portfolio performance
- **Match Alerts** - Celebrate your gains
- **Epic Animations** - Confetti, particles, and satisfying effects
- **Fear & Greed Index** - Market sentiment indicator
- **Sound Effects** - Satisfying swipe sounds (can be muted)
- **Persistent Portfolio** - Positions saved to localStorage
- **Share to Twitter** - One-click share your trades
- **Mobile Optimized** - Works great on phones
- **Android App Ready** - Capacitor configured for Google Play
- **Bottom Navigation** - Clean mobile-first UX with tabs
- **Account System** - Sign up to sync across devices
- **Community Features** - Predictions, leaderboard, investor matching (coming soon)

## Quick Start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/swipefolio.git
cd swipefolio

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build Android App

```bash
# Build the web app
npm run build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

## Deploy to Vercel (Free)

1. Push this code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Add New Project"
4. Import your repo
5. Click "Deploy"
6. Done! You get a free `.vercel.app` domain

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lightweight Charts** - TradingView charts
- **CoinCap API** - Free crypto data (no rate limits)
- **Finnhub API** - Free stock data
- **Capacitor** - Native Android app
- **localStorage** - Persistence
- **Web Audio API** - Sound effects

## Customization

### Add More Assets
Edit `STOCK_LIST` and category mappings in `src/SwipeInvest.jsx`.

### Affiliate Links
Edit `AFFILIATE_LINKS` in `src/SwipeInvest.jsx`:

```javascript
const AFFILIATE_LINKS = {
  coinbase: 'https://www.coinbase.com/join/YOUR_REFERRAL_CODE',
  binance: 'https://www.binance.com/register?ref=YOUR_REF',
  robinhood: 'https://join.robinhood.com/YOUR_REF',
};
```

## License

MIT - Do whatever you want with it.

---

Built with confetti and vibes
