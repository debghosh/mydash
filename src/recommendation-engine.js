/**
 * Alphatic Recommendation Engine
 * Generates comprehensive financial plans based on client profile
 */

import { CLIENT_PERSONAS } from './client-personas.js';

// ETF Universe - 38 ETFs covering all major asset classes
const ETF_UNIVERSE = {
  'SCHD': { yield: 3.8, expense: 0.06, category: 'dividend' },
  'VIG': { yield: 1.7, expense: 0.06, category: 'dividend_growth' },
  'VYM': { yield: 2.4, expense: 0.06, category: 'dividend' },
  'FDVV': { yield: 2.9, expense: 0.15, category: 'dividend' },
  'SPY': { yield: 1.3, expense: 0.09, category: 'large_blend' },
  'VOO': { yield: 1.3, expense: 0.03, category: 'large_blend' },
  'VTI': { yield: 1.4, expense: 0.03, category: 'total_market' },
  'VUG': { yield: 0.6, expense: 0.04, category: 'large_growth' },
  'SCHG': { yield: 0.7, expense: 0.04, category: 'large_growth' },
  'QQQ': { yield: 0.5, expense: 0.20, category: 'tech_growth' },
  'QQQM': { yield: 0.5, expense: 0.15, category: 'tech_growth' },
  'QQQI': { yield: 0.2, expense: 0.40, category: 'internet_growth' },
  'VTV': { yield: 2.3, expense: 0.04, category: 'large_value' },
  'VOE': { yield: 2.1, expense: 0.07, category: 'mid_value' },
  'VBR': { yield: 1.8, expense: 0.07, category: 'small_value' },
  'QUAL': { yield: 1.5, expense: 0.15, category: 'quality' },
  'USMV': { yield: 1.8, expense: 0.15, category: 'low_vol' },
  'FETC': { yield: 1.4, expense: 0.18, category: 'enhanced_core' },
  'MTUM': { yield: 0.8, expense: 0.15, category: 'momentum' },
  'VBK': { yield: 0.8, expense: 0.07, category: 'small_growth' },
  'IJH': { yield: 1.1, expense: 0.05, category: 'mid_blend' },
  'IJR': { yield: 1.3, expense: 0.05, category: 'small_blend' },
  'VEA': { yield: 3.2, expense: 0.05, category: 'developed_intl' },
  'VWO': { yield: 3.5, expense: 0.08, category: 'emerging' },
  'EFA': { yield: 3.0, expense: 0.32, category: 'developed_intl' },
  'EEM': { yield: 2.8, expense: 0.68, category: 'emerging' },
  'IEFA': { yield: 3.1, expense: 0.07, category: 'developed_intl' },
  'VNQ': { yield: 4.2, expense: 0.12, category: 'reit' },
  'XLRE': { yield: 3.8, expense: 0.10, category: 'reit' },
  'JEPI': { yield: 7.8, expense: 0.35, category: 'covered_call' },
  'JEPQ': { yield: 9.2, expense: 0.35, category: 'covered_call' },
  'QYLD': { yield: 11.5, expense: 0.60, category: 'covered_call' },
  'BND': { yield: 4.2, expense: 0.03, category: 'total_bond' },
  'AGG': { yield: 4.1, expense: 0.03, category: 'total_bond' },
  'VTIP': { yield: 3.5, expense: 0.04, category: 'tips' },
  'GLD': { yield: 0, expense: 0.40, category: 'gold' },
  'GSG': { yield: 0, expense: 0.75, category: 'commodities' }
};

/**
 * Main function: Generate comprehensive recommendations
 */
