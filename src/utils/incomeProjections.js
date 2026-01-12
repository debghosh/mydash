// =============================================================================
// ALPHATIC - INCOME PROJECTIONS
// =============================================================================
// Calculate lifetime income projections from portfolio
// Handles withdrawals, tax drag, dividend income, capital gains
// =============================================================================

import { calculateWeightedYield } from './portfolioMetrics.js';
import { calculateQualifiedDividendTax, calculateCapitalGainsTax } from './taxCalculations.js';
import { getStandardDeduction } from '../data/constants.js';

// =============================================================================
// WITHDRAWAL STRATEGIES
// =============================================================================

const WITHDRAWAL_STRATEGIES = {
  DIVIDEND_ONLY: 'dividend_only',       // Only take dividends, no principal
  FIXED_PERCENTAGE: 'fixed_percentage', // 4% rule, SWR
  DYNAMIC: 'dynamic',                   // Adjust based on portfolio performance
  FLOOR_CEILING: 'floor_ceiling',       // Guardrails approach
  BUCKET: 'bucket'                      // Bucketing strategy
};

// =============================================================================
// SAFE WITHDRAWAL RATE CALCULATION
// =============================================================================

/**
 * Calculate safe withdrawal rate (SWR) based on age and time horizon
 * @param {number} age - Current age
 * @param {number} portfolioValue - Total portfolio value
 * @param {number} targetYears - Years of withdrawals needed
 * @returns {object} - SWR analysis
 */
export const calculateSafeWithdrawalRate = (age, portfolioValue, targetYears = 30) => {
  // Trinity Study-based SWR (simplified)
  // Longer time horizons = lower SWR
  let baseRate = 0.04; // 4% for 30 years
  
  if (targetYears >= 40) {
    baseRate = 0.035; // 3.5% for 40+ years
  } else if (targetYears >= 35) {
    baseRate = 0.0375; // 3.75% for 35-40 years
  } else if (targetYears <= 25) {
    baseRate = 0.045; // 4.5% for 25 years or less
  } else if (targetYears <= 20) {
    baseRate = 0.05; // 5% for 20 years or less
  }
  
  const annualWithdrawal = portfolioValue * baseRate;
  const monthlyWithdrawal = annualWithdrawal / 12;
  
  return {
    safeWithdrawalRate: baseRate * 100,
    annualWithdrawal,
    monthlyWithdrawal,
    targetYears,
    age,
    methodology: 'Trinity Study (Modified)'
  };
};

// =============================================================================
// DIVIDEND-ONLY INCOME STRATEGY
// =============================================================================

/**
 * Calculate income from dividends only (no principal depletion)
 * @param {object} allocation - Portfolio allocation
 * @param {number} portfolioValue - Total portfolio value
 * @param {number} age - Current age
 * @param {number} stateTaxRate - State tax rate
 * @returns {object} - Dividend income analysis
 */
export const calculateDividendOnlyIncome = (allocation, portfolioValue, age, stateTaxRate = 5) => {
  // Calculate weighted yield
  const portfolioYield = calculateWeightedYield(allocation);
  
  // Gross annual dividends
  const grossAnnualDividends = portfolioValue * (portfolioYield / 100);
  
  // Assume 90% are qualified dividends (conservative)
  const qualifiedDividends = grossAnnualDividends * 0.90;
  const ordinaryDividends = grossAnnualDividends * 0.10;
  
  // Calculate taxes
  const divTax = calculateQualifiedDividendTax(qualifiedDividends, ordinaryDividends);
  
  // State tax (simplified - tax all dividends at state rate)
  const stateTax = grossAnnualDividends * (stateTaxRate / 100);
  
  // Net after-tax income
  const totalTax = divTax.totalTax + stateTax;
  const netAnnualIncome = grossAnnualDividends - totalTax;
  const netMonthlyIncome = netAnnualIncome / 12;
  
  return {
    portfolioYield,
    grossAnnualDividends,
    qualifiedDividends,
    ordinaryDividends,
    federalTax: divTax.totalTax,
    stateTax,
    totalTax,
    netAnnualIncome,
    netMonthlyIncome,
    effectiveTaxRate: (totalTax / grossAnnualDividends) * 100
  };
};

// =============================================================================
// LIFETIME INCOME PROJECTION
// =============================================================================

/**
 * Project income and portfolio value over lifetime
 * @param {object} params - Projection parameters
 * @returns {array} - Year-by-year projections
 */
