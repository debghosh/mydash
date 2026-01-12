// =============================================================================
// ALPHATIC - UTILS LAYER INDEX
// =============================================================================
// Central export point for all utility functions
// Makes importing clean: import { formatCurrency, calculateAlpha } from './utils'
// =============================================================================

// Export everything from formatters
export * from './formatters.js';

// Export everything from portfolioMetrics
export * from './portfolioMetrics.js';

// Export everything from taxCalculations
export * from './taxCalculations.js';

// Export everything from rothProjections
export * from './rothProjections.js';

// Export everything from incomeProjections
export * from './incomeProjections.js';

// Default exports for convenience
export { default as Formatters } from './formatters.js';
export { default as PortfolioMetrics } from './portfolioMetrics.js';
export { default as TaxCalculations } from './taxCalculations.js';
export { default as RothProjections } from './rothProjections.js';
export { default as IncomeProjections } from './incomeProjections.js';