function generateRecommendations(clientData) {
  const lifeStage = detectLifeStage(clientData.age, clientData.totalAssets);
  
  return {
    lifeStage,
    summary: generateExecutiveSummary(clientData, lifeStage),
    assetAllocation: generateAssetAllocation(lifeStage),
    portfolioRecommendations: generatePortfolioRecommendations(clientData, lifeStage),
    taxStrategies: generateTaxStrategies(clientData, lifeStage),
    rothConversionPlan: generateRothPlan(clientData, lifeStage),
    contributionStrategy: generateContributionStrategy(clientData, lifeStage),
    alphaGeneration: generateAlphaSources(lifeStage),
    projections: generateProjections(clientData, lifeStage),
    actionPlan: generateActionPlan(clientData, lifeStage),
    irmaaConsiderations: generateIRMAAStrategy(clientData),
    rmdStrategy: generateRMDStrategy(clientData),
    estatePlanning: generateEstatePlan(clientData)
  };
}

function detectLifeStage(age, assets) {
  if (age < 35 && assets < 100000) return 'young_starter';
  if (age >= 35 && age < 55 && assets < 2000000) return 'mid_life_accumulator';
  if (age >= 55 && age < 65) return 'pre_retirement';
  return 'in_retirement';
}

function generateExecutiveSummary(client, lifeStage) {
  const summaries = {
    young_starter: `Foundation Building: Focus on emergency fund, employer match, and aggressive growth. ${client.timeHorizon || 40}-year horizon allows 95% stocks.`,
    mid_life_accumulator: `Wealth Acceleration: Peak earning years demand sophisticated tax optimization. Employ mega backdoor Roth, maximize all accounts, generate +2.5% alpha.`,
    pre_retirement: `Transition Phase: Final ${client.timeHorizon || 10} years to maximize contributions and begin Roth conversions. Critical decisions on retirement timing and Medicare bridge.`,
    in_retirement: `Income & Legacy: Generate $${((client.currentIncome || 0) * 6).toLocaleString()}/year tax-efficiently while preserving capital. Execute Roth conversions to minimize lifetime taxes.`
  };
  return summaries[lifeStage];
}

function generateAssetAllocation(lifeStage) {
  const allocations = {
    young_starter: { stocks: 0.95, bonds: 0, cash: 0.05, rationale: '40+ year horizon allows maximum growth' },
    mid_life_accumulator: { stocks: 0.85, bonds: 0.10, cash: 0.05, rationale: '20-30 year horizon permits aggressive stance' },
    pre_retirement: { stocks: 0.70, bonds: 0.25, cash: 0.05, rationale: 'Gradual de-risking begins' },
    in_retirement: { stocks: 0.75, bonds: 0.20, cash: 0.05, rationale: '30-year retirement requires continued growth' }
  };
  return allocations[lifeStage];
}

function generatePortfolioRecommendations(client, lifeStage) {
  const portfolios = {
    young_starter: {
      retirement401k: { 'VTI': 0.60, 'VXUS': 0.30, 'VBK': 0.10 },
      rothIRA: { 'QQQM': 0.40, 'VUG': 0.30, 'VWO': 0.20, 'VBK': 0.10 }
    },
    mid_life_accumulator: {
      traditional401k: { 'VTI': 0.40, 'VXUS': 0.25, 'VUG': 0.20, 'VBR': 0.10, 'BND': 0.05 },
      rothIRA: { 'QQQ': 0.30, 'VUG': 0.25, 'VWO': 0.20, 'VNQ': 0.15, 'MTUM': 0.10 },
      taxable: { 'VTI': 0.50, 'VIG': 0.25, 'VXUS': 0.15, 'BND': 0.10 }
    },
    pre_retirement: {
      traditional401k: { 'VTI': 0.35, 'VUG': 0.20, 'VXUS': 0.20, 'BND': 0.20, 'VNQ': 0.05 },
      rothIRA: { 'VUG': 0.30, 'SCHG': 0.25, 'VWO': 0.20, 'VNQ': 0.15, 'QQQM': 0.10 },
      taxable: { 'VIG': 0.30, 'SCHD': 0.25, 'VYM': 0.15, 'VOO': 0.20, 'BND': 0.10 }
    },
    in_retirement: {
      traditionalIRA: { 'VUG': 0.20, 'QUAL': 0.15, 'VWO': 0.12, 'VNQ': 0.15, 'SCHG': 0.08, 'MTUM': 0.08, 'VBK': 0.07, 'BND': 0.05, 'EEM': 0.05, 'GSG': 0.05 },
      taxable: { 'SCHD': 0.25, 'VIG': 0.15, 'VYM': 0.10, 'VOO': 0.20, 'VTV': 0.08, 'VEA': 0.12, 'BND': 0.05, 'GLD': 0.05 }
    }
  };
  return portfolios[lifeStage];
}

