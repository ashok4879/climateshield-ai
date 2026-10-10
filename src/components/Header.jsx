import React from 'react';
import { Shield, Sparkles, Info, Sliders, Leaf } from 'lucide-react';

export default function Header({ onOpenMethodology }) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
            <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                ClimateShield <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                v0.1 MVP
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Urban Heat & Water Risk Prioritization Engine • <span className="text-emerald-400/90 font-medium">Environmental Hacks</span>
            </p>
          </div>
        </div>

        {/* Right: Badges & Methodology CTA */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="hidden md:flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Deterministic Scoring Engine</span>
          </div>

          <button
            onClick={onOpenMethodology}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition"
            title="View mathematical formulation and data assumptions"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Methodology & Assumptions</span>
          </button>
        </div>
      </div>
    </header>
  );
}
