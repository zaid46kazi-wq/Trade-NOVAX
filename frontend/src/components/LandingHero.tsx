"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ThreeEarth from "./ThreeEarth";
import { Zap, Activity, ShieldAlert } from "lucide-react";

export default function LandingHero() {
  return (
    <>
      <ThreeEarth />

      <div className="relative z-10 w-full max-w-6xl px-6 py-20 flex flex-col items-center text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase mb-6 font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400 pulse-live"></span>
            Institutional Trading Intelligence
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-400 tracking-tight font-sans">
            TRADE-NOVA<span className="text-amber-500">X</span>
          </h1>
          
          <p className="mt-5 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Multi-asset market intelligence, real-time WebSocket orderbook analytics, and quant execution powered by <strong className="text-slate-200 font-medium">Google Gemini AI</strong>.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mt-6"
        >
          <Link href="/terminal">
            <button className="relative group overflow-hidden bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold px-8 py-3.5 rounded font-mono text-xs tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(217,119,6,0.25)] flex items-center gap-2">
              <Zap size={16} />
              Launch Trading Terminal
            </button>
          </Link>
          
          <Link href="/terminal">
            <button className="px-8 py-3.5 rounded font-mono text-xs tracking-widest uppercase text-slate-300 hover:text-white transition-colors border border-[#252b38] bg-[#12141a] hover:bg-[#181c25]">
              Virtual Paper Sandbox
            </button>
          </Link>
        </motion.div>

        {/* Feature Grid Below the Fold */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 w-full max-w-4xl text-left"
        >
          <div className="terminal-panel p-5 bg-[#101217] flex flex-col">
            <Activity className="text-amber-400 mb-3" size={24} />
            <h3 className="text-slate-200 font-bold text-sm mb-1 font-mono uppercase">AI Market Analyst</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Gemini 2.5 structured market regime breakdown, support/resistance zones, and scenario invalidation.</p>
          </div>
          <div className="terminal-panel p-5 bg-[#101217] flex flex-col">
            <ShieldAlert className="text-emerald-400 mb-3" size={24} />
            <h3 className="text-slate-200 font-bold text-sm mb-1 font-mono uppercase">Risk Calculator</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Mathematical position sizing, stop-loss distance, notional exposure, and risk/reward optimization.</p>
          </div>
          <div className="terminal-panel p-5 bg-[#101217] flex flex-col">
            <Zap className="text-amber-500 mb-3" size={24} />
            <h3 className="text-slate-200 font-bold text-sm mb-1 font-mono uppercase">Verified Block Trades</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Real exchange aggregate trade streams monitoring institutional orders exceeding $50k.</p>
          </div>
        </motion.div>
      </div>
    </>
  );
}