function generateTaxStrategies(client, lifeStage) {
  const strategies = {
    young_starter: [
      'Max employer 401k match immediately',
      'Choose Roth 401k over Traditional (low bracket now)',
      'Max HSA if eligible ($4,150/year triple advantage)',
      'Backdoor Roth IRA if income exceeds limits',
      'Tax-loss harvest in taxable account',
      'Hold investments >1 year for LTCG'
    ],
    mid_life_accumulator: [
      'Max both 401ks ($46,000 total)',
      'Execute mega backdoor Roth ($46,000 post-tax → Roth)',
      'Backdoor Roth IRAs for both spouses ($14,000)',
      'Max HSA ($8,300 family)',
      'Donate appreciated stock',
      '529 contributions for state deduction',
      'Systematic tax-loss harvesting'
    ],
    pre_retirement: [
      'Max 401k with catch-up ($30,500)',
      'Backdoor Roth IRAs with catch-up ($16,000)',
      'Begin Roth conversions ($50K/year while working)',
      'At 59.5: Access 401k penalty-free',
      'Retire at 63, convert heavily before Medicare',
      'Delay Social Security to 70 for 24% more'
    ],
    in_retirement: [
      'Front-load Roth conversions ($475K/year × 3)',
      'Move to TX/FL/NV for 0% state tax',
      'Asset location: REITs in IRA',
      '91% qualified dividends at 15% tax',
      'Tax-on-tax management',
      'IRMAA planning',
      'QCDs at 70.5'
    ]
  };
  return strategies[lifeStage];
}

function generateRothPlan(client, lifeStage) {
  const age = client.age || 30;
  const totalPreTax = (client.traditionalIRA || 0) + (client.traditional401k || 0);
  
  if (lifeStage === 'young_starter') {
    return {
      strategy: 'Max Roth Contributions',
      annualRothIRA: 7000,
      annualRoth401k: 23000,
      projectedRothAt65: 1200000,
      taxCost: 0,
      benefit: 'All growth tax-free forever'
    };
  }
  
  if (lifeStage === 'mid_life_accumulator') {
    return {
      strategy: 'Mega Backdoor Roth + Backdoor Roth IRA',
      annualMegaBackdoor: 46000,
      annualBackdoorIRA: 14000,
      projectedRothAt65: 2500000,
      taxCost: 0,
      benefit: '$2.5M tax-free vs $1.6M after-tax'
    };
  }
  
  if (lifeStage === 'pre_retirement') {
    return {
      strategy: 'Begin Strategic Conversions',
      ages58to62: 50000,
      ages63to64: 100000,
      ages65to73: 150000,
      totalConverted: 1400000,
      totalTax: 320000,
      rothAt90: 5200000,
      benefit: '$1.2M more to heirs (tax-free)'
    };
  }
  
  return {
    strategy: age < 65 ? 'Front-Loading (Aggressive)' : 'Opportunistic',
    years60to62: age < 65 ? 475000 : 0,
    years63to65: age < 65 ? 350000 : 250000,
    years66to69: 250000,
    years70to73: 200000,
    totalConverted: Math.min(totalPreTax, 4100000),
    federalTax: 688000,
    taxOnTax: 52000,
    irmaa: 58000,
    totalCost: 798000,
    rothAt90: 9500000,
    benefit: '$2.1M more than paying taxes later'
  };
}

