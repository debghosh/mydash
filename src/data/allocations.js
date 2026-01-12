// =============================================================================
// ALPHATIC - REGIME-BASED PORTFOLIO ALLOCATIONS
// =============================================================================
// Tactical asset allocation recommendations for each market regime
// Optimized for risk-adjusted returns in different market environments
// =============================================================================

import { MARKET_REGIMES } from './regimes.js';
import { ETF_UNIVERSE } from './etfs.js';

// =============================================================================
// REGIME-BASED ALLOCATIONS (Using 63-ETF Universe)
// =============================================================================

export const REGIME_ALLOCATIONS = {
  // ===========================================================================
  // GOLDILOCKS: Full Risk-On
  // ===========================================================================
  goldilocks: {
    // Core Growth (50%)
    'VUG': 20,    // Vanguard Growth
    'QQQ': 15,    // Nasdaq-100
    'SCHG': 10,   // Schwab Growth
    'VGT': 5,     // Tech sector
    
    // Quality & Dividend Growth (25%)
    'QUAL': 10,   // Quality factor
    'VIG': 10,    // Dividend appreciation
    'DGRO': 5,    // Dividend growth
    
    // Small Cap & Momentum (15%)
    'VB': 5,      // Small cap
    'MTUM': 5,    // Momentum
    'IWM': 5,     // Russell 2000
    
    // International (8%)
    'VEA': 5,     // Developed markets
    'VWO': 3,     // Emerging markets
    
    // Minimal Defensive (2%)
    'SHY': 2      // Short-term bonds (cash proxy)
  },

  // ===========================================================================
  // BOOM: Growth with Caution
  // ===========================================================================
  boom: {
    // Core Balanced (40%)
    'VOO': 15,    // S&P 500
    'VIG': 12,    // Dividend appreciation
    'QUAL': 8,    // Quality
    'VUG': 5,     // Growth
    
    // Value & Dividend (30%)
    'SCHD': 12,   // Dividend equity
    'VYM': 8,     // High dividend
    'VTV': 6,     // Value
    'DGRO': 4,    // Dividend growth
    
    // Low Vol & Quality (15%)
    'USMV': 9,    // Min volatility
    'SPHD': 6,    // High div + low vol
    
    // International (8%)
    'VEA': 5,     // Developed
    'VGK': 3,     // Europe
    
    // Defensive (7%)
    'BND': 4,     // Total bond
    'GLD': 3      // Gold
  },

  // ===========================================================================
  // UNCERTAINTY: Maximum Defense
  // ===========================================================================
  uncertainty: {
    // Quality Dividend (40%)
    'SCHD': 15,   // Quality dividend
    'VYM': 10,    // High dividend
    'VIG': 8,     // Dividend appreciation
    'HDV': 7,     // Core high dividend
    
    // Low Volatility (25%)
    'USMV': 12,   // Min volatility
    'SPHD': 8,    // Low vol + high div
    'QUAL': 5,    // Quality
    
    // Core Defensive (20%)
    'VOO': 10,    // S&P 500 (reduced)
    'VTV': 8,     // Value
    'IVE': 2,     // S&P 500 Value
    
    // Bonds & Gold (15%)
    'BND': 8,     // Total bond
    'GLD': 5,     // Gold
    'SHY': 2      // Short bonds
  },

  // ===========================================================================
  // GRIND: Balanced Quality
  // ===========================================================================
  grind: {
    // Core Holdings (35%)
    'VOO': 15,    // S&P 500
    'VTI': 10,    // Total market
    'QUAL': 7,    // Quality
    'VIG': 3,     // Dividend appreciation
    
    // Dividend & Value (30%)
    'SCHD': 13,   // Dividend equity
    'VYM': 8,     // High dividend
    'VTV': 6,     // Value
    'DGRO': 3,    // Dividend growth
    
    // Low Vol & Defensive (20%)
    'USMV': 9,    // Min volatility
    'SPHD': 6,    // Low vol dividend
    'BND': 5,     // Bonds
    
    // International (10%)
    'VEA': 6,     // Developed
    'VWO': 2,     // Emerging
    'VGK': 2,     // Europe
    
    // Alternatives (5%)
    'GLD': 4,     // Gold
    'SHY': 1      // Short bonds
  },

  // ===========================================================================
  // CRISIS: Maximum Safety
  // ===========================================================================
  crisis: {
    // Quality Dividend (35%)
    'SCHD': 20,   // Quality dividend (best defense)
    'VYM': 8,     // High dividend
    'HDV': 7,     // Core high dividend
    
    // Low Volatility (25%)
    'USMV': 15,   // Min volatility
    'SPHD': 10,   // Low vol dividend
    
    // Core Defensive (15%)
    'VOO': 10,    // S&P 500 (minimal)
    'QUAL': 5,    // Quality
    
    // Bonds (20%)
    'BND': 10,    // Total bond
    'TLT': 5,     // Long Treasury
    'IEF': 3,     // Intermediate Treasury
    'SHY': 2,     // Short bonds
    
    // Safe Haven (5%)
    'GLD': 5      // Gold
  }
};

