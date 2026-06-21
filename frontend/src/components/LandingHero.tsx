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
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-900/30 border border-cyan-500/30 text-cyan-400 text-sm font-semibold tracking-[0.2em] uppercase mb-6 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            System Online: 2035 Build
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-500 tracking-tighter drop-shadow-[0_0_40px_rgba(0,240,255,0.3)]">
            TRADENOVA <span className="text-cyan-500">X</span>
          </h1>
          
          <p className="mt-6 text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
            Analyze markets in real-time using machine learning, advanced pattern recognition, and <strong className="text-white font-medium">holographic neural intelligence.</strong>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-6 mt-10"
        >
          <Link href="/terminal">
            <button className="relative group overflow-hidden bg-cyan-600/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 px-10 py-4 rounded-xl font-bold tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(0,240,255,0.15)] hover:shadow-[0_0_50px_rgba(0,240,255,0.4)] backdrop-blur-md flex items-center gap-3">
              <Zap size={20} className="group-hover:animate-pulse" />
              Launch Terminal
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            </button>
          </Link>
          
          <button className="px-10 py-4 rounded-xl font-bold tracking-widest uppercase text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700 backdrop-blur-sm">
            Initialize Demo
          </button>
        </motion.div>

        {/* Feature Grid Below the Fold */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full max-w-4xl"
        >
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center">
            <Activity className="text-purple-400 mb-4" size={32} />
            <h3 className="text-white font-semibold mb-2">Neural Prediction</h3>
            <p className="text-slate-500 text-sm">Gemini-powered pattern recognition scanning real-time websocket streams.</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center">
            <ShieldAlert className="text-cyan-400 mb-4" size={32} />
            <h3 className="text-white font-semibold mb-2">Risk Engine</h3>
            <p className="text-slate-500 text-sm">Dynamic confidence spheres quantifying trade danger metrics in real-time.</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center">
            <Zap className="text-emerald-400 mb-4" size={32} />
            <h3 className="text-white font-semibold mb-2">Whale Tracking</h3>
            <p className="text-slate-500 text-sm">Visualize institutional movements via animated data streams.</p>
          </div>
        </motion.div>
      </div>

      {/* Decorative Scanline Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 opacity-20"></div>
    </>
  );
}
