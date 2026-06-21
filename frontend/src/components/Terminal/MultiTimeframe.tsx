"use client";

import { Clock } from "lucide-react";

const timeframes = [
  { label: "1m", status: "Buy", color: "emerald" },
  { label: "5m", status: "Buy", color: "emerald" },
  { label: "15m", status: "Strong Buy", color: "emerald", strong: true },
  { label: "1H", status: "Strong Buy", color: "emerald", strong: true },
  { label: "4H", status: "Bullish", color: "cyan" },
  { label: "1D", status: "Bullish", color: "cyan" },
];

export default function MultiTimeframe() {
  return (
    <div className="glass-panel p-4 rounded-2xl h-full flex flex-col relative overflow-hidden justify-center">
      <h3 className="text-slate-300 font-bold uppercase tracking-widest text-[10px] mb-3 flex items-center gap-1.5 opacity-80">
        <Clock size={12} /> Timeframe Alignment
      </h3>
      
      <div className="grid grid-cols-6 gap-2">
        {timeframes.map((tf) => (
          <div key={tf.label} className="flex flex-col items-center justify-center gap-2 group cursor-pointer">
            <span className="text-[10px] font-mono text-slate-500 group-hover:text-white transition-colors">{tf.label}</span>
            <div className={`w-full py-2 rounded flex flex-col items-center justify-center text-center transition-all ${
              tf.color === 'emerald' && tf.strong ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-emerald-400' :
              tf.color === 'emerald' ? 'bg-emerald-500/20 border border-emerald-500/50' :
              'bg-cyan-500/20 border border-cyan-500/50'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                tf.color === 'emerald' && tf.strong ? 'bg-white animate-pulse' :
                tf.color === 'emerald' ? 'bg-emerald-400' : 'bg-cyan-400'
              }`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