export const projectLifetimeIncome = ({
  allocation,
  portfolioValue,
  startAge,
  endAge = 90,
  withdrawalStrategy = WITHDRAWAL_STRATEGIES.FIXED_PERCENTAGE,
  withdrawalRate = 4.0, // Percentage for fixed strategy
  annualExpenses = 100000,
  expectedReturn = 7.0, // Percentage
  inflationRate = 2.5, // Percentage
  stateTaxRate = 5,
  rebalanceAnnually = true
}) => {
  const projections = [];
  let currentPortfolioValue = portfolioValue;
  let currentExpenses = annualExpenses;
  
  for (let age = startAge; age <= endAge; age++) {
    const year = age - startAge;
    
    // Calculate dividend income
    const dividendIncome = calculateDividendOnlyIncome(
      allocation,
      currentPortfolioValue,
      age,
      stateTaxRate
    );
    
    // Determine withdrawal amount based on strategy
    let grossWithdrawal = 0;
    
    switch (withdrawalStrategy) {
      case WITHDRAWAL_STRATEGIES.DIVIDEND_ONLY:
        grossWithdrawal = dividendIncome.grossAnnualDividends;
        break;
        
      case WITHDRAWAL_STRATEGIES.FIXED_PERCENTAGE:
        grossWithdrawal = currentPortfolioValue * (withdrawalRate / 100);
        break;
        
      case WITHDRAWAL_STRATEGIES.DYNAMIC:
        // Adjust based on portfolio performance
        const performanceMultiplier = year > 0 && projections[year - 1] ? 
          (currentPortfolioValue / projections[year - 1].endingPortfolioValue) : 1;
        grossWithdrawal = currentPortfolioValue * (withdrawalRate / 100) * performanceMultiplier;
        break;
        
      case WITHDRAWAL_STRATEGIES.FLOOR_CEILING:
        // Guardrails: 3% floor, 6% ceiling
        const baseWithdrawal = currentPortfolioValue * (withdrawalRate / 100);
        const floor = currentPortfolioValue * 0.03;
        const ceiling = currentPortfolioValue * 0.06;
        grossWithdrawal = Math.max(floor, Math.min(ceiling, baseWithdrawal));
        break;
        
      default:
        grossWithdrawal = currentPortfolioValue * (withdrawalRate / 100);
    }
    
    // Calculate taxes on withdrawal
    // Assume dividend portion already taxed, calculate on capital gains portion
    const dividendPortion = dividendIncome.grossAnnualDividends;
    const capitalGainsPortion = Math.max(0, grossWithdrawal - dividendPortion);
    
    // Capital gains tax (assume 50% cost basis)
    const realizedGains = capitalGainsPortion * 0.50;
    const cgTax = calculateCapitalGainsTax(realizedGains, dividendIncome.ordinaryDividends);
    
    // Total tax
    const totalTax = dividendIncome.totalTax + cgTax.totalTax;
    
    // Net withdrawal
    const netWithdrawal = grossWithdrawal - totalTax;
    
    // Surplus/deficit
    const surplus = netWithdrawal - currentExpenses;
    
    // Portfolio return
    const portfolioReturn = currentPortfolioValue * (expectedReturn / 100);
    
    // Ending portfolio value
    const endingPortfolioValue = Math.max(0, 
      currentPortfolioValue + portfolioReturn - grossWithdrawal
    );
    
    // Add to projections
    projections.push({
      year: 2026 + year,
      age,
      startingPortfolioValue: currentPortfolioValue,
      dividendIncome: dividendIncome.grossAnnualDividends,
      grossWithdrawal,
      totalTax,
      netWithdrawal,
      expenses: currentExpenses,
      surplus,
      portfolioReturn,
      endingPortfolioValue,
      withdrawalRate: (grossWithdrawal / currentPortfolioValue) * 100,
      successProbability: endingPortfolioValue > 0 ? 100 : 0
    });
    
    // Update for next year
    currentPortfolioValue = endingPortfolioValue;
    currentExpenses = currentExpenses * (1 + inflationRate / 100);
    
    // Stop if portfolio depleted
    if (currentPortfolioValue <= 0) {
      break;
    }
  }
  
  return projections;
};

// =============================================================================
// INCOME PROJECTION SUMMARY
// =============================================================================

/**
 * Summarize lifetime income projections
 * @param {array} projections - Lifetime projections
 * @returns {object} - Summary statistics
 */
export const summarizeIncomeProjections = (projections) => {
  if (!projections || projections.length === 0) {
    return {
      totalYears: 0,
      portfolioSurvived: false,
      totalWithdrawn: 0,
      totalTaxesPaid: 0,
      averageAnnualIncome: 0,
      portfolioDepletionAge: null
    };
  }
  
  const totalWithdrawn = projections.reduce((sum, p) => sum + p.grossWithdrawal, 0);
  const totalTaxesPaid = projections.reduce((sum, p) => sum + p.totalTax, 0);
  const averageAnnualIncome = projections.reduce((sum, p) => sum + p.netWithdrawal, 0) / projections.length;
  
  const lastProjection = projections[projections.length - 1];
  const portfolioSurvived = lastProjection.endingPortfolioValue > 0;
  
  let portfolioDepletionAge = null;
  for (const projection of projections) {
    if (projection.endingPortfolioValue <= 0) {
      portfolioDepletionAge = projection.age;
      break;
    }
  }
  
  return {
    totalYears: projections.length,
    portfolioSurvived,
    totalWithdrawn,
    totalTaxesPaid,
    averageAnnualIncome,
    averageAnnualNetIncome: totalWithdrawn - totalTaxesPaid,
    portfolioDepletionAge,
    finalPortfolioValue: lastProjection.endingPortfolioValue
  };
};

