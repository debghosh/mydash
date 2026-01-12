// =============================================================================
// ALPHATIC - MARKET REGIME DEFINITIONS
// =============================================================================
// Comprehensive market regime framework combining:
// - Trend (Bull/Bear/Sideways)
// - Volatility (VIX levels)
// - Inflation environment
// - Risk sentiment
// =============================================================================

export const MARKET_REGIMES = {
  goldilocks: {
    id: 'goldilocks',
    name: 'Goldilocks',
    description: 'Bull market + Low volatility + Low inflation + Risk-on',
    
    // Market characteristics
    trend: 'Up',
    volatility: 'Low (VIX <15)',
    inflation: 'Low (<2.5%)',
    sentiment: 'Risk-On',
    
    // Specific indicators
    indicators: 'S&P up 15%+, VIX <15, CPI <2.5%, credit spreads tight',
    
    // Expected returns
    baseReturn: 14.0,     // Market beta return
    factorAlpha: 0.5,     // Factor tilt alpha
    tacticalAlpha: 0.3,   // Tactical allocation alpha
    
    // Risk metrics
    expectedVolatility: 0.12,  // 12% volatility
    maxDrawdown: 0.05,         // 5% max drawdown
    sharpeRatio: 1.2,
    
    // Visual
    color: 'green',
    bgColor: 'from-green-900/20 to-green-800/20',
    borderColor: 'border-green-600/30',
    textColor: 'text-green-400',
    
    // Strategy recommendations
    strategy: 'Full risk-on: Growth, momentum, small-cap. Minimal defensive.',
    preferredFactors: ['growth', 'momentum', 'small-cap'],
    avoidFactors: ['defensive', 'bonds'],
    
    // Historical examples
    examples: '1995-1996, 2013, 2017, 2019, 2021'
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
    
    baseReturn: 11.0,
    factorAlpha: 0.8,
    tacticalAlpha: 0.5,
    
    expectedVolatility: 0.16,
    maxDrawdown: 0.08,
    sharpeRatio: 0.9,
    
    color: 'yellow',
    bgColor: 'from-yellow-900/20 to-yellow-800/20',
    borderColor: 'border-yellow-600/30',
    textColor: 'text-yellow-400',
    
    strategy: 'Stay invested but add quality, value, and defensive. Reduce momentum.',
    preferredFactors: ['value', 'quality', 'dividend'],
    avoidFactors: ['momentum', 'aggressive-growth'],
    
    examples: '1999, 2007, 2018 (early), 2022 (early)'
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
    
    baseReturn: 7.0,
    factorAlpha: 1.2,
    tacticalAlpha: 0.7,
    
    expectedVolatility: 0.20,
    maxDrawdown: 0.15,
    sharpeRatio: 0.5,
    
    color: 'orange',
    bgColor: 'from-orange-900/20 to-orange-800/20',
    borderColor: 'border-orange-600/30',
    textColor: 'text-orange-400',
    
    strategy: 'Defensive positioning: Low-vol, quality, dividends. Reduce growth exposure.',
    preferredFactors: ['low-vol', 'quality', 'dividend', 'value'],
    avoidFactors: ['growth', 'momentum', 'small-cap'],
    
    examples: '2011, 2015-2016, 2018 (late), 2022'
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
    
    baseReturn: 8.0,
    factorAlpha: 1.0,
    tacticalAlpha: 0.4,
    
    expectedVolatility: 0.14,
    maxDrawdown: 0.12,
    sharpeRatio: 0.7,
    
    color: 'blue',
    bgColor: 'from-blue-900/20 to-blue-800/20',
    borderColor: 'border-blue-600/30',
    textColor: 'text-blue-400',
    
    strategy: 'Balanced approach: Quality + dividend growth. Avoid extreme tilts.',
    preferredFactors: ['quality', 'dividend-growth', 'balanced'],
    avoidFactors: ['aggressive-growth', 'momentum'],
    
    examples: '2012, 2014, 2023 (early)'
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
    
    baseReturn: -5.0,
    factorAlpha: 2.5,
    tacticalAlpha: 1.5,
    
    expectedVolatility: 0.30,
    maxDrawdown: 0.30,
    sharpeRatio: -0.2,
    
    color: 'red',
    bgColor: 'from-red-900/20 to-red-800/20',
    borderColor: 'border-red-600/30',
    textColor: 'text-red-400',
    
    strategy: 'Maximum defense: Quality dividends, low-vol, bonds, gold. Avoid growth.',
    preferredFactors: ['low-vol', 'dividend', 'bonds', 'gold'],
    avoidFactors: ['growth', 'small-cap', 'momentum', 'aggressive'],
    
    examples: '2000-2002, 2008-2009, 2020 (March), 2022 (Q3-Q4)'
  }
};

