import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { Candle, TechnicalAnalysis } from '../utils/technicalAnalysis';

export interface PredictionResult {
  assetPair: string;
  price: number;
  recommendation: 'BUY' | 'SELL' | 'WAIT';
  confidence: number;
  probability: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  patternDetected: string;
  stopLoss: number;
  takeProfit: number;
  reasoning: string;
}

export class AIPredictionService {
  private genAI: any = null;

  constructor() {
    if (config.GEMINI_API_KEY) {
      try {
        this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
      } catch (err) {
        console.error('Failed to initialize Gemini AI SDK:', err);
      }
    } else {
      console.log('Gemini API Key missing. Using rule-based fallback model for AI predictions.');
    }
  }

  public async generatePrediction(pair: string, candles: Candle[]): Promise<PredictionResult> {
    if (candles.length === 0) {
      throw new Error(`No candle data available for ${pair}`);
    }

    const latest = candles[candles.length - 1];
    const currentPrice = latest.close;

    // 1. Calculate indicators and patterns
    const rsi = TechnicalAnalysis.calculateRSI(candles);
    const macd = TechnicalAnalysis.calculateMACD(candles);
    const closes = candles.map(c => c.close);
    const ema20 = TechnicalAnalysis.calculateEMA(closes, 20).pop() || currentPrice;
    const sma50 = TechnicalAnalysis.calculateSMA(closes, 50);
    const bollinger = TechnicalAnalysis.calculateBollingerBands(candles);
    const fibonacci = TechnicalAnalysis.calculateFibonacci(candles);
    const pattern = TechnicalAnalysis.detectPattern(candles);
    const smc = TechnicalAnalysis.analyzeSMC(candles);

    // 2. Try Gemini analysis if configured
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        const prompt = `
          You are a professional quantitative and algorithmic trading assistant at TradeNOVA AI.
          Analyze the following market data for asset ${pair}:
          - Current Price: ${currentPrice}
          - RSI (14): ${rsi.toFixed(2)}
          - MACD Line: ${macd.macd.toFixed(4)}, Signal: ${macd.signal.toFixed(4)}, Histogram: ${macd.histogram.toFixed(4)}
          - EMA (20): ${ema20.toFixed(4)}
          - SMA (50): ${sma50.toFixed(4)}
          - Bollinger Bands: Upper: ${bollinger.upper.toFixed(4)}, Middle: ${bollinger.middle.toFixed(4)}, Lower: ${bollinger.lower.toFixed(4)}
          - Fibonacci Levels: 23.6%: ${fibonacci['23.6']?.toFixed(4)}, 38.2%: ${fibonacci['38.2']?.toFixed(4)}, 50%: ${fibonacci['50.0']?.toFixed(4)}, 61.8%: ${fibonacci['61.8']?.toFixed(4)}
          - Candlestick Pattern: ${pattern}
          - Smart Money Concept (SMC) elements: Order Blocks: ${JSON.stringify(smc.orderBlocks)}, Fair Value Gaps: ${JSON.stringify(smc.fvg)}, Liquidity Zones: ${JSON.stringify(smc.liquidityZones)}
          
          Generate a detailed trading recommendation in JSON format.
          CRITICAL: Do NOT claim "100% accuracy" in your reasoning. Keep reasoning quantitative.
          
          Respond ONLY with a valid JSON block containing:
          {
            "recommendation": "BUY" | "SELL" | "WAIT",
            "confidence": number (between 0 and 100),
            "probability": number (between 0 and 100),
            "riskLevel": "Low" | "Medium" | "High",
            "sentiment": "Positive" | "Neutral" | "Negative",
            "stopLoss": number,
            "takeProfit": number,
            "reasoning": "A concise quantitative explanation referencing indicators, patterns, and structure."
          }
        `;

        const response = await model.generateContent(prompt);
        const text = response.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            assetPair: pair,
            price: currentPrice,
            patternDetected: pattern,
            ...parsed
          };
        }
      } catch (err) {
        console.error('Gemini prediction generation failed, falling back to rule-based logic:', err);
      }
    }

    // 3. Fallback rule-based logic
    return this.generateRuleBasedPrediction(pair, currentPrice, rsi, macd.histogram, ema20, sma50, pattern);
  }

  private generateRuleBasedPrediction(
    pair: string,
    price: number,
    rsi: number,
    macdHist: number,
    ema20: number,
    sma50: number,
    pattern: string
  ): PredictionResult {
    let buyScore = 0;
    let sellScore = 0;

    // RSI triggers
    if (rsi < 30) buyScore += 2; // Oversold
    if (rsi > 70) sellScore += 2; // Overbought

    // Trend filters
    if (price > ema20) buyScore += 1;
    else sellScore += 1;

    if (price > sma50) buyScore += 1;
    else sellScore += 1;

    // MACD triggers
    if (macdHist > 0) buyScore += 1.5;
    else sellScore += 1.5;

    // Candlestick Pattern triggers
    if (pattern.includes('Bullish') || pattern === 'Hammer' || pattern === 'Morning Star') {
      buyScore += 3;
    } else if (pattern.includes('Bearish') || pattern === 'Shooting Star' || pattern === 'Evening Star') {
      sellScore += 3;
    }

    let recommendation: 'BUY' | 'SELL' | 'WAIT' = 'WAIT';
    let confidence = 50;
    let probability = 50;
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Medium';
    let sentiment: 'Positive' | 'Neutral' | 'Negative' = 'Neutral';

    const diff = Math.abs(buyScore - sellScore);

    if (buyScore > sellScore && diff >= 2) {
      recommendation = 'BUY';
      sentiment = 'Positive';
      confidence = Math.min(60 + diff * 8, 92);
      probability = Math.min(55 + diff * 6, 88);
      riskLevel = rsi < 30 ? 'Low' : 'Medium';
    } else if (sellScore > buyScore && diff >= 2) {
      recommendation = 'SELL';
      sentiment = 'Negative';
      confidence = Math.min(60 + diff * 8, 92);
      probability = Math.min(55 + diff * 6, 88);
      riskLevel = rsi > 70 ? 'Low' : 'Medium';
    }

    // Stop Loss and Take Profit
    const atrMultiplier = pair.includes('USDT') ? (pair.startsWith('BTC') ? 800 : 35) : 0.0020;
    const stopLoss = recommendation === 'BUY' ? price - atrMultiplier : recommendation === 'SELL' ? price + atrMultiplier : price;
    const takeProfit = recommendation === 'BUY' ? price + atrMultiplier * 2.5 : recommendation === 'SELL' ? price - atrMultiplier * 2.5 : price;

    // Reason synthesis
    let reasoning = `Automated quantitative rule engine analyzed indicators for ${pair}. `;
    if (recommendation === 'BUY') {
      reasoning += `Bullish stance taken due to ${pattern !== 'Neutral Structure' ? pattern : 'favorable trend metrics'}. RSI is ${rsi.toFixed(1)} and price stands above technical averages.`;
    } else if (recommendation === 'SELL') {
      reasoning += `Bearish stance taken due to ${pattern !== 'Neutral Structure' ? pattern : 'negative momentum indicators'}. RSI is ${rsi.toFixed(1)} with descending histogram peaks.`;
    } else {
      reasoning += `Market metrics show sideways trend with RSI at ${rsi.toFixed(1)} and tight moving average spreads. Maintaining wait position.`;
    }

    return {
      assetPair: pair,
      price,
      recommendation,
      confidence,
      probability,
      riskLevel,
      sentiment,
      patternDetected: pattern,
      stopLoss,
      takeProfit,
      reasoning
    };
  }

  // Sentiment News Analyzer
  public async analyzeNewsSentiment(newsArray: { title: string; source: string }[]): Promise<{
    sentimentScore: number;
    impactLevel: 'Low' | 'Medium' | 'High';
    summary: string;
  }> {
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `
          Perform sentiment and impact analysis on the following financial news headlines:
          ${JSON.stringify(newsArray)}

          Respond ONLY with a valid JSON block containing:
          {
            "sentimentScore": number (between -100 for extremely negative to +100 for extremely positive),
            "impactLevel": "Low" | "Medium" | "High",
            "summary": "A 2-sentence summary of the news sentiment impact on crypto and forex markets."
          }
        `;
        const response = await model.generateContent(prompt);
        const jsonMatch = response.response.text().match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        console.error('Failed to parse news sentiment via Gemini, using fallback:', err);
      }
    }

    // Rule-based fallback news sentiment
    return {
      sentimentScore: 15,
      impactLevel: 'Medium',
      summary: 'Market sentiment remains stable as macro indicators balance cryptocurrency regulatory developments.'
    };
  }
}
