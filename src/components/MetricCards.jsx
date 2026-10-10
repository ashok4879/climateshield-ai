import React from 'react';
import { Flame, Droplets, Layers, DollarSign, Wallet, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/climateEngine';

export default function MetricCards({ evaluation, budget, isManualOverride, onRestoreRecommended }) {
  const {
    totalCost,
    remainingBudget,
    deficit,
    isOverBudget,
    isFeasible,
    totalHeatReduction,
    totalWaterReduction,
    combinedReduction,
    selectedCount
  } = evaluation;

  const budgetPercent = budget > 0 ? Math.round((totalCost / budget) * 100) : 0;

  return (
    <div className="space-y-3 mb-6">
      {/* Prominent Infeasibility Warning when Manual Selection Exceeds Budget */}
      {isOverBudget && (
        <div className="bg-rose-950/40 border-2 border-rose-500/70 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg shadow-rose-950/30">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 flex-shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/80">
                  Plan Infeasible
                </span>
                <span className="text-sm font-bold text-white">
                  Manual Selection Exceeds Budget by {formatCurrency(deficit)}
                </span>
              </div>
              <p className="text-xs text-rose-200/90 mt-0.5">
                Current custom selection costs {formatCurrency(totalCost)}, which exceeds the available {formatCurrency(budget)} limit. This portfolio cannot be implemented as a feasible plan.
              </p>
            </div>
          </div>

          <button
            onClick={onRestoreRecommended}
            className="flex-shrink-0 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <CheckCircle2 className="w-4 h-4" />
            Restore Optimized Plan
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* 1. Modeled Heat-Risk Reduction (Positive Quantity) */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-4 relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -mr-6 -mt-6"></div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Heat-Risk Reduction</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              +{totalHeatReduction}
            </span>
            <span className="text-xs text-amber-400 font-medium">pts mitigated</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Sum of reductions across 4 zones
          </p>
        </div>

        {/* 2. Modeled Water-Risk Reduction (Positive Quantity) */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-4 relative overflow-hidden group hover:border-cyan-500/40 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none -mr-6 -mt-6"></div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Water-Risk Reduction</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              +{totalWaterReduction}
            </span>
            <span className="text-xs text-cyan-400 font-medium">pts mitigated</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Stormwater & flood mitigation
          </p>
        </div>

        {/* 3. Combined Reduction Score (Positive Quantity, Equal Weight) */}
        <div className="bg-slate-900/90 border border-emerald-500/50 rounded-xl p-4 relative overflow-hidden shadow-lg shadow-emerald-950/20">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none -mr-6 -mt-6"></div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Combined Reduction</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-300 tracking-tight">
              +{combinedReduction}
            </span>
            <span className="text-xs text-emerald-400 font-medium">total pts</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {totalHeatReduction} Heat + {totalWaterReduction} Water (1:1 parity)
          </p>
        </div>

        {/* 4. Total Cost Allocated */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-4 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Total Allocated</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl sm:text-2xl font-bold tracking-tight ${isOverBudget ? 'text-rose-400' : 'text-white'}`}>
              {formatCurrency(totalCost)}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, budgetPercent)}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>{selectedCount} selected</span>
              <span className={isOverBudget ? 'text-rose-400 font-semibold' : ''}>
                {budgetPercent}% of budget
              </span>
            </div>
          </div>
        </div>

        {/* 5. Remaining Budget / Deficit */}
        <div className={`bg-slate-900/90 border rounded-xl p-4 relative overflow-hidden transition ${
          isOverBudget ? 'border-rose-500/70 bg-rose-950/20' : 'border-slate-800/90'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              isOverBudget ? 'text-rose-400' : 'text-slate-300'
            }`}>
              {isOverBudget ? 'Budget Deficit' : 'Remaining Budget'}
            </span>
            <div className={`p-1.5 rounded-lg ${isOverBudget ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300'}`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl sm:text-2xl font-bold tracking-tight ${
              isOverBudget ? 'text-rose-400 font-mono' : 'text-slate-200 font-mono'
            }`}>
              {isOverBudget ? `-${formatCurrency(deficit)}` : formatCurrency(remainingBudget)}
            </span>
          </div>
          <p className={`text-[11px] mt-2 ${isOverBudget ? 'text-rose-300 font-semibold' : 'text-slate-400'}`}>
            {isOverBudget ? 'Over budget by ' + formatCurrency(deficit) : 'Available under budget ceiling'}
          </p>
        </div>

      </div>
    </div>
  );
}
