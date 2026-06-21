"use client";

import dynamic from "next/dynamic";

// Dynamically import TradingView to avoid "window is not defined" SSR errors
const AdvancedRealTimeChart = dynamic(
  () => import("react-ts-tradingview-widgets").then(w => w.AdvancedRealTimeChart),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center bg-[#131722] text-cyan-500 animate-pulse">Initializing Institutional Engine...</div> }
);

export default function TVChart({ symbol = "BINANCE:BTCUSDT" }) {
  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <AdvancedRealTimeChart 
        key={symbol}
        symbol={symbol}
        theme="dark"
        autosize
        interval="60"
        timezone="Etc/UTC"
        style="1"
        locale="en"
        enable_publishing={false}
        hide_side_toolbar={false}
        allow_symbol_change={true}
        container_id="tv_chart"
      />
    </div>
  );
}
