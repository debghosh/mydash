// =============================================================================
// ALPHATIC - FORMATTERS
// =============================================================================
// Pure utility functions for formatting numbers, currencies, percentages
// No state, no side effects - just clean transformations
// =============================================================================

/**
 * Format a number as currency (USD)
 * @param {number} value - The numeric value
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} - Formatted currency string (e.g., "$1,234,567")
 */
export const formatCurrency = (value, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Format a number as percentage
 * @param {number} value - The numeric value (e.g., 0.075 for 7.5%)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @param {boolean} asDecimal - If true, value is already percentage (7.5 not 0.075)
 * @returns {string} - Formatted percentage string (e.g., "7.5%")
 */
export const formatPercentage = (value, decimals = 1, asDecimal = true) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%';
  }
  
  const percentValue = asDecimal ? value : value * 100;
  return `${percentValue.toFixed(decimals)}%`;
};

/**
 * Format large numbers with K/M/B suffixes
 * @param {number} value - The numeric value
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} - Formatted string (e.g., "$1.2M", "$45.3K")
 */
export const formatLargeNumber = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0';
  }
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1000000000) {
    return `${sign}$${(absValue / 1000000000).toFixed(decimals)}B`;
  } else if (absValue >= 1000000) {
    return `${sign}$${(absValue / 1000000).toFixed(decimals)}M`;
  } else if (absValue >= 1000) {
    return `${sign}$${(absValue / 1000).toFixed(decimals)}K`;
  }
  
  return formatCurrency(value, 0);
};

/**
 * Format number with commas (no currency symbol)
 * @param {number} value - The numeric value
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} - Formatted number string (e.g., "1,234,567")
 */
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Format basis points (1 bp = 0.01%)
 * @param {number} basisPoints - The basis points value
 * @returns {string} - Formatted string (e.g., "50 bps" or "0.50%")
 */
export const formatBasisPoints = (basisPoints) => {
  if (basisPoints === null || basisPoints === undefined || isNaN(basisPoints)) {
    return '0 bps';
  }
  
  if (Math.abs(basisPoints) >= 100) {
    return formatPercentage(basisPoints / 100, 2);
  }
  
  return `${basisPoints.toFixed(0)} bps`;
};

/**
 * Format tax rate (combines percentage with descriptor)
 * @param {number} rate - Tax rate as decimal (e.g., 0.24 for 24%)
 * @returns {string} - Formatted string (e.g., "24% (24% bracket)")
 */
export const formatTaxRate = (rate) => {
  if (rate === null || rate === undefined || isNaN(rate)) {
    return '0%';
  }
  
  const percentage = (rate * 100).toFixed(1);
  return `${percentage}%`;
};

/**
 * Format age with years label
 * @param {number} age - Age in years
 * @returns {string} - Formatted string (e.g., "65 years old")
 */
export const formatAge = (age) => {
  if (age === null || age === undefined || isNaN(age)) {
    return 'N/A';
  }
  
  return `${age} years old`;
};

/**
 * Format year (for timeline displays)
 * @param {number} year - The year
 * @returns {string} - Formatted year string
 */
export const formatYear = (year) => {
  if (year === null || year === undefined || isNaN(year)) {
    return 'N/A';
  }
  
  return year.toString();
};

/**
 * Format returns with +/- sign
 * @param {number} value - The return value (e.g., 0.075 for 7.5%)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @param {boolean} asDecimal - If true, value is already percentage
 * @returns {string} - Formatted string with sign (e.g., "+7.5%", "-2.3%")
 */
export const formatReturn = (value, decimals = 1, asDecimal = true) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%';
  }
  
  const percentValue = asDecimal ? value : value * 100;
  const sign = percentValue >= 0 ? '+' : '';
  return `${sign}${percentValue.toFixed(decimals)}%`;
};

/**
 * Format Sharpe ratio
 * @param {number} sharpe - The Sharpe ratio
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted Sharpe ratio
 */
export const formatSharpe = (sharpe, decimals = 2) => {
  if (sharpe === null || sharpe === undefined || isNaN(sharpe)) {
    return 'N/A';
  }
  
  return sharpe.toFixed(decimals);
};

/**
 * Format alpha/beta values
 * @param {number} value - The alpha or beta value
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted value
 */
export const formatAlphaBeta = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  return value.toFixed(decimals);
};

/**
 * Format expense ratio
 * @param {number} ratio - Expense ratio as decimal (e.g., 0.0003 for 0.03%)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted expense ratio
 */
export const formatExpenseRatio = (ratio, decimals = 2) => {
  if (ratio === null || ratio === undefined || isNaN(ratio)) {
    return '0.00%';
  }
  
  return `${(ratio).toFixed(decimals)}%`;
};

/**
 * Format yield
 * @param {number} yieldValue - Yield as percentage (e.g., 3.8 for 3.8%)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} - Formatted yield
 */
export const formatYield = (yieldValue, decimals = 1) => {
  if (yieldValue === null || yieldValue === undefined || isNaN(yieldValue)) {
    return '0.0%';
  }
  
  return `${yieldValue.toFixed(decimals)}%`;
};

/**
 * Format time period (years)
 * @param {number} years - Number of years
 * @returns {string} - Formatted string (e.g., "10 years", "1 year")
 */
export const formatTimePeriod = (years) => {
  if (years === null || years === undefined || isNaN(years)) {
    return 'N/A';
  }
  
  return years === 1 ? '1 year' : `${years} years`;
};

/**
 * Format compact currency (for tables/charts)
 * @param {number} value - The numeric value
 * @returns {string} - Compact formatted string (e.g., "$1.2M", "$850K")
 */
