// =============================================================================
// ALPHATIC - TAX & FINANCIAL CONSTANTS
// =============================================================================
// All tax brackets, thresholds, and financial constants in one place
// Easy to update annually as tax laws change
// =============================================================================

// =============================================================================
// FEDERAL TAX BRACKETS (2026 - Single Filer)
// =============================================================================
export const FEDERAL_TAX_BRACKETS_2026 = [
  { limit: 11600, rate: 0.10 },
  { limit: 47150, rate: 0.12 },
  { limit: 100525, rate: 0.22 },
  { limit: 191950, rate: 0.24 },
  { limit: 243725, rate: 0.32 },
  { limit: 609350, rate: 0.35 },
  { limit: Infinity, rate: 0.37 }
];

// =============================================================================
// STANDARD DEDUCTIONS (2026)
// =============================================================================
export const STANDARD_DEDUCTION_2026 = {
  under65: 14600,
  over65: 16550,
  married_under65: 29200,
  married_over65: 32200
};

// =============================================================================
// RMD DIVISORS (SECURE Act 2.0 - 2022 Updated Table)
// =============================================================================
// Required Minimum Distribution rates by age
// Source: IRS Publication 590-B (2024)
export const RMD_RATES = {
  73: 0.0377, // Age 73 = 26.5 divisor → 3.77%
  74: 0.0392, // Age 74 = 25.5 divisor → 3.92%
  75: 0.0407, // Age 75 = 24.6 divisor → 4.07%
  76: 0.0422, // Age 76 = 23.7 divisor → 4.22%
  77: 0.0437, // Age 77 = 22.9 divisor → 4.37%
  78: 0.0453, // Age 78 = 22.0 divisor → 4.53%
  79: 0.0470, // Age 79 = 21.1 divisor → 4.70%
  80: 0.0495, // Age 80 = 20.2 divisor → 4.95%
  81: 0.0515, // Age 81 = 19.4 divisor → 5.15%
  82: 0.0535, // Age 82 = 18.7 divisor → 5.35%
  83: 0.0556, // Age 83 = 18.0 divisor → 5.56%
  84: 0.0578, // Age 84 = 17.3 divisor → 5.78%
  85: 0.0600  // Age 85+ = ~16.7 divisor → ~6.00%
};

// First year RMD age (changed by SECURE 2.0)
export const RMD_START_AGE = 73; // Was 72, now 73 for those born 1951-1959

// =============================================================================
// IRMAA THRESHOLDS (Medicare Part B & D Surcharges)
// =============================================================================
// Income-Related Monthly Adjustment Amount for Medicare premiums
// Based on Modified Adjusted Gross Income (MAGI) from 2 years prior
// 2026 estimates (indexed for inflation)

export const IRMAA_THRESHOLDS_SINGLE = [
  { limit: 106000, surcharge: 0, description: 'Base premium' },
  { limit: 133000, surcharge: 1400, description: 'Tier 1' },
  { limit: 167000, surcharge: 3500, description: 'Tier 2' },
  { limit: 200000, surcharge: 5600, description: 'Tier 3' },
  { limit: 500000, surcharge: 7700, description: 'Tier 4' },
  { limit: Infinity, surcharge: 8500, description: 'Tier 5 (max)' }
];

export const IRMAA_THRESHOLDS_MARRIED = [
  { limit: 212000, surcharge: 0, description: 'Base premium' },
  { limit: 266000, surcharge: 1400, description: 'Tier 1' },
  { limit: 334000, surcharge: 3500, description: 'Tier 2' },
  { limit: 400000, surcharge: 5600, description: 'Tier 3' },
  { limit: 750000, surcharge: 7700, description: 'Tier 4' },
  { limit: Infinity, surcharge: 8500, description: 'Tier 5 (max)' }
];

// Helper function to get IRMAA surcharge
export const getIRMAASurcharge = (magi, isMarried = false) => {
  const thresholds = isMarried ? IRMAA_THRESHOLDS_MARRIED : IRMAA_THRESHOLDS_SINGLE;
  
  for (const threshold of thresholds) {
    if (magi <= threshold.limit) {
      return threshold.surcharge;
    }
  }
  
  return thresholds[thresholds.length - 1].surcharge;
};

// =============================================================================
// CAPITAL GAINS TAX RATES (2026)
// =============================================================================
export const LONG_TERM_CAP_GAINS_BRACKETS = [
  { limit: 47025, rate: 0.00 }, // 0% bracket
  { limit: 518900, rate: 0.15 }, // 15% bracket
  { limit: Infinity, rate: 0.20 }  // 20% bracket
];

export const SHORT_TERM_CAP_GAINS_RATE = 'ordinary_income'; // Taxed as ordinary income

