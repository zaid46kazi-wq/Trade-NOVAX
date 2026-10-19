/**
 * Trade-NOVAX Institutional Risk Calculator & Position Sizing Engine
 * 
 * Mathematical calculations for position sizing, monetary risk budget,
 * stop-loss distance, risk/reward ratio, and net expected results.
 */

export interface RiskInput {
  accountEquity: number;
  riskPercent: number; // e.g., 1.5 for 1.5%
  positionSide: "LONG" | "SHORT";
  entryPrice: number;
  stopLossPrice: number;
  targetPrice: number;
  feePercent?: number; // e.g. 0.05 for 0.05% taker fee
  slippagePercent?: number; // e.g. 0.02 for 0.02%
}

export interface RiskCalculationResult {
  isValid: boolean;
  errorMessage?: string;
  
  // Monetary Risk & Sizing
  monetaryRisk: number; // $ at risk
  stopLossDistance: number; // $ price distance
  stopLossPercent: number; // % move to stop loss
  positionSizeUnits: number; // quantity in base asset (e.g. BTC)
  notionalPositionValue: number; // total dollar value of position

  // Gain & R:R
  takeProfitDistance: number; // $ price distance
  takeProfitPercent: number; // % move to target
  grossGain: number; // gross dollar gain if target reached
  grossLoss: number; // gross dollar loss if stopped out
  
  // Costs & Net
  estimatedFees: number; // round-trip estimated fees + slippage
  netGain: number; // grossGain - estimatedFees
  netLoss: number; // monetaryRisk + estimatedFees
  riskRewardRatio: number; // e.g. 2.5 means 1:2.5
  formattedRiskReward: string; // "1 : 2.50"
}

export function calculateRisk(input: RiskInput): RiskCalculationResult {
  const {
    accountEquity,
    riskPercent,
    positionSide,
    entryPrice,
    stopLossPrice,
    targetPrice,
    feePercent = 0.075, // standard exchange rate 0.075%
    slippagePercent = 0.02,
  } = input;

  const failure = (msg: string): RiskCalculationResult => ({
    isValid: false,
    errorMessage: msg,
    monetaryRisk: 0,
    stopLossDistance: 0,
    stopLossPercent: 0,
    positionSizeUnits: 0,
    notionalPositionValue: 0,
    takeProfitDistance: 0,
    takeProfitPercent: 0,
    grossGain: 0,
    grossLoss: 0,
    estimatedFees: 0,
    netGain: 0,
    netLoss: 0,
    riskRewardRatio: 0,
    formattedRiskReward: "1 : 0.00",
  });

  // Validation
  if (!Number.isFinite(accountEquity) || accountEquity <= 0) {
    return failure("Account equity must be a positive number.");
  }
  if (!Number.isFinite(riskPercent) || riskPercent <= 0 || riskPercent > 100) {
    return failure("Risk percentage must be between 0.1% and 100%.");
  }
  if (!Number.isFinite(entryPrice) || entryPrice <= 0) {
    return failure("Entry price must be greater than zero.");
  }
  if (!Number.isFinite(stopLossPrice) || stopLossPrice <= 0) {
    return failure("Stop-loss price must be greater than zero.");
  }
  if (!Number.isFinite(targetPrice) || targetPrice <= 0) {
    return failure("Target price must be greater than zero.");
  }

  // Directional sanity check
  if (positionSide === "LONG") {
    if (stopLossPrice >= entryPrice) {
      return failure("For LONG positions, Stop-Loss must be strictly below Entry price.");
    }
    if (targetPrice <= entryPrice) {
      return failure("For LONG positions, Target price must be strictly above Entry price.");
    }
  } else {
    // SHORT
    if (stopLossPrice <= entryPrice) {
      return failure("For SHORT positions, Stop-Loss must be strictly above Entry price.");
    }
    if (targetPrice >= entryPrice) {
      return failure("For SHORT positions, Target price must be strictly below Entry price.");
    }
  }

  // Core Math
  const monetaryRisk = accountEquity * (riskPercent / 100);
  const stopLossDistance = Math.abs(entryPrice - stopLossPrice);

  if (stopLossDistance === 0) {
    return failure("Stop-loss distance cannot be zero.");
  }

  const stopLossPercent = (stopLossDistance / entryPrice) * 100;
  const positionSizeUnits = monetaryRisk / stopLossDistance;
  const notionalPositionValue = positionSizeUnits * entryPrice;

  const takeProfitDistance = Math.abs(targetPrice - entryPrice);
  const takeProfitPercent = (takeProfitDistance / entryPrice) * 100;

  const grossGain = positionSizeUnits * takeProfitDistance;
  const grossLoss = monetaryRisk;

  // Round trip fees (entry + exit on notional) + slippage
  const totalCostRate = ((feePercent * 2) + slippagePercent) / 100;
  const estimatedFees = notionalPositionValue * totalCostRate;

  const netGain = Math.max(0, grossGain - estimatedFees);
  const netLoss = grossLoss + estimatedFees;

  const riskRewardRatio = stopLossDistance > 0 ? takeProfitDistance / stopLossDistance : 0;
  const formattedRiskReward = `1 : ${riskRewardRatio.toFixed(2)}`;

  return {
    isValid: true,
    monetaryRisk: Number(monetaryRisk.toFixed(2)),
    stopLossDistance: Number(stopLossDistance.toFixed(4)),
    stopLossPercent: Number(stopLossPercent.toFixed(2)),
    positionSizeUnits: Number(positionSizeUnits.toFixed(6)),
    notionalPositionValue: Number(notionalPositionValue.toFixed(2)),
    takeProfitDistance: Number(takeProfitDistance.toFixed(4)),
    takeProfitPercent: Number(takeProfitPercent.toFixed(2)),
    grossGain: Number(grossGain.toFixed(2)),
    grossLoss: Number(grossLoss.toFixed(2)),
    estimatedFees: Number(estimatedFees.toFixed(2)),
    netGain: Number(netGain.toFixed(2)),
    netLoss: Number(netLoss.toFixed(2)),
    riskRewardRatio: Number(riskRewardRatio.toFixed(2)),
    formattedRiskReward,
  };
}
