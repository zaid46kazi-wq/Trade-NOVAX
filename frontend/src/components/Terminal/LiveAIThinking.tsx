"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const thoughts = [
  { text: "Scanning BTCUSDT order book...", type: "system" },
  { text: "Pattern Detection: Bullish Engulfing", type: "positive" },
  { text: "Analyzing real-time sentiment...", type: "system" },
  { text: "Sentiment Analysis: Positive", type: "positive" },
  { text: "Checking on-chain data...", type: "system" },
  { text: "Whale Activity: Accumulation", type: "positive" },
  { text: "Calculating probability matrix...", type: "system" },
  { text: "Confidence Calculation: 89%", type: "highlight" },
  { text: "Generating Trade Setup...", type: "action" }
];

export default function LiveAIThinking() {
  const [currentThoughts, setCurrentThoughts] = useState<typeof thoughts>([]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < thoughts.length) {
        setCurrentThoughts(thoughts.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel p-5 rounded-2xl h-full flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
        <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
          <BrainCircuit size={16} /> Live AI Thinking
        </h3>
        <Loader2 size={14} className="text-indigo-500 animate-spin" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2 font-mono text-xs p-2 bg-black/40 rounded-lg border border-white/5">
        {currentThoughts.map((thought, idx) => {
          if (!thought) return null;
          
          // Generate a fake stable timestamp for display
          const timeOffset = idx * 2;
          const h = 20;
          const m = 14;
          const s = (1 + timeOffset).toString().padStart(2, '0');
          const timeStr = `[${h}:${m}:${s}]`;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${
                thought.type === 'system' ? 'text-slate-500' :
                thought.type === 'positive' ? 'text-emerald-400' :
                thought.type === 'highlight' ? 'text-cyan-400 font-bold' :
                'text-ai-gold font-bold animate-pulse'
              }`}
            >
              <span className="text-slate-600 shrink-0">{timeStr}</span>
              <span>{thought.text}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