function generateContributionStrategy(client, lifeStage) {
  const strategies = {
    young_starter: {
      priority: ['401k to match', 'HSA to max', 'Pay off high-interest debt', 'Roth IRA', '401k above match'],
      totalAnnual: 34150,
      taxSavings: 8200
    },
    mid_life_accumulator: {
      priority: ['401k to max ($46K)', 'Mega backdoor Roth ($46K)', 'HSA ($8,300)', 'Backdoor Roth ($14K)', '529 ($20K)'],
      totalAnnual: 127300,
      taxSavings: 42000
    },
    pre_retirement: {
      priority: ['401k + catch-up ($30,500)', 'Backdoor Roth + catch-up ($16K)', 'Roth conversions ($50-150K)'],
      totalAnnual: 46500,
      conversionAmount: 100000
    },
    in_retirement: {
      priority: ['Roth conversions ($200-475K/year)', 'Live off dividends + Roth', 'Preserve IRA for RMDs'],
      totalAnnual: 0,
      conversionAmount: 350000
    }
  };
  return strategies[lifeStage];
}

function generateAlphaSources(lifeStage) {
  return {
    factorTilts: { amount: 1.2, sources: ['Quality (+0.5%)', 'Value (+0.4%)', 'Momentum (+0.3%)'] },
    taxEfficiency: { amount: 0.8, sources: ['Asset location (+0.4%)', 'Qualified dividends (+0.2%)'] },
    rebalancing: { amount: 0.4, sources: ['Quarterly rebalancing'] },
    costSavings: { amount: 0.5, sources: ['Low expense ratios'] },
    tactical: { amount: lifeStage === 'in_retirement' ? 0.7 : 0.5, sources: ['Regime-responsive'] },
    totalAlpha: 3.6,
    vsIndex: 'S&P 500 + 3.6%'
  };
}

function generateProjections(client, lifeStage) {
  const age = client.age || 30;
  const totalAssets = client.totalAssets || 0;
  const years = lifeStage === 'in_retirement' ? 30 : ((client.retirementAge || 65) - age);
  
  const baseReturn = 0.09;
  const alpha = 0.031;
  const totalReturn = baseReturn + alpha;
  
  const contributions = {
    young_starter: 34150,
    mid_life_accumulator: 127300,
    pre_retirement: 46500,
    in_retirement: -150000
  }[lifeStage] || 0;
  
  const projections = [];
  let currentValue = totalAssets;
  
  for (let i = 1; i <= Math.min(years, 30); i++) {
    currentValue = (currentValue + contributions) * (1 + totalReturn);
    if ([1, 5, 10, 15, 20, 25, 30].includes(i)) {
      projections.push({
        year: i,
        age: age + i,
        portfolioValue: Math.round(currentValue),
        growth: Math.round(((currentValue / totalAssets) - 1) * 100)
      });
    }
  }
  
  return {
    projections,
    finalValue: Math.round(currentValue),
    totalGrowth: Math.round(((currentValue / totalAssets) - 1) * 100),
    assumptions: { return: '12.1%', contributions: `$${contributions.toLocaleString()}/year` }
  };
}

