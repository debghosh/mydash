// =============================================================================
// ALPHATIC - ETF UNIVERSE
// =============================================================================
// Comprehensive ETF metadata for portfolio construction  
// Organized by display categories matching Alphatic Educational Edition
// Total ETFs: 63
// =============================================================================

// =============================================================================
// ETF DATABASE - GROUPED BY DISPLAY CATEGORIES
// =============================================================================
export const ETF_DATABASE = {
  'US Broad Market': [
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF', factor: 'Market', yield: 1.3, expense: 0.0945, inception: '1993-01-22', description: 'Tracks S&P 500 index, oldest and most liquid ETF', taxEfficiency: 'high' },
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', factor: 'Market', yield: 1.4, expense: 0.03, inception: '2001-05-31', description: 'Total US market exposure (3,500+ stocks)', taxEfficiency: 'high' },
    { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', factor: 'Market', yield: 1.3, expense: 0.03, inception: '2010-09-07', description: 'Low-cost S&P 500 tracker from Vanguard', taxEfficiency: 'high' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', factor: 'Tech/Growth', yield: 0.6, expense: 0.20, inception: '1999-03-10', description: 'Nasdaq-100 Index (large-cap growth/tech)', taxEfficiency: 'high' }
  ],

  'US Growth': [
    { symbol: 'VUG', name: 'Vanguard Growth ETF', factor: 'Growth', yield: 0.6, expense: 0.04, inception: '2004-01-26', description: 'Large-cap growth stocks', taxEfficiency: 'high' },
    { symbol: 'SCHG', name: 'Schwab US Large-Cap Growth ETF', factor: 'Growth', yield: 0.6, expense: 0.04, inception: '2009-12-11', description: 'Low-cost large-cap growth exposure', taxEfficiency: 'high' },
    { symbol: 'IVW', name: 'iShares S&P 500 Growth ETF', factor: 'Growth', yield: 0.7, expense: 0.18, inception: '2000-05-22', description: 'S&P 500 growth subset', taxEfficiency: 'high' },
    { symbol: 'IWF', name: 'iShares Russell 1000 Growth ETF', factor: 'Growth', yield: 0.7, expense: 0.19, inception: '2000-05-22', description: 'Russell 1000 growth stocks', taxEfficiency: 'high' }
  ],

  'US Value': [
    { symbol: 'VTV', name: 'Vanguard Value ETF', factor: 'Value', yield: 2.4, expense: 0.04, inception: '2004-01-26', description: 'Large-cap value stocks', taxEfficiency: 'high' },
    { symbol: 'SCHV', name: 'Schwab US Large-Cap Value ETF', factor: 'Value', yield: 2.5, expense: 0.04, inception: '2009-12-11', description: 'Low-cost large-cap value exposure', taxEfficiency: 'high' },
    { symbol: 'IVE', name: 'iShares S&P 500 Value ETF', factor: 'Value', yield: 2.3, expense: 0.18, inception: '2000-05-22', description: 'S&P 500 value subset', taxEfficiency: 'high' },
    { symbol: 'AVUV', name: 'Avantis US Small Cap Value ETF', factor: 'Value/Small', yield: 1.8, expense: 0.25, inception: '2019-09-24', description: 'US small-cap value with factor tilt', taxEfficiency: 'high' },
    { symbol: 'AVDV', name: 'Avantis Intl Small Cap Value ETF', factor: 'Value/Small', yield: 2.5, expense: 0.36, inception: '2019-09-24', description: 'International small-cap value', taxEfficiency: 'high' }
  ],

  'US Small Cap': [
    { symbol: 'VB', name: 'Vanguard Small-Cap ETF', factor: 'Size', yield: 1.4, expense: 0.05, inception: '2004-01-26', description: 'US small-cap stocks', taxEfficiency: 'high' },
    { symbol: 'IJR', name: 'iShares Core S&P Small-Cap ETF', factor: 'Size', yield: 1.3, expense: 0.06, inception: '2000-05-22', description: 'S&P SmallCap 600 index', taxEfficiency: 'high' },
    { symbol: 'IWM', name: 'iShares Russell 2000 ETF', factor: 'Size', yield: 1.2, expense: 0.19, inception: '2000-05-22', description: 'Russell 2000 small-cap index', taxEfficiency: 'high' },
    { symbol: 'SIZE', name: 'iShares MSCI USA Size Factor ETF', factor: 'Size', yield: 1.5, expense: 0.15, inception: '2013-04-16', description: 'Factor-based size tilt', taxEfficiency: 'high' }
  ],

  'Factor ETFs': [
    { symbol: 'MTUM', name: 'iShares MSCI USA Momentum Factor', factor: 'Momentum', yield: 0.8, expense: 0.15, inception: '2013-04-16', description: 'Momentum factor exposure', taxEfficiency: 'high' },
    { symbol: 'QUAL', name: 'iShares MSCI USA Quality Factor', factor: 'Quality', yield: 1.2, expense: 0.15, inception: '2013-07-16', description: 'Quality factor (high ROE, low debt)', taxEfficiency: 'high' },
    { symbol: 'USMV', name: 'iShares MSCI USA Min Volatility', factor: 'Low Volatility', yield: 1.8, expense: 0.15, inception: '2011-10-18', description: 'Minimum volatility strategy', taxEfficiency: 'high' },
    { symbol: 'IMOM', name: 'iShares MSCI Intl Momentum Factor', factor: 'Momentum', yield: 1.5, expense: 0.30, inception: '2014-01-28', description: 'International momentum', taxEfficiency: 'high' }
  ],

  'Dividend & Income': [
    // High Income - Covered Call
    { symbol: 'JEPI', name: 'JPMorgan Equity Premium Income ETF', factor: 'High Income', yield: 7.5, expense: 0.35, inception: '2020-05-20', description: 'Covered call strategy on S&P 500', taxEfficiency: 'low' },
    { symbol: 'JEPQ', name: 'JPMorgan Nasdaq Equity Premium Income', factor: 'High Income', yield: 9.0, expense: 0.35, inception: '2022-05-03', description: 'Covered call strategy on Nasdaq-100', taxEfficiency: 'low' },
    { symbol: 'DIVO', name: 'Amplify CWP Enhanced Dividend Income', factor: 'High Income', yield: 5.2, expense: 0.55, inception: '2016-12-19', description: 'Dividend + covered calls', taxEfficiency: 'low' },
    { symbol: 'XYLD', name: 'Global X S&P 500 Covered Call', factor: 'High Income', yield: 12.0, expense: 0.60, inception: '2013-06-21', description: 'S&P 500 covered call, high yield', taxEfficiency: 'low' },
    { symbol: 'QYLD', name: 'Global X NASDAQ-100 Covered Call', factor: 'High Income', yield: 13.5, expense: 0.60, inception: '2013-12-11', description: 'Nasdaq-100 covered call, very high yield', taxEfficiency: 'low' },
    { symbol: 'RYLD', name: 'Global X Russell 2000 Covered Call', factor: 'High Income', yield: 12.5, expense: 0.60, inception: '2019-07-25', description: 'Russell 2000 covered call', taxEfficiency: 'low' },
    { symbol: 'NUSI', name: 'Nationwide Risk-Managed Income ETF', factor: 'High Income', yield: 7.8, expense: 0.68, inception: '2019-12-17', description: 'Nasdaq-100 with protective puts', taxEfficiency: 'low' },
    { symbol: 'DJIA', name: 'Global X Dow 30 Covered Call', factor: 'High Income', yield: 10.5, expense: 0.60, inception: '2015-02-19', description: 'Dow Jones covered call strategy', taxEfficiency: 'low' },
    // Dividend Growth
    { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', factor: 'Dividend Growth', yield: 3.5, expense: 0.06, inception: '2011-10-20', description: 'Quality dividend growers, low expense', taxEfficiency: 'high' },
    { symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF', factor: 'Dividend', yield: 3.0, expense: 0.06, inception: '2006-11-10', description: 'High dividend yield stocks', taxEfficiency: 'high' },
    { symbol: 'VYMI', name: 'Vanguard Intl High Dividend Yield', factor: 'Dividend', yield: 3.8, expense: 0.22, inception: '2016-02-25', description: 'International high dividend', taxEfficiency: 'medium' },
    { symbol: 'DGRO', name: 'iShares Core Dividend Growth ETF', factor: 'Dividend Growth', yield: 2.8, expense: 0.08, inception: '2014-06-10', description: 'Dividend growth stocks', taxEfficiency: 'high' },
    // High Dividend + Low Vol
    { symbol: 'SPHD', name: 'Invesco S&P 500 High Div Low Vol', factor: 'High Dividend + Low Vol', yield: 4.5, expense: 0.30, inception: '2012-10-18', description: 'High yield with low volatility', taxEfficiency: 'high' },
    // High Dividend
    { symbol: 'HDV', name: 'iShares Core High Dividend ETF', factor: 'High Dividend', yield: 3.2, expense: 0.08, inception: '2011-03-29', description: 'High quality dividend stocks', taxEfficiency: 'high' },
    { symbol: 'DVY', name: 'iShares Select Dividend ETF', factor: 'High Dividend', yield: 3.6, expense: 0.39, inception: '2003-11-03', description: 'Dividend-paying US stocks', taxEfficiency: 'high' }
  ],

  'International Equity': [
    { symbol: 'VXUS', name: 'Vanguard Total International Stock', factor: 'International', yield: 2.8, expense: 0.07, inception: '2011-01-26', description: 'Total international equity exposure', taxEfficiency: 'medium' },
    { symbol: 'VEU', name: 'Vanguard FTSE All-World ex-US', factor: 'International', yield: 2.7, expense: 0.07, inception: '2007-03-02', description: 'Developed and emerging ex-US', taxEfficiency: 'medium' },
    { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets', factor: 'International', yield: 2.9, expense: 0.05, inception: '2007-07-20', description: 'Developed markets ex-US', taxEfficiency: 'medium' },
    { symbol: 'VGK', name: 'Vanguard FTSE Europe ETF', factor: 'International', yield: 3.2, expense: 0.08, inception: '2005-03-04', description: 'European developed markets', taxEfficiency: 'medium' },
    // Emerging Markets
    { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets', factor: 'Emerging Markets', yield: 3.5, expense: 0.08, inception: '2005-03-04', description: 'Broad emerging markets', taxEfficiency: 'medium' },
    { symbol: 'IEMG', name: 'iShares Core MSCI Emerging Markets', factor: 'Emerging Markets', yield: 3.4, expense: 0.11, inception: '2012-10-18', description: 'Core emerging markets exposure', taxEfficiency: 'medium' },
    { symbol: 'EEM', name: 'iShares MSCI Emerging Markets ETF', factor: 'Emerging Markets', yield: 3.6, expense: 0.70, inception: '2003-04-07', description: 'Older emerging markets ETF', taxEfficiency: 'medium' }
  ],

  'Sector ETFs': [
    // Tech
    { symbol: 'VGT', name: 'Vanguard Information Technology', factor: 'Tech', yield: 0.7, expense: 0.10, inception: '2004-01-26', description: 'US tech sector', taxEfficiency: 'high' },
    { symbol: 'XLK', name: 'Technology Select Sector SPDR', factor: 'Tech', yield: 0.8, expense: 0.10, inception: '1998-12-16', description: 'S&P 500 tech sector', taxEfficiency: 'high' },
    // Others
    { symbol: 'XLF', name: 'Financial Select Sector SPDR', factor: 'Financials', yield: 2.0, expense: 0.10, inception: '1998-12-16', description: 'Financial sector', taxEfficiency: 'high' },
    { symbol: 'XLE', name: 'Energy Select Sector SPDR', factor: 'Energy', yield: 3.5, expense: 0.10, inception: '1998-12-16', description: 'Energy sector', taxEfficiency: 'medium' },
    { symbol: 'XLV', name: 'Health Care Select Sector SPDR', factor: 'Healthcare', yield: 1.5, expense: 0.10, inception: '1998-12-16', description: 'Healthcare sector', taxEfficiency: 'high' },
    { symbol: 'XLI', name: 'Industrial Select Sector SPDR', factor: 'Industrials', yield: 1.8, expense: 0.10, inception: '1998-12-16', description: 'Industrials sector', taxEfficiency: 'high' }
  ],

  'Real Estate': [
    { symbol: 'VNQ', name: 'Vanguard Real Estate ETF', factor: 'Real Estate', yield: 4.2, expense: 0.12, inception: '2004-09-23', description: 'US REITs', taxEfficiency: 'low' }
  ],

  'Fixed Income': [
    // Core Bonds
    { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', factor: 'Bonds', yield: 4.5, expense: 0.03, inception: '2007-04-03', description: 'Total US bond market', taxEfficiency: 'low' },
    { symbol: 'BNDX', name: 'Vanguard Total Intl Bond ETF', factor: 'Bonds', yield: 4.8, expense: 0.07, inception: '2013-05-31', description: 'International bonds (hedged)', taxEfficiency: 'low' },
    { symbol: 'AGG', name: 'iShares Core US Aggregate Bond ETF', factor: 'Bonds', yield: 4.6, expense: 0.03, inception: '2003-09-22', description: 'US investment-grade bonds', taxEfficiency: 'low' },
    // Treasury Bonds
    { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', factor: 'Long Bonds', yield: 4.8, expense: 0.15, inception: '2002-07-22', description: 'Long-term treasuries', taxEfficiency: 'medium' },
    { symbol: 'IEF', name: 'iShares 7-10 Year Treasury ETF', factor: 'Intermediate Bonds', yield: 4.3, expense: 0.15, inception: '2002-07-22', description: 'Intermediate treasuries', taxEfficiency: 'medium' },
    { symbol: 'SHY', name: 'iShares 1-3 Year Treasury Bond ETF', factor: 'Short Bonds', yield: 4.0, expense: 0.15, inception: '2002-07-22', description: 'Short-term treasuries', taxEfficiency: 'medium' },
    // TIPS
    { symbol: 'TIP', name: 'iShares TIPS Bond ETF', factor: 'Inflation Protected', yield: 4.4, expense: 0.19, inception: '2003-12-04', description: 'Treasury inflation-protected securities', taxEfficiency: 'low' },
    // Corporate
    { symbol: 'LQD', name: 'iShares iBoxx Investment Grade Corporate', factor: 'Corporate Bonds', yield: 5.2, expense: 0.14, inception: '2002-07-22', description: 'Investment-grade corporate bonds', taxEfficiency: 'low' },
    // Preferred Stock
    { symbol: 'PFF', name: 'iShares Preferred & Income Securities', factor: 'Preferred Stock', yield: 6.5, expense: 0.45, inception: '2007-03-26', description: 'Preferred stocks and hybrids', taxEfficiency: 'low' },
    { symbol: 'PFFD', name: 'Global X US Preferred ETF', factor: 'Preferred Stock', yield: 6.8, expense: 0.23, inception: '2017-09-07', description: 'US preferred stocks', taxEfficiency: 'low' }
  ],

  'Alternatives': [
    { symbol: 'GLD', name: 'SPDR Gold Shares', factor: 'Gold', yield: 0.0, expense: 0.40, inception: '2004-11-18', description: 'Physical gold', taxEfficiency: 'low' },
    { symbol: 'DBC', name: 'Invesco DB Commodity Index', factor: 'Commodities', yield: 0.0, expense: 0.87, inception: '2006-02-03', description: 'Diversified commodities', taxEfficiency: 'low' }
  ],

  'Aggressive Growth': [
    { symbol: 'ARKK', name: 'ARK Innovation ETF', factor: 'Innovation', yield: 0.0, expense: 0.75, inception: '2014-10-31', description: 'Disruptive innovation', taxEfficiency: 'high' }
  ]
};

// =============================================================================
// FLATTEN TO ETF_UNIVERSE (Symbol-Keyed for Easy Lookup)
// =============================================================================
export const ETF_UNIVERSE = {};
for (const [category, etfs] of Object.entries(ETF_DATABASE)) {
  etfs.forEach(etf => {
    ETF_UNIVERSE[etf.symbol] = {
      ...etf,
      category  // Add category back for filtering
    };
  });
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get single ETF by symbol
 */
export const getETF = (symbol) => ETF_UNIVERSE[symbol];

/**
 * Get all ETFs in a category
 */
export const getETFsByCategory = (category) => {
  return ETF_DATABASE[category] || [];
};

/**
 * Get all ETF symbols
 */
export const getAllSymbols = () => Object.keys(ETF_UNIVERSE);

/**
 * Search ETFs by name or symbol
 */
export const searchETFs = (query) => {
  const lowerQuery = query.toLowerCase();
  return Object.values(ETF_UNIVERSE).filter(etf => 
    etf.symbol.toLowerCase().includes(lowerQuery) ||
    etf.name.toLowerCase().includes(lowerQuery) ||
    (etf.description && etf.description.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Get ETFs suitable for taxable accounts
 */
export const getTaxEfficientETFs = () => {
  return Object.values(ETF_UNIVERSE).filter(etf => 
    etf.taxEfficiency === 'high' || etf.taxEfficiency === 'medium'
  );
};

/**
 * Get ETFs best suited for IRA/tax-deferred accounts
 */
export const getTaxInEfficientETFs = () => {
  return Object.values(ETF_UNIVERSE).filter(etf => 
    etf.taxEfficiency === 'low'
  );
};

/**
 * Calculate portfolio weighted average expense ratio
 */
export const calculateWeightedExpenseRatio = (allocations) => {
  const totalAllocation = Object.values(allocations).reduce((sum, val) => sum + val, 0);
  if (totalAllocation === 0) return 0;
  
  return Object.entries(allocations).reduce((sum, [symbol, allocation]) => {
    const etf = ETF_UNIVERSE[symbol];
    if (!etf) return sum;
    return sum + (etf.expense * (allocation / totalAllocation));
  }, 0);
};

/**
 * Calculate portfolio weighted average yield
 */
export const calculateWeightedYield = (allocations) => {
  const totalAllocation = Object.values(allocations).reduce((sum, val) => sum + val, 0);
  if (totalAllocation === 0) return 0;
  
  return Object.entries(allocations).reduce((sum, [symbol, allocation]) => {
    const etf = ETF_UNIVERSE[symbol];
    if (!etf) return sum;
    return sum + (etf.yield * (allocation / totalAllocation));
  }, 0);
};

// =============================================================================
// EXPORTS
// =============================================================================
export default {
  ETF_DATABASE,
  ETF_UNIVERSE,
  getETF,
  getETFsByCategory,
  getAllSymbols,
  searchETFs,
  getTaxEfficientETFs,
  getTaxInEfficientETFs,
  calculateWeightedExpenseRatio,
  calculateWeightedYield
};