export const formatCompactCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0';
  }
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1000000) {
    return `${sign}$${(absValue / 1000000).toFixed(1)}M`;
  } else if (absValue >= 1000) {
    return `${sign}$${(absValue / 1000).toFixed(0)}K`;
  }
  
  return `${sign}$${absValue.toFixed(0)}`;
};

/**
 * Format dollar amount with appropriate precision
 * @param {number} value - The numeric value
 * @returns {string} - Formatted currency with smart precision
 */
export const formatSmartCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0';
  }
  
  const absValue = Math.abs(value);
  
  // Large amounts: no decimals
  if (absValue >= 1000) {
    return formatCurrency(value, 0);
  }
  
  // Medium amounts: 2 decimals
  if (absValue >= 1) {
    return formatCurrency(value, 2);
  }
  
  // Small amounts: up to 4 decimals
  return formatCurrency(value, 4);
};

/**
 * Format portfolio allocation percentage
 * @param {number} percentage - Percentage value (e.g., 25 for 25%)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} - Formatted allocation
 */
export const formatAllocation = (percentage, decimals = 1) => {
  if (percentage === null || percentage === undefined || isNaN(percentage)) {
    return '0.0%';
  }
  
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Format date as year only
 * @param {Date|string|number} date - Date object, string, or year number
 * @returns {string} - Formatted year
 */
export const formatDateYear = (date) => {
  if (!date) return 'N/A';
  
  if (typeof date === 'number') {
    return date.toString();
  }
  
  if (typeof date === 'string') {
    const yearMatch = date.match(/\d{4}/);
    return yearMatch ? yearMatch[0] : 'N/A';
  }
  
  if (date instanceof Date) {
    return date.getFullYear().toString();
  }
  
  return 'N/A';
};

/**
 * Format volatility (standard deviation)
 * @param {number} volatility - Volatility as decimal (e.g., 0.15 for 15%)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} - Formatted volatility
 */
export const formatVolatility = (volatility, decimals = 1) => {
  if (volatility === null || volatility === undefined || isNaN(volatility)) {
    return '0.0%';
  }
  
  return `${(volatility * 100).toFixed(decimals)}%`;
};

/**
 * Format drawdown (always shown as negative)
 * @param {number} drawdown - Drawdown as decimal (e.g., 0.20 for -20%)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} - Formatted drawdown with minus sign
 */
export const formatDrawdown = (drawdown, decimals = 1) => {
  if (drawdown === null || drawdown === undefined || isNaN(drawdown)) {
    return '0.0%';
  }
  
  const absDrawdown = Math.abs(drawdown);
  return `-${(absDrawdown * 100).toFixed(decimals)}%`;
};

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string (e.g., "$1,234.56")
 * @returns {number} - Numeric value
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString || typeof currencyString !== 'string') {
    return 0;
  }
  
  // Remove $ and commas, parse as float
  const cleaned = currencyString.replace(/[$,]/g, '');
  const value = parseFloat(cleaned);
  
  return isNaN(value) ? 0 : value;
};

/**
 * Parse percentage string to number
 * @param {string} percentageString - Percentage string (e.g., "7.5%")
 * @returns {number} - Numeric value as decimal (e.g., 0.075)
 */
export const parsePercentage = (percentageString) => {
  if (!percentageString || typeof percentageString !== 'string') {
    return 0;
  }
  
  // Remove % and parse as float, then divide by 100
  const cleaned = percentageString.replace(/%/g, '');
  const value = parseFloat(cleaned);
  
  return isNaN(value) ? 0 : value / 100;
};

/**
 * Format a range of values
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {Function} formatter - Formatter function (default: formatCurrency)
 * @returns {string} - Formatted range (e.g., "$100K - $150K")
 */
export const formatRange = (min, max, formatter = formatCompactCurrency) => {
  if (min === null || min === undefined || max === null || max === undefined) {
    return 'N/A';
  }
  
  return `${formatter(min)} - ${formatter(max)}`;
};

/**
 * Format duration in years and months
 * @param {number} years - Total years (can be decimal, e.g., 2.5)
 * @returns {string} - Formatted duration (e.g., "2 years, 6 months")
 */
export const formatDuration = (years) => {
  if (years === null || years === undefined || isNaN(years)) {
    return 'N/A';
  }
  
  const wholeYears = Math.floor(years);
  const months = Math.round((years - wholeYears) * 12);
  
  if (wholeYears === 0) {
    return months === 1 ? '1 month' : `${months} months`;
  }
  
  if (months === 0) {
    return wholeYears === 1 ? '1 year' : `${wholeYears} years`;
  }
  
  const yearStr = wholeYears === 1 ? '1 year' : `${wholeYears} years`;
  const monthStr = months === 1 ? '1 month' : `${months} months`;
  
  return `${yearStr}, ${monthStr}`;
};

// =============================================================================
// ALIASES FOR BACKWARD COMPATIBILITY
// =============================================================================
/**
 * Alias for formatPercentage (for backward compatibility)
 */
export const formatPercent = formatPercentage;

// =============================================================================
// EXPORT ALL
// =============================================================================
export default {
  formatCurrency,
  formatPercentage,
  formatPercent, // Alias for formatPercentage
  formatLargeNumber,
  formatNumber,
  formatBasisPoints,
  formatTaxRate,
  formatAge,
  formatYear,
  formatReturn,
  formatSharpe,
  formatAlphaBeta,
  formatExpenseRatio,
  formatYield,
  formatTimePeriod,
  formatCompactCurrency,
  formatSmartCurrency,
  formatAllocation,
  formatDateYear,
  formatVolatility,
  formatDrawdown,
  parseCurrency,
  parsePercentage,
  formatRange,
  formatDuration
};