function generateActionPlan(client, lifeStage) {
  const plans = {
    young_starter: {
      immediate: ['Open Roth IRA', 'Enroll in 401k at match level', 'Set up auto-transfers', 'Build emergency fund'],
      thisMonth: ['Increase 401k to 15%', 'Fund Roth IRA', 'Research HSA option'],
      thisQuarter: ['Pay off credit card debt', 'Reach $10K emergency fund', 'Open taxable brokerage'],
      thisYear: ['Max Roth IRA ($7K)', 'Hit 15%+ 401k', 'Start HSA ($4,150)']
    },
    mid_life_accumulator: {
      immediate: ['Verify mega backdoor Roth', 'Schedule CPA meeting', 'Review employer benefits'],
      thisMonth: ['Max both 401ks', 'Execute backdoor Roth IRA', 'Start mega backdoor'],
      thisQuarter: ['Complete mega backdoor', 'Donate appreciated stock', 'Tax-loss harvest'],
      thisYear: ['Total contributions: $127K+', 'Max HSA', 'Fund 529s']
    },
    pre_retirement: {
      immediate: ['Schedule retirement planning', 'Model retirement ages', 'Calculate SS benefits'],
      thisMonth: ['Max 401k + catch-up', 'Execute backdoor Roth', 'Begin Roth conversion'],
      thisQuarter: ['Create income plan', 'Model conversions', 'Plan healthcare bridge'],
      thisYear: ['Contributions: $46,500', 'Conversions: $50-150K', 'Finalize retirement date']
    },
    in_retirement: {
      immediate: ['Execute Roth conversion', 'Set up quarterly taxes', 'Transition to ETFs'],
      thisMonth: ['Sell stocks for Q1 tax', 'Rebalance taxable', 'Rebalance IRA'],
      thisQuarter: ['Pay Q1 taxes', 'Continue transition', 'Review allocations'],
      thisYear: ['Complete first conversion', 'Pay 4 quarterly estimates', 'Full ETF transition']
    }
  };
  return plans[lifeStage];
}

function generateIRMAAStrategy(client) {
  const age = client.age || 30;
  
  if (age < 63) {
    return { applicable: false, note: 'IRMAA not relevant until age 65' };
  }
  
  return {
    applicable: true,
    thresholds2026: {
      standard: { magi: 106000, premium: 0 },
      tier1: { magi: 133000, premium: 840 },
      tier2: { magi: 167000, premium: 2100 },
      tier3: { magi: 200000, premium: 3360 }
    },
    strategy: [
      'Keep MAGI under $200K ages 63-65 if possible',
      'Large conversions BEFORE Medicare',
      'After 65: Accept surcharges for tax-free growth',
      'Appeal if major life change'
    ]
  };
}

function generateRMDStrategy(client) {
  const age = client.age || 30;
  const totalPreTax = (client.traditionalIRA || 0) + (client.traditional401k || 0);
  
  if (age < 70) {
    return {
      applicable: false,
      yearsUntilRMD: 73 - age,
      strategy: `Use next ${73 - age} years for Roth conversions`
    };
  }
  
  const rmdRate = age >= 73 ? 0.0377 : 0;
  
  return {
    applicable: age >= 73,
    rmdAge: 73,
    currentRate: rmdRate,
    estimatedRMD: Math.round(totalPreTax * rmdRate),
    strategy: [
      'RMDs begin at 73 (SECURE Act 2.0)',
      'Miss RMD = 25% penalty',
      'QCDs at 70.5: Donate up to $105K',
      'QCDs count toward RMD but tax-free'
    ]
  };
}

function generateEstatePlan(client) {
  const totalAssets = client.totalAssets || 0;
  const exemption = 13610000;
  
  return {
    currentEstate: totalAssets,
    exemption,
    estateTaxRisk: totalAssets > exemption,
    recommendations: [
      'Update beneficiaries annually',
      'Consider revocable living trust',
      'Roth IRA: Tax-free to heirs',
      'Annual gifting ($18K/person)',
      'Healthcare directive + POA',
      'Estate review every 3-5 years'
    ],
    rothAdvantage: {
      traditionalBalance: client.traditionalIRA || 0,
      heirTaxDifference: Math.round((client.traditionalIRA || 0) * 0.35),
      strategy: 'Roth conversions increase heir value by 35-40%'
    }
  };
}

export {
  generateRecommendations,
  detectLifeStage,
  generateExecutiveSummary,
  generateAssetAllocation,
  generatePortfolioRecommendations,
  generateTaxStrategies,
  generateRothPlan,
  generateContributionStrategy,
  generateAlphaSources,
  generateProjections,
  generateActionPlan,
  generateIRMAAStrategy,
  generateRMDStrategy,
  generateEstatePlan,
  ETF_UNIVERSE
};