// =============================================================================
// INCOME-FOCUSED ALLOCATIONS (For Early Retirement)
// =============================================================================

export const INCOME_ALLOCATIONS = {
  'conservative-income': {
    // High Income (50%)
    'JEPI': 20,   // Covered calls equity
    'SCHD': 15,   // Quality dividend
    'VYM': 10,    // High dividend
    'JEPQ': 5,    // Covered calls Nasdaq
    
    // Stability (30%)
    'USMV': 15,   // Low volatility
    'QUAL': 10,   // Quality
    'VIG': 5,     // Dividend growth
    
    // Bonds (20%)
    'BND': 10,    // Total bond
    'TIP': 5,     // TIPS
    'SHY': 5      // Short bonds
  },
  
  'moderate-income': {
    // High Income (40%)
    'JEPI': 15,   // Covered calls
    'SCHD': 15,   // Quality dividend
    'JEPQ': 5,    // Covered calls Nasdaq
    'VYM': 5,     // High dividend
    
    // Growth + Income (35%)
    'VOO': 15,    // Core S&P 500
    'VIG': 10,    // Dividend appreciation
    'QUAL': 10,   // Quality
    
    // Defensive (25%)
    'USMV': 10,   // Low vol
    'BND': 10,    // Bonds
    'GLD': 5      // Gold
  },
  
  'aggressive-income': {
    // Maximum Income (60%)
    'JEPI': 20,   // Covered calls
    'JEPQ': 15,   // Covered calls Nasdaq
    'SCHD': 15,   // Quality dividend
    'QYLD': 5,    // QQQ covered calls
    'VYM': 5,     // High dividend
    
    // Growth (25%)
    'VOO': 15,    // S&P 500
    'QQQ': 10,    // Nasdaq
    
    // Stability (15%)
    'USMV': 10,   // Low vol
    'BND': 5      // Bonds
  }
};

// =============================================================================
// GOAL-BASED ALLOCATIONS
// =============================================================================

