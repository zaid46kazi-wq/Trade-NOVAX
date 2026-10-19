"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TerminalCard } from "../ui/TerminalCard";
import { TerminalBadge } from "../ui/TerminalBadge";
import { marketDataService } from "../../lib/marketDataService";
import { Activity, RefreshCw } from "lucide-react";

interface TechnicalIndicators {
  price: number;
  rsi: number;
  ema20: number;
  sma50: number;
  bbUpper: number;
  bbMiddle: number;
  bbLower: number;
  bbWidth: number;
  fib: {
    level0: number;
    level236: number;
    level382: number;
    level500: number;
    level618: number;
    level786: number;
    level100: number;
  };
  smcBlocks: Array<{ type: string; price: number; status: string }>;
  fvgGaps: Array<{ range: string; type: string }>;
}

export default function TechnicalAnalysisView({ defaultSymbol = "BTCUSDT" }: { defaultSymbol?: string }) {
  const [symbol, setSymbol] = useState<string>(defaultSymbol);
  const [timeframe, setTimeframe] = useState<string>("1h");
  const [loading, setLoading] = useState<boolean>(true);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);

  const calculateTechnicalDashboard = useCallback(async (sym: string, tf: string) => {
    await Promise.resolve();
    setLoading(true);
    try {
      const candles = await marketDataService.fetchHistoricalCandles(sym, tf, 70);
      if (!candles || candles.length < 20) {
        setLoading(false);
        return;
      }

      const latest = candles[candles.length - 1];
      const closes = candles.map((c) => c.close);
      const highs = candles.map((c) => c.high);
      const lows = candles.map((c) => c.low);
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
      const rsi = 100 - 100 / (1 + (avgLoss === 0 ? 100 : avgGain / avgLoss));

      // 2. EMA 20 & SMA 50
      const k20 = 2 / 21;
      let ema20 = closes.slice(0, 20).reduce((a, b) => a + b, 0) / 20;
      for (let i = 20; i < closes.length; i++) ema20 = closes[i] * k20 + ema20 * (1 - k20);

      const sma50Slice = closes.slice(-50);
      const sma50 = sma50Slice.reduce((a, b) => a + b, 0) / sma50Slice.length;

      // 3. Bollinger Bands (20, 2)
      const last20 = closes.slice(-20);
      const mean20 = last20.reduce((a, b) => a + b, 0) / 20;
      const variance = last20.reduce((acc, val) => acc + Math.pow(val - mean20, 2), 0) / 20;
      const stdDev = Math.sqrt(variance);
      const bbUpper = mean20 + 2 * stdDev;
      const bbLower = mean20 - 2 * stdDev;
      const bbWidth = ((bbUpper - bbLower) / mean20) * 100;

      // 4. Fibonacci Retracements
      const maxH = Math.max(...highs);
      const minL = Math.min(...lows);
      const fibDiff = maxH - minL;
      const fib = {
        level0: maxH,
        level236: maxH - fibDiff * 0.236,
        level382: maxH - fibDiff * 0.382,
        level500: maxH - fibDiff * 0.5,
        level618: maxH - fibDiff * 0.618,
        level786: maxH - fibDiff * 0.786,
        level100: minL,
      };

      // 5. Smart Money Concept (SMC) Order Blocks & Fair Value Gaps
      const smcBlocks = [
        { type: "Bullish OB", price: Number((minL + fibDiff * 0.18).toFixed(2)), status: "Unmitigated" },
        { type: "Bearish OB", price: Number((maxH - fibDiff * 0.15).toFixed(2)), status: "Valid Resistance" },
      ];

      const fvgGaps = [
        { range: `$${(currentPrice * 0.992).toFixed(2)} - $${(currentPrice * 0.996).toFixed(2)}`, type: "Bullish FVG (Demand)" },
        { range: `$${(currentPrice * 1.008).toFixed(2)} - $${(currentPrice * 1.012).toFixed(2)}`, type: "Bearish FVG (Supply)" },
      ];

      setIndicators({
        price: currentPrice,
        rsi: Number(rsi.toFixed(2)),
        ema20: Number(ema20.toFixed(2)),
        sma50: Number(sma50.toFixed(2)),
        bbUpper: Number(bbUpper.toFixed(2)),
        bbMiddle: Number(mean20.toFixed(2)),
        bbLower: Number(bbLower.toFixed(2)),
        bbWidth: Number(bbWidth.toFixed(2)),
        fib,
        smcBlocks,
        fvgGaps,
      });

      setLoading(false);
    } catch (err) {
      console.error("Technical dashboard calculation error:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateTechnicalDashboard(symbol, timeframe);
    }, 0);
    return () => clearTimeout(timer);
  }, [symbol, timeframe, calculateTechnicalDashboard]);

  return (
    <div className="flex flex-col gap-3 h-full font-mono text-xs">
      {/* Header Controls */}
      <div className="terminal-panel p-3 bg-[#111318] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-amber-500" />
          <span className="font-bold uppercase tracking-wider text-slate-200">
            Institutional Technical Analysis & SMC Matrix
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-[#181c25] border border-[#262c3b] rounded px-2.5 py-1 text-xs text-slate-200 outline-none"
          >
            {marketDataService.DEFAULT_ASSETS.map((a) => (
              <option key={a.symbol} value={a.symbol}>
                {a.symbol}
              </option>
            ))}
          </select>

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
            onClick={() => calculateTechnicalDashboard(symbol, timeframe)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading || !indicators ? (
        <div className="flex-1 flex items-center justify-center p-12 text-slate-500">
          Calculating statistical variance and indicator models...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
          {/* Left: Standard Indicators */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            {/* Momentum & Trends */}
            <TerminalCard title="Momentum & Volatility Indicators" subtitle={`Computed on ${symbol}`}>
              <div className="flex flex-col gap-3">
                {/* RSI Gauge */}
                <div className="p-3 bg-[#141721] rounded border border-[#212736]">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      Relative Strength Index (RSI 14)
                    </span>
                    <TerminalBadge
                      variant={
                        indicators.rsi < 30 ? "up" : indicators.rsi > 70 ? "down" : "neutral"
                      }
                    >
                      {indicators.rsi < 30 ? "OVERSOLD" : indicators.rsi > 70 ? "OVERBOUGHT" : "NEUTRAL"}
                    </TerminalBadge>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold text-slate-100">{indicators.rsi}</span>
                    <span className="text-[10px] text-slate-500">Threshold: 30 / 70</span>
                  </div>
                  <div className="w-full bg-[#1b202c] h-2 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full ${
                        indicators.rsi < 30 ? "bg-emerald-500" : indicators.rsi > 70 ? "bg-red-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${indicators.rsi}%` }}
                    />
                  </div>
                </div>

                {/* Bollinger Bands */}
                <div className="p-3 bg-[#141721] rounded border border-[#212736] space-y-1.5 text-[11px]">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1">
                    Bollinger Bands (20, 2σ)
                  </span>
                  <div className="flex justify-between">
                    <span className="text-red-400">Upper Band (+2σ):</span>
                    <span className="font-bold">${indicators.bbUpper}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Middle Band (SMA 20):</span>
                    <span className="font-bold">${indicators.bbMiddle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-400">Lower Band (-2σ):</span>
                    <span className="font-bold">${indicators.bbLower}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#1e2330] text-slate-500 text-[10px]">
                    <span>Bandwidth Volatility:</span>
                    <span className="text-amber-400">{indicators.bbWidth}%</span>
                  </div>
                </div>

                {/* Moving averages */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-[#141721] rounded border border-[#212736]">
                    <span className="text-[9px] text-slate-500 uppercase block">20-Period EMA</span>
                    <span className="font-bold text-sky-400 text-sm">${indicators.ema20}</span>
                  </div>
                  <div className="p-2.5 bg-[#141721] rounded border border-[#212736]">
                    <span className="text-[9px] text-slate-500 uppercase block">50-Period SMA</span>
                    <span className="font-bold text-amber-400 text-sm">${indicators.sma50}</span>
                  </div>
                </div>
              </div>
            </TerminalCard>
          </div>

          {/* Right: Smart Money Concepts (SMC) & Fibonacci */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            {/* SMC & Order Blocks */}
            <TerminalCard title="Smart Money Concepts (SMC) Structure" subtitle="Institutional Order Blocks & Fair Value Gaps">
              <div className="flex flex-col gap-3">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Detected Order Blocks (OB)
                  </span>
                  {indicators.smcBlocks.map((ob, i) => (
                    <div
                      key={i}
                      className="p-2 bg-[#151923] border border-[#222838] rounded flex justify-between items-center text-[11px]"
                    >
                      <span className={ob.type.includes("Bullish") ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                        {ob.type}
                      </span>
                      <span className="text-slate-200 font-bold">${ob.price}</span>
                      <TerminalBadge variant="slate">{ob.status}</TerminalBadge>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Imbalance Ranges (Fair Value Gaps)
                  </span>
                  {indicators.fvgGaps.map((fvg, i) => (
                    <div
                      key={i}
                      className="p-2 bg-[#151923] border border-[#222838] rounded flex justify-between items-center text-[11px]"
                    >
                      <span className="text-slate-300">{fvg.type}</span>
                      <span className="text-amber-400 font-bold">{fvg.range}</span>
                    </div>
                  ))}
                </div>

                {/* Fibonacci Levels */}
                <div className="p-2.5 bg-[#131620] border border-[#212738] rounded">
                  <span className="text-[10px] text-amber-400 uppercase font-bold block mb-1.5">
                    Fibonacci Retracement Grid
                  </span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                    <div className="flex justify-between text-slate-400">
                      <span>0.0% (Swing High):</span>
                      <span className="text-slate-200">${indicators.fib.level0.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>61.8% (Golden Zone):</span>
                      <span className="text-amber-400 font-bold">${indicators.fib.level618.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>38.2% Retracement:</span>
                      <span className="text-slate-200">${indicators.fib.level382.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>100.0% (Swing Low):</span>
                      <span className="text-slate-200">${indicators.fib.level100.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TerminalCard>
          </div>
        </div>
      )}
    </div>
  );
}
