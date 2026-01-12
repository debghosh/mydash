// =============================================================================
// ALPHATIC - PORTFOLIO METRICS
// =============================================================================
// Pure functions for calculating portfolio performance metrics
// Alpha, Beta, Sharpe Ratio, Volatility, Drawdown, etc.
// =============================================================================

import { getRegime } from '../data/regimes.js';
import { ETF_UNIVERSE } from '../data/etfs.js';

// =============================================================================
// ALPHA CALCULATION
// =============================================================================

/**
 * Calculate portfolio alpha based on market regime and strategy
 * @param {string} marketRegime - Current market regime ID
 * @param {string} rebalanceFrequency - Rebalancing frequency (quarterly, annual, etc.)
 * @returns {object} - Alpha breakdown and total return
 */
export const calculateAlpha = (marketRegime, rebalanceFrequency = 'quarterly') => {
  const regime = getRegime(marketRegime);
  
  // Base return from market regime
  const baseReturn = regime.baseReturn;
  
  // Factor tilt alpha (from value, growth, momentum tilts)
  const factorAlpha = regime.factorAlpha;
  
  // Tactical allocation alpha (regime-based positioning)
  const tacticalAlpha = regime.tacticalAlpha;
  
  // Tax efficiency alpha (constant across regimes)
  const taxAlpha = 0.8; // ~80 bps from tax-efficient ETF selection
  
  // Rebalancing alpha (varies by frequency)
  const rebalanceAlpha = 
    rebalanceFrequency === 'quarterly' ? 0.4 : 
    rebalanceFrequency === 'monthly' ? 0.5 :
    rebalanceFrequency === 'annual' ? 0.3 : 
    0.1; // No rebalancing
  
  // Total alpha = sum of all alpha sources
  const totalAlpha = factorAlpha + tacticalAlpha + taxAlpha + rebalanceAlpha;
  
  // Total expected return = base + alpha
  const totalReturn = baseReturn + totalAlpha;
  
  return {
    baseReturn,
    factorAlpha,
    tacticalAlpha,
    taxAlpha,
    rebalanceAlpha,
    totalAlpha,
    totalReturn
  };
};

// =============================================================================
// BETA CALCULATION
// =============================================================================

/**
 * Calculate portfolio beta (simplified)
 * In production, this would use historical correlations
 * @param {object} allocation - Portfolio allocation {symbol: percentage}
 * @param {object} benchmarkReturns - Historical benchmark returns (optional)
 * @returns {number} - Portfolio beta
 */
export const calculateBeta = (allocation, benchmarkReturns = null) => {
  // Simplified beta calculation based on factor exposures
  // In production, would calculate from historical covariance
  
  let weightedBeta = 0;
  let totalAllocation = 0;
  
  // Default betas by category (simplified)
  const categoryBetas = {
    'Core': 1.00,
    'Growth': 1.15,
    'Value': 0.90,
    'Small Cap': 1.20,
    'Factor - Momentum': 1.10,
    'Factor - Quality': 0.95,
    'Factor - Low Volatility': 0.70,
    'Dividend': 0.85,
    'Dividend Growth': 0.90,
    'High Income': 0.75,
    'International': 1.05,
    'Emerging Markets': 1.30,
    'Bonds': 0.10,
    'Real Estate': 0.80,
    'Safe Haven': 0.05,
    'Commodities': 0.60,
    'Aggressive Growth': 1.40
  };
  
  for (const [symbol, percentage] of Object.entries(allocation)) {
    const etf = ETF_UNIVERSE[symbol];
    if (!etf) continue;
    
    const beta = categoryBetas[etf.category] || 1.00;
    weightedBeta += beta * (percentage / 100);
    totalAllocation += percentage;
  }
  
  if (totalAllocation === 0) return 1.00;
  
  return weightedBeta;
};

// =============================================================================
// SHARPE RATIO
// =============================================================================

/**
 * Calculate Sharpe ratio
 * @param {number} portfolioReturn - Expected portfolio return (as decimal, e.g., 0.10 for 10%)
 * @param {number} volatility - Portfolio volatility (as decimal, e.g., 0.15 for 15%)
 * @param {number} riskFreeRate - Risk-free rate (default: 0.045 for 4.5%)
 * @returns {number} - Sharpe ratio
 */
export const calculateSharpeRatio = (portfolioReturn, volatility, riskFreeRate = 0.045) => {
  if (volatility === 0) return 0;
  
  const excessReturn = portfolioReturn - riskFreeRate;
  return excessReturn / volatility;
};

// =============================================================================
// VOLATILITY ESTIMATION
// =============================================================================

