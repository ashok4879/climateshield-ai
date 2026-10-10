import React from 'react';
import { Flame, Droplets, MapPin, Users, HeartHandshake, ShieldCheck, ArrowDown } from 'lucide-react';

function RiskBar({ label, icon: Icon, baseline, post, reduction, colorClass, barColorClass }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="flex items-center gap-1.5 font-medium text-slate-300">
          <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
          <span>{label}</span>
        </span>
        <div className="flex items-center gap-2">
          {reduction > 0 && (
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60 flex items-center gap-0.5">
              <ArrowDown className="w-2.5 h-2.5" />
              {reduction} pts reduced
            </span>
          )}
          <span className="font-mono text-xs">
            <span className="line-through text-slate-500 mr-1.5" title="Baseline Risk">{baseline}</span>
            <span className="font-bold text-white text-sm" title="Modeled Post-Intervention Risk">{post}</span>
            <span className="text-slate-500 text-[10px]">/100</span>
          </span>
        </div>
      </div>

      {/* Visual Bar showing baseline and post-intervention */}
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
        {/* Baseline ghost bar */}
        <div
          className="absolute top-0 left-0 h-full bg-slate-700/60 rounded-full"
          style={{ width: `${baseline}%` }}
        ></div>
        {/* Post-intervention actual bar */}
        <div
          className={`relative h-full transition-all duration-500 rounded-full ${barColorClass}`}
          style={{ width: `${post}%` }}
        ></div>
      </div>
    </div>
  );
}

export default function AreaRiskGrid({ areaImpacts }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Urban Risk Zones & Modeled Impact</span>
          </h2>
          <p className="text-xs text-slate-400">
            Baseline risk (0–100) minus post-intervention risk equals modeled mitigation points
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Heat Risk
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Water Risk
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {areaImpacts.map((area) => {
          const isHighVulnerability = area.vulnerabilityIndex >= 0.75;

          return (
            <div
              key={area.areaId}
              className={`bg-slate-900/90 border rounded-xl p-4 flex flex-col justify-between transition hover:shadow-md ${
                isHighVulnerability
                  ? 'border-slate-800 hover:border-cyan-500/50'
                  : 'border-slate-800 hover:border-emerald-500/50'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{area.name}</h3>
                    <span className="text-[11px] text-slate-400 block">{area.type}</span>
                  </div>
                  {isHighVulnerability && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60" title="Vulnerability Index >= 0.75">
                      <HeartHandshake className="w-3 h-3" />
                      Priority Zone
                    </span>
                  )}
                </div>

                {/* Demographics & Vulnerability Meta */}
                <div className="flex items-center gap-3 text-[11px] text-slate-400 pb-3 mb-3 border-b border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-500" />
                    {area.population.toLocaleString()} pop.
                  </span>
                  <span>•</span>
                  <span>
                    Vuln Index: <strong className="text-slate-300 font-mono">{(area.vulnerabilityIndex * 100).toFixed(0)}%</strong>
                  </span>
                </div>

                {/* Heat Risk Bar */}
                <div className="space-y-3">
                  <RiskBar
                    label="Heat Risk"
                    icon={Flame}
                    baseline={area.baselineHeatRisk}
                    post={area.postHeatRisk}
                    reduction={area.effectiveHeatReduction}
                    colorClass="text-amber-400"
                    barColorClass="bg-gradient-to-r from-amber-500 to-orange-500"
                  />

                  {/* Water Risk Bar */}
                  <RiskBar
                    label="Water Risk"
                    icon={Droplets}
                    baseline={area.baselineWaterRisk}
                    post={area.postWaterRisk}
                    reduction={area.effectiveWaterReduction}
                    colorClass="text-cyan-400"
                    barColorClass="bg-gradient-to-r from-cyan-500 to-blue-500"
                  />
                </div>
              </div>

              {/* Bottom summary badge */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {area.interventionsCount} {area.interventionsCount === 1 ? 'measure' : 'measures'} active
                </span>
                <span className="font-semibold text-emerald-400 text-[11px]">
                  +{area.combinedAreaReduction} net pts mitigated
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
