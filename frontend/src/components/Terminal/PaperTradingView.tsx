"use client";

import React, { useState, useEffect } from "react";
import { TerminalCard } from "../ui/TerminalCard";
import { paperTradingEngine, PaperAccount } from "../../lib/paperTradingEngine";
import { marketDataService } from "../../lib/marketDataService";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function PaperTradingView({ defaultSymbol = "BTCUSDT" }: { defaultSymbol?: string }) {
  const [account, setAccount] = useState<PaperAccount>(paperTradingEngine.getAccount());
  const [symbol, setSymbol] = useState<string>(defaultSymbol);
  const [side, setSide] = useState<"LONG" | "SHORT">("LONG");
  const [units, setUnits] = useState<number>(0.1);
  const [currentPrice, setCurrentPrice] = useState<number>(65000);
  const [stopLoss, setStopLoss] = useState<string>("");
  const [takeProfit, setTakeProfit] = useState<string>("");
  const [actionMessage, setActionMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Subscribe to paper trading state
  useEffect(() => {
    const unsub = paperTradingEngine.subscribe((acc) => {
      setAccount(acc);
    });
    return () => unsub();
  }, []);

  // Update live prices and sync to paper trading engine
  useEffect(() => {
    const unsub = marketDataService.subscribeAll((assets) => {
      const priceMap: Record<string, number> = {};
      assets.forEach((a) => {
        if (a.price > 0) priceMap[a.symbol] = a.price;
      });

      // Update current selected symbol price
      if (priceMap[symbol]) {
        setCurrentPrice(priceMap[symbol]);
      }

      // Sync with open paper positions
      paperTradingEngine.updatePrices(priceMap);
    });

    return () => unsub();
  }, [symbol]);

  const handleExecuteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const sl = stopLoss ? parseFloat(stopLoss) : undefined;
    const tp = takeProfit ? parseFloat(takeProfit) : undefined;

    const res = paperTradingEngine.openOrder(symbol, side, units, currentPrice, sl, tp);
    setActionMessage({ text: res.message, success: res.success });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleClosePosition = (posId: string) => {
    const pos = account.openPositions.find((p) => p.id === posId);
    const exitPrice = pos ? pos.currentPrice : currentPrice;
    const res = paperTradingEngine.closePosition(posId, exitPrice, "MANUAL");
    setActionMessage({ text: res.message, success: res.success });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleReset = () => {
    paperTradingEngine.resetAccount(100000);
    setShowResetConfirm(false);
    setActionMessage({ text: "Simulated paper trading balance reset to $100,000.00", success: true });
    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Account Performance Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="terminal-panel p-2.5 bg-[#12141a]">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Total Equity</span>
          <span className="text-base font-bold font-mono text-slate-100">
            ${account.totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[9px] text-slate-500 font-mono block">
            Cash: ${account.cashBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className="terminal-panel p-2.5 bg-[#12141a]">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Realized P&L</span>
          <span
            className={`text-base font-bold font-mono ${
              account.realizedPnL >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {account.realizedPnL >= 0 ? "+" : ""}${account.realizedPnL.toFixed(2)}
          </span>
          <span className="text-[9px] text-slate-500 font-mono block">All closed trades</span>
        </div>

        <div className="terminal-panel p-2.5 bg-[#12141a]">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Margin Locked</span>
          <span className="text-base font-bold font-mono text-amber-400">
            ${account.marginLocked.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
          <span className="text-[9px] text-slate-500 font-mono block">
            {account.openPositions.length} active positions
          </span>
        </div>

        <div className="terminal-panel p-2.5 bg-[#12141a]">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Win Rate</span>
          <span className="text-base font-bold font-mono text-slate-100">
            {account.winRate.toFixed(1)}%
          </span>
          <span className="text-[9px] text-slate-500 font-mono block">
            {account.winCount}W / {account.lossCount}L
          </span>
        </div>

        <div className="terminal-panel p-2.5 bg-[#12141a]">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Profit Factor</span>
          <span className="text-base font-bold font-mono text-slate-100">
            {account.profitFactor.toFixed(2)}
          </span>
          <span className="text-[9px] text-slate-500 font-mono block">Gross Win / Gross Loss</span>
        </div>

        <div className="terminal-panel p-2.5 bg-[#12141a] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Max Drawdown</span>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-[10px] font-mono text-amber-500 hover:text-amber-400 flex items-center gap-1"
              title="Reset Simulated Portfolio"
            >
              <RotateCcw size={10} /> Reset
            </button>
          </div>
          <span className="text-base font-bold font-mono text-red-400">
            -{account.maxDrawdown.toFixed(2)}%
          </span>
          <span className="text-[9px] text-slate-500 font-mono">From peak equity</span>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="p-3 bg-amber-950/40 border border-amber-600/50 rounded flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-amber-200">
            <AlertCircle size={16} className="text-amber-400 shrink-0" />
            <span>Reset simulated portfolio balance back to $100,000.00 and clear history?</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded"
            >
              Confirm Reset
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-2 py-1 bg-[#1a1e27] text-slate-300 hover:text-white rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action Flash Alert */}
      {actionMessage && (
        <div
          className={`p-2 rounded text-xs font-mono flex items-center gap-2 ${
            actionMessage.success
              ? "bg-emerald-950/40 border border-emerald-800 text-emerald-300"
              : "bg-red-950/40 border border-red-800 text-red-300"
          }`}
        >
          {actionMessage.success ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Order Execution & Open Positions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
        {/* Order Execution Form */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <TerminalCard
            title="Simulated Order Placement"
            subtitle="Virtual Execution (Zero Real Capital Risk)"
            icon={<Wallet size={14} />}
          >
            <form onSubmit={handleExecuteOrder} className="flex flex-col gap-3 text-xs font-mono">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Asset Pair
                </label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full bg-[#161a22] border border-[#252c3b] rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-amber-500"
                >
                  {marketDataService.DEFAULT_ASSETS.map((a) => (
                    <option key={a.symbol} value={a.symbol}>
                      {a.symbol} — {a.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Side toggle */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Order Side
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSide("LONG")}
                    className={`py-1.5 px-3 rounded font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      side === "LONG"
                        ? "bg-emerald-600 text-white"
                        : "bg-[#181c25] text-slate-400 hover:text-white border border-[#252c3b]"
                    }`}
                  >
                    <ArrowUpRight size={14} /> BUY / LONG
                  </button>
                  <button
                    type="button"
                    onClick={() => setSide("SHORT")}
                    className={`py-1.5 px-3 rounded font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      side === "SHORT"
                        ? "bg-red-600 text-white"
                        : "bg-[#181c25] text-slate-400 hover:text-white border border-[#252c3b]"
                    }`}
                  >
                    <ArrowDownRight size={14} /> SELL / SHORT
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Quantity (Units)
                  </label>
                  <span className="text-[10px] text-amber-400">
                    Notional: ${(units * currentPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <input
                  type="number"
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value))}
                  min={0.001}
                  step={0.01}
                  className="w-full bg-[#161a22] border border-[#252c3b] rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              {/* Execution Price (Live Market) */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Execution Price (Live Binance/FX)
                </label>
                <div className="w-full bg-[#141720] border border-[#252c3b] rounded px-2.5 py-1.5 text-slate-300 font-bold flex justify-between items-center">
                  <span>${currentPrice >= 1 ? currentPrice.toFixed(2) : currentPrice.toFixed(5)}</span>
                  <span className="text-[9px] text-emerald-400 uppercase">Live Tick</span>
                </div>
              </div>

              {/* Optional SL / TP */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-red-400 uppercase tracking-wider block mb-1">
                    Stop Loss ($)
                  </label>
                  <input
                    type="number"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    placeholder="Optional"
                    step="any"
                    className="w-full bg-[#161a22] border border-red-900/40 rounded px-2 py-1.5 text-red-300 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-emerald-400 uppercase tracking-wider block mb-1">
                    Take Profit ($)
                  </label>
                  <input
                    type="number"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    placeholder="Optional"
                    step="any"
                    className="w-full bg-[#161a22] border border-emerald-900/40 rounded px-2 py-1.5 text-emerald-300 outline-none text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 font-bold uppercase tracking-wider rounded transition-all mt-2 ${
                  side === "LONG"
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-red-600 hover:bg-red-500 text-white"
                }`}
              >
                Execute Simulated {side} Order
              </button>
            </form>
          </TerminalCard>
        </div>

        {/* Open Positions & Trade History Table */}
        <div className="lg:col-span-8 flex flex-col gap-3 min-h-[300px]">
          {/* Active Positions Table */}
          <TerminalCard
            title="Open Virtual Positions"
            subtitle={`${account.openPositions.length} positions monitored live`}
            className="flex-1 min-h-[220px]"
          >
            <div className="w-full overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-slate-500 border-b border-[#1f2430] text-[10px] uppercase">
                    <th className="pb-2">Asset</th>
                    <th className="pb-2">Side</th>
                    <th className="pb-2 text-right">Units</th>
                    <th className="pb-2 text-right">Entry Price</th>
                    <th className="pb-2 text-right">Current Price</th>
                    <th className="pb-2 text-right">Unrealized P&L</th>
                    <th className="pb-2 text-center">SL / TP</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181c25]">
                  {account.openPositions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 font-mono text-xs">
                        No active virtual positions. Place an order on the left to start simulated trading.
                      </td>
                    </tr>
                  ) : (
                    account.openPositions.map((pos) => {
                      const isProfit = pos.unrealizedPnL >= 0;
                      return (
                        <tr key={pos.id} className="hover:bg-[#151922] transition-colors">
                          <td className="py-2.5 font-bold text-slate-200">{pos.symbol}</td>
                          <td className="py-2.5">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                pos.side === "LONG"
                                  ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                                  : "bg-red-950/40 text-red-400 border border-red-800/40"
                              }`}
                            >
                              {pos.side}
                            </span>
                          </td>
                          <td className="py-2.5 text-right text-slate-300">{pos.units}</td>
                          <td className="py-2.5 text-right text-slate-400">
                            ${pos.entryPrice >= 1 ? pos.entryPrice.toFixed(2) : pos.entryPrice.toFixed(4)}
                          </td>
                          <td className="py-2.5 text-right font-bold text-slate-200">
                            ${pos.currentPrice >= 1 ? pos.currentPrice.toFixed(2) : pos.currentPrice.toFixed(4)}
                          </td>
                          <td
                            className={`py-2.5 text-right font-bold ${
                              isProfit ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {isProfit ? "+" : ""}${pos.unrealizedPnL.toFixed(2)} (
                            {isProfit ? "+" : ""}{pos.unrealizedPnLPercent.toFixed(2)}%)
                          </td>
                          <td className="py-2.5 text-center text-[10px] text-slate-400">
                            {pos.stopLoss ? `$${pos.stopLoss}` : "-"} / {pos.takeProfit ? `$${pos.takeProfit}` : "-"}
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => handleClosePosition(pos.id)}
                              className="px-2 py-0.5 bg-red-950/40 hover:bg-red-900/50 border border-red-800/40 text-red-400 text-[10px] rounded transition-colors"
                            >
                              Close
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </TerminalCard>

          {/* Trade History Ledger */}
          <TerminalCard
            title="Closed Trade Execution Ledger"
            subtitle={`${account.tradeHistory.length} total completed transactions`}
            className="flex-1 min-h-[180px]"
          >
            <div className="w-full overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-slate-500 border-b border-[#1f2430] text-[10px] uppercase">
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Asset</th>
                    <th className="pb-2">Side</th>
                    <th className="pb-2 text-right">Entry</th>
                    <th className="pb-2 text-right">Exit</th>
                    <th className="pb-2 text-right">Realized P&L</th>
                    <th className="pb-2 text-right">Fee</th>
                    <th className="pb-2 text-right">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181c25]">
                  {account.tradeHistory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-500 font-mono text-xs">
                        No closed trades yet recorded in session.
                      </td>
                    </tr>
                  ) : (
                    account.tradeHistory.slice(0, 10).map((trade) => {
                      const isProfit = trade.realizedPnL >= 0;
                      return (
                        <tr key={trade.id} className="hover:bg-[#151922] transition-colors text-[11px]">
                          <td className="py-2 text-slate-400">
                            {new Date(trade.closedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="py-2 font-bold text-slate-200">{trade.symbol}</td>
                          <td className="py-2">
                            <span
                              className={`text-[9px] px-1 py-0.5 rounded font-bold ${
                                trade.side === "LONG" ? "text-emerald-400" : "text-red-400"
                              }`}
                            >
                              {trade.side}
                            </span>
                          </td>
                          <td className="py-2 text-right text-slate-400">
                            ${trade.entryPrice >= 1 ? trade.entryPrice.toFixed(2) : trade.entryPrice.toFixed(4)}
                          </td>
                          <td className="py-2 text-right text-slate-300">
                            ${trade.exitPrice >= 1 ? trade.exitPrice.toFixed(2) : trade.exitPrice.toFixed(4)}
                          </td>
                          <td
                            className={`py-2 text-right font-bold ${
                              isProfit ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {isProfit ? "+" : ""}${trade.realizedPnL.toFixed(2)}
                          </td>
                          <td className="py-2 text-right text-slate-500">-${trade.feePaid.toFixed(2)}</td>
                          <td className="py-2 text-right text-[10px] text-slate-400">{trade.exitReason}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </TerminalCard>
        </div>
      </div>
    </div>
  );
}
