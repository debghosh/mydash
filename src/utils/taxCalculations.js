// =============================================================================
// ALPHATIC - TAX CALCULATIONS
// =============================================================================
// Extended tax calculation functions beyond basic constants
// Handles complex scenarios: tax-on-tax, IRMAA, marginal vs effective rates
// =============================================================================

import {
  FEDERAL_TAX_BRACKETS_2026,
  STANDARD_DEDUCTION_2026,
  RMD_RATES,
  RMD_START_AGE,
  getIRMAASurcharge,
  calculateFederalTax,
  getStandardDeduction,
  calculateRMD,
  getMarginalTaxRate
} from '../data/constants.js';

// =============================================================================
// TAX-ON-TAX CALCULATION (Critical for Roth Conversions)
// =============================================================================

/**
 * Calculate total tax cost including tax-on-tax
 * When you pay taxes from taxable account, you trigger capital gains on the withdrawal
 * @param {number} federalTax - Federal tax owed on conversion
 * @param {number} stateTax - State tax owed on conversion
 * @param {number} capitalGainsRate - Long-term capital gains rate (default: 15%)
 * @param {number} costBasisRatio - Ratio of cost basis to current value (default: 0.50)
 * @returns {object} - Tax breakdown including tax-on-tax
 */
export const calculateTaxOnTax = (
  federalTax,
  stateTax,
  capitalGainsRate = 15,
  costBasisRatio = 0.50
) => {
  // Total primary tax
  const primaryTax = federalTax + stateTax;
  
  // When you withdraw from taxable to pay tax, you trigger capital gains
  // Assumption: You need to withdraw more than the tax amount to cover the gains tax too
  const gainsRatio = 1 - costBasisRatio; // e.g., 0.50 if cost basis is 50%
  const capitalGainsTax = primaryTax * gainsRatio * (capitalGainsRate / 100);
  
  // Total tax cost
  const totalTaxCost = primaryTax + capitalGainsTax;
  
  return {
    federalTax,
    stateTax,
    primaryTax,
    capitalGainsTax,
    totalTaxCost,
    effectiveTaxOnTax: (capitalGainsTax / primaryTax) * 100 // % additional cost
  };
};

// =============================================================================
// COMPREHENSIVE TAX CALCULATION FOR ROTH CONVERSION
// =============================================================================

/**
 * Calculate complete tax impact of a Roth conversion
 * @param {number} conversionAmount - Amount to convert
 * @param {number} otherOrdinaryIncome - Other ordinary income (interest, etc.)
 * @param {number} age - Current age
 * @param {number} stateTaxRate - State income tax rate (%)
 * @param {number} capitalGainsRate - Long-term capital gains rate (%)
 * @param {number} rmdAmount - RMD amount if applicable
 * @returns {object} - Complete tax analysis
 */
export const calculateRothConversionTax = ({
  conversionAmount,
  otherOrdinaryIncome = 0,
  age,
  stateTaxRate = 0,
  capitalGainsRate = 15,
  rmdAmount = 0
}) => {
  // Total ordinary income
  const totalOrdinaryIncome = conversionAmount + otherOrdinaryIncome + rmdAmount;
  
  // Standard deduction
  const standardDeduction = getStandardDeduction(age);
  
  // Taxable income
  const taxableIncome = Math.max(0, totalOrdinaryIncome - standardDeduction);
  
  // Federal tax
  const federalTax = calculateFederalTax(taxableIncome);
  
  // State tax
  const stateTax = taxableIncome * (stateTaxRate / 100);
  
  // Tax-on-tax (paying tax from taxable account)
  const taxOnTax = calculateTaxOnTax(federalTax, stateTax, capitalGainsRate);
  
  // IRMAA surcharge (based on MAGI, uses 2-year lookback in reality)
  const magi = totalOrdinaryIncome; // Simplified
  const irmaa = getIRMAASurcharge(magi, false); // Assume single
  
  // Effective tax rate on conversion
  const effectiveTaxRate = (taxOnTax.totalTaxCost / conversionAmount) * 100;
  
  // Marginal tax rate
  const marginalRate = getMarginalTaxRate(taxableIncome) * 100;
  
  return {
    // Income breakdown
    conversionAmount,
    otherOrdinaryIncome,
    rmdAmount,
    totalOrdinaryIncome,
    standardDeduction,
    taxableIncome,
    
    // Tax breakdown
    federalTax,
    stateTax,
    capitalGainsTax: taxOnTax.capitalGainsTax,
    primaryTax: taxOnTax.primaryTax,
    totalTaxCost: taxOnTax.totalTaxCost,
    irmaa,
    allInCost: taxOnTax.totalTaxCost + irmaa,
    
    // Rates
    effectiveTaxRate,
    marginalRate,
    taxOnTaxImpact: taxOnTax.effectiveTaxOnTax
  };
};

