"use client";

import { Newspaper, AlertCircle } from "lucide-react";

export default function NewsImpactCenter() {
  return (
    <div className="glass-panel p-5 rounded-2xl h-full flex flex-col relative overflow-hidden">
      <h3 className="text-purple-400 font-bold uppercase tracking-widest text-[10px] mb-4 flex items-center gap-1.5 opacity-80 border-b border-white/5 pb-2">
        <Newspaper size={12} /> News Impact Center
      </h3>

      <div className="flex-1 flex flex-col gap-4">
        {/* Top Story */}
        <div className="bg-purple-950/20 border border-purple-900/30 p-4 rounded-xl relative">
          <div className="absolute top-0 right-0 p-2">
            <div className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
              Bullish (85 Impact)
            </div>
          </div>
          
          <h4 className="text-white font-bold text-sm pr-20 mb-2 leading-tight">
            Federal Reserve Signals Unexpected Rate Cut Next Quarter
          </h4>
          
          <p className="text-slate-400 text-xs italic mb-3">
            "AI indicates this macro shift will drive liquidity directly into high-cap crypto assets over the next 48 hours."
          </p>
          
          <div className="flex gap-2">
            <span className="text-[10px] text-slate-500 font-mono">Affected:</span>
            <span className="text-[10px] bg-slate-800 text-white px-1.5 rounded">BTC</span>
            <span className="text-[10px] bg-slate-800 text-white px-1.5 rounded">ETH</span>
            <span className="text-[10px] bg-slate-800 text-white px-1.5 rounded">SOL</span>
          </div>
        </div>

        {/* Secondary Story */}
        <div className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-xl relative">
          <div className="absolute top-0 right-0 p-2">
            <div className="bg-rose-500/20 text-rose-400 text-[9px] font-bold px-2 py-0.5 rounded border border-rose-500/30 uppercase">
              Bearish (60 Impact)
            </div>
          </div>
          
          <h4 className="text-white font-bold text-sm pr-20 mb-2 leading-tight">
            European Regulators Propose Strict MiCA Extensions
          </h4>
          
          <p className="text-slate-400 text-xs italic mb-3">
            "Anticipated sell pressure on European-based exchanges. Expected volatility increase."
          </p>
        </div>
      </div>
    </div>
  );
}
