"use client";

import { CalendarDays, AlertOctagon } from "lucide-react";

const events = [
  { id: 1, name: "US Core CPI (MoM)", time: "14:30", impact: "High", actual: "-", forecast: "0.3%", prev: "0.4%", asset: "USD, BTC" },
  { id: 2, name: "ECB Interest Rate Decision", time: "18:15", impact: "High", actual: "-", forecast: "4.25%", prev: "4.50%", asset: "EUR" },
  { id: 3, name: "Initial Jobless Claims", time: "14:30", impact: "Med", actual: "-", forecast: "215K", prev: "211K", asset: "USD" },
];

export default function EconomicCalendar() {
  return (
    <div className="glass-panel p-4 rounded-2xl h-full flex flex-col relative overflow-hidden">
      <h3 className="text-amber-400 font-bold uppercase tracking-widest text-[10px] mb-3 flex items-center gap-1.5 opacity-80 border-b border-white/5 pb-2">
        <CalendarDays size={12} /> Economic Calendar
      </h3>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2">
        {events.map((ev) => (
          <div key={ev.id} className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/50 flex flex-col gap-1">
            <div className="flex justify-between items-start">
              <span className="text-white text-xs font-bold w-2/3 leading-tight">{ev.name}</span>
              <div className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest flex items-center gap-1 ${
                ev.impact === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {ev.impact === 'High' && <AlertOctagon size={8} />}
                {ev.impact}
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-1">
              <div className="flex gap-2 text-[10px] font-mono">
                <span className="text-slate-500">{ev.time}</span>
                <span className="text-cyan-400 bg-cyan-950/30 px-1 rounded">{ev.asset}</span>
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                Est: <span className="text-white">{ev.forecast}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