// =============================================================================
// MARGINAL BRACKET CAPACITY
// =============================================================================

/**
 * Calculate how much more income can fit in current bracket
 * @param {number} currentTaxableIncome - Current taxable income
 * @returns {object} - Bracket capacity information
 */
export const calculateBracketCapacity = (currentTaxableIncome) => {
  let currentBracket = null;
  let nextBracket = null;
  let roomInBracket = 0;
  
  for (let i = 0; i < FEDERAL_TAX_BRACKETS_2026.length; i++) {
    const bracket = FEDERAL_TAX_BRACKETS_2026[i];
    
    if (currentTaxableIncome <= bracket.limit) {
      currentBracket = bracket;
      roomInBracket = bracket.limit - currentTaxableIncome;
      nextBracket = FEDERAL_TAX_BRACKETS_2026[i + 1] || null;
      break;
    }
  }
  
  return {
    currentBracket: currentBracket ? currentBracket.rate * 100 : 37,
    nextBracket: nextBracket ? nextBracket.rate * 100 : null,
    roomInBracket,
    optimalConversion: roomInBracket > 0 ? roomInBracket : 0
  };
};

// =============================================================================
// QUALIFIED DIVIDEND TAX
// =============================================================================

/**
 * Calculate tax on qualified dividends (preferential rates)
 * @param {number} qualifiedDividends - Amount of qualified dividends
 * @param {number} ordinaryIncome - Ordinary income (for bracket determination)
 * @returns {object} - Dividend tax calculation
 */
export const calculateQualifiedDividendTax = (qualifiedDividends, ordinaryIncome) => {
  // Qualified dividends are taxed at 0%, 15%, or 20% based on income
  const totalIncome = ordinaryIncome + qualifiedDividends;
  
  let dividendTax = 0;
  
  // 0% bracket: up to $47,025 (2026 estimate)
  if (totalIncome <= 47025) {
    dividendTax = 0;
  }
  // 15% bracket: $47,025 - $518,900
  else if (totalIncome <= 518900) {
    const taxableAtFifteen = Math.min(qualifiedDividends, totalIncome - 47025);
    dividendTax = taxableAtFifteen * 0.15;
  }
  // 20% bracket: above $518,900
  else {
    const taxableAtFifteen = Math.min(qualifiedDividends, 518900 - 47025);
    const taxableAtTwenty = Math.max(0, totalIncome - 518900);
    dividendTax = (taxableAtFifteen * 0.15) + (taxableAtTwenty * 0.20);
  }
  
  // NIIT (3.8% Medicare surtax on investment income above $200K)
  let niit = 0;
  if (totalIncome > 200000) {
    const niitBase = Math.min(qualifiedDividends, totalIncome - 200000);
    niit = niitBase * 0.038;
  }
  
  return {
    qualifiedDividends,
    dividendTax,
    niit,
    totalTax: dividendTax + niit,
    effectiveRate: ((dividendTax + niit) / qualifiedDividends) * 100
  };
};

// =============================================================================
// CAPITAL GAINS TAX
// =============================================================================

/**
 * Calculate long-term capital gains tax
 * @param {number} capitalGains - Long-term capital gains amount
 * @param {number} ordinaryIncome - Ordinary income
 * @returns {object} - Capital gains tax calculation
 */