// Net Investment Income Tax (NIIT) - 3.8% Medicare surtax
export const NIIT_THRESHOLD_SINGLE = 200000;
export const NIIT_THRESHOLD_MARRIED = 250000;
export const NIIT_RATE = 0.038;

// =============================================================================
// QUALIFIED CHARITABLE DISTRIBUTION (QCD)
// =============================================================================
export const QCD_ANNUAL_LIMIT = 105000; // 2024+ (indexed for inflation)
export const QCD_MINIMUM_AGE = 70.5; // Must be 70½ or older

// =============================================================================
// RETIREMENT CONTRIBUTION LIMITS (2026 estimates)
// =============================================================================
export const CONTRIBUTION_LIMITS = {
  // 401(k) / 403(b) / 457
  traditional_401k: 23500,
  traditional_401k_catchup: 7500, // Age 50+
  traditional_401k_total_age50: 31000, // 23500 + 7500
  
  // IRA limits
  traditional_ira: 7000,
  traditional_ira_catchup: 1000, // Age 50+
  traditional_ira_total_age50: 8000, // 7000 + 1000
  
  // Roth IRA (same limits as traditional)
  roth_ira: 7000,
  roth_ira_catchup: 1000,
  roth_ira_total_age50: 8000,
  
  // HSA (Health Savings Account)
  hsa_individual: 4150,
  hsa_family: 8300,
  hsa_catchup: 1000, // Age 55+
  
  // SEP-IRA (self-employed)
  sep_ira_percentage: 0.25, // 25% of compensation
  sep_ira_max: 69000,
  
  // Simple IRA
  simple_ira: 16000,
  simple_ira_catchup: 3500
};

// =============================================================================
// ROTH CONVERSION INCOME LIMITS (2026 estimates)
// =============================================================================
// Note: There are NO income limits for Roth CONVERSIONS
// Income limits only apply to Roth CONTRIBUTIONS
export const ROTH_CONTRIBUTION_INCOME_LIMITS_SINGLE = {
  phase_out_start: 146000,
  phase_out_end: 161000
};

export const ROTH_CONTRIBUTION_INCOME_LIMITS_MARRIED = {
  phase_out_start: 230000,
  phase_out_end: 240000
};

// =============================================================================
// ESTATE & GIFT TAX (2026 estimates)
// =============================================================================
export const ESTATE_TAX_EXEMPTION = 13610000; // $13.61M (2024, will sunset to ~$7M in 2026)
export const ANNUAL_GIFT_EXCLUSION = 18000; // Per person, per year (2024)
export const ESTATE_TAX_RATE = 0.40; // 40% on amounts above exemption

// =============================================================================
// SOCIAL SECURITY (2026 estimates)
// =============================================================================
export const SS_WAGE_BASE = 168600; // Maximum taxable earnings
export const SS_TAX_RATE_EMPLOYEE = 0.062; // 6.2%
export const SS_TAX_RATE_EMPLOYER = 0.062; // 6.2%
export const SS_TAX_RATE_SELF_EMPLOYED = 0.124; // 12.4%

export const MEDICARE_TAX_RATE = 0.0145; // 1.45%
export const MEDICARE_SURTAX_RATE = 0.009; // Additional 0.9% above threshold
export const MEDICARE_SURTAX_THRESHOLD_SINGLE = 200000;
export const MEDICARE_SURTAX_THRESHOLD_MARRIED = 250000;

// =============================================================================
// SAFE HARBOR RULES (Tax Planning)
// =============================================================================
// Safe harbor to avoid underpayment penalties
export const SAFE_HARBOR_PERCENTAGE_CURRENT = 0.90; // 90% of current year tax
export const SAFE_HARBOR_PERCENTAGE_PRIOR = 1.00; // 100% of prior year tax
export const SAFE_HARBOR_PERCENTAGE_PRIOR_HIGH_INCOME = 1.10; // 110% if AGI > $150K

// =============================================================================
// INVESTMENT CONSTANTS
// =============================================================================
export const RISK_FREE_RATE = 0.045; // 4.5% (approximate 10-year Treasury)
export const INFLATION_TARGET = 0.02; // Fed's 2% target
export const EXPECTED_MARKET_RETURN = 0.10; // Long-term S&P 500 ~10%

// =============================================================================
// TAX LOSS HARVESTING RULES
// =============================================================================
export const WASH_SALE_DAYS = 30; // 30 days before/after = 61 day window
export const SHORT_TERM_HOLDING_PERIOD = 365; // Days for long-term cap gains

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate federal income tax using marginal brackets
 * @param {number} taxableIncome - Income after deductions
 * @returns {number} - Total federal tax owed
 */
