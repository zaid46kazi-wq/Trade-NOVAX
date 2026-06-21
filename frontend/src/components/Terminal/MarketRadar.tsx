"use client";

import { useEffect, useState } from "react";
import { Crosshair } from "lucide-react";

export default function MarketRadar() {
  const [blips, setBlips] = useState<{ id: number; x: number; y: number; type: string }[]>([]);

  useEffect(() => {
    // Simulate random blips
    const interval = setInterval(() => {
      const newBlip = {
        id: Date.now(),
        x: Math.random() * 80 + 10, // 10% to 90%
        y: Math.random() * 80 + 10,
        type: Math.random() > 0.5 ? 'buy' : 'sell'
      };
      setBlips(prev => [...prev, newBlip].slice(-5)); // Keep last 5
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-full relative overflow-hidden">
      <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
        <Crosshair size={16} /> Market Scanner
      </h3>
      
      <div className="relative flex-1 rounded-full border border-cyan-500/30 overflow-hidden bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05)_0%,transparent_70%)]">
        {/* Radar Rings */}
        <div className="absolute inset-4 rounded-full border border-cyan-500/20"></div>
        <div className="absolute inset-10 rounded-full border border-cyan-500/20"></div>
        <div className="absolute inset-16 rounded-full border border-cyan-500/20"></div>
        
        {/* Crosshairs */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-cyan-500/20"></div>
        <div className="absolute left-0 right-0 top-1/2 h-px bg-cyan-500/20"></div>

        {/* Sweeping Line */}
        <div className="radar-line absolute top-0 left-1/2 right-0 bottom-1/2 bg-[conic-gradient(from_0deg,transparent_70%,rgba(0,240,255,0.4)_100%)] origin-bottom-left"></div>

        {/* Blips */}
        {blips.map(blip => (
          <div 
            key={blip.id}
            className={`absolute w-3 h-3 rounded-full animate-ping ${blip.type === 'buy' ? 'bg-emerald-500' : 'bg-rose-500'}`}
            style={{ left: `${blip.x}%`, top: `${blip.y}%` }}
          />
        ))}
      </div>
    </div>
  );
}
