"use client";

import React, { useState } from "react";
import { TerminalCard } from "../ui/TerminalCard";
import { TerminalBadge } from "../ui/TerminalBadge";
import { calculateRisk, RiskCalculationResult } from "../../lib/riskCalculator";
import { marketDataService } from "../../lib/marketDataService";
import { ShieldAlert, ArrowUpRight, ArrowDownRight, Calculator, AlertTriangle } from "lucide-react";

export default function RiskCalculatorView({ defaultSymbol = "BTCUSDT" }: { defaultSymbol?: string }) {
  const [symbol, setSymbol] = useState<string>(defaultSymbol);
  const [accountEquity, setAccountEquity] = useState<number>(25000);
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [positionSide, setPositionSide] = useState<"LONG" | "SHORT">("LONG");

  const [entryPrice, setEntryPrice] = useState<number>(() => {
    const a = marketDataService.getAsset(defaultSymbol);
    const p = a && a.price > 0 ? a.price : 65000;
    return Number(p.toFixed(p > 1 ? 2 : 5));
  });

  const [stopLossPrice, setStopLossPrice] = useState<number>(() => {
    const a = marketDataService.getAsset(defaultSymbol);
    const p = a && a.price > 0 ? a.price : 65000;
    return Number((p * 0.98).toFixed(p > 1 ? 2 : 5));
  });

  const [targetPrice, setTargetPrice] = useState<number>(() => {
    const a = marketDataService.getAsset(defaultSymbol);
    const p = a && a.price > 0 ? a.price : 65000;
    return Number((p * 1.05).toFixed(p > 1 ? 2 : 5));
  });

  const applyPriceDefaults = (sym: string, side: "LONG" | "SHORT") => {
    const asset = marketDataService.getAsset(sym);
    if (asset && asset.price > 0) {
      const price = asset.price;
      setEntryPrice(Number(price.toFixed(price > 1 ? 2 : 5)));
      if (side === "LONG") {
        setStopLossPrice(Number((price * 0.98).toFixed(price > 1 ? 2 : 5)));
        setTargetPrice(Number((price * 1.05).toFixed(price > 1 ? 2 : 5)));
      } else {
        setStopLossPrice(Number((price * 1.02).toFixed(price > 1 ? 2 : 5)));
        setTargetPrice(Number((price * 0.95).toFixed(price > 1 ? 2 : 5)));
      }
    }
  };

  const handleSymbolChange = (newSym: string) => {
    setSymbol(newSym);
    applyPriceDefaults(newSym, positionSide);
  };

  const handleSideChange = (newSide: "LONG" | "SHORT") => {
    setPositionSide(newSide);
    applyPriceDefaults(symbol, newSide);
  };

  const result: RiskCalculationResult = calculateRisk({
    accountEquity,
    riskPercent,
    positionSide,
    entryPrice,
    stopLossPrice,
    targetPrice,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full">
      {/* Input Parameters Panel */}
      <div className="lg:col-span-5 flex flex-col gap-3">
        <TerminalCard
          title="Institutional Risk Parameters"
          subtitle="Position Sizing & Capital Allocation"
          icon={<Calculator size={14} />}
        >
          <div className="flex flex-col gap-3 text-xs font-mono">
            {/* Quick Symbol Switcher */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Asset Pair
              </label>
              <select
                value={symbol}
                onChange={(e) => handleSymbolChange(e.target.value)}
                className="w-full bg-[#161a22] border border-[#252c3b] rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-amber-500"
              >
                {marketDataService.DEFAULT_ASSETS.map((a) => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.symbol} — {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Position Direction Toggle */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Trade Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSideChange("LONG")}
                  className={`py-1.5 px-3 rounded font-bold flex items-center justify-center gap-1.5 transition-colors ${
                    positionSide === "LONG"
                      ? "bg-emerald-600 text-white"
                      : "bg-[#181c25] text-slate-400 hover:text-white border border-[#252c3b]"
                  }`}
                >
                  <ArrowUpRight size={14} /> LONG (Buy)
                </button>
                <button
                  type="button"
                  onClick={() => handleSideChange("SHORT")}
                  className={`py-1.5 px-3 rounded font-bold flex items-center justify-center gap-1.5 transition-colors ${
                    positionSide === "SHORT"
                      ? "bg-red-600 text-white"
                      : "bg-[#181c25] text-slate-400 hover:text-white border border-[#252c3b]"
                  }`}
                >
                  <ArrowDownRight size={14} /> SHORT (Sell)
                </button>
              </div>
            </div>

            {/* Account Equity Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Account Equity ($)
                </label>
                <span className="text-[10px] text-slate-500">Portfolio Total</span>
              </div>
              <input
                type="number"
                value={accountEquity}
                onChange={(e) => setAccountEquity(Number(e.target.value))}
                min={100}
                step={500}
                className="w-full bg-[#161a22] border border-[#252c3b] rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-amber-500"
              />
            </div>

            {/* Risk Percentage Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Risk Per Trade (%)
                </label>
                <span className="text-amber-400 font-bold">
                  ${((accountEquity * riskPercent) / 100).toFixed(2)} Risk Budget
                </span>
              </div>
              <div className="flex gap-1.5 mb-1.5">
                {[0.5, 1.0, 1.5, 2.0, 3.0].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setRiskPercent(pct)}
                    className={`flex-1 py-1 rounded text-[10px] transition-colors ${
                      riskPercent === pct
                        ? "bg-amber-600 text-white font-bold"
                        : "bg-[#181c25] text-slate-400 hover:text-white border border-[#262c3b]"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={riskPercent}
                onChange={(e) => setRiskPercent(Number(e.target.value))}
                min={0.1}
                max={20}
                step={0.1}
                className="w-full bg-[#161a22] border border-[#252c3b] rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-amber-500"
              />
            </div>

            {/* Price Levels (Entry, SL, TP) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Entry Price
                </label>
                <input
                  type="number"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(Number(e.target.value))}
                  step="any"
                  className="w-full bg-[#161a22] border border-[#252c3b] rounded px-2 py-1.5 text-slate-200 outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-red-400 uppercase tracking-wider block mb-1">
                  Stop Loss
                </label>
                <input
                  type="number"
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(Number(e.target.value))}
                  step="any"
                  className="w-full bg-[#161a22] border border-red-900/40 rounded px-2 py-1.5 text-red-300 outline-none focus:border-red-500 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-emerald-400 uppercase tracking-wider block mb-1">
                  Take Profit
                </label>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(Number(e.target.value))}
                  step="any"
                  className="w-full bg-[#161a22] border border-emerald-900/40 rounded px-2 py-1.5 text-emerald-300 outline-none focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            {/* Validation Message */}
            {!result.isValid && (
              <div className="p-2.5 bg-red-950/30 border border-red-800/50 rounded flex items-start gap-2 text-[11px] text-red-300">
                <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                <span>{result.errorMessage}</span>
              </div>
            )}
          </div>
        </TerminalCard>
      </div>

      {/* Calculated Results Panel */}
      <div className="lg:col-span-7 flex flex-col gap-3">
        <TerminalCard
          title="Position Sizing & Quantitative Metrics"
          subtitle="Formula-Verified Institutional Output"
          action={
            <TerminalBadge variant={result.isValid ? "up" : "down"}>
              {result.isValid ? "CALCULATION VERIFIED" : "INVALID RELATIONSHIP"}
            </TerminalBadge>
          }
        >
          {result.isValid ? (
            <div className="flex flex-col gap-3 font-mono text-xs">
              {/* Primary Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="bg-[#151922] p-3 rounded border border-[#242b3a] flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Position Size (Units)
                  </span>
                  <span className="text-xl font-bold text-amber-400 mt-1">
                    {result.positionSizeUnits} {symbol.replace("USDT", "")}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Notional: ${result.notionalPositionValue.toLocaleString()}
                  </span>
                </div>

                <div className="bg-[#151922] p-3 rounded border border-[#242b3a] flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Monetary Risk ($)
                  </span>
                  <span className="text-xl font-bold text-red-400 mt-1">
                    ${result.monetaryRisk.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {result.stopLossPercent.toFixed(2)}% distance to SL
                  </span>
                </div>

                <div className="bg-[#151922] p-3 rounded border border-[#242b3a] flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Risk / Reward Ratio
                  </span>
                  <span className="text-xl font-bold text-emerald-400 mt-1">
                    {result.formattedRiskReward}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {result.takeProfitPercent.toFixed(2)}% distance to TP
                  </span>
                </div>
              </div>

              {/* Detailed Accounting Breakdown */}
              <div className="terminal-panel p-3 bg-[#13161e] border border-[#212635] rounded">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 border-b border-[#212635] pb-1">
                  Expected Financial Outcomes
                </span>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center py-1 border-b border-[#1b1f2b]">
                    <span className="text-slate-400">Potential Gross Gain:</span>
                    <span className="font-bold text-emerald-400">+${result.grossGain.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#1b1f2b]">
                    <span className="text-slate-400">Estimated Round-Trip Fees (0.15%):</span>
                    <span className="text-amber-500">-${result.estimatedFees.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#1b1f2b]">
                    <span className="text-slate-200 font-bold">Estimated Net Gain:</span>
                    <span className="font-bold text-emerald-400 text-sm">+${result.netGain.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#1b1f2b]">
                    <span className="text-slate-400">Potential Net Loss (If Stopped):</span>
                    <span className="font-bold text-red-400 text-sm">-${result.netLoss.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Institutional Safety Advisory */}
              <div className="p-3 bg-[#12151d] border border-[#242b3a] rounded flex items-start gap-2.5">
                <ShieldAlert size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="text-[10px] text-slate-300 leading-relaxed">
                  <strong className="text-amber-400">Institutional Sizing Rule:</strong> The calculated position size limits your total loss to exactly ${result.monetaryRisk} (plus trading friction). Never increase notional exposure with leverage beyond your predefined stop-loss risk budget.
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 font-mono text-xs">
              <AlertTriangle size={32} className="text-amber-500 mb-2 opacity-60" />
              <span>Correct the parameter errors in the left panel to calculate position sizing.</span>
            </div>
          )}
        </TerminalCard>
      </div>
    </div>
  );
}
