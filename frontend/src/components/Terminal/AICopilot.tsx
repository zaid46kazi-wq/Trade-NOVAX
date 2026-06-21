"use client";

import { MessageSquare, Send, Bot, X, Sparkles, Zap, Trash2, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "ai";
  text: string;
  timestamp: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Simple markdown-like renderer for bold, bullets, and line breaks
function renderFormattedText(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Process bold **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={j} className="text-white font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={j}>{part}</span>;
    });

    // Bullet points
    if (line.trim().startsWith("•") || line.trim().startsWith("-") || line.trim().match(/^\d+\./)) {
      return (
        <div key={i} className="flex gap-1.5 ml-1 mt-0.5">
          <span className="text-cyan-500 shrink-0 mt-0.5">
            {line.trim().match(/^\d+\./) ? line.trim().match(/^\d+\./)![0] : "•"}
          </span>
          <span>{line.trim().match(/^\d+\./) ? rendered.slice(0).join("").replace(/^\d+\.\s*/, "") : rendered}</span>
        </div>
      );
    }

    // Empty line = spacer
    if (line.trim() === "") {
      return <div key={i} className="h-1.5" />;
    }

    return <div key={i}>{rendered}</div>;
  });
}

// Typing indicator with bouncing dots
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl rounded-tl-none p-3 flex items-center gap-1.5">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <span className="text-[10px] text-slate-500 ml-1.5 uppercase tracking-wider">Jarvis is thinking...</span>
      </div>
    </div>
  );
}

