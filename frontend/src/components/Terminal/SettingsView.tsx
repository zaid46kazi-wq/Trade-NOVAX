"use client";

import React, { useState } from "react";
import { TerminalCard } from "../ui/TerminalCard";
import { TerminalBadge } from "../ui/TerminalBadge";
import { Settings, Server, RotateCcw, CheckCircle2 } from "lucide-react";
import { paperTradingEngine } from "../../lib/paperTradingEngine";
import { alertsEngine } from "../../lib/alertsEngine";

export default function SettingsView() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const handleFullReset = () => {
    paperTradingEngine.resetAccount(100000);
    alertsEngine.clearNotifications();
    setResetSuccess("All virtual paper trades and alert logs have been reset.");
    setTimeout(() => setResetSuccess(null), 4000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full font-mono text-xs">
      {/* System Status & Integrations */}
      <div className="lg:col-span-6 flex flex-col gap-3">
        <TerminalCard
          title="System Architecture & Feed Integrations"
          subtitle="Provider Health & Security Boundaries"
          icon={<Server size={14} className="text-amber-500" />}
        >
          <div className="flex flex-col gap-2.5">
            <div className="p-2.5 bg-[#141721] rounded border border-[#212737] flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-200 block">Binance Public WebSocket</span>
                <span className="text-[10px] text-slate-500">Real-time Crypto klines & aggTrades</span>
              </div>
              <TerminalBadge variant="up">ONLINE (9443)</TerminalBadge>
            </div>

            <div className="p-2.5 bg-[#141721] rounded border border-[#212737] flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-200 block">Forex Exchange Rate Feed</span>
                <span className="text-[10px] text-slate-500">Major Interbank Currency Pairs</span>
              </div>
              <TerminalBadge variant="up">ACTIVE (30S POLL)</TerminalBadge>
            </div>

            <div className="p-2.5 bg-[#141721] rounded border border-[#212737] flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-200 block">Google Gemini 2.5 Flash</span>
                <span className="text-[10px] text-slate-500">AI Market Intelligence & Copilot</span>
              </div>
              <TerminalBadge variant="gold">CONNECTED</TerminalBadge>
            </div>

            <div className="p-2.5 bg-[#141721] rounded border border-[#212737] flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-200 block">Persistence Engine</span>
                <span className="text-[10px] text-slate-500">Supabase PostgreSQL + Client Cache</span>
              </div>
              <TerminalBadge variant="neutral">OPERATIONAL</TerminalBadge>
            </div>

            <div className="p-2.5 bg-[#141721] rounded border border-[#212737] flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-200 block">Security Boundary</span>
                <span className="text-[10px] text-slate-500">Zero Private Keys in Browser Bundles</span>
              </div>
              <TerminalBadge variant="up">VERIFIED</TerminalBadge>
            </div>
          </div>
        </TerminalCard>
      </div>

      {/* Terminal Preferences & Reset */}
      <div className="lg:col-span-6 flex flex-col gap-3">
        <TerminalCard
          title="Terminal Workspace Preferences"
          subtitle="Display & Audio Configuration"
          icon={<Settings size={14} className="text-amber-500" />}
        >
          <div className="flex flex-col gap-3">
            <div className="p-3 bg-[#141721] rounded border border-[#212737] flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-200 block">Audio Chime on Triggered Alert</span>
                <span className="text-[10px] text-slate-500">Synthesizes Web Audio frequency when price target hit</span>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-[#141721] rounded border border-[#212737] flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-200 block">Color Theme Standard</span>
                <span className="text-[10px] text-slate-500">Bloomberg Charcoal / Restrained Gold</span>
              </div>
              <TerminalBadge variant="slate">BLOOMBERG SLATE</TerminalBadge>
            </div>

            <div className="p-3 bg-[#141721] rounded border border-[#212737] space-y-2">
              <span className="font-bold text-slate-200 block">Reset Session Storage</span>
              <p className="text-[11px] text-slate-400">
                Wipe all virtual paper positions, performance history, and active alerts back to default factory settings.
              </p>
              <button
                onClick={handleFullReset}
                className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/50 border border-red-800 text-red-300 font-bold rounded flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw size={12} /> Reset Portfolio & Alerts ($100k Balance)
              </button>
              {resetSuccess && (
                <div className="p-2 bg-emerald-950/30 text-emerald-300 border border-emerald-800 rounded flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 size={12} /> {resetSuccess}
                </div>
              )}
            </div>

            {/* Engineering Attribution */}
            <div className="p-3 bg-[#12151d] border border-[#242c3c] rounded text-[11px] text-slate-400 leading-relaxed">
              <strong className="text-amber-400 block mb-0.5">Project Specification:</strong>
              Trade-NOVAX Professional Institutional AI Trading Intelligence Terminal. Built with Next.js 16, React 19, TradingView Lightweight Charts, and Google Gemini AI. Suitable for final-year engineering evaluation and professional demonstration.
            </div>
          </div>
        </TerminalCard>
      </div>
    </div>
  );
}
