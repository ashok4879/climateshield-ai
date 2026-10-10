import React, { useState } from 'react';
import { AlertTriangle, Info, ChevronDown, ChevronUp, Scale, Database } from 'lucide-react';
import { DEMO_DATA_DISCLAIMER, SIMPLIFYING_ASSUMPTION_NOTE } from '../data/catalog';

export default function DisclaimerBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden mb-6 shadow-sm">
      <div className="px-4 py-3 bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-cyan-500/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start md:items-center gap-2.5">
          <div className="p-1 rounded bg-amber-500/20 text-amber-400 mt-0.5 md:mt-0 flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-amber-300 mr-2 uppercase tracking-wider text-[11px]">
              Prototype Notice:
            </span>
            <span className="text-slate-300">
              {DEMO_DATA_DISCLAIMER}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition flex-shrink-0 self-end md:self-auto font-medium"
        >
          <span>{isExpanded ? 'Hide Details' : 'View Simplifying Assumptions'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/60 text-xs space-y-2 text-slate-300">
          <div className="flex items-start gap-2">
            <Scale className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <p>
              <strong className="text-cyan-300">1:1 Weighting Assumption:</strong> {SIMPLIFYING_ASSUMPTION_NOTE}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Database className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <p>
              <strong className="text-emerald-300">Equity Isolation Principle:</strong> When Equity Prioritization is enabled, socio-economically vulnerable areas receive algorithmic priority in budget selection. However, the modeled environmental reductions displayed always remain pure physical points and are never multiplied or inflated.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
