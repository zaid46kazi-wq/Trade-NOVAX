"use client";

import { BarChart2 } from "lucide-react";

const assets = [
  { pair: "BTCUSDT", signal: "BUY", conf: 89, trend: "Bullish", risk: "Low", rr: "1:3", vol: "High", sent: "Positive", color: "emerald" },
  { pair: "EURUSD", signal: "BUY", conf: 87, trend: "Bullish", risk: "Low", rr: "1:2.8", vol: "Med", sent: "Positive", color: "emerald" },
  { pair: "XAUUSD", signal: "SELL", conf: 84, trend: "Bearish", risk: "Med", rr: "1:2.4", vol: "High", sent: "Negative", color: "rose" },
  { pair: "ETHUSDT", signal: "NEUTRAL", conf: 45, trend: "Ranging", risk: "Med", rr: "-", vol: "Low", sent: "Neutral", color: "slate" },
  { pair: "USDJPY", signal: "SELL", conf: 78, trend: "Bearish", risk: "Low", rr: "1:2", vol: "High", sent: "Negative", color: "rose" },
  { pair: "USOIL", signal: "BUY", conf: 81, trend: "Bullish", risk: "High", rr: "1:4", vol: "High", sent: "Positive", color: "emerald" },
];

export default function MultiAssetScanner() {
  return (
    <div className="glass-panel p-4 rounded-2xl h-full flex flex-col relative overflow-hidden">
      <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-[10px] mb-3 flex items-center gap-1.5 opacity-80 border-b border-white/5 pb-2">
        <BarChart2 size={12} /> Live Multi-Asset Scanner
      </h3>

      <div className="flex-1 overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-[10px] font-mono whitespace-nowrap">
          <thead>
            <tr className="text-slate-500 border-b border-white/5">
              <th className="pb-2 font-normal">Asset</th>
              <th className="pb-2 font-normal">Signal</th>
              <th className="pb-2 font-normal text-center">Conf</th>
              <th className="pb-2 font-normal">Trend</th>
              <th className="pb-2 font-normal">Risk</th>
              <th className="pb-2 font-normal">RR</th>
              <th className="pb-2 font-normal">Vol</th>
              <th className="pb-2 font-normal">Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer">
                <td className="py-2 text-white font-bold">{a.pair}</td>
                <td className={`py-2 font-bold ${a.color === 'emerald' ? 'text-emerald-400' : a.color === 'rose' ? 'text-rose-400' : 'text-slate-400'}`}>
                  {a.signal}
                </td>
                <td className="py-2 text-center text-white">{a.conf}%</td>
                <td className="py-2 text-slate-300">{a.trend}</td>
                <td className={`py-2 ${a.risk === 'Low' ? 'text-emerald-400' : a.risk === 'High' ? 'text-rose-400' : 'text-amber-400'}`}>{a.risk}</td>
                <td className="py-2 text-cyan-400">{a.rr}</td>
                <td className="py-2 text-slate-400">{a.vol}</td>
                <td className="py-2 text-slate-400">{a.sent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
