/**
 * NASA POWER Climate Observation Service
 * 
 * Fetches and processes real historical daily meteorology data from NASA's
 * public POWER API (Prediction Of Worldwide Energy Resources).
 * 
 * Target Pilot City: Varanasi, Uttar Pradesh, India
 * Coordinates: 25.3176° N, 82.9739° E
 * Parameters:
 *   - T2M_MAX: Daily Maximum Air Temperature at 2 Meters (°C)
 *   - PRECTOTCORR: Daily Precipitation Corrected (mm/day)
 * Requested Period: 2021-01-01 to 2025-12-31 (latest 5 complete calendar years)
 * 
 * SCIENTIFIC RESOLUTION & SCOPE NOTICE:
 * NASA POWER data is gridded climate reanalysis with spatial resolution of approx.
 * 0.5° latitude by 0.625° longitude (~50 km). These are regional macro-meteorological
 * measurements and do NOT represent validated micro-urban neighborhood risk scores.
 */

export const VARANASI_METADATA = {
  city: 'Varanasi',
  state: 'Uttar Pradesh',
  country: 'India',
  latitude: 25.3176,
  longitude: 82.9739,
  requestedDateRange: '2021-01-01 to 2025-12-31',
  requestedStartYear: 2021,
  requestedEndYear: 2025,
  requestedCalendarYears: [2021, 2022, 2023, 2024, 2025],
  sourceName: 'NASA POWER Project (LaRC)',
  sourceUrl: 'https://power.larc.nasa.gov/',
  apiUrl: 'https://power.larc.nasa.gov/api/temporal/daily/point',
  spatialResolution: '0.5° × 0.625° (~50 km grid cell)'
};

export const CACHE_STORAGE_KEY = 'climateshield_nasa_power_varanasi_v3';
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Calculates the number of calendar days in a given year (handling leap years).
 * @param {number} year 
 * @returns {number} 366 if leap year, else 365
 */
export function getCalendarDaysInYear(year) {
  const y = Number(year);
  const isLeap = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
  return isLeap ? 366 : 365;
}

/**
 * Checks if a value returned by NASA POWER represents valid data or a missing sentinel.
 * NASA POWER uses -999, -999.0, or values <= -900 to indicate missing observations.
 * @param {any} val 
 * @returns {boolean}
 */
export function isValidClimateValue(val) {
  if (val === null || val === undefined) return false;
  const num = Number(val);
  if (Number.isNaN(num)) return false;
  if (num <= -900) return false;
  return true;
}

/**
 * Formats a YYYYMMDD date key into YYYY-MM-DD.
 * @param {string} key 
 * @returns {string}
 */
export function formatDateKey(key) {
  if (!key || typeof key !== 'string' || key.length !== 8) return String(key || '');
  return `${key.substring(0, 4)}-${key.substring(4, 6)}-${key.substring(6, 8)}`;
}

/**
 * Parses a raw NASA POWER daily point API response into annual climate metrics.
 * 
 * Guarantees:
 * 1. Computes actual coverage dates directly from returned keys (never hardcoded).
 * 2. Distinguishes calendar days from valid observed days and missing days.
 * 3. Does not infer missing values as zero or fabricate missing records.
 * 4. Accurately handles leap years (e.g. 2024 with 366 days).
 * 5. Reports partial coverage when returned data is fewer than the requested range.
 * 
 * @param {Object} rawData 
 * @returns {Object} Parsed climate observations
 */
