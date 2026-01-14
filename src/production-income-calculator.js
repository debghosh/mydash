/**
 * PRODUCTION-READY INCOME CALCULATOR
 * All 5 bugs fixed:
 * 1. ✅ Unified front-loading formula (matches Roth tab)
 * 2. ✅ Marginal tax rates (not flat 24%)
 * 3. ✅ Dividend income offset (reduces stock sales)
 * 4. ✅ Iterative tax-on-tax (converges properly)
 * 5. ✅ Cost basis tracking (changes over time)
 */

const calculateProductionIncomeProjection = ({
  currentAge = 60,
  taxableAmount,
  iraAmount,
  conversionAmount,
  frontLoadConversions = false,
  continueAfterRMD = false,
  expectedGrowthRate,
  capitalGainsRate = 15,
  stateTaxRate = 5,
  conservativeBuffer = 1.0, // 1.2 for +20% safety margin
}) => {
  
  const projections = [];
  const growthRate = expectedGrowthRate / 100;
  const livingExpenses = 150000;
  
  // Starting balances
  let taxableBal = taxableAmount;
  let tradIRABal = iraAmount;
  let rothIRABal = 0;
  
  // Cost basis tracking (starts at 50%, changes as stocks sold and grow)
  let totalCostBasis = taxableAmount * 0.5;
  
  // ===== HELPER FUNCTION: UNIFIED FRONT-LOADING =====
  const getFrontLoadedConversion = (age, baseAmount) => {
    if (!frontLoadConversions || age >= 73) {
      return age >= 73 ? Math.min(baseAmount, 200000) : baseAmount;
    }
    
    // SAME formula as Roth tab (Bug #1 fix)
    const year = age - 60;
    if (year <= 2) return 475000;      // Years 1-3: Aggressive
    if (year <= 5) return 350000;      // Years 4-6: Still aggressive  
    if (year <= 9) return 250000;      // Years 7-10: Standard
    if (year <= 13) return 200000;     // Years 11-14: Taper
    return 150000;                     // Post-73: Minimal
  };
  
  // ===== HELPER FUNCTION: MARGINAL TAX CALCULATION =====
  const calculateMarginalTax = (ordinaryIncome) => {
    // 2024 Federal Tax Brackets (Married Filing Jointly)
    const standardDeduction = 29200;
    const taxableIncome = Math.max(0, ordinaryIncome - standardDeduction);
    
    const brackets = [
      { limit: 23200, rate: 0.10 },
      { limit: 94300, rate: 0.12 },
      { limit: 201050, rate: 0.22 },
      { limit: 383900, rate: 0.24 },
      { limit: 487450, rate: 0.32 },
      { limit: 731200, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ];
    
    let tax = 0;
    let previousLimit = 0;
    
    for (const bracket of brackets) {
      if (taxableIncome > previousLimit) {
        const amountInBracket = Math.min(
          taxableIncome - previousLimit,
          bracket.limit - previousLimit
        );
        tax += amountInBracket * bracket.rate;
        previousLimit = bracket.limit;
      }
      if (taxableIncome <= bracket.limit) break;
    }
    
    return { tax, marginalRate: getMarginalRate(taxableIncome) };
  };
  
  const getMarginalRate = (taxableIncome) => {
    if (taxableIncome > 731200) return 37;
    if (taxableIncome > 487450) return 35;
    if (taxableIncome > 383900) return 32;
    if (taxableIncome > 201050) return 24;
    if (taxableIncome > 94300) return 22;
    if (taxableIncome > 23200) return 12;
    return 10;
  };
  
  // ===== HELPER FUNCTION: LTCG RATE =====
  const getLTCGRate = (totalIncome) => {
    // 2024 LTCG brackets (MFJ)
    if (totalIncome <= 94050) return 0.00;
    if (totalIncome <= 583750) return 0.15;
    return 0.20;
  };
  
  // ===== HELPER FUNCTION: NIIT =====
  const getNIITRate = (totalIncome) => {
    // 3.8% Net Investment Income Tax if MAGI > $250K
    return totalIncome > 250000 ? 0.038 : 0;
  };
  
  // RMD divisors (IRS Uniform Lifetime Table)
  const rmdDivisors = {
    73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1,
    80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2,
    87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2
  };
  
  // ===== MAIN PROJECTION LOOP =====
  for (let age = currentAge; age <= 90; age++) {
    const year = age - currentAge + 1;
    
    // === STEP 1: Income Sources ===
    const dividendYield = 0.025;
    const totalDividends = taxableBal * dividendYield;
    const socialSecurity = age >= 70 ? 55000 : 0;
    const rmd = age >= 73 ? tradIRABal / (rmdDivisors[age] || 12.2) : 0;
    
    // === STEP 2: Roth Conversion ===
    let conversion = 0;
    if (tradIRABal > 0) {
      if (continueAfterRMD || age < 73) {
        conversion = getFrontLoadedConversion(age, conversionAmount);
        conversion = Math.min(conversion, tradIRABal);
      }
    }
    
    // === STEP 3: Tax Calculations (Bug #2 fix - MARGINAL rates) ===
    
    // Split dividends: qualified vs ordinary
    const qualifiedDivPct = 0.90;
    const qualifiedDiv = totalDividends * qualifiedDivPct;
    const ordinaryDiv = totalDividends * (1 - qualifiedDivPct);
    
    // Ordinary income = conversions + RMDs + ordinary divs + 85% SS
    const ssIncome = socialSecurity * 0.85; // Assume 85% taxable
    const ordinaryIncome = conversion + rmd + ordinaryDiv + ssIncome;
    
    // Federal tax on ordinary income (MARGINAL BRACKET STACKING)
    const { tax: federalTaxOnOrdinary, marginalRate } = calculateMarginalTax(ordinaryIncome);
    
    // Tax on qualified dividends (LTCG rates)
    const totalIncomeForBrackets = ordinaryIncome + qualifiedDiv;
    const ltcgRate = getLTCGRate(totalIncomeForBrackets);
    const niitRate = getNIITRate(totalIncomeForBrackets);
    const qualifiedDivTax = qualifiedDiv * (ltcgRate + niitRate);
    
    // State tax on all income
    const stateTax = (ordinaryIncome + qualifiedDiv) * (stateTaxRate / 100);
    
    // Total income tax
    const totalIncomeTax = federalTaxOnOrdinary + qualifiedDivTax + stateTax;
    
    // === STEP 3A: TAX-ON-TAX for ROTH CONVERSION (NEW - Bug #2 fix) ===
    // We need to pay totalIncomeTax. If we sell stocks to pay it, that creates additional tax!
    
    let conversionTaxStocksSold = 0;
    let conversionTaxCapGains = 0;
    let conversionTaxOnTax = 0;
    
    // Check if we need to sell stocks to pay the conversion tax
    // Available cash = dividends + RMD + SS (before tax)
    const availableCashBeforeTax = totalDividends + rmd + socialSecurity;
    const taxPaymentNeeded = totalIncomeTax;
    
    // If tax exceeds available cash, we need to sell stocks
    if (taxPaymentNeeded > availableCashBeforeTax && taxableBal > 0) {
      // We need to sell stocks to pay: (tax - availableCash)
      const taxShortfall = taxPaymentNeeded - availableCashBeforeTax;
      
      // Iterative calculation for tax-on-tax
      let totalSaleNeeded = taxShortfall;
      
      for (let iteration = 0; iteration < 10; iteration++) {
        const currentCostBasisPct = totalCostBasis / taxableBal;
        
        // Calculate gains from this sale
        const basisOfSale = totalSaleNeeded * currentCostBasisPct;
        const gainsFromSale = totalSaleNeeded - basisOfSale;
        
        // Tax on these gains
        const saleIncome = ordinaryIncome + gainsFromSale;
        const saleLTCGRate = getLTCGRate(saleIncome);
        const saleNIITRate = getNIITRate(saleIncome);
        const federalCapGainsTax = gainsFromSale * (saleLTCGRate + saleNIITRate);
        const stateCapGainsTax = gainsFromSale * (stateTaxRate / 100);
        const totalCapGainsTax = federalCapGainsTax + stateCapGainsTax;
        
        // Net proceeds after tax
        const netProceeds = totalSaleNeeded - totalCapGainsTax;
        
        // Check convergence
        if (Math.abs(netProceeds - taxShortfall) < 10) {
          conversionTaxStocksSold = totalSaleNeeded;
          conversionTaxCapGains = gainsFromSale;
          conversionTaxOnTax = totalCapGainsTax;
          break;
        }
        
        // Adjust for next iteration
        totalSaleNeeded = taxShortfall + totalCapGainsTax;
        
        // Safety: don't sell more than we have
        if (totalSaleNeeded > taxableBal) {
          conversionTaxStocksSold = taxableBal;
          const finalBasis = conversionTaxStocksSold * currentCostBasisPct;
          conversionTaxCapGains = conversionTaxStocksSold - finalBasis;
          conversionTaxOnTax = conversionTaxCapGains * (saleLTCGRate + saleNIITRate + stateTaxRate / 100);
          break;
        }
      }
    }
    
    // Total tax including tax-on-tax for conversion
    const totalTaxIncludingConversionTaxOnTax = totalIncomeTax + conversionTaxOnTax;
    
    // === STEP 4: After-Tax Income (Bug #3 fix - dividend offset) ===
    const afterTaxIncome = (totalDividends + rmd + socialSecurity) - totalTaxIncludingConversionTaxOnTax;
    
    // === STEP 5: Cash Shortfall ===
    const cashNeeded = livingExpenses;
    const shortfall = Math.max(0, cashNeeded - afterTaxIncome);
    
    // === STEP 6: TAX-ON-TAX Calculation for LIVING EXPENSES (Bug #4 fix - iterative) ===
    let livingExpenseStocksSold = 0;
    let livingExpenseCapGains = 0;
    let livingExpenseCapGainsTax = 0;
    
    if (shortfall > 0 && taxableBal > 0) {
      // Adjust taxable balance for stocks already sold for conversion tax
      const remainingTaxableBal = taxableBal - conversionTaxStocksSold;
      
      if (remainingTaxableBal > 0) {
        // Iterative calculation to convergence (max 10 iterations)
        let totalCashNeeded = shortfall;
        
        for (let iteration = 0; iteration < 10; iteration++) {
          // Current cost basis percentage (after conversion tax sale)
          const currentCostBasisPct = totalCostBasis / taxableBal;
          
          // Estimate sale amount
          const estimatedSale = totalCashNeeded;
          
          // Calculate gains
          const basisOfSale = estimatedSale * currentCostBasisPct;
          const gainsFromSale = estimatedSale - basisOfSale;
          
          // Tax on gains
          const saleIncome = ordinaryIncome + gainsFromSale;
          const saleLTCGRate = getLTCGRate(saleIncome);
          const saleNIITRate = getNIITRate(saleIncome);
          const federalCapGainsTax = gainsFromSale * (saleLTCGRate + saleNIITRate);
          const stateCapGainsTax = gainsFromSale * (stateTaxRate / 100);
          const totalCapGainsTax = federalCapGainsTax + stateCapGainsTax;
          
          // Net proceeds
          const netProceeds = estimatedSale - totalCapGainsTax;
          
          // Check convergence (within $10)
          if (Math.abs(netProceeds - shortfall) < 10) {
            livingExpenseStocksSold = estimatedSale;
            livingExpenseCapGains = gainsFromSale;
            livingExpenseCapGainsTax = totalCapGainsTax;
            break;
          }
          
          // Adjust for next iteration
          totalCashNeeded = shortfall + totalCapGainsTax;
          
          // Safety: don't sell more than we have (accounting for conversion tax sales)
          if (totalCashNeeded > remainingTaxableBal) {
            livingExpenseStocksSold = remainingTaxableBal;
            const finalBasis = livingExpenseStocksSold * currentCostBasisPct;
            livingExpenseCapGains = livingExpenseStocksSold - finalBasis;
            livingExpenseCapGainsTax = livingExpenseCapGains * (saleLTCGRate + saleNIITRate + stateTaxRate / 100);
            break;
          }
        }
      }
    }
    
    // Total stocks sold = conversion tax + living expenses
    const totalStocksSold = conversionTaxStocksSold + livingExpenseStocksSold;
    const totalCapitalGains = conversionTaxCapGains + livingExpenseCapGains;
    const totalCapGainsTaxes = conversionTaxOnTax + livingExpenseCapGainsTax;
    
    // === STEP 7: Update Account Balances ===
    
    // Reduce taxable account (both conversion tax sales AND living expense sales)
    taxableBal -= totalStocksSold;
    
    // Reduce cost basis proportionally (Bug #5 fix)
    if (totalStocksSold > 0 && taxableBal > 0) {
      const costBasisPct = totalCostBasis / (taxableBal + totalStocksSold);
      const basisRemoved = totalStocksSold * costBasisPct;
      totalCostBasis -= basisRemoved;
    }
    
    // Reduce Traditional IRA
    tradIRABal -= (conversion + rmd);
    tradIRABal = Math.max(0, tradIRABal);
    
    // Increase Roth IRA
    rothIRABal += conversion;
    
    // === STEP 8: Apply Growth ===
    // Taxable account grows
    const taxableGrowth = taxableBal * growthRate;
    taxableBal += taxableGrowth;
    // Cost basis DOESN'T grow (new gains have $0 basis)
    
    // IRA accounts grow
    tradIRABal *= (1 + growthRate);
    rothIRABal *= (1 + growthRate);
    
    // === STEP 9: Calculate Total Taxes ===
    const totalTaxes = totalIncomeTax + totalCapGainsTaxes;
    const conservativeTaxes = totalTaxes * conservativeBuffer;
    
    // === STEP 10: Calculate derived values ===
    const totalIncome = totalDividends + socialSecurity + rmd;
    const marginalBracket = ordinaryIncome > 487450 ? 35 : ordinaryIncome > 383900 ? 32 : 
                            ordinaryIncome > 201050 ? 24 : ordinaryIncome > 94300 ? 22 : 
                            ordinaryIncome > 23200 ? 12 : 10;
    
    // === STEP 11: Store Projection ===
    projections.push({
      year,
      age,
      
      // Income sources
      dividends: Math.round(totalDividends),
      qualifiedDiv: Math.round(qualifiedDiv),
      ordinaryDiv: Math.round(ordinaryDiv),
      rmd: Math.round(rmd),
      socialSecurity: Math.round(socialSecurity),
      totalIncome: Math.round(totalIncome),
      
      // Roth conversion
      conversionAmount: Math.round(conversion),
      
      // Tax breakdown
      federalTax: Math.round(federalTaxOnOrdinary),
      qualifiedDivTax: Math.round(qualifiedDivTax),
      stateTax: Math.round(stateTax),
      totalIncomeTax: Math.round(totalIncomeTax),
      
      // Stock sales - SEPARATED by purpose (NEW - Bug #2 fix)
      conversionTaxStocksSold: Math.round(conversionTaxStocksSold),
      conversionTaxCapGains: Math.round(conversionTaxCapGains),
      conversionTaxOnTax: Math.round(conversionTaxOnTax),
      
      livingExpenseStocksSold: Math.round(livingExpenseStocksSold),
      livingExpenseCapGains: Math.round(livingExpenseCapGains),
      livingExpenseCapGainsTax: Math.round(livingExpenseCapGainsTax),
      
      totalStocksSold: Math.round(totalStocksSold),
      totalCapitalGains: Math.round(totalCapitalGains),
      totalCapGainsTaxes: Math.round(totalCapGainsTaxes),
      
      // Legacy fields for backward compatibility
      stocksSold: Math.round(totalStocksSold),
      capitalGains: Math.round(totalCapitalGains),
      capGainsTax: Math.round(totalCapGainsTaxes),
      
      // Total taxes
      totalTaxes: Math.round(totalTaxes),
      conservativeTaxes: Math.round(conservativeTaxes),
      
      // Account balances
      taxableBalance: Math.round(taxableBal),
      costBasis: Math.round(totalCostBasis),
      costBasisPct: taxableBal > 0 ? ((totalCostBasis / taxableBal) * 100).toFixed(1) : '0.0',
      tradIRABalance: Math.round(tradIRABal),
      rothIRABalance: Math.round(rothIRABal),
      totalPortfolio: Math.round(taxableBal + tradIRABal + rothIRABal),
      
      // Tax rates used
      marginalRate: marginalBracket,
      ltcgRate: (ltcgRate * 100).toFixed(0),
      niitRate: (niitRate * 100).toFixed(1),
      effectiveRate: totalIncome > 0 ? ((totalTaxes / (totalIncome + conversion)) * 100).toFixed(1) : '0.0',
      
      // Living expenses
      livingExpenses,
      afterTaxIncome: Math.round(afterTaxIncome),
      shortfall: Math.round(shortfall)
    });
  }
  
  return projections;
};

// Export for use in React components
export default calculateProductionIncomeProjection;


// ===== USAGE EXAMPLE =====
/*
import calculateProductionIncomeProjection from './production-income-calculator';

const lifetimeProjection = calculateProductionIncomeProjection({
  currentAge: 60,
  taxableAmount: 7700000,
  iraAmount: 1000000,
  conversionAmount: 250000,
  frontLoadConversions: true,
  continueAfterRMD: false,
  expectedGrowthRate: 7,
  capitalGainsRate: 15,
  stateTaxRate: 5,
  conservativeBuffer: 1.2  // +20% for safety
});

// Calculate totals
const totalConversions = lifetimeProjection.reduce((sum, p) => sum + p.conversionAmount, 0);
const totalTaxes = lifetimeProjection.reduce((sum, p) => sum + p.conservativeTaxes, 0);
const totalCapGainsTax = lifetimeProjection.reduce((sum, p) => sum + p.capGainsTax, 0);

console.log(`Total conversions: $${(totalConversions/1e6).toFixed(2)}M`);
console.log(`Total taxes: $${(totalTaxes/1e6).toFixed(2)}M`);
console.log(`Tax-on-tax: $${(totalCapGainsTax/1e3).toFixed(0)}K`);
*/
