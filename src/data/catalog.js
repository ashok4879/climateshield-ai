/**
 * Synthetic climate risk and intervention catalog.
 * 
 * DISCLAIMER:
 * All data in this catalog is synthetic and illustrative for demonstration purposes.
 * It does NOT represent verified local environmental or meteorological measurements.
 */

export const DEMO_DATA_DISCLAIMER = "SYNTHETIC DEMO DATA: All scores, costs, and effectiveness values are illustrative and simulated for demonstration purposes. They do not reflect verified local municipal measurements.";

export const SIMPLIFYING_ASSUMPTION_NOTE = "SIMPLIFYING ASSUMPTION: The combined score calculates total net risk reduction by weighting 1 heat-risk point and 1 water-risk point equally (1:1 ratio). In production municipal planning, cross-domain weighting requires stakeholder multi-criteria decision analysis.";

export const AREAS = [
  {
    id: 'north-campus',
    name: 'North Campus',
    type: 'Academic & Institutional',
    population: 14500,
    baselineHeatRisk: 62,
    baselineWaterRisk: 38,
    vulnerabilityIndex: 0.35, // Scale 0-1 (socio-economic adaptive vulnerability factor)
    description: 'Expansive parking lots and academic quads; moderate tree canopy; moderate storm runoff.'
  },
  {
    id: 'market-district',
    name: 'Market District',
    type: 'Commercial Core',
    population: 28000,
    baselineHeatRisk: 88,
    baselineWaterRisk: 65,
    vulnerabilityIndex: 0.55,
    description: 'High thermal mass commercial buildings, dense pedestrian traffic, severe heat island effect.'
  },
  {
    id: 'river-ward',
    name: 'River Ward',
    type: 'Riparian & Light Industrial',
    population: 19200,
    baselineHeatRisk: 54,
    baselineWaterRisk: 92,
    vulnerabilityIndex: 0.80,
    description: 'Low-elevation floodplain zone, aging culvert capacity, high localized inundation frequency.'
  },
  {
    id: 'south-housing',
    name: 'South Housing',
    type: 'High-Density Residential',
    population: 34500,
    baselineHeatRisk: 79,
    baselineWaterRisk: 74,
    vulnerabilityIndex: 0.92,
    description: 'High residential density, minimal tree cover, limited AC access, historically underserved infrastructure.'
  }
];

export const INTERVENTIONS = [
  {
    id: 'int-1',
    name: 'Reflective Cool Roof Retrofit',
    areaId: 'market-district',
    category: 'heat',
    cost: 110000,
    heatReduction: 18,
    waterReduction: 0,
    timeToImplement: '6 months',
    description: 'High-albedo reflective membrane installations on flat commercial rooftops to reduce solar radiation absorption.'
  },
  {
    id: 'int-2',
    name: 'Civic Urban Canopy & Bioswales',
    areaId: 'south-housing',
    category: 'both',
    cost: 160000,
    heatReduction: 21,
    waterReduction: 15,
    timeToImplement: '12 months',
    description: 'Native shade tree plantings paired with engineered roadside bioretention cells to mitigate runoff and surface heat.'
  },
  {
    id: 'int-3',
    name: 'Permeable Paving & Sump Basins',
    areaId: 'river-ward',
    category: 'water',
    cost: 175000,
    heatReduction: 2,
    waterReduction: 26,
    timeToImplement: '8 months',
    description: 'Porous asphalt and gravel storage beds along low-lying industrial accessways to capture flash rainfall.'
  },
  {
    id: 'int-4',
    name: 'Solar Shading & Misting Canopies',
    areaId: 'north-campus',
    category: 'heat',
    cost: 75000,
    heatReduction: 14,
    waterReduction: 0,
    timeToImplement: '4 months',
    description: 'Active shade structures with evaporative high-pressure mist nozzles along high-traffic pedestrian quads.'
  },
  {
    id: 'int-5',
    name: 'Riparian Wetland Retention Park',
    areaId: 'river-ward',
    category: 'water',
    cost: 260000,
    heatReduction: 6,
    waterReduction: 35,
    timeToImplement: '18 months',
    description: 'Restoration of 4 acres of natural flood-attenuating wetlands along river embankment to absorb peak surge.'
  },
  {
    id: 'int-6',
    name: 'Micro-Forests & Pocket Parks',
    areaId: 'south-housing',
    category: 'both',
    cost: 210000,
    heatReduction: 24,
    waterReduction: 18,
    timeToImplement: '14 months',
    description: 'Dense Miyawaki micro-forest plots providing intensive local cooling nodes and groundwater infiltration.'
  },
  {
    id: 'int-7',
    name: 'Subterranean Stormwater Cistern',
    areaId: 'market-district',
    category: 'water',
    cost: 195000,
    heatReduction: 0,
    waterReduction: 28,
    timeToImplement: '12 months',
    description: 'Underground holding tank beneath central plaza to attenuate peak 50-year stormwater surge.'
  },
  {
    id: 'int-8',
    name: 'Cool Pavement Treatment',
    areaId: 'north-campus',
    category: 'heat',
    cost: 85000,
    heatReduction: 12,
    waterReduction: 2,
    timeToImplement: '3 months',
    description: 'Solar-reflective topcoat applied to primary surface parking lots and connector roadways.'
  },
  {
    id: 'int-9',
    name: 'Community Cooling Resilience Hub',
    areaId: 'south-housing',
    category: 'heat',
    cost: 130000,
    heatReduction: 25,
    waterReduction: 0,
    timeToImplement: '6 months',
    description: 'High-efficiency thermal shelter with solar backup battery storage for heat emergency relief.'
  },
  {
    id: 'int-10',
    name: 'Tidal Flap Gates & Smart Backflow Valves',
    areaId: 'river-ward',
    category: 'water',
    cost: 120000,
    heatReduction: 0,
    waterReduction: 22,
    timeToImplement: '5 months',
    description: 'Automated mechanical backflow restrictors on river discharge outfalls to stop back-flooding during surges.'
  }
];
