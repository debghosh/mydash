// =============================================================================
// ALPHATIC - ROTH CONVERSION PROJECTIONS
// =============================================================================
// Calculate multi-year Roth conversion timelines with tax optimization
// Handles front-loading, RMDs, IRMAA, and tax-on-tax calculations
// =============================================================================

import { calculateRMD, getStandardDeduction, calculateFederalTax, getIRMAASurcharge } from '../data/constants.js';
import { calculateTaxOnTax } from './taxCalculations.js';

// =============================================================================
// ROTH CONVERSION STRATEGY TYPES
// =============================================================================

const CONVERSION_STRATEGIES = {
  STEADY: 'steady',           // Same amount each year
  FRONT_LOADED: 'front_loaded', // Higher amounts early, taper down
  BRACKET_FILLING: 'bracket_filling', // Fill to top of current bracket
  CUSTOM: 'custom'            // User-specified amounts by year
};

// =============================================================================
// FRONT-LOADING SCHEDULE
// =============================================================================

/**
 * Get front-loading conversion amount by year
 * @param {number} year - Year index (0-based)
 * @param {boolean} isPostRMD - Whether age is 73+
 * @returns {number} - Conversion amount for that year
 */
const getFrontLoadAmount = (year, isPostRMD) => {
  if (isPostRMD) {
    return 150000; // Post-73: Minimal conversions due to RMDs
  }
  
  // Pre-RMD aggressive front-loading
  if (year <= 2) {
    return 475000; // Years 1-3: Very aggressive
  } else if (year <= 5) {
    return 350000; // Years 4-6: Aggressive
  } else if (year <= 9) {
    return 250000; // Years 7-10: Standard
  } else if (year <= 13) {
    return 200000; // Years 11-14: Taper
  }
  
  return 150000; // Default
};

// =============================================================================
// BRACKET-FILLING STRATEGY
// =============================================================================

/**
 * Calculate optimal conversion to fill current tax bracket
 * @param {number} otherIncome - Other ordinary income
 * @param {number} rmdAmount - RMD amount
 * @param {number} age - Current age
 * @param {number} targetBracket - Target marginal rate (0.22, 0.24, etc.)
 * @returns {number} - Optimal conversion amount
 */
const calculateBracketFillingAmount = (otherIncome, rmdAmount, age, targetBracket = 0.24) => {
  const standardDeduction = getStandardDeduction(age);
  const currentIncome = otherIncome + rmdAmount;
  const currentTaxableIncome = Math.max(0, currentIncome - standardDeduction);
  
  // Find target bracket limit
  const BRACKETS_2026 = [
    { limit: 11600, rate: 0.10 },
    { limit: 47150, rate: 0.12 },
    { limit: 100525, rate: 0.22 },
    { limit: 191950, rate: 0.24 },
    { limit: 243725, rate: 0.32 },
    { limit: 609350, rate: 0.35 }
  ];
  
  let targetLimit = 191950; // Default to 24% bracket top
  
  for (const bracket of BRACKETS_2026) {
    if (bracket.rate === targetBracket) {
      targetLimit = bracket.limit;
      break;
    }
  }
  
  // Room in bracket
  const room = Math.max(0, targetLimit - currentTaxableIncome);
  
  return room;
};

// =============================================================================
// MAIN ROTH CONVERSION TIMELINE CALCULATOR
// =============================================================================

/**
 * Calculate complete Roth conversion timeline
 * @param {object} params - Configuration parameters
 * @returns {array} - Year-by-year conversion timeline
 */
