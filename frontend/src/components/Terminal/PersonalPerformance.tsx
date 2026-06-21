"use client";

import { Target, TrendingUp, Briefcase } from "lucide-react";

export default function PersonalPerformance() {
  return (
    <div className="glass-panel p-4 rounded-2xl h-full flex flex-col relative overflow-hidden">
      <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-3 flex items-center gap-1.5 opacity-80 border-b border-white/5 pb-2">
        <Briefcase size={12} /> Personal Performance
      </h3>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 flex flex-col justify-center items-center">
          <Target size={16} className="text-emerald-500 mb-1" />
          <span className="text-white font-mono text-xl font-bold">68.5%</span>
          <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Win Rate</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 flex flex-col justify-center items-center">
          <TrendingUp size={16} className="text-cyan-500 mb-1" />
          <span className="text-white font-mono text-xl font-bold">2.4</span>
          <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Profit Factor</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total Trades</span>
          <span className="text-white font-mono text-xs">142</span>
        </div>
        <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Max Drawdown</span>
          <span className="text-rose-400 font-mono text-xs">-8.4%</span>
        </div>
        <div className="flex justify-between items-center bg-slate-900/40 p-2 rounded">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Best Asset</span>
          <span className="text-ai-gold font-mono text-xs bg-amber-500/10 px-1.5 rounded">ETHUSDT</span>
        </div>
      </div>
    </div>
  );
}
