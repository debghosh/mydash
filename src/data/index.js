// =============================================================================
// ALPHATIC - DATA LAYER INDEX
// =============================================================================
// Central export point for all data modules
// Makes importing clean: import { ETF_UNIVERSE, MARKET_REGIMES } from './data'
// =============================================================================

// Export everything from constants
export * from './constants.js';

// Export everything from ETFs
export * from './etfs.js';

// Export everything from regimes
export * from './regimes.js';

// Export everything from allocations
export * from './allocations.js';

// Default exports for convenience
export { default as Constants } from './constants.js';
export { default as ETFs } from './etfs.js';
export { default as Regimes } from './regimes.js';
export { default as Allocations } from './allocations.js';
