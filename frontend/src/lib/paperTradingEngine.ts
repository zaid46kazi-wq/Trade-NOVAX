/**
 * Trade-NOVAX Institutional Paper Trading Engine
 * 
 * Safe client-side virtual execution environment with strict double-entry
 * accounting, realized/unrealized P&L, automated SL/TP execution, drawdown tracking,
 * and zero real order execution.
 */

export interface VirtualPosition {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  entryPrice: number;
  currentPrice: number;
  units: number;
  marginLocked: number;
  stopLoss?: number;
  takeProfit?: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  openedAt: number;
}

export interface VirtualTrade {
  id: string;
  symbol: string;
  side: "LONG" | "SHORT";
  entryPrice: number;
  exitPrice: number;
  units: number;
  realizedPnL: number;
  feePaid: number;
  openedAt: number;
  closedAt: number;
  exitReason: "MANUAL" | "TAKE_PROFIT" | "STOP_LOSS";
}

export interface EquityPoint {
  timestamp: number;
  equity: number;
}

export interface PaperAccount {
  initialBalance: number;
  cashBalance: number;
  marginLocked: number;
  totalEquity: number;
  peakEquity: number;
  maxDrawdown: number;
  realizedPnL: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  profitFactor: number;
  openPositions: VirtualPosition[];
  tradeHistory: VirtualTrade[];
  equityHistory: EquityPoint[];
}

const STORAGE_KEY = "tradenovax_paper_account_v2";
const FEE_RATE = 0.0005; // 0.05% per execution

export class PaperTradingEngine {
  private static instance: PaperTradingEngine;
  private account: PaperAccount;
  private listeners: Set<(account: PaperAccount) => void> = new Set();

  private constructor() {
    this.account = this.loadState();
  }

  public static getInstance(): PaperTradingEngine {
    if (!PaperTradingEngine.instance) {
      PaperTradingEngine.instance = new PaperTradingEngine();
    }
    return PaperTradingEngine.instance;
  }

  private getDefaultAccount(initial = 100000): PaperAccount {
    return {
      initialBalance: initial,
      cashBalance: initial,
      marginLocked: 0,
      totalEquity: initial,
      peakEquity: initial,
      maxDrawdown: 0,
      realizedPnL: 0,
      winCount: 0,
      lossCount: 0,
      winRate: 0,
      profitFactor: 0,
      openPositions: [],
      tradeHistory: [],
      equityHistory: [{ timestamp: Date.now(), equity: initial }],
    };
  }

