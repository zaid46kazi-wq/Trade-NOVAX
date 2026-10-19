"use client";

import React, { useState, useEffect } from "react";
import { TerminalCard } from "../ui/TerminalCard";
import { TerminalBadge } from "../ui/TerminalBadge";
import { marketDataService, MarketAsset } from "../../lib/marketDataService";
import { alertsEngine } from "../../lib/alertsEngine";
import { Coins, Search, Star } from "lucide-react";

export default function CryptoMarketsView({ onSelectSymbol }: { onSelectSymbol?: (symbol: string) => void }) {
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [search, setSearch] = useState<string>("");
  const [watchlist, setWatchlist] = useState<string[]>(alertsEngine.getWatchlist());

  useEffect(() => {
    const unsubAssets = marketDataService.subscribeAll((data) => {
      setAssets(data.filter((a) => a.category === "crypto"));
    });
    const unsubWl = alertsEngine.onWatchlistChange((w) => setWatchlist(w));

    return () => {
      unsubAssets();
      unsubWl();
    };
  }, []);

  const filtered = assets.filter(
    (a) =>
      a.symbol.toLowerCase().includes(search.toLowerCase()) ||
      a.displayName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="terminal-panel p-3 bg-[#111318] flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Coins size={16} className="text-amber-500" />
          <span className="font-bold uppercase tracking-wider text-slate-200">
            Cryptocurrency Spot Markets
          </span>
          <TerminalBadge variant="gold" size="xs">BINANCE FEED</TerminalBadge>
        </div>

        <div className="relative">
          <Search size={11} className="absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crypto pairs..."
            className="bg-[#141720] border border-[#232938] rounded pl-7 pr-3 py-1 text-xs text-slate-200 outline-none w-48 focus:w-60 transition-all"
          />
        </div>
      </div>

      <TerminalCard
        title="Live Crypto Orderbook Quotes"
        subtitle="24h Volume, Price Action & Tick Stream"
        className="flex-1"
      >
        <div className="w-full overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-500 border-b border-[#1f2430] text-[10px] uppercase">
                <th className="pb-2">Pair</th>
                <th className="pb-2">Asset Name</th>
                <th className="pb-2 text-right">Last Price</th>
                <th className="pb-2 text-right">24h Change</th>
                <th className="pb-2 text-right">24h High</th>
                <th className="pb-2 text-right">24h Low</th>
                <th className="pb-2 text-right">24h Volume</th>
                <th className="pb-2 text-center">Watchlist</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181c25]">
              {filtered.map((asset) => {
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
                    <td className="py-2.5 text-right font-bold text-slate-100">
                      ${asset.price.toFixed(asset.price >= 1 ? 2 : 5)}
                    </td>
                    <td className="py-2.5 text-right font-bold">
                      <span className={isUp ? "text-emerald-400" : "text-red-400"}>
                        {isUp ? "+" : ""}
                        {asset.changePercent24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-slate-400 text-[11px]">
                      ${asset.high24h.toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right text-slate-400 text-[11px]">
                      ${asset.low24h.toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right text-slate-300">
                      {asset.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
