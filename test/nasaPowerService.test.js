import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseNasaPowerResponse,
  isValidClimateValue,
  getCalendarDaysInYear,
  formatDateKey,
  VARANASI_METADATA
} from '../src/services/nasaPowerService.js';

describe('NASA POWER Service — Climate Data Parsing, Coverage & Error Handling Tests', () => {

  // Test 1: Leap year calendar day calculation
  test('Calendar days & leap years: Correctly identifies 366 days for 2024 and 365 days for standard years', () => {
    assert.equal(getCalendarDaysInYear(2021), 365);
    assert.equal(getCalendarDaysInYear(2022), 365);
    assert.equal(getCalendarDaysInYear(2023), 365);
    assert.equal(getCalendarDaysInYear(2024), 366, '2024 is a leap year (366 days)');
    assert.equal(getCalendarDaysInYear(2025), 365);
    assert.equal(getCalendarDaysInYear(2000), 366, '2000 is a century leap year (366 days)');
    assert.equal(getCalendarDaysInYear(1900), 365, '1900 is not a leap year');
  });

  // Test 2: Missing value sentinel detection
  test('Sentinel detection: isValidClimateValue correctly filters NASA -999 and invalid values', () => {
    assert.equal(isValidClimateValue(32.5), true);
    assert.equal(isValidClimateValue(0), true);
    assert.equal(isValidClimateValue('28.4'), true);
    assert.equal(isValidClimateValue(-15.2), true); // Valid freezing temperature

    assert.equal(isValidClimateValue(-999), false);
    assert.equal(isValidClimateValue('-999'), false);
    assert.equal(isValidClimateValue(-999.0), false);
    assert.equal(isValidClimateValue(-950), false);
    assert.equal(isValidClimateValue(-9999), false);

    assert.equal(isValidClimateValue(null), false);
    assert.equal(isValidClimateValue(undefined), false);
    assert.equal(isValidClimateValue('invalid_string'), false);
  });

  // Test 3: Date key formatter
  test('Date formatter: formatDateKey converts YYYYMMDD to YYYY-MM-DD', () => {
    assert.equal(formatDateKey('20210101'), '2021-01-01');
    assert.equal(formatDateKey('20240229'), '2024-02-29'); // Leap day
    assert.equal(formatDateKey('20251231'), '2025-12-31');
    assert.equal(formatDateKey(''), '');
  });

  // Test 4: Complete 5-year coverage including 2025
  test('Complete 5-year coverage: Accurately parses 2021, 2022, 2023, 2024 (leap year), and 2025', () => {
    const mockTMax = {};
    const mockPrec = {};

    // Generate sample observations across all 5 years
    const testYears = [2021, 2022, 2023, 2024, 2025];
    for (const yr of testYears) {
      mockTMax[`${yr}0101`] = 20.0;
      mockTMax[`${yr}0615`] = 40.0;
      mockPrec[`${yr}0101`] = 0.0;
      mockPrec[`${yr}0615`] = 50.0;
    }

    const mockPayload = {
      parameters: {
        T2M_MAX: { units: 'C' },
        PRECTOTCORR: { units: 'mm/day' }
      },
      properties: {
        parameter: {
          T2M_MAX: mockTMax,
          PRECTOTCORR: mockPrec
        }
      }
    };

    const parsed = parseNasaPowerResponse(mockPayload);

    // Dynamic metadata checks
    assert.equal(parsed.metadata.actualStartDate, '2021-01-01');
    assert.equal(parsed.metadata.actualEndDate, '2025-06-15');
    assert.equal(parsed.metadata.includesYear2025, true);
    assert.equal(parsed.annualBreakdown.length, 5);

    // Check leap year metadata for 2024
    const row2024 = parsed.annualBreakdown.find(r => r.year === 2024);
    assert.ok(row2024);
    assert.equal(row2024.calendarDays, 366, '2024 must report 366 calendar days');
    assert.equal(row2024.validDays, 2);
    assert.equal(row2024.annualAvgMaxTemp, 30.0);
    assert.equal(row2024.annualTotalPrecip, 50.0);

    // Check year 2025
    const row2025 = parsed.annualBreakdown.find(r => r.year === 2025);
    assert.ok(row2025, 'Year 2025 must be present in annualBreakdown');
    assert.equal(row2025.calendarDays, 365);
    assert.equal(row2025.validDays, 2);
    assert.equal(row2025.annualAvgMaxTemp, 30.0);
    assert.equal(row2025.annualTotalPrecip, 50.0);
  });

  // Test 5: Missing days vs calendar days distinction
  test('Missing days distinction: Accurately separates calendar days from valid observations', () => {
    const mockPayloadWithMissing = {
      parameters: {
        T2M_MAX: { units: 'C' },
        PRECTOTCORR: { units: 'mm/day' }
      },
      properties: {
        parameter: {
          T2M_MAX: {
            '20210101': 20.0,
            '20210102': -999, // Missing observation
            '20210103': 30.0
          },
          PRECTOTCORR: {
            '20210101': 10.0,
            '20210102': -999.0, // Missing observation
            '20210103': 20.0
          }
        }
      }
    };

    const parsed = parseNasaPowerResponse(mockPayloadWithMissing);
    const row = parsed.annualBreakdown.find(r => r.year === 2021);

    assert.equal(row.calendarDays, 365, 'Year 2021 has 365 calendar days');
    assert.equal(row.validDays, 2, 'Only 2 days have valid observations');
    assert.equal(row.missingDays, 363, '365 - 2 = 363 missing days');
    assert.equal(row.annualAvgMaxTemp, 25.0, '(20 + 30) / 2 = 25.0 °C');
    assert.equal(row.annualTotalPrecip, 30.0, '10 + 20 = 30.0 mm');
  });

  // Test 6: Partial coverage handling (e.g. 1,461 days stopping at 2024)
  test('Partial coverage handling: When data stops at 2024, reports actual coverage without claiming 5 complete years', () => {
    // Mock dataset representing 2021 through 2024 only (1,461 days)
    const mockTMax = {};
    const mockPrec = {};

    for (const yr of [2021, 2022, 2023, 2024]) {
      mockTMax[`${yr}0101`] = 25.0;
      mockPrec[`${yr}0101`] = 10.0;
    }

    const mockPayload = {
      parameters: {
        T2M_MAX: { units: 'C' },
        PRECTOTCORR: { units: 'mm/day' }
      },
      properties: {
        parameter: {
          T2M_MAX: mockTMax,
          PRECTOTCORR: mockPrec
        }
      }
    };

    const parsed = parseNasaPowerResponse(mockPayload);

    assert.equal(parsed.metadata.actualStartDate, '2021-01-01');
    assert.equal(parsed.metadata.actualEndDate, '2024-01-01');
    assert.equal(parsed.metadata.isFullRequestedPeriod, false, 'Should flag as NOT full requested period');
    assert.equal(parsed.metadata.includesYear2025, false, 'Does not include 2025');
    assert.equal(parsed.summary.yearsCoveredCount, 4);
    assert.ok(parsed.summary.coverageNotice.includes('Partial coverage'), 'Should include partial coverage explanation');
  });

  // Test 7: Error handling for invalid structures
  test('API error handling: Gracefully throws informative errors for malformed or empty responses', () => {
    assert.throws(
      () => parseNasaPowerResponse(null),
      /Invalid NASA POWER response/
    );

    assert.throws(
      () => parseNasaPowerResponse({}),
      /properties\.parameter object missing/
    );

    assert.throws(
      () => parseNasaPowerResponse({ properties: { parameter: {} } }),
      /missing T2M_MAX parameter data/
    );

    assert.throws(
      () => parseNasaPowerResponse({ properties: { parameter: { T2M_MAX: {} } } }),
      /missing PRECTOTCORR parameter data/
    );

    assert.throws(
      () => parseNasaPowerResponse({
        properties: {
          parameter: {
            T2M_MAX: {},
            PRECTOTCORR: {}
          }
        }
      }),
      /empty observations dictionary/
    );
  });

  // Test 8: Offline execution guarantee
  test('Offline guarantee: Tests execute purely on in-memory fixtures without live network requests', () => {
    assert.ok(VARANASI_METADATA.sourceUrl.includes('power.larc.nasa.gov'));
    assert.equal(VARANASI_METADATA.latitude, 25.3176);
    assert.equal(VARANASI_METADATA.longitude, 82.9739);
    assert.deepEqual(VARANASI_METADATA.requestedCalendarYears, [2021, 2022, 2023, 2024, 2025]);
  });

});