// =============================================================================
// MONTE CARLO SIMULATION (Simplified)
// =============================================================================

/**
 * Run simplified Monte Carlo simulation for success probability
 * @param {object} params - Base parameters
 * @param {number} simulations - Number of simulations to run
 * @returns {object} - Monte Carlo results
 */
export const runMonteCarloSimulation = (params, simulations = 1000) => {
  let successCount = 0;
  const outcomes = [];
  
  for (let i = 0; i < simulations; i++) {
    // Random return modifier (-3% to +3% around expected)
    const returnVariance = (Math.random() - 0.5) * 6;
    const simulatedReturn = params.expectedReturn + returnVariance;
    
    // Run projection with varied return
    const projection = projectLifetimeIncome({
      ...params,
      expectedReturn: simulatedReturn
    });
    
    const summary = summarizeIncomeProjections(projection);
    
    if (summary.portfolioSurvived) {
      successCount++;
    }
    
    outcomes.push({
      finalValue: summary.finalPortfolioValue,
      survived: summary.portfolioSurvived,
      depletionAge: summary.portfolioDepletionAge
    });
  }
  
  const successProbability = (successCount / simulations) * 100;
  
  // Calculate percentiles of final values
  const finalValues = outcomes.map(o => o.finalValue).sort((a, b) => a - b);
  const p10 = finalValues[Math.floor(simulations * 0.10)];
  const p50 = finalValues[Math.floor(simulations * 0.50)];
  const p90 = finalValues[Math.floor(simulations * 0.90)];
  
  return {
    simulations,
    successProbability,
    failureProbability: 100 - successProbability,
    percentiles: {
      p10,
      p50,
      p90
    },
    outcomes
  };
};

// =============================================================================
// INCOME REPLACEMENT RATIO
// =============================================================================

/**
 * Calculate what percentage of pre-retirement income is replaced
 * @param {number} netAnnualIncome - Net annual income from portfolio
 * @param {number} preRetirementIncome - Pre-retirement income
 * @returns {object} - Replacement ratio analysis
 */
export const calculateIncomeReplacementRatio = (netAnnualIncome, preRetirementIncome) => {
  const replacementRatio = (netAnnualIncome / preRetirementIncome) * 100;
  
  let adequacy = 'insufficient';
  if (replacementRatio >= 80) {
    adequacy = 'excellent';
  } else if (replacementRatio >= 70) {
    adequacy = 'good';
  } else if (replacementRatio >= 60) {
    adequacy = 'adequate';
  }
  
  return {
    preRetirementIncome,
    retirementIncome: netAnnualIncome,
    replacementRatio,
    adequacy,
    shortfall: Math.max(0, preRetirementIncome - netAnnualIncome),
    surplus: Math.max(0, netAnnualIncome - preRetirementIncome)
  };
};

// =============================================================================
// REQUIRED PORTFOLIO SIZE
// =============================================================================

/**
 * Calculate required portfolio size for desired income
 * @param {number} desiredAnnualIncome - Target annual income (after-tax)
 * @param {number} withdrawalRate - Safe withdrawal rate
 * @param {number} portfolioYield - Portfolio yield percentage
 * @param {number} effectiveTaxRate - Effective tax rate on income
 * @returns {object} - Required portfolio analysis
 */
export const calculateRequiredPortfolioSize = (
  desiredAnnualIncome,
  withdrawalRate = 4.0,
  portfolioYield = 3.5,
  effectiveTaxRate = 15
) => {
  // Gross income needed (before tax)
  const grossIncomeNeeded = desiredAnnualIncome / (1 - effectiveTaxRate / 100);
  
  // Using withdrawal rate
  const portfolioSizeByWithdrawal = (grossIncomeNeeded / withdrawalRate) * 100;
  
  // Using dividend yield only (no principal depletion)
  const portfolioSizeByYield = (grossIncomeNeeded / portfolioYield) * 100;
  
  return {
    desiredNetIncome: desiredAnnualIncome,
    requiredGrossIncome: grossIncomeNeeded,
    portfolioSizeByWithdrawal,
    portfolioSizeByYield,
    recommended: portfolioSizeByWithdrawal,
    conservativeApproach: portfolioSizeByYield
  };
};

// =============================================================================
// EXPORT ALL
// =============================================================================
export default {
  WITHDRAWAL_STRATEGIES,
  calculateSafeWithdrawalRate,
  calculateDividendOnlyIncome,
  projectLifetimeIncome,
  summarizeIncomeProjections,
  runMonteCarloSimulation,
  calculateIncomeReplacementRatio,
  calculateRequiredPortfolioSize
};