/**
 * Estimate portfolio volatility based on regime and allocation
 * @param {string} marketRegime - Current market regime
 * @param {object} allocation - Portfolio allocation
 * @returns {number} - Estimated annualized volatility (as decimal)
 */
export const estimateVolatility = (marketRegime, allocation) => {
  const regime = getRegime(marketRegime);
  
  // Base volatility from regime
  let baseVolatility = regime.expectedVolatility || 0.15;
  
  // Adjust for low-volatility factor exposure
  let lowVolWeight = 0;
  let bondWeight = 0;
  let totalAllocation = 0;
  
  for (const [symbol, percentage] of Object.entries(allocation)) {
    const etf = ETF_UNIVERSE[symbol];
    if (!etf) continue;
    
    if (etf.factor === 'Low Vol') {
      lowVolWeight += percentage;
    }
    if (etf.factor === 'Bonds' || etf.factor === 'Inflation Protection' || etf.factor === 'Short Bonds') {
      bondWeight += percentage;
    }
    totalAllocation += percentage;
  }
  
  if (totalAllocation === 0) return baseVolatility;
  
  // Reduce volatility for low-vol and bond allocations
  const lowVolReduction = (lowVolWeight / totalAllocation) * 0.30; // 30% reduction
  const bondReduction = (bondWeight / totalAllocation) * 0.50; // 50% reduction
  
  const adjustedVolatility = baseVolatility * (1 - lowVolReduction - bondReduction);
  
  return Math.max(adjustedVolatility, 0.05); // Floor at 5%
};

// =============================================================================
// MAXIMUM DRAWDOWN
// =============================================================================

/**
 * Estimate maximum drawdown based on regime
 * @param {string} marketRegime - Current market regime
 * @returns {number} - Expected maximum drawdown (as positive decimal, e.g., 0.20 for -20%)
 */
export const estimateMaxDrawdown = (marketRegime) => {
  const regime = getRegime(marketRegime);
  return regime.maxDrawdown || 0.15;
};

// =============================================================================
// PORTFOLIO WEIGHTED METRICS
// =============================================================================

/**
 * Calculate weighted average expense ratio
 * @param {object} allocation - Portfolio allocation {symbol: percentage}
 * @returns {number} - Weighted expense ratio (as percentage, e.g., 0.12 for 0.12%)
 */
export const calculateWeightedExpenseRatio = (allocation) => {
  let weightedExpense = 0;
  let totalAllocation = 0;
  
  for (const [symbol, percentage] of Object.entries(allocation)) {
    const etf = ETF_UNIVERSE[symbol];
    if (!etf) continue;
    
    weightedExpense += (etf.expense || 0) * percentage;
    totalAllocation += percentage;
  }
  
  if (totalAllocation === 0) return 0;
  
  return weightedExpense / totalAllocation;
};

/**
 * Calculate weighted average yield
 * @param {object} allocation - Portfolio allocation {symbol: percentage}
 * @returns {number} - Weighted yield (as percentage, e.g., 3.5 for 3.5%)
 */
export const calculateWeightedYield = (allocation) => {
  let weightedYield = 0;
  let totalAllocation = 0;
  
  for (const [symbol, percentage] of Object.entries(allocation)) {
    const etf = ETF_UNIVERSE[symbol];
    if (!etf) continue;
    
    weightedYield += (etf.yield || 0) * percentage;
    totalAllocation += percentage;
  }
  
  if (totalAllocation === 0) return 0;
  
  return weightedYield / totalAllocation;
};

// =============================================================================
// INFORMATION RATIO
// =============================================================================

/**
 * Calculate Information Ratio (alpha / tracking error)
 * @param {number} alpha - Portfolio alpha vs benchmark
 * @param {number} trackingError - Tracking error (volatility of excess returns)
 * @returns {number} - Information ratio
 */
export const calculateInformationRatio = (alpha, trackingError) => {
  if (trackingError === 0) return 0;
  return alpha / trackingError;
};

// =============================================================================
// SORTINO RATIO
// =============================================================================

/**
 * Calculate Sortino ratio (like Sharpe but only penalizes downside volatility)
 * @param {number} portfolioReturn - Expected portfolio return
 * @param {number} downsideDeviation - Downside deviation (volatility of negative returns)
 * @param {number} riskFreeRate - Risk-free rate (default: 0.045)
 * @returns {number} - Sortino ratio
 */
export const calculateSortinoRatio = (portfolioReturn, downsideDeviation, riskFreeRate = 0.045) => {
  if (downsideDeviation === 0) return 0;
  
  const excessReturn = portfolioReturn - riskFreeRate;
  return excessReturn / downsideDeviation;
};

// =============================================================================
// CALMAR RATIO
// =============================================================================

