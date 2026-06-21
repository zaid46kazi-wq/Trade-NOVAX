"use client";

import { Wallet, PieChart, ShieldCheck } from "lucide-react";

export default function PortfolioCommand() {
  return (
    <div className="w-full glass-panel px-6 py-3 rounded-2xl flex items-center justify-between z-20">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 border-r border-white/10 pr-8">
          <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/50">
            <Wallet size={20} className="text-cyan-400" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Total Equity</div>
            <div className="text-xl font-mono font-bold text-white tracking-tight">$1,245,600.00</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 border-r border-white/10 pr-8">
          <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/50">
            <PieChart size={20} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Daily PnL</div>
            <div className="text-lg font-mono font-bold text-emerald-400 tracking-tight">+$12,450 (+1.01%)</div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-r border-white/10 pr-8">
          <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/50">
            <ShieldCheck size={20} className="text-indigo-400" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Risk Exposure</div>
            <div className="text-lg font-mono font-bold text-indigo-400 tracking-tight">14.2%</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-slate-900/60 border border-slate-700/50 px-4 py-1.5 rounded-full flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-mono text-emerald-400 font-semibold">AI Copilot Active</span>
        </div>
      </div>
    </div>
  );
}
