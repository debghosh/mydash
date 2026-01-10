// Client Personas - Four Life Stages for Wealth Management Demo
// Each persona has complete financial profile with realistic defaults

export const CLIENT_PERSONAS = {
  young_starter: {
    id: 'young_starter',
    displayName: 'Young Starter',
    profileName: 'Emma Rodriguez',
    
    // Demographics
    age: 26,
    maritalStatus: 'single',
    dependents: 0,
    location: 'Austin, TX',
    
    // Income
    currentIncome: 65000,
    expectedIncomeGrowth: 0.06, // 6% annual raises
    otherIncome: 0,
    
    // Assets (Total: $15,000)
    assets: {
      checking: 5000,
      savings: 8000,
      roth401k: 2000,
      rothIRA: 0,
      traditional401k: 0,
      traditionalIRA: 0,
      taxableBrokerage: 0,
      hsa: 0,
      realEstate: 0,
      other: 0
    },
    
    // Liabilities
    liabilities: {
      studentLoans: 28000,
      creditCard: 1500,
      auto: 0,
      mortgage: 0,
      other: 0
    },
    
    // Employer Benefits
    employer401kMatch: 0.05, // 5% match
    employer401kMatchLimit: 0.05, // Up to 5% of salary
    employerHSA: 600, // Annual HSA contribution
    
    // Goals
    primaryGoals: [
      'Build 6-month emergency fund',
      'Pay off credit card debt',
      'Start investing for retirement',
      'Save for first home down payment'
    ],
    timeHorizon: 40, // Years to retirement
    retirementAge: 65,
    
    // Risk Profile
    riskTolerance: 'aggressive', // Can handle 20%+ volatility
    riskCapacity: 'high', // Long time horizon, stable income
    investmentKnowledge: 'beginner',
    
    // Tax Situation
    taxFilingStatus: 'single',
    stateTaxRate: 0, // Texas - no state tax
    estimatedTaxBracket: 0.22, // Federal marginal
    
    // Special Circumstances
    specialNotes: `
      - Just started first professional job 6 months ago
      - Living with roommates to keep expenses low
      - Student loans in grace period (payments start in 3 months)
      - Company offers HDHP with HSA (not enrolled yet)
      - Interested in house hacking (buying duplex) in 3-5 years
      - Parents established 529 that can roll to Roth if not used
      - Tech industry job with stock options vesting over 4 years
    `,
    
    // Recommended Strategy
    strategy: {
      name: 'Foundation Building & Aggressive Growth',
      
      priorityActions: [
        '1. Get 401k match immediately (free money)',
        '2. Build $10K emergency fund in HYSA',
        '3. Pay off $1,500 credit card debt',
        '4. Enroll in HSA and max it ($4,150)',
        '5. Increase 401k to 15% of salary',
        '6. Start Roth IRA ($7,000/year)'
      ],
      
      assetAllocation: {
        stocks: 0.95,
        bonds: 0,
        cash: 0.05
      },
      
      accountPriority: [
        '401k up to match (instant 100% return)',
        'HSA (triple tax advantage)',
        'Roth IRA (tax-free growth)',
        '401k above match',
        'Taxable brokerage for house fund'
      ],
      
      portfolioRecommendation: {
        tax401k: {
          'VTI (Total Market)': 0.60,
          'VXUS (International)': 0.30,
          'VBK (Small Cap Growth)': 0.10
        },
        rothIRA: {
          'QQQM (Nasdaq Growth)': 0.40,
          'VUG (Large Cap Growth)': 0.30,
          'VWO (Emerging Markets)': 0.20,
          'VBK (Small Cap Growth)': 0.10
        },
        hsa: {
          'VTI (Total Market)': 1.00 // Simple, aggressive
        }
      },
      
      taxStrategies: [
        'Max HSA for triple tax advantage ($4,150)',
        'Roth 401k vs Traditional: Choose Roth (low bracket now)',
        'Harvest tax losses in taxable account',
        'Consider mega backdoor Roth if plan allows'
      ],
      
      expectedReturn: 0.10, // 10% aggressive growth
      expectedAlpha: 0.015, // +1.5% from smart allocation
      
      yearlyProjection: {
        contributions: 13250, // 401k + IRA + HSA
        growth: 2800,
        endingBalance: 31050 // Year 1
      }
    }
  },
  
  mid_life_accumulator: {
    id: 'mid_life_accumulator',
    displayName: 'Mid-Life Accumulator',
    profileName: 'Jason & Maria Chen',
    
    // Demographics
    age: 42,
    maritalStatus: 'married',
    dependents: 2, // Kids ages 8 and 11
    location: 'San Jose, CA',
    
    // Income (Household)
    currentIncome: 180000, // $120K + $60K
    expectedIncomeGrowth: 0.04,
    otherIncome: 5000, // Side consulting
    
    // Assets (Total: $680,000)
    assets: {
      checking: 15000,
      savings: 35000, // Emergency fund
      roth401k: 80000,
      rothIRA: 50000,
      traditional401k: 270000,
      traditionalIRA: 0,
      taxableBrokerage: 150000,
      hsa: 25000,
      realEstate: 50000, // Equity in primary
      collegeTitle: 'Fidelity',
 529: 55000
    },
    
    // Liabilities
    liabilities: {
      studentLoans: 0, // Paid off
      creditCard: 0,
      auto: 18000,
      mortgage: 420000, // $550K home
      other: 0
    },
    
    // Employer Benefits
    employer401kMatch: 0.06,
    employer401kMatchLimit: 0.06,
    employerHSA: 1200,
    
    // Goals
    primaryGoals: [
      'Fund college for 2 kids (in 7-10 years)',
      'Maximize retirement savings',
      'Build taxable account for flexibility',
      'Pay off mortgage before retirement'
    ],
    timeHorizon: 23,
    retirementAge: 65,
    
    // Risk Profile
    riskTolerance: 'moderately-aggressive',
    riskCapacity: 'high',
    investmentKnowledge: 'intermediate',
    
    // Tax Situation
    taxFilingStatus: 'married',
    stateTaxRate: 0.093, // California top bracket
    estimatedTaxBracket: 0.24,
    
    // Special Circumstances
    specialNotes: `
      - Both spouses have 401k plans with excellent fund options
      - Currently maxing both 401ks ($46K combined)
      - Kids ages 8 and 11 - college in 7-10 years
      - Private school costs $25K/year (2 kids = $50K)
      - Wife's company offers mega backdoor Roth ($46K post-tax)
      - Just refinanced mortgage to 2.75% (don't rush to pay off)
      - Considering rental property purchase
      - Parents in good health, may need to help with care eventually
      - Stock compensation (RSUs) vest quarterly (~$25K/year)
      - Want to retire early at 60 if possible
    `,
    
    // Recommended Strategy
    strategy: {
      name: 'Wealth Acceleration & Tax Optimization',
      
      priorityActions: [
        '1. Execute mega backdoor Roth ($46K to Roth)',
        '2. Max both 401ks ($23K × 2 = $46K)',
        '3. Backdoor Roth IRAs ($7K × 2 = $14K)',
        '4. Max HSA ($8,300 family)',
        '5. Increase 529 to $20K/year',
        '6. RSU tax planning (sell on vest or hold?)'
      ],
      
      assetAllocation: {
        stocks: 0.85,
        bonds: 0.10,
        alternatives: 0.05
      },
      
      accountPriority: [
        '401k to max ($46K)',
        'Mega backdoor Roth ($46K)',
        'HSA to max ($8,300)',
        'Backdoor Roth IRAs ($14K)',
        '529 contributions ($20K)',
        'Taxable brokerage (RSUs + extra)'
      ],
      
      portfolioRecommendation: {
        traditional401k: {
          'VTI (Total Market)': 0.40,
          'VXUS (International)': 0.25,
          'VUG (Growth)': 0.20,
          'VBR (Small Value)': 0.10,
          'BND (Bonds)': 0.05
        },
        rothIRA: {
          'QQQ (Nasdaq)': 0.30,
          'VUG (Growth)': 0.25,
          'VWO (Emerging)': 0.20,
          'VNQ (REITs)': 0.15, // Tax-inefficient, perfect for Roth
          'MTUM (Momentum)': 0.10
        },
        taxable: {
          'VTI (Total Market)': 0.50, // Tax-efficient
          'VIG (Dividend Growth)': 0.25, // Qualified dividends
          'VXUS (International)': 0.15, // Foreign tax credit
          'BND (Bonds)': 0.10 // For rebalancing
        },
        fivetwonine: {
          'Age-based target fund': 1.00 // 2030 & 2033 funds
        }
      },
      
      taxStrategies: [
        'Mega backdoor Roth: $46K post-tax → Roth ($12K tax savings)',
        'Backdoor Roth: $14K for both spouses',
        'Donate appreciated stock (avoid capital gains + deduction)',
        'Tax-loss harvest in taxable quarterly',
        '529 state tax deduction (up to $10K in CA)',
        'Hold RSUs <1 year for ordinary income, >1 year for cap gains',
        'Consider oil & gas partnerships for passive losses (advanced)'
      ],
      
      expectedReturn: 0.09,
      expectedAlpha: 0.025, // +2.5% from sophisticated strategies
      
      tenYearProjection: {
        endingBalance: 1850000, // Excludes 529 and home equity
        collegeFunding: 210000, // 529 grows to this
        rothBalance: 520000, // Mega backdoor magic
        taxSaved: 180000 // vs. not optimizing
      }
    }
  },
  
  pre_retirement: {
    id: 'pre_retirement',
    displayName: 'Pre-Retirement',
    profileName: 'Sarah Martinez',
    
    // Demographics
    age: 58,
    maritalStatus: 'married',
    dependents: 0, // Empty nest
    location: 'Denver, CO',
    
    // Income
    currentIncome: 250000, // Peak earnings
    expectedIncomeGrowth: 0.02, // Slower growth near end
    otherIncome: 15000, // Rental property
    
    // Assets (Total: $2.1M)
    assets: {
      checking: 25000,
      savings: 75000, // Large emergency fund
      roth401k: 150000,
      rothIRA: 200000,
      traditional401k: 1050000,
      traditionalIRA: 0,
      taxableBrokerage: 400000,
      hsa: 45000,
      realEstate: 200000, // Rental + primary equity
      other: 0
    },
    
    // Liabilities
    liabilities: {
      studentLoans: 0,
      creditCard: 0,
      auto: 0,
      mortgage: 0, // Paid off!
      other: 0
    },
    
    // Employer Benefits
    employer401kMatch: 0.06,
    employer401kMatchLimit: 0.06,
    employerHSA: 0, // PPO now (no HSA)
    
    // Goals
    primaryGoals: [
      'Maximize final 7 years of contributions',
      'Begin Roth conversion planning',
      'Shift gradually toward income',
      'Retire at 65 with $150K/year income'
    ],
    timeHorizon: 7, // To retirement
    retirementAge: 65,
    
    // Risk Profile
    riskTolerance: 'moderate',
    riskCapacity: 'moderate', // Shorter horizon
    investmentKnowledge: 'advanced',
    
    // Tax Situation
    taxFilingStatus: 'married',
    stateTaxRate: 0.0463, // Colorado
    estimatedTaxBracket: 0.32, // High earner
    
    // Special Circumstances
    specialNotes: `
      - Husband retired early at 55 (pension $40K/year)
      - Planning to work until exactly 65 for health insurance
      - No mortgage (paid off in 2022)
      - Rental property cash flows $15K/year, will sell before retirement
      - Both in excellent health, parents lived to 95+
      - Want to travel extensively in first 10 years of retirement
      - Considering partial Roth conversions before Medicare/IRMAA
      - Have 3 adult children (financially independent)
      - Estate planning: Want to leave $1M+ to kids, rest to charity
      - Husband's pension provides floor income
      - Social Security at 70 for maximum benefit ($55K/year)
    `,
    
    // Recommended Strategy
    strategy: {
      name: 'Pre-Retirement Optimization & Transition',
      
      priorityActions: [
        '1. Max 401k + catch-up ($30,500)',
        '2. Max Roth IRA for both ($8,000 each)',
        '3. Begin small Roth conversions ($50K/year)',
        '4. Shift 30% of portfolio to income focus',
        '5. Create retirement income plan',
        '6. Update estate planning documents'
      ],
      
      assetAllocation: {
        stocks: 0.70, // Starting to de-risk
        bonds: 0.25,
        alternatives: 0.05
      },
      
      accountPriority: [
        '401k max with catch-up ($30,500)',
        'Backdoor Roth IRAs ($16,000 both)',
        'Small Roth conversions ($50K/year)',
        'Taxable account (bridge to Medicare)'
      ],
      
      portfolioRecommendation: {
        traditional401k: {
          'VTI (Total Market)': 0.35,
          'VUG (Growth)': 0.20,
          'VXUS (International)': 0.20,
          'BND (Bonds)': 0.20,
          'VNQ (REITs)': 0.05
        },
        rothIRA: {
          'VUG (Growth)': 0.30, // Most growth in Roth
          'SCHG (Large Growth)': 0.25,
          'VWO (Emerging)': 0.20,
          'VNQ (REITs)': 0.15,
          'QQQM (Nasdaq)': 0.10
        },
        taxable: {
          'VIG (Dividend Growth)': 0.30, // Building income
          'SCHD (High Dividend)': 0.25,
          'VYM (High Yield)': 0.15,
          'VOO (Core)': 0.20,
          'BND (Bonds)': 0.10
        }
      },
      
      rothConversionPlan: {
        years58to62: 50000, // Small conversions while working
        years63to64: 100000, // Bigger after retiring, before Medicare
        years65to73: 150000, // Max before RMDs
        totalConverted: 1400000, // Aggressiveplan
        totalTax: 320000,
        netBenefit: 450000 // vs. not converting
      },
      
      taxStrategies: [
        'Continue maxing all accounts (total $46K+/year)',
        'Small Roth conversions to fill 24% bracket ($50K)',
        'At 59.5: Access 401k penalty-free for early retirement',
        'At 63: Retire, do large Roth conversions before 65',
        'At 65: Medicare begins, watch IRMAA thresholds',
        'At 65-72: Maximize Roth conversions before RMDs',
        'At 70: Delay Social Security for 24% more income',
        'Qualified charitable distributions at 70.5 if charitable'
      ],
      
      expectedReturn: 0.075,
      expectedAlpha: 0.02,
      
      retirementIncomePlan: {
        age65to70: {
          rothWithdrawals: 60000,
          taxableIncome: 45000,
          pensionIncome: 40000,
          totalIncome: 145000,
          taxes: 18000,
          netIncome: 127000
        },
        age70plus: {
          socialSecurity: 55000,
          rothWithdrawals: 40000,
          taxableIncome: 30000,
          pensionIncome: 40000,
          rmdIncome: 45000,
          totalIncome: 210000,
          taxes: 42000,
          netIncome: 168000
        }
      }
    }
  },
  
  in_retirement: {
    id: 'in_retirement',
    displayName: 'In Retirement',
    profileName: 'Deb Wilson',
    
    // Demographics
    age: 60,
    maritalStatus: 'single',
    dependents: 0,
    location: 'Waxhaw, NC', // Moving to Texas
    
    // Income
    currentIncome: 25000, // Interest & dividends
    expectedIncomeGrowth: 0,
    otherIncome: 0,
    
    // Assets (Total: $12.6M)
    assets: {
      checking: 50000,
      savings: 100000,
      roth401k: 0,
      rothIRA: 0, // Will build through conversions
      traditional401k: 0,
      traditionalIRA: 4100000,
      taxableBrokerage: 8500000,
      hsa: 0,
      realEstate: 0, // No primary (will buy)
      other: 0
    },
    
    // Liabilities
    liabilities: {
      studentLoans: 0,
      creditCard: 0,
      auto: 0,
      mortgage: 0,
      other: 0
    },
    
    // Employer Benefits
    employer401kMatch: 0,
    employer401kMatchLimit: 0,
    employerHSA: 0,
    
    // Goals
    primaryGoals: [
      'Generate $150K/year income',
      'Execute Roth conversion strategy',
      'Minimize lifetime taxes',
      'Leave tax-efficient estate to heirs'
    ],
    timeHorizon: 30, // Life expectancy
    retirementAge: 60, // Already retired
    
    // Risk Profile
    riskTolerance: 'moderate',
    riskCapacity: 'high', // Large portfolio
    investmentKnowledge: 'expert',
    
    // Tax Situation
    taxFilingStatus: 'single',
    stateTaxRate: 0, // Texas (will move)
    estimatedTaxBracket: 0.24, // During conversions
    
    // Special Circumstances
    specialNotes: `
      - Recently retired at 59 from tech career (500+ stock positions)
      - Transitioning from individual stocks to ETF strategy
      - Moving from North Carolina to Texas (0% state tax)
      - No children, estate going to nieces/nephews + charity
      - Excellent health, family history of longevity (95+)
      - Interested in front-loading Roth conversions (lock in low rates)
      - Has 500+ individual stock positions to liquidate strategically
      - Wants to generate income WITHOUT touching principal
      - Medicare enrollment at 65 (need IRMAA planning)
      - Considering purchasing home in Austin area ($800K)
    `,
    
    // Recommended Strategy
    strategy: {
      name: 'Tax-Optimized Income & Wealth Transfer',
      
      priorityActions: [
        '1. Front-load Roth conversions ($475K/year × 3)',
        '2. Transition stocks → dividend ETFs (taxable)',
        '3. Transition stocks → growth ETFs (IRA)',
        '4. Build tax-efficient income stream',
        '5. Establish estate plan',
        '6. Move to Texas (save state taxes)'
      ],
      
      assetAllocation: {
        taxable: { stocks: 0.60, bonds: 0.05, alternatives: 0.05 },
        ira: { stocks: 0.85, bonds: 0.15 }
      },
      
      portfolioRecommendation: {
        taxable: {
          'SCHD (High Dividend)': 0.25, // 3.8% yield
          'VIG (Dividend Growth)': 0.15, // 1.7% yield
          'VYM (High Yield)': 0.10, // 2.4% yield
          'VOO (Core S&P 500)': 0.20, // Growth + some income
          'VTV (Value)': 0.08,
          'VEA (International)': 0.12, // 3.2% yield
          'BND (Bonds)': 0.05,
          'GLD (Gold)': 0.05
        },
        traditionalIRA: {
          'VUG (Growth)': 0.20, // Aggressive growth
          'QUAL (Quality)': 0.15,
          'VWO (Emerging)': 0.12,
          'EEM (Emerging)': 0.05,
          'VNQ (REITs)': 0.15, // MUST be in IRA (tax-inefficient)
          'SCHG (Large Growth)': 0.08,
          'MTUM (Momentum)': 0.08,
          'VBK (Small Growth)': 0.07,
          'BND (Bonds)': 0.05,
          'GSG (Commodities)': 0.05
        }
      },
      
      rothConversionPlan: {
        strategy: 'Front-Loading',
        years60to62: 475000, // Aggressive, push into 32%
        years63to65: 350000,
        years66to69: 250000,
        years70to73: 200000,
        totalConverted: 4100000, // All IRA → Roth
        federalTax: 688000,
        taxOnTax: 52000,
        irmaa: 58000,
        totalCost: 798000,
        netBenefit: 640000, // vs. paying taxes later
        rothBalance2056: 9500000 // At age 90, tax-free!
      },
      
      incomePlan: {
        dividends: 211000, // From taxable
        qualifiedPct: 0.91,
        dividendTax: 33000,
        netDividendIncome: 178000,
        livingExpenses: 150000,
        surplus: 28000, // Reinvest or spend on extras
        
        age73plus: {
          dividends: 211000,
          rmd: 158000, // 3.77% of $4.2M IRA
          totalIncome: 369000,
          taxes: 88000,
          netIncome: 281000,
          livingExpenses: 184000, // Inflation adjusted
          surplus: 97000 // Strong surplus!
        }
      },
      
      taxStrategies: [
        'Front-load Roth: $475K/year × 3 (lock in 24-32% rates)',
        'Texas residency: Save $50K+/year vs. CA',
        'Qualified dividends: 91% at 15% (vs. ordinary income)',
        'Asset location: REITs in IRA (save $6K/year)',
        'Tax-on-tax: Sell stocks strategically to minimize cap gains',
        'IRMAA management: Conversions done by 73, reduces IRMAA',
        'Estate: Roth worth 40% more to heirs (tax-free)',
        'QCDs at 70.5: Direct IRA to charity (tax-free)'
      ],
      
      expectedReturn: 0.09, // 9% portfolio-wide
      expectedAlpha: 0.031, // +3.1% from factors + tax optimization
      
      lifetimeProjection: {
        age60: 12600000,
        age70: 18300000,
        age80: 24800000,
        age90: 28500000, // Despite $2.4M taxes + $4.5M spending
        rothAt90: 9500000, // Tax-free!
        totalTaxesPaid: 2400000,
        totalSpent: 4500000,
        netGrowth: 15900000 // 126% growth!
      }
    }
  }
};

