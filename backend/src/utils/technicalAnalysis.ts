export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Indicators {
  rsi: number;
  macd: { macd: number; signal: number; histogram: number };
  ema20: number;
  sma50: number;
  bollinger: { upper: number; middle: number; lower: number };
  fibonacci: Record<string, number>;
}

export interface SMCFeatures {
  orderBlocks: { price: number; type: 'Bullish' | 'Bearish' }[];
  fvg: { top: number; bottom: number; type: 'Bullish' | 'Bearish' }[];
  liquidityZones: { price: number; type: 'BuySide' | 'SellSide' }[];
}

export class TechnicalAnalysis {
  public static calculateRSI(candles: Candle[], period = 14): number {
    if (candles.length < period + 1) return 50;
    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const diff = candles[i].close - candles[i - 1].close;
      if (diff > 0) gains += diff;
      else losses -= diff;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period + 1; i < candles.length; i++) {
      const diff = candles[i].close - candles[i - 1].close;
      avgGain = (avgGain * 13 + (diff > 0 ? diff : 0)) / 14;
      avgLoss = (avgLoss * 13 + (diff < 0 ? -diff : 0)) / 14;
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  public static calculateMACD(candles: Candle[]): { macd: number; signal: number; histogram: number } {
    const closes = candles.map(c => c.close);
    if (closes.length < 26) return { macd: 0, signal: 0, histogram: 0 };

    const ema12 = this.calculateEMA(closes, 12);
    const ema26 = this.calculateEMA(closes, 26);
    const macdLine = ema12[ema12.length - 1] - ema26[ema26.length - 1];

    // Signal line is 9 EMA of MACD
    const macdHistory: number[] = [];
    for (let i = 26; i <= closes.length; i++) {
      const e12 = this.calculateEMA(closes.slice(0, i), 12);
      const e26 = this.calculateEMA(closes.slice(0, i), 26);
      macdHistory.push(e12[e12.length - 1] - e26[e26.length - 1]);
    }

    const signalLine = this.calculateEMA(macdHistory, 9).pop() || 0;
    return {
      macd: macdLine,
      signal: signalLine,
      histogram: macdLine - signalLine
    };
  }

  public static calculateEMA(values: number[], period: number): number[] {
    const ema: number[] = [];
    if (values.length === 0) return [];
    
    let k = 2 / (period + 1);
    let sum = 0;
    for (let i = 0; i < Math.min(period, values.length); i++) {
      sum += values[i];
    }
    let currentEma = sum / Math.min(period, values.length);
    ema.push(currentEma);

    for (let i = period; i < values.length; i++) {
      currentEma = values[i] * k + currentEma * (1 - k);
      ema.push(currentEma);
    }
    return ema;
  }

  public static calculateSMA(values: number[], period: number): number {
    if (values.length < period) return values[values.length - 1] || 0;
    const slice = values.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
  }

  public static calculateBollingerBands(candles: Candle[], period = 20, multiplier = 2) {
    const closes = candles.map(c => c.close);
    if (closes.length < period) return { upper: 0, middle: 0, lower: 0 };

    const sma = this.calculateSMA(closes, period);
    const variance = closes.slice(-period).reduce((acc, val) => acc + Math.pow(val - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    return {
      upper: sma + multiplier * stdDev,
      middle: sma,
      lower: sma - multiplier * stdDev
    };
  }

  public static calculateFibonacci(candles: Candle[]): Record<string, number> {
    if (candles.length === 0) return {};
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const max = Math.max(...highs);
    const min = Math.min(...lows);
    const diff = max - min;

    return {
      '0.0': max,
      '23.6': max - diff * 0.236,
      '38.2': max - diff * 0.382,
      '50.0': max - diff * 0.5,
      '61.8': max - diff * 0.618,
      '78.6': max - diff * 0.786,
      '100.0': min
    };
  }

  // Detect candlestick patterns
  public static detectPattern(candles: Candle[]): string {
    if (candles.length < 3) return 'None';
    
    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];
    const prev2 = candles[candles.length - 3];

    const body = Math.abs(last.close - last.open);
    const range = last.high - last.low;
    const upperShadow = last.high - Math.max(last.open, last.close);
    const lowerShadow = Math.min(last.open, last.close) - last.low;

    // Doji
    if (body <= range * 0.1) {
      return 'Doji';
    }

    // Hammer
    if (lowerShadow >= body * 2 && upperShadow <= body * 0.5) {
      return 'Hammer';
    }

    // Shooting Star
    if (upperShadow >= body * 2 && lowerShadow <= body * 0.5) {
      return 'Shooting Star';
    }

    // Bullish Engulfing
    if (prev.close < prev.open && last.close > last.open && last.close > prev.open && last.open < prev.close) {
      return 'Bullish Engulfing';
    }

    // Bearish Engulfing
    if (prev.close > prev.open && last.close < last.open && last.close < prev.open && last.open > prev.close) {
      return 'Bearish Engulfing';
    }

    // Morning Star
    if (prev2.close < prev2.open && Math.abs(prev.close - prev.open) < (prev2.open - prev2.close) * 0.3 && last.close > last.open && last.close > (prev2.open + prev2.close) / 2) {
      return 'Morning Star';
    }

    // Evening Star
    if (prev2.close > prev2.open && Math.abs(prev.close - prev.open) < (prev2.close - prev2.open) * 0.3 && last.close < last.open && last.close < (prev2.open + prev2.close) / 2) {
      return 'Evening Star';
    }

    return 'Neutral Structure';
  }

  // SMC (Smart Money Concepts) Calculations
  public static analyzeSMC(candles: Candle[]): SMCFeatures {
    const orderBlocks: { price: number; type: 'Bullish' | 'Bearish' }[] = [];
    const fvg: { top: number; bottom: number; type: 'Bullish' | 'Bearish' }[] = [];
    const liquidityZones: { price: number; type: 'BuySide' | 'SellSide' }[] = [];

    if (candles.length < 5) return { orderBlocks, fvg, liquidityZones };

    // FVG: Fair Value Gap detection (3-candle pattern)
    for (let i = 1; i < candles.length - 1; i++) {
      const c1 = candles[i - 1];
      const c3 = candles[i + 1];

      // Bullish FVG: Low of candle 3 is greater than high of candle 1
      if (c3.low > c1.high) {
        fvg.push({ top: c3.low, bottom: c1.high, type: 'Bullish' });
      }
      // Bearish FVG: High of candle 3 is less than low of candle 1
      else if (c3.high < c1.low) {
        fvg.push({ top: c1.low, bottom: c3.high, type: 'Bearish' });
      }
    }

    // Order Blocks (Last down candle before strong up move, or vice versa)
    for (let i = 2; i < candles.length - 2; i++) {
      const cPrev = candles[i - 1];
      const cCurr = candles[i];
      const cNext = candles[i + 1];
      const cNext2 = candles[i + 2];

      // Bullish Order Block (OB): Down candle followed by displacement upward
      if (cCurr.close < cCurr.open && cNext.close > cNext.open && cNext2.close > cNext2.open && (cNext2.close - cCurr.open) > (cCurr.open - cCurr.close) * 2) {
        orderBlocks.push({ price: cCurr.low, type: 'Bullish' });
      }

      // Bearish Order Block (OB): Up candle followed by displacement downward
      if (cCurr.close > cCurr.open && cNext.close < cNext.open && cNext2.close < cNext2.open && (cCurr.open - cNext2.close) > (cCurr.close - cCurr.open) * 2) {
        orderBlocks.push({ price: cCurr.high, type: 'Bearish' });
      }
    }

    // Liquidity Pools / Zones (Recent high/low clusters)
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const maxHigh = Math.max(...highs.slice(-20));
    const minLow = Math.min(...lows.slice(-20));

    liquidityZones.push({ price: maxHigh, type: 'BuySide' });
    liquidityZones.push({ price: minLow, type: 'SellSide' });

    return { orderBlocks, fvg, liquidityZones };
  }
}
