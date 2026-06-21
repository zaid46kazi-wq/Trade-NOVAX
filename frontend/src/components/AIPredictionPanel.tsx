"use client";

import { useState, useEffect } from "react";
import { Bot, Zap, Shield, TrendingUp, TrendingDown, Clock, Activity, Sparkles } from "lucide-react";
import { getSocket } from "../lib/socket";

interface Prediction {
  recommendation: string;
  confidence: number;
  riskLevel: string;
  price: number;
  takeProfit?: number;
  stopLoss?: number;
  reasoning: string;
  patternDetected?: string;
  sentiment?: string;
}

export default function AIPredictionPanel({ pair = "BTCUSDT" }: { pair?: string }) {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    socket.on("prediction", (data: any) => {
      setPrediction({
        recommendation: data.recommendation,
        confidence: data.confidence,
        riskLevel: data.riskLevel,
        price: data.price,
        takeProfit: data.takeProfit,
        stopLoss: data.stopLoss,
        reasoning: data.reasoning,
        patternDetected: data.patternDetected,
        sentiment: data.sentiment,
      });
    });
    return () => { socket.off("prediction"); };
  }, []);

  const handleManualPredict = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/predict/${pair}`, { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPrediction(data);
    } catch (err) {
      console.error("Prediction failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col gap-6 relative overflow-hidden transition-all hover:border-indigo-500/30">
      
      {/* Decorative gradient orb inside panel */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none"></div>

      <div className="flex justify-between items-center relative z-10">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/30">
            <Bot className="text-indigo-400" size={20} />
          </div>
          AI Trading Oracle
        </h2>
        <button 
          onClick={handleManualPredict}
          disabled={loading}
          className="relative group overflow-hidden bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
        >
          {loading ? <span className="animate-spin text-xl">⟳</span> : <Sparkles size={18} className="group-hover:animate-pulse" />}
          {loading ? "Analyzing..." : "Generate Signal"}
          <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
        </button>
      </div>

      {prediction ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
            <div className={`absolute inset-0 opacity-10 ${
              prediction.recommendation === "Buy" ? "bg-emerald-500" :
              prediction.recommendation === "Sell" ? "bg-rose-500" : "bg-amber-500"
            }`}></div>
            <div className={`text-4xl font-extrabold tracking-tight mb-2 drop-shadow-lg ${
              prediction.recommendation === "Buy" ? "text-emerald-400" :
              prediction.recommendation === "Sell" ? "text-rose-400" : "text-amber-400"
            }`}>
              {prediction.recommendation.toUpperCase()}
            </div>
            <div className="text-slate-400 text-sm font-medium uppercase tracking-widest">AI Verdict</div>
          </div>
          
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 flex flex-col justify-center gap-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm flex items-center gap-2 font-medium uppercase tracking-wider"><Activity size={16} className="text-blue-400"/> Confidence</span>
              <span className="text-white font-bold text-xl drop-shadow-md">{prediction.confidence}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${prediction.confidence}%` }}></div>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-slate-400 text-sm flex items-center gap-2 font-medium uppercase tracking-wider"><Shield size={16} className="text-purple-400"/> Risk</span>
              <span className={`font-bold text-lg px-3 py-1 rounded-full text-xs uppercase tracking-wider ${
                prediction.riskLevel === "High" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" :
                prediction.riskLevel === "Low" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}>{prediction.riskLevel}</span>
            </div>
          </div>

          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 md:col-span-2">
            <h3 className="text-slate-300 font-semibold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={16} className="text-cyan-400" /> Technical Targets
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Entry</div>
                <div className="text-slate-100 font-mono text-lg">${prediction.price.toFixed(2)}</div>
              </div>
              <div className="bg-emerald-950/30 p-3 rounded-lg border border-emerald-900/30">
                <div className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-1 flex justify-center items-center gap-1"><TrendingUp size={12}/> Target</div>
                <div className="text-emerald-100 font-mono text-lg">${prediction.takeProfit?.toFixed(2) || 'N/A'}</div>
              </div>
              <div className="bg-rose-950/30 p-3 rounded-lg border border-rose-900/30">
                <div className="text-rose-500 text-xs font-bold uppercase tracking-widest mb-1 flex justify-center items-center gap-1"><TrendingDown size={12}/> Stop Loss</div>
                <div className="text-rose-100 font-mono text-lg">${prediction.stopLoss?.toFixed(2) || 'N/A'}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 md:col-span-2">
            <h3 className="text-slate-300 font-semibold mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
              <Bot size={16} className="text-indigo-400" /> Neural Reasoning
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {prediction.reasoning}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {prediction.patternDetected && (
                <div className="bg-cyan-950/50 border border-cyan-800 text-cyan-300 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                  Pattern: <span className="text-cyan-100">{prediction.patternDetected}</span>
                </div>
              )}
              {prediction.sentiment && (
                <div className="bg-purple-950/50 border border-purple-800 text-purple-300 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                  Sentiment: <span className="text-purple-100">{prediction.sentiment}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-16 relative z-10">
          <div className="bg-slate-800/50 p-4 rounded-full mb-4">
            <Bot size={40} className="text-slate-600" />
          </div>
          <p className="text-lg font-medium text-slate-400">Awaiting Signal Generation</p>
          <p className="text-sm mt-2 text-slate-600 max-w-xs text-center">Click "Generate Signal" to trigger the neural network for {pair}</p>
        </div>
      )}
    </div>
  );
}