export const GOAL_ALLOCATIONS = {
  'max-growth': {
    'VUG': 25,    // Growth
    'QQQ': 20,    // Nasdaq
    'SCHG': 15,   // Growth
    'VGT': 15,    // Tech
    'MTUM': 10,   // Momentum
    'VB': 10,     // Small cap
    'VWO': 5      // Emerging
  },
  
  'growth-income': {
    'VOO': 25,    // Core
    'SCHD': 20,   // Dividend
    'VIG': 15,    // Div growth
    'JEPI': 15,   // Income
    'QUAL': 10,   // Quality
    'VEA': 10,    // International
    'BND': 5      // Bonds
  },
  
  'balanced': {
    'VOO': 25,    // Core
    'VTI': 15,    // Total market
    'SCHD': 15,   // Dividend
    'VIG': 10,    // Div growth
    'BND': 15,    // Bonds
    'VEA': 10,    // International
    'USMV': 5,    // Low vol
    'GLD': 5      // Gold
  },
  
  'conservative': {
    'USMV': 20,   // Low vol
    'SCHD': 20,   // Dividend
    'BND': 25,    // Bonds
    'SHY': 10,    // Short bonds
    'VIG': 10,    // Div growth
    'IEF': 10,    // Intermediate bonds
    'GLD': 5      // Gold
  },
  
  'early-retirement': {
    'JEPI': 25,   // High income
    'SCHD': 20,   // Quality dividend
    'VYM': 15,    // High dividend
    'USMV': 15,   // Low vol
    'BND': 15,    // Bonds
    'VIG': 5,     // Div growth
    'GLD': 5      // Gold
  }
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get allocation for a specific regime
 */
export const getAllocationByRegime = (regimeId) => {
  return REGIME_ALLOCATIONS[regimeId] || REGIME_ALLOCATIONS.uncertainty;
};

/**
 * Get allocation for a specific goal
 */
export const getAllocationByGoal = (goalId) => {
  return GOAL_ALLOCATIONS[goalId] || GOAL_ALLOCATIONS.balanced;
};

/**
 * Get income-focused allocation
 */
export const getIncomeAllocation = (incomeStyle) => {
  return INCOME_ALLOCATIONS[incomeStyle] || INCOME_ALLOCATIONS['moderate-income'];
};

/**
 * Validate allocation sums to 100%
 */
export const validateAllocation = (allocation) => {
  const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
  const tolerance = 0.01; // Allow 1% rounding error
  return Math.abs(total - 100) < tolerance;
};

/**
 * Normalize allocation to sum to 100%
 */
export const normalizeAllocation = (allocation) => {
  const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
  if (total === 0) return allocation;
  
  const normalized = {};
  for (const [symbol, value] of Object.entries(allocation)) {
    normalized[symbol] = (value / total) * 100;
  }
  return normalized;
};

/**
 * Blend multiple allocations with weights
 */
export const blendAllocations = (allocations, weights) => {
  if (allocations.length !== weights.length) {
    throw new Error('Allocations and weights arrays must have same length');
  }
  
  // Normalize weights
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const normalizedWeights = weights.map(w => w / totalWeight);
  
  // Blend allocations
  const blended = {};
  allocations.forEach((allocation, idx) => {
    const weight = normalizedWeights[idx];
    for (const [symbol, value] of Object.entries(allocation)) {
      blended[symbol] = (blended[symbol] || 0) + (value * weight);
    }
  });
  
  return blended;
};

/**
 * Get allocation details with ETF info
 */
export const getAllocationDetails = (allocation) => {
  return Object.entries(allocation).map(([symbol, percentage]) => {
    const etf = ETF_UNIVERSE[symbol];
    return {
      symbol,
      percentage,
      etf: etf || { name: 'Unknown', category: 'Unknown' }
    };
  }).sort((a, b) => b.percentage - a.percentage);
};

/**
 * Calculate portfolio statistics from allocation
 */
export const calculatePortfolioStats = (allocation) => {
  const details = getAllocationDetails(allocation);
  
  let totalExpense = 0;
  let totalYield = 0;
  let totalAllocation = 0;
  
  details.forEach(({ percentage, etf }) => {
    if (!etf || !etf.expense || !etf.yield) return;
    totalExpense += etf.expense * (percentage / 100);
    totalYield += etf.yield * (percentage / 100);
    totalAllocation += percentage;
  });
  
  return {
    weightedExpenseRatio: totalExpense,
    weightedYield: totalYield,
    totalAllocation: totalAllocation,
    numberOfHoldings: details.length
  };
};

/**
 * Suggest rebalancing trades
 */
export const suggestRebalancing = (currentAllocation, targetAllocation, threshold = 5) => {
  const trades = [];
  
  // Get all symbols
  const allSymbols = new Set([
    ...Object.keys(currentAllocation),
    ...Object.keys(targetAllocation)
  ]);
  
  allSymbols.forEach(symbol => {
    const current = currentAllocation[symbol] || 0;
    const target = targetAllocation[symbol] || 0;
    const diff = target - current;
    
    // Only suggest trade if difference exceeds threshold
    if (Math.abs(diff) >= threshold) {
      trades.push({
        symbol,
        action: diff > 0 ? 'BUY' : 'SELL',
        currentPercentage: current,
        targetPercentage: target,
        difference: diff,
        etf: ETF_UNIVERSE[symbol]
      });
    }
  });
  
  // Sort by absolute difference (largest rebalancing needs first)
  trades.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
  
  return trades;
};

// =============================================================================
// EXPORT DEFAULT
// =============================================================================
export default {
  REGIME_ALLOCATIONS,
  INCOME_ALLOCATIONS,
  GOAL_ALLOCATIONS,
  getAllocationByRegime,
  getAllocationByGoal,
  getIncomeAllocation,
  validateAllocation,
  normalizeAllocation,
  blendAllocations,
  getAllocationDetails,
  calculatePortfolioStats,
  suggestRebalancing
};
