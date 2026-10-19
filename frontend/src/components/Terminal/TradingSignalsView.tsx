"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TerminalCard } from "../ui/TerminalCard";
import { TerminalBadge } from "../ui/TerminalBadge";
import { marketDataService } from "../../lib/marketDataService";
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Info,
  RefreshCw,
} from "lucide-react";

export interface SignalReport {
  symbol: string;
  timeframe: string;
  verdict: "BULLISH" | "BEARISH" | "NEUTRAL";
  currentPrice: number;
  confluenceScore: number; // 0 to 100
  satisfiedRules: number;
  totalRules: number;
  supportingFactors: string[];
  contradictoryFactors: string[];
  invalidationLevel: number;
  suggestedStopLoss: number;
  suggestedTakeProfit: number;
  riskReward: string;
  rsiValue: number;
  macdHistogram: number;
  ema20: number;
  sma50: number;
  patternName: string;
  marketTimestamp: number;
  generatedTimestamp: number;
  methodology: string;
}

export default function TradingSignalsView({ defaultSymbol = "BTCUSDT" }: { defaultSymbol?: string }) {
  const [symbol, setSymbol] = useState<string>(defaultSymbol);
  const [timeframe, setTimeframe] = useState<string>("1h");
  const [signal, setSignal] = useState<SignalReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const evaluateSignal = useCallback(async (sym: string, tf: string) => {
    await Promise.resolve();
    setLoading(true);

    try {
      const candles = await marketDataService.fetchHistoricalCandles(sym, tf, 70);
      if (!candles || candles.length < 25) {
        setLoading(false);
        return;
      }

      const latest = candles[candles.length - 1];
      const closes = candles.map((c) => c.close);
      const currentPrice = latest.close;

      // 1. RSI (14)
      let gains = 0;
      let losses = 0;
      for (let i = 1; i <= 14; i++) {
        const diff = candles[i].close - candles[i - 1].close;
        if (diff > 0) gains += diff;
        else losses -= diff;
      }
      let avgGain = gains / 14;
      let avgLoss = losses / 14;
      for (let i = 15; i < candles.length; i++) {
        const diff = candles[i].close - candles[i - 1].close;
        avgGain = (avgGain * 13 + (diff > 0 ? diff : 0)) / 14;
        avgLoss = (avgLoss * 13 + (diff < 0 ? -diff : 0)) / 14;
      }
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - 100 / (1 + rs);

      // 2. EMA 20 & SMA 50
      const k20 = 2 / 21;
      let ema20 = closes.slice(0, 20).reduce((a, b) => a + b, 0) / 20;
      for (let i = 20; i < closes.length; i++) {
        ema20 = closes[i] * k20 + ema20 * (1 - k20);
      }
      const sma50Slice = closes.slice(-50);
      const sma50 = sma50Slice.reduce((a, b) => a + b, 0) / sma50Slice.length;

      // 3. Simple MACD Approximation (12, 26)
      const k12 = 2 / 13;
      let ema12 = closes.slice(0, 12).reduce((a, b) => a + b, 0) / 12;
      for (let i = 12; i < closes.length; i++) ema12 = closes[i] * k12 + ema12 * (1 - k12);

      const k26 = 2 / 27;
      let ema26 = closes.slice(0, 26).reduce((a, b) => a + b, 0) / 26;
      for (let i = 26; i < closes.length; i++) ema26 = closes[i] * k26 + ema26 * (1 - k26);
      const macdHistogram = ema12 - ema26;

      // 4. Pattern check
      const lastCandle = candles[candles.length - 1];
      const prevCandle = candles[candles.length - 2];
      let patternName = "Standard Trend";

      if (lastCandle.close > lastCandle.open && prevCandle.close < prevCandle.open && lastCandle.close > prevCandle.open) {
        patternName = "Bullish Engulfing";
      } else if (lastCandle.close < lastCandle.open && prevCandle.close > prevCandle.open && lastCandle.close < prevCandle.open) {
        patternName = "Bearish Engulfing";
      } else if (Math.abs(lastCandle.close - lastCandle.open) <= (lastCandle.high - lastCandle.low) * 0.1) {
        patternName = "Indecision Doji";
      }

      // Rules evaluation
      const supporting: string[] = [];
      const contradictory: string[] = [];
      let bullishPoints = 0;
      let bearishPoints = 0;
      const totalPointsPossible = 6;

      // Rule A: Trend Filter
      if (currentPrice > ema20) {
        bullishPoints++;
        supporting.push(`Price is trading above 20-period dynamic EMA ($${ema20.toFixed(2)})`);
      } else {
        bearishPoints++;
        contradictory.push(`Price is below 20-period dynamic EMA ($${ema20.toFixed(2)})`);
      }

      if (currentPrice > sma50) {
        bullishPoints++;
        supporting.push(`Macro alignment: Price holds above 50-period SMA ($${sma50.toFixed(2)})`);
      } else {
        bearishPoints++;
        contradictory.push(`Macro headwind: Price below 50-period SMA ($${sma50.toFixed(2)})`);
      }

      // Rule B: RSI Momentum
      if (rsi < 35) {
        bullishPoints += 1.5;
        supporting.push(`RSI(14) in oversold territory at ${rsi.toFixed(1)} — mean reversion potential`);
      } else if (rsi > 65) {
        bearishPoints += 1.5;
        contradictory.push(`RSI(14) in overbought territory at ${rsi.toFixed(1)} — elevated exhaustion risk`);
      } else {
        supporting.push(`RSI(14) balanced in neutral range at ${rsi.toFixed(1)}`);
      }

      // Rule C: MACD Momentum
      if (macdHistogram > 0) {
        bullishPoints++;
        supporting.push("MACD fast-line expanding above slow baseline (positive momentum)");
      } else {
        bearishPoints++;
        contradictory.push("MACD histogram negative (descending momentum)");
      }

      // Rule D: Candlestick Pattern
      if (patternName === "Bullish Engulfing") {
        bullishPoints += 1.5;
        supporting.push("Recent Bullish Engulfing candle confirms buyer absorption");
      } else if (patternName === "Bearish Engulfing") {
        bearishPoints += 1.5;
        contradictory.push("Recent Bearish Engulfing candle indicates seller pressure");
      }

      let verdict: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";
      let satisfied = 0;
      let invalidationLevel = 0;
      let suggestedStopLoss = 0;
      let suggestedTakeProfit = 0;

      const diff = bullishPoints - bearishPoints;
      const spread = currentPrice * 0.015;

      if (diff >= 1.5) {
        verdict = "BULLISH";
        satisfied = Math.min(6, Math.round(bullishPoints));
        invalidationLevel = Number((ema20 * 0.995).toFixed(currentPrice > 1 ? 2 : 5));
        suggestedStopLoss = Number((currentPrice - spread).toFixed(currentPrice > 1 ? 2 : 5));
        suggestedTakeProfit = Number((currentPrice + spread * 2.2).toFixed(currentPrice > 1 ? 2 : 5));
      } else if (diff <= -1.5) {
        verdict = "BEARISH";
        satisfied = Math.min(6, Math.round(bearishPoints));
        invalidationLevel = Number((ema20 * 1.005).toFixed(currentPrice > 1 ? 2 : 5));
        suggestedStopLoss = Number((currentPrice + spread).toFixed(currentPrice > 1 ? 2 : 5));
        suggestedTakeProfit = Number((currentPrice - spread * 2.2).toFixed(currentPrice > 1 ? 2 : 5));
      } else {
        verdict = "NEUTRAL";
        satisfied = 3;
        invalidationLevel = currentPrice;
        suggestedStopLoss = currentPrice;
        suggestedTakeProfit = currentPrice;
      }

      const confluenceScore = Math.round((satisfied / totalPointsPossible) * 100);

      setSignal({
        symbol: sym,
        timeframe: tf,
        verdict,
        currentPrice,
        confluenceScore,
        satisfiedRules: satisfied,
        totalRules: totalPointsPossible,
        supportingFactors: supporting,
        contradictoryFactors: contradictory,
        invalidationLevel,
        suggestedStopLoss,
        suggestedTakeProfit,
        riskReward: "1 : 2.20",
        rsiValue: Number(rsi.toFixed(1)),
        macdHistogram: Number(macdHistogram.toFixed(4)),
        ema20: Number(ema20.toFixed(2)),
        sma50: Number(sma50.toFixed(2)),
        patternName,
        marketTimestamp: latest.time * 1000,
        generatedTimestamp: Date.now(),
        methodology: "Rule-Based Confluence Matrix (EMA, SMA, RSI, MACD, Price Action)",
      });

      setLoading(false);
    } catch (err) {
      console.error("Signal evaluation error:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      evaluateSignal(symbol, timeframe);
    }, 0);
    return () => clearTimeout(timer);
  }, [symbol, timeframe, evaluateSignal]);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Control bar */}
      <div className="terminal-panel p-3 bg-[#111318] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-amber-500" />
          <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
            Explainable Quantitative Trading Signals
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Symbol selector */}
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-[#181c25] border border-[#262c3b] rounded px-2.5 py-1 text-xs font-mono text-slate-200 outline-none"
          >
            {marketDataService.DEFAULT_ASSETS.map((a) => (
              <option key={a.symbol} value={a.symbol}>
                {a.symbol}
              </option>
            ))}
          </select>

          {/* Timeframe selector */}
          <div className="flex items-center gap-1 bg-[#181c25] p-0.5 rounded border border-[#262c3b]">
            {["15m", "1h", "4h", "1d"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded transition-colors ${
                  timeframe === tf ? "bg-amber-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={() => evaluateSignal(symbol, timeframe)}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Recalculate signal metrics"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading || !signal ? (
        <div className="flex-1 flex items-center justify-center p-12 text-slate-500 font-mono text-xs">
          Computing quantitative indicator confluence matrix for {symbol}...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
          {/* Signal Primary Card */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <TerminalCard
              title="Algorithmic Classification"
              subtitle={`Computed on ${symbol} (${timeframe})`}
              action={
                <TerminalBadge
                  variant={
                    signal.verdict === "BULLISH"
                      ? "up"
                      : signal.verdict === "BEARISH"
                      ? "down"
                      : "neutral"
                  }
                  size="sm"
                >
                  {signal.verdict}
                </TerminalBadge>
              }
            >
              <div className="flex flex-col gap-3 font-mono text-xs">
                {/* Large Verdict Display */}
                <div className="bg-[#141822] p-4 rounded border border-[#242c3c] flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Market Verdict
                    </span>
                    <span
                      className={`text-2xl font-extrabold tracking-wide ${
                        signal.verdict === "BULLISH"
                          ? "text-emerald-400"
                          : signal.verdict === "BEARISH"
                          ? "text-red-400"
                          : "text-slate-300"
                      }`}
                    >
                      {signal.verdict}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Live Price: ${signal.currentPrice >= 1 ? signal.currentPrice.toFixed(2) : signal.currentPrice.toFixed(5)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Rule Confluence
                    </span>
                    <span className="text-xl font-bold text-amber-400">
                      {signal.confluenceScore}%
                    </span>
                    <span className="text-[9px] text-slate-500 block">
                      {signal.satisfiedRules}/{signal.totalRules} rules satisfied
                    </span>
                  </div>
                </div>

                {/* Levels Box */}
                {signal.verdict !== "NEUTRAL" && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#141720] p-2 rounded border border-[#222736]">
                      <span className="text-[9px] text-slate-400 uppercase block">Invalidation</span>
                      <span className="font-bold text-slate-200 mt-0.5 block">
                        ${signal.invalidationLevel}
                      </span>
                    </div>

                    <div className="bg-[#141720] p-2 rounded border border-red-900/40">
                      <span className="text-[9px] text-red-400 uppercase block">Stop Loss</span>
                      <span className="font-bold text-red-300 mt-0.5 block">
                        ${signal.suggestedStopLoss}
                      </span>
                    </div>

                    <div className="bg-[#141720] p-2 rounded border border-emerald-900/40">
                      <span className="text-[9px] text-emerald-400 uppercase block">Target</span>
                      <span className="font-bold text-emerald-300 mt-0.5 block">
                        ${signal.suggestedTakeProfit}
                      </span>
                    </div>
                  </div>
                )}

                {/* Indicator snapshot table */}
                <div className="space-y-1.5 bg-[#12151d] p-3 rounded border border-[#202533] text-[11px]">
                  <div className="flex justify-between items-center text-slate-400 border-b border-[#1b202c] pb-1">
                    <span>RSI (14-period):</span>
                    <span className="text-slate-200 font-bold">{signal.rsiValue}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 border-b border-[#1b202c] pb-1">
                    <span>20 EMA / 50 SMA:</span>
                    <span className="text-slate-200 font-bold">
                      ${signal.ema20} / ${signal.sma50}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 border-b border-[#1b202c] pb-1">
                    <span>Candlestick Structure:</span>
                    <span className="text-amber-400 font-bold">{signal.patternName}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Calculated R:R Ratio:</span>
                    <span className="text-emerald-400 font-bold">{signal.riskReward}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Method: {signal.methodology}</span>
                  <span>Data tick: {new Date(signal.marketTimestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </TerminalCard>
          </div>

          {/* Explainable Factor Breakdown */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <TerminalCard
              title="Transparent Signal Factor Breakdown"
              subtitle="Explainable Technical Confluence (No Fabricated Win Rates)"
              icon={<Info size={14} className="text-amber-500" />}
            >
              <div className="flex flex-col gap-3 font-mono text-xs">
                {/* Supporting factors */}
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold block mb-1.5">
                    Supporting Technical Factors ({signal.supportingFactors.length})
                  </span>
                  <div className="space-y-1.5">
                    {signal.supportingFactors.map((factor, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-emerald-950/20 border border-emerald-900/30 rounded flex items-start gap-2 text-[11px] text-slate-200"
                      >
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contradictory factors */}
                <div>
                  <span className="text-[10px] text-red-400 uppercase tracking-wider font-bold block mb-1.5">
                    Contradictory / Friction Factors ({signal.contradictoryFactors.length})
                  </span>
                  <div className="space-y-1.5">
                    {signal.contradictoryFactors.length === 0 ? (
                      <div className="p-2 bg-[#141720] rounded text-[11px] text-slate-500">
                        No major contradictory momentum signals detected.
                      </div>
                    ) : (
                      signal.contradictoryFactors.map((factor, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-red-950/20 border border-red-900/30 rounded flex items-start gap-2 text-[11px] text-slate-300"
                        >
                          <AlertTriangle size={13} className="text-red-500 shrink-0 mt-0.5" />
                          <span>{factor}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Invalidation Explanation */}
                <div className="p-3 bg-[#13161f] border border-[#232938] rounded">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                    Trade Invalidation Condition
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    This setup is completely invalidated if market price breaches{" "}
                    <strong className="text-amber-300">${signal.invalidationLevel}</strong> on a confirmed candle close. Invalidation prevents emotional holding and preserves capital.
                  </p>
                </div>
              </div>
            </TerminalCard>
          </div>
        </div>
      )}
    </div>
  );
}