export function parseNasaPowerResponse(rawData) {
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('Invalid NASA POWER response: payload is null or not an object');
  }

  const parameters = rawData?.properties?.parameter;
  if (!parameters || typeof parameters !== 'object') {
    throw new Error('Invalid NASA POWER response: properties.parameter object missing');
  }

  const t2mMaxObj = parameters.T2M_MAX;
  const precObj = parameters.PRECTOTCORR;

  if (!t2mMaxObj || typeof t2mMaxObj !== 'object') {
    throw new Error('Invalid NASA POWER response: missing T2M_MAX parameter data');
  }
  if (!precObj || typeof precObj !== 'object') {
    throw new Error('Invalid NASA POWER response: missing PRECTOTCORR parameter data');
  }

  // Extract date keys
  const dateKeys = Object.keys(t2mMaxObj).sort();
  if (dateKeys.length === 0) {
    throw new Error('NASA POWER response contained an empty observations dictionary');
  }

  const actualStartDate = formatDateKey(dateKeys[0]);
  const actualEndDate = formatDateKey(dateKeys[dateKeys.length - 1]);
  const actualStartYear = Number(dateKeys[0].substring(0, 4));
  const actualEndYear = Number(dateKeys[dateKeys.length - 1].substring(0, 4));

  // Determine all years present in the returned data
  const presentYearsSet = new Set(dateKeys.map(k => Number(k.substring(0, 4))));
  const presentYears = Array.from(presentYearsSet).sort((a, b) => a - b);

  // Extract units metadata
  const tMaxUnit = rawData?.parameters?.T2M_MAX?.units || '°C';
  const precipDailyUnit = rawData?.parameters?.PRECTOTCORR?.units || 'mm/day';
  const precipAnnualUnit = 'mm/year';

  // Group daily observations by calendar year
  const yearBuckets = new Map();

  for (const year of presentYears) {
    const calendarDays = getCalendarDaysInYear(year);
    yearBuckets.set(String(year), {
      year,
      calendarDays,
      returnedDays: 0,
      validTMaxDays: 0,
      missingTMaxDays: 0,
      validPrecipDays: 0,
      missingPrecipDays: 0,
      tMaxSum: 0,
      precipSum: 0,
      peakTMax: -Infinity,
      peakPrecip: 0
    });
  }

  let totalValidTMaxDays = 0;
  let totalValidPrecipDays = 0;
  let overallTMaxSum = 0;
  let overallPrecipSum = 0;
  let highestRecordedTMax = -Infinity;
  let highestRecordedPrecip = 0;

  for (const dateKey of dateKeys) {
    const yearStr = dateKey.substring(0, 4);
    const bucket = yearBuckets.get(yearStr);
    if (!bucket) continue;

    bucket.returnedDays += 1;

    const rawT = t2mMaxObj[dateKey];
    const rawP = precObj[dateKey];

    // Temperature processing
    if (isValidClimateValue(rawT)) {
      const tVal = Number(rawT);
      bucket.tMaxSum += tVal;
      bucket.validTMaxDays += 1;
      overallTMaxSum += tVal;
      totalValidTMaxDays += 1;
      if (tVal > bucket.peakTMax) bucket.peakTMax = tVal;
      if (tVal > highestRecordedTMax) highestRecordedTMax = tVal;
    } else {
      bucket.missingTMaxDays += 1;
    }

    // Precipitation processing
    if (isValidClimateValue(rawP)) {
      const pVal = Math.max(0, Number(rawP));
      bucket.precipSum += pVal;
      bucket.validPrecipDays += 1;
      overallPrecipSum += pVal;
      totalValidPrecipDays += 1;
      if (pVal > bucket.peakPrecip) bucket.peakPrecip = pVal;
      if (pVal > highestRecordedPrecip) highestRecordedPrecip = pVal;
    } else {
      bucket.missingPrecipDays += 1;
    }
  }

  // Format annual stats
  const annualBreakdown = [];
  let totalCalendarDaysInCoverage = 0;

  for (const year of presentYears) {
    const b = yearBuckets.get(String(year));
    if (!b || b.validTMaxDays === 0) continue;

    totalCalendarDaysInCoverage += b.calendarDays;

    const annualAvgMaxTemp = Number((b.tMaxSum / b.validTMaxDays).toFixed(1));
    const annualTotalPrecip = Number(b.precipSum.toFixed(1));
    const peakMaxTemp = b.peakTMax > -Infinity ? Number(b.peakTMax.toFixed(1)) : null;
    const peakPrecip = Number(b.peakPrecip.toFixed(1));
    const coveragePercent = Number(((b.validTMaxDays / b.calendarDays) * 100).toFixed(1));

    annualBreakdown.push({
      year,
      calendarDays: b.calendarDays,
      validDays: b.validTMaxDays,
      missingDays: Math.max(0, b.calendarDays - b.validTMaxDays),
      coveragePercent,
      isCompleteYear: b.validTMaxDays === b.calendarDays,
      annualAvgMaxTemp,
      annualTotalPrecip,
      peakMaxTemp,
      peakPrecip,
      tempUnit: tMaxUnit === 'C' ? '°C' : tMaxUnit,
      precipUnit: 'mm'
    });
  }

  if (annualBreakdown.length === 0) {
    throw new Error('NASA POWER response contained no valid daily observations for the target period');
  }

  // Multi-year summary metrics
  const multiYearAvgMaxTemp = Number((overallTMaxSum / totalValidTMaxDays).toFixed(1));
  const multiYearAvgAnnualPrecip = Number((overallPrecipSum / annualBreakdown.length).toFixed(1));
  const totalMissingDays = Math.max(0, totalCalendarDaysInCoverage - totalValidTMaxDays);
  const overallCoveragePercent = Number(((totalValidTMaxDays / totalCalendarDaysInCoverage) * 100).toFixed(1));

  // Determine whether this covers the full requested 2021-2025 window
  const includesYear2025 = presentYears.includes(2025);
  const isFullRequestedPeriod = presentYears.length === VARANASI_METADATA.requestedCalendarYears.length &&
    VARANASI_METADATA.requestedCalendarYears.every(y => presentYears.includes(y));

  return {
    metadata: {
      ...VARANASI_METADATA,
      actualStartDate,
      actualEndDate,
      actualDateRange: `${actualStartDate} to ${actualEndDate}`,
      calendarDaysCount: totalCalendarDaysInCoverage,
      validObservationsCount: totalValidTMaxDays,
      missingObservationsCount: totalMissingDays,
      coveragePercent: overallCoveragePercent,
      isFullRequestedPeriod,
      includesYear2025,
      tempUnit: tMaxUnit === 'C' ? '°C' : tMaxUnit,
      precipDailyUnit,
      precipAnnualUnit
    },
    summary: {
      multiYearAvgMaxTemp,
      multiYearAvgAnnualPrecip,
      highestRecordedTMax: Number(highestRecordedTMax.toFixed(1)),
      highestRecordedPrecip: Number(highestRecordedPrecip.toFixed(1)),
      startYear: actualStartYear,
      endYear: actualEndYear,
      yearsCoveredCount: annualBreakdown.length,
      requestedYearsCount: VARANASI_METADATA.requestedCalendarYears.length,
      coverageNotice: isFullRequestedPeriod
        ? `Complete 5-year coverage (${totalValidTMaxDays} of ${totalCalendarDaysInCoverage} days observed; ${overallCoveragePercent}% complete).`
        : `Partial coverage: ${annualBreakdown.length} of ${VARANASI_METADATA.requestedCalendarYears.length} requested years returned (${totalValidTMaxDays} daily records from ${actualStartDate} to ${actualEndDate}).`
    },
    annualBreakdown,
    attribution: {
      source: VARANASI_METADATA.sourceName,
      url: VARANASI_METADATA.sourceUrl,
      apiEndpoint: VARANASI_METADATA.apiUrl
    }
  };
}