export const calculateCapitalGainsTax = (capitalGains, ordinaryIncome) => {
  const totalIncome = ordinaryIncome + capitalGains;
  
  let capGainsTax = 0;
  
  // 0% bracket: up to $47,025
  if (totalIncome <= 47025) {
    capGainsTax = 0;
  }
  // 15% bracket: $47,025 - $518,900
  else if (totalIncome <= 518900) {
    const taxableAtZero = Math.max(0, 47025 - ordinaryIncome);
    const taxableAtFifteen = capitalGains - taxableAtZero;
    capGainsTax = Math.max(0, taxableAtFifteen) * 0.15;
  }
  // 20% bracket: above $518,900
  else {
    const taxableAtZero = Math.max(0, 47025 - ordinaryIncome);
    const taxableAtFifteen = Math.max(0, Math.min(518900 - ordinaryIncome - taxableAtZero, capitalGains - taxableAtZero));
    const taxableAtTwenty = Math.max(0, capitalGains - taxableAtZero - taxableAtFifteen);
    
    capGainsTax = (taxableAtFifteen * 0.15) + (taxableAtTwenty * 0.20);
  }
  
  // NIIT (3.8% Medicare surtax)
  let niit = 0;
  if (totalIncome > 200000) {
    const niitBase = Math.min(capitalGains, totalIncome - 200000);
    niit = niitBase * 0.038;
  }
  
  return {
    capitalGains,
    capGainsTax,
    niit,
    totalTax: capGainsTax + niit,
    effectiveRate: ((capGainsTax + niit) / capitalGains) * 100
  };
};

// =============================================================================
// TOTAL TAX LIABILITY
// =============================================================================

/**
 * Calculate total tax liability across all income types
 * @param {object} incomes - All income types
 * @returns {object} - Complete tax liability
 */
export const calculateTotalTaxLiability = ({
  ordinaryIncome = 0,
  qualifiedDividends = 0,
  capitalGains = 0,
  age,
  stateTaxRate = 0
}) => {
  // Standard deduction
  const standardDeduction = getStandardDeduction(age);
  
  // Ordinary income tax
  const taxableOrdinary = Math.max(0, ordinaryIncome - standardDeduction);
  const federalOrdinary = calculateFederalTax(taxableOrdinary);
  const stateOrdinary = taxableOrdinary * (stateTaxRate / 100);
  
  // Qualified dividend tax
  const divTax = calculateQualifiedDividendTax(qualifiedDividends, ordinaryIncome);
  
  // Capital gains tax
  const cgTax = calculateCapitalGainsTax(capitalGains, ordinaryIncome);
  
  // Total income
  const totalIncome = ordinaryIncome + qualifiedDividends + capitalGains;
  
  // IRMAA
  const magi = totalIncome;
  const irmaa = getIRMAASurcharge(magi, false);
  
  // Total tax
  const totalFederal = federalOrdinary + divTax.totalTax + cgTax.totalTax;
  const totalState = stateOrdinary; // Simplification: most states tax all income the same
  const totalTax = totalFederal + totalState + irmaa;
  
  return {
    // Income
    totalIncome,
    ordinaryIncome,
    qualifiedDividends,
    capitalGains,
    
    // Deductions
    standardDeduction,
    
    // Tax by type
    ordinaryIncomeTax: federalOrdinary + stateOrdinary,
    dividendTax: divTax.totalTax,
    capitalGainsTax: cgTax.totalTax,
    irmaa,
    
    // Totals
    totalFederal,
    totalState,
    totalTax,
    
    // Rates
    effectiveTaxRate: (totalTax / totalIncome) * 100,
    marginalRate: getMarginalTaxRate(taxableOrdinary) * 100
  };
};

// =============================================================================
// TAX-LOSS HARVESTING VALUE
// =============================================================================

/**
 * Calculate value of tax-loss harvesting opportunity
 * @param {number} unrealizedLoss - Amount of unrealized loss
 * @param {number} capitalGains - Capital gains to offset
 * @param {number} ordinaryIncome - Ordinary income (for determining CG rate)
 * @returns {object} - Tax savings from harvesting
 */
