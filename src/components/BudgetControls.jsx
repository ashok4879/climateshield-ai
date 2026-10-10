import React from 'react';
import { DollarSign, Sliders, Scale, Sparkles, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/climateEngine';

export default function BudgetControls({
  budget,
  onBudgetChange,
  equityEnabled,
  onToggleEquity,
  isManualOverride,
  onResetToOptimizer,
  isOverBudget,
  deficit
}) {
  const PRESET_BUDGETS = [250000, 500000, 750000, 1000000, 1400000];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 mb-6 shadow-sm">
      {/* Portfolio Mode Indicator Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Plan Status:</span>
          {isManualOverride ? (
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                isOverBudget
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-800'
              }`}>
                {isOverBudget ? <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> : <Sliders className="w-3.5 h-3.5 text-amber-400" />}
                {isOverBudget ? 'Custom Selection (Infeasible - Over Budget)' : 'Custom Selection (Feasible)'}
              </span>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Algorithmic Recommendation (Feasible & Optimal)
            </span>
          )}
        </div>

        {isManualOverride && (
          <button
            onClick={onResetToOptimizer}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restore Recommended Plan</span>
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        
        {/* Left: Budget Slider Section */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="budget-slider" className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Municipal / Campus Budget Limit</span>
            </label>
            <span className="text-base sm:text-lg font-extrabold text-emerald-400 font-mono">
              {formatCurrency(budget)}
            </span>
          </div>

          {/* Slider */}
          <div className="space-y-1.5">
            <input
              id="budget-slider"
              type="range"
              min="100000"
              max="1400000"
              step="25000"
              value={budget}
              onChange={(e) => onBudgetChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>$100,000</span>
              <span>$500,000</span>
              <span>$1,000,000</span>
              <span>$1,400,000</span>
            </div>
          </div>

          {/* Preset Buttons with Consistent Currency Formats */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-1">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mr-1">Presets:</span>
            {PRESET_BUDGETS.map((p) => (
              <button
                key={p}
                onClick={() => onBudgetChange(p)}
                className={`text-xs px-2.5 py-1 rounded-md font-mono font-medium transition ${
                  budget === p
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/30'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                }`}
              >
                {formatCurrency(p)}
              </button>
            ))}
          </div>
        </div>

        {/* Vertical divider */}
        <div className="hidden lg:block w-px h-28 bg-slate-800"></div>

        {/* Right: Equity Prioritization Toggle & Logic */}
        <div className="lg:w-96 flex flex-col justify-between bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/90">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${equityEnabled ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Equity-Prioritization Mode
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Weights vulnerable tracts during knapsack selection
                  </span>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={equityEnabled}
                onClick={onToggleEquity}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${
                  equityEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    equityEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {equityEnabled ? (
                <span className="text-cyan-300 font-medium">
                  ✓ Active: Interventions in South Housing (0.92 vuln) & River Ward (0.80 vuln) receive priority ranking. Physical risk reduction scores remain uninflated.
                </span>
              ) : (
                <span>
                  Standard: Interventions ranked purely by raw physical mitigation efficiency (pts / $).
                </span>
              )}
            </p>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Guaranteed Budget Ceiling:</span>
            <span className="text-slate-200 font-mono font-semibold">≤ {formatCurrency(budget)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