/**
 * Loads cached NASA POWER climate observations from localStorage.
 * Automatically invalidates stale caches that do not include 2025.
 * @returns {Object|null}
 */
export function getCachedClimateData() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const item = window.localStorage.getItem(CACHE_STORAGE_KEY);
    if (!item) return null;
    const parsed = JSON.parse(item);
    if (!parsed || !parsed.timestamp || !parsed.data) return null;
    
    // Check TTL
    const age = Date.now() - parsed.timestamp;
    if (age > CACHE_TTL_MS) {
      window.localStorage.removeItem(CACHE_STORAGE_KEY);
      return null;
    }

    // Invalidate stale caches that only had 2021-2024 or stopped before 2025
    const cachedData = parsed.data;
    if (!cachedData?.metadata?.includesYear2025 || cachedData?.metadata?.validObservationsCount < 1800) {
      window.localStorage.removeItem(CACHE_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch (e) {
    console.warn('ClimateShield: Failed to read climate cache', e);
    return null;
  }
}

/**
 * Saves climate observation data to localStorage.
 * @param {Object} data 
 */
export function saveClimateDataToCache(data) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const payload = {
      timestamp: Date.now(),
      retrievedAt: new Date().toISOString(),
      data
    };
    window.localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('ClimateShield: Failed to write to climate cache', e);
  }
}

/**
 * Clears the local climate cache across all versions.
 */
export function clearClimateDataCache() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem('climateshield_nasa_power_varanasi_v1');
    window.localStorage.removeItem('climateshield_nasa_power_varanasi_v2');
    window.localStorage.removeItem(CACHE_STORAGE_KEY);
  } catch (e) {
    // Ignore
  }
}

/**
 * Fetches real historical climate data for Varanasi from NASA POWER API.
 * Uses browser fetch with a 15-second timeout and local caching.
 * 
 * @param {Object} options
 * @param {boolean} options.forceRefresh If true, bypasses the local cache
 * @returns {Promise<Object>} { data, isCached, retrievedAt, error }
 */
export async function fetchVaranasiClimateData({ forceRefresh = false } = {}) {
  // Purge any legacy caches
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('climateshield_nasa_power_varanasi_v1');
    window.localStorage.removeItem('climateshield_nasa_power_varanasi_v2');
  }

  // 1. Check local cache first unless forceRefresh is true
  if (!forceRefresh) {
    const cached = getCachedClimateData();
    if (cached) {
      return {
        data: cached.data,
        isCached: true,
        retrievedAt: cached.retrievedAt,
        error: null
      };
    }
  }

  // 2. Build NASA POWER request URL for Varanasi (20210101 to 20251231)
  const params = new URLSearchParams({
    parameters: 'T2M_MAX,PRECTOTCORR',
    community: 'RE',
    longitude: String(VARANASI_METADATA.longitude),
    latitude: String(VARANASI_METADATA.latitude),
    start: '20210101',
    end: '20251231',
    format: 'JSON'
  });

  const requestUrl = `${VARANASI_METADATA.apiUrl}?${params.toString()}`;

  // 3. Execute fetch with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(requestUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`NASA POWER API HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    const parsed = parseNasaPowerResponse(json);

    // Save to cache
    const retrievedAt = new Date().toISOString();
    saveClimateDataToCache(parsed);

    return {
      data: parsed,
      isCached: false,
      retrievedAt,
      error: null
    };
  } catch (err) {
    clearTimeout(timeoutId);
    let errorMessage = err.message || 'Unknown network error';
    if (err.name === 'AbortError') {
      errorMessage = 'NASA POWER API request timed out (15s limit exceeded).';
    }

    return {
      data: null,
      isCached: false,
      retrievedAt: null,
      error: errorMessage
    };
  }
}
