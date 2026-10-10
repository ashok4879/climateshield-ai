# ClimateShield AI — Urban Climate Risk Prioritization Engine

> **Hackathon Entry:** Environmental Hacks  
> **Milestone:** Frontend MVP, Deterministic Scoring Engine & Pilot City Real Climate Observations (NASA POWER)

ClimateShield AI is a decision-support dashboard designed for municipal sustainability officers and campus planners. It models and prioritizes urban heat and water interventions under strict fiscal constraints, featuring an equity-prioritization toggle that isolates algorithmic selection weighting from physical impact measurements, and connects to real historical climate observations from NASA POWER for pilot city Varanasi, India.

---

## 📌 Core Features

1. **Pilot City Real Climate Data (NASA POWER Open Data):**
   - **Location:** Varanasi, Uttar Pradesh, India (25.3176° N, 82.9739° E).
   - **Data Parameters:** Daily Maximum Air Temperature (`T2M_MAX`, °C) and Precipitation Corrected (`PRECTOTCORR`, mm/day).
   - **Temporal Scope:** 5 latest complete calendar years (2021–2025; 1,826 daily satellite & reanalysis records).
   - **Resolution Notice:** Clearly indicates that NASA POWER provides regional gridded reanalysis (0.5° × 0.625°, ~50 km), providing macro-climatic context rather than micro-urban neighborhood scores.
   - **Offline / Error Resilient:** Features loading states, network error handling, client-side caching (`localStorage` with 24-hr TTL), and strict zero-fabrication fallback policies.

2. **4 Illustrative Urban Zones (Synthetic Demo Model):**
   - **North Campus:** Academic & Institutional quad (Baseline: 62 Heat, 38 Water, 0.35 Vulnerability)
   - **Market District:** Dense commercial core (Baseline: 88 Heat, 65 Water, 0.55 Vulnerability)
   - **River Ward:** Riparian & flood-prone corridor (Baseline: 54 Heat, 92 Water, 0.80 Vulnerability)
   - **South Housing:** Underserved high-density residential (Baseline: 79 Heat, 74 Water, 0.92 Vulnerability)
   - *Labeled clearly as synthetic and illustrative pending hyper-local sensor / GIS layer integration.*

3. **Deterministic Scoring & Optimization Engine:**
   - Pure, stateless JavaScript engine (`src/utils/climateEngine.js`) guaranteeing `totalCost <= budget`.
   - Capping rules enforce that post-intervention risk scores remain between `0` and `100`, never below zero.
   - Guaranteed exact identity: `Baseline Risk - Post Risk === Effective Mitigation`.
   - Combined unweighted mitigation equals heat mitigation plus water mitigation (1:1 equal weight parity).

4. **Dynamic Budget Slider & Infeasibility Enforcer:**
   - Budget slider range: $100K to $1.4M with standardized USD formatting (`$100,000` to `$1,400,000`).
   - Clear distinction between **Algorithmic Recommendations** (always feasible) and **Manual Draft Scenarios**.
   - Over-budget manual draft portfolios are clearly flagged with high-visibility alerts showing exact deficit and an unmistakable **"Restore Recommended Plan"** action.

5. **Equity-Prioritization Isolation Rule:**
   - When toggled, interventions targeting high-vulnerability communities receive priority allocation weighting.
   - **Zero Environmental Inflation:** Modeled physical risk reduction points always reflect actual mitigation impact and are never multiplied by equity factors.

6. **Comprehensive Automated Test Suite:**
   - 13 automated tests covering budget bounds, zero budget, deficit tracking, metric identities, risk clamping, equity isolation, currency formatting, and NASA POWER parsing/missing values.

---

## 🛠 Project Structure

```
climateshield-ai/
├── src/
│   ├── components/
│   │   ├── AreaRiskGrid.jsx              # Zone risk cards with baseline vs post comparisons
│   │   ├── BudgetControls.jsx            # Budget slider, presets, plan status, and equity switch
│   │   ├── ClimateObservationPanel.jsx   # Real NASA POWER observations for Varanasi, India
│   │   ├── DisclaimerBanner.jsx          # Synthetic data & 1:1 assumption notices
│   │   ├── Header.jsx                    # Navigation, branding & methodology trigger
│   │   ├── InterventionCatalog.jsx       # Filterable 10-measure catalog & selection cards
│   │   ├── MethodologyModal.jsx          # Mathematical rules & future roadmap modal
│   │   └── MetricCards.jsx               # Modeled reduction & budget KPI summary cards
│   ├── data/
│   │   └── catalog.js                    # Synthetic zone profiles and intervention catalog
│   ├── services/
│   │   └── nasaPowerService.js           # NASA POWER daily point API integration & cache
│   ├── utils/
│   │   └── climateEngine.js              # Pure, reusable, deterministic scoring engine
│   ├── App.jsx                           # Root application coordinator
│   ├── index.css                         # Tailwind CSS directives
│   └── main.jsx                          # Vite React entry point
├── test/
│   ├── climateEngine.test.js             # Engine, budget, risk cap & equity test suite
│   └── nasaPowerService.test.js          # NASA POWER parsing, missing values & error tests
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🚀 How to Run the Application

### 1. Run the test suite
```bash
npm test
```
*Executes all 13 unit, regression, and offline API parsing tests.*

### 2. Start the local development server
```bash
npm run dev
```
*Access the dashboard at `http://localhost:5173/`.*

### 3. Build for production
```bash
npm run build
```
