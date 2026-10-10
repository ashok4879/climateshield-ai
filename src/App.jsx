import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import DisclaimerBanner from './components/DisclaimerBanner';
import ClimateObservationPanel from './components/ClimateObservationPanel';
import MetricCards from './components/MetricCards';
import BudgetControls from './components/BudgetControls';
import AreaRiskGrid from './components/AreaRiskGrid';
import InterventionCatalog from './components/InterventionCatalog';
import MethodologyModal from './components/MethodologyModal';

import { AREAS, INTERVENTIONS } from './data/catalog';
import { optimizePortfolio, evaluatePortfolio, formatCurrency } from './utils/climateEngine';

export default function App() {
  const [budget, setBudget] = useState(500000);
  const [equityEnabled, setEquityEnabled] = useState(false);
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [manualSelectedIds, setManualSelectedIds] = useState([]);
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  // 1. Always recompute the recommended portfolio whenever budget or equity settings change
  const recommendedResult = useMemo(() => {
    return optimizePortfolio(INTERVENTIONS, AREAS, budget, equityEnabled);
  }, [budget, equityEnabled]);

  // 2. Active selection IDs: derived from optimizer if not in manual mode, else from manual draft
  const activeSelectedIds = useMemo(() => {
    if (!isManualOverride) {
      return recommendedResult.selectedIds;
    }
    return manualSelectedIds;
  }, [isManualOverride, recommendedResult.selectedIds, manualSelectedIds]);

  // 3. Active portfolio interventions
  const activeInterventions = useMemo(() => {
    return INTERVENTIONS.filter(item => activeSelectedIds.includes(item.id));
  }, [activeSelectedIds]);

  // 4. Deterministic evaluation of active portfolio
  const evaluation = useMemo(() => {
    if (!isManualOverride) {
      return recommendedResult.evaluation;
    }
    return evaluatePortfolio(activeInterventions, AREAS, budget);
  }, [isManualOverride, recommendedResult.evaluation, activeInterventions, budget]);

  // Handlers
  const handleBudgetChange = (newBudget) => {
    setBudget(newBudget);
  };

  const handleToggleEquity = () => {
    setEquityEnabled(prev => !prev);
  };

  const handleToggleIntervention = (id) => {
    let baseList = isManualOverride ? [...manualSelectedIds] : [...recommendedResult.selectedIds];
    
    if (baseList.includes(id)) {
      baseList = baseList.filter(item => item !== id);
    } else {
      baseList.push(id);
    }

    setIsManualOverride(true);
    setManualSelectedIds(baseList);
  };

  const handleRestoreRecommended = () => {
    setIsManualOverride(false);
    setManualSelectedIds([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30">
      {/* Sticky Header */}
      <Header onOpenMethodology={() => setMethodologyOpen(true)} />

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Synthetic Data Disclaimer Banner */}
        <DisclaimerBanner />

        {/* Real Open Climate Observations Panel: Pilot City Varanasi (NASA POWER) */}
        <ClimateObservationPanel />

        {/* Top Impact & Budget KPI Cards */}
        <MetricCards
          evaluation={evaluation}
          budget={budget}
          isManualOverride={isManualOverride}
          onRestoreRecommended={handleRestoreRecommended}
        />

        {/* Budget Slider & Equity Optimization Controls */}
        <BudgetControls
          budget={budget}
          onBudgetChange={handleBudgetChange}
          equityEnabled={equityEnabled}
          onToggleEquity={handleToggleEquity}
          isManualOverride={isManualOverride}
          onResetToOptimizer={handleRestoreRecommended}
          isOverBudget={evaluation.isOverBudget}
          deficit={evaluation.deficit}
        />

        {/* 4 Urban Risk Zones (Baseline vs Modeled) */}
        <AreaRiskGrid areaImpacts={evaluation.areaImpacts} />

        {/* Intervention Catalog */}
        <InterventionCatalog
          interventions={INTERVENTIONS}
          selectedIds={activeSelectedIds}
          onToggleIntervention={handleToggleIntervention}
        />

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">ClimateShield AI</span>
            <span>•</span>
            <span>Environmental Hacks Hackathon MVP</span>
          </div>
          <div className="text-slate-400">
            Deterministic Engine • Real NASA POWER Observations • Feasibility Enforced
          </div>
        </div>
      </footer>

      {/* Methodology & Assumptions Modal */}
      <MethodologyModal
        isOpen={methodologyOpen}
        onClose={() => setMethodologyOpen(false)}
      />
    </div>
  );
}