// =============================================================================
// REGIME DETECTION HELPERS
// =============================================================================

/**
 * Detect current market regime based on indicators
 * This would be enhanced with real-time data in production
 */
export const detectMarketRegime = (indicators) => {
  const {
    spReturn,      // S&P 500 YTD return
    vix,           // Current VIX level
    cpi,           // Current CPI inflation
    creditSpreads, // Investment-grade spreads
    trend          // Manual override
  } = indicators;
  
  // Manual override if provided
  if (trend) return trend;
  
  // Crisis detection (highest priority)
  if (vix > 30 && spReturn < -10) {
    return 'crisis';
  }
  
  // Goldilocks detection
  if (vix < 15 && spReturn > 15 && cpi < 2.5) {
    return 'goldilocks';
  }
  
  // Boom detection
  if (spReturn > 10 && spReturn < 20 && vix >= 15 && vix < 25) {
    return 'boom';
  }
  
  // Uncertainty detection
  if (vix > 20 && Math.abs(spReturn) < 10) {
    return 'uncertainty';
  }
  
  // Default to grind
  return 'grind';
};

/**
 * Get regime by ID
 */
export const getRegime = (regimeId) => {
  return MARKET_REGIMES[regimeId] || MARKET_REGIMES.uncertainty;
};

/**
 * Get all regime IDs
 */
export const getAllRegimeIds = () => {
  return Object.keys(MARKET_REGIMES);
};

/**
 * Get regime color scheme
 */
export const getRegimeColors = (regimeId) => {
  const regime = MARKET_REGIMES[regimeId] || MARKET_REGIMES.uncertainty;
  return {
    color: regime.color,
    bgColor: regime.bgColor,
    borderColor: regime.borderColor,
    textColor: regime.textColor
  };
};

/**
 * Calculate expected returns for a regime
 */
export const getRegimeReturns = (regimeId) => {
  const regime = MARKET_REGIMES[regimeId] || MARKET_REGIMES.uncertainty;
  return {
    baseReturn: regime.baseReturn,
    factorAlpha: regime.factorAlpha,
    tacticalAlpha: regime.tacticalAlpha,
    totalReturn: regime.baseReturn + regime.factorAlpha + regime.tacticalAlpha
  };
};

/**
 * Get strategy recommendations for a regime
 */
export const getRegimeStrategy = (regimeId) => {
  const regime = MARKET_REGIMES[regimeId] || MARKET_REGIMES.uncertainty;
  return {
    strategy: regime.strategy,
    preferredFactors: regime.preferredFactors,
    avoidFactors: regime.avoidFactors
  };
};

// =============================================================================
// REGIME TRANSITION MATRIX
// =============================================================================
// Probability of transitioning from one regime to another
// Based on historical patterns (simplified)

export const REGIME_TRANSITIONS = {
  goldilocks: {
    goldilocks: 0.60, // 60% chance of staying
    boom: 0.25,       // 25% chance of heating up
    grind: 0.10,      // 10% chance of cooling
    uncertainty: 0.04,
    crisis: 0.01
  },
  boom: {
    boom: 0.50,
    uncertainty: 0.25,
    crisis: 0.15,
    goldilocks: 0.05,
    grind: 0.05
  },
  uncertainty: {
    uncertainty: 0.40,
    grind: 0.25,
    crisis: 0.20,
    goldilocks: 0.10,
    boom: 0.05
  },
  grind: {
    grind: 0.50,
    goldilocks: 0.25,
    uncertainty: 0.15,
    boom: 0.08,
    crisis: 0.02
  },
  crisis: {
    crisis: 0.30,
    uncertainty: 0.35,
    grind: 0.20,
    goldilocks: 0.10,
    boom: 0.05
  }
};

/**
 * Get transition probabilities from current regime
 */
export const getTransitionProbabilities = (currentRegime) => {
  return REGIME_TRANSITIONS[currentRegime] || REGIME_TRANSITIONS.uncertainty;
};

// =============================================================================
// EXPORT DEFAULT
// =============================================================================
export default {
  MARKET_REGIMES,
  detectMarketRegime,
  getRegime,
  getAllRegimeIds,
  getRegimeColors,
  getRegimeReturns,
  getRegimeStrategy,
  REGIME_TRANSITIONS,
  getTransitionProbabilities
};
