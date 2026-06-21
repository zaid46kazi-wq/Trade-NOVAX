"use client";

import { Flame } from "lucide-react";
import { motion } from "framer-motion";

export default function FearGreedGauge() {
  const value = 78; // Greed
  const rotation = (value / 100) * 180 - 90; // Convert 0-100 to -90 to 90 degrees

  return (
    <div className="glass-panel p-5 rounded-2xl h-full flex flex-col items-center justify-center relative overflow-hidden">
      <h3 className="absolute top-4 left-4 text-slate-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-1.5 opacity-80">
        <Flame size={12} className="text-rose-400" /> Market Emotion
      </h3>
      
      <div className="relative w-48 h-24 mt-4 overflow-hidden">
        {/* Semi-circle track */}
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[20px] border-slate-800/50"></div>
        {/* Gradient fill representing zones */}
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[20px] border-transparent border-t-rose-500 border-l-rose-500 border-r-emerald-500 rotate-45 opacity-40"></div>
        
        {/* Animated Needle */}
        <motion.div 
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ duration: 2, type: "spring", bounce: 0.4 }}
          className="absolute bottom-0 left-1/2 w-1 h-20 bg-white origin-bottom -translate-x-1/2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
        ></motion.div>
        
        {/* Needle Base */}
        <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-white rounded-full -translate-x-1/2 translate-y-1/2 shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-2xl font-extrabold text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
          EXTREME GREED
        </div>
        <div className="text-slate-400 font-mono text-sm mt-1">Index: {value}/100</div>
      </div>
    </div>
  );
}
