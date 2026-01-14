// =============================================================================
// ALPHATIC - CONFIGURATION CONSTANTS
// =============================================================================
// Centralized configuration for easy maintenance and testing
// =============================================================================

// =============================================================================
// MARKET REGIME DEFINITIONS
// =============================================================================

export const REGIME_DEFINITIONS = {
  goldilocks: {
    id: 'goldilocks',
    name: 'Goldilocks',
    description: 'Bull market + Low volatility + Low inflation + Risk-on',
    trend: 'Up',
    volatility: 'Low (VIX <15)',
    inflation: 'Low (<2.5%)',
    sentiment: 'Risk-On',
    indicators: 'S&P up 15%+, VIX <15, CPI <2.5%, credit spreads tight',
    color: 'green'
  },
  boom: {
    id: 'boom',
    name: 'Boom (Heating Up)',
    description: 'Bull market + Rising volatility + Rising inflation + Risk-on',
    trend: 'Up',
    volatility: 'Rising (VIX 15-25)',
    inflation: 'Rising (2.5-4%)',
    sentiment: 'Risk-On (cautious)',
    indicators: 'S&P up 10-20%, VIX 15-25, CPI rising, Fed tightening talk',
    color: 'yellow'
  },
  uncertainty: {
    id: 'uncertainty',
    name: 'Uncertainty',
    description: 'Sideways market + High volatility + Sticky inflation + Mixed sentiment',
    trend: 'Sideways',
    volatility: 'High (VIX 20-30)',
    inflation: 'Sticky (3-4%)',
    sentiment: 'Mixed/Uncertain',
    indicators: 'S&P ±5%, VIX >20, CPI stubborn, Fed policy unclear',
    color: 'orange'
  },
  grind: {
    id: 'grind',
    name: 'Sideways Grind',
    description: 'Range-bound + Low volatility + Stable inflation + Neutral',
    trend: 'Sideways',
    volatility: 'Low (VIX <18)',
    inflation: 'Stable (2-3%)',
    sentiment: 'Neutral',
    indicators: 'S&P range-bound, VIX <18, CPI stable, low volume',
    color: 'blue'
  },
  crisis: {
    id: 'crisis',
    name: 'Crisis',
    description: 'Bear market + High volatility + Risk-off + Flight to safety',
    trend: 'Down',
    volatility: 'High (VIX >30)',
    inflation: 'Variable',
    sentiment: 'Risk-Off',
    indicators: 'S&P down >10%, VIX >30, credit spreads widening, recession fears',
    color: 'red'
  }
};

// =============================================================================
// COLOR SCHEMES
// =============================================================================

export const COLORS = {
  core: '#2563eb',
  quality: '#7c3aed',
  value: '#059669',
  lowVol: '#0891b2',
  momentum: '#dc2626',
  bonds: '#f59e0b',
  gold: '#eab308',
  international: '#8b5cf6',
  alternatives: '#ec4899'
};

// =============================================================================
// PORTFOLIO CONSTRAINTS
// =============================================================================

export const PORTFOLIO_CONSTRAINTS = {
  MIN_AMOUNT: 0,
  MAX_AMOUNT: 100e9, // $100 billion
  MIN_ALLOCATION_PERCENT: 0,
  MAX_ALLOCATION_PERCENT: 100,
  ALLOCATION_TOLERANCE: 0.1, // 0.1% rounding tolerance
  MIN_ETFS: 1,
  MAX_ETFS: 50
};

// =============================================================================
// AGE & RETIREMENT CONSTRAINTS
// =============================================================================

export const AGE_CONSTRAINTS = {
  MIN_AGE: 18,
  MAX_AGE: 120,
  RMD_START_AGE: 73,
  QCD_START_AGE: 70.5,
  MEDICARE_AGE: 65,
  IRMAA_LOOKBACK_YEARS: 2
};

// =============================================================================
// TAX CONSTANTS
// =============================================================================

export const TAX_CONSTANTS = {
  // 2026 Federal Tax Brackets (MFJ)
  FEDERAL_BRACKETS: [
    { limit: 23200, rate: 0.10 },
    { limit: 94300, rate: 0.12 },
    { limit: 201050, rate: 0.22 },
    { limit: 383900, rate: 0.24 },
    { limit: 487450, rate: 0.32 },
    { limit: 731200, rate: 0.35 },
    { limit: Infinity, rate: 0.37 }
  ],
  
  // Long-Term Capital Gains (MFJ)
  LTCG_BRACKETS: [
    { limit: 94050, rate: 0.00 },
    { limit: 583750, rate: 0.15 },
    { limit: Infinity, rate: 0.20 }
  ],
  
  // NIIT (Net Investment Income Tax)
  NIIT_THRESHOLD: 250000,
  NIIT_RATE: 0.038,
  
  // IRMAA Thresholds (Medicare Part B & D surcharges)
  IRMAA_THRESHOLDS: [
    { limit: 206000, partB: 174.70, partD: 0 },
    { limit: 258000, partB: 244.60, partD: 12.90 },
    { limit: 322000, partB: 349.40, partD: 33.30 },
    { limit: 386000, partB: 454.20, partD: 70.00 },
    { limit: 750000, partB: 489.90, partD: 76.40 },
    { limit: Infinity, partB: 594.00, partD: 81.00 }
  ],
  
  // Standard Deduction
  STANDARD_DEDUCTION: 29200, // 2026 estimate MFJ
  STANDARD_DEDUCTION_SENIOR: 32200, // Age 65+ MFJ
  
  // Social Security Taxability
  SS_TAXABLE_PERCENT: 0.85,
  
  // QCD Limits
  QCD_MAX_ANNUAL: 105000,
  
  // Roth Conversion
  ROTH_CONVERSION_MAX: Infinity // No statutory limit
};

