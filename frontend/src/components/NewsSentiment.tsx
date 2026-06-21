"use client";

import { useState } from "react";
import { Newspaper, Send, BarChart2 } from "lucide-react";

export default function NewsSentiment() {
  const [headline, setHeadline] = useState("");
  const [sentiment, setSentiment] = useState<{ sentiment: string, score: number, summary: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/news/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articles: [headline] })
      });
      const data = await res.json();
      setSentiment(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all hover:border-purple-500/30">
      <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-6">
        <div className="bg-purple-500/20 p-2 rounded-lg border border-purple-500/30">
          <Newspaper className="text-purple-400" size={20} />
        </div>
        Market Sentiment
      </h2>
      
      <form onSubmit={analyzeNews} className="flex gap-3 mb-6">
        <div className="relative flex-1 group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <input 
            type="text" 
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Paste breaking news here..."
            className="relative w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading || !headline}
          className="relative bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-medium transition-all flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.3)]"
        >
          {loading ? <span className="animate-spin text-xl">⟳</span> : <Send size={20} />}
        </button>
      </form>

      {sentiment && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 mt-4 relative overflow-hidden">
          {/* Subtle background glow based on sentiment */}
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] pointer-events-none ${
            sentiment.sentiment === "Bullish" ? "bg-emerald-500/20" :
            sentiment.sentiment === "Bearish" ? "bg-rose-500/20" : "bg-slate-500/20"
          }`}></div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className={`font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest ${
              sentiment.sentiment === "Bullish" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
              sentiment.sentiment === "Bearish" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" :
              "bg-slate-800 text-slate-300 border border-slate-600"
            }`}>
              {sentiment.sentiment}
            </span>
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-slate-400" />
              <span className="text-slate-400 text-sm font-medium">Impact: <span className="text-white text-lg ml-1 font-bold">{sentiment.score}<span className="text-slate-500 text-xs">/100</span></span></span>
            </div>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed relative z-10 border-l-2 border-slate-700 pl-4 italic">
            "{sentiment.summary}"
          </p>
        </div>
      )}
    </div>
  );
}