export default function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "JARVIS Online. I have access to live market feeds for **BTCUSDT**, **ETHUSDT**, **EURUSD**, and **GBPUSD**.\n\nI can analyze charts, detect patterns, suggest trade setups with entry/SL/TP, and answer anything about the markets.\n\nWhat would you like to scan?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestedPrompts = [
    ["🔍 Analyze BTCUSDT", "Analyze BTCUSDT — give me the full breakdown with indicators, pattern, and trade setup."],
    ["⚡ Best trade setup", "What's the best swing trade setup right now across all active pairs?"],
    ["📊 Market overview", "Give me a quick market overview of all tracked pairs with key levels."],
    ["🛡️ Risk calculator", "How should I manage risk for a $10,000 account trading crypto?"],
    ["🧠 EURUSD analysis", "Analyze EURUSD — what's the macro outlook and technical setup?"],
    ["🐋 Whale activity", "Are there any signs of whale accumulation or distribution on BTCUSDT?"],
  ];

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Detect if user scrolled up
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 80);
  };

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", text: text.trim(), timestamp: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build conversation history for API
      const allMessages = [...messages, userMessage];
      const apiMessages = allMessages.map((m) => ({ role: m.role === "ai" ? "assistant" : "user", text: m.text }));

      // Detect active pair from the conversation
      const activePair = detectPairFromText(text);

      const response = await fetch(`${API_URL}/api/copilot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, activePair }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.reply || "I encountered an issue processing your request. Please try again.", timestamp: Date.now() },
      ]);
    } catch (err) {
      console.error("Copilot API error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "⚠️ Connection to TradeNova backend lost. Make sure the backend server is running on port 5000.\n\nTry restarting with `npm run dev` in the backend directory.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "ai",
        text: "Memory cleared. JARVIS re-initialized.\n\nWhat would you like to analyze?",
        timestamp: Date.now(),
      },
    ]);
  };

  // Simple pair detection from user text
  function detectPairFromText(text: string): string {
    const upper = text.toUpperCase();
    const pairs = ["BTCUSDT", "ETHUSDT", "EURUSD", "GBPUSD", "XAUUSD", "SOLUSDT"];
    for (const p of pairs) {
      if (upper.includes(p)) return p;
    }
    if (upper.includes("BTC") || upper.includes("BITCOIN")) return "BTCUSDT";
    if (upper.includes("ETH") || upper.includes("ETHEREUM")) return "ETHUSDT";
    if (upper.includes("EUR")) return "EURUSD";
    if (upper.includes("GBP") || upper.includes("POUND")) return "GBPUSD";
    if (upper.includes("GOLD") || upper.includes("XAU")) return "XAUUSD";
    return "";
  }

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-[400px] h-[560px] mb-4 glass-panel border border-cyan-500/30 rounded-2xl flex flex-col overflow-hidden shadow-[0_10px_60px_rgba(0,240,255,0.25)]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-cyan-950/80 p-4 border-b border-cyan-500/20 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                  <Bot className="text-cyan-400" size={16} />
                </div>
                <div>
                  <span className="text-white font-bold tracking-widest text-xs uppercase flex items-center gap-1.5">
                    Jarvis Copilot
                    <Sparkles size={10} className="text-cyan-400" />
                  </span>
                  <span className="text-[9px] text-cyan-500/70 tracking-wider uppercase block">
                    Gemini Neural Engine • Live
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={clearChat}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Clear chat history"
                >
                  <Trash2 size={13} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700/50 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar relative"
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex flex-col max-w-[88%]">
                    <div
                      className={`p-3 rounded-xl text-[13px] leading-relaxed ${
                        m.role === "user"
                          ? "bg-cyan-600/25 border border-cyan-500/40 text-white rounded-tr-none"
                          : "bg-slate-800/50 border border-slate-700/40 text-slate-200 rounded-tl-none"
                      }`}
                    >
                      {m.role === "ai" ? (
                        <div className="space-y-0.5">{renderFormattedText(m.text)}</div>
                      ) : (
                        m.text
                      )}
                    </div>
                    <span className={`text-[9px] text-slate-600 mt-1 ${m.role === "user" ? "text-right" : "text-left"}`}>
                      {formatTime(m.timestamp)}
                    </span>
                  </div>
                </motion.div>
              ))}

              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />

              {/* Scroll to bottom button */}
              <AnimatePresence>
                {showScrollBtn && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToBottom}
                    className="sticky bottom-2 self-center w-7 h-7 rounded-full bg-cyan-600/80 flex items-center justify-center shadow-lg border border-cyan-400/50"
                  >
                    <ChevronDown size={14} className="text-white" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Suggested Prompts */}
            {messages.length <= 2 && !isLoading && (
              <div className="px-3 py-2 bg-slate-900/40 border-t border-white/5 flex flex-wrap gap-1.5 shrink-0">
                {suggestedPrompts.slice(0, 4).map(([label, prompt], i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="text-[10px] bg-slate-800/80 hover:bg-cyan-900/40 text-slate-300 hover:text-cyan-300 px-2.5 py-1.5 rounded-lg border border-slate-700/50 hover:border-cyan-500/40 transition-all hover:shadow-[0_0_8px_rgba(0,240,255,0.15)]"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-slate-900/80 border-t border-white/10 shrink-0">
              <div className="relative flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                  placeholder={isLoading ? "Jarvis is analyzing..." : "Ask Jarvis anything about markets..."}
                  disabled={isLoading}
                  className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-xl pl-4 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:shadow-[0_0_12px_rgba(0,240,255,0.1)] transition-all disabled:opacity-50"
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 rounded-xl bg-cyan-600/30 hover:bg-cyan-500/40 border border-cyan-500/40 flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-cyan-600/30 hover:shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                >
                  <Send size={15} className="text-cyan-300" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 flex items-center justify-center shadow-[0_0_25px_rgba(0,240,255,0.4)] border border-cyan-400/50 transition-all hover:scale-110 group relative"
      >
        {isOpen ? (
          <X size={22} className="text-white" />
        ) : (
          <>
            <MessageSquare size={22} className="text-white" />
            <div className="absolute inset-0 rounded-full border border-cyan-300 animate-ping opacity-20 group-hover:opacity-50" />
            {/* Unread indicator */}
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          </>
        )}
      </button>
    </div>
  );
}
