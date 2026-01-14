// =============================================================================
// ALPHATIC - INPUT VALIDATORS
// =============================================================================
// Comprehensive validation for all user inputs
// Prevents crashes, data corruption, and security issues
// =============================================================================

export class ValidationError extends Error {
  constructor(field, message, value) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

// =============================================================================
// NUMBER VALIDATION
// =============================================================================

/**
 * Validate and sanitize a numeric amount
 * @param {*} value - The value to validate
 * @param {string} field - Field name for error messages
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Sanitized number
 * @throws {ValidationError} If validation fails
 */
export const validateAmount = (value, field, min = 0, max = 1e9) => {
  // Check for null/undefined
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(field, `${field} is required`, value);
  }
  
  // Convert to number
  const num = typeof value === 'number' ? value : parseFloat(value);
  
  // Check if it's a valid number
  if (isNaN(num)) {
    throw new ValidationError(field, `${field} must be a valid number`, value);
  }
  
  // Check if finite
  if (!Number.isFinite(num)) {
    throw new ValidationError(field, `${field} must be finite`, value);
  }
  
  // Check range
  if (num < min) {
    throw new ValidationError(field, `${field} must be at least ${min}`, value);
  }
  
  if (num > max) {
    throw new ValidationError(field, `${field} cannot exceed ${max}`, value);
  }
  
  return num;
};

/**
 * Validate percentage (0-100)
 */
export const validatePercentage = (value, field) => {
  return validateAmount(value, field, 0, 100);
};

/**
 * Validate rate (0-1)
 */
export const validateRate = (value, field) => {
  return validateAmount(value, field, 0, 1);
};

/**
 * Validate age
 */
export const validateAge = (value, field = 'age') => {
  const age = validateAmount(value, field, 18, 120);
  return Math.round(age);
};

// =============================================================================
// PORTFOLIO VALIDATION
// =============================================================================

/**
 * Validate portfolio allocation
 * @param {Object} allocation - Allocation object {symbol: weight}
 * @returns {Object} Validated allocation
 * @throws {ValidationError} If validation fails
 */
export const validatePortfolioAllocation = (allocation) => {
  if (!allocation || typeof allocation !== 'object') {
    throw new ValidationError('allocation', 'Allocation must be an object', allocation);
  }
  
  // Check for empty allocation
  const symbols = Object.keys(allocation);
  if (symbols.length === 0) {
    throw new ValidationError('allocation', 'Portfolio cannot be empty', allocation);
  }
  
  // Validate each weight
  const validated = {};
  for (const [symbol, weight] of Object.entries(allocation)) {
    try {
      validated[symbol] = validatePercentage(weight, `${symbol} weight`);
    } catch (err) {
      throw new ValidationError(
        'allocation',
        `Invalid weight for ${symbol}: ${err.message}`,
        allocation
      );
    }
  }
  
  // Check total
  const total = Object.values(validated).reduce((sum, val) => sum + val, 0);
  
  // Allow small rounding errors (0.1%)
  if (Math.abs(total - 100) > 0.1) {
    throw new ValidationError(
      'allocation',
      `Portfolio must sum to 100%, currently ${total.toFixed(2)}%`,
      allocation
    );
  }
  
  return validated;
};

/**
 * Validate portfolio amounts
 */
export const validatePortfolioAmounts = (amounts) => {
  const { taxableAmount, iraAmount, rothAmount } = amounts;
  
  // Validate each amount
  const validated = {
    taxableAmount: validateAmount(taxableAmount, 'Taxable Amount', 0, 100e9),
    iraAmount: validateAmount(iraAmount, 'IRA Amount', 0, 100e9),
    rothAmount: validateAmount(rothAmount || 0, 'Roth Amount', 0, 100e9)
  };
  
  // Check total makes sense
  const total = validated.taxableAmount + validated.iraAmount + validated.rothAmount;
  if (total === 0) {
    throw new ValidationError(
      'portfolio',
      'Total portfolio value cannot be zero',
      amounts
    );
  }
  
  if (total > 1e10) {
    throw new ValidationError(
      'portfolio',
      'Total portfolio value exceeds $10 billion',
      amounts
    );
  }
  
  return validated;
};

// =============================================================================
// TAX & FINANCIAL VALIDATION
// =============================================================================

/**
 * Validate tax rate
 */
export const validateTaxRate = (value, field = 'tax rate') => {
  return validatePercentage(value, field);
};

/**
 * Validate conversion amount
 */
export const validateConversionAmount = (value, iraAmount) => {
  const amount = validateAmount(value, 'Conversion Amount', 0, iraAmount);
  
  if (amount > iraAmount) {
    throw new ValidationError(
      'conversionAmount',
      `Conversion amount cannot exceed IRA balance ($${iraAmount.toLocaleString()})`,
      value
    );
  }
  
  return amount;
};

/**
 * Validate living expenses
 */
export const validateLivingExpenses = (value, income) => {
  const expenses = validateAmount(value, 'Living Expenses', 0, 10e6);
  
  // Warn if expenses exceed income by 10x
  if (income > 0 && expenses > income * 10) {
    console.warn(`Living expenses ($${expenses}) are 10x income ($${income})`);
  }
  
  return expenses;
};

/**
 * Validate growth rate
 */
export const validateGrowthRate = (value, field = 'growth rate') => {
  const rate = validatePercentage(value, field);
  
  // Warn if unrealistic
  if (rate < -50) {
    console.warn(`Growth rate ${rate}% is very pessimistic`);
  }
  if (rate > 50) {
    console.warn(`Growth rate ${rate}% is very optimistic`);
  }
  
  return rate;
};

// =============================================================================
// STRING VALIDATION & SANITIZATION
// =============================================================================

/**
 * Sanitize string input (prevent XSS)
 */
export const sanitizeString = (value, maxLength = 1000) => {
  if (value === null || value === undefined) {
    return '';
  }
  
  let str = String(value);
  
  // Trim whitespace
  str = str.trim();
  
  // Limit length
  if (str.length > maxLength) {
    str = str.substring(0, maxLength);
  }
  
  // Remove dangerous characters
  str = str.replace(/[<>]/g, '');
  
  return str;
};

/**
 * Validate enum value
 */
export const validateEnum = (value, field, allowedValues) => {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      field,
      `${field} must be one of: ${allowedValues.join(', ')}`,
      value
    );
  }
  
  return value;
};

// =============================================================================
// BATCH VALIDATION
// =============================================================================

/**
 * Validate multiple fields at once
 * Returns { isValid: boolean, errors: { field: message } }
 */
export const validateFields = (fields) => {
  const errors = {};
  let isValid = true;
  
  for (const [field, { value, validator, ...opts }] of Object.entries(fields)) {
    try {
      validator(value, field, opts);
    } catch (err) {
      isValid = false;
      errors[field] = err.message;
    }
  }
  
  return { isValid, errors };
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if value is safe number (no Infinity, no NaN)
 */
export const isSafeNumber = (value) => {
  return typeof value === 'number' && Number.isFinite(value);
};

/**
 * Clamp value between min and max
 */
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Round to specific decimal places
 */
export const roundTo = (value, decimals = 2) => {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  ValidationError,
  validateAmount,
  validatePercentage,
  validateRate,
  validateAge,
  validatePortfolioAllocation,
  validatePortfolioAmounts,
  validateTaxRate,
  validateConversionAmount,
  validateLivingExpenses,
  validateGrowthRate,
  sanitizeString,
  validateEnum,
  validateFields,
  isSafeNumber,
  clamp,
  roundTo
};