export const calculateTaxLossHarvestingValue = (unrealizedLoss, capitalGains, ordinaryIncome) => {
  // Can offset up to all capital gains
  const gainsOffset = Math.min(unrealizedLoss, capitalGains);
  
  // Remaining loss can offset up to $3,000 of ordinary income
  const remainingLoss = unrealizedLoss - gainsOffset;
  const ordinaryOffset = Math.min(remainingLoss, 3000);
  
  // Loss carried forward
  const carryForward = Math.max(0, remainingLoss - ordinaryOffset);
  
  // Calculate tax savings
  const cgTaxSavings = calculateCapitalGainsTax(gainsOffset, ordinaryIncome).totalTax;
  const ordinaryTaxSavings = ordinaryOffset * getMarginalTaxRate(ordinaryIncome);
  
  const totalSavings = cgTaxSavings + ordinaryTaxSavings;
  
  return {
    unrealizedLoss,
    gainsOffset,
    ordinaryOffset,
    carryForward,
    cgTaxSavings,
    ordinaryTaxSavings,
    totalSavings,
    savingsRate: (totalSavings / unrealizedLoss) * 100
  };
};

// =============================================================================
// QCD (QUALIFIED CHARITABLE DISTRIBUTION) VALUE
// =============================================================================

/**
 * Calculate tax benefit of QCD vs cash donation
 * @param {number} qcdAmount - Amount of QCD
 * @param {number} rmdAmount - Required RMD amount
 * @param {number} otherIncome - Other income
 * @param {number} age - Current age
 * @param {number} stateTaxRate - State tax rate
 * @returns {object} - QCD tax benefit analysis
 */
export const calculateQCDValue = (qcdAmount, rmdAmount, otherIncome, age, stateTaxRate) => {
  // Scenario 1: Take RMD + make cash donation
  const withoutQCD = calculateRothConversionTax({
    conversionAmount: 0,
    otherOrdinaryIncome: otherIncome,
    age,
    stateTaxRate,
    rmdAmount
  });
  
  // Scenario 2: Use QCD (reduces RMD)
  const effectiveRMD = Math.max(0, rmdAmount - qcdAmount);
  const withQCD = calculateRothConversionTax({
    conversionAmount: 0,
    otherOrdinaryIncome: otherIncome,
    age,
    stateTaxRate,
    rmdAmount: effectiveRMD
  });
  
  const taxSavings = withoutQCD.allInCost - withQCD.allInCost;
  
  return {
    qcdAmount,
    rmdAmount,
    taxSavings,
    irmaaSavings: withoutQCD.irmaa - withQCD.irmaa,
    totalBenefit: taxSavings,
    benefitRate: (taxSavings / qcdAmount) * 100
  };
};

// =============================================================================
// SAFE HARBOR CALCULATION
// =============================================================================

/**
 * Calculate required quarterly estimated tax payments (safe harbor)
 * @param {number} priorYearTax - Total tax from prior year
 * @param {number} currentYearEstimatedTax - Estimated tax for current year
 * @param {number} priorYearAGI - Prior year AGI (for high earner rule)
 * @returns {object} - Safe harbor requirements
 */
export const calculateSafeHarbor = (priorYearTax, currentYearEstimatedTax, priorYearAGI) => {
  // Safe harbor options
  const option1 = currentYearEstimatedTax * 0.90; // 90% of current year
  const option2 = priorYearAGI > 150000 ? priorYearTax * 1.10 : priorYearTax; // 100% or 110% of prior
  
  const safeHarborAmount = Math.min(option1, option2);
  const quarterlyPayment = safeHarborAmount / 4;
  
  return {
    safeHarborAmount,
    quarterlyPayment,
    annualProjection: currentYearEstimatedTax,
    usingPriorYear: option2 < option1,
    requiresHighEarnerAdjustment: priorYearAGI > 150000
  };
};

// =============================================================================
// EXPORT ALL
// =============================================================================
export default {
  calculateTaxOnTax,
  calculateRothConversionTax,
  calculateBracketCapacity,
  calculateQualifiedDividendTax,
  calculateCapitalGainsTax,
  calculateTotalTaxLiability,
  calculateTaxLossHarvestingValue,
  calculateQCDValue,
  calculateSafeHarbor
};
