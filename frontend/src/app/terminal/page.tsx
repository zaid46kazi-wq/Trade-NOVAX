"use client";

import { useState } from "react";
import TVChart from "../../components/Terminal/TVChart";
import AITradeCommandCenter from "../../components/Terminal/AITradeCommandCenter";
import LiveAIThinking from "../../components/Terminal/LiveAIThinking";
import AIReasoning from "../../components/Terminal/AIReasoning";
import MultiTimeframe from "../../components/Terminal/MultiTimeframe";
import FearGreedGauge from "../../components/Terminal/FearGreedGauge";
import AICopilot from "../../components/Terminal/AICopilot";
import TopOpportunities from "../../components/Terminal/TopOpportunities";
import MultiAssetScanner from "../../components/Terminal/MultiAssetScanner";
import ChartAnalyzer from "../../components/Terminal/ChartAnalyzer";
import MarketRegime from "../../components/Terminal/MarketRegime";
import EconomicCalendar from "../../components/Terminal/EconomicCalendar";
import PersonalPerformance from "../../components/Terminal/PersonalPerformance";
import OrderFlow from "../../components/Terminal/OrderFlow";
import { Cpu } from "lucide-react";

type MarketMode = "ALL MARKETS" | "CRYPTO" | "FOREX" | "COMMODITIES";
type SidebarTab = "INTELLIGENCE" | "MACRO" | "SCANNER";

export default function TerminalPage() {
  const [marketMode, setMarketMode] = useState<MarketMode>("ALL MARKETS");
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("INTELLIGENCE");
  const [selectedSymbol, setSelectedSymbol] = useState("BINANCE:BTCUSDT");
  const [displayPair, setDisplayPair] = useState("BTCUSDT");

  const handleSelectOpportunity = (pair: string) => {
    setDisplayPair(pair);
    if (pair.includes("USD") && !pair.includes("USDT")) {
      setSelectedSymbol(`FX_IDC:${pair}`);
    } else {
      setSelectedSymbol(`BINANCE:${pair}`);
    }
  };

  return (
    <div className="h-[100dvh] bg-black text-white font-sans aurora-bg relative overflow-hidden flex flex-col">
      
      {/* Global Navigation & Top Opportunities */}
      <div className="flex flex-col z-20 px-3 pt-3 shrink-0">
        <header className="flex items-center justify-between glass-panel px-6 py-2 rounded-t-2xl border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
              <Cpu className="text-cyan-400" size={16} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-400 uppercase">
                TradeNova Personal Terminal
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-black/50 p-1 rounded-lg border border-white/10">
            {["ALL MARKETS", "CRYPTO", "FOREX", "COMMODITIES"].map((mode) => (
              <button 
                key={mode}
                onClick={() => setMarketMode(mode as MarketMode)}
                className={`px-4 py-1.5 rounded text-[10px] font-bold tracking-widest transition-colors ${
                  marketMode === mode ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(0,240,255,0.5)]' : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </header>
        <TopOpportunities onSelect={handleSelectOpportunity} />
      </div>

      {/* Main Grid Layout */}
      <main className="w-full flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 relative z-10 min-h-0 p-3 pt-0 overflow-y-auto md:overflow-hidden">
        
        {/* LEFT COLUMN: Dynamic Intelligence (Spans 3) */}
        <div className="md:col-span-3 flex flex-col gap-3 md:overflow-y-auto no-scrollbar md:pb-4 overscroll-contain">
          {/* Sidebar Tabs */}
          <div className="flex gap-1 bg-black/50 p-1 rounded-lg border border-white/10 shrink-0">
            {["INTELLIGENCE", "MACRO", "SCANNER"].map((tab) => (
              <button 
                key={tab}
                onClick={() => setSidebarTab(tab as SidebarTab)}
                className={`flex-1 py-1.5 rounded text-[9px] font-bold tracking-widest transition-colors ${
                  sidebarTab === tab ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Conditional Sidebar Content */}
          {sidebarTab === "INTELLIGENCE" && (
            <>
              <div className="h-[220px] shrink-0"><PersonalPerformance /></div>
              <div className="h-[200px] shrink-0"><ChartAnalyzer /></div>
              <div className="h-[180px] shrink-0"><OrderFlow /></div>
            </>
          )}

          {sidebarTab === "MACRO" && (
            <>
              <div className="h-[250px] shrink-0"><EconomicCalendar /></div>
              <div className="h-[180px] shrink-0"><MarketRegime /></div>
              <div className="h-[160px] shrink-0"><FearGreedGauge /></div>
            </>
          )}

          {sidebarTab === "SCANNER" && (
            <div className="flex-1 min-h-[500px]">
              <MultiAssetScanner />
            </div>
          )}
        </div>

        {/* CENTER COLUMN: The Chart (Spans 6) */}
        <div className="md:col-span-6 flex flex-col gap-3 min-h-[500px] md:min-h-0">
          <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl relative border border-white/5 bg-[#131722]">
            <TVChart symbol={selectedSymbol} />
          </div>
          <div className="h-[80px] shrink-0">
            <MultiTimeframe />
          </div>
        </div>

        {/* RIGHT COLUMN: AI Command Center (Spans 3) */}
        <div className="md:col-span-3 flex flex-col gap-3 md:overflow-y-auto no-scrollbar md:pb-4 overscroll-contain">
          <div className="shrink-0">
            <AITradeCommandCenter pair={displayPair} />
          </div>
          <div className="shrink-0 h-[220px]">
            <AIReasoning />
          </div>
          <div className="flex-1 min-h-[200px] shrink-0">
            <LiveAIThinking />
          </div>
        </div>

      </main>

      <AICopilot />

      {/* Decorative Overlays */}
      <div className="pointer-events-none fixed inset-0 z-0 hologram opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
    </div>
  );
}
