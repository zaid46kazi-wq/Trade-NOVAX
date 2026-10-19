"use client";

import React, { useState } from "react";
import TerminalHeader from "../../components/Terminal/TerminalHeader";
import TerminalSidebar, { TerminalViewId } from "../../components/Terminal/TerminalSidebar";
import MarketOverview from "../../components/Terminal/MarketOverview";
import CryptoMarketsView from "../../components/Terminal/CryptoMarketsView";
import ForexMarketsView from "../../components/Terminal/ForexMarketsView";
import AIAnalystView from "../../components/Terminal/AIAnalystView";
import TechnicalAnalysisView from "../../components/Terminal/TechnicalAnalysisView";
import TradingSignalsView from "../../components/Terminal/TradingSignalsView";
import RiskCalculatorView from "../../components/Terminal/RiskCalculatorView";
import WhaleActivityView from "../../components/Terminal/WhaleActivityView";
import WatchlistView from "../../components/Terminal/WatchlistView";
import PaperTradingView from "../../components/Terminal/PaperTradingView";
import SettingsView from "../../components/Terminal/SettingsView";
import AICopilot from "../../components/Terminal/AICopilot";

export default function TerminalPage() {
  const [activeView, setActiveView] = useState<TerminalViewId>("overview");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("BTCUSDT");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [showCopilot, setShowCopilot] = useState<boolean>(false);

  const handleSelectSymbol = (sym: string) => {
    setSelectedSymbol(sym);
  };

  return (
    <div className="h-[100dvh] w-full bg-[#090a0c] text-slate-100 flex flex-col overflow-hidden select-none">
      {/* Institutional Bloomberg Header */}
      <TerminalHeader
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenCopilot={() => setShowCopilot(true)}
        onSelectSymbol={handleSelectSymbol}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Collapsible Navigation Sidebar */}
        <TerminalSidebar
          activeView={activeView}
          onSelectView={(v) => setActiveView(v)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Viewport Dynamic Content Container */}
        <main className="flex-1 min-w-0 p-3 overflow-y-auto no-scrollbar bg-[#090a0c]">
          {activeView === "overview" && (
            <MarketOverview
              selectedSymbol={selectedSymbol}
              onSelectSymbol={handleSelectSymbol}
              onNavigateToView={(v) => setActiveView(v as TerminalViewId)}
            />
          )}

          {activeView === "crypto" && (
            <CryptoMarketsView
              onSelectSymbol={(sym) => {
                handleSelectSymbol(sym);
                setActiveView("overview");
              }}
            />
          )}

          {activeView === "forex" && (
            <ForexMarketsView
              onSelectSymbol={(sym) => {
                handleSelectSymbol(sym);
                setActiveView("overview");
              }}
            />
          )}

          {activeView === "ai_analyst" && (
            <AIAnalystView defaultSymbol={selectedSymbol} />
          )}

          {activeView === "technical" && (
            <TechnicalAnalysisView defaultSymbol={selectedSymbol} />
          )}

          {activeView === "signals" && (
            <TradingSignalsView defaultSymbol={selectedSymbol} />
          )}

          {activeView === "risk" && (
            <RiskCalculatorView defaultSymbol={selectedSymbol} />
          )}

          {activeView === "whales" && (
            <WhaleActivityView />
          )}

          {activeView === "watchlist" && (
            <WatchlistView
              onSelectAsset={(sym) => {
                handleSelectSymbol(sym);
                setActiveView("overview");
              }}
            />
          )}

          {activeView === "paper_trading" && (
            <PaperTradingView defaultSymbol={selectedSymbol} />
          )}

          {activeView === "history" && (
            <PaperTradingView defaultSymbol={selectedSymbol} />
          )}

          {activeView === "settings" && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Persistent AI Copilot (Jarvis) */}
      <AICopilot isOpenControlled={showCopilot} onOpenChange={setShowCopilot} />
    </div>
  );
}
