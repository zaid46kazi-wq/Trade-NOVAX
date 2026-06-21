import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { MarketDataEngine } from './services/marketData';
import { AIPredictionService } from './services/aiPrediction';
import prisma from './services/db';

export function createServer() {
  const app = express();
  const server = http.createServer(app);
  
  const frontendUrl = process.env.FRONTEND_URL || '*';

  // Setup Socket.io
  const io = new SocketIOServer(server, {
    cors: {
      origin: frontendUrl,
      methods: ['GET', 'POST'],
    },
  });

  app.use(cors({ origin: frontendUrl }));
  app.use(express.json());

  // Rate Limiting for APIs
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
  });
  
  app.use('/api/', apiLimiter);

  // Initialize Engines
  const marketEngine = new MarketDataEngine(io);
  const aiService = new AIPredictionService();

  // Basic health check
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
  });

  // REST API: Get Candle History
  app.get('/api/candles/:pair', (req, res) => {
    const pair = req.params.pair.toUpperCase();
    const history = marketEngine.getHistory(pair);
    res.json(history);
  });

  // REST API: Run Manual Prediction
  app.post('/api/predict/:pair', async (req, res) => {
    const pair = req.params.pair.toUpperCase();
    const history = marketEngine.getHistory(pair);

    if (history.length === 0) {
      res.status(404).json({ error: `No historical data available for ${pair}` });
      return;
    }

    try {
      const prediction = await aiService.generatePrediction(pair, history);
      
      // Optionally store in database if active connection
      try {
        await prisma.predictionLog.create({
          data: {
            assetPair: pair,
            predictionType: prediction.recommendation,
            confidence: prediction.confidence,
            riskLevel: prediction.riskLevel,
            entryPrice: prediction.price,
            takeProfit: prediction.takeProfit,
            stopLoss: prediction.stopLoss,
            patternDetected: prediction.patternDetected,
            sentiment: prediction.sentiment,
            reasoning: prediction.reasoning,
          }
        });
      } catch (dbErr) {
        // Suppress DB error in development if user has no connection string
        console.warn('DB Log skip: No database connection, proceeding with API response.');
      }

      res.json(prediction);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // REST API: News Intelligence Endpoint
  app.post('/api/news/sentiment', async (req, res) => {
    const { articles } = req.body;
    if (!articles || !Array.isArray(articles)) {
      res.status(400).json({ error: 'Articles array is required' });
      return;
    }

    try {
      const sentiment = await aiService.analyzeNewsSentiment(articles);
      res.json(sentiment);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ──────────────────────────────────────────────────────────
  // REST API: Jarvis Copilot Chat Endpoint (Gemini-powered)
  // ──────────────────────────────────────────────────────────
  app.post('/api/copilot/chat', async (req, res) => {
    const { messages, activePair } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'messages array is required' });
      return;
    }

    // Gather live market snapshots for context injection
    const watchedPairs = ['BTCUSDT', 'ETHUSDT', 'EURUSD', 'GBPUSD'];
    const marketSnapshots: string[] = [];
    for (const pair of watchedPairs) {
      const history = marketEngine.getHistory(pair);
      if (history.length > 0) {
        const latest = history[history.length - 1];
        const prev = history.length > 1 ? history[history.length - 2] : latest;
        const change = ((latest.close - prev.close) / prev.close * 100).toFixed(3);
        marketSnapshots.push(
          `${pair}: Price=$${latest.close.toFixed(pair.includes('USD') && !pair.includes('USDT') ? 5 : 2)}, ` +
          `O=${latest.open.toFixed(2)}, H=${latest.high.toFixed(2)}, L=${latest.low.toFixed(2)}, ` +
          `Vol=${latest.volume.toFixed(2)}, Change=${change}%`
        );
      }
    }

    // If user asked about a specific pair, provide deeper analysis
    let deepAnalysis = '';
    const targetPair = (activePair || '').toUpperCase();
    if (targetPair) {
      const history = marketEngine.getHistory(targetPair);
      if (history.length >= 5) {
        const { TechnicalAnalysis } = require('./utils/technicalAnalysis');
        const rsi = TechnicalAnalysis.calculateRSI(history);
        const macd = TechnicalAnalysis.calculateMACD(history);
        const closes = history.map((c: any) => c.close);
        const ema20 = TechnicalAnalysis.calculateEMA(closes, 20).pop() || 0;
        const sma50 = TechnicalAnalysis.calculateSMA(closes, 50);
        const bollinger = TechnicalAnalysis.calculateBollingerBands(history);
        const pattern = TechnicalAnalysis.detectPattern(history);
        const smc = TechnicalAnalysis.analyzeSMC(history);

        deepAnalysis = `
DEEP ANALYSIS FOR ${targetPair}:
- RSI(14): ${rsi.toFixed(2)}
- MACD: Line=${macd.macd.toFixed(4)}, Signal=${macd.signal.toFixed(4)}, Histogram=${macd.histogram.toFixed(4)}
- EMA(20): ${ema20.toFixed(4)}, SMA(50): ${sma50.toFixed(4)}
- Bollinger: Upper=${bollinger.upper.toFixed(4)}, Mid=${bollinger.middle.toFixed(4)}, Lower=${bollinger.lower.toFixed(4)}
- Pattern Detected: ${pattern}
- SMC Order Blocks: ${JSON.stringify(smc.orderBlocks)}
- SMC Fair Value Gaps: ${JSON.stringify(smc.fvg)}
- SMC Liquidity Zones: ${JSON.stringify(smc.liquidityZones)}`;
      }
    }

    const systemPrompt = `You are JARVIS — the world's most advanced AI trading copilot, built into TradeNova X.

PERSONALITY & RULES:
- You are confident, precise, and conversational. Think Tony Stark's JARVIS meets a Goldman Sachs quant.
- Always give actionable, data-backed answers. Never be vague or generic.
- Use real indicator values when available. Reference RSI, MACD, Bollinger Bands, EMA/SMA, candlestick patterns, Smart Money Concepts (SMC), order blocks, fair value gaps (FVGs), and liquidity sweeps.
- Format key numbers with $ signs and percentages. Use bullet points for clarity.
- When the user asks for a trade idea, ALWAYS include: Direction (BUY/SELL/WAIT), Entry Zone, Stop Loss, Take Profit, Risk/Reward ratio, Confidence %, and a brief reasoning.
- When the user asks general market questions, give thoughtful macro analysis referencing DXY, yields, or correlations where relevant.
- You may use trading slang naturally: "sweeping lows", "tapping into an OB", "filling an FVG", "liquidity grab", "break of structure (BOS)".
- Keep responses concise but rich. Avoid walls of text. Use line breaks and structure.
- If you don't have data for a specific asset, say so honestly and suggest what you CAN analyze.
- NEVER make up prices or indicators. Only use the data provided below.
- You can give multiple perspectives (e.g., bullish vs bearish scenarios).

LIVE MARKET DATA (real-time from TradeNova engine):
${marketSnapshots.length > 0 ? marketSnapshots.join('\n') : 'No live market data available at this moment.'}
${deepAnalysis}

Current UTC time: ${new Date().toISOString()}`;

    // Build Gemini chat from conversation history
    if (aiService['genAI']) {
      try {
        const model = aiService['genAI'].getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Convert messages into Gemini format
        const geminiHistory = messages.slice(0, -1).map((m: { role: string; text: string }) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        }));

        const chat = model.startChat({
          history: geminiHistory,
          systemInstruction: systemPrompt,
        });

        const lastMessage = messages[messages.length - 1].text;
        const result = await chat.sendMessage(lastMessage);
        const responseText = result.response.text();

        res.json({ reply: responseText });
      } catch (err: any) {
        console.error('Jarvis Copilot Gemini error:', err);
        // Fall through to rule-based fallback
        res.json({ reply: generateFallbackResponse(messages[messages.length - 1].text, marketSnapshots, targetPair) });
      }
    } else {
      res.json({ reply: generateFallbackResponse(messages[messages.length - 1].text, marketSnapshots, targetPair) });
    }
  });

  // Fallback response generator when Gemini is unavailable
  function generateFallbackResponse(userMessage: string, snapshots: string[], pair: string): string {
    const msg = userMessage.toLowerCase();
    const pairData = snapshots.find(s => s.includes(pair)) || snapshots[0] || '';

    if (msg.includes('btc') || msg.includes('bitcoin')) {
      const btcLine = snapshots.find(s => s.includes('BTCUSDT'));
      return `📊 **Bitcoin Analysis**\n\n${btcLine || 'BTC data currently loading...'}\n\nBased on the current session, BTC is consolidating near key levels. Watch for a break of structure above the current high for a bullish continuation, or a sweep of lows for a potential long entry.\n\n• Monitor RSI for divergence signals\n• Key support: Previous session low\n• Key resistance: Previous session high`;
    }

    if (msg.includes('eth') || msg.includes('ethereum')) {
      const ethLine = snapshots.find(s => s.includes('ETHUSDT'));
      return `📊 **Ethereum Analysis**\n\n${ethLine || 'ETH data currently loading...'}\n\nETH tends to follow BTC's lead with a slight lag. Look for ETH/BTC ratio changes to gauge relative strength. Current structure suggests watching the EMA(20) for dynamic support.`;
    }

    if (msg.includes('gold') || msg.includes('xau')) {
      return `📊 **Gold (XAUUSD) Outlook**\n\nGold remains a key safe-haven asset. In the current macro environment:\n• Watch DXY (Dollar Index) — inverse correlation\n• Rising yields typically pressure gold\n• Geopolitical tension = gold bid\n\nFor precise entry/exit levels, I need live XAUUSD data feed connected.`;
    }

    if (msg.includes('forex') || msg.includes('eur') || msg.includes('gbp')) {
      const fxLines = snapshots.filter(s => s.includes('EUR') || s.includes('GBP'));
      return `📊 **Forex Snapshot**\n\n${fxLines.join('\n') || 'Forex data loading...'}\n\nMajor pairs are reacting to central bank policy divergence. EUR and GBP movements are heavily tied to ECB/BOE rate decisions and US economic data releases.`;
    }

    if (msg.includes('best') && (msg.includes('trade') || msg.includes('setup') || msg.includes('opportunity'))) {
      return `🎯 **Top Setups Right Now**\n\nLet me scan the active pairs:\n\n${snapshots.join('\n')}\n\nFor the best setup, I'd look for:\n1. **Confluence** — RSI + MACD + pattern alignment\n2. **Clean structure** — Break of structure with retest\n3. **Risk/Reward** — Minimum 1:2 R:R\n\nAsk me about a specific pair and I'll give you the full breakdown with entry, SL, and TP levels.`;
    }

    if (msg.includes('risk') || msg.includes('safe')) {
      return `🛡️ **Risk Management Protocol**\n\n• Never risk more than 1-2% of your capital per trade\n• Always use stop losses — no exceptions\n• Position size = (Account Risk) / (Entry - Stop Loss)\n• Diversify across asset classes\n• Take partials at 1:1, trail the rest\n\nWant me to calculate position size for a specific trade?`;
    }

    // Generic fallback
    return `I'm analyzing the markets for you. Here's what I'm tracking:\n\n${snapshots.join('\n') || 'Market data is loading...'}\n\nAsk me about:\n• **Specific pairs** — "Analyze BTCUSDT" or "What's the setup on EURUSD?"\n• **Trade ideas** — "Best swing trade today"\n• **Risk management** — "Calculate my position size"\n• **Market analysis** — "What's the macro outlook?"`;
  }

  // Socket Connections & Events
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Allow user to join rooms for specific pairs to save bandwidth
    socket.on('subscribe', (pair: string) => {
      socket.join(pair.toUpperCase());
      console.log(`Client ${socket.id} subscribed to ${pair}`);
    });

    socket.on('unsubscribe', (pair: string) => {
      socket.leave(pair.toUpperCase());
      console.log(`Client ${socket.id} unsubscribed from ${pair}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Wire up prediction engine to trigger predictions whenever a new candle is formed
  io.on('connection', (socket) => {
    // We already have a global listener. The marketData engine emits 'new_candle' to all clients.
    // Let's also run prediction inside our backend and push it.
  });

  // Subscribe to market engine events locally to run prediction on new candle formation
  const activePredictions: Record<string, boolean> = {};
  io.on('new_candle', async (data: { pair: string; candle: any }) => {
    const { pair } = data;
    if (activePredictions[pair]) return; // Avoid overlapping predictions

    activePredictions[pair] = true;
    try {
      const history = marketEngine.getHistory(pair);
      if (history.length > 5) {
        const prediction = await aiService.generatePrediction(pair, history);
        io.emit('prediction', prediction);
      }
    } catch (err) {
      console.error(`AI Auto-prediction failed for ${pair}:`, err);
    } finally {
      activePredictions[pair] = false;
    }
  });

  // Start market data ws client listeners
  marketEngine.start();

  return server;
}
