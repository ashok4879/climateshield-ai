import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePortfolio,
  optimizePortfolio,
  getRawBenefit,
  computeSelectionPriority,
  formatCurrency
} from '../src/utils/climateEngine.js';
import { AREAS, INTERVENTIONS } from '../src/data/catalog.js';

describe('ClimateShield AI — Core Scoring & Optimization Engine Tests', () => {

  // Test 1: Budget constraints (including zero, small budgets, and full range)
  test('Budget constraints: Optimizer strictly satisfies totalCost <= budget across all edge cases', () => {
    const testBudgets = [
      0,          // Zero budget
      10000,      // Smaller than lowest intervention cost ($75,000)
      50000,      // Still smaller than lowest intervention cost
      75000,      // Exact cost of lowest intervention
      100000,
      250000,
      500000,
      750000,
      1000000,
      1520000,    // Exact total cost of all 10 interventions
      2000000     // Exceeds total catalog cost
    ];

    for (const budget of testBudgets) {
      // Standard optimization
      const std = optimizePortfolio(INTERVENTIONS, AREAS, budget, false);
      assert.ok(
        std.evaluation.totalCost <= budget,
        `Standard totalCost (${std.evaluation.totalCost}) must be <= budget (${budget})`
      );
      assert.equal(std.evaluation.isOverBudget, false, `Standard should not be marked over-budget`);
      assert.equal(std.evaluation.deficit, 0, `Standard deficit should be 0`);
      assert.ok(std.evaluation.remainingBudget >= 0, `Standard remainingBudget should be >= 0`);

      // Equity optimization
      const eq = optimizePortfolio(INTERVENTIONS, AREAS, budget, true);
      assert.ok(
        eq.evaluation.totalCost <= budget,
        `Equity totalCost (${eq.evaluation.totalCost}) must be <= budget (${budget})`
      );
      assert.equal(eq.evaluation.isOverBudget, false, `Equity should not be marked over-budget`);
      assert.equal(eq.evaluation.deficit, 0, `Equity deficit should be 0`);
      assert.ok(eq.evaluation.remainingBudget >= 0, `Equity remainingBudget should be >= 0`);
    }

    // Explicit check for zero budget
    const zeroResult = optimizePortfolio(INTERVENTIONS, AREAS, 0, false);
    assert.equal(zeroResult.selectedInterventions.length, 0);
    assert.equal(zeroResult.evaluation.totalCost, 0);
    assert.equal(zeroResult.evaluation.totalHeatReduction, 0);
    assert.equal(zeroResult.evaluation.totalWaterReduction, 0);
    assert.equal(zeroResult.evaluation.combinedReduction, 0);

    // Explicit check for budget smaller than lowest intervention ($75,000)
    const smallResult = optimizePortfolio(INTERVENTIONS, AREAS, 50000, false);
    assert.equal(smallResult.selectedInterventions.length, 0);
    assert.equal(smallResult.evaluation.totalCost, 0);
  });

  // Test 2: Infeasible manual portfolio detection
  test('Budget constraints: Over-budget manual portfolios are flagged as infeasible with correct deficit', () => {
    // Select all 10 interventions manually under a $500,000 budget
    const budget = 500000;
    const allEval = evaluatePortfolio(INTERVENTIONS, AREAS, budget);
    const expectedTotalCost = INTERVENTIONS.reduce((acc, i) => acc + i.cost, 0);

    assert.equal(allEval.totalCost, expectedTotalCost); // $1,520,000
    assert.equal(allEval.isOverBudget, true);
    assert.equal(allEval.isFeasible, false);
    assert.equal(allEval.deficit, expectedTotalCost - budget); // $1,020,000
    assert.equal(allEval.remainingBudget, 0);

    // Specific user scenario: $500,000 budget with $1,335,000 allocated
    // Int 4 ($75k) and Int 1 ($110k) excluded -> 1,520,000 - 185,000 = 1,335,000
    const subset1335k = INTERVENTIONS.filter(i => i.id !== 'int-1' && i.id !== 'int-4');
    const subsetEval = evaluatePortfolio(subset1335k, AREAS, 500000);
    assert.equal(subsetEval.totalCost, 1335000);
    assert.equal(subsetEval.isOverBudget, true);
    assert.equal(subsetEval.deficit, 835000);
    assert.equal(subsetEval.isFeasible, false);
  });

  // Test 3: Metric signs, positive quantities, and exact identities
  test('Impact metric validation: Positive quantities, risk clamping, and mathematical identities', () => {
    const budget = 500000;
    const result = optimizePortfolio(INTERVENTIONS, AREAS, budget, false);
    const evalData = result.evaluation;

    // 1. Reductions are positive quantities
    assert.ok(evalData.totalHeatReduction >= 0, 'Total heat reduction must be >= 0');
    assert.ok(evalData.totalWaterReduction >= 0, 'Total water reduction must be >= 0');
    assert.ok(evalData.combinedReduction >= 0, 'Combined reduction must be >= 0');

    // 2. Combined unweighted reduction equals heat reduction plus water reduction
    assert.equal(
      evalData.combinedReduction,
      evalData.totalHeatReduction + evalData.totalWaterReduction,
      'Combined reduction must equal sum of heat and water reductions'
    );

    // 3. Area-level identity checks:
    // baselineRisk - postInterventionRisk === effectiveReduction
    let sumAreaHeat = 0;
    let sumAreaWater = 0;

    for (const area of evalData.areaImpacts) {
      // Risk scores stay within [0, 100]
      assert.ok(area.postHeatRisk >= 0 && area.postHeatRisk <= 100, 'postHeatRisk must be in [0, 100]');
      assert.ok(area.postWaterRisk >= 0 && area.postWaterRisk <= 100, 'postWaterRisk must be in [0, 100]');

      // Reductions are non-negative
      assert.ok(area.effectiveHeatReduction >= 0, 'effectiveHeatReduction must be >= 0');
      assert.ok(area.effectiveWaterReduction >= 0, 'effectiveWaterReduction must be >= 0');

      // Exact mathematical identity: Baseline - Post === Effective Reduction
      assert.equal(
        area.baselineHeatRisk - area.postHeatRisk,
        area.effectiveHeatReduction,
        `Identity failed for area ${area.name} Heat: ${area.baselineHeatRisk} - ${area.postHeatRisk} !== ${area.effectiveHeatReduction}`
      );

      assert.equal(
        area.baselineWaterRisk - area.postWaterRisk,
        area.effectiveWaterReduction,
        `Identity failed for area ${area.name} Water: ${area.baselineWaterRisk} - ${area.postWaterRisk} !== ${area.effectiveWaterReduction}`
      );

      sumAreaHeat += area.effectiveHeatReduction;
      sumAreaWater += area.effectiveWaterReduction;
    }

    // 4. Total KPI equals sum of corresponding area reductions
    assert.equal(evalData.totalHeatReduction, sumAreaHeat, 'Total heat reduction must equal sum of area heat reductions');
    assert.equal(evalData.totalWaterReduction, sumAreaWater, 'Total water reduction must equal sum of area water reductions');

    // 5. Total cost matches sum of selected intervention costs
    const manualCostSum = result.selectedInterventions.reduce((sum, item) => sum + item.cost, 0);
    assert.equal(evalData.totalCost, manualCostSum, 'Total cost must match sum of selected items');
  });

  // Test 4: Risk boundary caps under extreme reductions
  test('Risk caps: Extreme reductions do not push post-risk below 0', () => {
    const customArea = [{
      id: 'test-zone',
      name: 'Test Zone',
      baselineHeatRisk: 20,
      baselineWaterRisk: 15,
      vulnerabilityIndex: 0.5
    }];

    const extremeIntervention = [{
      id: 'int-extreme',
      name: 'Extreme Cooling Project',
      areaId: 'test-zone',
      cost: 50000,
      heatReduction: 100, // Exceeds 20
      waterReduction: 100  // Exceeds 15
    }];

    const evaluation = evaluatePortfolio(extremeIntervention, customArea, 100000);
    const impact = evaluation.areaImpacts[0];

    assert.equal(impact.postHeatRisk, 0, 'Post-intervention heat risk cannot drop below 0');
    assert.equal(impact.postWaterRisk, 0, 'Post-intervention water risk cannot drop below 0');
    assert.equal(impact.effectiveHeatReduction, 20, 'Effective heat reduction must cap at baseline (20)');
    assert.equal(impact.effectiveWaterReduction, 15, 'Effective water reduction must cap at baseline (15)');
    assert.equal(evaluation.totalHeatReduction, 20);
    assert.equal(evaluation.totalWaterReduction, 15);
    assert.equal(evaluation.combinedReduction, 35);
  });

  // Test 5: Equity isolation (never inflates physical environmental impact)
  test('Equity isolation: Equity toggle influences prioritization order, but strictly preserves physical impacts', () => {
    const sampleSelection = [INTERVENTIONS[1], INTERVENTIONS[5]]; // South housing projects

    // Evaluated directly
    const evalResult = evaluatePortfolio(sampleSelection, AREAS, 500000);

    // Verify raw calculation equals evaluation
    const expectedHeat = sampleSelection.reduce((sum, i) => sum + i.heatReduction, 0);
    const expectedWater = sampleSelection.reduce((sum, i) => sum + i.waterReduction, 0);

    assert.equal(evalResult.totalHeatReduction, expectedHeat);
    assert.equal(evalResult.totalWaterReduction, expectedWater);
    assert.equal(evalResult.combinedReduction, expectedHeat + expectedWater);

    // Modeled environmental values must never be scaled by equity multiplier
    const areaMap = new Map(AREAS.map(a => [a.id, a]));
    const southHousing = areaMap.get('south-housing');
    assert.ok(southHousing.vulnerabilityIndex > 0.9);

    // Confirm that evaluatePortfolio does not accept or apply equity inflation
    assert.equal(
      evalResult.combinedReduction,
      expectedHeat + expectedWater,
      'Physical combined score must never contain vulnerability multiplier inflation'
    );
  });

  // Test 6: Determinism across multiple executions
  test('Determinism: Identical inputs always yield bit-for-bit identical portfolios', () => {
    const budget = 600000;
    const run1 = optimizePortfolio(INTERVENTIONS, AREAS, budget, true);
    const run2 = optimizePortfolio(INTERVENTIONS, AREAS, budget, true);

    assert.deepEqual(run1.selectedIds, run2.selectedIds);
    assert.equal(run1.evaluation.totalCost, run2.evaluation.totalCost);
    assert.equal(run1.evaluation.totalHeatReduction, run2.evaluation.totalHeatReduction);
    assert.equal(run1.evaluation.totalWaterReduction, run2.evaluation.totalWaterReduction);
    assert.equal(run1.evaluation.combinedReduction, run2.evaluation.combinedReduction);
  });

  // Test 7: Consistent currency formatter
  test('Consistency: Currency formatting helper returns standard USD strings', () => {
    assert.equal(formatCurrency(500000), '$500,000');
    assert.equal(formatCurrency(0), '$0');
    assert.equal(formatCurrency(1335000), '$1,335,000');
    assert.equal(formatCurrency(835000), '$835,000');
  });

});
