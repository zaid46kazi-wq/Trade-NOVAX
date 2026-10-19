"use client";

import React, { useState, useEffect } from "react";
import { TerminalCard } from "../ui/TerminalCard";
import { TerminalBadge } from "../ui/TerminalBadge";
import { marketDataService, MarketAsset } from "../../lib/marketDataService";
import { alertsEngine } from "../../lib/alertsEngine";
import { Globe2, Star } from "lucide-react";

export default function ForexMarketsView({ onSelectSymbol }: { onSelectSymbol?: (symbol: string) => void }) {
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>(alertsEngine.getWatchlist());

  useEffect(() => {
    const unsub = marketDataService.subscribeAll((data) => {
      setAssets(data.filter((a) => a.category === "forex"));
    });
    const unsubWl = alertsEngine.onWatchlistChange((w) => setWatchlist(w));

    return () => {
      unsub();
      unsubWl();
    };
  }, []);

  return (
    <div className="flex flex-col gap-3 h-full font-mono">
      {/* Session Header */}
      <div className="terminal-panel p-3 bg-[#111318] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Globe2 size={16} className="text-amber-500" />
          <span className="font-bold uppercase tracking-wider text-slate-200">
            Institutional Forex Currency Markets
          </span>
          <TerminalBadge variant="gold" size="xs">CENTRAL BANK / FX FEED</TerminalBadge>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>London / New York Session</span>
          </div>
        </div>
      </div>

      {/* Forex Watch Table */}
      <TerminalCard
        title="Major FX Pairs"
        subtitle="Institutional Interbank Exchange Rates"
        className="flex-1"
      >
        <div className="w-full overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-500 border-b border-[#1f2430] text-[10px] uppercase">
                <th className="pb-2">Pair</th>
                <th className="pb-2">Currency Description</th>
                <th className="pb-2 text-right">Bid / Rate</th>
                <th className="pb-2 text-right">24h Change</th>
                <th className="pb-2 text-right">Session High</th>
                <th className="pb-2 text-right">Session Low</th>
                <th className="pb-2 text-center">Watchlist</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181c25]">
              {assets.map((asset) => {
                const isUp = asset.changePercent24h >= 0;
                const isPinned = watchlist.includes(asset.symbol);

                return (
                  <tr
                    key={asset.symbol}
                    onClick={() => onSelectSymbol && onSelectSymbol(asset.symbol)}
                    className="hover:bg-[#151922] transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 font-bold text-amber-400">{asset.symbol}</td>
                    <td className="py-2.5 text-slate-400 text-[11px]">{asset.displayName}</td>
                    <td className="py-2.5 text-right font-bold text-slate-100 font-mono">
                      {asset.price.toFixed(asset.symbol.includes("JPY") ? 3 : 5)}
                    </td>
                    <td className="py-2.5 text-right font-bold">
                      <span className={isUp ? "text-emerald-400" : "text-red-400"}>
                        {isUp ? "+" : ""}
                        {asset.changePercent24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-slate-400 text-[11px]">
                      {asset.high24h.toFixed(asset.symbol.includes("JPY") ? 3 : 5)}
                    </td>
                    <td className="py-2.5 text-right text-slate-400 text-[11px]">
                      {asset.low24h.toFixed(asset.symbol.includes("JPY") ? 3 : 5)}
                    </td>
                    <td className="py-2.5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alertsEngine.toggleWatchlist(asset.symbol);
                        }}
                        className="text-slate-500 hover:text-amber-400 p-1"
                      >
                        <Star
                          size={12}
                          className={isPinned ? "fill-amber-400 text-amber-400" : "text-slate-600"}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </TerminalCard>
    </div>
  );
}
