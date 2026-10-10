/**
 * ClimateShield AI — Deterministic Climate Risk Scoring & Optimization Engine
 *
 * Core architectural guidelines:
 * 1. Scoring and optimization logic is pure, stateless, and reusable across frontend and backend.
 * 2. Deterministic execution: identical inputs always yield identical outputs.
 * 3. Strict separation of equity prioritization and environmental modeling:
 *    Equity weighting affects ONLY intervention ranking/selection during optimization.
 *    Equity MUST NEVER inflate physical environmental risk reduction figures.
 * 4. Boundary safety: Risk scores are clamped within [0, 100]. Reductions are capped
 *    such that post-intervention risk cannot fall below zero.
 * 5. Impact metrics: Reductions are reported as non-negative positive quantities.
 *    Combined reduction equals heat reduction plus water reduction (1:1 equal weight parity).
 * 6. Budget constraint enforcement: The optimizer NEVER returns a portfolio exceeding the budget.
 *    Any over-budget portfolio is classified as an infeasible draft scenario.
 */

/**
 * Consistent currency formatter used across the entire application.
 * @param {number} amount 
 * @returns {string} e.g. "$500,000"
 */
export function formatCurrency(amount) {
  const numeric = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(numeric);
}

/**
 * Calculates raw environmental benefit points.
 * Treats 1 heat point and 1 water point equally as a baseline simplifying assumption.
 * @param {Object} intervention 
 * @returns {number}
 */
export function getRawBenefit(intervention) {
  const heat = Math.max(0, Number(intervention?.heatReduction) || 0);
  const water = Math.max(0, Number(intervention?.waterReduction) || 0);
  return heat + water;
}

/**
 * Computes the ranking priority metric for an intervention.
 * 
 * In standard mode: metric = rawBenefit / cost
 * In equity mode:   metric = (rawBenefit * equityMultiplier) / cost
 * 
 * Note: This metric is ONLY used to rank/prioritize which interventions to select.
 * It does NOT change the physical risk reduction delivered by the intervention.
 * 
 * @param {Object} intervention 
 * @param {Map<string, Object>} areaMap 
 * @param {boolean} enableEquity 
 * @returns {number}
 */
export function computeSelectionPriority(intervention, areaMap, enableEquity = false) {
  const cost = Math.max(1, Number(intervention?.cost) || 1);
  const benefit = getRawBenefit(intervention);

  if (!enableEquity) {
    return benefit / cost;
  }

  const area = areaMap?.get(intervention?.areaId);
  const vulnerability = area && typeof area.vulnerabilityIndex === 'number'
    ? Math.max(0, Math.min(1, area.vulnerabilityIndex))
    : 0.5;

  // Equity multiplier scales from 1.0 (lowest vulnerability) up to 2.5 (highest vulnerability)
  const equityMultiplier = 1.0 + (vulnerability * 1.5);

  return (benefit * equityMultiplier) / cost;
}

/**
 * Evaluates the deterministic physical impact of an intervention portfolio.
 * 
 * Validation and Capping Rules:
 * 1. Post-intervention risk score: clamped to [0, 100], never below 0.
 * 2. Effective reduction for any zone: capped at that zone's baseline risk.
 * 3. Exact identity guarantee: Baseline Risk - Post-Intervention Risk === Effective Reduction.
 * 4. Total reductions: Exactly equal sum of effective area reductions.
 * 5. Combined reduction: Exactly equals totalHeatReduction + totalWaterReduction.
 * 6. Environmental metrics are strictly uninflated by equity mode.
 * 
 * @param {Array<Object>} selectedInterventions 
 * @param {Array<Object>} areas 
 * @param {number} budget 
 * @returns {Object}
 */
