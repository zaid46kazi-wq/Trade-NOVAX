"use client";

import { Compass, TrendingUp, AlertCircle } from "lucide-react";

export default function MarketRegime() {
  return (
    <div className="glass-panel p-4 rounded-2xl h-full flex flex-col relative overflow-hidden">
      <h3 className="text-ai-gold font-bold uppercase tracking-widest text-[10px] mb-3 flex items-center gap-1.5 opacity-80 border-b border-white/5 pb-2">
        <Compass size={12} /> Market Regime
      </h3>

      <div className="flex-1 flex flex-col justify-center items-center relative z-10">
        <div className="relative w-24 h-24 mb-3">
          {/* Animated radar rings */}
          <div className="absolute inset-0 border-2 border-ai-gold/20 rounded-full animate-ping"></div>
          <div className="absolute inset-2 border border-ai-gold/40 rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <TrendingUp size={32} className="text-ai-gold drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
          </div>
        </div>

        <span className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Current State</span>
        <span className="text-xl font-extrabold text-white tracking-widest text-shadow-sm mb-4">TRENDING</span>

        <div className="w-full bg-amber-950/20 border border-amber-900/30 rounded-lg p-2 flex items-start gap-2">
          <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-0.5">Strategy Recommendation</span>
            <span className="text-xs font-mono text-slate-300">Deploy trend-following setups. Avoid mean-reversion scalping.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
