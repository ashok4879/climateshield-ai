import React, { useState } from 'react';
import {
  ListFilter,
  Flame,
  Droplets,
  Layers,
  CheckCircle,
  Circle,
  Clock,
  MapPin
} from 'lucide-react';
import { AREAS } from '../data/catalog';
import { formatCurrency } from '../utils/climateEngine';

export default function InterventionCatalog({
  interventions,
  selectedIds,
  onToggleIntervention
}) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterArea, setFilterArea] = useState('all');

  const areaMap = new Map(AREAS.map(a => [a.id, a]));

  const filtered = interventions.filter(item => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterArea !== 'all' && item.areaId !== filterArea) return false;
    return true;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 mb-8 shadow-sm">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-emerald-400" />
            <span>Intervention Catalog & Portfolio Selection</span>
          </h2>
          <p className="text-xs text-slate-400">
            Click any card to manually customize the portfolio. Over-budget selections are flagged as infeasible.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filterCategory === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterCategory('heat')}
              className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                filterCategory === 'heat' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-400" /> Heat
            </button>
            <button
              onClick={() => setFilterCategory('water')}
              className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                filterCategory === 'water' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Droplets className="w-3 h-3 text-cyan-400" /> Water
            </button>
            <button
              onClick={() => setFilterCategory('both')}
              className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                filterCategory === 'both' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3 text-emerald-400" /> Co-Benefit
            </button>
          </div>

          {/* Area Filter */}
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Areas (4)</option>
            {AREAS.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Interventions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3.5">
        {filtered.map(item => {
          const isSelected = selectedIds.includes(item.id);
          const targetArea = areaMap.get(item.areaId);

          return (
            <div
              key={item.id}
              onClick={() => onToggleIntervention(item.id)}
              className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 select-none flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-950/80 border-emerald-500/60 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/20'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 opacity-75 hover:opacity-100'
              }`}
            >
              <div>
                {/* Top Row: Selection Checkbox & Cost */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      className={`p-0.5 rounded transition ${
                        isSelected ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                      aria-label={isSelected ? 'Deselect intervention' : 'Select intervention'}
                    >
                      {isSelected ? (
                        <CheckCircle className="w-5 h-5 fill-emerald-500/20 stroke-[2.2]" />
                      ) : (
                        <Circle className="w-5 h-5 stroke-[1.8]" />
                      )}
                    </button>
                    <h3 className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {item.name}
                    </h3>
                  </div>

                  {/* Standardized Cost Badge */}
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50 flex-shrink-0">
                    {formatCurrency(item.cost)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 ml-7 mb-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Bottom Meta & Impacts */}
              <div className="ml-7 pt-2.5 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                {/* Location & Time */}
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-slate-300">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {targetArea?.name || item.areaId}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {item.timeToImplement}
                  </span>
                </div>

                {/* Impact Badges - Displayed as Positive Mitigations */}
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  {item.heatReduction > 0 && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50">
                      <Flame className="w-3 h-3 text-amber-400" />
                      +{item.heatReduction} Heat Mitig.
                    </span>
                  )}
                  {item.waterReduction > 0 && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
                      <Droplets className="w-3 h-3 text-cyan-400" />
                      +{item.waterReduction} Water Mitig.
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-sm">
          No interventions match the selected filters.
        </div>
      )}
    </div>
  );
}
