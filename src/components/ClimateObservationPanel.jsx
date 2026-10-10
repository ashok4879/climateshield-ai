import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Flame,
  Droplets,
  ExternalLink,
  MapPin,
  Calendar,
  Clock,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle2,
  Database,
  CalendarDays
} from 'lucide-react';
import { fetchVaranasiClimateData, VARANASI_METADATA } from '../services/nasaPowerService';

export default function ClimateObservationPanel() {
  const [climateState, setClimateState] = useState({
    loading: true,
    data: null,
    error: null,
    isCached: false,
    retrievedAt: null
  });

  const loadData = async (forceRefresh = false) => {
    setClimateState(prev => ({ ...prev, loading: true, error: null }));
    const result = await fetchVaranasiClimateData({ forceRefresh });
    setClimateState({
      loading: false,
      data: result.data,
      error: result.error,
      isCached: result.isCached,
      retrievedAt: result.retrievedAt
    });
  };

  useEffect(() => {
    loadData(false);
  }, []);

  const formatRetrievalTime = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const { loading, data, error, isCached, retrievedAt } = climateState;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 mb-6 shadow-sm relative overflow-hidden">
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Pilot City Climate Observations</span>
                <span className="text-[11px] font-semibold bg-cyan-950/80 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800/80">
                  Real Open Data
                </span>
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{VARANASI_METADATA.city}, {VARANASI_METADATA.state}, {VARANASI_METADATA.country}</span>
                <span className="font-mono text-slate-500">({VARANASI_METADATA.latitude}° N, {VARANASI_METADATA.longitude}° E)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Action: Data source & Refresh */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs">
          <a
            href={VARANASI_METADATA.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition"
            title="Open NASA POWER Project Portal"
          >
            <span>NASA POWER API</span>
            <ExternalLink className="w-3 h-3 text-cyan-400" />
          </a>

          <button
            onClick={() => loadData(true)}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition disabled:opacity-50"
            title="Fetch fresh observations from NASA API"
          >
            <RefreshCw className={`w-3 h-3 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Fetching...' : 'Force Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Spatial Resolution & Scientific Scope Notice */}
      <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 mb-5 text-xs space-y-2">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-cyan-300">Gridded Climate Resolution Notice:</strong> NASA POWER observations represent regional satellite and assimilation reanalysis at a resolution of <strong className="text-slate-200">0.5° × 0.625° (~50 km grid cell)</strong>. This regional scale is much coarser than localized street-level microclimates.
            </p>
            <p className="text-slate-400 leading-relaxed">
              <strong className="text-amber-400">Micro-Urban Scope Boundary:</strong> These macro-climatic observations provide empirical baseline weather context for Varanasi, but are <em>not</em> neighborhood heat-risk or localized water-risk scores. The four urban zones (North Campus, Market District, River Ward, South Housing), their baseline scores, and intervention values below remain <strong>synthetic and illustrative demo models</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* State 1: Loading State */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></div>
          <p className="text-sm font-semibold text-slate-200">Querying NASA POWER Point Temporal API...</p>
          <p className="text-xs text-slate-400 max-w-md">
            Retrieving daily maximum temperature and precipitation time-series for Varanasi coordinates ({VARANASI_METADATA.requestedDateRange})...
          </p>
        </div>
      )}

      {/* State 2: API Error State */}
      {!loading && error && (
        <div className="bg-rose-950/30 border border-rose-800/80 rounded-xl p-4 sm:p-5 text-xs text-slate-200 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-rose-300">NASA POWER API Connection Notice</h3>
              <p className="text-rose-200/90 mt-1 leading-relaxed">
                Could not retrieve live observations: <code className="bg-rose-950/80 px-1.5 py-0.5 rounded text-rose-200 font-mono">{error}</code>
              </p>
              <p className="text-slate-400 mt-2 leading-relaxed">
                Reliable Fallback: In accordance with hackathon integrity guidelines, no fabricated measurements are displayed. The dashboard optimizer and synthetic zone model remain fully functional without external network dependencies.
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => loadData(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-semibold text-xs transition"
            >
              Retry NASA API Request
            </button>
          </div>
        </div>
      )}

      {/* State 3: No-Data State */}
      {!loading && !error && (!data || !data.annualBreakdown || data.annualBreakdown.length === 0) && (
        <div className="py-8 text-center text-slate-400 text-xs">
          No climate observations available for the specified coordinates and time range.
        </div>
      )}

      {/* State 4: Successful Data Display */}
      {!loading && !error && data && (
        <div className="space-y-4">
          
          {/* Metadata & Coverage Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="flex items-center gap-1 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Coverage: <strong>{data.metadata.actualDateRange}</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  <strong>{data.metadata.validObservationsCount}</strong> valid observations across <strong>{data.metadata.calendarDaysCount}</strong> calendar days
                </span>
              </span>
              <span>•</span>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded font-semibold ${
                data.metadata.isFullRequestedPeriod ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60' : 'text-amber-400 bg-amber-950/60 border border-amber-800/60'
              }`}>
                {data.metadata.isFullRequestedPeriod ? '✓ 5 Complete Years' : `${data.summary.yearsCoveredCount} of ${data.summary.requestedYearsCount} Years`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Retrieved: {formatRetrievalTime(retrievedAt)}</span>
              </span>
              {isCached && (
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px] border border-slate-700/60">
                  Cached
                </span>
              )}
            </div>
          </div>

          {/* 5-Year Aggregate Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Multi-Year Mean Daily Max Temp */}
            <div className="bg-slate-950/60 border border-amber-500/30 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold uppercase tracking-wider text-amber-300 text-[11px]">
                  {data.summary.yearsCoveredCount}-Yr Mean Daily Max Temp
                </span>
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-2xl font-black text-white font-mono">{data.summary.multiYearAvgMaxTemp}</span>
                <span className="text-sm font-semibold text-amber-400 font-mono">°C</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Mean of daily maximums ({data.summary.startYear}–{data.summary.endYear})
              </p>
            </div>

            {/* Multi-Year Mean Annual Precipitation */}
            <div className="bg-slate-950/60 border border-cyan-500/30 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold uppercase tracking-wider text-cyan-300 text-[11px]">
                  {data.summary.yearsCoveredCount}-Yr Mean Annual Rain
                </span>
                <Droplets className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-2xl font-black text-white font-mono">{data.summary.multiYearAvgAnnualPrecip}</span>
                <span className="text-sm font-semibold text-cyan-400 font-mono">mm/yr</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Annual precipitation averaged over {data.summary.yearsCoveredCount} complete yrs
              </p>
            </div>

            {/* Peak Daily Max Temp */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold uppercase tracking-wider text-slate-300 text-[11px]">Peak Daily Max Temp</span>
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-2xl font-black text-white font-mono">{data.summary.highestRecordedTMax}</span>
                <span className="text-sm font-semibold text-orange-400 font-mono">°C</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Highest single-day maximum in period
              </p>
            </div>

            {/* Peak Single-Day Rain */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold uppercase tracking-wider text-slate-300 text-[11px]">Wettest Single Day</span>
                <Droplets className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-2xl font-black text-white font-mono">{data.summary.highestRecordedPrecip}</span>
                <span className="text-sm font-semibold text-blue-400 font-mono">mm/day</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Highest 24-hr rainfall event in period
              </p>
            </div>

          </div>

          {/* Annual Breakdown Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th scope="col" className="px-3.5 py-2.5">Calendar Year</th>
                  <th scope="col" className="px-3.5 py-2.5">Calendar Days</th>
                  <th scope="col" className="px-3.5 py-2.5">Valid Observations</th>
                  <th scope="col" className="px-3.5 py-2.5 text-amber-300">Annual Avg Daily Max Temp (°C)</th>
                  <th scope="col" className="px-3.5 py-2.5 text-cyan-300">Annual Precipitation Total (mm)</th>
                  <th scope="col" className="px-3.5 py-2.5">Year Peak Temp (°C)</th>
                  <th scope="col" className="px-3.5 py-2.5">Peak Day Rain (mm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {data.annualBreakdown.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-900/50 transition">
                    <td className="px-3.5 py-2 font-bold text-white font-sans flex items-center gap-1.5">
                      <span>{row.year}</span>
                      {row.calendarDays === 366 && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono" title="Leap Year">
                          Leap
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-2 text-slate-400">{row.calendarDays} days</td>
                    <td className="px-3.5 py-2 text-emerald-400">
                      {row.validDays} days ({row.coveragePercent}%)
                    </td>
                    <td className="px-3.5 py-2 font-bold text-amber-300">
                      {row.annualAvgMaxTemp.toFixed(1)} °C
                    </td>
                    <td className="px-3.5 py-2 font-bold text-cyan-300">
                      {row.annualTotalPrecip.toFixed(1)} mm
                    </td>
                    <td className="px-3.5 py-2 text-slate-300">{row.peakMaxTemp} °C</td>
                    <td className="px-3.5 py-2 text-slate-300">{row.peakPrecip} mm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
}
