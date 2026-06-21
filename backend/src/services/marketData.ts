import WebSocket from 'ws';
import { Server as SocketIOServer } from 'socket.io';
import { config } from '../config';

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class MarketDataEngine {
  private io: SocketIOServer;
  private binanceWs: WebSocket | null = null;
  private twelveDataWs: WebSocket | null = null;
  private activePairs: Set<string> = new Set(['BTCUSDT', 'ETHUSDT', 'EURUSD', 'GBPUSD']);
  private candleHistory: Record<string, Candle[]> = {};

  constructor(io: SocketIOServer) {
    this.io = io;
    this.initializeHistory();
  }

  private initializeHistory() {
    this.activePairs.forEach(pair => {
      this.candleHistory[pair] = this.generateHistoricalData(pair, 50);
    });
  }

  // Generate historical data for charts
  private generateHistoricalData(pair: string, count: number): Candle[] {
    const candles: Candle[] = [];
    let price = pair.includes('USDT') ? (pair.startsWith('BTC') ? 95000 : 3500) : 1.1000;
    let time = Date.now() - count * 60 * 1000;

    for (let i = 0; i < count; i++) {
      const change = price * (Math.random() - 0.5) * 0.002;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + price * Math.random() * 0.001;
      const low = Math.min(open, close) - price * Math.random() * 0.001;
      const volume = Math.random() * (pair.includes('USDT') ? 100 : 100000);

      candles.push({ time, open, high, low, close, volume });
      price = close;
      time += 60 * 1000;
    }
    return candles;
  }

  public getHistory(pair: string): Candle[] {
    return this.candleHistory[pair] || [];
  }

  public start() {
    console.log('Starting Market Data Engine...');
    this.connectBinance();
    this.connectTwelveData();
  }

  private connectBinance() {
    // Setup Binance WS connection for Crypto
    // Format: wss://stream.binance.com:9443/ws/btcusdt@kline_1m/ethusdt@kline_1m/btcusdt@depth/ethusdt@depth
    const streams = 'btcusdt@kline_1m/ethusdt@kline_1m/btcusdt@depth5/ethusdt@depth5';
    const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;

    console.log(`Connecting to Binance WebSocket: ${wsUrl}`);
    this.binanceWs = new WebSocket(wsUrl);

    this.binanceWs.on('open', () => {
      console.log('Connected to Binance WebSocket API.');
    });

    this.binanceWs.on('message', (data: WebSocket.Data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.e === 'kline') {
          const pair = msg.s; // e.g. BTCUSDT
          const k = msg.k;
          const candle: Candle = {
            time: k.t,
            open: parseFloat(k.o),
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: parseFloat(k.c),
            volume: parseFloat(k.v),
          };

          // Update history
          const history = this.candleHistory[pair] || [];
          if (history.length > 0 && history[history.length - 1].time === candle.time) {
            history[history.length - 1] = candle;
          } else {
            history.push(candle);
            if (history.length > 100) history.shift();
            // Emit new candle event
            this.io.emit('new_candle', { pair, candle });
          }

          // Emit live ticker update
          this.io.emit('ticker', {
            pair,
            price: candle.close,
            change: ((candle.close - candle.open) / candle.open) * 100,
            volume: candle.volume,
            timestamp: Date.now(),
          });
        } else if (msg.bids && msg.asks) {
          // Depth / Order book data
          // s is not always present in depth event format depending on endpoint, 
          // but stream name parameter or path can specify it.
          // For simplicity, we parse stream name or fallback to BTCUSDT
          const pair = msg.s || 'BTCUSDT'; 
          this.io.emit('orderbook', {
            pair,
            bids: msg.bids.slice(0, 10),
            asks: msg.asks.slice(0, 10),
          });
        }
      } catch (err) {
        console.error('Error parsing Binance WS message:', err);
      }
    });

    this.binanceWs.on('error', (err) => {
      console.error('Binance WebSocket error:', err);
      this.startMockEngine('BTCUSDT');
      this.startMockEngine('ETHUSDT');
    });

    this.binanceWs.on('close', () => {
      console.log('Binance WebSocket closed. Reconnecting in 5s...');
      setTimeout(() => this.connectBinance(), 5000);
    });
  }

  private connectTwelveData() {
    const apiKey = config.TWELVE_DATA_API_KEY;
    if (!apiKey) {
      console.log('Twelve Data API Key missing. Starting Mock Engine for Forex pairs.');
      this.startMockEngine('EURUSD');
      this.startMockEngine('GBPUSD');
      return;
    }

    const wsUrl = `wss://ws.twelvedata.com/v1/quotes/price?apikey=${apiKey}`;
    console.log('Connecting to Twelve Data WebSocket...');
    this.twelveDataWs = new WebSocket(wsUrl);

    this.twelveDataWs.on('open', () => {
      console.log('Connected to Twelve Data WebSocket API.');
      // Subscribe to Forex pairs
      const subscribeMsg = {
        action: 'subscribe',
        params: {
          symbols: 'EUR/USD,GBP/USD',
        },
      };
      this.twelveDataWs?.send(JSON.stringify(subscribeMsg));
    });

    this.twelveDataWs.on('message', (data: WebSocket.Data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.event === 'price') {
          const rawSymbol = msg.symbol; // e.g. EUR/USD
          const pair = rawSymbol.replace('/', ''); // e.g. EURUSD
          const price = parseFloat(msg.price);
          const timestamp = msg.timestamp * 1000;

          // Update candle history
          const history = this.candleHistory[pair] || [];
          const lastCandle = history[history.length - 1];
          const now = Date.now();
          const currentMinute = Math.floor(now / 60000) * 60000;

          if (lastCandle && lastCandle.time === currentMinute) {
            lastCandle.close = price;
            lastCandle.high = Math.max(lastCandle.high, price);
            lastCandle.low = Math.min(lastCandle.low, price);
          } else {
            const newCandle: Candle = {
              time: currentMinute,
              open: lastCandle ? lastCandle.close : price,
              high: price,
              low: price,
              close: price,
              volume: Math.random() * 10000,
            };
            history.push(newCandle);
            if (history.length > 100) history.shift();
            this.io.emit('new_candle', { pair, candle: newCandle });
          }

          this.io.emit('ticker', {
            pair,
            price,
            change: lastCandle ? ((price - lastCandle.open) / lastCandle.open) * 100 : 0,
            volume: lastCandle ? lastCandle.volume : 0,
            timestamp,
          });
        }
      } catch (err) {
        console.error('Error parsing Twelve Data WS message:', err);
      }
    });

    this.twelveDataWs.on('error', (err) => {
      console.error('Twelve Data WebSocket error:', err);
      this.startMockEngine('EURUSD');
      this.startMockEngine('GBPUSD');
    });

    this.twelveDataWs.on('close', () => {
      console.log('Twelve Data WebSocket closed. Reconnecting in 5s...');
      setTimeout(() => this.connectTwelveData(), 5000);
    });
  }

  // Generates real-time mock updates for fallback
  private startMockEngine(pair: string) {
    console.log(`Starting Mock Real-Time Ticker for ${pair}`);
    setInterval(() => {
      const history = this.candleHistory[pair] || [];
      if (history.length === 0) return;

      const lastCandle = history[history.length - 1];
      const now = Date.now();
      const currentMinute = Math.floor(now / 60000) * 60000;

      // Price fluctuations
      const volatility = pair.includes('USDT') ? (pair.startsWith('BTC') ? 25 : 1.5) : 0.0001;
      const currentPrice = lastCandle.close + (Math.random() - 0.5) * volatility;

      if (lastCandle.time === currentMinute) {
        lastCandle.close = currentPrice;
        lastCandle.high = Math.max(lastCandle.high, currentPrice);
        lastCandle.low = Math.min(lastCandle.low, currentPrice);
      } else {
        const newCandle: Candle = {
          time: currentMinute,
          open: lastCandle.close,
          high: currentPrice,
          low: currentPrice,
          close: currentPrice,
          volume: Math.random() * (pair.includes('USDT') ? 100 : 50000),
        };
        history.push(newCandle);
        if (history.length > 100) history.shift();
        this.io.emit('new_candle', { pair, candle: newCandle });
      }

      this.io.emit('ticker', {
        pair,
        price: currentPrice,
        change: ((currentPrice - lastCandle.open) / lastCandle.open) * 100,
        volume: lastCandle.volume,
        timestamp: Date.now(),
      });
    }, 1000);
  }
}
