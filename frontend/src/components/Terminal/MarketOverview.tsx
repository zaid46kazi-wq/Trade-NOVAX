"use client";

import React, { useState, useEffect } from "react";
import { TerminalCard } from "../ui/TerminalCard";
import { TerminalBadge } from "../ui/TerminalBadge";
import FinancialChart from "./FinancialChart";
import { marketDataService, MarketAsset } from "../../lib/marketDataService";
import { alertsEngine } from "../../lib/alertsEngine";
import {
  Star,
  Search,
} from "lucide-react";

interface MarketOverviewProps {
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  onNavigateToView?: (view: string) => void;
}

export default function MarketOverview({
  selectedSymbol,
  onSelectSymbol,
  onNavigateToView,
}: MarketOverviewProps) {
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<"ALL" | "CRYPTO" | "FOREX">("ALL");
  const [sortField, setSortField] = useState<"symbol" | "price" | "change">("change");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [watchlist, setWatchlist] = useState<string[]>(alertsEngine.getWatchlist());

  useEffect(() => {
    const unsubAssets = marketDataService.subscribeAll((data) => setAssets(data));
    const unsubWatchlist = alertsEngine.onWatchlistChange((w) => setWatchlist(w));

    return () => {
      unsubAssets();
      unsubWatchlist();
    };
  }, []);

  const selectedAsset = assets.find((a) => a.symbol === selectedSymbol) || assets[0];

  // Filtering & Sorting
  const filteredAssets = assets
    .filter((a) => {
      if (filterCategory === "CRYPTO" && a.category !== "crypto") return false;
      if (filterCategory === "FOREX" && a.category !== "forex") return false;
      if (search) {
        return (
          a.symbol.toLowerCase().includes(search.toLowerCase()) ||
          a.displayName.toLowerCase().includes(search.toLowerCase())
        );
      }
      return true;
    })
    .sort((a, b) => {
      let diff = 0;
      if (sortField === "symbol") diff = a.symbol.localeCompare(b.symbol);
      else if (sortField === "price") diff = a.price - b.price;
      else if (sortField === "change") diff = a.changePercent24h - b.changePercent24h;
      return sortAsc ? diff : -diff;
    });

  const toggleSort = (field: "symbol" | "price" | "change") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Movers
  const gainers = [...assets].sort((a, b) => b.changePercent24h - a.changePercent24h).slice(0, 3);
  const losers = [...assets].sort((a, b) => a.changePercent24h - b.changePercent24h).slice(0, 3);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Real-time Ticker Ribbon */}
      <div className="w-full bg-[#111318] border border-[#1f232e] rounded p-1.5 flex items-center gap-4 overflow-x-auto no-scrollbar font-mono text-xs shrink-0 select-none">
        <div className="flex items-center gap-2 pl-2 pr-3 border-r border-[#222734] shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-live" />
          <span className="text-[10px] uppercase font-bold text-slate-400">MARKET FEED</span>
        </div>

        <div className="flex items-center gap-6">
          {assets.slice(0, 8).map((asset) => {
            const isUp = asset.changePercent24h >= 0;
            return (
              <button
                key={asset.symbol}
                onClick={() => onSelectSymbol(asset.symbol)}
                className={`flex items-center gap-2 shrink-0 group transition-colors ${
                  selectedSymbol === asset.symbol ? "text-amber-400" : "text-slate-300 hover:text-white"
                }`}
              >
                <span className="font-bold text-[11px] group-hover:text-amber-400">{asset.symbol}</span>
                <span className="font-mono text-slate-200">
                  ${asset.price >= 1 ? asset.price.toFixed(2) : asset.price.toFixed(5)}
                </span>
                <span
                  className={`text-[10px] font-bold inline-flex items-center ${
                    isUp ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {isUp ? "+" : ""}
                  {asset.changePercent24h.toFixed(2)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Dominant Chart (Left 8) + Supporting Sidebar (Right 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-[460px]">
        {/* Dominant Interactive Financial Chart */}
        <div className="lg:col-span-8 flex flex-col min-h-[420px]">
          <FinancialChart symbol={selectedSymbol} />
        </div>

        {/* Right Supporting Panels */}
        <div className="lg:col-span-4 flex flex-col gap-3 min-h-[420px]">
          {/* Selected Asset Intelligence Summary */}
          {selectedAsset && (
            <TerminalCard
              title={`${selectedAsset.symbol} Summary`}
              subtitle={selectedAsset.displayName}
              action={
                <TerminalBadge
                  variant={selectedAsset.changePercent24h >= 0 ? "up" : "down"}
                  size="xs"
                >
                  {selectedAsset.changePercent24h >= 0 ? "+" : ""}
                  {selectedAsset.changePercent24h.toFixed(2)}%
                </TerminalBadge>
              }
            >
              <div className="flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between items-baseline border-b border-[#1c202a] pb-2">
                  <span className="text-slate-400">Current Price:</span>
                  <span className="text-lg font-bold text-slate-100">
                    ${selectedAsset.price >= 1 ? selectedAsset.price.toFixed(2) : selectedAsset.price.toFixed(5)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-[#141720] p-2 rounded border border-[#202534]">
                    <span className="text-[9px] text-slate-500 uppercase block">24h High</span>
                    <span className="font-bold text-slate-200">
                      ${selectedAsset.high24h >= 1 ? selectedAsset.high24h.toFixed(2) : selectedAsset.high24h.toFixed(4)}
                    </span>
                  </div>
                  <div className="bg-[#141720] p-2 rounded border border-[#202534]">
                    <span className="text-[9px] text-slate-500 uppercase block">24h Low</span>
                    <span className="font-bold text-slate-200">
                      ${selectedAsset.low24h >= 1 ? selectedAsset.low24h.toFixed(2) : selectedAsset.low24h.toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="bg-[#141720] p-2.5 rounded border border-[#202534] space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>24h Absolute:</span>
                    <span className={selectedAsset.change24h >= 0 ? "text-emerald-400" : "text-red-400"}>
                      {selectedAsset.change24h >= 0 ? "+" : ""}${selectedAsset.change24h.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Feed Source:</span>
                    <span className="text-slate-300 font-bold uppercase">{selectedAsset.source}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Integrity:</span>
                    <span className="text-emerald-400">100% Real Tick</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => onNavigateToView && onNavigateToView("signals")}
                    className="flex-1 py-1.5 bg-[#181d28] hover:bg-amber-600/30 border border-[#262e3f] hover:border-amber-500 text-amber-400 font-bold text-[10px] rounded transition-all"
                  >
                    View Signals
                  </button>
                  <button
                    onClick={() => onNavigateToView && onNavigateToView("risk")}
                    className="flex-1 py-1.5 bg-[#181d28] hover:bg-emerald-600/30 border border-[#262e3f] hover:border-emerald-500 text-emerald-400 font-bold text-[10px] rounded transition-all"
                  >
                    Calculate Risk
                  </button>
                </div>
              </div>
            </TerminalCard>
          )}

          {/* Market Movers Panel */}
          <TerminalCard title="24h Market Movers" subtitle="Real-time Price Velocity">
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {/* Gainers */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                  Top Gainers
                </span>
                {gainers.map((g) => (
                  <button
                    key={g.symbol}
                    onClick={() => onSelectSymbol(g.symbol)}
                    className="p-1.5 bg-[#141820] hover:bg-[#1a202c] rounded border border-[#202736] flex justify-between items-center text-left transition-colors"
                  >
                    <span className="font-bold text-slate-200 text-[10px]">{g.symbol}</span>
                    <span className="text-emerald-400 font-bold text-[10px]">
                      +{g.changePercent24h.toFixed(1)}%
                    </span>
                  </button>
                ))}
              </div>

              {/* Losers */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-red-400 uppercase font-bold tracking-wider">
                  Top Decliners
                </span>
                {losers.map((l) => (
                  <button
                    key={l.symbol}
                    onClick={() => onSelectSymbol(l.symbol)}
                    className="p-1.5 bg-[#141820] hover:bg-[#1a202c] rounded border border-[#202736] flex justify-between items-center text-left transition-colors"
                  >
                    <span className="font-bold text-slate-200 text-[10px]">{l.symbol}</span>
                    <span className="text-red-400 font-bold text-[10px]">
                      {l.changePercent24h.toFixed(1)}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </TerminalCard>
        </div>
      </div>

      {/* Market Watch Table (Bottom Area) */}
      <TerminalCard
        title="Institutional Market Watch"
        subtitle="Multi-Asset Orderbook & Pricing Matrix"
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#181c25] p-0.5 rounded border border-[#262c3b]">
              {(["ALL", "CRYPTO", "FOREX"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                    filterCategory === cat
                      ? "bg-amber-600 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search size={11} className="absolute left-2 top-2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter asset..."
                className="bg-[#141720] border border-[#232938] rounded pl-6 pr-2 py-1 text-[11px] font-mono text-slate-200 outline-none w-28 focus:w-36 transition-all"
              />
            </div>
          </div>
        }
      >
        <div className="w-full overflow-x-auto no-scrollbar max-h-[220px]">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-500 border-b border-[#1f2430] text-[10px] uppercase sticky top-0 bg-[#111318]">
                <th onClick={() => toggleSort("symbol")} className="pb-2 cursor-pointer hover:text-amber-400 select-none">
                  Asset {sortField === "symbol" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th className="pb-2">Name</th>
                <th onClick={() => toggleSort("price")} className="pb-2 text-right cursor-pointer hover:text-amber-400 select-none">
                  Price {sortField === "price" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => toggleSort("change")} className="pb-2 text-right cursor-pointer hover:text-amber-400 select-none">
                  24h Change {sortField === "change" ? (sortAsc ? "▲" : "▼") : ""}
                </th>
                <th className="pb-2 text-right">24h High</th>
                <th className="pb-2 text-right">24h Low</th>
                <th className="pb-2 text-right">Volume</th>
                <th className="pb-2 text-center">Watch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181c25]">
              {filteredAssets.map((asset) => {
                const isSelected = asset.symbol === selectedSymbol;
                const isUp = asset.changePercent24h >= 0;
                const isPinned = watchlist.includes(asset.symbol);

                return (
                  <tr
                    key={asset.symbol}
                    onClick={() => onSelectSymbol(asset.symbol)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "bg-[#1d222e]" : "hover:bg-[#151922]"
                    }`}
                  >
                    <td className="py-2 font-bold text-slate-200">
                      <span className={isSelected ? "text-amber-400 font-extrabold" : ""}>
                        {asset.symbol}
                      </span>
                    </td>
                    <td className="py-2 text-slate-400 text-[11px]">{asset.displayName}</td>
                    <td className="py-2 text-right font-bold text-slate-100">
                      ${asset.price >= 1 ? asset.price.toFixed(2) : asset.price.toFixed(5)}
                    </td>
                    <td className="py-2 text-right font-bold">
                      <span className={isUp ? "text-emerald-400" : "text-red-400"}>
                        {isUp ? "+" : ""}
                        {asset.changePercent24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-2 text-right text-slate-400 text-[11px]">
                      ${asset.high24h >= 1 ? asset.high24h.toFixed(2) : asset.high24h.toFixed(4)}
                    </td>
                    <td className="py-2 text-right text-slate-400 text-[11px]">
                      ${asset.low24h >= 1 ? asset.low24h.toFixed(2) : asset.low24h.toFixed(4)}
                    </td>
                    <td className="py-2 text-right text-slate-400 text-[11px]">
                      {asset.volume24h > 1000000
                        ? `${(asset.volume24h / 1000000).toFixed(1)}M`
                        : asset.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-2 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alertsEngine.toggleWatchlist(asset.symbol);
                        }}
                        className="text-slate-500 hover:text-amber-400 p-1"
                        title="Toggle Watchlist"
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
