"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  HistogramData,
  CrosshairMode,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  HistogramSeries,
  Time,
} from "lightweight-charts";
import { marketDataService, CandleData } from "../../lib/marketDataService";
import { RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";

// Fallback / alternate full TradingView widget from existing project
const TVAdvancedWidget = dynamic(
  () => import("react-ts-tradingview-widgets").then((w) => w.AdvancedRealTimeChart),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#0d0f14] text-amber-500 font-mono text-xs">
        Loading TradingView Institutional Feed...
      </div>
    ),
  }
);

interface FinancialChartProps {
  symbol?: string;
  onPriceChange?: (price: number) => void;
}

type ChartType = "CANDLES" | "LINE" | "AREA" | "TV_WIDGET";
type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export default function FinancialChart({ symbol = "BTCUSDT", onPriceChange }: FinancialChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Series refs
  const mainSeriesRef = useRef<ISeriesApi<"Candlestick" | "Line" | "Area"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const [chartType, setChartType] = useState<ChartType>("CANDLES");
  const [timeframe, setTimeframe] = useState<Timeframe>("1h");
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [showEMA, setShowEMA] = useState<boolean>(true);
  const [showSMA, setShowSMA] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCandle, setLastCandle] = useState<CandleData | null>(null);

  // EMA calculation helper
  const calculateEMA = (candles: CandleData[], period = 20): LineData[] => {
    if (candles.length < period) return [];
    const k = 2 / (period + 1);
    let ema = candles.slice(0, period).reduce((acc, c) => acc + c.close, 0) / period;
    const result: LineData[] = [];

    for (let i = period - 1; i < candles.length; i++) {
      if (i === period - 1) {
        result.push({ time: candles[i].time as unknown as Time, value: ema });
      } else {
        ema = candles[i].close * k + ema * (1 - k);
        result.push({ time: candles[i].time as unknown as Time, value: ema });
      }
    }
    return result;
  };

  // SMA calculation helper
  const calculateSMA = (candles: CandleData[], period = 50): LineData[] => {
    if (candles.length < period) return [];
    const result: LineData[] = [];
    for (let i = period - 1; i < candles.length; i++) {
      const slice = candles.slice(i - period + 1, i + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      result.push({ time: candles[i].time as unknown as Time, value: sum / period });
    }
    return result;
  };

  const initAndLoadChart = useCallback(async () => {
    if (!containerRef.current || chartType === "TV_WIDGET") return;

    await Promise.resolve();
    setLoading(true);
    setError(null);

    // Dispose old chart instance safely
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    try {
      const container = containerRef.current;
      const chart = createChart(container, {
        width: container.clientWidth || 800,
        height: container.clientHeight || 480,
        layout: {
          background: { type: ColorType.Solid, color: "#0c0d10" },
          textColor: "#94a3b8",
          fontSize: 11,
          fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, monospace",
        },
        grid: {
          vertLines: { color: "#191c24" },
          horzLines: { color: "#191c24" },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: {
            color: "#cca043",
            width: 1,
            style: 3,
            labelBackgroundColor: "#242935",
          },
          horzLine: {
            color: "#cca043",
            width: 1,
            style: 3,
            labelBackgroundColor: "#242935",
          },
        },
        rightPriceScale: {
          borderColor: "#222734",
          scaleMargins: {
            top: 0.1,
            bottom: showVolume ? 0.25 : 0.1,
          },
        },
        timeScale: {
          borderColor: "#222734",
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartRef.current = chart;

      // 1. Fetch real historical candles
      const rawCandles = await marketDataService.fetchHistoricalCandles(symbol, timeframe, 150);
      if (!rawCandles || rawCandles.length === 0) {
        setError("No historical market data available for this symbol.");
        setLoading(false);
        return;
      }

      // Deduplicate and sort
      const candleMap = new Map<number, CandleData>();
      rawCandles.forEach((c) => candleMap.set(c.time, c));
      const sortedCandles = Array.from(candleMap.values()).sort((a, b) => a.time - b.time);

      const latest = sortedCandles[sortedCandles.length - 1];
      setLastCandle(latest);
      if (onPriceChange) onPriceChange(latest.close);

      // 2. Add Main Series based on selected chart type
      if (chartType === "CANDLES") {
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
          upColor: "#16a34a",
          downColor: "#dc2626",
          borderVisible: false,
          wickUpColor: "#16a34a",
          wickDownColor: "#dc2626",
        });
        const cData: CandlestickData[] = sortedCandles.map((c) => ({
          time: c.time as unknown as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));
        candlestickSeries.setData(cData);
        mainSeriesRef.current = candlestickSeries;
      } else if (chartType === "LINE") {
        const lineSeries = chart.addSeries(LineSeries, {
          color: "#d97706",
          lineWidth: 2,
        });
        const lData: LineData[] = sortedCandles.map((c) => ({
          time: c.time as unknown as Time,
          value: c.close,
        }));
        lineSeries.setData(lData);
        mainSeriesRef.current = lineSeries;
      } else if (chartType === "AREA") {
        const areaSeries = chart.addSeries(AreaSeries, {
          topColor: "rgba(217, 119, 6, 0.35)",
          bottomColor: "rgba(217, 119, 6, 0.0)",
          lineColor: "#f59e0b",
          lineWidth: 2,
        });
        const aData: LineData[] = sortedCandles.map((c) => ({
          time: c.time as unknown as Time,
          value: c.close,
        }));
        areaSeries.setData(aData);
        mainSeriesRef.current = areaSeries;
      }

      // 3. Add Volume Histogram (bottom overlay)
      if (showVolume) {
        const volumeSeries = chart.addSeries(HistogramSeries, {
          color: "#262c3b",
          priceFormat: { type: "volume" },
          priceScaleId: "",
        });
        volumeSeries.priceScale().applyOptions({
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        });
        const vData: HistogramData[] = sortedCandles.map((c) => ({
          time: c.time as unknown as Time,
          value: c.volume,
          color: c.close >= c.open ? "rgba(22, 163, 74, 0.35)" : "rgba(220, 38, 38, 0.35)",
        }));
        volumeSeries.setData(vData);
        volumeSeriesRef.current = volumeSeries;
      }

      // 4. Overlays: EMA(20) & SMA(50)
      if (showEMA) {
        const emaData = calculateEMA(sortedCandles, 20);
        if (emaData.length > 0) {
          const emaSeries = chart.addSeries(LineSeries, {
            color: "#38bdf8",
            lineWidth: 1,
            title: "EMA 20",
          });
          emaSeries.setData(emaData);
          emaSeriesRef.current = emaSeries;
        }
      }

      if (showSMA) {
        const smaData = calculateSMA(sortedCandles, 50);
        if (smaData.length > 0) {
          const smaSeries = chart.addSeries(LineSeries, {
            color: "#fbbf24",
            lineWidth: 1,
            title: "SMA 50",
          });
          smaSeries.setData(smaData);
          smaSeriesRef.current = smaSeries;
        }
      }

      // Fit content
      chart.timeScale().fitContent();
      setLoading(false);
    } catch (err: unknown) {
      console.error("Failed to render institutional chart:", err);
      setError(err instanceof Error ? err.message : "Chart initialization failed");
      setLoading(false);
    }
  }, [symbol, timeframe, chartType, showVolume, showEMA, showSMA, onPriceChange]);

  // Initial load & property updates
  useEffect(() => {
    const timer = setTimeout(() => {
      initAndLoadChart();
    }, 0);

    return () => {
      clearTimeout(timer);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [initAndLoadChart]);

  // Real-time chart update subscription
  useEffect(() => {
    if (chartType === "TV_WIDGET") return;

    const unsubscribe = marketDataService.subscribeChartStream(symbol, timeframe, (candle) => {
      if (!mainSeriesRef.current) return;

      try {
        if (chartType === "CANDLES") {
          mainSeriesRef.current.update({
            time: candle.time as unknown as Time,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
          });
        } else {
          mainSeriesRef.current.update({
            time: candle.time as unknown as Time,
            value: candle.close,
          });
        }

        if (volumeSeriesRef.current && showVolume) {
          volumeSeriesRef.current.update({
            time: candle.time as unknown as Time,
            value: candle.volume,
            color: candle.close >= candle.open ? "rgba(22, 163, 74, 0.35)" : "rgba(220, 38, 38, 0.35)",
          });
        }

        setLastCandle(candle);
        if (onPriceChange) onPriceChange(candle.close);
      } catch (err) {
        console.warn("Chart tick update issue:", err);
      }
    });

    return () => unsubscribe();
  }, [symbol, timeframe, chartType, showVolume, onPriceChange]);

  // Auto-resize on window / panel size change
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !chartRef.current) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        chartRef.current.applyOptions({ width, height });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="terminal-panel h-full flex flex-col relative overflow-hidden bg-[#0c0d10]">
      {/* Chart Control Bar */}
      <div className="terminal-header flex flex-wrap items-center justify-between gap-2 text-xs border-b border-[#1f232e] bg-[#12141a] px-3 py-1.5 select-none shrink-0">
        <div className="flex items-center gap-2">
          {/* Symbol & Price */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-sm text-slate-100 font-mono tracking-wider">{symbol}</span>
            {lastCandle && (
              <span className="text-amber-400 font-mono text-xs font-semibold">
                ${lastCandle.close >= 1 ? lastCandle.close.toFixed(2) : lastCandle.close.toFixed(5)}
              </span>
            )}
          </div>

          {/* Timeframe selector */}
          {chartType !== "TV_WIDGET" && (
            <div className="flex items-center gap-1 bg-[#181c25] p-0.5 rounded border border-[#262c3b] ml-2">
              {(["1m", "5m", "15m", "1h", "4h", "1d"] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-1.5 py-0.5 text-[10px] font-mono uppercase rounded transition-colors ${
                    timeframe === tf ? "bg-amber-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chart View Modes & Indicators Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#181c25] p-0.5 rounded border border-[#262c3b]">
            <button
              onClick={() => setChartType("CANDLES")}
              className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                chartType === "CANDLES" ? "bg-[#272d3b] text-amber-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Candles
            </button>
            <button
              onClick={() => setChartType("LINE")}
              className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                chartType === "LINE" ? "bg-[#272d3b] text-amber-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType("AREA")}
              className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                chartType === "AREA" ? "bg-[#272d3b] text-amber-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType("TV_WIDGET")}
              className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                chartType === "TV_WIDGET" ? "bg-amber-700 text-white" : "text-slate-400 hover:text-amber-300"
              }`}
              title="Switch to full TradingView Advanced Widget"
            >
              TV Suite
            </button>
          </div>

          {chartType !== "TV_WIDGET" && (
            <div className="hidden md:flex items-center gap-1.5 border-l border-[#262c3b] pl-2">
              <button
                onClick={() => setShowEMA(!showEMA)}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  showEMA ? "bg-sky-950/40 border-sky-600/40 text-sky-400" : "border-[#262c3b] text-slate-500"
                }`}
              >
                EMA 20
              </button>
              <button
                onClick={() => setShowSMA(!showSMA)}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  showSMA ? "bg-amber-950/40 border-amber-600/40 text-amber-400" : "border-[#262c3b] text-slate-500"
                }`}
              >
                SMA 50
              </button>
              <button
                onClick={() => setShowVolume(!showVolume)}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  showVolume ? "bg-emerald-950/40 border-emerald-600/40 text-emerald-400" : "border-[#262c3b] text-slate-500"
                }`}
              >
                VOL
              </button>
              <button
                onClick={initAndLoadChart}
                className="text-slate-400 hover:text-slate-200 p-1 transition-colors"
                title="Refresh Real Market Data"
              >
                <RefreshCw size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="flex-1 w-full min-h-[360px] relative bg-[#0c0d10]">
        {chartType === "TV_WIDGET" ? (
          <div className="w-full h-full">
            <TVAdvancedWidget
              key={symbol}
              symbol={symbol.includes("USDT") ? `BINANCE:${symbol}` : `FX_IDC:${symbol}`}
              theme="dark"
              autosize
              interval="60"
              timezone="Etc/UTC"
              style="1"
              locale="en"
              enable_publishing={false}
              hide_side_toolbar={false}
              allow_symbol_change={true}
              container_id="tv_chart_main"
            />
          </div>
        ) : (
          <>
            <div ref={containerRef} className="w-full h-full" />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0c0d10]/80 z-10">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-500">
                  <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  Connecting to Binance Market Data Stream...
                </div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0c0d10]/90 z-10 p-4 text-center">
                <span className="text-red-400 text-xs font-mono mb-2">{error}</span>
                <button
                  onClick={initAndLoadChart}
                  className="px-3 py-1 bg-[#1c212c] border border-[#2b3344] text-xs font-mono text-slate-200 rounded hover:bg-[#252c3b]"
                >
                  Retry Market Connection
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