export const calculateRothConversionTimeline = ({
  iraAmount,
  conversionAmount = 250000,
  strategy = CONVERSION_STRATEGIES.STEADY,
  startAge = 60,
  continueAfterRMD = false,
  stateTaxRate = 5,
  capitalGainsRate = 15,
  otherIncome = 25000,
  costBasisRatio = 0.50,
  annualReturn = 0.06,
  customAmounts = null // For CUSTOM strategy: { year: amount }
}) => {
  const timeline = [];
  let remainingIRA = iraAmount;
  const yearsToConvert = continueAfterRMD ? 20 : 14;
  
  for (let year = 0; year < yearsToConvert; year++) {
    const age = startAge + year;
    const isPostRMD = age >= 73;
    
    // Calculate RMD if applicable
    const rmdAmount = calculateRMD(age, remainingIRA);
    
    // Determine conversion amount based on strategy
    let conversion = 0;
    
    switch (strategy) {
      case CONVERSION_STRATEGIES.STEADY:
        conversion = conversionAmount;
        if (isPostRMD) {
          conversion = Math.min(conversion, 200000); // Cap post-RMD conversions
        }
        break;
        
      case CONVERSION_STRATEGIES.FRONT_LOADED:
        conversion = getFrontLoadAmount(year, isPostRMD);
        break;
        
      case CONVERSION_STRATEGIES.BRACKET_FILLING:
        conversion = calculateBracketFillingAmount(otherIncome, rmdAmount, age, 0.24);
        break;
        
      case CONVERSION_STRATEGIES.CUSTOM:
        conversion = customAmounts?.[year] || conversionAmount;
        break;
        
      default:
        conversion = conversionAmount;
    }
    
    // Can't convert more than remaining IRA
    conversion = Math.min(conversion, remainingIRA);
    
    // Skip if nothing to convert
    if (conversion <= 0 && rmdAmount <= 0) {
      break;
    }
    
    // Calculate taxes
    const standardDeduction = getStandardDeduction(age);
    const totalIncome = conversion + rmdAmount + otherIncome;
    const taxableIncome = Math.max(0, totalIncome - standardDeduction);
    
    // Federal tax
    const federalTax = calculateFederalTax(taxableIncome);
    
    // State tax
    const stateTax = taxableIncome * (stateTaxRate / 100);
    
    // Tax-on-tax (capital gains triggered by paying tax from taxable account)
    const taxOnTax = calculateTaxOnTax(
      federalTax,
      stateTax,
      capitalGainsRate,
      costBasisRatio
    );
    
    // IRMAA surcharge
    const magi = totalIncome;
    const irmaa = getIRMAASurcharge(magi, false); // Assume single
    
    // Cumulative totals
    const cumulativeConverted = timeline.reduce((sum, t) => sum + t.conversion, 0) + conversion;
    const cumulativeTax = timeline.reduce((sum, t) => sum + t.allInCost, 0) + taxOnTax.totalTaxCost + irmaa;
    
    // Add to timeline
    timeline.push({
      year: 2026 + year,
      age,
      conversion,
      rmd: rmdAmount,
      ira: remainingIRA,
      
      // Tax breakdown
      federalTax,
      stateTax,
      capitalGainsTax: taxOnTax.capitalGainsTax,
      primaryTax: taxOnTax.primaryTax,
      totalTaxCost: taxOnTax.totalTaxCost,
      irmaa,
      allInCost: taxOnTax.totalTaxCost + irmaa,
      
      // Rates
      taxRate: conversion > 0 ? (taxOnTax.totalTaxCost / conversion) : 0,
      effectiveRate: conversion > 0 ? ((taxOnTax.totalTaxCost + irmaa) / conversion) * 100 : 0,
      marginalRate: taxableIncome,
      
      // Cumulative
      cumulativeConverted,
      cumulativeTax,
      
      // Other info
      totalIncome,
      taxableIncome,
      standardDeduction
    });
    
    // Update remaining IRA (subtract conversions/RMDs, apply growth)
    remainingIRA = Math.max(0, remainingIRA - conversion - rmdAmount) * (1 + annualReturn);
    
    // Stop if IRA depleted
    if (remainingIRA < 10000) {
      break;
    }
  }
  
  return timeline;
};

// =============================================================================
// ROTH CONVERSION SUMMARY STATISTICS
// =============================================================================

/**
 * Calculate summary statistics from timeline
 * @param {array} timeline - Conversion timeline
 * @returns {object} - Summary statistics
 */
export const summarizeRothConversionTimeline = (timeline) => {
  if (!timeline || timeline.length === 0) {
    return {
      totalConverted: 0,
      totalTaxPaid: 0,
      averageTaxRate: 0,
      yearsToComplete: 0,
      finalIRABalance: 0,
      peakTaxYear: null
    };
  }
  
  const totalConverted = timeline.reduce((sum, t) => sum + t.conversion, 0);
  const totalTaxPaid = timeline.reduce((sum, t) => sum + t.allInCost, 0);
  const totalRMDs = timeline.reduce((sum, t) => sum + t.rmd, 0);
  const averageTaxRate = totalConverted > 0 ? (totalTaxPaid / totalConverted) * 100 : 0;
  
  // Find peak tax year
  const peakTaxYear = timeline.reduce((max, t) => 
    t.allInCost > (max?.allInCost || 0) ? t : max
  , null);
  
  // Final IRA balance
  const finalIRABalance = timeline[timeline.length - 1]?.ira || 0;
  
  return {
    totalConverted,
    totalTaxPaid,
    totalRMDs,
    averageTaxRate,
    yearsToComplete: timeline.length,
    finalIRABalance,
    peakTaxYear: peakTaxYear ? {
      year: peakTaxYear.year,
      age: peakTaxYear.age,
      amount: peakTaxYear.allInCost,
      conversion: peakTaxYear.conversion
    } : null
  };
};