  private loadState(): PaperAccount {
    if (typeof window === "undefined") return this.getDefaultAccount();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.warn("Failed to read paper trading storage:", err);
    }
    return this.getDefaultAccount();
  }

  private saveState() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.account));
      this.notifyListeners();
    } catch (err) {
      console.warn("Failed to save paper trading storage:", err);
    }
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb({ ...this.account }));
  }

  public subscribe(callback: (account: PaperAccount) => void): () => void {
    this.listeners.add(callback);
    callback({ ...this.account });
    return () => this.listeners.delete(callback);
  }

  public getAccount(): PaperAccount {
    return { ...this.account };
  }

  // ──────────────────────────────────────────────────────────
  // ORDER EXECUTION
  // ──────────────────────────────────────────────────────────
  public openOrder(
    symbol: string,
    side: "LONG" | "SHORT",
    units: number,
    price: number,
    stopLoss?: number,
    takeProfit?: number
  ): { success: boolean; message: string } {
    if (units <= 0 || price <= 0) {
      return { success: false, message: "Invalid quantity or execution price." };
    }

    const notional = units * price;
    const fee = notional * FEE_RATE;
    const totalCost = notional + fee;

    if (totalCost > this.account.cashBalance) {
      return {
        success: false,
        message: `Insufficient simulated funds. Required: $${totalCost.toFixed(2)}, Available: $${this.account.cashBalance.toFixed(2)}`,
      };
    }

    // Deduct cash and lock margin
    this.account.cashBalance -= totalCost;
    this.account.marginLocked += notional;

    const newPosition: VirtualPosition = {
      id: "pos_" + Math.random().toString(36).substring(2, 9),
      symbol,
      side,
      entryPrice: price,
      currentPrice: price,
      units,
      marginLocked: notional,
      stopLoss,
      takeProfit,
      unrealizedPnL: -fee, // Initially negative by the fee paid
      unrealizedPnLPercent: ((-fee) / notional) * 100,
      openedAt: Date.now(),
    };

    this.account.openPositions.push(newPosition);
    this.recalculateEquity();
    this.saveState();

    return { success: true, message: `Opened ${side} on ${symbol} (${units} units @ $${price.toFixed(2)})` };
  }

  public closePosition(
    positionId: string,
    exitPrice: number,
    reason: "MANUAL" | "TAKE_PROFIT" | "STOP_LOSS" = "MANUAL"
  ): { success: boolean; message: string } {
    const posIndex = this.account.openPositions.findIndex((p) => p.id === positionId);
    if (posIndex === -1) {
      return { success: false, message: "Position not found." };
    }

    const pos = this.account.openPositions[posIndex];
    const notionalExit = pos.units * exitPrice;
    const exitFee = notionalExit * FEE_RATE;

    const grossPnL =
      pos.side === "LONG"
        ? (exitPrice - pos.entryPrice) * pos.units
        : (pos.entryPrice - exitPrice) * pos.units;

    const netPnL = grossPnL - exitFee;

    // Return locked margin plus net PnL
    this.account.cashBalance += pos.marginLocked + netPnL;
    this.account.marginLocked -= pos.marginLocked;
    this.account.realizedPnL += netPnL;

    // Record trade
    const trade: VirtualTrade = {
      id: "tr_" + Math.random().toString(36).substring(2, 9),
      symbol: pos.symbol,
      side: pos.side,
      entryPrice: pos.entryPrice,
      exitPrice,
      units: pos.units,
      realizedPnL: Number(netPnL.toFixed(2)),
      feePaid: Number(exitFee.toFixed(2)),
      openedAt: pos.openedAt,
      closedAt: Date.now(),
      exitReason: reason,
    };

    this.account.tradeHistory.unshift(trade);
    this.account.openPositions.splice(posIndex, 1);

    // Update Win/Loss statistics
    if (netPnL > 0) {
      this.account.winCount++;
    } else {
      this.account.lossCount++;
    }

    const totalClosed = this.account.winCount + this.account.lossCount;
    this.account.winRate = totalClosed > 0 ? (this.account.winCount / totalClosed) * 100 : 0;

    let totalGains = 0;
    let totalLosses = 0;
    this.account.tradeHistory.forEach((t) => {
      if (t.realizedPnL > 0) totalGains += t.realizedPnL;
      else totalLosses += Math.abs(t.realizedPnL);
    });
    this.account.profitFactor = totalLosses > 0 ? totalGains / totalLosses : totalGains > 0 ? totalGains : 0;

    this.recalculateEquity();
    this.saveState();

    return {
      success: true,
      message: `Closed position on ${pos.symbol} for ${netPnL >= 0 ? "+" : ""}$${netPnL.toFixed(2)} (${reason})`,
    };
  }

  // ──────────────────────────────────────────────────────────
  // LIVE PRICE RECALCULATION & AUTO SL/TP TRIGGER
  // ──────────────────────────────────────────────────────────
  public updatePrices(priceMap: Record<string, number>) {
    let changed = false;
    const positionsToClose: { id: string; price: number; reason: "TAKE_PROFIT" | "STOP_LOSS" }[] = [];

    this.account.openPositions.forEach((pos) => {
      const price = priceMap[pos.symbol];
      if (price && price !== pos.currentPrice) {
        pos.currentPrice = price;
        const grossPnL =
          pos.side === "LONG"
            ? (price - pos.entryPrice) * pos.units
            : (pos.entryPrice - price) * pos.units;

        pos.unrealizedPnL = grossPnL;
        pos.unrealizedPnLPercent = (grossPnL / pos.marginLocked) * 100;
        changed = true;

        // Auto Stop-Loss Check
        if (pos.stopLoss) {
          if (pos.side === "LONG" && price <= pos.stopLoss) {
            positionsToClose.push({ id: pos.id, price: pos.stopLoss, reason: "STOP_LOSS" });
          } else if (pos.side === "SHORT" && price >= pos.stopLoss) {
            positionsToClose.push({ id: pos.id, price: pos.stopLoss, reason: "STOP_LOSS" });
          }
        }

        // Auto Take-Profit Check
        if (pos.takeProfit) {
          if (pos.side === "LONG" && price >= pos.takeProfit) {
            positionsToClose.push({ id: pos.id, price: pos.takeProfit, reason: "TAKE_PROFIT" });
          } else if (pos.side === "SHORT" && price <= pos.takeProfit) {
            positionsToClose.push({ id: pos.id, price: pos.takeProfit, reason: "TAKE_PROFIT" });
          }
        }
      }
    });

    // Close any triggered SL/TP
    positionsToClose.forEach((item) => {
      this.closePosition(item.id, item.price, item.reason);
    });

    if (changed && positionsToClose.length === 0) {
      this.recalculateEquity();
      this.saveState();
    }
  }

  private recalculateEquity() {
    let totalUnrealized = 0;
    this.account.openPositions.forEach((p) => {
      totalUnrealized += p.unrealizedPnL;
    });

    this.account.totalEquity = this.account.cashBalance + this.account.marginLocked + totalUnrealized;

    // Peak equity & max drawdown
    if (this.account.totalEquity > this.account.peakEquity) {
      this.account.peakEquity = this.account.totalEquity;
    }

    const currentDrawdown =
      this.account.peakEquity > 0
        ? ((this.account.peakEquity - this.account.totalEquity) / this.account.peakEquity) * 100
        : 0;

    if (currentDrawdown > this.account.maxDrawdown) {
      this.account.maxDrawdown = currentDrawdown;
    }

    // Append to equity history if 1 minute elapsed since last record
    const lastPoint = this.account.equityHistory[this.account.equityHistory.length - 1];
    const now = Date.now();
    if (!lastPoint || now - lastPoint.timestamp > 60000) {
      this.account.equityHistory.push({ timestamp: now, equity: Number(this.account.totalEquity.toFixed(2)) });
      if (this.account.equityHistory.length > 100) this.account.equityHistory.shift();
    }
  }

  public resetAccount(initialBalance = 100000) {
    this.account = this.getDefaultAccount(initialBalance);
    this.saveState();
  }
}

export const paperTradingEngine = PaperTradingEngine.getInstance();
