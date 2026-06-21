"use client";

import { ActivitySquare, CheckCircle, Percent } from "lucide-react";

export default function AIPerformance() {
  return (
    <div className="glass-panel p-4 rounded-2xl h-full flex flex-col relative overflow-hidden">
      <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-[10px] mb-3 flex items-center gap-1.5 opacity-80 border-b border-white/5 pb-2">
        <ActivitySquare size={12} /> Engine Performance (30D)
      </h3>

      <div className="grid grid-cols-2 gap-2 mb-2 flex-1">
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-lg p-2 flex flex-col justify-center items-center text-center">
          <CheckCircle size={14} className="text-emerald-500 mb-1" />
          <span className="text-white font-mono text-lg font-bold">76.4%</span>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest">Win Rate</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-lg p-2 flex flex-col justify-center items-center text-center">
          <Percent size={14} className="text-cyan-500 mb-1" />
          <span className="text-white font-mono text-lg font-bold">1:2.8</span>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest">Avg R:R</span>
        </div>
      </div>

      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/30 flex justify-between items-center">
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total Signals</span>
        <span className="text-white font-mono text-xs font-bold">1,204</span>
      </div>
      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/30 flex justify-between items-center mt-2">
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Top Asset</span>
        <span className="text-ai-gold font-mono text-xs font-bold bg-amber-500/10 px-2 rounded">BTCUSDT</span>
      </div>
    </div>
  );
}
