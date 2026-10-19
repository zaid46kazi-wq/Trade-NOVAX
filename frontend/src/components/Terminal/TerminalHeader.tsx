"use client";

import React, { useState, useEffect } from "react";
import { marketDataService, ConnectionStatus } from "../../lib/marketDataService";
import { alertsEngine, AlertNotification } from "../../lib/alertsEngine";
import {
  Search,
  Bell,
  Menu,
  Bot,
} from "lucide-react";
import Link from "next/link";

interface TerminalHeaderProps {
  onToggleSidebar?: () => void;
  onOpenCopilot?: () => void;
  onSelectSymbol?: (symbol: string) => void;
}

export default function TerminalHeader({
  onToggleSidebar,
  onOpenCopilot,
  onSelectSymbol,
}: TerminalHeaderProps) {
  const [status, setStatus] = useState<ConnectionStatus>(marketDataService.getStatus());
  const [lastUpdate, setLastUpdate] = useState<number>(marketDataService.getLastUpdated());
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const unsubStatus = marketDataService.onStatusChange((s) => {
      setStatus(s);
      setLastUpdate(marketDataService.getLastUpdated());
    });
    const unsubNotifs = alertsEngine.onNotificationsChange((n) => setNotifications(n));

    const clockTimer = setInterval(() => {
      setTimeStr(
        new Date().toLocaleTimeString("en-GB", {
          timeZone: "UTC",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " UTC"
      );
    }, 1000);

    return () => {
      unsubStatus();
      unsubNotifs();
      clearInterval(clockTimer);
    };
  }, []);

  const searchResults = searchQuery
    ? marketDataService.DEFAULT_ASSETS.filter(
        (a) =>
          a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="terminal-header bg-[#101217] border-b border-[#1f232e] px-3 py-1.5 flex items-center justify-between gap-3 text-xs font-mono select-none shrink-0 z-40">
      {/* Left: Branding & Sidebar Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#1a1e27] transition-colors"
          title="Toggle Navigation Sidebar"
        >
          <Menu size={16} />
        </button>

        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-5 h-5 rounded bg-amber-600/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-bold text-[10px]">
            ⚡
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold tracking-widest text-slate-100 text-sm">
              TRADENOVA<span className="text-amber-500">·X</span>
            </span>
            <span className="text-[9px] text-amber-500/80 font-bold uppercase tracking-wider hidden sm:inline">
              INSTITUTIONAL
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Search & Market Autocomplete */}
      <div className="relative flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            placeholder="Search crypto or forex (e.g. BTC, ETH, EURUSD)..."
            className="w-full bg-[#141720] border border-[#222838] focus:border-amber-500 rounded pl-7 pr-3 py-1 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600"
          />
        </div>

        {isSearchFocused && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#141720] border border-[#272f42] rounded shadow-2xl z-50 overflow-hidden divide-y divide-[#1e2330]">
            {searchResults.map((asset) => (
              <button
                key={asset.symbol}
                onMouseDown={() => {
                  if (onSelectSymbol) onSelectSymbol(asset.symbol);
                  setSearchQuery("");
                }}
                className="w-full p-2 text-left hover:bg-[#1c2230] flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-bold text-amber-400 mr-2">{asset.symbol}</span>
                  <span className="text-slate-400 text-[11px]">{asset.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase">{asset.category}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Data Feed Status, UTC Clock, Alerts, and JARVIS Copilot */}
      <div className="flex items-center gap-3">
        {/* Connection Health Indicator */}
        <div
          title={`Feed: ${status.toUpperCase()} | Last update: ${lastUpdate > 0 ? new Date(lastUpdate).toLocaleTimeString() : "Synchronizing..."}`}
          className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#151821] border border-[#222735] text-[10px]"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              status === "live"
                ? "bg-emerald-500 pulse-live"
                : status === "stale"
                ? "bg-amber-500"
                : "bg-red-500"
            }`}
          />
          <span className="text-slate-400 uppercase font-bold">{status}</span>
          <span className="text-slate-600 font-mono">|</span>
          <span className="text-slate-400">{timeStr || "UTC"}</span>
        </div>

        {/* Notifications / Alerts Menu */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-[#1a1e27] relative transition-colors"
            title="Price Alerts"
          >
            <Bell size={14} />
            {notifications.length > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-amber-500 text-black font-extrabold text-[9px] rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-[#13161f] border border-[#262d3e] rounded shadow-2xl p-2.5 z-50 text-xs font-mono">
              <div className="flex justify-between items-center pb-2 border-b border-[#202534] mb-2">
                <span className="font-bold text-slate-200 uppercase text-[10px]">
                  Alert Trigger Ledger
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={() => alertsEngine.clearNotifications()}
                    className="text-[10px] text-amber-400 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-[11px]">
                  No triggered threshold alerts in this session.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2 bg-[#181c26] border border-[#222837] rounded flex flex-col gap-0.5"
                    >
                      <div className="flex justify-between font-bold text-amber-400 text-[11px]">
                        <span>{n.symbol} Hit Target!</span>
                        <span className="text-slate-500 text-[9px]">
                          {new Date(n.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-300">{n.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Copilot Button */}
        <button
          onClick={onOpenCopilot}
          className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/40 text-amber-400 hover:text-amber-300 font-bold rounded flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(217,119,6,0.15)]"
        >
          <Bot size={13} />
          <span className="hidden sm:inline">JARVIS AI</span>
        </button>
      </div>
    </header>
  );
}
