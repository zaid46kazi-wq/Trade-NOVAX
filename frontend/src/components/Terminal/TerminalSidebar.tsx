"use client";

import React from "react";
import {
  LayoutDashboard,
  Coins,
  Globe2,
  BrainCircuit,
  LineChart,
  TrendingUp,
  Calculator,
  Zap,
  Star,
  Wallet,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type TerminalViewId =
  | "overview"
  | "crypto"
  | "forex"
  | "ai_analyst"
  | "technical"
  | "signals"
  | "risk"
  | "whales"
  | "watchlist"
  | "paper_trading"
  | "history"
  | "settings";

interface TerminalSidebarProps {
  activeView: TerminalViewId;
  onSelectView: (view: TerminalViewId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function TerminalSidebar({
  activeView,
  onSelectView,
  collapsed,
  onToggleCollapse,
}: TerminalSidebarProps) {
  const navItems: { id: TerminalViewId; label: string; icon: React.ReactNode; group: string }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={15} />, group: "MARKETS" },
    { id: "crypto", label: "Crypto Markets", icon: <Coins size={15} />, group: "MARKETS" },
    { id: "forex", label: "Forex Markets", icon: <Globe2 size={15} />, group: "MARKETS" },

    { id: "ai_analyst", label: "AI Analyst", icon: <BrainCircuit size={15} />, group: "INTELLIGENCE" },
    { id: "technical", label: "Technical Analysis", icon: <LineChart size={15} />, group: "INTELLIGENCE" },
    { id: "signals", label: "Trading Signals", icon: <TrendingUp size={15} />, group: "INTELLIGENCE" },
    { id: "whales", label: "Whale Activity", icon: <Zap size={15} />, group: "INTELLIGENCE" },

    { id: "risk", label: "Risk Calculator", icon: <Calculator size={15} />, group: "EXECUTION" },
    { id: "watchlist", label: "Watchlist & Alerts", icon: <Star size={15} />, group: "EXECUTION" },
    { id: "paper_trading", label: "Paper Trading", icon: <Wallet size={15} />, group: "EXECUTION" },
    { id: "history", label: "Trade History", icon: <History size={15} />, group: "EXECUTION" },

    { id: "settings", label: "Settings", icon: <Settings size={15} />, group: "SYSTEM" },
  ];

  return (
    <aside
      className={`bg-[#0d0f13] border-r border-[#1e222c] flex flex-col justify-between transition-all duration-200 select-none shrink-0 z-30 ${
        collapsed ? "w-14" : "w-52"
      }`}
    >
      {/* Navigation List */}
      <div className="flex flex-col py-2 overflow-y-auto no-scrollbar font-mono text-xs">
        {navItems.map((item, idx) => {
          const isActive = activeView === item.id;
          const showGroup =
            !collapsed && (idx === 0 || navItems[idx - 1].group !== item.group);

          return (
            <React.Fragment key={item.id}>
              {showGroup && (
                <div className="px-3 pt-3 pb-1 text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">
                  {item.group}
                </div>
              )}
              <button
                onClick={() => onSelectView(item.id)}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-2.5 px-3 py-2 text-left transition-colors relative ${
                  isActive
                    ? "bg-[#181c25] text-amber-400 font-bold border-l-2 border-amber-500"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#13161e]"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                <span className={isActive ? "text-amber-500" : "text-slate-400"}>
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Footer Info & Collapse Toggle */}
      <div className="p-2 border-t border-[#1e222c] bg-[#0c0e12] flex flex-col gap-2 font-mono text-[10px]">
        {!collapsed && (
          <div className="flex flex-col gap-1 px-1 text-slate-500">
            <div className="flex items-center justify-between">
              <span>Binance WS:</span>
              <span className="text-emerald-400 font-bold">ONLINE</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Gemini 2.5:</span>
              <span className="text-amber-400 font-bold">ACTIVE</span>
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="w-full py-1.5 flex items-center justify-center gap-1.5 bg-[#141720] hover:bg-[#1a1e2a] border border-[#232938] rounded text-slate-400 hover:text-white transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          {!collapsed && <span className="text-[10px]">Collapse Bar</span>}
        </button>
      </div>
    </aside>
  );
}