/**
 * Calculate Calmar ratio (return / max drawdown)
 * @param {number} portfolioReturn - Expected portfolio return
 * @param {number} maxDrawdown - Maximum drawdown (as positive decimal)
 * @returns {number} - Calmar ratio
 */
export const calculateCalmarRatio = (portfolioReturn, maxDrawdown) => {
  if (maxDrawdown === 0) return 0;
  return portfolioReturn / maxDrawdown;
};

// =============================================================================
// RISK-ADJUSTED RETURN
// =============================================================================

/**
 * Calculate risk-adjusted return (return per unit of risk)
 * @param {number} portfolioReturn - Expected portfolio return
 * @param {number} volatility - Portfolio volatility
 * @returns {number} - Risk-adjusted return
 */
export const calculateRiskAdjustedReturn = (portfolioReturn, volatility) => {
  if (volatility === 0) return 0;
  return portfolioReturn / volatility;
};

// =============================================================================
// PORTFOLIO DIVERSIFICATION SCORE
// =============================================================================

/**
 * Calculate diversification score (0-100, higher is better)
 * @param {object} allocation - Portfolio allocation
 * @returns {number} - Diversification score
 */
export const calculateDiversificationScore = (allocation) => {
  const holdings = Object.keys(allocation).length;
  
  // Calculate Herfindahl index (concentration measure)
  let herfindahl = 0;
  let totalAllocation = 0;
  
  for (const percentage of Object.values(allocation)) {
    totalAllocation += percentage;
  }
  
  if (totalAllocation === 0) return 0;
  
  for (const percentage of Object.values(allocation)) {
    const weight = percentage / totalAllocation;
    herfindahl += weight * weight;
  }
  
  // Convert to diversification score (inverse of concentration)
  // Perfect diversification (equal weights) = 1/n
  // Maximum concentration (one holding) = 1
  const idealHerfindahl = 1 / holdings;
  const diversificationRatio = idealHerfindahl / herfindahl;
  
  // Scale to 0-100
  const score = Math.min(diversificationRatio * 100, 100);
  
  return score;
};

// =============================================================================
// FACTOR EXPOSURE ANALYSIS
// =============================================================================

/**
 * Analyze factor exposures in portfolio
 * @param {object} allocation - Portfolio allocation
 * @returns {object} - Factor exposure breakdown
 */
export const analyzeFactorExposure = (allocation) => {
  const factors = {
    growth: 0,
    value: 0,
    momentum: 0,
    quality: 0,
    'low-vol': 0,
    dividend: 0,
    international: 0,
    bonds: 0,
    alternatives: 0
  };
  
  let totalAllocation = 0;
  
  for (const [symbol, percentage] of Object.entries(allocation)) {
    const etf = ETF_UNIVERSE[symbol];
    if (!etf) continue;
    
    const factor = etf.factor.toLowerCase();
    
    // Map factor to category
    if (factor.includes('growth')) {
      factors.growth += percentage;
    } else if (factor.includes('value')) {
      factors.value += percentage;
    } else if (factor.includes('momentum')) {
      factors.momentum += percentage;
    } else if (factor.includes('quality')) {
      factors.quality += percentage;
    } else if (factor.includes('low vol')) {
      factors['low-vol'] += percentage;
    } else if (factor.includes('dividend')) {
      factors.dividend += percentage;
    } else if (factor.includes('international') || factor.includes('emerging')) {
      factors.international += percentage;
    } else if (factor.includes('bond')) {
      factors.bonds += percentage;
    } else if (factor.includes('gold') || factor.includes('commodit') || factor.includes('real estate')) {
      factors.alternatives += percentage;
    }
    
    totalAllocation += percentage;
  }
  
  // Normalize to percentages
  if (totalAllocation > 0) {
    for (const factor in factors) {
      factors[factor] = (factors[factor] / totalAllocation) * 100;
    }
  }
  
  return factors;
};

// =============================================================================
// EXPECTED INCOME CALCULATION
// =============================================================================

/**
 * Calculate expected annual income from portfolio
 * @param {object} allocation - Portfolio allocation {symbol: percentage}
 * @param {number} portfolioValue - Total portfolio value
 * @returns {number} - Expected annual income
 */
export const calculateExpectedIncome = (allocation, portfolioValue) => {
  const weightedYield = calculateWeightedYield(allocation);
  return portfolioValue * (weightedYield / 100);
};

/**
 * Calculate monthly income from portfolio
 * @param {object} allocation - Portfolio allocation
 * @param {number} portfolioValue - Total portfolio value
 * @returns {number} - Expected monthly income
 */
