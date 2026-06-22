<div align="center">

# ⚡ TRADENOVA X

### AI-Powered Neural Trading Terminal

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini_2.5-Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

*A next-generation, institutional-grade trading terminal that fuses real-time WebSocket market feeds with Google Gemini AI to deliver predictive intelligence, Smart Money Concept (SMC) analysis, and an AI copilot — all wrapped in a stunning cyberpunk holographic interface.*

[Live Demo](https://trade-novax.vercel.app) · [Report Bug](https://github.com/zaid46kazi-wq/Trade-NOVAX/issues) · [Request Feature](https://github.com/zaid46kazi-wq/Trade-NOVAX/issues)

</div>

---

## 🎯 What Makes TradeNova X Different?

Most trading dashboards are static chart viewers. **TradeNova X is a living, thinking system** that:

- 🧠 **Thinks for you** — Gemini 2.5 Flash analyzes RSI, MACD, Bollinger Bands, Fibonacci, and SMC order blocks, then generates trade recommendations with entry/SL/TP in real-time
- 🌊 **Streams live data** — Direct WebSocket connections to Binance and Twelve Data, not REST polling
- 🤖 **Has a copilot** — JARVIS, an AI chatbot with full conversation memory and live market context injection, answers any trading question instantly
- 🎨 **Looks like the future** — Glassmorphism, aurora gradients, holographic overlays, and micro-animations create an experience that feels alive

---

## ✨ Feature Breakdown

### 🖥️ Terminal Dashboard
| Feature | Description |
|---------|-------------|
| **TradingView Chart** | Professional-grade charting with full indicator support via TradingView widget integration |
| **AI Trade Command Center** | One-click AI analysis: direction, confidence %, entry zone, stop loss, take profit, and risk/reward ratio |
| **Multi-Asset Scanner** | Simultaneously scan Crypto, Forex, and Commodities for opportunities |
| **Top Opportunities Bar** | AI-ranked trade setups scrolling live across the top of the terminal |
| **Multi-Timeframe Alignment** | Visual alignment indicator across 1m, 5m, 15m, 1H, 4H, and 1D timeframes |

### 🧠 AI Intelligence Layer
| Feature | Description |
|---------|-------------|
| **JARVIS Copilot** | Conversational AI chatbot powered by Gemini 2.5 Flash with live market context — ask anything about markets, get data-backed answers |
| **AI Reasoning Engine** | Visual breakdown of bullish vs bearish factors with weighted indicator analysis |
| **Live AI Thinking** | Real-time thought stream showing what the AI is processing |
| **Chart Pattern Detection** | Automated recognition: Doji, Hammer, Engulfing, Morning/Evening Star, Shooting Star |
| **News Sentiment Analysis** | AI-powered sentiment scoring of financial news headlines with market impact assessment |

### 📊 Smart Money Concepts (SMC)
| Feature | Description |
|---------|-------------|
| **Order Block Detection** | Identifies bullish/bearish OBs from price displacement patterns |
| **Fair Value Gap (FVG)** | Detects imbalances in 3-candle patterns for gap-fill trade setups |
| **Liquidity Zone Mapping** | Maps buy-side and sell-side liquidity pools from recent price clusters |
| **Break of Structure** | JARVIS references BOS, liquidity sweeps, and SMC terminology naturally |

### 📈 Technical Analysis Engine
> All indicators are computed **server-side** in real-time, not mocked:
- **RSI (14)** — Relative Strength Index with Wilder smoothing
- **MACD** — 12/26/9 configuration with histogram
- **EMA (20) & SMA (50)** — Dynamic and static trend filters
- **Bollinger Bands** — 20-period with 2σ standard deviation
- **Fibonacci Retracement** — Automatic swing high/low detection with 6 key levels

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        TRADENOVA X                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    WebSocket     ┌──────────────────────────┐  │
│  │   Binance    │ ──────────────► │                          │  │
│  │   (Crypto)   │                 │   Node.js + Express      │  │
│  └─────────────┘                  │   Backend Server         │  │
│                                   │                          │  │
│  ┌─────────────┐    WebSocket     │  ┌────────────────────┐  │  │
│  │ Twelve Data  │ ──────────────► │  │ Market Data Engine │  │  │
│  │   (Forex)    │                 │  └────────────────────┘  │  │
│  └─────────────┘                  │  ┌────────────────────┐  │  │
│                                   │  │ Technical Analysis │  │  │
│  ┌─────────────┐    REST API      │  │    (RSI, MACD,     │  │  │
│  │  Gemini AI   │ ◄─────────────► │  │  Bollinger, SMC)   │  │  │
│  │  2.5 Flash   │                 │  └────────────────────┘  │  │
│  └─────────────┘                  │  ┌────────────────────┐  │  │
│                                   │  │  AI Prediction &   │  │  │
│  ┌─────────────┐    Prisma ORM    │  │  Copilot Service   │  │  │
│  │  PostgreSQL  │ ◄─────────────► │  └────────────────────┘  │  │
│  │  (Supabase)  │                 │                          │  │
│  └─────────────┘                  └──────────┬───────────────┘  │
│                                        Socket.IO                │
│                                          │                      │
│                                          ▼                      │
│                              ┌──────────────────────┐           │
│                              │  Next.js 16 Frontend  │           │
│                              │  (React 19 + Three.js)│           │
│                              │                      │           │
│                              │  • TradingView Chart │           │
│                              │  • AI Command Center │           │
│                              │  • JARVIS Copilot    │           │
│                              │  • Multi-Asset Scan  │           │
│                              │  • Cyberpunk UI      │           │
│                              └──────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 16** | React framework with App Router & Server Components |
| **React 19** | Latest React with improved server-side rendering |
| **TypeScript 5** | Type-safe development across the entire frontend |
| **Tailwind CSS 4** | Utility-first styling with custom cyberpunk design system |
| **Framer Motion** | Smooth page transitions and micro-animations |
| **Three.js + R3F** | 3D holographic Earth on the landing page |
| **Recharts** | Data visualization for performance metrics |
| **Socket.IO Client** | Real-time bidirectional communication |
| **TradingView Widget** | Professional-grade charting |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express 5** | High-performance HTTP server |
| **Socket.IO** | Real-time WebSocket event broadcasting |
| **Google Gemini 2.5 Flash** | AI predictions, copilot chat, and news sentiment |
| **Prisma 7** | Type-safe PostgreSQL ORM |
| **WebSocket (ws)** | Direct connections to Binance & Twelve Data |
| **express-rate-limit** | API abuse prevention |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| **Supabase** | Managed PostgreSQL database |
| **Binance WebSocket API** | Real-time crypto market data (BTC, ETH) |
| **Twelve Data WebSocket** | Real-time forex data (EUR/USD, GBP/USD) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- A [Gemini API Key](https://aistudio.google.com/apikey) (free)

### 1. Clone the Repository
```bash
git clone https://github.com/zaid46kazi-wq/Trade-NOVAX.git
cd Trade-NOVAX
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your API keys
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
cp .env.example .env.local
# Edit .env.local and configure your URLs
```

### 4. Run Development Servers
```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

### 5. Open the App
Navigate to **[http://localhost:3000](http://localhost:3000)** — the landing page loads with a 3D Earth. Click **"Launch Terminal"** to enter the trading dashboard.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
DATABASE_URL="postgresql://..."     # Supabase connection string
GEMINI_API_KEY="AIza..."            # Google AI Studio
BINANCE_API_KEY=""                  # Binance API (optional)
BINANCE_API_SECRET=""               # Binance Secret (optional)
TWELVE_DATA_API_KEY=""              # Twelve Data (optional)
FRONTEND_URL="http://localhost:3000" # CORS whitelist
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
```

> ⚠️ **All `.env` files are gitignored.** API keys are never committed. Only `.env.example` templates are in the repo.

---

## 📂 Project Structure

```
Trade-NOVAX/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment configuration
│   │   ├── services/
│   │   │   ├── aiPrediction.ts    # Gemini AI + rule-based fallback
│   │   │   ├── marketData.ts      # WebSocket engine (Binance + Twelve Data)
│   │   │   └── db.ts              # Prisma database client
│   │   ├── utils/
│   │   │   └── technicalAnalysis.ts  # RSI, MACD, Bollinger, Fibonacci, SMC
│   │   ├── server.ts         # Express routes + Socket.IO + Copilot endpoint
│   │   └── index.ts          # Entry point
│   ├── prisma/
│   │   └── schema.prisma     # Database models (User, Subscription, Predictions)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Landing page (Server Component)
│   │   │   ├── terminal/page.tsx  # Trading terminal dashboard
│   │   │   ├── layout.tsx         # Root layout with ambient effects
│   │   │   └── globals.css        # Cyberpunk design system
│   │   ├── components/
│   │   │   ├── Terminal/
│   │   │   │   ├── AICopilot.tsx          # JARVIS conversational AI
│   │   │   │   ├── AITradeCommandCenter.tsx # Trade signal display
│   │   │   │   ├── AIReasoning.tsx        # Bullish/Bearish factor analysis
│   │   │   │   ├── LiveAIThinking.tsx     # Real-time AI thought stream
│   │   │   │   ├── MultiAssetScanner.tsx  # Cross-market scanner
│   │   │   │   ├── TopOpportunities.tsx   # AI-ranked trade ticker
│   │   │   │   ├── TVChart.tsx            # TradingView integration
│   │   │   │   └── ... (14 more components)
│   │   │   ├── LandingHero.tsx    # Animated landing with Three.js
│   │   │   └── ThreeEarth.tsx     # 3D holographic globe
│   │   └── lib/
│   │       └── socket.ts         # Socket.IO client singleton
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🌐 Deployment

| Layer | Platform | Notes |
|-------|----------|-------|
| **Frontend** | [Vercel](https://vercel.com) | Zero-config Next.js deployment, auto-deploys from GitHub |
| **Backend** | [Render](https://render.com) | Supports WebSockets, persistent Node.js instance |
| **Database** | [Supabase](https://supabase.com) | Managed PostgreSQL with free tier |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |
| `GET` | `/api/candles/:pair` | Get candle history for a trading pair |
| `POST` | `/api/predict/:pair` | Generate AI prediction with technical analysis |
| `POST` | `/api/news/sentiment` | Analyze news headlines for market sentiment |
| `POST` | `/api/copilot/chat` | JARVIS conversational AI with market context |

### WebSocket Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `ticker` | Server → Client | Real-time price updates |
| `new_candle` | Server → Client | New candle formation |
| `orderbook` | Server → Client | Order book depth updates |
| `prediction` | Server → Client | Auto-generated AI predictions |
| `subscribe` | Client → Server | Subscribe to a trading pair |
| `unsubscribe` | Client → Server | Unsubscribe from a pair |

---

## 🎨 Design Philosophy

TradeNova X follows a **cyberpunk-futuristic** design language:

- **Glassmorphism** — Frosted glass panels with `backdrop-filter: blur(20px)` and subtle cyan borders
- **Aurora Background** — Animated gradient shifting between deep space colors
- **Holographic Overlays** — Flickering scanline textures for a sci-fi terminal feel
- **Neon Accents** — Cyan (`#00F0FF`) as the primary action color, emerald for bullish, rose for bearish
- **Micro-Animations** — Every interaction has feedback: hover glows, pulse indicators, spring transitions

---

## 📄 License

This project is for educational and demonstration purposes.

---

<div align="center">

**Built with 🧠 by [Zaid Kazi](https://github.com/zaid46kazi-wq)**

*TradeNova X — Where AI Meets the Markets*

</div>
