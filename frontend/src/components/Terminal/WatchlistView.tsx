"use client";

import React, { useState, useEffect } from "react";
import { TerminalCard } from "../ui/TerminalCard";
import { TerminalBadge } from "../ui/TerminalBadge";
import { alertsEngine, PriceAlert, AlertNotification } from "../../lib/alertsEngine";
import { marketDataService, MarketAsset } from "../../lib/marketDataService";
import {
  Star,
  Bell,
  Trash2,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  CheckCircle2,
} from "lucide-react";

export default function WatchlistView({ onSelectAsset }: { onSelectAsset?: (symbol: string) => void }) {
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(alertsEngine.getWatchlist());
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [assets, setAssets] = useState<MarketAsset[]>(marketDataService.getAllAssets());
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Alert creation state
  const [alertSymbol, setAlertSymbol] = useState<string>("BTCUSDT");
  const [alertTargetPrice, setAlertTargetPrice] = useState<number>(70000);
  const [alertDirection, setAlertDirection] = useState<"ABOVE" | "BELOW">("ABOVE");
  const [alertNote, setAlertNote] = useState<string>("");
  const [alertSuccess, setAlertSuccess] = useState<boolean>(false);

  useEffect(() => {
    const unsubWatchlist = alertsEngine.onWatchlistChange((symbols) => setWatchlistSymbols(symbols));
    const unsubAlerts = alertsEngine.onAlertsChange((al) => setAlerts(al));
    const unsubNotifs = alertsEngine.onNotificationsChange((notifs) => setNotifications(notifs));
    const unsubAssets = marketDataService.subscribeAll((all) => {
      setAssets(all);
      // Run price checks for active alerts
      all.forEach((a) => {
        if (a.price > 0) {
          alertsEngine.checkPrice(a.symbol, a.price);
        }
      });
    });

    return () => {
      unsubWatchlist();
      unsubAlerts();
      unsubNotifs();
      unsubAssets();
    };
  }, []);

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertTargetPrice <= 0) return;
    alertsEngine.addAlert(alertSymbol, alertTargetPrice, alertDirection, alertNote);
    setAlertSuccess(true);
    setAlertNote("");
    setTimeout(() => setAlertSuccess(false), 3000);
  };

  const watchlistAssets = assets.filter((a) => watchlistSymbols.includes(a.symbol));
  const availableToAdd = assets.filter(
    (a) =>
      !watchlistSymbols.includes(a.symbol) &&
      (a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full">
      {/* Left Column: Watchlist Assets Table */}
      <div className="lg:col-span-7 flex flex-col gap-3">
        <TerminalCard
          title="Institutional Watchlist"
          subtitle={`${watchlistSymbols.length} tracked instruments`}
          icon={<Star size={14} className="text-amber-400 fill-amber-400" />}
          action={
            <span className="text-[10px] text-slate-400 font-mono">
              Live updates via WebSocket
            </span>
          }
        >
          <div className="w-full overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-500 border-b border-[#1f2430] text-[10px] uppercase">
                  <th className="pb-2">Symbol</th>
                  <th className="pb-2 text-right">Price</th>
                  <th className="pb-2 text-right">24h Change</th>
                  <th className="pb-2 text-right">24h High/Low</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181c25]">
                {watchlistAssets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 font-mono text-xs">
                      No assets currently pinned in your watchlist. Add symbols below.
                    </td>
                  </tr>
                ) : (
                  watchlistAssets.map((asset) => {
                    const isPositive = asset.changePercent24h >= 0;
                    return (
                      <tr
                        key={asset.symbol}
                        onClick={() => onSelectAsset && onSelectAsset(asset.symbol)}
                        className="hover:bg-[#151922] transition-colors cursor-pointer group"
                      >
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                alertsEngine.toggleWatchlist(asset.symbol);
                              }}
                              className="text-amber-400 hover:text-slate-500"
                              title="Remove from Watchlist"
                            >
                              <Star size={12} className="fill-amber-400" />
                            </button>
                            <div>
                              <span className="font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                                {asset.symbol}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                {asset.displayName}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 text-right font-bold text-slate-100">
                          ${asset.price >= 1 ? asset.price.toFixed(2) : asset.price.toFixed(5)}
                        </td>
                        <td className="py-2.5 text-right font-bold">
                          <span
                            className={`inline-flex items-center gap-0.5 ${
                              isPositive ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                            {isPositive ? "+" : ""}
                            {asset.changePercent24h.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-[10px] text-slate-400">
                          H: ${asset.high24h >= 1 ? asset.high24h.toFixed(2) : asset.high24h.toFixed(4)}
                          <br />
                          L: ${asset.low24h >= 1 ? asset.low24h.toFixed(2) : asset.low24h.toFixed(4)}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAlertSymbol(asset.symbol);
                              setAlertTargetPrice(
                                Number((asset.price * 1.05).toFixed(asset.price > 1 ? 2 : 5))
                              );
                            }}
                            className="px-2 py-0.5 bg-[#1a1f2b] hover:bg-amber-600/30 text-amber-400 border border-[#2b3345] rounded text-[10px]"
                            title="Set Alert on this asset"
                          >
                            + Alert
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Add Asset Section */}
          <div className="mt-4 pt-3 border-t border-[#1f2430]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Add Instruments to Watchlist
            </span>
            <div className="relative mb-2">
              <Search size={12} className="absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symbol (e.g. SOL, EUR, ETH)..."
                className="w-full bg-[#141720] border border-[#232938] rounded pl-7 pr-3 py-1.5 text-xs font-mono text-slate-200 outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto no-scrollbar">
              {availableToAdd.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => alertsEngine.toggleWatchlist(asset.symbol)}
                  className="px-2 py-1 bg-[#161a23] hover:bg-[#1e2330] border border-[#252b3a] rounded text-[10px] font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={10} className="text-amber-400" />
                  <span>{asset.symbol}</span>
                  <span className="text-slate-500">
                    (${asset.price >= 1 ? asset.price.toFixed(2) : asset.price.toFixed(4)})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </TerminalCard>
      </div>

      {/* Right Column: Price Alerts & Notifications */}
      <div className="lg:col-span-5 flex flex-col gap-3">
        {/* Create Alert Panel */}
        <TerminalCard
          title="Create Price Alert"
          subtitle="Real-time Threshold Monitoring"
          icon={<Bell size={14} className="text-amber-500" />}
        >
          <form onSubmit={handleCreateAlert} className="flex flex-col gap-3 text-xs font-mono">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Asset
                </label>
                <select
                  value={alertSymbol}
                  onChange={(e) => {
                    setAlertSymbol(e.target.value);
                    const a = marketDataService.getAsset(e.target.value);
                    if (a && a.price > 0) {
                      setAlertTargetPrice(Number((a.price * 1.05).toFixed(a.price > 1 ? 2 : 5)));
                    }
                  }}
                  className="w-full bg-[#161a22] border border-[#252c3b] rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-amber-500"
                >
                  {marketDataService.DEFAULT_ASSETS.map((a) => (
                    <option key={a.symbol} value={a.symbol}>
                      {a.symbol}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Trigger Condition
                </label>
                <select
                  value={alertDirection}
                  onChange={(e) => setAlertDirection(e.target.value as "ABOVE" | "BELOW")}
                  className="w-full bg-[#161a22] border border-[#252c3b] rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-amber-500"
                >
                  <option value="ABOVE">Price Rises Above &gt;=</option>
                  <option value="BELOW">Price Drops Below &lt;=</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Target Threshold Price ($)
              </label>
              <input
                type="number"
                value={alertTargetPrice}
                onChange={(e) => setAlertTargetPrice(Number(e.target.value))}
                step="any"
                className="w-full bg-[#161a22] border border-[#252c3b] rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Note (Optional)
              </label>
              <input
                type="text"
                value={alertNote}
                onChange={(e) => setAlertNote(e.target.value)}
                placeholder="e.g. Resistance breakout, take partials..."
                className="w-full bg-[#161a22] border border-[#252c3b] rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-wider rounded transition-colors"
            >
              Arm Price Alert
            </button>

            {alertSuccess && (
              <div className="p-2 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 size={12} />
                <span>Alert configured and active. Listening to live ticks.</span>
              </div>
            )}
          </form>
        </TerminalCard>

        {/* Active Alerts List */}
        <TerminalCard
          title="Configured Price Alerts"
          subtitle={`${alerts.length} total monitored`}
          className="flex-1 min-h-[220px]"
        >
          <div className="flex flex-col gap-2 font-mono text-xs overflow-y-auto no-scrollbar">
            {alerts.length === 0 ? (
              <span className="text-slate-500 text-center py-6 text-[11px]">
                No active threshold alerts. Configure one above to receive instant price notifications.
              </span>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-2.5 rounded border flex items-center justify-between ${
                    alert.isTriggered
                      ? "bg-amber-950/20 border-amber-800/40"
                      : "bg-[#141720] border-[#222837]"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{alert.symbol}</span>
                      <TerminalBadge variant={alert.isTriggered ? "gold" : "slate"}>
                        {alert.isTriggered ? "TRIGGERED" : alert.direction}
                      </TerminalBadge>
                    </div>
                    <span className="text-[11px] text-amber-400 font-bold">
                      Target: ${alert.targetPrice.toLocaleString()}
                    </span>
                    {alert.note && <span className="text-[10px] text-slate-400">{alert.note}</span>}
                  </div>

                  <button
                    onClick={() => alertsEngine.removeAlert(alert.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                    title="Delete alert"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </TerminalCard>

        {/* Triggered Alerts Ledger */}
        <TerminalCard
          title="Alert History & Dismissal"
          subtitle={`${notifications.length} triggered event${notifications.length === 1 ? "" : "s"}`}
          className="flex-1 min-h-[160px]"
          action={
            notifications.length > 0 ? (
              <button
                onClick={() => alertsEngine.clearNotifications()}
                className="text-[10px] text-slate-400 hover:text-red-400 font-mono transition-colors"
              >
                Clear all
              </button>
            ) : undefined
          }
        >
          <div className="flex flex-col gap-1.5 font-mono text-xs overflow-y-auto no-scrollbar max-h-[180px]">
            {notifications.length === 0 ? (
              <span className="text-slate-500 text-center py-4 text-[11px]">
                No triggered alerts in history.
              </span>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-2 bg-amber-950/20 border border-amber-800/40 rounded flex items-center justify-between text-[11px]"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-amber-300">{notif.symbol}</span>
                    <span className="text-slate-300 text-[10px]">{notif.message}</span>
                    <span className="text-[9px] text-slate-500">
                      {new Date(notif.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <button
                    onClick={() => alertsEngine.dismissNotification(notif.id)}
                    className="p-1 text-slate-500 hover:text-slate-300"
                    title="Dismiss"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </TerminalCard>
      </div>
    </div>
  );
}
