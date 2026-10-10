import React from 'react';
import { X, Scale, AlertTriangle, ShieldCheck, Cpu, Database, CheckCircle2 } from 'lucide-react';
import { DEMO_DATA_DISCLAIMER, SIMPLIFYING_ASSUMPTION_NOTE } from '../data/catalog';

export default function MethodologyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Methodology & Decision Rules
              </h2>
              <p className="text-xs text-slate-400">
                ClimateShield AI Deterministic Prioritization Framework
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 text-xs sm:text-sm leading-relaxed">
          
          {/* Section 1: Synthetic Data Label */}
          <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Synthetic Demo Data Disclosure</span>
            </div>
            <p className="text-slate-300 text-xs">
              {DEMO_DATA_DISCLAIMER}
            </p>
          </div>

          {/* Section 2: 1:1 Parity Assumption */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <Scale className="w-4 h-4" />
              <span>1:1 Risk Point Weighting Assumption</span>
            </div>
            <p className="text-slate-300 text-xs">
              {SIMPLIFYING_ASSUMPTION_NOTE}
            </p>
            <div className="p-2.5 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 border border-slate-800">
              Combined Reduction = (Effective Heat Reduction pts) + (Effective Water Reduction pts)
            </div>
          </div>

          {/* Section 3: Equity Separation Principle */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Strict Equity Isolation Rule</span>
            </div>
            <p className="text-slate-300 text-xs">
              Equity weighting is implemented as a <strong>selection heuristic</strong>, not an environmental multiplier:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs pl-1">
              <li>
                <strong>Standard Mode:</strong> Prioritizes interventions purely by physical cost-effectiveness: <code className="text-slate-200">benefit / cost</code>.
              </li>
              <li>
                <strong>Equity Mode:</strong> Scales selection priority by tract vulnerability factor: <code className="text-slate-200">(benefit × (1 + 1.5 × vulnerability)) / cost</code>.
              </li>
              <li>
                <strong>Environmental Metrics:</strong> Regardless of mode, displayed heat reduction, water reduction, and combined scores represent pure physical reduction points and are strictly uninflated.
              </li>
            </ul>
          </div>

          {/* Section 4: Boundary & Capping Rules */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-semibold">
              <Database className="w-4 h-4" />
              <span>Risk Boundary Capping</span>
            </div>
            <p className="text-slate-300 text-xs">
              All baseline risk scores are normalized in the interval [0, 100]. Reductions are capped per area such that post-intervention risk cannot fall below zero:
            </p>
            <div className="p-2.5 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 border border-slate-800">
              Effective Reduction = Math.min(Baseline Risk, Gross Mitigation Points)
            </div>
          </div>

          {/* Section 5: Future Milestones */}
          <div className="border-t border-slate-800 pt-4 text-xs text-slate-400 space-y-1.5">
            <span className="font-semibold text-slate-300 block">Future Milestones (Post-Hackathon MVP):</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>NOAA / Landsat Surface Temp open data</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>FEMA Flood hazard zone GIS layers</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>CDC Social Vulnerability Index (SVI)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Cloud deployment with deterministic API</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition"
          >
            Understood
          </button>
        </div>

      </div>
    </div>
  );
}
