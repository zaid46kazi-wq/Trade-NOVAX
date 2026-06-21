"use client";

import { BarChart3 } from "lucide-react";

export default function OrderFlow() {
  const buyPressure = 72;
  const sellPressure = 28;

  return (
    <div className="glass-panel p-5 rounded-2xl h-full flex flex-col relative overflow-hidden">
      <h3 className="text-slate-300 font-bold uppercase tracking-widest text-[10px] mb-4 flex items-center gap-1.5 opacity-80">
        <BarChart3 size={12} className="text-ai-gold" /> Order Flow (Delta)
      </h3>
      
      <div className="flex justify-between text-xs font-bold mb-1">
        <span className="text-emerald-400 uppercase tracking-widest">Buy Pressure: {buyPressure}%</span>
        <span className="text-rose-400 uppercase tracking-widest">Sell: {sellPressure}%</span>
      </div>
      
      <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden flex mb-4 border border-slate-800/50 shadow-inner">
        <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${buyPressure}%` }}></div>
        <div className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" style={{ width: `${sellPressure}%` }}></div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-auto">
        <div className="bg-slate-900/50 p-2 rounded flex flex-col">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest">Net Volume</span>
          <span className="text-emerald-400 font-mono text-sm">+42.5K BTC</span>
        </div>
        <div className="bg-slate-900/50 p-2 rounded flex flex-col">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest">Aggressive</span>
          <span className="text-emerald-400 font-mono text-sm">Buyers</span>
        </div>
      </div>
    </div>
  );
}