export const calculateFederalTax = (taxableIncome) => {
  let tax = 0;
  let previousLimit = 0;
  
  for (const bracket of FEDERAL_TAX_BRACKETS_2026) {
    if (taxableIncome > previousLimit) {
      const taxableInBracket = Math.min(
        taxableIncome - previousLimit,
        bracket.limit - previousLimit
      );
      tax += taxableInBracket * bracket.rate;
      previousLimit = bracket.limit;
    }
    if (taxableIncome <= bracket.limit) break;
  }
  
  return tax;
};

/**
 * Get standard deduction based on age and filing status
 * @param {number} age - Taxpayer's age
 * @param {boolean} isMarried - Filing married jointly?
 * @returns {number} - Standard deduction amount
 */
export const getStandardDeduction = (age, isMarried = false) => {
  if (isMarried) {
    return age >= 65 ? STANDARD_DEDUCTION_2026.married_over65 : STANDARD_DEDUCTION_2026.married_under65;
  }
  return age >= 65 ? STANDARD_DEDUCTION_2026.over65 : STANDARD_DEDUCTION_2026.under65;
};

/**
 * Calculate RMD amount for given age and IRA balance
 * @param {number} age - Current age
 * @param {number} iraBalance - IRA balance on Dec 31 of prior year
 * @returns {number} - Required minimum distribution amount
 */
export const calculateRMD = (age, iraBalance) => {
  if (age < RMD_START_AGE) return 0;
  
  const rate = RMD_RATES[age] || RMD_RATES[85]; // Use age 85 rate for older ages
  return iraBalance * rate;
};

/**
 * Calculate effective tax rate
 * @param {number} totalTax - Total tax paid
 * @param {number} totalIncome - Total income
 * @returns {number} - Effective tax rate (0-1)
 */
export const calculateEffectiveTaxRate = (totalTax, totalIncome) => {
  return totalIncome > 0 ? totalTax / totalIncome : 0;
};

/**
 * Calculate marginal tax rate at a given income level
 * @param {number} taxableIncome - Current taxable income
 * @returns {number} - Marginal tax rate (0-1)
 */
export const getMarginalTaxRate = (taxableIncome) => {
  for (const bracket of FEDERAL_TAX_BRACKETS_2026) {
    if (taxableIncome <= bracket.limit) {
      return bracket.rate;
    }
  }
  return FEDERAL_TAX_BRACKETS_2026[FEDERAL_TAX_BRACKETS_2026.length - 1].rate;
};

// =============================================================================
// ALIASES FOR BACKWARD COMPATIBILITY
// =============================================================================
/**
 * Aliases for components that use old naming conventions
 * Create structured objects that match expected format
 */

// Convert array structure to object with married/single properties
// Components expect: TAX_BRACKETS_2024.married[rate] = threshold
const createTaxBracketObject = (brackets) => {
  const obj = {};
  brackets.forEach(({ limit, rate }) => {
    obj[rate.toString()] = limit;
  });
  return obj;
};

export const TAX_BRACKETS_2024 = {
  single: createTaxBracketObject(FEDERAL_TAX_BRACKETS_2026),
  married: {
    // Married filing jointly brackets (approximately double single thresholds)
    '0.10': 23200,
    '0.12': 94300,
    '0.22': 201050,
    '0.24': 383900,
    '0.32': 487450,
    '0.35': 731200,
    '0.37': Infinity
  }
};

export const TAX_BRACKETS = TAX_BRACKETS_2024; // Generic alias

// Convert IRMAA structure to match component expectations
// Components expect: .magiLimit, .partB, .partD properties
export const IRMAA_THRESHOLDS = IRMAA_THRESHOLDS_SINGLE.map(tier => ({
  magiLimit: tier.limit,
  partB: 174.70 + (tier.surcharge / 12), // Base Part B + monthly surcharge
  partD: 81.60 + (tier.surcharge / 24), // Estimated Part D + proportional surcharge
  description: tier.description
}));

// =============================================================================
// EXPORT ALL
// =============================================================================
export default {
  FEDERAL_TAX_BRACKETS_2026,
  TAX_BRACKETS_2024, // Alias
  TAX_BRACKETS, // Alias
  STANDARD_DEDUCTION_2026,
  RMD_RATES,
  RMD_START_AGE,
  IRMAA_THRESHOLDS_SINGLE,
  IRMAA_THRESHOLDS_MARRIED,
  IRMAA_THRESHOLDS, // Alias
  getIRMAASurcharge,
  LONG_TERM_CAP_GAINS_BRACKETS,
  QCD_ANNUAL_LIMIT,
  QCD_MINIMUM_AGE,
  CONTRIBUTION_LIMITS,
  ESTATE_TAX_EXEMPTION,
  ANNUAL_GIFT_EXCLUSION,
  // Helper functions
  calculateFederalTax,
  getStandardDeduction,
  calculateRMD,
  calculateEffectiveTaxRate,
  getMarginalTaxRate
};
