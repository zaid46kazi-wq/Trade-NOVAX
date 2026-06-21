"use client";

import { UploadCloud, Image as ImageIcon, Sparkles } from "lucide-react";
import { useState } from "react";

export default function ChartAnalyzer() {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setResult("Gemini Vision Analysis:\nTrend: Bullish\nPatterns: Ascending Triangle\nSupport: $63.8K\nResistance: $65.2K\nLiquidity: Buy-side imbalance at $64.1K\nTrade Setup: Long on breakout of $65.2K, invalidation below $63.5K.");
    }, 2000);
  };

  return (
    <div className="glass-panel p-4 rounded-2xl h-full flex flex-col relative overflow-hidden">
      <h3 className="text-purple-400 font-bold uppercase tracking-widest text-[10px] mb-3 flex items-center gap-1.5 opacity-80 border-b border-white/5 pb-2">
        <Sparkles size={12} /> Chart Analysis Engine
      </h3>

      {!result ? (
        <div 
          onClick={handleUpload}
          className="flex-1 border-2 border-dashed border-slate-700 hover:border-purple-500/50 rounded-xl bg-slate-900/30 flex flex-col items-center justify-center cursor-pointer transition-colors group"
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-mono text-purple-400">Gemini Processing...</span>
            </div>
          ) : (
            <>
              <div className="p-3 bg-purple-500/10 rounded-full mb-2 group-hover:bg-purple-500/20 transition-colors">
                <UploadCloud size={20} className="text-purple-400" />
              </div>
              <span className="text-xs font-bold text-white mb-1">Upload Screenshot</span>
              <span className="text-[10px] text-slate-500">Gemini will analyze support & resistance</span>
            </>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Analysis Complete</span>
            <button onClick={() => setResult(null)} className="text-[10px] text-slate-400 hover:text-white">Clear</button>
          </div>
          <div className="flex-1 bg-slate-900/60 rounded-lg p-3 border border-slate-700/50 overflow-y-auto no-scrollbar text-xs font-mono text-slate-300 whitespace-pre-line">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
