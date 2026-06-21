"use client";

import { CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

export default function AIReasoning() {
  return (
    <div className="glass-panel p-5 rounded-2xl h-full flex flex-col relative overflow-hidden">
      <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-[10px] mb-4 flex items-center gap-1.5 opacity-80 border-b border-white/5 pb-2">
        <Lightbulb size={12} /> AI Reasoning Engine
      </h3>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* Bullish Factors */}
        <div className="bg-emerald-950/10 p-3 rounded-xl border border-emerald-900/30 flex flex-col gap-2">
          <span className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-widest mb-1">Bullish Factors</span>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>RSI Recovery from oversold territory (32.4)</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>MACD Bullish Crossover on 4H timeframe</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>Whale accumulation detected at $63.8K level</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>Positive sentiment in broad crypto markets</span>
            </li>
          </ul>
        </div>

        {/* Bearish Risks */}
        <div className="bg-rose-950/10 p-3 rounded-xl border border-rose-900/30 flex flex-col gap-2">
          <span className="text-[10px] text-rose-400/80 font-bold uppercase tracking-widest mb-1">Bearish Risks</span>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-xs text-slate-300">
              <AlertTriangle size={14} className="text-rose-500 shrink-0 mt-0.5" />
              <span>Major resistance zone nearby at $65,000</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-300">
              <AlertTriangle size={14} className="text-rose-500 shrink-0 mt-0.5" />
              <span>High volatility expected in next 24h</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-slate-300">
              <AlertTriangle size={14} className="text-rose-500 shrink-0 mt-0.5" />
              <span>Upcoming FOMC minutes release tomorrow</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