// =============================================================================
// STRATEGY COMPARISON
// =============================================================================

/**
 * Compare different conversion strategies
 * @param {object} baseParams - Base parameters (same for all strategies)
 * @returns {object} - Comparison of strategies
 */
export const compareRothStrategies = (baseParams) => {
  const strategies = [
    CONVERSION_STRATEGIES.STEADY,
    CONVERSION_STRATEGIES.FRONT_LOADED,
    CONVERSION_STRATEGIES.BRACKET_FILLING
  ];
  
  const comparisons = {};
  
  for (const strategy of strategies) {
    const timeline = calculateRothConversionTimeline({
      ...baseParams,
      strategy
    });
    
    comparisons[strategy] = {
      timeline,
      summary: summarizeRothConversionTimeline(timeline)
    };
  }
  
  // Find best strategy (lowest total tax)
  let bestStrategy = null;
  let lowestTax = Infinity;
  
  for (const [strategy, data] of Object.entries(comparisons)) {
    if (data.summary.totalTaxPaid < lowestTax) {
      lowestTax = data.summary.totalTaxPaid;
      bestStrategy = strategy;
    }
  }
  
  return {
    comparisons,
    bestStrategy,
    taxSavings: Object.fromEntries(
      Object.entries(comparisons).map(([strategy, data]) => [
        strategy,
        data.summary.totalTaxPaid - lowestTax
      ])
    )
  };
};

// =============================================================================
// OPTIMAL CONVERSION AMOUNT FINDER
// =============================================================================

/**
 * Find optimal annual conversion amount to minimize total tax
 * @param {object} params - Base parameters
 * @param {number} minAmount - Minimum conversion to test
 * @param {number} maxAmount - Maximum conversion to test
 * @param {number} step - Step size for testing
 * @returns {object} - Optimal conversion amount and timeline
 */
export const findOptimalConversionAmount = (params, minAmount = 100000, maxAmount = 500000, step = 25000) => {
  let optimalAmount = minAmount;
  let lowestTotalTax = Infinity;
  let optimalTimeline = null;
  
  for (let amount = minAmount; amount <= maxAmount; amount += step) {
    const timeline = calculateRothConversionTimeline({
      ...params,
      conversionAmount: amount,
      strategy: CONVERSION_STRATEGIES.STEADY
    });
    
    const summary = summarizeRothConversionTimeline(timeline);
    
    if (summary.totalTaxPaid < lowestTotalTax) {
      lowestTotalTax = summary.totalTaxPaid;
      optimalAmount = amount;
      optimalTimeline = timeline;
    }
  }
  
  return {
    optimalAmount,
    totalTax: lowestTotalTax,
    timeline: optimalTimeline,
    summary: summarizeRothConversionTimeline(optimalTimeline)
  };
};

// =============================================================================
// IRMAA CLIFF ANALYZER
// =============================================================================

/**
 * Analyze IRMAA cliffs and suggest adjustments
 * @param {array} timeline - Conversion timeline
 * @returns {array} - Years with IRMAA cliffs and suggestions
 */
export const analyzeIRMAACliffs = (timeline) => {
  const cliffs = [];
  
  const IRMAA_THRESHOLDS = [111000, 148000, 176000, 200000, 500000];
  
  for (const year of timeline) {
    const { totalIncome, irmaa, conversion } = year;
    
    // Check if we're just over a threshold
    for (const threshold of IRMAA_THRESHOLDS) {
      if (totalIncome > threshold && totalIncome < threshold + 5000) {
        const reduction = totalIncome - threshold + 1;
        
        cliffs.push({
          year: year.year,
          age: year.age,
          threshold,
          currentIncome: totalIncome,
          currentIRMAA: irmaa,
          suggestion: `Reduce conversion by $${reduction.toLocaleString()} to avoid IRMAA cliff`,
          potentialSavings: 1400 // Approximate IRMAA tier increase
        });
      }
    }
  }
  
  return cliffs;
};

// =============================================================================
// ALIASES FOR BACKWARD COMPATIBILITY
// =============================================================================
/**
 * Alias for calculateRothConversionTimeline
 */
export const calculateRothProjections = calculateRothConversionTimeline;

// =============================================================================
// EXPORT ALL
// =============================================================================
export default {
  CONVERSION_STRATEGIES,
  calculateRothConversionTimeline,
  calculateRothProjections, // Alias
  summarizeRothConversionTimeline,
  compareRothStrategies,
  findOptimalConversionAmount,
  analyzeIRMAACliffs
};
