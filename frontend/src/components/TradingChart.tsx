"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getSocket } from "../lib/socket";
import { Activity } from "lucide-react";

interface CandleData {
  time: string;
  open?: number;
  high?: number;
  low?: number;
  close: number;
  volume?: number;
}

export default function TradingChart({ pair = "BTCUSDT" }: { pair?: string }) {
  const [data, setData] = useState<CandleData[]>([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/candles/${pair}`)
      .then((res) => res.json())
      .then((history) => {
        if (Array.isArray(history)) {
          const formatted = history.map((c: any) => ({
            time: new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            close: c.close,
          }));
          setData(formatted);
        }
      })
      .catch((err) => console.error("Failed to fetch candle history:", err));

    const socket = getSocket();
    socket.emit("subscribe", pair);
    socket.on("new_candle", (payload: { pair: string; candle: any }) => {
      if (payload.pair === pair) {
        setData((prev) => {
          const newData = [...prev, {
            time: new Date(payload.candle.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            close: payload.candle.close,
          }];
          if (newData.length > 50) return newData.slice(newData.length - 50);
          return newData;
        });
      }
    });

    return () => {
      socket.emit("unsubscribe", pair);
      socket.off("new_candle");
    };
  }, [pair]);

  return (
    <div className="w-full h-[450px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all hover:border-cyan-500/30">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </div>
          {pair} <span className="text-slate-400 font-normal text-sm">Live Chart</span>
        </h2>
        <div className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-cyan-500/20 flex items-center gap-2">
          <Activity size={14} /> Streaming
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
            <XAxis dataKey="time" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
            <YAxis domain={['auto', 'auto']} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
              itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
            />
            <Area type="monotone" dataKey="close" stroke="#06b6d4" fillOpacity={1} fill="url(#colorClose)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