// Helper function to get persona by ID
export const getPersona = (id) => CLIENT_PERSONAS[id];

// Helper function to detect persona based on age and assets
export const detectPersona = (age, totalAssets) => {
  if (age < 35 && totalAssets < 100000) return 'young_starter';
  if (age >= 35 && age < 55 && totalAssets < 2000000) return 'mid_life_accumulator';
  if (age >= 55 && age < 65 && totalAssets < 5000000) return 'pre_retirement';
  if (age >= 60 || totalAssets >= 5000000) return 'in_retirement';
  
  // Default to mid-life if unclear
  return 'mid_life_accumulator';
};

// Life stage descriptions
export const LIFE_STAGE_INFO = {
  young_starter: {
    title: 'Young Starter (25-34)',
    description: 'Building financial foundation, aggressive growth',
    keyFocus: ['Emergency fund', '401k match', 'Roth IRA', 'Debt payoff'],
    typicalAssets: '$15K-$100K',
    riskProfile: 'Aggressive (95%+ stocks)'
  },
  mid_life_accumulator: {
    title: 'Mid-Life Accumulator (35-54)',
    description: 'Peak earning years, wealth building',
    keyFocus: ['Max retirement accounts', 'Tax optimization', 'College funding', 'Real estate'],
    typicalAssets: '$100K-$2M',
    riskProfile: 'Moderately Aggressive (80-90% stocks)'
  },
  pre_retirement: {
    title: 'Pre-Retirement (55-64)',
    description: 'Final wealth accumulation, transition planning',
    keyFocus: ['Max contributions', 'Roth conversions', 'Income planning', 'De-risking'],
    typicalAssets: '$1M-$5M',
    riskProfile: 'Moderate (70-80% stocks)'
  },
  in_retirement: {
    title: 'In Retirement (65+)',
    description: 'Income generation, tax efficiency, legacy',
    keyFocus: ['Tax-efficient income', 'RMD management', 'IRMAA planning', 'Estate planning'],
    typicalAssets: '$2M+',
    riskProfile: 'Moderate (60-85% stocks depending on wealth)'
  }
};
