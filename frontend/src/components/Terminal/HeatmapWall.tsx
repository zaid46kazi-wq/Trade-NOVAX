"use client";

import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";

const assets = [
  { pair: "BTC", change: 4.2, weight: 4, color: "emerald" },
  { pair: "ETH", change: 2.1, weight: 2, color: "emerald" },
  { pair: "SOL", change: -5.4, weight: 2, color: "rose" },
  { pair: "BNB", change: 1.2, weight: 1, color: "emerald" },
  { pair: "XRP", change: -1.8, weight: 1, color: "rose" },
  { pair: "ADA", change: -3.2, weight: 1, color: "rose" },
];

export default function HeatmapWall() {
  return (
    <div className="glass-panel p-4 rounded-2xl h-full flex flex-col relative overflow-hidden">
      <h3 className="text-ai-gold font-bold uppercase tracking-widest text-[10px] mb-3 flex items-center gap-1.5 opacity-80 border-b border-white/5 pb-2">
        <LayoutGrid size={12} /> Market Treemap
      </h3>
      
      <div className="flex-1 grid grid-cols-4 grid-rows-2 gap-1 h-full">
        {assets.map((asset, i) => (
          <motion.div
            key={asset.pair}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`flex flex-col items-center justify-center rounded p-2 ${
              asset.change > 0 
                ? 'bg-emerald-500 hover:brightness-110' 
                : 'bg-rose-500 hover:brightness-110'
            } transition-all cursor-pointer shadow-inner`}
            style={{
              gridColumn: `span ${asset.weight}`,
              gridRow: `span ${asset.weight > 2 ? 2 : 1}`
            }}
          >
            <span className="font-bold text-white text-shadow-sm">{asset.pair}</span>
            <span className="text-xs font-mono text-white/90">{asset.change > 0 ? '+' : ''}{asset.change}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
