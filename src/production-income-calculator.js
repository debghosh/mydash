// PRODUCTION-READY INCOME PROJECTION
// Proper marginal tax calculations, cost basis tracking, state taxes, conservative estimates

const calculateProductionIncomeProjection = (params) => {
  const {
    currentAge = 60,
    taxableAmount,
    iraAmount,
    conversionAmount,
    frontLoadConversions,
    expectedGrowthRate,
    capitalGainsRate,
    stateTaxRate = 5, // NEW: State tax parameter (default 5%)
    conservativeBuffer = 1.2, // NEW: 20% buffer for safety
  } = params;
  
  const projections = [];
  const livingExpenses = 150000;
  
  // Account balances
  let taxableBal = taxableAmount;
  let tradIRABal = iraAmount;
  let rothIRABal = 0;
  
  // Cost basis tracking (starts at 50% but changes over time)
  let totalCostBasis = taxableAmount * 0.5;
  
  // Tax brackets 2024 (Married Filing Jointly) - indexed for inflation
  const getTaxBrackets = (year) => {
    // Inflate by 3% per year
    const inflationFactor = Math.pow(1.03, year - 1);
    return [
      { limit: 23200 * inflationFactor, rate: 0.10 },
      { limit: 94300 * inflationFactor, rate: 0.12 },
      { limit: 201050 * inflationFactor, rate: 0.22 },
      { limit: 383900 * inflationFactor, rate: 0.24 },
      { limit: 487450 * inflationFactor, rate: 0.32 },
      { limit: 731200 * inflationFactor, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ];
  };
  
  // Long-term capital gains rates
  const getLTCGRate = (income) => {
    if (income <= 94050) return 0.00;
    if (income <= 583750) return 0.15;
    return 0.20; // Plus 3.8% NIIT if applicable
  };
  
  // Calculate tax with proper marginal rate stacking
  const calculateMarginalTax = (income, brackets, deduction = 29200) => {
    const taxableIncome = Math.max(0, income - deduction); // Standard deduction
    let tax = 0;
    let previousLimit = 0;
    
    for (const bracket of brackets) {
      if (taxableIncome <= previousLimit) break;
      
      const amountInBracket = Math.min(
        taxableIncome - previousLimit,
        bracket.limit - previousLimit
      );
      
      tax += amountInBracket * bracket.rate;
      previousLimit = bracket.limit;
    }
    
    return tax;
  };
  
  // RMD divisors
  const rmdDivisors = {
    73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1,
    80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2,
    87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2
  };
  
  // Project year by year
  for (let age = currentAge; age <= 90; age++) {
    const year = age - currentAge + 1;
    const taxBrackets = getTaxBrackets(year);
    
    // === STEP 1: Calculate income sources ===
    const dividendYield = 0.025; // 2.5% average
    const dividends = taxableBal * dividendYield;
    const socialSecurity = age >= 70 ? 55000 : 0;
    const rmd = age >= 73 ? tradIRABal / (rmdDivisors[age] || 12.2) : 0;
    
    // === STEP 2: Roth conversion (if before RMDs) ===
    let conversion = 0;
    if (age < 73 && tradIRABal > 0) {
      if (frontLoadConversions) {
        // Front-load: higher early years
        const frontLoadFactor = Math.max(0.5, 1.5 - (age - 60) * 0.08);
        conversion = Math.min(conversionAmount * frontLoadFactor, tradIRABal);
      } else {
        // Steady conversions
        conversion = Math.min(conversionAmount, tradIRABal);
      }
    }
    
    // === STEP 3: Calculate taxes on income (PROPER MARGINAL RATES) ===
    
    // Ordinary income (conversions + RMDs + ordinary dividends)
    const qualifiedDivPct = 0.90; // 90% of dividends qualified
    const qualifiedDiv = dividends * qualifiedDivPct;
    const ordinaryDiv = dividends * (1 - qualifiedDivPct);
    
    // Calculate ordinary income tax (includes conversion!)
    const ordinaryIncome = conversion + rmd + ordinaryDiv + (socialSecurity * 0.85);
    const ordinaryTax = calculateMarginalTax(ordinaryIncome, taxBrackets);
    
    // Qualified dividends tax (use LTCG rates)
    const ltcgRate = getLTCGRate(ordinaryIncome);
    const niitRate = ordinaryIncome > 250000 ? 0.038 : 0; // Net Investment Income Tax
    const qualifiedDivTax = qualifiedDiv * (ltcgRate + niitRate);
    
    // State taxes (on all income except qualified dividends in some states)
    const stateTax = (ordinaryIncome + qualifiedDiv) * (stateTaxRate / 100);
    
    // Total tax on income
    const taxOnIncome = ordinaryTax + qualifiedDivTax + stateTax;
    
    // === STEP 4: After-tax income available ===
    const totalIncome = dividends + rmd + socialSecurity + conversion;
    const afterTaxIncome = totalIncome - taxOnIncome;
    
    // === STEP 5: Calculate shortfall ===
    const cashNeeded = livingExpenses;
    const shortfall = Math.max(0, cashNeeded - (afterTaxIncome - conversion)); // Don't count conversion as available cash
    
    // === STEP 6: Sell stocks to cover shortfall (ITERATIVE TAX-ON-TAX) ===
    let stocksSold = 0;
    let capitalGains = 0;
    let capGainsTax = 0;
    
    if (shortfall > 0 && taxableBal > 0) {
      // Iterative calculation for tax-on-tax
      stocksSold = shortfall;
      
      for (let iteration = 0; iteration < 10; iteration++) {
        // Calculate capital gains based on current cost basis
        const costBasisPct = totalCostBasis / taxableBal;
        const basisOfSale = stocksSold * costBasisPct;
        capitalGains = stocksSold - basisOfSale;
        
        // Tax on capital gains
        const ltcgRateForSale = getLTCGRate(ordinaryIncome + capitalGains);
        const niitForSale = (ordinaryIncome + capitalGains) > 250000 ? 0.038 : 0;
        const federalCapGainsTax = capitalGains * (ltcgRateForSale + niitForSale);
        const stateCapGainsTax = capitalGains * (stateTaxRate / 100);
        capGainsTax = federalCapGainsTax + stateCapGainsTax;
        
        // Net proceeds after tax
        const netProceeds = stocksSold - capGainsTax;
        
        // Check convergence
        if (Math.abs(netProceeds - shortfall) < 10) break;
        
        // Adjust stocks to sell
        stocksSold = shortfall + capGainsTax;
        
        // Safety check
        if (stocksSold > taxableBal) {
          stocksSold = taxableBal;
          break;
        }
      }
    }
    
    // === STEP 7: Update account balances ===
    
    // Reduce taxable account
    taxableBal -= stocksSold;
    
    // Reduce cost basis proportionally
    if (stocksSold > 0) {
      const costBasisPct = totalCostBasis / (taxableBal + stocksSold);
      const basisRemoved = stocksSold * costBasisPct;
      totalCostBasis -= basisRemoved;
    }
    
    // Reduce Traditional IRA
    tradIRABal -= (conversion + rmd);
    
    // Increase Roth IRA
    rothIRABal += conversion;
    
    // === STEP 8: Apply growth ===
    const growthRate = expectedGrowthRate / 100;
    
    const taxableGrowth = taxableBal * growthRate;
    taxableBal += taxableGrowth;
    // Cost basis doesn't grow (new gains have $0 basis)
    
    const iraGrowth = tradIRABal * growthRate;
    tradIRABal += iraGrowth;
    
    const rothGrowth = rothIRABal * growthRate;
    rothIRABal += rothGrowth;
    
    // === STEP 9: Calculate total taxes ===
    const totalTaxes = taxOnIncome + capGainsTax;
    
    // Apply conservative buffer
    const conservativeTaxes = totalTaxes * conservativeBuffer;
    
    // === STEP 10: Store projection ===
    projections.push({
      year,
      age,
      
      // Income sources
      dividends: Math.round(dividends),
      qualifiedDiv: Math.round(qualifiedDiv),
      ordinaryDiv: Math.round(ordinaryDiv),
      rmd: Math.round(rmd),
      socialSecurity: Math.round(socialSecurity),
      totalIncome: Math.round(totalIncome),
      
      // Roth conversion
      conversionAmount: Math.round(conversion),
      
      // Stock sales
      stocksSold: Math.round(stocksSold),
      capitalGains: Math.round(capitalGains),
      
      // Taxes (detailed breakdown)
      ordinaryTax: Math.round(ordinaryTax),
      qualifiedDivTax: Math.round(qualifiedDivTax),
      capGainsTax: Math.round(capGainsTax),
      stateTax: Math.round(stateTax),
      totalTaxes: Math.round(totalTaxes),
      conservativeTaxes: Math.round(conservativeTaxes),
      
      // Account balances
      taxableBalance: Math.round(taxableBal),
      costBasis: Math.round(totalCostBasis),
      costBasisPct: (totalCostBasis / taxableBal * 100).toFixed(1),
      tradIRABalance: Math.round(tradIRABal),
      rothIRABalance: Math.round(rothIRABal),
      totalPortfolio: Math.round(taxableBal + tradIRABal + rothIRABal),
      
      // Tax rates used
      marginalRate: (taxBrackets.find(b => ordinaryIncome <= b.limit)?.rate * 100).toFixed(0),
      ltcgRate: (getLTCGRate(ordinaryIncome) * 100).toFixed(0),
      effectiveRate: ((totalTaxes / totalIncome) * 100).toFixed(1)
    });
  }
  
  return projections;
};

// Export for use in App.jsx
export default calculateProductionIncomeProjection;
