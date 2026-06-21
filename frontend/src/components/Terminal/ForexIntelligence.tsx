"use client";

import { Globe, TrendingDown, TrendingUp } from "lucide-react";

export default function ForexIntelligence() {
  return (
    <div className="glass-panel p-4 rounded-2xl h-full flex flex-col relative overflow-hidden">
      <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-3 flex items-center gap-1.5 opacity-80 border-b border-white/5 pb-2">
        <Globe size={12} /> Macro Intelligence
      </h3>

      <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg border border-slate-700/50 mb-3">
        <span className="text-xs text-slate-400 font-bold tracking-widest">DXY (US Dollar)</span>
        <div className="flex items-center gap-2">
          <TrendingDown size={14} className="text-rose-400" />
          <span className="text-white font-mono text-sm font-bold">104.25</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Upcoming Economic Events</span>
        
        <div className="bg-rose-950/20 border-l-2 border-rose-500 p-2 rounded bg-gradient-to-r from-rose-900/10 to-transparent">
          <div className="flex justify-between items-center mb-1">
            <span className="text-white text-xs font-bold">US Core CPI (YoY)</span>
            <span className="text-rose-400 text-[9px] font-bold uppercase">High Volatility</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[10px]">Forecast: 3.2%</span>
            <span className="text-slate-500 text-[10px] font-mono">In 2h 14m</span>
          </div>
        </div>

        <div className="bg-amber-950/20 border-l-2 border-amber-500 p-2 rounded bg-gradient-to-r from-amber-900/10 to-transparent">
          <div className="flex justify-between items-center mb-1">
            <span className="text-white text-xs font-bold">ECB Press Conference</span>
            <span className="text-amber-400 text-[9px] font-bold uppercase">Med Volatility</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[10px]">Impacts: EUR</span>
            <span className="text-slate-500 text-[10px] font-mono">Tomorrow</span>
          </div>
        </div>
      </div>
    </div>
  );
}
