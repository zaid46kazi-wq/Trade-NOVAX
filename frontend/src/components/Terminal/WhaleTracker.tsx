"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

interface WhaleTx {
  id: string;
  asset: string;
  amount: number;
  type: 'inflow' | 'outflow';
}

export default function WhaleTracker() {
  const [txs, setTxs] = useState<WhaleTx[]>([]);

  useEffect(() => {
    // Simulate real-time large transactions
    const interval = setInterval(() => {
      const isBTC = Math.random() > 0.5;
      const tx: WhaleTx = {
        id: Math.random().toString(36).substr(2, 9),
        asset: isBTC ? 'BTC' : 'ETH',
        amount: Math.floor(Math.random() * (isBTC ? 500 : 5000)) + 100,
        type: Math.random() > 0.5 ? 'inflow' : 'outflow'
      };
      setTxs(prev => [tx, ...prev].slice(0, 5));
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel p-6 rounded-2xl h-full flex flex-col relative overflow-hidden">
      <h3 className="text-aurora-violet font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
        <Zap size={16} /> Institutional Flow
      </h3>
      
      <div className="flex-1 flex flex-col gap-3 relative">
        <AnimatePresence>
          {txs.map((tx) => (
            <motion.div
              key={tx.id}
              initial={{ x: tx.type === 'inflow' ? -50 : 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`p-3 rounded-lg border flex justify-between items-center ${
                tx.type === 'inflow' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase tracking-wider">{tx.type}</span>
                <span className="text-white font-bold">{tx.asset}</span>
              </div>
              <div className={`font-mono text-lg ${tx.type === 'inflow' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {tx.type === 'inflow' ? '+' : '-'}{tx.amount.toLocaleString()}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