export function evaluatePortfolio(selectedInterventions, areas, budget = 0) {
  const safeBudget = Math.max(0, Number(budget) || 0);
  const selectedList = Array.isArray(selectedInterventions) ? selectedInterventions : [];
  const areaList = Array.isArray(areas) ? areas : [];

  // 1. Calculate total portfolio cost
  const totalCost = selectedList.reduce((acc, item) => acc + Math.max(0, Number(item?.cost) || 0), 0);
  const netBudget = safeBudget - totalCost;
  const isOverBudget = totalCost > safeBudget;
  const deficit = Math.max(0, totalCost - safeBudget);
  const remainingBudget = Math.max(0, safeBudget - totalCost);

  // 2. Map gross reductions by area
  const grossByArea = new Map();
  for (const item of selectedList) {
    const areaId = item?.areaId;
    if (!grossByArea.has(areaId)) {
      grossByArea.set(areaId, { heat: 0, water: 0 });
    }
    const current = grossByArea.get(areaId);
    current.heat += Math.max(0, Number(item?.heatReduction) || 0);
    current.water += Math.max(0, Number(item?.waterReduction) || 0);
  }

  // 3. Compute area-specific capped impacts
  let totalHeatReduction = 0;
  let totalWaterReduction = 0;

  const areaImpacts = areaList.map(area => {
    const baselineHeat = Math.min(100, Math.max(0, Number(area?.baselineHeatRisk) || 0));
    const baselineWater = Math.min(100, Math.max(0, Number(area?.baselineWaterRisk) || 0));

    const gross = grossByArea.get(area?.id) || { heat: 0, water: 0 };

    // Reductions are capped so post-intervention risk cannot drop below 0
    const effectiveHeatReduction = Math.min(baselineHeat, gross.heat);
    const effectiveWaterReduction = Math.min(baselineWater, gross.water);

    // Guaranteed identity: postRisk = baseline - effectiveReduction
    const postHeatRisk = Math.max(0, Math.min(100, baselineHeat - effectiveHeatReduction));
    const postWaterRisk = Math.max(0, Math.min(100, baselineWater - effectiveWaterReduction));

    totalHeatReduction += effectiveHeatReduction;
    totalWaterReduction += effectiveWaterReduction;

    return {
      areaId: area.id,
      name: area.name,
      type: area.type,
      population: area.population,
      vulnerabilityIndex: area.vulnerabilityIndex,
      baselineHeatRisk: baselineHeat,
      baselineWaterRisk: baselineWater,
      grossHeatReduction: gross.heat,
      grossWaterReduction: gross.water,
      effectiveHeatReduction,
      effectiveWaterReduction,
      postHeatRisk,
      postWaterRisk,
      combinedAreaReduction: effectiveHeatReduction + effectiveWaterReduction,
      interventionsCount: selectedList.filter(i => i?.areaId === area.id).length
    };
  });

  // Total combined reduction (equal weight 1:1 assumption)
  const combinedReduction = totalHeatReduction + totalWaterReduction;

  return {
    totalCost,
    budget: safeBudget,
    netBudget,
    remainingBudget,
    deficit,
    isOverBudget,
    isFeasible: !isOverBudget,
    selectedCount: selectedList.length,
    totalHeatReduction,
    totalWaterReduction,
    combinedReduction,
    areaImpacts,
    simplifyingAssumption: "Combined score weights 1 heat risk point == 1 water risk point equally.",
    dataNotice: "Synthetic demo data for illustrative modeling only."
  };
}

/**
 * Deterministically optimizes the selection of interventions under a budget constraint.
 * 
 * Guarantee: The optimizer NEVER returns a portfolio whose totalCost > budget.
 * 
 * Algorithm:
 * 1. Filter out invalid items and map deterministic selection metrics.
 * 2. Deterministic stable sort:
 *    - Descending priority metric
 *    - Descending raw benefit (tie-breaker)
 *    - Ascending cost (tie-breaker)
 *    - Ascending ID string comparison (guarantees 100% deterministic ordering)
 * 3. Greedy knapsack selection: Include items while currentCost + item.cost <= safeBudget.
 * 4. Evaluates the resulting portfolio with pure physical scoring rules.
 * 
 * @param {Array<Object>} interventions 
 * @param {Array<Object>} areas 
 * @param {number} budget 
 * @param {boolean} enableEquity 
 * @returns {Object} { selectedInterventions, selectedIds, evaluation, isFeasible: true }
 */
export function optimizePortfolio(interventions, areas, budget, enableEquity = false) {
  const safeBudget = Math.max(0, Number(budget) || 0);
  const catalog = Array.isArray(interventions) ? [...interventions] : [];
  const areaList = Array.isArray(areas) ? areas : [];

  const areaMap = new Map();
  for (const a of areaList) {
    if (a?.id) areaMap.set(a.id, a);
  }

  // Pre-calculate selection priority for deterministic sort
  const scored = catalog.map(item => ({
    item,
    priority: computeSelectionPriority(item, areaMap, enableEquity),
    rawBenefit: getRawBenefit(item),
    cost: Math.max(0, Number(item?.cost) || 0),
    id: String(item?.id || '')
  }));

  // Deterministic sorting comparator
  scored.sort((a, b) => {
    // 1. Highest selection priority
    if (Math.abs(b.priority - a.priority) > 1e-9) {
      return b.priority - a.priority;
    }
    // 2. Highest raw benefit
    if (b.rawBenefit !== a.rawBenefit) {
      return b.rawBenefit - a.rawBenefit;
    }
    // 3. Lowest cost
    if (a.cost !== b.cost) {
      return a.cost - b.cost;
    }
    // 4. Stable tie-breaker: ID alphabetical
    return a.id.localeCompare(b.id);
  });

  // Greedy selection strictly under budget: currentCost + cost <= safeBudget
  const selectedInterventions = [];
  let currentCost = 0;

  for (const entry of scored) {
    if (entry.cost <= 0) continue; // Skip zero/invalid items if any
    if (currentCost + entry.cost <= safeBudget) {
      selectedInterventions.push(entry.item);
      currentCost += entry.cost;
    }
  }

  const selectedIds = selectedInterventions.map(i => i.id);
  const evaluation = evaluatePortfolio(selectedInterventions, areaList, safeBudget);

  return {
    selectedInterventions,
    selectedIds,
    evaluation,
    equityEnabled: Boolean(enableEquity),
    isFeasible: true
  };
}
