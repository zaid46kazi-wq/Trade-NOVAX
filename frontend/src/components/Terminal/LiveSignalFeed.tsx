"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";
import { useState, useEffect } from "react";

const signals = [
  { time: "19:45", action: "BUY", asset: "BTCUSDT", type: "emerald" },
  { time: "19:42", action: "BUY", asset: "ETHUSDT", type: "emerald" },
  { time: "19:38", action: "SELL", asset: "SOLUSDT", type: "rose" },
  { time: "19:35", action: "BUY", asset: "EURUSD", type: "emerald" },
  { time: "19:30", action: "BREAKOUT", asset: "DETECTED", type: "cyan" },
];

export default function LiveSignalFeed() {
  const [feed, setFeed] = useState(signals);

  useEffect(() => {
    // Simulate real-time signal stream
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const newSignal = {
        time: timeStr,
        action: Math.random() > 0.5 ? "BUY" : "SELL",
        asset: ["XRPUSDT", "ADAUSDT", "DOGEUSDT"][Math.floor(Math.random() * 3)],
        type: Math.random() > 0.5 ? "emerald" : "rose"
      };
      setFeed(prev => [newSignal, ...prev].slice(0, 6));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel p-4 rounded-2xl h-full flex flex-col relative overflow-hidden">
      <h3 className="text-slate-300 font-bold uppercase tracking-widest text-[10px] mb-3 flex items-center gap-1.5 opacity-80 border-b border-white/5 pb-2">
        <Activity size={12} className="text-emerald-400" /> Live Signal Feed
      </h3>
      
      <div className="flex-1 flex flex-col gap-2 relative">
        <AnimatePresence>
          {feed.map((sig, i) => (
            <motion.div
              key={sig.time + sig.asset + i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between text-xs font-mono bg-slate-900/40 p-2 rounded border border-slate-800/50"
            >
              <span className="text-slate-500">{sig.time}</span>
              <div className="flex gap-2">
                <span className={
                  sig.type === 'emerald' ? 'text-emerald-400 font-bold' :
                  sig.type === 'rose' ? 'text-rose-400 font-bold' : 'text-cyan-400 font-bold'
                }>{sig.action}</span>
                <span className="text-white">{sig.asset}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