// =============================================================================
// RMD LIFE EXPECTANCY FACTORS
// =============================================================================

export const RMD_FACTORS = {
  73: 26.5,
  74: 25.5,
  75: 24.6,
  76: 23.7,
  77: 22.9,
  78: 22.0,
  79: 21.1,
  80: 20.2,
  81: 19.4,
  82: 18.5,
  83: 17.7,
  84: 16.8,
  85: 16.0,
  86: 15.2,
  87: 14.4,
  88: 13.7,
  89: 12.9,
  90: 12.2
};

// =============================================================================
// PROJECTION DEFAULTS
// =============================================================================

export const PROJECTION_DEFAULTS = {
  STARTING_AGE: 60,
  ENDING_AGE: 90,
  PROJECTION_YEARS: 30,
  LIVING_EXPENSES: 150000,
  DIVIDEND_YIELD: 0.025,
  EXPECTED_GROWTH_RATE: 0.07,
  CONSERVATIVE_BUFFER: 1.2, // 20% safety margin
  SOCIAL_SECURITY_AMOUNT: 55000,
  STATE_TAX_RATE: 0.05,
  CONVERSION_AMOUNT: 250000,
  FRONT_LOAD_CONVERSIONS: false,
  CONTINUE_AFTER_RMD: false
};

// =============================================================================
// RISK TOLERANCE LEVELS
// =============================================================================

export const RISK_TOLERANCE = {
  CONSERVATIVE: {
    id: 'conservative',
    label: 'Conservative',
    equityPercent: 60,
    volatilityTarget: 8,
    description: 'Lower risk, stable returns'
  },
  MODERATE: {
    id: 'moderate',
    label: 'Moderate',
    equityPercent: 75,
    volatilityTarget: 12,
    description: 'Balanced growth and stability'
  },
  AGGRESSIVE: {
    id: 'aggressive',
    label: 'Aggressive',
    equityPercent: 90,
    volatilityTarget: 18,
    description: 'Higher risk, higher returns'
  }
};

// =============================================================================
// REBALANCING FREQUENCIES
// =============================================================================

export const REBALANCING_FREQUENCIES = {
  MONTHLY: { id: 'monthly', label: 'Monthly', days: 30 },
  QUARTERLY: { id: 'quarterly', label: 'Quarterly', days: 90 },
  SEMIANNUAL: { id: 'semiannual', label: 'Semi-Annual', days: 180 },
  ANNUAL: { id: 'annual', label: 'Annual', days: 365 }
};

// =============================================================================
// CALCULATION PRECISION
// =============================================================================

export const CALCULATION_PRECISION = {
  AMOUNT: 0, // Round to nearest dollar
  PERCENTAGE: 2, // 2 decimal places
  RATE: 4, // 4 decimal places for rates
  ALLOCATION: 2 // 2 decimal places for allocation %
};

// =============================================================================
// PERFORMANCE METRICS
// =============================================================================

export const BENCHMARK_RETURNS = {
  SP500_HISTORICAL: 0.105, // 10.5% historical
  BONDS_HISTORICAL: 0.05, // 5% historical
  GOLD_HISTORICAL: 0.08, // 8% historical
  INFLATION_HISTORICAL: 0.03, // 3% historical
  RISK_FREE_RATE: 0.045 // Current T-Bill rate
};

// =============================================================================
// UI CONSTANTS
// =============================================================================

export const UI_CONSTANTS = {
  DEBOUNCE_MS: 300, // Input debounce delay
  ANIMATION_MS: 200, // UI animation duration
  TOAST_DURATION_MS: 5000, // Notification duration
  MAX_CHART_POINTS: 1000, // Max data points in charts
  MOBILE_BREAKPOINT: 768 // px
};

// =============================================================================
// ERROR MESSAGES
// =============================================================================

export const ERROR_MESSAGES = {
  INVALID_AMOUNT: 'Please enter a valid amount',
  INVALID_PERCENTAGE: 'Percentage must be between 0 and 100',
  PORTFOLIO_NOT_100: 'Portfolio allocation must sum to 100%',
  CONVERSION_EXCEEDS_IRA: 'Conversion amount cannot exceed IRA balance',
  NEGATIVE_VALUE: 'Value cannot be negative',
  CALCULATION_ERROR: 'Error performing calculation',
  NETWORK_ERROR: 'Network error occurred',
  UNKNOWN_ERROR: 'An unexpected error occurred'
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  REGIME_DEFINITIONS,
  COLORS,
  PORTFOLIO_CONSTRAINTS,
  AGE_CONSTRAINTS,
  TAX_CONSTANTS,
  RMD_FACTORS,
  PROJECTION_DEFAULTS,
  RISK_TOLERANCE,
  REBALANCING_FREQUENCIES,
  CALCULATION_PRECISION,
  BENCHMARK_RETURNS,
  UI_CONSTANTS,
  ERROR_MESSAGES
};
