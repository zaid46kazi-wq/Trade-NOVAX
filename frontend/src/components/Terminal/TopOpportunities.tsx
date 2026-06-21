"use client";

import { motion } from "framer-motion";
import { TrendingUp, ArrowRight } from "lucide-react";

const opportunities = [
  { id: 1, pair: "BTCUSDT", signal: "BUY", conf: 89, risk: "Low", rr: "1:3.2", color: "emerald" },
  { id: 2, pair: "EURUSD", signal: "BUY", conf: 87, risk: "Low", rr: "1:2.8", color: "emerald" },
  { id: 3, pair: "XAUUSD", signal: "SELL", conf: 84, risk: "Med", rr: "1:2.4", color: "rose" },
  { id: 4, pair: "SOLUSDT", signal: "BUY", conf: 82, risk: "High", rr: "1:4.1", color: "emerald" },
  { id: 5, pair: "GBPUSD", signal: "BUY", conf: 80, risk: "Low", rr: "1:2.0", color: "emerald" },
];

export default function TopOpportunities({ onSelect }: { onSelect?: (pair: string) => void }) {
  return (
    <div className="w-full bg-slate-900/40 border-y border-white/10 flex items-center overflow-x-auto no-scrollbar">
      <div className="flex items-center px-4 py-2 border-r border-white/10 bg-black/50 shrink-0">
        <TrendingUp size={16} className="text-ai-gold mr-2" />
        <span className="text-xs font-bold uppercase tracking-widest text-ai-gold">Top Opportunities</span>
      </div>
      
      <div className="flex items-center gap-6 px-6">
        {opportunities.map((opp) => (
          <motion.button
            key={opp.id}
            whileHover={{ scale: 1.05 }}
            onClick={() => onSelect && onSelect(opp.pair)}
            className="flex items-center gap-3 shrink-0 group"
          >
            <span className="text-slate-500 font-mono text-xs">#{opp.id}</span>
            <span className="text-white font-bold text-sm group-hover:text-cyan-400 transition-colors">{opp.pair}</span>
            <div className={`px-2 py-0.5 rounded flex gap-2 items-center text-[10px] font-bold tracking-wider ${
              opp.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              <span>{opp.signal} {opp.conf}%</span>
              <span className="opacity-50">|</span>
              <span className="text-slate-300">{opp.risk} Risk</span>
              <span className="opacity-50">|</span>
              <span className="text-slate-300">{opp.rr}</span>
            </div>
            <ArrowRight size={14} className="text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all -ml-2" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
