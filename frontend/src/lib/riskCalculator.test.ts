/**
 * Unit tests for Risk Calculator
 * Run via ts-node or node
 */
import { calculateRisk, RiskInput } from "./riskCalculator";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runRiskCalculatorTests(): { passed: number; failed: number; errors: string[] } {
  const errors: string[] = [];
  let passed = 0;

  // Test 1: Standard LONG Trade
  try {
    const input: RiskInput = {
      accountEquity: 10000,
      riskPercent: 1.0, // $100 risk
      positionSide: "LONG",
      entryPrice: 65000,
      stopLossPrice: 64000, // $1000 distance
      targetPrice: 68000, // $3000 distance -> 1:3 R:R
    };

    const res = calculateRisk(input);
    assert(res.isValid, "Result should be valid");
    assert(res.monetaryRisk === 100, `Monetary risk should be 100, got ${res.monetaryRisk}`);
    assert(res.stopLossDistance === 1000, `SL distance should be 1000, got ${res.stopLossDistance}`);
    assert(res.positionSizeUnits === 0.1, `Units should be 0.1 BTC, got ${res.positionSizeUnits}`);
    assert(res.notionalPositionValue === 6500, `Notional value should be 6500, got ${res.notionalPositionValue}`);
    assert(res.grossGain === 300, `Gross gain should be 300, got ${res.grossGain}`);
    assert(res.riskRewardRatio === 3, `R:R should be 3, got ${res.riskRewardRatio}`);
    assert(res.formattedRiskReward === "1 : 3.00", `Formatted R:R should be 1 : 3.00, got ${res.formattedRiskReward}`);
    passed++;
  } catch (err: unknown) {
    errors.push(`Test Failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Test 2: Standard SHORT Trade
  try {
    const input: RiskInput = {
      accountEquity: 25000,
      riskPercent: 2.0, // $500 risk
      positionSide: "SHORT",
      entryPrice: 1.1000,
      stopLossPrice: 1.1050, // 0.0050 distance
      targetPrice: 1.0850, // 0.0150 distance -> 1:3 R:R
    };

    const res = calculateRisk(input);
    assert(res.isValid, "Result should be valid");
    assert(res.monetaryRisk === 500, `Monetary risk should be 500, got ${res.monetaryRisk}`);
    assert(res.stopLossDistance === 0.005, `SL distance should be 0.005, got ${res.stopLossDistance}`);
    assert(res.positionSizeUnits === 100000, `Units should be 100,000, got ${res.positionSizeUnits}`);
    assert(res.grossGain === 1500, `Gross gain should be 1500, got ${res.grossGain}`);
    assert(res.riskRewardRatio === 3, `R:R should be 3, got ${res.riskRewardRatio}`);
    passed++;
  } catch (err: unknown) {
    errors.push(`Test 2 Failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Test 3: Invalid LONG Stop-Loss (SL above Entry)
  try {
    const input: RiskInput = {
      accountEquity: 10000,
      riskPercent: 1.0,
      positionSide: "LONG",
      entryPrice: 65000,
      stopLossPrice: 66000, // Invalid!
      targetPrice: 70000,
    };

    const res = calculateRisk(input);
    assert(!res.isValid, "Result should be invalid for LONG with SL above entry");
    assert(res.errorMessage?.includes("Stop-Loss must be strictly below Entry"), "Should have correct error message");
    passed++;
  } catch (err: unknown) {
    errors.push(`Test 3 Failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Test 4: Invalid SHORT Stop-Loss (SL below Entry)
  try {
    const input: RiskInput = {
      accountEquity: 10000,
      riskPercent: 1.0,
      positionSide: "SHORT",
      entryPrice: 65000,
      stopLossPrice: 64000, // Invalid!
      targetPrice: 60000,
    };

    const res = calculateRisk(input);
    assert(!res.isValid, "Result should be invalid for SHORT with SL below entry");
    assert(res.errorMessage?.includes("Stop-Loss must be strictly above Entry"), "Should have correct error message");
    passed++;
  } catch (err: unknown) {
    errors.push(`Test 4 Failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Test 5: Negative Equity or Zero Distances
  try {
    const resNegative = calculateRisk({
      accountEquity: -500,
      riskPercent: 1.0,
      positionSide: "LONG",
      entryPrice: 100,
      stopLossPrice: 90,
      targetPrice: 120,
    });
    assert(!resNegative.isValid, "Negative equity should be invalid");

    const resZeroDist = calculateRisk({
      accountEquity: 10000,
      riskPercent: 1.0,
      positionSide: "LONG",
      entryPrice: 100,
      stopLossPrice: 100,
      targetPrice: 120,
    });
    assert(!resZeroDist.isValid, "Zero SL distance should be invalid");
    passed++;
  } catch (err: unknown) {
    errors.push(`Test 5 Failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  return { passed, failed: errors.length, errors };
}

// Auto-run when executed directly
if (typeof require !== "undefined" && require.main === module) {
  const result = runRiskCalculatorTests();
  console.log(`Risk Calculator Tests: ${result.passed} passed, ${result.failed} failed.`);
  if (result.errors.length > 0) {
    console.error(result.errors.join("\n"));
    process.exit(1);
  } else {
    console.log("All risk calculator mathematical formulas verified successfully.");
  }
}
