/**
 * Trade-NOVAX Watchlist & Price Alerts Engine
 * 
 * Manages user-defined price threshold alerts, percentage change tracking,
 * alert dismissal, and local persistence.
 */

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  direction: "ABOVE" | "BELOW";
  note?: string;
  createdAt: number;
  triggeredAt?: number;
  isTriggered: boolean;
}

export interface AlertNotification {
  id: string;
  alertId: string;
  symbol: string;
  targetPrice: number;
  actualPrice: number;
  timestamp: number;
  message: string;
}

const STORAGE_KEY_ALERTS = "tradenovax_price_alerts_v1";
const STORAGE_KEY_WATCHLIST = "tradenovax_watchlist_v1";

export class AlertsEngine {
  private static instance: AlertsEngine;

  private alerts: PriceAlert[] = [];
  private watchlist: Set<string> = new Set(["BTCUSDT", "ETHUSDT", "SOLUSDT", "EURUSD", "GBPUSD"]);
  private notifications: AlertNotification[] = [];

  private alertListeners: Set<(alerts: PriceAlert[]) => void> = new Set();
  private watchlistListeners: Set<(symbols: string[]) => void> = new Set();
  private notificationListeners: Set<(notifications: AlertNotification[]) => void> = new Set();

  private constructor() {
    this.loadState();
  }

  public static getInstance(): AlertsEngine {
    if (!AlertsEngine.instance) {
      AlertsEngine.instance = new AlertsEngine();
    }
    return AlertsEngine.instance;
  }

  private loadState() {
    if (typeof window === "undefined") return;
    try {
      const savedAlerts = localStorage.getItem(STORAGE_KEY_ALERTS);
      if (savedAlerts) {
        this.alerts = JSON.parse(savedAlerts);
      }
      const savedWatchlist = localStorage.getItem(STORAGE_KEY_WATCHLIST);
      if (savedWatchlist) {
        this.watchlist = new Set(JSON.parse(savedWatchlist));
      }
    } catch (err) {
      console.warn("AlertsEngine failed to load local storage:", err);
    }
  }

  private saveState() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(this.alerts));
      localStorage.setItem(STORAGE_KEY_WATCHLIST, JSON.stringify(Array.from(this.watchlist)));
    } catch (err) {
      console.warn("AlertsEngine failed to save local storage:", err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // WATCHLIST METHODS
  // ──────────────────────────────────────────────────────────
  public toggleWatchlist(symbol: string): boolean {
    const isPresent = this.watchlist.has(symbol);
    if (isPresent) {
      this.watchlist.delete(symbol);
    } else {
      this.watchlist.add(symbol);
    }
    this.saveState();
    const list = Array.from(this.watchlist);
    this.watchlistListeners.forEach((cb) => cb(list));
    return !isPresent;
  }

  public isInWatchlist(symbol: string): boolean {
    return this.watchlist.has(symbol);
  }

  public getWatchlist(): string[] {
    return Array.from(this.watchlist);
  }

  public onWatchlistChange(callback: (symbols: string[]) => void): () => void {
    this.watchlistListeners.add(callback);
    callback(Array.from(this.watchlist));
    return () => this.watchlistListeners.delete(callback);
  }

  // ──────────────────────────────────────────────────────────
  // PRICE ALERTS METHODS
  // ──────────────────────────────────────────────────────────
  public addAlert(
    symbol: string,
    targetPrice: number,
    direction: "ABOVE" | "BELOW",
    note?: string
  ): PriceAlert {
    const alert: PriceAlert = {
      id: "alt_" + Math.random().toString(36).substring(2, 9),
      symbol,
      targetPrice,
      direction,
      note,
      createdAt: Date.now(),
      isTriggered: false,
    };
    this.alerts.unshift(alert);
    this.saveState();
    this.notifyAlerts();
    return alert;
  }

  public removeAlert(alertId: string) {
    this.alerts = this.alerts.filter((a) => a.id !== alertId);
    this.saveState();
    this.notifyAlerts();
  }

  public checkPrice(symbol: string, currentPrice: number) {
    let triggeredAny = false;

    this.alerts.forEach((alert) => {
      if (!alert.isTriggered && alert.symbol === symbol) {
        const isHit =
          (alert.direction === "ABOVE" && currentPrice >= alert.targetPrice) ||
          (alert.direction === "BELOW" && currentPrice <= alert.targetPrice);

        if (isHit) {
          alert.isTriggered = true;
          alert.triggeredAt = Date.now();
          triggeredAny = true;

          const notif: AlertNotification = {
            id: "notif_" + Math.random().toString(36).substring(2, 9),
            alertId: alert.id,
            symbol: alert.symbol,
            targetPrice: alert.targetPrice,
            actualPrice: currentPrice,
            timestamp: Date.now(),
            message: `${alert.symbol} crossed target $${alert.targetPrice} (${alert.direction === "ABOVE" ? "Rose above" : "Fell below"}). Current: $${currentPrice}`,
          };

          this.notifications.unshift(notif);
          this.playAlertSound();
        }
      }
    });

    if (triggeredAny) {
      this.saveState();
      this.notifyAlerts();
      this.notifyNotifications();
    }
  }

  private playAlertSound() {
    if (typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // Audio autoplay policy might suppress without gesture, safe to ignore
    }
  }

  public clearAllNotifications() {
    this.notifications = [];
    this.notifyNotifications();
  }

  private notifyAlerts() {
    const copy = [...this.alerts];
    this.alertListeners.forEach((cb) => cb(copy));
  }

  private notifyNotifications() {
    const copy = [...this.notifications];
    this.notificationListeners.forEach((cb) => cb(copy));
  }

  public onAlertsChange(callback: (alerts: PriceAlert[]) => void): () => void {
    this.alertListeners.add(callback);
    callback([...this.alerts]);
    return () => this.alertListeners.delete(callback);
  }

  public onNotificationsChange(callback: (notifications: AlertNotification[]) => void): () => void {
    this.notificationListeners.add(callback);
    callback([...this.notifications]);
    return () => this.notificationListeners.delete(callback);
  }

  public dismissNotification(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notifyNotifications();
  }

  public clearNotifications() {
    this.notifications = [];
    this.notifyNotifications();
  }
}

export const alertsEngine = AlertsEngine.getInstance();
