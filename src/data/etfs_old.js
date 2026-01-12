// =============================================================================
// ALPHATIC - ETF UNIVERSE
// =============================================================================
// Comprehensive ETF metadata for portfolio construction
// Data sources: Yahoo Finance (historical), fund providers (current yields)
// Total ETFs: 63
// =============================================================================

// =============================================================================
// ETF DATABASE - GROUPED BY DISPLAY CATEGORIES
// =============================================================================
export const ETF_DATABASE = {
  'US Broad Market': [
    {
      symbol: 'SPY',
      name: 'SPDR S&P 500 ETF',
      factor: 'Market',
      yield: 1.3,
      expense: 0.0945,
      inception: '1993-01-22',
      description: 'Tracks S&P 500 index, oldest and most liquid ETF',
      taxEfficiency: 'high'
    },
    {
      symbol: 'VTI',
      name: 'Vanguard Total Stock Market ETF',
      factor: 'Market',
      yield: 1.4,
      expense: 0.03,
      inception: '2001-05-31',
      description: 'Total US market exposure (3,500+ stocks)',
      taxEfficiency: 'high'
    },
    {
      symbol: 'VOO',
      name: 'Vanguard S&P 500 ETF',
      factor: 'Market',
      yield: 1.3,
      expense: 0.03,
      inception: '2010-09-07',
      description: 'Low-cost S&P 500 tracker from Vanguard',
      taxEfficiency: 'high'
    },
    {
      symbol: 'QQQ',
      name: 'Invesco QQQ Trust',
      factor: 'Tech/Growth',
      yield: 0.6,
      expense: 0.20,
      inception: '1999-03-10',
      description: 'Nasdaq-100 Index (large-cap growth/tech)',
      taxEfficiency: 'high'
    }
  ],

  'US Growth': [
    {
      symbol: 'VUG',
      name: 'Vanguard Growth ETF',
      factor: 'Growth',
      yield: 0.6,
      expense: 0.04,
      inception: '2004-01-26',
      description: 'Large-cap growth stocks',
      taxEfficiency: 'high'
    },
    {
      symbol: 'SCHG',
      name: 'Schwab US Large-Cap Growth ETF',
      factor: 'Growth',
      yield: 0.6,
      expense: 0.04,
      inception: '2009-12-11',
      description: 'Low-cost large-cap growth exposure',
      taxEfficiency: 'high'
    },
    {
      symbol: 'IVW',
      name: 'iShares S&P 500 Growth ETF',
      factor: 'Growth',
      yield: 0.7,
      expense: 0.18,
      inception: '2000-05-22',
      description: 'S&P 500 growth subset',
      taxEfficiency: 'high'
    },
  'VTI': {
    symbol: 'VTI',
    name: 'Vanguard Total Stock Market ETF',
    category: 'Core',
    factor: 'Market',
    yield: 1.4,
    expense: 0.03,
    inception: '2001-05-31',
    description: 'Total US market exposure (3,500+ stocks)',
    taxEfficiency: 'high'
  },
  'VOO': {
    symbol: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    category: 'Core',
    factor: 'Market',
    yield: 1.3,
    expense: 0.03,
    inception: '2010-09-07',
    description: 'Low-cost S&P 500 tracker from Vanguard',
    taxEfficiency: 'high'
  },
  'QQQ': {
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust',
    category: 'Core',
    factor: 'Tech/Growth',
    yield: 0.6,
    expense: 0.20,
    inception: '1999-03-10',
    description: 'Nasdaq-100 Index (large-cap growth/tech)',
    taxEfficiency: 'high'
  },

  // =============================================================================
  // GROWTH FACTORS
  // =============================================================================
  'VUG': {
    symbol: 'VUG',
    name: 'Vanguard Growth ETF',
    category: 'Growth',
    factor: 'Growth',
    yield: 0.6,
    expense: 0.04,
    inception: '2004-01-26',
    description: 'Large-cap growth stocks',
    taxEfficiency: 'high'
  },
  'SCHG': {
    symbol: 'SCHG',
    name: 'Schwab US Large-Cap Growth ETF',
    category: 'Growth',
    factor: 'Growth',
    yield: 0.6,
    expense: 0.04,
    inception: '2009-12-11',
    description: 'Low-cost large-cap growth exposure',
    taxEfficiency: 'high'
  },
  'IVW': {
    symbol: 'IVW',
    name: 'iShares S&P 500 Growth ETF',
    category: 'Growth',
    factor: 'Growth',
    yield: 0.7,
    expense: 0.18,
    inception: '2000-05-22',
    description: 'S&P 500 growth subset',
    taxEfficiency: 'high'
  },
  'IWF': {
    symbol: 'IWF',
    name: 'iShares Russell 1000 Growth ETF',
    category: 'Growth',
    factor: 'Growth',
    yield: 0.7,
    expense: 0.19,
    inception: '2000-05-22',
    description: 'Russell 1000 Growth Index',
    taxEfficiency: 'high'
  },

  // =============================================================================
  // VALUE FACTORS
  // =============================================================================
  'VTV': {
    symbol: 'VTV',
    name: 'Vanguard Value ETF',
    category: 'Value',
    factor: 'Value',
    yield: 2.3,
    expense: 0.04,
    inception: '2004-01-26',
    description: 'Large-cap value stocks',
    taxEfficiency: 'medium'
  },
  'SCHV': {
    symbol: 'SCHV',
    name: 'Schwab US Large-Cap Value ETF',
    category: 'Value',
    factor: 'Value',
    yield: 2.5,
    expense: 0.04,
    inception: '2009-12-11',
    description: 'Low-cost large-cap value',
    taxEfficiency: 'medium'
  },
  'IVE': {
    symbol: 'IVE',
    name: 'iShares S&P 500 Value ETF',
    category: 'Value',
    factor: 'Value',
    yield: 2.4,
    expense: 0.18,
    inception: '2000-05-22',
    description: 'S&P 500 value subset',
    taxEfficiency: 'medium'
  },
  'AVUV': {
    symbol: 'AVUV',
    name: 'Avantis US Small Cap Value ETF',
    category: 'Factor - Value/Small',
    factor: 'Value + Size',
    yield: 2.0,
    expense: 0.25,
    inception: '2019-09-24',
    description: 'Small-cap value with profitability screen',
    taxEfficiency: 'medium'
  },
  'AVDV': {
    symbol: 'AVDV',
    name: 'Avantis International Small Cap Value ETF',
    category: 'Factor - Intl Value',
    factor: 'Intl Value + Size',
    yield: 3.1,
    expense: 0.36,
    inception: '2019-09-24',
    description: 'International small-cap value',
    taxEfficiency: 'low'
  },

  // =============================================================================
  // SIZE FACTOR (SMALL CAP)
  // =============================================================================
  'VB': {
    symbol: 'VB',
    name: 'Vanguard Small-Cap ETF',
    category: 'Small Cap',
    factor: 'Size',
    yield: 1.5,
    expense: 0.05,
    inception: '2004-01-26',
    description: 'Small-cap blend',
    taxEfficiency: 'medium'
  },
  'IJR': {
    symbol: 'IJR',
    name: 'iShares Core S&P Small-Cap ETF',
    category: 'Small Cap',
    factor: 'Size',
    yield: 1.4,
    expense: 0.06,
    inception: '2000-05-22',
    description: 'S&P SmallCap 600',
    taxEfficiency: 'medium'
  },
  'IWM': {
    symbol: 'IWM',
    name: 'iShares Russell 2000 ETF',
    category: 'Small Cap',
    factor: 'Size',
    yield: 1.3,
    expense: 0.19,
    inception: '2000-05-22',
    description: 'Russell 2000 Index',
    taxEfficiency: 'medium'
  },
  'SIZE': {
    symbol: 'SIZE',
    name: 'iShares MSCI USA Size Factor ETF',
    category: 'Factor - Size',
    factor: 'Size',
    yield: 1.6,
    expense: 0.15,
    inception: '2013-04-16',
    description: 'Small-cap factor exposure',
    taxEfficiency: 'medium'
  },

  // =============================================================================
  // FACTOR TILTS (MOMENTUM, QUALITY, LOW VOL)
  // =============================================================================
  'MTUM': {
    symbol: 'MTUM',
    name: 'iShares MSCI USA Momentum Factor ETF',
    category: 'Factor - Momentum',
    factor: 'Momentum',
    yield: 0.8,
    expense: 0.15,
    inception: '2013-04-16',
    description: 'Stocks with strong price momentum',
    taxEfficiency: 'low'
  },
  'IMOM': {
    symbol: 'IMOM',
    name: 'iShares MSCI International Momentum Factor ETF',
    category: 'Factor - Intl Momentum',
    factor: 'Intl Momentum',
    yield: 1.2,
    expense: 0.30,
    inception: '2014-01-28',
    description: 'International momentum factor',
    taxEfficiency: 'low'
  },
  'QUAL': {
    symbol: 'QUAL',
    name: 'iShares MSCI USA Quality Factor ETF',
    category: 'Factor - Quality',
    factor: 'Quality',
    yield: 1.5,
    expense: 0.15,
    inception: '2013-07-16',
    description: 'High ROE, stable earnings, low debt',
    taxEfficiency: 'medium'
  },
  'USMV': {
    symbol: 'USMV',
    name: 'iShares MSCI USA Min Vol Factor ETF',
    category: 'Factor - Low Volatility',
    factor: 'Low Vol',
    yield: 1.8,
    expense: 0.15,
    inception: '2011-10-18',
    description: 'Low-volatility stocks',
    taxEfficiency: 'medium'
  },

  // =============================================================================
  // DIVIDEND/INCOME - TRADITIONAL
  // =============================================================================
  'SCHD': {
    symbol: 'SCHD',
    name: 'Schwab US Dividend Equity ETF',
    category: 'Dividend',
    factor: 'Dividend',
    yield: 3.8,
    expense: 0.06,
    inception: '2011-10-20',
    description: 'Quality dividend growers, 10+ year track record',
    taxEfficiency: 'medium'
  },
  'VYM': {
    symbol: 'VYM',
    name: 'Vanguard High Dividend Yield ETF',
    category: 'Dividend',
    factor: 'Dividend',
    yield: 2.4,
    expense: 0.06,
    inception: '2006-11-10',
    description: 'High-yielding stocks',
    taxEfficiency: 'medium'
  },
  'VYMI': {
    symbol: 'VYMI',
    name: 'Vanguard International High Dividend Yield ETF',
    category: 'Dividend - Intl',
    factor: 'Intl Dividend',
    yield: 3.5,
    expense: 0.22,
    inception: '2016-02-25',
    description: 'International dividend stocks',
    taxEfficiency: 'low'
  },
  'HDV': {
    symbol: 'HDV',
    name: 'iShares Core High Dividend ETF',
    category: 'Dividend',
    factor: 'Dividend',
    yield: 3.6,
    expense: 0.08,
    inception: '2011-03-29',
    description: 'High-quality dividend payers',
    taxEfficiency: 'medium'
  },

  // =============================================================================
  // DIVIDEND GROWTH
  // =============================================================================
  'DGRW': {
    symbol: 'DGRW',
    name: 'WisdomTree US Quality Dividend Growth Fund',
    category: 'Dividend Growth',
    factor: 'Dividend Growth',
    yield: 2.0,
    expense: 0.28,
    inception: '2013-06-12',
    description: 'Dividend growth + quality',
    taxEfficiency: 'medium'
  },
  'DGRO': {
    symbol: 'DGRO',
    name: 'iShares Core Dividend Growth ETF',
    category: 'Dividend Growth',
    factor: 'Dividend Growth',
    yield: 2.3,
    expense: 0.08,
    inception: '2014-06-10',
    description: 'Consistent dividend growth',
    taxEfficiency: 'medium'
  },
  'VIG': {
    symbol: 'VIG',
    name: 'Vanguard Dividend Appreciation ETF',
    category: 'Dividend Growth',
    factor: 'Dividend Growth',
    yield: 1.7,
    expense: 0.06,
    inception: '2006-04-21',
    description: '10+ years of dividend growth',
    taxEfficiency: 'medium'
  },

  // =============================================================================
  // HIGH INCOME - COVERED CALL STRATEGIES
  // =============================================================================
  'JEPI': {
    symbol: 'JEPI',
    name: 'JPMorgan Equity Premium Income ETF',
    category: 'High Income',
    factor: 'Covered Calls',
    yield: 7.5,
    expense: 0.35,
    inception: '2020-05-20',
    description: 'Covered calls on S&P 500 stocks',
    taxEfficiency: 'low'
  },
  'JEPQ': {
    symbol: 'JEPQ',
    name: 'JPMorgan Nasdaq Equity Premium Income ETF',
    category: 'High Income',
    factor: 'Covered Calls',
    yield: 9.2,
    expense: 0.35,
    inception: '2022-05-03',
    description: 'Covered calls on Nasdaq-100',
    taxEfficiency: 'low'
  },
  'XYLD': {
    symbol: 'XYLD',
    name: 'Global X S&P 500 Covered Call ETF',
    category: 'High Income',
    factor: 'Covered Calls',
    yield: 11.5,
    expense: 0.60,
    inception: '2013-06-11',
    description: 'Covered calls on SPY',
    taxEfficiency: 'low'
  },
  'QYLD': {
    symbol: 'QYLD',
    name: 'Global X NASDAQ 100 Covered Call ETF',
    category: 'High Income',
    factor: 'Covered Calls',
    yield: 12.0,
    expense: 0.60,
    inception: '2013-12-11',
    description: 'Covered calls on QQQ',
    taxEfficiency: 'low'
  },
  'RYLD': {
    symbol: 'RYLD',
    name: 'Global X Russell 2000 Covered Call ETF',
    category: 'High Income',
    factor: 'Covered Calls',
    yield: 11.8,
    expense: 0.60,
    inception: '2019-08-01',
    description: 'Covered calls on IWM',
    taxEfficiency: 'low'
  },

  // =============================================================================
  // HIGH INCOME - OTHER STRATEGIES
  // =============================================================================
  'FDVV': {
    symbol: 'FDVV',
    name: 'Fidelity High Dividend ETF',
    category: 'High Dividend',
    factor: 'High Dividend',
    yield: 4.2,
    expense: 0.29,
    inception: '2016-02-11',
    description: 'High-yielding US stocks',
    taxEfficiency: 'low'
  },
  'QQQI': {
    symbol: 'QQQI',
    name: 'Pacer Nasdaq-100 Top 50 Cash Cow ETF',
    category: 'High Income',
    factor: 'Options Strategy',
    yield: 8.5,
    expense: 0.68,
    inception: '2023-04-17',
    description: 'Top 50 Nasdaq stocks + options',
    taxEfficiency: 'low'
  },
  'SPHD': {
    symbol: 'SPHD',
    name: 'Invesco S&P 500 High Dividend Low Volatility ETF',
    category: 'High Dividend + Low Vol',
    factor: 'Dividend + Low Vol',
    yield: 4.5,
    expense: 0.30,
    inception: '2012-10-18',
    description: 'High dividend + low volatility combo',
    taxEfficiency: 'medium'
  },
  'SPYD': {
    symbol: 'SPYD',
    name: 'SPDR Portfolio S&P 500 High Dividend ETF',
    category: 'High Dividend',
    factor: 'High Dividend',
    yield: 4.8,
    expense: 0.07,
    inception: '2015-10-21',
    description: 'Top 80 dividend payers in S&P 500',
    taxEfficiency: 'medium'
  },

  // =============================================================================
  // PREFERRED STOCK & ALTERNATIVE INCOME
  // =============================================================================
  'PFF': {
    symbol: 'PFF',
    name: 'iShares Preferred and Income Securities ETF',
    category: 'Preferred Stock',
    factor: 'Preferred Stock',
    yield: 6.2,
    expense: 0.45,
    inception: '2007-03-26',
    description: 'Preferred stocks, high income',
    taxEfficiency: 'low'
  },
  'PFFD': {
    symbol: 'PFFD',
    name: 'Global X US Preferred ETF',
    category: 'Preferred Stock',
    factor: 'Preferred Stock',
    yield: 6.5,
    expense: 0.23,
    inception: '2017-10-26',
    description: 'US preferred stocks',
    taxEfficiency: 'low'
  },

  // =============================================================================
  // INTERNATIONAL DEVELOPED
  // =============================================================================
  'VXUS': {
    symbol: 'VXUS',
    name: 'Vanguard Total International Stock ETF',
    category: 'International',
    factor: 'International',
    yield: 3.0,
    expense: 0.07,
    inception: '2011-01-26',
    description: 'Total international ex-US',
    taxEfficiency: 'low'
  },
  'VEU': {
    symbol: 'VEU',
    name: 'Vanguard FTSE All-World ex-US ETF',
    category: 'International',
    factor: 'International',
    yield: 3.0,
    expense: 0.07,
    inception: '2007-03-02',
    description: 'Developed + emerging ex-US',
    taxEfficiency: 'low'
  },
  'VEA': {
    symbol: 'VEA',
    name: 'Vanguard FTSE Developed Markets ETF',
    category: 'International',
    factor: 'International',
    yield: 3.2,
    expense: 0.05,
    inception: '2007-07-20',
    description: 'Developed markets ex-US',
    taxEfficiency: 'low'
  },
  'VGK': {
    symbol: 'VGK',
    name: 'Vanguard FTSE Europe ETF',
    category: 'International',
    factor: 'International',
    yield: 3.4,
    expense: 0.08,
    inception: '2005-03-04',
    description: 'European stocks',
    taxEfficiency: 'low'
  },

  // =============================================================================
  // EMERGING MARKETS
  // =============================================================================
  'VWO': {
    symbol: 'VWO',
    name: 'Vanguard FTSE Emerging Markets ETF',
    category: 'Emerging Markets',
    factor: 'Emerging',
    yield: 3.5,
    expense: 0.08,
    inception: '2005-03-04',
    description: 'Emerging markets exposure',
    taxEfficiency: 'low'
  },
  'IEMG': {
    symbol: 'IEMG',
    name: 'iShares Core MSCI Emerging Markets ETF',
    category: 'Emerging Markets',
    factor: 'Emerging',
    yield: 2.8,
    expense: 0.11,
    inception: '2012-10-18',
    description: 'Low-cost emerging markets',
    taxEfficiency: 'low'
  },
  'EEM': {
    symbol: 'EEM',
    name: 'iShares MSCI Emerging Markets ETF',
    category: 'Emerging Markets',
    factor: 'Emerging',
    yield: 3.3,
    expense: 0.70,
    inception: '2003-04-07',
    description: 'Established emerging markets ETF',
    taxEfficiency: 'low'
  },

  // =============================================================================
  // SECTOR CONCENTRATION
  // =============================================================================
  'VGT': {
    symbol: 'VGT',
    name: 'Vanguard Information Technology ETF',
    category: 'Sector - Tech',
    factor: 'Tech',
    yield: 0.7,
    expense: 0.10,
    inception: '2004-01-26',
    description: 'Technology sector',
    taxEfficiency: 'medium'
  },
  'XLK': {
    symbol: 'XLK',
    name: 'Technology Select Sector SPDR Fund',
    category: 'Sector - Tech',
    factor: 'Tech',
    yield: 0.8,
    expense: 0.10,
    inception: '1998-12-16',
    description: 'Tech sector from S&P 500',
    taxEfficiency: 'medium'
  },
  'XLF': {
    symbol: 'XLF',
    name: 'Financial Select Sector SPDR Fund',
    category: 'Sector - Financials',
    factor: 'Financials',
    yield: 1.8,
    expense: 0.10,
    inception: '1998-12-16',
    description: 'Financial sector',
    taxEfficiency: 'medium'
  },
  'XLE': {
    symbol: 'XLE',
    name: 'Energy Select Sector SPDR Fund',
    category: 'Sector - Energy',
    factor: 'Energy',
    yield: 3.2,
    expense: 0.10,
    inception: '1998-12-16',
    description: 'Energy sector',
    taxEfficiency: 'medium'
  },
  'XLV': {
    symbol: 'XLV',
    name: 'Health Care Select Sector SPDR Fund',
    category: 'Sector - Healthcare',
    factor: 'Healthcare',
    yield: 1.5,
    expense: 0.10,
    inception: '1998-12-16',
    description: 'Healthcare sector',
    taxEfficiency: 'medium'
  },
  'XLI': {
    symbol: 'XLI',
    name: 'Industrial Select Sector SPDR Fund',
    category: 'Sector - Industrials',
    factor: 'Industrials',
    yield: 1.6,
    expense: 0.10,
    inception: '1998-12-16',
    description: 'Industrial sector',
    taxEfficiency: 'medium'
  },

  // =============================================================================
  // REAL ESTATE
  // =============================================================================
  'VNQ': {
    symbol: 'VNQ',
    name: 'Vanguard Real Estate ETF',
    category: 'Real Estate',
    factor: 'Real Estate',
    yield: 4.2,
    expense: 0.12,
    inception: '2004-09-23',
    description: 'REITs and real estate stocks',
    taxEfficiency: 'low'
  },

  // =============================================================================
  // FIXED INCOME (DEFENSIVE BALLAST)
  // =============================================================================
  'BND': {
    symbol: 'BND',
    name: 'Vanguard Total Bond Market ETF',
    category: 'Defensive Ballast',
    factor: 'Bonds',
    yield: 4.2,
    expense: 0.03,
    inception: '2007-04-03',
    description: 'Total US bond market',
    taxEfficiency: 'low'
  },
  'BNDX': {
    symbol: 'BNDX',
    name: 'Vanguard Total International Bond ETF',
    category: 'Defensive Ballast - Intl',
    factor: 'Intl Bonds',
    yield: 3.8,
    expense: 0.07,
    inception: '2013-05-31',
    description: 'International bonds ex-US',
    taxEfficiency: 'low'
  },
  'AGG': {
    symbol: 'AGG',
    name: 'iShares Core US Aggregate Bond ETF',
    category: 'Defensive Ballast',
    factor: 'Bonds',
    yield: 4.1,
    expense: 0.03,
    inception: '2003-09-22',
    description: 'US investment-grade bonds',
    taxEfficiency: 'low'
  },
  'TLT': {
    symbol: 'TLT',
    name: 'iShares 20+ Year Treasury Bond ETF',
    category: 'Defensive Ballast',
    factor: 'Long Bonds',
    yield: 4.5,
    expense: 0.15,
    inception: '2002-07-22',
    description: 'Long-duration Treasuries',
    taxEfficiency: 'low'
  },
  'IEF': {
    symbol: 'IEF',
    name: 'iShares 7-10 Year Treasury Bond ETF',
    category: 'Defensive Ballast',
    factor: 'Intermediate Bonds',
    yield: 4.0,
    expense: 0.15,
    inception: '2002-07-22',
    description: 'Intermediate-term Treasuries',
    taxEfficiency: 'low'
  },
  'TIP': {
    symbol: 'TIP',
    name: 'iShares TIPS Bond ETF',
    category: 'Defensive Ballast',
    factor: 'Inflation Protection',
    yield: 4.8,
    expense: 0.19,
    inception: '2003-12-04',
    description: 'Treasury Inflation-Protected Securities',
    taxEfficiency: 'low'
  },
  'SHY': {
    symbol: 'SHY',
    name: 'iShares 1-3 Year Treasury Bond ETF',
    category: 'Defensive Ballast',
    factor: 'Short Bonds',
    yield: 4.5,
    expense: 0.15,
    inception: '2002-07-22',
    description: 'Short-term Treasuries',
    taxEfficiency: 'medium'
  },

  // =============================================================================
  // ALTERNATIVES & COMMODITIES
  // =============================================================================
  'GLD': {
    symbol: 'GLD',
    name: 'SPDR Gold Shares',
    category: 'Safe Haven',
    factor: 'Gold',
    yield: 0.0,
    expense: 0.40,
    inception: '2004-11-18',
    description: 'Physical gold holdings',
    taxEfficiency: 'low'
  },
  'DBC': {
    symbol: 'DBC',
    name: 'Invesco DB Commodity Index Tracking Fund',
    category: 'Commodities',
    factor: 'Commodities',
    yield: 0.0,
    expense: 0.87,
    inception: '2006-02-03',
    description: 'Broad commodities exposure',
    taxEfficiency: 'low'
  },

  // =============================================================================
  // AGGRESSIVE GROWTH
  // =============================================================================
  'ARKK': {
    symbol: 'ARKK',
    name: 'ARK Innovation ETF',
    category: 'Aggressive Growth',
    factor: 'Innovation',
    yield: 0.0,
    expense: 0.75,
    inception: '2014-10-31',
    description: 'Disruptive innovation stocks',
    taxEfficiency: 'low'
  }
};

// =============================================================================
// FACTOR GROUPINGS FOR PORTFOLIO CONSTRUCTION
// =============================================================================
export const FACTOR_GROUPS = {
  'broad-market': ['SPY', 'VOO', 'VTI', 'QQQ'],
  'growth': ['VUG', 'IWF', 'SCHG', 'IVW'],
  'value': ['VTV', 'SCHV', 'IVE', 'AVUV', 'AVDV'],
  'small-cap': ['VB', 'IJR', 'IWM', 'SIZE'],
  'momentum': ['MTUM', 'IMOM'],
  'quality': ['QUAL'],
  'low-vol': ['USMV'],
  'dividend': ['SCHD', 'VYM', 'VYMI', 'HDV'],
  'dividend-growth': ['DGRW', 'DGRO', 'VIG'],
  'high-income': ['JEPI', 'JEPQ', 'XYLD', 'QYLD', 'RYLD', 'FDVV', 'QQQI', 'SPHD', 'SPYD'],
  'preferred': ['PFF', 'PFFD'],
  'international': ['VXUS', 'VEU', 'VEA', 'VGK'],
  'emerging': ['VWO', 'IEMG', 'EEM'],
  'sectors': ['VGT', 'XLK', 'XLF', 'XLE', 'XLV', 'XLI'],
  'real-estate': ['VNQ'],
  'bonds': ['BND', 'BNDX', 'AGG', 'TLT', 'IEF', 'TIP', 'SHY'],
  'alternatives': ['GLD', 'DBC'],
  'aggressive': ['ARKK']
};

// =============================================================================
// GOAL-BASED PORTFOLIO RECOMMENDATIONS
// =============================================================================
export const GOAL_PORTFOLIOS = {
  'growth': {
    name: 'Growth Portfolio',
    description: 'Maximum long-term growth, higher volatility',
    etfs: ['VUG', 'SCHG', 'QQQ', 'VGT'],
    typical_allocation: { VUG: 40, SCHG: 25, QQQ: 20, VGT: 15 }
  },
  'growth-income': {
    name: 'Growth + Income',
    description: 'Growth with income generation',
    etfs: ['VOO', 'SCHD', 'VIG', 'JEPI'],
    typical_allocation: { VOO: 40, SCHD: 25, VIG: 20, JEPI: 15 }
  },
  'income': {
    name: 'Income Portfolio',
    description: 'Maximum current income',
    etfs: ['JEPI', 'JEPQ', 'SCHD', 'QYLD'],
    typical_allocation: { JEPI: 30, JEPQ: 25, SCHD: 25, QYLD: 20 }
  },
  'balanced': {
    name: 'Balanced Portfolio',
    description: 'Mix of growth and income',
    etfs: ['VOO', 'VTI', 'SCHD', 'BND'],
    typical_allocation: { VOO: 35, VTI: 25, SCHD: 20, BND: 20 }
  },
  'conservative': {
    name: 'Conservative Portfolio',
    description: 'Capital preservation focus',
    etfs: ['USMV', 'SCHD', 'BND', 'SHY'],
    typical_allocation: { USMV: 25, SCHD: 25, BND: 30, SHY: 20 }
  },
  'early-retirement': {
    name: 'Early Retirement',
    description: 'Income without principal depletion',
    etfs: ['JEPI', 'SCHD', 'VYM', 'USMV', 'BND'],
    typical_allocation: { JEPI: 25, SCHD: 25, VYM: 20, USMV: 15, BND: 15 }
  }
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get ETF by symbol
 */
export const getETF = (symbol) => ETF_UNIVERSE[symbol];

/**
 * Get all ETFs in a factor group
 */
export const getETFsByFactor = (factor) => {
  const symbols = FACTOR_GROUPS[factor] || [];
  return symbols.map(symbol => ETF_UNIVERSE[symbol]).filter(Boolean);
};

/**
 * Get all ETFs in a category
 */
export const getETFsByCategory = (category) => {
  return Object.values(ETF_UNIVERSE).filter(etf => etf.category === category);
};

/**
 * Search ETFs by name or symbol
 */
export const searchETFs = (query) => {
  const lowerQuery = query.toLowerCase();
  return Object.values(ETF_UNIVERSE).filter(etf => 
    etf.symbol.toLowerCase().includes(lowerQuery) ||
    etf.name.toLowerCase().includes(lowerQuery) ||
    etf.description.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get all ETF symbols
 */
export const getAllSymbols = () => Object.keys(ETF_UNIVERSE);

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
// EXPORT DEFAULT
// =============================================================================
export default {
  ETF_UNIVERSE,
  FACTOR_GROUPS,
  GOAL_PORTFOLIOS,
  getETF,
  getETFsByFactor,
  getETFsByCategory,
  searchETFs,
  getAllSymbols,
  getTaxEfficientETFs,
  getTaxInEfficientETFs,
  calculateWeightedExpenseRatio,
  calculateWeightedYield
};
