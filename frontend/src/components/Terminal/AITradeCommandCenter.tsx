"use client";

import { Target, TrendingUp, AlertTriangle, ArrowRightCircle, CheckSquare, Activity } from "lucide-react";

export default function AITradeCommandCenter({ pair = "BTCUSDT" }) {
  return (
    <div className="glass-panel p-4 rounded-2xl h-full flex flex-col relative overflow-hidden border-t-4 border-t-emerald-500">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none"></div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <span className="text-emerald-400">BUY</span> {pair}
          </h2>
          <span className="text-slate-400 text-sm font-mono mt-1 block">Live: $64,230.50</span>
        </div>
        <div className="bg-emerald-500/20 border border-emerald-500/50 px-4 py-2 rounded-xl flex flex-col items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <span className="text-[9px] text-emerald-300 uppercase tracking-widest font-bold mb-0.5">Trade Quality</span>
          <span className="text-emerald-400 font-extrabold text-2xl leading-none">A+</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
          <span className="text-slate-400 text-[9px] uppercase tracking-widest flex items-center gap-1 mb-1"><Target size={10}/> Confidence</span>
          <span className="text-white font-bold text-base">89%</span>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full w-[89%] shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
          </div>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
          <span className="text-slate-400 text-[9px] uppercase tracking-widest flex items-center gap-1 mb-1"><AlertTriangle size={10}/> Risk</span>
          <span className="text-emerald-400 font-bold text-base">LOW</span>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden flex">
            <div className="bg-emerald-500 h-full w-1/3"></div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 mb-4 flex-1">
        <div className="flex justify-between items-center p-2 rounded bg-slate-900/40 border border-slate-800/50">
          <span className="text-slate-400 text-[10px] font-mono uppercase flex items-center gap-1"><ArrowRightCircle size={12} className="text-cyan-400"/> Entry Zone</span>
          <span className="text-white font-mono text-xs font-bold">$64,100 - $64,250</span>
        </div>
        <div className="flex justify-between items-center p-2 rounded bg-rose-950/20 border border-rose-900/30">
          <span className="text-rose-400/80 text-[10px] font-mono uppercase flex items-center gap-1"><TrendingUp size={12} className="rotate-180"/> Stop Loss</span>
          <span className="text-rose-400 font-mono text-xs font-bold">$62,800</span>
        </div>
        <div className="flex justify-between items-center p-2 rounded bg-emerald-950/20 border border-emerald-900/30">
          <span className="text-emerald-400/80 text-[10px] font-mono uppercase flex items-center gap-1"><TrendingUp size={12}/> Take Profit</span>
          <span className="text-emerald-400 font-mono text-xs font-bold">$68,500</span>
        </div>
      </div>

      <div className="bg-black/50 border border-white/5 rounded-lg p-3">
        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5 mb-2">
          <Activity size={10} /> Signal Confirmation Engine
        </span>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="flex items-center gap-2 text-[10px]">
            <CheckSquare size={10} className="text-emerald-500" />
            <span className="text-slate-300">RSI (Weight: 20%)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <CheckSquare size={10} className="text-emerald-500" />
            <span className="text-slate-300">MACD (Weight: 25%)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <CheckSquare size={10} className="text-emerald-500" />
            <span className="text-slate-300">Vol (Weight: 30%)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <CheckSquare size={10} className="text-emerald-500" />
            <span className="text-slate-300">Sent (Weight: 25%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