export const calculateMonthlyIncome = (allocation, portfolioValue) => {
  const annualIncome = calculateExpectedIncome(allocation, portfolioValue);
  return annualIncome / 12;
};

// =============================================================================
// PORTFOLIO REBALANCING ANALYSIS
// =============================================================================

/**
 * Calculate rebalancing needs
 * @param {object} currentAllocation - Current portfolio allocation
 * @param {object} targetAllocation - Target portfolio allocation
 * @param {number} threshold - Threshold for rebalancing trigger (default: 5%)
 * @returns {array} - Array of rebalancing trades needed
 */
export const analyzeRebalancingNeeds = (currentAllocation, targetAllocation, threshold = 5) => {
  const trades = [];
  
  const allSymbols = new Set([
    ...Object.keys(currentAllocation),
    ...Object.keys(targetAllocation)
  ]);
  
  for (const symbol of allSymbols) {
    const current = currentAllocation[symbol] || 0;
    const target = targetAllocation[symbol] || 0;
    const difference = target - current;
    
    if (Math.abs(difference) >= threshold) {
      const etf = ETF_UNIVERSE[symbol];
      trades.push({
        symbol,
        etf: etf || { name: 'Unknown', category: 'Unknown' },
        currentPercentage: current,
        targetPercentage: target,
        difference,
        action: difference > 0 ? 'BUY' : 'SELL',
        priority: Math.abs(difference)
      });
    }
  }
  
  // Sort by priority (largest differences first)
  trades.sort((a, b) => b.priority - a.priority);
  
  return trades;
};

// =============================================================================
// COMPREHENSIVE PORTFOLIO ANALYSIS
// =============================================================================

/**
 * Generate comprehensive portfolio metrics
 * @param {object} allocation - Portfolio allocation
 * @param {string} marketRegime - Current market regime
 * @param {string} rebalanceFrequency - Rebalancing frequency
 * @param {number} portfolioValue - Total portfolio value (optional)
 * @returns {object} - Complete portfolio analysis
 */
export const analyzePortfolio = (allocation, marketRegime, rebalanceFrequency = 'quarterly', portfolioValue = 0) => {
  // Calculate alpha components
  const alphaData = calculateAlpha(marketRegime, rebalanceFrequency);
  
  // Calculate other metrics
  const beta = calculateBeta(allocation);
  const volatility = estimateVolatility(marketRegime, allocation);
  const maxDrawdown = estimateMaxDrawdown(marketRegime);
  const sharpe = calculateSharpeRatio(alphaData.totalReturn / 100, volatility);
  const calmar = calculateCalmarRatio(alphaData.totalReturn / 100, maxDrawdown);
  
  // Portfolio composition
  const expenseRatio = calculateWeightedExpenseRatio(allocation);
  const yieldValue = calculateWeightedYield(allocation);
  const diversificationScore = calculateDiversificationScore(allocation);
  const factorExposure = analyzeFactorExposure(allocation);
  
  // Income calculations (if portfolio value provided)
  const annualIncome = portfolioValue > 0 ? calculateExpectedIncome(allocation, portfolioValue) : 0;
  const monthlyIncome = portfolioValue > 0 ? calculateMonthlyIncome(allocation, portfolioValue) : 0;
  
  return {
    // Returns
    expectedReturn: alphaData.totalReturn,
    baseReturn: alphaData.baseReturn,
    alpha: alphaData.totalAlpha,
    alphaBreakdown: {
      factor: alphaData.factorAlpha,
      tactical: alphaData.tacticalAlpha,
      tax: alphaData.taxAlpha,
      rebalance: alphaData.rebalanceAlpha
    },
    
    // Risk
    beta,
    volatility,
    maxDrawdown,
    
    // Risk-adjusted
    sharpe,
    calmar,
    riskAdjustedReturn: calculateRiskAdjustedReturn(alphaData.totalReturn / 100, volatility),
    
    // Composition
    expenseRatio,
    yieldValue,
    numberOfHoldings: Object.keys(allocation).length,
    diversificationScore,
    factorExposure,
    
    // Income
    annualIncome,
    monthlyIncome
  };
};

// =============================================================================
// EXPORT ALL
// =============================================================================
export default {
  calculateAlpha,
  calculateBeta,
  calculateSharpeRatio,
  estimateVolatility,
  estimateMaxDrawdown,
  calculateWeightedExpenseRatio,
  calculateWeightedYield,
  calculateInformationRatio,
  calculateSortinoRatio,
  calculateCalmarRatio,
  calculateRiskAdjustedReturn,
  calculateDiversificationScore,
  analyzeFactorExposure,
  calculateExpectedIncome,
  calculateMonthlyIncome,
  analyzeRebalancingNeeds,
  analyzePortfolio
};
