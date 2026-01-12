import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ScatterChart, Scatter } from 'recharts';
import ClientQuestionnaire from './ClientQuestionnaire';
import { CLIENT_PERSONAS } from './client-personas';
import { generateRecommendations } from './recommendation-engine';
import calculateProductionIncomeProjection from './production-income-calculator';
import { ETF_UNIVERSE } from './data';


const PortfolioStrategyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [marketRegime, setMarketRegime] = useState('uncertainty'); // Combined regime
  const [riskTolerance, setRiskTolerance] = useState('moderate');
  const [conversionAmount, setConversionAmount] = useState(250000);
  const [rebalanceFrequency, setRebalanceFrequency] = useState('quarterly');
  const [continueAfterRMD, setContinueAfterRMD] = useState(false);
  const [capitalGainsRate, setCapitalGainsRate] = useState(15);
  const [frontLoadConversions, setFrontLoadConversions] = useState(false);
  const [stateTaxRate, setStateTaxRate] = useState(5); // State income tax rate
  const [useConservativeEstimates, setUseConservativeEstimates] = useState(true); // 20% buffer for safety
  const [expectedGrowthRate, setExpectedGrowthRate] = useState(9); // 85% equities growth-focused = 9% realistic
  
  // Personas state
  const [clientRecommendations, setClientRecommendations] = useState(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(true);
  
  // Portfolio parameters
  const [taxableAmount, setTaxableAmount] = useState(8500000);
  const [iraAmount, setIraAmount] = useState(4100000);

  // MARKET REGIME DEFINITIONS (Comprehensive)
  // Each regime combines: Trend + Volatility + Inflation + Risk Sentiment
  const regimeDefinitions = {
    goldilocks: {
      name: 'Goldilocks',
      description: 'Bull market + Low volatility + Low inflation + Risk-on',
      trend: 'Up',
      volatility: 'Low (VIX <15)',
      inflation: 'Low (<2.5%)',
      sentiment: 'Risk-On',
      indicators: 'S&P up 15%+, VIX <15, CPI <2.5%, credit spreads tight',
      color: 'green'
    },
    boom: {
      name: 'Boom (Heating Up)',
      description: 'Bull market + Rising volatility + Rising inflation + Risk-on',
      trend: 'Up',
      volatility: 'Rising (VIX 15-25)',
      inflation: 'Rising (2.5-4%)',
      sentiment: 'Risk-On (cautious)',
      indicators: 'S&P up 10-20%, VIX 15-25, CPI rising, Fed tightening talk',
      color: 'yellow'
    },
    uncertainty: {
      name: 'Uncertainty',
      description: 'Sideways market + High volatility + Sticky inflation + Mixed sentiment',
      trend: 'Sideways',
      volatility: 'High (VIX 20-30)',
      inflation: 'Sticky (3-4%)',
      sentiment: 'Mixed/Uncertain',
      indicators: 'S&P ±5%, VIX &gt;20, CPI stubborn, Fed policy unclear',
      color: 'orange'
    },
    grind: {
      name: 'Sideways Grind',
      description: 'Range-bound + Low volatility + Stable inflation + Neutral',
      trend: 'Sideways',
      volatility: 'Low (VIX <18)',
      inflation: 'Stable (2-3%)',
      sentiment: 'Neutral',
      indicators: 'S&P range-bound, VIX <18, CPI stable, low volume',
      color: 'blue'
    },
    crisis: {
      name: 'Crisis',
      description: 'Bear market + High volatility + Risk-off + Flight to safety',
      trend: 'Down',
      volatility: 'High (VIX &gt;30)',
      inflation: 'Variable',
      sentiment: 'Risk-Off',
      indicators: 'S&P down &gt;10%, VIX &gt;30, credit spreads widening, recession fears',
      color: 'red'
    }
  };
  
  // Color schemes
  const COLORS = {
    core: '#2563eb',
    quality: '#7c3aed',
    value: '#059669',
    lowVol: '#0891b2',
    momentum: '#dc2626',
    bonds: '#f59e0b',
    gold: '#eab308',
    international: '#8b5cf6',
    alternatives: '#ec4899'
  };

  // Portfolio allocations by regime (now comprehensive regimes)
  const allocations = {
    goldilocks: {
      'Core Holdings': 0.50,
      'Quality': 0.05,
      'Value': 0.05,
      'Low Volatility': 0.03,
      'Momentum': 0.12,
      'Small Cap': 0.05,
      'Bonds': 0.08,
      'Gold': 0.02,
      'International': 0.18,
      'Alternatives': 0.10
    },
    boom: {
      'Core Holdings': 0.40,
      'Quality': 0.08,
      'Value': 0.07,
      'Low Volatility': 0.05,
      'Momentum': 0.08,
      'Small Cap': 0.04,
      'Bonds': 0.12,
      'Gold': 0.05,
      'International': 0.18,
      'Alternatives': 0.10
    },
    uncertainty: {
      'Core Holdings': 0.35,
      'Quality': 0.10,
      'Value': 0.08,
      'Low Volatility': 0.07,
      'Momentum': 0.03,
      'Small Cap': 0.02,
      'Bonds': 0.15,
      'Gold': 0.07,
      'International': 0.20,
      'Alternatives': 0.10
    },
    grind: {
      'Core Holdings': 0.38,
      'Quality': 0.09,
      'Value': 0.10,
      'Low Volatility': 0.06,
      'Momentum': 0.05,
      'Small Cap': 0.03,
      'Bonds': 0.12,
      'Gold': 0.04,
      'International': 0.18,
      'Alternatives': 0.10
    },
    crisis: {
      'Core Holdings': 0.30,
      'Quality': 0.15,
      'Value': 0.12,
      'Low Volatility': 0.13,
      'Momentum': 0.00,
      'Small Cap': 0.00,
      'Bonds': 0.30,
      'Gold': 0.10,
      'International': 0.20,
      'Alternatives': 0.05
    }
  };

  // TAXABLE ACCOUNT ALLOCATION (Income-focused, tax-efficient)
  // Remains relatively stable across regimes - focused on income generation
  const taxableAllocations = {
    goldilocks: {
      'SCHD (High Dividend)': { allocation: 0.25, yield: 3.8, taxStatus: 'qualified' },
      'VIG (Dividend Growth)': { allocation: 0.15, yield: 1.7, taxStatus: 'qualified' },
      'VYM (High Dividend)': { allocation: 0.10, yield: 2.4, taxStatus: 'qualified' },
      'VOO (Core S&P 500)': { allocation: 0.25, yield: 1.3, taxStatus: 'qualified' },
      'VTV (Value)': { allocation: 0.05, yield: 2.3, taxStatus: 'qualified' },
      'VEA (International)': { allocation: 0.12, yield: 3.2, taxStatus: 'qualified' },
      'BND (Bonds)': { allocation: 0.03, yield: 4.2, taxStatus: 'ordinary' },
      'GLD (Gold)': { allocation: 0.05, yield: 0, taxStatus: 'capital gains only' }
    },
    boom: {
      'SCHD (High Dividend)': { allocation: 0.25, yield: 3.8, taxStatus: 'qualified' },
      'VIG (Dividend Growth)': { allocation: 0.15, yield: 1.7, taxStatus: 'qualified' },
      'VYM (High Dividend)': { allocation: 0.10, yield: 2.4, taxStatus: 'qualified' },
      'VOO (Core S&P 500)': { allocation: 0.22, yield: 1.3, taxStatus: 'qualified' },
      'VTV (Value)': { allocation: 0.06, yield: 2.3, taxStatus: 'qualified' },
      'VEA (International)': { allocation: 0.12, yield: 3.2, taxStatus: 'qualified' },
      'BND (Bonds)': { allocation: 0.05, yield: 4.2, taxStatus: 'ordinary' },
      'GLD (Gold)': { allocation: 0.05, yield: 0, taxStatus: 'capital gains only' }
    },
    uncertainty: {
      'SCHD (High Dividend)': { allocation: 0.25, yield: 3.8, taxStatus: 'qualified' },
      'VIG (Dividend Growth)': { allocation: 0.15, yield: 1.7, taxStatus: 'qualified' },
      'VYM (High Dividend)': { allocation: 0.10, yield: 2.4, taxStatus: 'qualified' },
      'VOO (Core S&P 500)': { allocation: 0.20, yield: 1.3, taxStatus: 'qualified' },
      'VTV (Value)': { allocation: 0.08, yield: 2.3, taxStatus: 'qualified' },
      'VEA (International)': { allocation: 0.12, yield: 3.2, taxStatus: 'qualified' },
      'BND (Bonds)': { allocation: 0.05, yield: 4.2, taxStatus: 'ordinary' },
      'GLD (Gold)': { allocation: 0.05, yield: 0, taxStatus: 'capital gains only' }
    },
    grind: {
      'SCHD (High Dividend)': { allocation: 0.25, yield: 3.8, taxStatus: 'qualified' },
      'VIG (Dividend Growth)': { allocation: 0.15, yield: 1.7, taxStatus: 'qualified' },
      'VYM (High Dividend)': { allocation: 0.10, yield: 2.4, taxStatus: 'qualified' },
      'VOO (Core S&P 500)': { allocation: 0.22, yield: 1.3, taxStatus: 'qualified' },
      'VTV (Value)': { allocation: 0.08, yield: 2.3, taxStatus: 'qualified' },
      'VEA (International)': { allocation: 0.12, yield: 3.2, taxStatus: 'qualified' },
      'BND (Bonds)': { allocation: 0.04, yield: 4.2, taxStatus: 'ordinary' },
      'GLD (Gold)': { allocation: 0.04, yield: 0, taxStatus: 'capital gains only' }
    },
    crisis: {
      'SCHD (High Dividend)': { allocation: 0.25, yield: 3.8, taxStatus: 'qualified' },
      'VIG (Dividend Growth)': { allocation: 0.15, yield: 1.7, taxStatus: 'qualified' },
      'VYM (High Dividend)': { allocation: 0.10, yield: 2.4, taxStatus: 'qualified' },
      'VOO (Core S&P 500)': { allocation: 0.15, yield: 1.3, taxStatus: 'qualified' },
      'VTV (Value)': { allocation: 0.10, yield: 2.3, taxStatus: 'qualified' },
      'VEA (International)': { allocation: 0.10, yield: 3.2, taxStatus: 'qualified' },
      'BND (Bonds)': { allocation: 0.10, yield: 4.2, taxStatus: 'ordinary' },
      'GLD (Gold)': { allocation: 0.05, yield: 0, taxStatus: 'capital gains only' }
    }
  };

  // IRA ACCOUNT ALLOCATION (Tax-inefficient assets, GROWTH-FOCUSED)
  const iraAllocations = {
    goldilocks: {
      'VUG (Growth)': { allocation: 0.25, yield: 0.6, note: 'High growth, low yield - perfect for IRA' },
      'MTUM (Momentum)': { allocation: 0.15, yield: 0.8, note: 'High turnover = tax-inefficient = IRA' },
      'VBK (Small Cap Growth)': { allocation: 0.10, yield: 0.8, note: 'Highest growth potential' },
      'VWO (Emerging Markets)': { allocation: 0.10, yield: 3.5, note: 'High growth, foreign taxes' },
      'EEM (Emerging Markets)': { allocation: 0.05, yield: 2.8, note: 'Diversify EM exposure' },
      'VNQ (REITs)': { allocation: 0.15, yield: 4.2, note: 'MUST be in IRA - ordinary income' },
      'QQQM (Nasdaq)': { allocation: 0.10, yield: 0.5, note: 'Tech growth' },
      'BND (Bonds)': { allocation: 0.05, yield: 4.2, note: 'Minimal - just for rebalancing' },
      'GSG (Commodities)': { allocation: 0.05, yield: 0, note: 'Diversification' }
    },
    boom: {
      'VUG (Growth)': { allocation: 0.22, yield: 0.6, note: 'Growth but cautious' },
      'QUAL (Quality Growth)': { allocation: 0.13, yield: 1.5, note: 'Quality + growth combo' },
      'MTUM (Momentum)': { allocation: 0.10, yield: 0.8, note: 'Reduced - volatility rising' },
      'VBK (Small Cap Growth)': { allocation: 0.08, yield: 0.8, note: 'Some growth exposure' },
      'VWO (Emerging Markets)': { allocation: 0.10, yield: 3.5, note: 'EM often perform well' },
      'EEM (Emerging Markets)': { allocation: 0.05, yield: 2.8, note: 'Diversify EM' },
      'VNQ (REITs)': { allocation: 0.15, yield: 4.2, note: 'MUST be in IRA' },
      'SCHG (Large Cap Growth)': { allocation: 0.07, yield: 0.7, note: 'Quality growth' },
      'BND (Bonds)': { allocation: 0.05, yield: 4.2, note: 'Minimal defensive' },
      'GSG (Commodities)': { allocation: 0.05, yield: 0, note: 'Inflation hedge' }
    },
    uncertainty: {
      'VUG (Growth)': { allocation: 0.20, yield: 0.6, note: 'Still growth-focused' },
      'QUAL (Quality Growth)': { allocation: 0.15, yield: 1.5, note: 'Quality + growth combo' },
      'MTUM (Momentum)': { allocation: 0.08, yield: 0.8, note: 'Reduced in choppy markets' },
      'VBK (Small Cap Growth)': { allocation: 0.07, yield: 0.8, note: 'Some growth exposure' },
      'VWO (Emerging Markets)': { allocation: 0.12, yield: 3.5, note: 'EM often outperform in sideways US' },
      'EEM (Emerging Markets)': { allocation: 0.05, yield: 2.8, note: 'Diversify EM' },
      'VNQ (REITs)': { allocation: 0.15, yield: 4.2, note: 'MUST be in IRA' },
      'SCHG (Large Cap Growth)': { allocation: 0.08, yield: 0.7, note: 'Quality growth' },
      'BND (Bonds)': { allocation: 0.05, yield: 4.2, note: 'Minimal defensive' },
      'GSG (Commodities)': { allocation: 0.05, yield: 0, note: 'Inflation hedge' }
    },
    grind: {
      'VUG (Growth)': { allocation: 0.23, yield: 0.6, note: 'Growth focus maintained' },
      'QUAL (Quality Growth)': { allocation: 0.12, yield: 1.5, note: 'Quality matters' },
      'MTUM (Momentum)': { allocation: 0.07, yield: 0.8, note: 'Low vol = some momentum OK' },
      'VBK (Small Cap Growth)': { allocation: 0.08, yield: 0.8, note: 'Growth tilt' },
      'VWO (Emerging Markets)': { allocation: 0.12, yield: 3.5, note: 'Diversification' },
      'EEM (Emerging Markets)': { allocation: 0.05, yield: 2.8, note: 'EM exposure' },
      'VNQ (REITs)': { allocation: 0.15, yield: 4.2, note: 'MUST be in IRA' },
      'SCHG (Large Cap Growth)': { allocation: 0.08, yield: 0.7, note: 'Steady growth' },
      'BND (Bonds)': { allocation: 0.05, yield: 4.2, note: 'Minimal bonds' },
      'GSG (Commodities)': { allocation: 0.05, yield: 0, note: 'Diversifier' }
    },
    crisis: {
      'VUG (Growth)': { allocation: 0.15, yield: 0.6, note: 'Reduce but maintain growth' },
      'QUAL (Quality)': { allocation: 0.20, yield: 1.5, note: 'Quality defensive' },
      'USMV (Low Volatility)': { allocation: 0.10, yield: 1.8, note: 'Bear market protection' },
      'MTUM (Momentum)': { allocation: 0.00, yield: 0.8, note: 'ELIMINATE in crisis' },
      'VBK (Small Cap Growth)': { allocation: 0.03, yield: 0.8, note: 'Minimal exposure' },
      'VWO (Emerging Markets)': { allocation: 0.08, yield: 3.5, note: 'Reduced EM' },
      'VNQ (REITs)': { allocation: 0.15, yield: 4.2, note: 'Defensive income' },
      'BND (Bonds)': { allocation: 0.15, yield: 4.2, note: 'Increased safety' },
      'VTIP (TIPS)': { allocation: 0.05, yield: 4.5, note: 'Inflation protection' },
      'GLD (Gold)': { allocation: 0.05, yield: 0, note: 'Crisis hedge' },
      'GSG (Commodities)': { allocation: 0.04, yield: 0, note: 'Diversification' }
    }
  };

  // Factor performance by regime
  const factorPerformance = {
    goldilocks: {
      'Value': 9.5,
      'Quality': 11.2,
      'Momentum': 16.8,
      'Low Volatility': 8.3,
      'Size': 11.5,
      'Growth': 17.2
    },
    boom: {
      'Value': 10.2,
      'Quality': 12.5,
      'Momentum': 11.1,
      'Low Volatility': 7.9,
      'Size': 8.8,
      'Growth': 13.4
    },
    uncertainty: {
      'Value': 9.2,
      'Quality': 11.5,
      'Momentum': 3.1,
      'Low Volatility': 8.9,
      'Size': 6.8,
      'Growth': 7.4
    },
    grind: {
      'Value': 10.8,
      'Quality': 10.5,
      'Momentum': 6.5,
      'Low Volatility': 9.2,
      'Size': 7.5,
      'Growth': 8.1
    },
    crisis: {
      'Value': 2.3,
      'Quality': 1.2,
      'Momentum': -12.5,
      'Low Volatility': -3.8,
      'Size': -8.2,
      'Growth': -15.3
    }
  };

  // ETF Details - Dynamic from ETF_UNIVERSE
  const etfDetails = useMemo(() => {
    return Object.values(ETF_UNIVERSE).map(etf => ({
      ticker: etf.symbol,
      name: etf.name,
      category: etf.category,
      yield: etf.yield || 0,
      expense: etf.expense,
      taxStatus: etf.taxEfficiency
    }));
  }, []);

  // Alpha sources calculation
  const calculateAlpha = () => {
    const regime = marketRegime;
    
    // Base return expectations by regime
    const baseReturns = {
      goldilocks: 14,
      boom: 11,
      uncertainty: 7,
      grind: 8,
      crisis: -5
    };
    const baseReturn = baseReturns[regime] || 7;
    
    // Factor tilt alpha by regime
    const factorAlphas = {
      goldilocks: 0.5,
      boom: 0.8,
      uncertainty: 1.2,
      grind: 1.0,
      crisis: 2.5
    };
    const factorAlpha = factorAlphas[regime] || 1.0;
    
    // Tactical allocation alpha by regime
    const tacticalAlphas = {
      goldilocks: 0.3,
      boom: 0.5,
      uncertainty: 0.7,
      grind: 0.4,
      crisis: 1.5
    };
    const tacticalAlpha = tacticalAlphas[regime] || 0.5;
    
    // Tax efficiency alpha (constant)
    const taxAlpha = 0.8;
    
    // Rebalancing alpha
    const rebalanceAlpha = rebalanceFrequency === 'quarterly' ? 0.4 : 
                          rebalanceFrequency === 'annual' ? 0.3 : 0.1;
    
    return {
      baseReturn,
      factorAlpha,
      tacticalAlpha,
      taxAlpha,
      rebalanceAlpha,
      totalAlpha: factorAlpha + tacticalAlpha + taxAlpha + rebalanceAlpha,
      totalReturn: baseReturn + factorAlpha + tacticalAlpha + taxAlpha + rebalanceAlpha
    };
  };

  // Roth conversion timeline
  const rothTimeline = useMemo(() => {
    const timeline = [];
    let remainingIRA = iraAmount;
    const annualReturn = 0.06;
    const yearsToConvert = continueAfterRMD ? 20 : 14;
    
    // 2026 Federal Tax Brackets (Single Filer)
    const calculateFederalTax = (taxableIncome) => {
      const brackets = [
        { limit: 11600, rate: 0.10 },
        { limit: 47150, rate: 0.12 },
        { limit: 100525, rate: 0.22 },
        { limit: 191950, rate: 0.24 },
        { limit: 243725, rate: 0.32 },
        { limit: 609350, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ];
      
      let tax = 0;
      let previousLimit = 0;
      
      for (const bracket of brackets) {
        if (taxableIncome > previousLimit) {
          const taxableInBracket = Math.min(taxableIncome - previousLimit, bracket.limit - previousLimit);
          tax += taxableInBracket * bracket.rate;
          previousLimit = bracket.limit;
        }
        if (taxableIncome <= bracket.limit) break;
      }
      
      return tax;
    };
    
    for (let year = 0; year < yearsToConvert; year++) {
      const age = 60 + year;
      const isPostRMD = age >= 73;
      
      // RMD amount if age 73+ (SECURE Act 2.0 - 2022 updated table)
      const rmdRate = age >= 73 ? (age === 73 ? 0.0377 : age === 74 ? 0.0392 : age === 75 ? 0.0407 : age === 76 ? 0.0422 : age === 77 ? 0.0437 : age === 78 ? 0.0453 : age === 79 ? 0.0470 : age === 80 ? 0.0495 : 0.055) : 0;
      const rmdAmount = isPostRMD ? remainingIRA * rmdRate : 0;
      
      // Determine conversion amount based on strategy
      let conversion;
      
      if (frontLoadConversions && !isPostRMD) {
        // FRONT-LOADING STRATEGY
        if (year <= 2) {
          conversion = 475000; // Years 1-3: Aggressive
        } else if (year <= 5) {
          conversion = 350000; // Years 4-6: Still aggressive
        } else if (year <= 9) {
          conversion = 250000; // Years 7-10: Standard
        } else if (year <= 13) {
          conversion = 200000; // Years 11-14: Taper
        } else {
          conversion = 150000; // Post-73: Minimal
        }
      } else {
        // STEADY STRATEGY
        conversion = year === 12 && !continueAfterRMD ? 300000 : 
                    year === 13 && !continueAfterRMD ? Math.min(remainingIRA, 950000) : 
                    conversionAmount;
      }
      
      // Reduce conversion if we have RMD
      if (isPostRMD) {
        conversion = Math.min(conversion, 200000);
      }
      
      conversion = Math.min(conversion, remainingIRA);
      
      // Calculate federal tax using PROPER marginal brackets
      const standardDeduction = age >= 65 ? 16550 : 14600; // 2026 estimates
      const otherIncome = 25000; // Estimated ordinary income: bond interest (~$18K) + bank interest (~$5K)
      // NOTE: Qualified dividends ($193K) are taxed SEPARATELY at 15% and don't add to ordinary income brackets
      const totalIncome = conversion + rmdAmount + otherIncome;
      const taxableIncome = Math.max(0, totalIncome - standardDeduction);
      
      const federalTax = calculateFederalTax(taxableIncome);
      const effectiveTaxRate = federalTax / conversion; // True effective rate on conversion
      
      // CRITICAL: Tax on Tax Calculation
      const taxPaymentNeeded = federalTax;
      const capitalGainsOnTaxPayment = (taxPaymentNeeded * 0.50) * (capitalGainsRate / 100);
      
      const totalTaxCost = federalTax + capitalGainsOnTaxPayment;
      
      // Medicare IRMAA impact (2-year lookback, modified AGI thresholds)
      const magi = totalIncome; // Simplified - actual MAGI calculation more complex
      const irmaaSurcharge = magi > 200000 ? 5800 : magi > 176000 ? 4200 : magi > 148000 ? 2800 : magi > 111000 ? 1400 : 0;
      
      timeline.push({
        year: 2026 + year,
        age,
        conversion: conversion,
        rmd: rmdAmount,
        ira: remainingIRA,
        federalTax: federalTax,
        taxRate: effectiveTaxRate,
        capitalGainsTax: capitalGainsOnTaxPayment,
        totalTaxCost: totalTaxCost,
        irmaa: irmaaSurcharge,
        allInCost: totalTaxCost + irmaaSurcharge,
        cumulativeConverted: timeline.reduce((sum, t) => sum + t.conversion, 0) + conversion,
        cumulativeTax: timeline.reduce((sum, t) => sum + t.allInCost, 0) + totalTaxCost + irmaaSurcharge
      });
      
      remainingIRA = Math.max(0, remainingIRA - conversion - rmdAmount) * (1 + annualReturn);
      
      if (remainingIRA < 10000) break;
    }
    
    return timeline;
  }, [iraAmount, conversionAmount, continueAfterRMD, capitalGainsRate, frontLoadConversions]);

  // Income projection
  const incomeProjection = useMemo(() => {
    const taxableAlloc = taxableAllocations[marketRegime] || taxableAllocations.uncertainty;
    
    // Calculate income by source from taxable account
    const incomeSources = {};
    let totalAnnualDividends = 0;
    let qualifiedDividends = 0;
    let ordinaryIncome = 0;
    
    Object.entries(taxableAlloc).forEach(([etf, data]) => {
      const amount = taxableAmount * data.allocation;
      const annualIncome = amount * (data.yield / 100);
      
      incomeSources[etf] = {
        amount: amount,
        yield: data.yield,
        annualIncome: annualIncome,
        taxStatus: data.taxStatus
      };
      
      totalAnnualDividends += annualIncome;
      
      if (data.taxStatus === 'qualified') {
        qualifiedDividends += annualIncome;
      } else if (data.taxStatus === 'ordinary') {
        ordinaryIncome += annualIncome;
      }
    });
    
    // Living expenses need
    const annualLivingExpenses = 150000;
    
    // Get first year Roth conversion tax (including tax-on-tax)
    const firstYearRothTax = rothTimeline.length > 0 ? rothTimeline[0].allInCost : 0;
    
    // Total cash needed
    const totalCashNeeded = annualLivingExpenses + firstYearRothTax;
    
    // Calculate taxes on dividends
    const taxOnQualifiedDivs = qualifiedDividends * 0.15; // 15% LTCG rate
    const taxOnOrdinaryIncome = ordinaryIncome * 0.24; // 24% ordinary rate
    const totalDividendTax = taxOnQualifiedDivs + taxOnOrdinaryIncome;
    
    // After-tax dividend income
    const afterTaxDividends = totalAnnualDividends - totalDividendTax;
    
    // Shortfall that needs to come from selling assets
    const shortfall = totalCashNeeded - afterTaxDividends;
    
    // Capital gains from selling assets to cover shortfall
    // Assume 50% cost basis
    const capitalGainsRealized = shortfall * 0.50;
    const capitalGainsTax = capitalGainsRealized * (capitalGainsRate / 100);
    
    // Total tax burden
    const totalAnnualTaxes = totalDividendTax + capitalGainsTax + firstYearRothTax;
    
    return {
      incomeSources,
      totalAnnualDividends,
      qualifiedDividends,
      ordinaryIncome,
      annualLivingExpenses,
      rothConversionTax: firstYearRothTax,
      totalCashNeeded,
      dividendTax: totalDividendTax,
      afterTaxDividends,
      shortfall,
      capitalGainsFromSales: capitalGainsRealized,
      capitalGainsTax,
      totalAnnualTaxes,
      netAfterAllCosts: totalAnnualDividends - totalAnnualTaxes
    };
  }, [marketRegime, taxableAmount, rothTimeline, capitalGainsRate]);

  // Calculate age 90 portfolio composition for summary
  const age90Portfolio = useMemo(() => {
    let brokerageValue = taxableAmount;
    let iraValue = iraAmount;
    let rothValue = 0;
    
    const dividendYield = 0.025;
    const brokerageGrowthRate = Math.max(0.01, (expectedGrowthRate / 100) - dividendYield);
    const iraGrowthRate = expectedGrowthRate / 100;
    const rothGrowthRate = expectedGrowthRate / 100;
    
    for (let year = 0; year < 30; year++) {
      const age = 60 + year;
      const isPostRMD = age >= 73;
      
      const dividendIncome = incomeProjection.totalAnnualDividends;
      const rmdRates = {73: 0.0377, 74: 0.0392, 75: 0.0407, 76: 0.0422, 77: 0.0437, 78: 0.0453, 79: 0.0470, 80: 0.0495, 81: 0.0515, 82: 0.0536, 83: 0.0558, 84: 0.0581, 85: 0.0625, 86: 0.0658, 87: 0.0694, 88: 0.0733, 89: 0.0775, 90: 0.0820};
      const rmdAmount = isPostRMD && iraValue > 0 ? (iraValue * (rmdRates[age] || 0.082)) : 0;
      
      const rothYear = rothTimeline.find(r => r.age === age);
      const conversionAmount = rothYear ? rothYear.conversion : 0;
      const conversionTax = rothYear ? rothYear.allInCost : 0;
      
      const dividendTax = incomeProjection.dividendTax;
      const rmdTax = rmdAmount * 0.24;
      const totalTax = dividendTax + rmdTax + conversionTax;
      
      const livingExpenses = incomeProjection.annualLivingExpenses * Math.pow(1.02, year);
      
      const brokerageNetChange = dividendIncome + rmdAmount - totalTax - livingExpenses;
      brokerageValue = (brokerageValue + brokerageNetChange) * (1 + brokerageGrowthRate);
      
      iraValue = Math.max(0, (iraValue - conversionAmount - rmdAmount) * (1 + iraGrowthRate));
      rothValue = (rothValue + conversionAmount) * (1 + rothGrowthRate);
    }
    
    return {
      brokerage: brokerageValue,
      ira: iraValue,
      roth: rothValue,
      total: brokerageValue + iraValue + rothValue
    };
  }, [taxableAmount, iraAmount, expectedGrowthRate, incomeProjection, rothTimeline]);

  // Rebalancing cost comparison
  const rebalancingAnalysis = [
    { frequency: 'Monthly', trades: 96, costs: 4800, taxDrag: 0.8, netReturn: 6.2 },
    { frequency: 'Quarterly', trades: 32, costs: 1600, taxDrag: 0.3, netReturn: 7.1 },
    { frequency: 'Annual', trades: 12, costs: 600, taxDrag: 0.2, netReturn: 7.0 },
    { frequency: 'Never', trades: 0, costs: 0, taxDrag: 0, netReturn: 6.5 }
  ];

  // Performance scenarios
  const performanceScenarios = [
    { year: 2026, bull: 12.5, base: 7.2, bear: -3.5 },
    { year: 2027, bull: 11.8, base: 7.8, bear: -2.1 },
    { year: 2028, bull: 13.2, base: 8.1, bear: 1.5 },
    { year: 2029, bull: 12.1, base: 7.5, bear: -1.8 },
    { year: 2030, bull: 11.5, base: 7.9, bear: 2.3 },
    { year: 2031, bull: 12.8, base: 8.3, bear: 1.9 },
    { year: 2032, bull: 11.9, base: 7.6, bear: -0.5 },
    { year: 2033, bull: 13.5, base: 8.5, bear: 2.8 },
    { year: 2034, bull: 12.3, base: 7.8, bear: 1.2 },
    { year: 2035, bull: 11.7, base: 8.0, bear: 2.5 }
  ];

  // Calculate cumulative portfolio value
  const portfolioGrowth = useMemo(() => {
    const alpha = calculateAlpha();
    const annualReturn = alpha.totalReturn / 100;
    const totalPortfolio = taxableAmount + iraAmount;
    
    return Array.from({ length: 11 }, (_, i) => {
      const year = 2026 + i;
      const value = totalPortfolio * Math.pow(1 + annualReturn, i);
      const withdrawals = i > 0 ? 150000 * i : 0;
      const netValue = value - withdrawals;
      
      return {
        year,
        value: Math.round(netValue),
        withdrawals,
        income: Math.round(netValue * (incomeProjection.totalYield / 100))
      };
    });
  }, [taxableAmount, iraAmount, marketRegime, rebalanceFrequency]);

  const alpha = calculateAlpha();
  const currentAllocation = allocations[marketRegime] || allocations.uncertainty;

  // Roth conversion summary calculations (avoid arrow functions in JSX)
  const rothTotalCost = rothTimeline.reduce((sum, t) => sum + t.allInCost, 0);
  const rothSavings = 1200000 - rothTotalCost;
  const rothTotalFederalTax = rothTimeline.reduce((sum, t) => sum + t.federalTax, 0);
  const rothTotalCapitalGainsTax = rothTimeline.reduce((sum, t) => sum + t.capitalGainsTax, 0);
  const rothTotalConversion = rothTimeline.reduce((sum, t) => sum + t.conversion, 0);
  const rothTotalRMD = rothTimeline.reduce((sum, t) => sum + t.rmd, 0);
  const rothTotalIRMAA = rothTimeline.reduce((sum, t) => sum + t.irmaa, 0);

  // Prepare data for charts
  const allocationData = Object.entries(currentAllocation).map(([name, value]) => ({
    name,
    value: Math.round(value * 100),
    amount: Math.round((taxableAmount + iraAmount) * value)
  }));

  const factorData = Object.entries(factorPerformance[marketRegime] || factorPerformance.uncertainty).map(([name, value]) => {
    const spxReturns = {
      goldilocks: 14,
      boom: 11,
      uncertainty: 7,
      grind: 8,
      crisis: -5
    };
    return {
      name,
      return: value,
      spx: spxReturns[marketRegime] || 7
    };
  });

  const alphaBreakdown = [
    { source: 'Base Return (S&P 500)', value: alpha.baseReturn },
    { source: 'Factor Tilts', value: alpha.factorAlpha },
    { source: 'Tactical Allocation', value: alpha.tacticalAlpha },
    { source: 'Tax Efficiency', value: alpha.taxAlpha },
    { source: 'Rebalancing', value: alpha.rebalanceAlpha }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Portfolio Strategy Dashboard
          </h1>
          <p className="text-slate-300 text-lg">
            Interactive Analysis: $12.6M Portfolio • Age 59 • Income Goal: $150K/year
          </p>
        </div>

        {/* Key Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Total Portfolio</div>
            <div className="text-2xl font-bold">${((taxableAmount + iraAmount) / 1000000).toFixed(1)}M</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Expected Return</div>
            <div className="text-2xl font-bold text-green-400">{alpha.totalReturn.toFixed(1)}%</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Alpha Generated</div>
            <div className="text-2xl font-bold text-purple-400">+{alpha.totalAlpha.toFixed(1)}%</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Annual Income</div>
            <div className="text-2xl font-bold text-blue-400">${(incomeProjection.totalAnnualDividends / 1000).toFixed(0)}K</div>
            <div className="text-xs text-slate-400">Before tax</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Total Tax Burden</div>
            <div className="text-2xl font-bold text-red-400">${(incomeProjection.totalAnnualTaxes / 1000).toFixed(0)}K</div>
            <div className="text-xs text-slate-400">All sources</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
          <h3 className="text-xl font-semibold mb-4">Scenario Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Market Regime (Comprehensive)</label>
              <select 
                value={marketRegime}
                onChange={(e) => setMarketRegime(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
              >
                <option value="goldilocks">Goldilocks (Bull + Low Vol + Low Inflation)</option>
                <option value="boom">Boom (Bull + Rising Vol + Rising Inflation)</option>
                <option value="uncertainty">Uncertainty (Sideways + High Vol + Sticky Inflation) ★</option>
                <option value="grind">Sideways Grind (Range + Low Vol + Stable Inflation)</option>
                <option value="crisis">Crisis (Bear + High Vol + Risk-Off)</option>
              </select>
              <div className="text-xs text-slate-400 mt-1">
                {regimeDefinitions[marketRegime]?.indicators}
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Rebalancing Frequency</label>
              <select 
                value={rebalanceFrequency}
                onChange={(e) => setRebalanceFrequency(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              >
                <option value="monthly">Monthly (NOT Recommended)</option>
                <option value="quarterly">Quarterly (Optimal)</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Annual Roth Conversion</label>
              <input 
                type="range"
                min="100000"
                max="400000"
                step="25000"
                value={conversionAmount}
                onChange={(e) => setConversionAmount(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-center mt-1">${(conversionAmount / 1000).toFixed(0)}K</div>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Long-Term Cap Gains Rate</label>
              <select 
                value={capitalGainsRate}
                onChange={(e) => setCapitalGainsRate(parseInt(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              >
                <option value="0">0% (Low Income)</option>
                <option value="15">15% (Most People)</option>
                <option value="20">20% (High Income)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">State Income Tax Rate</label>
              <input 
                type="range"
                min="0"
                max="13"
                step="0.5"
                value={stateTaxRate}
                onChange={(e) => setStateTaxRate(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-center mt-1">
                <span className="font-bold">{stateTaxRate.toFixed(1)}%</span>
                <span className="text-xs text-slate-400 ml-2">
                  {stateTaxRate === 0 && '(No state tax: FL, TX, NV, WA, etc.)'}
                  {stateTaxRate > 0 && stateTaxRate <= 5 && '(Low-tax state)'}
                  {stateTaxRate > 5 && stateTaxRate <= 8 && '(Medium-tax state)'}
                  {stateTaxRate > 8 && '(High-tax state: CA, NY, NJ, etc.)'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <label className="flex items-center text-sm text-slate-300">
              <input 
                type="checkbox"
                checked={useConservativeEstimates}
                onChange={(e) => setUseConservativeEstimates(e.target.checked)}
                className="mr-2"
              />
              <span>
                <strong className="text-green-400">Use Conservative Estimates (+20% buffer)?</strong> Recommended for real money decisions
              </span>
            </label>
            <label className="flex items-center text-sm text-slate-300">
              <input 
                type="checkbox"
                checked={continueAfterRMD}
                onChange={(e) => setContinueAfterRMD(e.target.checked)}
                className="mr-2"
              />
              Continue Roth conversions after age 73 (RMDs)?
            </label>
            <label className="flex items-center text-sm text-slate-300">
              <input 
                type="checkbox"
                checked={frontLoadConversions}
                onChange={(e) => setFrontLoadConversions(e.target.checked)}
                className="mr-2"
              />
              <span>
                <strong className="text-yellow-400">Front-load conversions?</strong> (Higher amounts early, taper down - better if expecting higher tax rates)
              </span>
            </label>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['personas', 'overview', 'accounts', 'alpha', 'allocation', 'income', 'tax-optimization', 'roth', 'rebalancing', 'etfs', 'cpa-review'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab === 'tax-optimization' ? 'Tax Optimization' : 
               tab === 'cpa-review' ? 'CPA Review' : 
               tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          {activeTab === 'personas' && (
            <div>
              {!clientRecommendations && showQuestionnaire && (
                <div>
                  <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Client Financial Planning</h2>
                    <button
                      onClick={() => setShowQuestionnaire(false)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
                    >
                      Close
                    </button>
                  </div>
                  <ClientQuestionnaire 
                    onComplete={(data) => {
                      const recommendations = generateRecommendations(data);
                      setClientRecommendations(recommendations);
                      setShowQuestionnaire(false);
                    }}
                  />
                </div>
              )}
              
              {clientRecommendations && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-white">
                      Financial Plan - {clientRecommendations.lifeStage.replace(/_/g, ' ').toUpperCase()}
                    </h2>
                    <button
                      onClick={() => {
                        setClientRecommendations(null);
                        setShowQuestionnaire(true);
                      }}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                    >
                      New Client
                    </button>
                  </div>

                  {/* Executive Summary */}
                  <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-blue-300 mb-3 flex items-center">
                      <span className="text-2xl mr-2">📊</span>
                      Executive Summary
                    </h3>
                    <p className="text-white text-lg leading-relaxed">{clientRecommendations.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Asset Allocation */}
                    <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-500/30 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-green-300 mb-4 flex items-center">
                        <span className="text-2xl mr-2">🎯</span>
                        Asset Allocation
                      </h3>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-sm text-slate-400 mb-1">Stocks</div>
                          <div className="text-3xl font-bold text-white">
                            {(clientRecommendations.assetAllocation.stocks * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-slate-400 mb-1">Bonds</div>
                          <div className="text-3xl font-bold text-white">
                            {(clientRecommendations.assetAllocation.bonds * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-slate-400 mb-1">Cash</div>
                          <div className="text-3xl font-bold text-white">
                            {(clientRecommendations.assetAllocation.cash * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-green-600/30">
                        <p className="text-sm text-slate-300 italic">{clientRecommendations.assetAllocation.rationale}</p>
                      </div>
                    </div>

                    {/* Alpha Generation */}
                    <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-500/30 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-purple-300 mb-4 flex items-center">
                        <span className="text-2xl mr-2">⚡</span>
                        Alpha Generation
                      </h3>
                      <div className="text-center mb-4">
                        <div className="text-sm text-slate-400 mb-1">Total Alpha</div>
                        <div className="text-4xl font-bold text-purple-300">
                          +{clientRecommendations.alphaGeneration.totalAlpha.toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{clientRecommendations.alphaGeneration.vsIndex}</div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Factor Tilts:</span>
                          <span className="text-white">+{clientRecommendations.alphaGeneration.factorTilts.amount}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tax Efficiency:</span>
                          <span className="text-white">+{clientRecommendations.alphaGeneration.taxEfficiency.amount}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Rebalancing:</span>
                          <span className="text-white">+{clientRecommendations.alphaGeneration.rebalancing.amount}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Cost Savings:</span>
                          <span className="text-white">+{clientRecommendations.alphaGeneration.costSavings.amount}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tax Strategies */}
                  <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 border border-yellow-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center">
                      <span className="text-2xl mr-2">💰</span>
                      Tax Optimization Strategies
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {clientRecommendations.taxStrategies.map((strategy, i) => (
                        <div key={i} className="flex items-start bg-slate-800/50 rounded-lg p-3">
                          <span className="text-green-400 mr-3 mt-0.5 text-lg">✓</span>
                          <span className="text-white text-sm">{strategy}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Roth Conversion Plan */}
                  {clientRecommendations.rothConversionPlan && (
                    <div className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 border border-indigo-500/30 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-indigo-300 mb-4 flex items-center">
                        <span className="text-2xl mr-2">🔄</span>
                        Roth Conversion Strategy
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <div className="text-xs text-slate-400 mb-1">Strategy</div>
                          <div className="text-lg font-bold text-white">{clientRecommendations.rothConversionPlan.strategy}</div>
                        </div>
                        {clientRecommendations.rothConversionPlan.totalConverted && (
                          <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="text-xs text-slate-400 mb-1">Total Converted</div>
                            <div className="text-lg font-bold text-white">
                              ${(clientRecommendations.rothConversionPlan.totalConverted / 1000000).toFixed(1)}M
                            </div>
                          </div>
                        )}
                        {clientRecommendations.rothConversionPlan.totalTax && (
                          <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="text-xs text-slate-400 mb-1">Total Tax</div>
                            <div className="text-lg font-bold text-orange-400">
                              ${(clientRecommendations.rothConversionPlan.totalTax / 1000).toFixed(0)}K
                            </div>
                          </div>
                        )}
                        {clientRecommendations.rothConversionPlan.rothAt90 && (
                          <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="text-xs text-slate-400 mb-1">Roth @ Age 90</div>
                            <div className="text-lg font-bold text-green-400">
                              ${(clientRecommendations.rothConversionPlan.rothAt90 / 1000000).toFixed(1)}M
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
                        <div className="text-sm text-green-300">
                          <strong>Benefit:</strong> {clientRecommendations.rothConversionPlan.benefit}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Plan */}
                  <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 border border-red-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-red-300 mb-4 flex items-center">
                      <span className="text-2xl mr-2">🎯</span>
                      Immediate Action Plan
                    </h3>
                    <div className="space-y-3">
                      {clientRecommendations.actionPlan.immediate.map((action, i) => (
                        <div key={i} className="flex items-start bg-slate-800/50 rounded-lg p-4">
                          <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-white">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 30-Year Projection */}
                  <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/40 border border-cyan-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center">
                      <span className="text-2xl mr-2">📈</span>
                      30-Year Wealth Projection
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                        <div className="text-xs text-slate-400 mb-1">Final Portfolio</div>
                        <div className="text-3xl font-bold text-cyan-300">
                          ${(clientRecommendations.projections.finalValue / 1000000).toFixed(1)}M
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                        <div className="text-xs text-slate-400 mb-1">Total Growth</div>
                        <div className="text-3xl font-bold text-green-400">
                          {clientRecommendations.projections.totalGrowth}%
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                        <div className="text-xs text-slate-400 mb-1">Expected Return</div>
                        <div className="text-3xl font-bold text-white">
                          {clientRecommendations.projections.assumptions.return}
                        </div>
                      </div>
                    </div>
                    
                    {/* Projection Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b border-cyan-600/30">
                          <tr className="text-cyan-300">
                            <th className="text-left py-2">Year</th>
                            <th className="text-left py-2">Age</th>
                            <th className="text-right py-2">Portfolio Value</th>
                            <th className="text-right py-2">Growth %</th>
                          </tr>
                        </thead>
                        <tbody className="text-white">
                          {clientRecommendations.projections.projections.map((proj, i) => (
                            <tr key={i} className="border-b border-slate-700">
                              <td className="py-2">Year {proj.year}</td>
                              <td className="py-2">{proj.age}</td>
                              <td className="text-right py-2">${(proj.portfolioValue / 1000000).toFixed(2)}M</td>
                              <td className="text-right py-2 text-green-400">+{proj.growth}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Portfolio Recommendations */}
                  {clientRecommendations.portfolioRecommendations && (
                    <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <span className="text-2xl mr-2">📊</span>
                        Portfolio Recommendations by Account
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {Object.entries(clientRecommendations.portfolioRecommendations).map(([account, allocation]) => (
                          <div key={account} className="bg-slate-900/50 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-300 mb-3 capitalize">
                              {account.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            <div className="space-y-2">
                              {Object.entries(allocation).map(([etf, weight]) => (
                                <div key={etf} className="flex justify-between items-center text-sm">
                                  <span className="text-slate-300">{etf}</span>
                                  <span className="text-white font-semibold">{(weight * 100).toFixed(0)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!clientRecommendations && !showQuestionnaire && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Client Financial Planning</h3>
                  <p className="text-slate-400 mb-6">Create comprehensive financial plans for clients across all life stages</p>
                  <button
                    onClick={() => setShowQuestionnaire(true)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:shadow-lg transition-all"
                  >
                    Start New Client Assessment
                  </button>
                </div>
              )}
            </div>
          )}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Portfolio Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Current Allocation ({marketRegime.charAt(0).toUpperCase() + marketRegime.slice(1)} Market)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">10-Year Portfolio Growth</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={portfolioGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="year" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" tickFormatter={(val) => `$${(val/1000000).toFixed(1)}M`} />
                      <Tooltip formatter={(val) => `$${(val/1000000).toFixed(2)}M`} />
                      <Legend />
                      <Area type="monotone" dataKey="value" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Portfolio Value" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Strategy Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Structure:</span>
                    <span className="ml-2 font-semibold">5 Pillars (Never Changes)</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Allocations:</span>
                    <span className="ml-2 font-semibold">Dynamic by Regime</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Rebalancing:</span>
                    <span className="ml-2 font-semibold">Quarterly + 5% Triggers</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Account-Specific Allocations</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* TAXABLE ACCOUNT */}
                <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-lg p-6 border border-green-500/30">
                  <h3 className="text-xl font-semibold mb-4 text-green-400">
                    Taxable Brokerage: ${(taxableAmount / 1000000).toFixed(1)}M
                  </h3>
                  <p className="text-sm text-slate-300 mb-4">
                    <strong>Focus:</strong> Income generation + Tax efficiency
                  </p>
                  
                  <div className="space-y-2">
                    {taxableAllocations[marketRegime] ? Object.entries(taxableAllocations[marketRegime]).map(([etf, data]) => (
                      <div key={etf} className="bg-slate-700/50 rounded p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-sm">{etf}</span>
                          <span className="text-green-400">{(data.allocation * 100).toFixed(0)}%</span>
                        </div>
                        <div className="text-xs text-slate-400 space-y-1">
                          <div>Amount: ${((taxableAmount * data.allocation) / 1000000).toFixed(2)}M</div>
                          <div>Yield: {data.yield}% = ${((taxableAmount * data.allocation * data.yield / 100) / 1000).toFixed(1)}K/year</div>
                          <div className="text-yellow-400">Tax: {data.taxStatus}</div>
                        </div>
                      </div>
                    )) : <div className="text-red-400 p-4">Error: Invalid regime selected</div>}
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-900/20 rounded">
                    <div className="text-sm font-semibold mb-1">Total Annual Income:</div>
                    <div className="text-2xl font-bold text-green-400">
                      ${(incomeProjection.totalAnnualDividends / 1000).toFixed(0)}K
                    </div>
                  </div>
                </div>

                {/* IRA ACCOUNT */}
                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-6 border border-purple-500/30">
                  <h3 className="text-xl font-semibold mb-4 text-purple-400">
                    Traditional IRA: ${(iraAmount / 1000000).toFixed(1)}M
                  </h3>
                  <p className="text-sm text-slate-300 mb-2">
                    <strong>Focus:</strong> GROWTH (14+ year horizon) + Tax-inefficient assets
                  </p>
                  <p className="text-xs text-yellow-400 mb-4">
                    ⚡ Allocation adjusts with market regime ({marketRegime}) - always growth-tilted
                  </p>
                  
                  <div className="space-y-2">
                    {iraAllocations[marketRegime] ? Object.entries(iraAllocations[marketRegime]).map(([etf, data]) => (
                      <div key={etf} className="bg-slate-700/50 rounded p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-sm">{etf}</span>
                          <span className="text-purple-400">{(data.allocation * 100).toFixed(0)}%</span>
                        </div>
                        <div className="text-xs text-slate-400 space-y-1">
                          <div>Amount: ${((iraAmount * data.allocation) / 1000000).toFixed(2)}M</div>
                          <div>Yield: {data.yield}%</div>
                          <div className="text-slate-500 italic">{data.note}</div>
                        </div>
                      </div>
                    )) : <div className="text-red-400 p-4">Error: Invalid regime selected</div>}
                  </div>
                  
                  <div className="mt-4 p-3 bg-purple-900/20 rounded border border-purple-600/30">
                    <div className="text-sm font-semibold mb-1">Converting to Roth:</div>
                    <div className="text-lg text-purple-400">
                      {continueAfterRMD ? '20-year plan' : '14-year plan'} (by age {continueAfterRMD ? 80 : 73})
                    </div>
                    {frontLoadConversions && (
                      <div className="text-xs text-yellow-400 mt-1">
                        Front-loading: Higher conversions early years
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* IRA REBALANCING STRATEGY */}
              <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-600/30 rounded-lg p-4">
                <h4 className="font-semibold text-purple-400 mb-3">📊 IRA Rebalancing Strategy</h4>
                <div className="text-sm text-slate-300 space-y-2">
                  <p><strong>Frequency:</strong> Semi-annual reviews (June & December)</p>
                  <p><strong>Why more frequent than taxable?</strong> No tax consequences in IRA = can rebalance aggressively</p>
                  
                  <div className="bg-slate-800/50 rounded p-3 mt-2">
                    <div className="font-semibold mb-2">Regime-Based Adjustments:</div>
                    <ul className="space-y-1 text-xs ml-4">
                      <li>• <strong>Goldilocks:</strong> 90% equities, 15% momentum, max growth/Nasdaq</li>
                      <li>• <strong>Boom:</strong> 85% equities, 10% momentum, add quality</li>
                      <li>• <strong>Uncertainty (Current):</strong> 85% equities, 8% momentum, balanced</li>
                      <li>• <strong>Grind:</strong> 85% equities, 7% momentum, value tilt</li>
                      <li>• <strong>Crisis:</strong> 70% equities, 0% momentum, quality/low-vol</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-900/20 border border-yellow-600/30 rounded p-3 mt-2">
                    <div className="font-semibold mb-1 text-yellow-400">⚠️ Key Principle:</div>
                    <p className="text-xs">Even in crisis, IRA stays <strong>growth-focused</strong> (70%+ equities) because you won't touch this money for 14+ years. Short-term volatility doesn't matter.</p>
                  </div>
                </div>
              </div>

              {/* MARKET REGIME GUIDE */}
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-600/30 rounded-lg p-4">
                <h4 className="font-semibold text-blue-400 mb-3">📖 Market Regime Guide</h4>
                <div className="space-y-2 text-xs text-slate-300">
                  {Object.entries(regimeDefinitions).map(([key, def]) => (
                    <div key={key} className="bg-slate-800/50 rounded p-2 border-l-4" style={{borderLeftColor: def.color === 'green' ? '#10b981' : def.color === 'yellow' ? '#fbbf24' : def.color === 'orange' ? '#f97316' : def.color === 'blue' ? '#3b82f6' : '#ef4444'}}>
                      <div className="font-semibold">{def.name}</div>
                      <div className="text-slate-400">Trend: {def.trend} | Vol: {def.volatility} | Inflation: {def.inflation}</div>
                      <div className="text-slate-500 text-xs mt-1">{def.indicators}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                <h4 className="font-semibold text-blue-400 mb-2">Asset Location Strategy</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                  <div>
                    <div className="font-semibold mb-2">Taxable Account (Tax-Efficient):</div>
                    <ul className="space-y-1 text-xs">
                      <li>✓ High dividend ETFs (qualified dividends)</li>
                      <li>✓ Dividend growth stocks</li>
                      <li>✓ International developed (foreign tax credit)</li>
                      <li>✓ Value stocks (tax-efficient)</li>
                      <li>✓ Gold (no dividends, only capital gains)</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold mb-2">IRA Account (Tax-Inefficient):</div>
                    <ul className="space-y-1 text-xs">
                      <li>✓ REITs (ordinary income distributions)</li>
                      <li>✓ Emerging markets (withholding taxes)</li>
                      <li>✓ Momentum (high turnover)</li>
                      <li>✓ TIPS (phantom income)</li>
                      <li>✓ Commodities (tax-inefficient)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-400 mb-2">⚠️ Critical Tax Rules</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• <strong>NEVER</strong> hold REITs (VNQ) in taxable - distributions taxed as ordinary income</li>
                  <li>• <strong>ALWAYS</strong> hold high-dividend ETFs (SCHD, VYM) in taxable - qualified dividend treatment</li>
                  <li>• Foreign stocks (VEA) in taxable allows foreign tax credit</li>
                  <li>• After Roth conversion complete, move growth assets to Roth for tax-free gains</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'alpha' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Alpha Generation Breakdown</h2>
              
              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-6 border border-purple-500/30">
                <h3 className="text-3xl font-bold mb-2">Total Alpha: <span className="text-purple-400">+{alpha.totalAlpha.toFixed(2)}%</span></h3>
                <p className="text-slate-300">Expected Total Return: <span className="text-green-400 font-semibold">{alpha.totalReturn.toFixed(2)}%</span> vs S&P 500: {alpha.baseReturn.toFixed(1)}%</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Alpha Sources (Step-by-Step)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={alphaBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" />
                    <YAxis dataKey="source" type="category" width={150} stroke="#9ca3af" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6">
                      {alphaBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#8b5cf6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-2 text-purple-400">1. Factor Tilts: +{alpha.factorAlpha.toFixed(2)}%</h4>
                  <p className="text-sm text-slate-300 mb-2">How it works in {marketRegime} market:</p>
                  <ul className="text-sm text-slate-300 space-y-1 ml-4">
                    <li>• Quality factor (10%): Defensive companies with strong balance sheets outperform in uncertainty</li>
                    <li>• Value factor (8%): Undervalued stocks provide downside protection and upside capture</li>
                    <li>• Low Volatility (7%): Reduces drawdowns while maintaining participation</li>
                    <li>• Reduced Momentum (3%): Avoid crash risk during regime transitions</li>
                  </ul>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-2 text-blue-400">2. Tactical Allocation: +{alpha.tacticalAlpha.toFixed(2)}%</h4>
                  <p className="text-sm text-slate-300 mb-2">Regime-based positioning advantages:</p>
                  <ul className="text-sm text-slate-300 space-y-1 ml-4">
                    <li>• Elevated defensive ballast (25% vs normal 15%): Protection during late-cycle volatility</li>
                    <li>• Increased gold (7% vs normal 4%): Hedge against market stress and inflation</li>
                    <li>• Reduced core holdings (35% vs 45%): Lower exposure to overvalued market</li>
                    <li>• Maintained international (20%): Diversification away from US concentration</li>
                  </ul>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-2 text-green-400">3. Tax Efficiency: +{alpha.taxAlpha.toFixed(2)}%</h4>
                  <p className="text-sm text-slate-300 mb-2">Tax optimization strategies:</p>
                  <ul className="text-sm text-slate-300 space-y-1 ml-4">
                    <li>• Qualified dividends in taxable (0-15% tax vs 24%+ ordinary income)</li>
                    <li>• Tax-loss harvesting: ~$3K-10K annual value</li>
                    <li>• Strategic asset location: REITs in IRA, growth in taxable</li>
                    <li>• Roth conversions: $500-700K lifetime savings vs waiting for RMDs</li>
                  </ul>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-2 text-yellow-400">4. Rebalancing Discipline: +{alpha.rebalanceAlpha.toFixed(2)}%</h4>
                  <p className="text-sm text-slate-300 mb-2">Smart rebalancing approach:</p>
                  <ul className="text-sm text-slate-300 space-y-1 ml-4">
                    <li>• Quarterly reviews with 5% drift triggers: Sell high, buy low automatically</li>
                    <li>• Avoid monthly rebalancing: Saves 0.5-0.8% annually in costs/taxes</li>
                    <li>• Use dividends to rebalance: Tax-free portfolio adjustments</li>
                    <li>• Disciplined execution: Remove emotion from investment decisions</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'allocation' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Allocation by Market Regime</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.keys(allocations).map(regime => (
                  <div 
                    key={regime} 
                    className={`bg-slate-700 rounded-lg p-4 border-2 ${marketRegime === regime ? 'border-blue-500' : 'border-transparent'} cursor-pointer hover:border-blue-400 transition-all`}
                    onClick={() => setMarketRegime(regime)}
                  >
                    <h3 className="font-semibold mb-3 text-center capitalize">{regimeDefinitions[regime]?.name || regime}</h3>
                    <div className="space-y-2 text-sm">
                      {allocations[regime] && Object.entries(allocations[regime]).map(([name, value]) => (
                        <div key={name} className="flex justify-between">
                          <span className="text-slate-300">{name}</span>
                          <span className="font-semibold">{(value * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Factor Performance by Regime</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={factorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="return" fill="#8b5cf6" name="Factor Return" />
                    <Bar dataKey="spx" fill="#3b82f6" name="S&P 500" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Key Insights: {marketRegime.charAt(0).toUpperCase() + marketRegime.slice(1)} Market</h3>
                <div className="text-sm text-slate-300 space-y-2">
                  {marketRegime === 'bull' && (
                    <>
                      <p>• Momentum and Growth factors lead performance</p>
                      <p>• Reduce defensive positions, increase risk assets</p>
                      <p>• Small cap exposure beneficial</p>
                    </>
                  )}
                  {marketRegime === 'sideways' && (
                    <>
                      <p>• Quality and Value factors outperform</p>
                      <p>• Momentum significantly underperforms - reduce exposure</p>
                      <p>• Elevated defensive ballast provides stability</p>
                    </>
                  )}
                  {marketRegime === 'bear' && (
                    <>
                      <p>• Quality and Low Volatility provide best protection</p>
                      <p>• Momentum crashes - eliminate completely</p>
                      <p>• Maximum bonds and gold for capital preservation</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}



{activeTab === 'income' && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Complete Lifetime Wealth Projection (Age 60 → 90)</h2>
      <div className="text-sm text-slate-400">Year-by-year account balances with Roth conversions & taxes</div>
    </div>

    {/* Comprehensive Year-by-Year Projection */}
    {(() => {
      // Calculate comprehensive year-by-year projection

      
 const lifetimeProjection = calculateProductionIncomeProjection({
     currentAge: 60,
     taxableAmount,
     iraAmount,
     conversionAmount,
     frontLoadConversions,
     expectedGrowthRate,
     capitalGainsRate,
     stateTaxRate, // Now actually used!
     conservativeBuffer: useConservativeEstimates ? 1.2 : 1.0, // Now actually used!
   });
      
      // Calculate summary statistics
      const totalConversions = lifetimeProjection.reduce((sum, p) => sum + p.conversionAmount, 0);
      const totalConversionTaxes = lifetimeProjection.reduce((sum, p) => sum + p.conversionTax, 0);
      const totalCapGainsTaxes = lifetimeProjection.reduce((sum, p) => sum + p.capGainsTax, 0);
      const totalLifetimeTaxes = lifetimeProjection.reduce((sum, p) => sum + p.totalTaxes, 0);
      const finalPortfolio = lifetimeProjection[lifetimeProjection.length - 1].totalPortfolio;
      const finalRothPct = (lifetimeProjection[lifetimeProjection.length - 1].rothIRABalance / finalPortfolio) * 100;
      
      return (
        <>
          {/* Executive Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-500/30 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Starting Portfolio</div>
              <div className="text-2xl font-bold text-white">
                ${((taxableAmount + iraAmount) / 1000000).toFixed(2)}M
              </div>
              <div className="text-xs text-slate-400 mt-1">Age 60</div>
            </div>

            <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-500/30 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Ending Portfolio</div>
              <div className="text-2xl font-bold text-green-400">
                ${(finalPortfolio / 1000000).toFixed(2)}M
              </div>
              <div className="text-xs text-slate-400 mt-1">Age 90</div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-500/30 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Roth Conversions</div>
              <div className="text-2xl font-bold text-purple-400">
                ${(totalConversions / 1000000).toFixed(2)}M
              </div>
              <div className="text-xs text-slate-400 mt-1">{finalRothPct.toFixed(0)}% of portfolio</div>
            </div>

            <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 border border-red-500/30 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Lifetime Taxes</div>
              <div className="text-2xl font-bold text-red-400">
                ${(totalLifetimeTaxes / 1000000).toFixed(2)}M
              </div>
              <div className="text-xs text-slate-400 mt-1">All sources, ages 60-90</div>
            </div>
          </div>

          {/* Detailed Year-by-Year Table */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-xl font-semibold mb-4">Complete Year-by-Year Projection (Age 60 → 90)</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-700 sticky top-0">
                  <tr className="text-slate-300">
                    <th className="text-left py-3 px-2 border-r border-slate-600">Age</th>
                    <th className="text-right py-3 px-2 border-r border-slate-600">Dividends</th>
                    <th className="text-right py-3 px-2 border-r border-slate-600">RMD</th>
                    <th className="text-right py-3 px-2 border-r border-slate-600">Soc Sec</th>
                    <th className="text-right py-3 px-2 bg-purple-900/30 border-r border-slate-600">Roth Conv</th>
                    <th className="text-right py-3 px-2 bg-purple-900/30 border-r border-slate-600">Conv Tax</th>
                    <th className="text-right py-3 px-2 bg-red-900/30 border-r border-slate-600">Stocks Sold</th>
                    <th className="text-right py-3 px-2 bg-red-900/30 border-r border-slate-600">Cap Gains</th>
                    <th className="text-right py-3 px-2 bg-red-900/30 border-r border-slate-600">Tax-on-Tax</th>
                    <th className="text-right py-3 px-2 border-r border-slate-600">Total Taxes</th>
                    <th className="text-right py-3 px-2 bg-blue-900/30 border-r border-slate-600">Taxable</th>
                    <th className="text-right py-3 px-2 bg-amber-900/30 border-r border-slate-600">Trad IRA</th>
                    <th className="text-right py-3 px-2 bg-green-900/30 border-r border-slate-600">Roth IRA</th>
                    <th className="text-right py-3 px-2 font-bold">Total</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  {lifetimeProjection.map((proj) => (
                    <tr 
                      key={proj.age} 
                      className={`border-b border-slate-700 hover:bg-slate-700/30 ${
                        proj.age === 73 ? 'bg-purple-900/20 font-semibold' : ''
                      } ${proj.age === 90 ? 'bg-green-900/20 font-semibold' : ''}`}
                    >
                      <td className="py-2 px-2 font-semibold border-r border-slate-600">{proj.age}</td>
                      <td className="text-right py-2 px-2 border-r border-slate-600">${(proj.dividends / 1000).toFixed(0)}K</td>
                      <td className="text-right py-2 px-2 text-purple-400 border-r border-slate-600">${(proj.rmd / 1000).toFixed(0)}K</td>
                      <td className="text-right py-2 px-2 text-blue-400 border-r border-slate-600">${(proj.socialSecurity / 1000).toFixed(0)}K</td>
                      <td className="text-right py-2 px-2 bg-purple-900/20 text-purple-300 border-r border-slate-600">${(proj.conversionAmount / 1000).toFixed(0)}K</td>
                      <td className="text-right py-2 px-2 bg-purple-900/20 text-red-400 border-r border-slate-600">${(proj.conversionTax / 1000).toFixed(0)}K</td>
                      <td className="text-right py-2 px-2 bg-red-900/20 text-orange-400 border-r border-slate-600">${(proj.stocksSold / 1000).toFixed(0)}K</td>
                      <td className="text-right py-2 px-2 bg-red-900/20 text-orange-300 border-r border-slate-600">${(proj.capitalGains / 1000).toFixed(0)}K</td>
                      <td className="text-right py-2 px-2 bg-red-900/20 text-red-400 border-r border-slate-600">${(proj.capGainsTax / 1000).toFixed(0)}K</td>
                      <td className="text-right py-2 px-2 text-red-400 font-semibold border-r border-slate-600">${(proj.totalTaxes / 1000).toFixed(0)}K</td>
                      <td className="text-right py-2 px-2 bg-blue-900/20 text-blue-300 border-r border-slate-600">${(proj.taxableBalance / 1000000).toFixed(2)}M</td>
                      <td className="text-right py-2 px-2 bg-amber-900/20 text-amber-300 border-r border-slate-600">${(proj.tradIRABalance / 1000000).toFixed(2)}M</td>
                      <td className="text-right py-2 px-2 bg-green-900/20 text-green-400 border-r border-slate-600">${(proj.rothIRABalance / 1000000).toFixed(2)}M</td>
                      <td className="text-right py-2 px-2 font-bold text-lg">${(proj.totalPortfolio / 1000000).toFixed(2)}M</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-700 font-bold">
                  <tr className="text-white">
                    <td className="py-3 px-2 border-r border-slate-600">TOTALS</td>
                    <td className="text-right py-3 px-2 border-r border-slate-600" colSpan="3">—</td>
                    <td className="text-right py-3 px-2 bg-purple-900/30 text-purple-300 border-r border-slate-600">
                      ${(totalConversions / 1000000).toFixed(2)}M
                    </td>
                    <td className="text-right py-3 px-2 bg-purple-900/30 text-red-400 border-r border-slate-600">
                      ${(totalConversionTaxes / 1000).toFixed(0)}K
                    </td>
                    <td className="text-right py-3 px-2 bg-red-900/30 border-r border-slate-600" colSpan="2">—</td>
                    <td className="text-right py-3 px-2 bg-red-900/30 text-red-400 border-r border-slate-600">
                      ${(totalCapGainsTaxes / 1000).toFixed(0)}K
                    </td>
                    <td className="text-right py-3 px-2 text-red-400 border-r border-slate-600">
                      ${(totalLifetimeTaxes / 1000000).toFixed(2)}M
                    </td>
                    <td className="text-right py-3 px-2 border-r border-slate-600" colSpan="3">—</td>
                    <td className="text-right py-3 px-2 text-green-400 text-xl">
                      ${(finalPortfolio / 1000000).toFixed(2)}M
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Key Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/40 border border-amber-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-amber-300 mb-3">💡 Tax-on-Tax Impact</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>Total stocks sold (ages 60-90):</span>
                  <span className="font-bold text-orange-400">
                    ${(lifetimeProjection.reduce((sum, p) => sum + p.stocksSold, 0) / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Capital gains realized:</span>
                  <span className="font-bold text-orange-300">
                    ${(lifetimeProjection.reduce((sum, p) => sum + p.capitalGains, 0) / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="flex justify-between border-t border-amber-600/30 pt-2">
                  <span>Total cap gains tax (tax-on-tax):</span>
                  <span className="font-bold text-red-400">
                    ${(totalCapGainsTaxes / 1000).toFixed(0)}K
                  </span>
                </div>
                <p className="text-xs italic text-amber-200 mt-3">
                  This is the "hidden tax" - capital gains triggered when selling stocks to pay Roth conversion taxes and living expenses.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-300 mb-3">🎯 Roth Conversion Success</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>Years converting:</span>
                  <span className="font-bold text-white">
                    {lifetimeProjection.filter(p => p.conversionAmount > 0).length} years
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total converted to Roth:</span>
                  <span className="font-bold text-purple-400">
                    ${(totalConversions / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Roth at age 90:</span>
                  <span className="font-bold text-green-400">
                    ${(lifetimeProjection[lifetimeProjection.length - 1].rothIRABalance / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="flex justify-between border-t border-green-600/30 pt-2">
                  <span>% of portfolio tax-free:</span>
                  <span className="font-bold text-green-400">{finalRothPct.toFixed(0)}%</span>
                </div>
                <p className="text-xs italic text-green-200 mt-3">
                  Roth grows tax-free and passes to heirs 100% tax-free. Traditional IRA would be taxed at 24-37%.
                </p>
              </div>
            </div>
          </div>
        </>
      );
    })()}
  </div>
)}


{activeTab === 'tax-optimization' && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-bold">Tax Optimization Strategies</h2>
      <div className="text-sm text-slate-400">Comprehensive guide to minimize lifetime taxes</div>
    </div>

    {/* Tax Savings Summary */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-500/30 rounded-lg p-4">
        <div className="text-xs text-slate-400 mb-1">Potential QCD Savings</div>
        <div className="text-2xl font-bold text-green-400">
          ${(() => {
            const currentAge = 60;
            const yearsEligible = Math.max(0, 90 - Math.max(currentAge, 70.5));
            const rmd73 = iraAmount / 26.5;
            const avgQCD = Math.min(rmd73, 105000);
            return ((avgQCD * 0.24 * yearsEligible) / 1000).toFixed(0);
          })()}K
        </div>
        <div className="text-xs text-slate-400 mt-1">Age 70.5-90 (if charitable)</div>
      </div>

      <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-500/30 rounded-lg p-4">
        <div className="text-xs text-slate-400 mb-1">Asset Location Benefit</div>
        <div className="text-2xl font-bold text-blue-400">
          +0.8%
        </div>
        <div className="text-xs text-slate-400 mt-1">Annual alpha from tax efficiency</div>
      </div>

      <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-500/30 rounded-lg p-4">
        <div className="text-xs text-slate-400 mb-1">Tax-Loss Harvesting</div>
        <div className="text-2xl font-bold text-purple-400">
          $3K-$100K
        </div>
        <div className="text-xs text-slate-400 mt-1">Annual deduction potential</div>
      </div>

      <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/40 border border-amber-500/30 rounded-lg p-4">
        <div className="text-xs text-slate-400 mb-1">IRMAA Threshold Risk</div>
        <div className="text-2xl font-bold text-amber-400">
          ${(() => {
            const rmd73 = iraAmount / 26.5;
            const divs = taxableAmount * 0.025;
            const totalIncome = rmd73 + divs + 55000;
            return totalIncome > 206000 ? '8K/yr' : 'Safe';
          })()}
        </div>
        <div className="text-xs text-slate-400 mt-1">Medicare surcharge at age 65+</div>
      </div>
    </div>

    {/* Current Tax Situation */}
    <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <span className="text-2xl mr-2">📊</span>
        Your Current Tax Situation (Age 73 Projection)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 className="font-semibold text-blue-300 mb-2">Income Sources</h4>
          <div className="space-y-1 text-sm">
            {(() => {
              const divs = taxableAmount * 0.025;
              const rmd = iraAmount / 26.5;
              const ss = 55000;
              return (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dividends:</span>
                    <span className="text-white">${(divs / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RMDs:</span>
                    <span className="text-white">${(rmd / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Social Security:</span>
                    <span className="text-white">${(ss / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-600 pt-1 mt-1 font-bold">
                    <span className="text-slate-300">Total AGI:</span>
                    <span className="text-green-400">${((divs + rmd + ss * 0.85) / 1000).toFixed(0)}K</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-amber-300 mb-2">Tax Bracket</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Current bracket:</span>
              <span className="text-white">24%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">LTCG rate:</span>
              <span className="text-white">15%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">State tax:</span>
              <span className="text-white">~5%</span>
            </div>
            <div className="flex justify-between border-t border-slate-600 pt-1 mt-1 font-bold">
              <span className="text-slate-300">Effective rate:</span>
              <span className="text-amber-400">~19%</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-red-300 mb-2">IRMAA Risk</h4>
          <div className="space-y-1 text-sm">
            {(() => {
              const agi = (taxableAmount * 0.025) + (iraAmount / 26.5) + (55000 * 0.85);
              const threshold1 = 206000;
              const threshold2 = 258000;
              const threshold3 = 322000;
              const threshold4 = 386000;
              const surcharge = agi > threshold4 ? 419 : agi > threshold3 ? 335 : agi > threshold2 ? 251 : agi > threshold1 ? 167 : 0;
              
              return (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Projected AGI:</span>
                    <span className="text-white">${(agi / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Safe threshold:</span>
                    <span className="text-white">$206K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly surcharge:</span>
                    <span className={surcharge > 0 ? 'text-red-400' : 'text-green-400'}>
                      ${surcharge > 0 ? surcharge : 0}/mo
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-600 pt-1 mt-1 font-bold">
                    <span className="text-slate-300">Annual IRMAA:</span>
                    <span className={surcharge > 0 ? 'text-red-400 font-bold' : 'text-green-400'}>
                      ${surcharge > 0 ? ((surcharge * 12 * 2) / 1000).toFixed(1) + 'K' : 'None'}
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>

    {/* 8 CHARITABLE STRATEGIES */}
    <div className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 border border-indigo-500/30 rounded-lg p-6">
      <h3 className="text-2xl font-semibold mb-4 flex items-center">
        <span className="text-3xl mr-2">💝</span>
        8 Charitable Contribution Strategies
      </h3>
      <p className="text-slate-300 text-sm mb-6">
        These strategies can offset RMDs, reduce IRMAA surcharges, and provide significant tax savings while supporting causes you care about.
      </p>
      
      <div className="space-y-6">
        {/* Strategy 1: QCDs */}
        <div className="bg-slate-800/70 rounded-lg p-5 border-l-4 border-indigo-500">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="text-xl font-bold text-indigo-300">1. Qualified Charitable Distributions (QCDs)</h4>
              <div className="text-xs text-slate-400 mt-1">
                Age: 70.5+ | Limit: $105,000/year | Tax Bracket: All
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-400 font-semibold">Potential Savings</div>
              <div className="text-2xl font-bold text-green-400">
                ${(() => {
                  const rmd = iraAmount / 26.5;
                  const qcd = Math.min(rmd, 105000);
                  return ((qcd * 0.24) / 1000).toFixed(1);
                })()}K/year
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-indigo-900/30 rounded p-3">
              <div className="font-semibold text-indigo-200 mb-2">💡 How It Works:</div>
              <p className="text-sm text-slate-300">
                Donate directly from your IRA to a qualified charity. The distribution counts toward your RMD but is NOT included in your taxable income. This is the #1 strategy for anyone age 70.5+ who gives to charity.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-green-900/20 rounded p-3">
                <div className="font-semibold text-green-300 mb-1 text-sm">✓ Benefits:</div>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• Satisfies RMD requirement</li>
                  <li>• Reduces AGI (helps avoid IRMAA)</li>
                  <li>• No need to itemize deductions</li>
                  <li>• Simple process (IRA → Charity direct)</li>
                  <li>• Can split among multiple charities</li>
                </ul>
              </div>
              
              <div className="bg-amber-900/20 rounded p-3">
                <div className="font-semibold text-amber-300 mb-1 text-sm">⚠️ Rules & Limits:</div>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• Must be age 70.5 or older</li>
                  <li>• $105,000 max per person per year</li>
                  <li>• Must go directly to charity (not DAF)</li>
                  <li>• Only from IRA (not 401k)</li>
                  <li>• Charity must be 501(c)(3)</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-900/20 rounded p-3">
              <div className="font-semibold text-blue-300 mb-2 text-sm">📝 Your Specific Example:</div>
              <div className="text-sm text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Age 73 RMD:</span>
                  <span className="font-bold">${(iraAmount / 26.5 / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between">
                  <span>Maximum QCD:</span>
                  <span className="font-bold">$105K</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax bracket:</span>
                  <span className="font-bold">24%</span>
                </div>
                <div className="flex justify-between border-t border-blue-600/30 pt-1 mt-1">
                  <span className="font-bold">Annual tax savings:</span>
                  <span className="font-bold text-green-400">${(Math.min(iraAmount / 26.5, 105000) * 0.24 / 1000).toFixed(1)}K</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Lifetime savings (age 70.5-90):</span>
                  <span className="font-bold text-green-400">${(Math.min(iraAmount / 26.5, 105000) * 0.24 * 19.5 / 1000).toFixed(0)}K</span>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-900/20 rounded p-3">
              <div className="font-semibold text-purple-300 mb-2 text-sm">🎯 Pro Tips:</div>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>• <strong>Start at 70.5, not 73:</strong> You can do QCDs 2.5 years before RMDs begin!</li>
                <li>• <strong>Use instead of itemizing:</strong> If you take standard deduction, QCD gives you a "free" charitable deduction</li>
                <li>• <strong>Time it right:</strong> Do QCD before year-end RMD to avoid excess withdrawal</li>
                <li>• <strong>Keep records:</strong> Get written acknowledgment from charity (IRS requirement)</li>
                <li>• <strong>Direct transfer:</strong> Have IRA custodian send check directly to charity (never touch the money yourself)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Strategy 2: DAF */}
        <div className="bg-slate-800/70 rounded-lg p-5 border-l-4 border-blue-500">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="text-xl font-bold text-blue-300">2. Donor-Advised Fund (DAF)</h4>
              <div className="text-xs text-slate-400 mt-1">
                Age: Any | Limit: 60% of AGI | Tax Bracket: High earners
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-400 font-semibold">One-Time Benefit</div>
              <div className="text-2xl font-bold text-green-400">$36K+</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-blue-900/30 rounded p-3">
              <div className="font-semibold text-blue-200 mb-2">💡 How It Works:</div>
              <p className="text-sm text-slate-300">
                Contribute appreciated stock to a DAF in a high-income year. Get immediate tax deduction at fair market value, avoid capital gains tax, and the DAF grows tax-free. Distribute to charities over time. Perfect for "bunching" deductions to exceed standard deduction threshold.
              </p>
            </div>
            
            <div className="bg-blue-900/20 rounded p-3">
              <div className="font-semibold text-blue-300 mb-2 text-sm">📊 Example: $100K Stock Contribution</div>
              <div className="text-sm text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Stock value (FMV):</span>
                  <span>$100,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost basis:</span>
                  <span>$20,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Capital gain avoided:</span>
                  <span className="text-green-400">$80,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Cap gains tax saved (15%):</span>
                  <span className="text-green-400 font-bold">$12,000</span>
                </div>
                <div className="flex justify-between border-t border-blue-600/30 pt-1 mt-1">
                  <span>Income tax deduction:</span>
                  <span className="text-green-400">$100,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax savings (24% bracket):</span>
                  <span className="text-green-400 font-bold">$24,000</span>
                </div>
                <div className="flex justify-between border-t border-blue-600/30 pt-1 mt-1 font-bold">
                  <span>Total benefit:</span>
                  <span className="text-green-400 text-lg">$36,000</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-green-900/20 rounded p-3">
                <div className="font-semibold text-green-300 mb-1 text-sm">✓ Best For:</div>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• High-income years (stock sale, bonus, conversion)</li>
                  <li>• Highly appreciated stock (low basis)</li>
                  <li>• Want to give $10K+ to charity over time</li>
                  <li>• Exceed standard deduction when bunching</li>
                </ul>
              </div>
              
              <div className="bg-purple-900/20 rounded p-3">
                <div className="font-semibold text-purple-300 mb-1 text-sm">🎯 Strategy:</div>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• Front-load 2-3 years of giving into one year</li>
                  <li>• Itemize that year (exceed standard deduction)</li>
                  <li>• Take standard deduction other years</li>
                  <li>• Distribute from DAF annually to charities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy 3: CRT */}
        <div className="bg-slate-800/70 rounded-lg p-5 border-l-4 border-green-500">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="text-xl font-bold text-green-300">3. Charitable Remainder Trust (CRT)</h4>
              <div className="text-xs text-slate-400 mt-1">
                Age: Any | Minimum: $500K+ | Best for: Highly appreciated assets
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-400 font-semibold">For Appreciated Assets</div>
              <div className="text-lg font-bold text-green-400">$100K+/year</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-green-900/30 rounded p-3">
              <div className="font-semibold text-green-200 mb-2">💡 How It Works:</div>
              <p className="text-sm text-slate-300">
                Transfer highly appreciated assets (real estate, stock) to an irrevocable trust. Receive income for life (5-50% annually). Trust pays NO capital gains tax on sale. Remainder goes to charity at death. Great for converting illiquid/appreciated assets into income stream.
              </p>
            </div>
            
            <div className="bg-green-900/20 rounded p-3">
              <div className="font-semibold text-green-300 mb-2 text-sm">📊 Example: $2M Real Estate</div>
              <div className="text-sm text-slate-300 space-y-1">
                <div>Transfer $2M property (basis $200K) to CRT:</div>
                <div className="flex justify-between">
                  <span>Capital gain avoided:</span>
                  <span className="text-green-400 font-bold">$1.8M</span>
                </div>
                <div className="flex justify-between">
                  <span>Cap gains tax saved (20% + 3.8% NII):</span>
                  <span className="text-green-400 font-bold">$428K</span>
                </div>
                <div className="flex justify-between">
                  <span>Immediate income tax deduction:</span>
                  <span className="text-green-400 font-bold">~$600K</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual income (5% payout):</span>
                  <span className="text-green-400 font-bold">$100K/year for life</span>
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Trust grows tax-free, charity gets remainder at death
                </div>
              </div>
            </div>
            
            <div className="bg-amber-900/20 rounded p-3">
              <div className="font-semibold text-amber-300 mb-1 text-sm">⚠️ Considerations:</div>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>• Irrevocable - can't get assets back</li>
                <li>• Setup costs $3K-$10K (lawyer required)</li>
                <li>• Annual admin fees ~1% of assets</li>
                <li>• Best for $500K+ transfers</li>
                <li>• Complex - need professional guidance</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Strategy 4: CLT */}
        <div className="bg-slate-800/70 rounded-lg p-5 border-l-4 border-purple-500">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="text-xl font-bold text-purple-300">4. Charitable Lead Trust (CLT)</h4>
              <div className="text-xs text-slate-400 mt-1">
                Age: Any | Minimum: $1M+ | Best for: Estate planning
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-400 font-semibold">Estate Tax Savings</div>
              <div className="text-lg font-bold text-green-400">$4M+</div>
            </div>
          </div>
          
          <div className="bg-purple-900/30 rounded p-3">
            <p className="text-sm text-slate-300 mb-2">
              <strong>For wealthy estates ($10M+):</strong> Charity receives income stream for X years, then assets pass to heirs. All appreciation passes estate-tax-free. Essentially "freeze" asset value for estate tax purposes while it grows.
            </p>
            <div className="text-xs text-slate-400">
              Example: $5M stock → charity gets $250K/year × 10 years → stock grows to $12M → heirs receive $12M estate-tax-free (saved ~$4.8M in estate tax at 40% rate)
            </div>
          </div>
        </div>

        {/* Strategy 5-8: Shorter descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/70 rounded-lg p-4 border-l-4 border-amber-500">
            <h4 className="text-lg font-bold text-amber-300 mb-2">5. Real Estate Depreciation</h4>
            <p className="text-sm text-slate-300 mb-2">
              Rental property: $2M ÷ 27.5 years = $72K annual depreciation. Offsets passive income (or all income if "real estate professional"). Can offset {((72000 / (iraAmount / 26.5)) * 100).toFixed(0)}% of your RMD.
            </p>
            <div className="text-xs text-amber-200">
              Savings: $17K/year (at 24% bracket)
            </div>
          </div>

          <div className="bg-slate-800/70 rounded-lg p-4 border-l-4 border-orange-500">
            <h4 className="text-lg font-bold text-orange-300 mb-2">6. Oil & Gas Partnerships</h4>
            <p className="text-sm text-slate-300 mb-2">
              Intangible drilling costs (IDC) are 70-85% deductible immediately. $200K investment → $140-170K deduction → $33-40K tax savings (24% bracket). HIGH RISK - sophisticated investors only.
            </p>
            <div className="text-xs text-orange-200">
              For offsetting one-time high income events
            </div>
          </div>

          <div className="bg-slate-800/70 rounded-lg p-4 border-l-4 border-cyan-500">
            <h4 className="text-lg font-bold text-cyan-300 mb-2">7. Opportunity Zones</h4>
            <p className="text-sm text-slate-300 mb-2">
              Defer capital gains by investing in designated OZ. 10% basis step-up after 5 years, 15% after 7 years. Hold 10+ years = all OZ appreciation is TAX-FREE.
            </p>
            <div className="text-xs text-cyan-200">
              Best for long-term capital gains ($500K+)
            </div>
          </div>

          <div className="bg-slate-800/70 rounded-lg p-4 border-l-4 border-pink-500">
            <h4 className="text-lg font-bold text-pink-300 mb-2">8. Charitable Bequests (Estate)</h4>
            <p className="text-sm text-slate-300 mb-2">
              Leave IRA to charity (they pay 0% tax), leave taxable to heirs (step-up basis). IRA to heirs = 60-70% total tax. $2M IRA → charity gets $2M, heirs avoid $1.2M+ tax hit.
            </p>
            <div className="text-xs text-pink-200">
              40% estate tax deduction for charitable bequest
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* 4 REAL ESTATE STRATEGIES */}
    <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/40 border border-amber-500/30 rounded-lg p-6">
      <h3 className="text-2xl font-semibold mb-4 flex items-center">
        <span className="text-3xl mr-2">🏠</span>
        4 Real Estate Tax Deduction Strategies
      </h3>
      <p className="text-slate-300 text-sm mb-6">
        Real estate offers unique tax advantages that can offset RMDs, reduce ordinary income, and defer capital gains indefinitely.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cost Segregation */}
        <div className="bg-slate-800/70 rounded-lg p-5 border-l-4 border-amber-500">
          <h4 className="text-xl font-bold text-amber-300 mb-3">1. Cost Segregation Study</h4>
          
          <div className="space-y-3">
            <div className="bg-amber-900/30 rounded p-3">
              <div className="font-semibold text-amber-200 mb-2">💡 How It Works:</div>
              <p className="text-sm text-slate-300">
                Engineering study reclassifies building components from 27.5-year (residential) or 39-year (commercial) to 5, 7, or 15-year property. Carpet, lighting, landscaping, parking lots all get shorter lives = front-loaded deductions.
              </p>
            </div>
            
            <div className="bg-amber-900/20 rounded p-3">
              <div className="font-semibold text-amber-300 mb-2 text-sm">📊 Example:</div>
              <div className="text-sm text-slate-300 space-y-1">
                <div>$1M commercial property:</div>
                <div className="flex justify-between">
                  <span>Normal depreciation:</span>
                  <span>$25K/year (39 years)</span>
                </div>
                <div className="flex justify-between border-t border-amber-600/30 pt-1">
                  <span className="font-bold">With cost seg:</span>
                  <span className="text-green-400 font-bold">$100K+ year 1</span>
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  40% reclassified to 5-year, 30% to 7-year, 30% remains 39-year
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-green-900/20 rounded p-2">
                <div className="font-semibold text-green-300 mb-1">✓ Benefits:</div>
                <ul className="text-slate-300 space-y-0.5">
                  <li>• 3-4x deduction year 1</li>
                  <li>• Offset high income year</li>
                  <li>• Cash flow improvement</li>
                </ul>
              </div>
              <div className="bg-amber-900/20 rounded p-2">
                <div className="font-semibold text-amber-300 mb-1">💰 Cost:</div>
                <ul className="text-slate-300 space-y-0.5">
                  <li>• $5K-$15K study fee</li>
                  <li>• Best for $500K+ properties</li>
                  <li>• ROI typically 5-10x cost</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bonus Depreciation */}
        <div className="bg-slate-800/70 rounded-lg p-5 border-l-4 border-yellow-500">
          <h4 className="text-xl font-bold text-yellow-300 mb-3">2. Bonus Depreciation</h4>
          
          <div className="space-y-3">
            <div className="bg-yellow-900/30 rounded p-3">
              <div className="font-semibold text-yellow-200 mb-2">💡 How It Works:</div>
              <p className="text-sm text-slate-300">
                Qualified improvements (QIP) to interior of commercial buildings qualify for 100% immediate expensing. HVAC, roof, fire protection, security systems all eligible. Temporary bonus depreciation phases out (80% in 2023, 60% in 2024...).
              </p>
            </div>
            
            <div className="bg-yellow-900/20 rounded p-3">
              <div className="font-semibold text-yellow-300 mb-2 text-sm">📊 Example:</div>
              <div className="text-sm text-slate-300 space-y-1">
                <div>$200K roof replacement:</div>
                <div className="flex justify-between">
                  <span>Normal (39 years):</span>
                  <span>$5K/year</span>
                </div>
                <div className="flex justify-between border-t border-yellow-600/30 pt-1">
                  <span className="font-bold">With bonus:</span>
                  <span className="text-green-400 font-bold">$200K year 1</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax savings (24%):</span>
                  <span className="text-green-400 font-bold">$48K immediately</span>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-900/20 rounded p-2 text-xs">
              <div className="font-semibold text-purple-300 mb-1">🎯 Strategy:</div>
              <div className="text-slate-300">
                Time major improvements to years with high income (RMDs, stock sales, conversions) to offset tax burden. Combines well with cost segregation.
              </div>
            </div>
          </div>
        </div>

        {/* 1031 Exchange */}
        <div className="bg-slate-800/70 rounded-lg p-5 border-l-4 border-green-500">
          <h4 className="text-xl font-bold text-green-300 mb-3">3. Section 1031 Exchange</h4>
          
          <div className="space-y-3">
            <div className="bg-green-900/30 rounded p-3">
              <div className="font-semibold text-green-200 mb-2">💡 How It Works:</div>
              <p className="text-sm text-slate-300">
                Sell investment property, identify replacement within 45 days, close within 180 days. Pay ZERO capital gains tax. Can repeat indefinitely. Get step-up in basis at death = heirs avoid all deferred gains!
              </p>
            </div>
            
            <div className="bg-green-900/20 rounded p-3">
              <div className="font-semibold text-green-300 mb-2 text-sm">📊 Example:</div>
              <div className="text-sm text-slate-300 space-y-1">
                <div>Sell: $2M property (basis $500K)</div>
                <div className="flex justify-between">
                  <span>Capital gain:</span>
                  <span>$1.5M</span>
                </div>
                <div className="flex justify-between">
                  <span>Depreciation recapture:</span>
                  <span>$300K</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Normal tax (without 1031):</span>
                  <span className="line-through">$375K</span>
                </div>
                <div className="flex justify-between border-t border-green-600/30 pt-1">
                  <span className="font-bold">With 1031 into $2.5M property:</span>
                  <span className="text-green-400 font-bold">$0 tax</span>
                </div>
                <div className="text-xs text-green-200 mt-2">
                  Buy $2.5M property, defer $375K tax, repeat every 5-10 years until death (step-up basis eliminates all deferred gains)
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-green-900/20 rounded p-2">
                <div className="font-semibold text-green-300 mb-1">✓ Rules:</div>
                <ul className="text-slate-300 space-y-0.5">
                  <li>• Like-kind property only</li>
                  <li>• Must use qualified intermediary</li>
                  <li>• 45 days to identify</li>
                  <li>• 180 days to close</li>
                </ul>
              </div>
              <div className="bg-purple-900/20 rounded p-2">
                <div className="font-semibold text-purple-300 mb-1">🎯 Pro Tip:</div>
                <ul className="text-slate-300 space-y-0.5">
                  <li>• Can "trade up" each time</li>
                  <li>• Defer forever until death</li>
                  <li>• Step-up = $0 tax to heirs</li>
                  <li>• Best wealth strategy!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Short-Term Rental Loophole */}
        <div className="bg-slate-800/70 rounded-lg p-5 border-l-4 border-blue-500">
          <h4 className="text-xl font-bold text-blue-300 mb-3">4. Short-Term Rental Loophole</h4>
          
          <div className="space-y-3">
            <div className="bg-blue-900/30 rounded p-3">
              <div className="font-semibold text-blue-200 mb-2">💡 How It Works:</div>
              <p className="text-sm text-slate-300">
                Rent property less than 7 days average stay = considered "active business" not "passive rental." Losses can offset W-2 income, RMDs, pensions if you materially participate (100+ hours, contemporaneous records). Airbnb/VRBO perfect for this.
              </p>
            </div>
            
            <div className="bg-blue-900/20 rounded p-3">
              <div className="font-semibold text-blue-300 mb-2 text-sm">📊 Example:</div>
              <div className="text-sm text-slate-300 space-y-1">
                <div>$500K vacation rental (Airbnb):</div>
                <div className="flex justify-between">
                  <span>Gross rental income:</span>
                  <span>$60K</span>
                </div>
                <div className="flex justify-between">
                  <span>Operating expenses:</span>
                  <span>($40K)</span>
                </div>
                <div className="flex justify-between">
                  <span>Depreciation ($500K ÷ 27.5):</span>
                  <span>($18K)</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost segregation bonus:</span>
                  <span>($62K)</span>
                </div>
                <div className="flex justify-between border-t border-blue-600/30 pt-1 font-bold">
                  <span>Net loss:</span>
                  <span className="text-red-400">($60K)</span>
                </div>
                <div className="flex justify-between border-t border-blue-600/30 pt-1">
                  <span>Can offset RMD:</span>
                  <span className="text-green-400 font-bold">$60K</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax savings (24%):</span>
                  <span className="text-green-400 font-bold">$14K/year</span>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-900/20 rounded p-2 text-xs">
              <div className="font-semibold text-amber-300 mb-1">⚠️ Requirements:</div>
              <div className="text-slate-300 space-y-0.5">
                <div>• Average guest stay less than 7 days (measure annually)</div>
                <div>• Provide "substantial services" (cleaning, breakfast, concierge)</div>
                <div>• Material participation: 100+ hours OR more than anyone else</div>
                <div>• Keep detailed time logs (IRS audits this!)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Additional Tax Strategies */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Tax-Loss Harvesting */}
      <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 border border-red-500/30 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="text-2xl mr-2">📉</span>
          Tax-Loss Harvesting
        </h3>
        <div className="space-y-3">
          <p className="text-sm text-slate-300">
            Sell losing positions to offset gains. $3K annual deduction against ordinary income. Unlimited carryforward.
          </p>
          <div className="bg-red-900/20 rounded p-3 text-sm">
            <div className="font-semibold text-red-300 mb-2">Strategy:</div>
            <ul className="text-slate-300 space-y-1 text-xs">
              <li>• Harvest losses in down markets</li>
              <li>• Replace immediately with similar (not identical) fund</li>
              <li>• Wait 31 days to avoid wash sale</li>
              <li>• Use losses to offset Roth conversion taxes</li>
              <li>• Or offset capital gains from rebalancing</li>
            </ul>
          </div>
          <div className="text-xs text-slate-400">
            Example: Harvest $100K loss → Offset $100K Roth conversion → Save $24K tax
          </div>
        </div>
      </div>

      {/* Asset Location */}
      <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-500/30 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="text-2xl mr-2">🎯</span>
          Asset Location Optimization
        </h3>
        <div className="space-y-3">
          <p className="text-sm text-slate-300">
            Put tax-inefficient assets in tax-advantaged accounts. Worth +0.8% annual alpha.
          </p>
          <div className="bg-green-900/20 rounded p-3 text-sm">
            <div className="font-semibold text-green-300 mb-2">Optimal Placement:</div>
            <div className="space-y-2 text-xs">
              <div>
                <div className="text-blue-300 font-semibold">Taxable account:</div>
                <div className="text-slate-300">• Tax-efficient stock ETFs (VTI, VOO)</div>
                <div className="text-slate-300">• Municipal bonds (if high bracket)</div>
                <div className="text-slate-300">• Qualified dividends (low 15% tax)</div>
              </div>
              <div>
                <div className="text-amber-300 font-semibold">Traditional IRA:</div>
                <div className="text-slate-300">• Bonds (ordinary income)</div>
                <div className="text-slate-300">• REITs (high distributions)</div>
                <div className="text-slate-300">• High-turnover funds</div>
              </div>
              <div>
                <div className="text-green-300 font-semibold">Roth IRA:</div>
                <div className="text-slate-300">• Highest growth assets (QQQ, VUG)</div>
                <div className="text-slate-300">• Small cap value</div>
                <div className="text-slate-300">• Anything with high expected return</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* IRMAA Avoidance */}
    <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 border border-orange-500/30 rounded-lg p-6">
      <h3 className="text-2xl font-semibold mb-4 flex items-center">
        <span className="text-2xl mr-2">⚠️</span>
        IRMAA Thresholds & Avoidance Strategies
      </h3>
      <p className="text-slate-300 text-sm mb-4">
        Income-Related Monthly Adjustment Amount (IRMAA) increases Medicare Part B & D premiums based on income from 2 years prior. Small income increases can trigger large surcharges.
      </p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-orange-900/30">
            <tr className="text-orange-200">
              <th className="text-left py-2 px-3">Income (MAGI)</th>
              <th className="text-right py-2 px-3">Part B</th>
              <th className="text-right py-2 px-3">Part D</th>
              <th className="text-right py-2 px-3">Total/Person</th>
              <th className="text-right py-2 px-3">Couple</th>
            </tr>
          </thead>
          <tbody className="text-white">
            <tr className="border-b border-orange-700/30 bg-green-900/20">
              <td className="py-2 px-3">≤ $206,000</td>
              <td className="text-right py-2 px-3">$174.70</td>
              <td className="text-right py-2 px-3">$0</td>
              <td className="text-right py-2 px-3 font-bold text-green-400">$174.70/mo</td>
              <td className="text-right py-2 px-3 font-bold text-green-400">$349/mo</td>
            </tr>
            <tr className="border-b border-orange-700/30">
              <td className="py-2 px-3">$206,001 - $258,000</td>
              <td className="text-right py-2 px-3">$244.60</td>
              <td className="text-right py-2 px-3">$12.90</td>
              <td className="text-right py-2 px-3 font-bold text-yellow-400">$257.50/mo</td>
              <td className="text-right py-2 px-3 font-bold text-yellow-400">$515/mo</td>
            </tr>
            <tr className="border-b border-orange-700/30">
              <td className="py-2 px-3">$258,001 - $322,000</td>
              <td className="text-right py-2 px-3">$349.40</td>
              <td className="text-right py-2 px-3">$33.30</td>
              <td className="text-right py-2 px-3 font-bold text-orange-400">$382.70/mo</td>
              <td className="text-right py-2 px-3 font-bold text-orange-400">$765/mo</td>
            </tr>
            <tr className="border-b border-orange-700/30">
              <td className="py-2 px-3">$322,001 - $386,000</td>
              <td className="text-right py-2 px-3">$454.20</td>
              <td className="text-right py-2 px-3">$53.80</td>
              <td className="text-right py-2 px-3 font-bold text-orange-400">$508/mo</td>
              <td className="text-right py-2 px-3 font-bold text-orange-400">$1,016/mo</td>
            </tr>
            <tr className="border-b border-orange-700/30 bg-red-900/20">
              <td className="py-2 px-3"> greater than $386,000</td>
              <td className="text-right py-2 px-3">$559.00</td>
              <td className="text-right py-2 px-3">$74.20</td>
              <td className="text-right py-2 px-3 font-bold text-red-400">$633.20/mo</td>
              <td className="text-right py-2 px-3 font-bold text-red-400">$1,266/mo</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-orange-900/20 rounded p-3">
          <div className="font-semibold text-orange-300 mb-2 text-sm">🎯 Avoidance Strategies:</div>
          <ul className="text-xs text-slate-300 space-y-1">
            <li>• Use QCDs to reduce AGI (not RMDs alone)</li>
            <li>• Harvest losses to offset gains</li>
            <li>• Time Roth conversions before age 63 (2-year lookback)</li>
            <li>• Spread large stock sales across years</li>
            <li>• Consider municipal bonds (tax-free income)</li>
          </ul>
        </div>
        
        <div className="bg-red-900/20 rounded p-3">
          <div className="font-semibold text-red-300 mb-2 text-sm">⚠️ Cliff Effect:</div>
          <div className="text-xs text-slate-300">
            <div className="mb-2">Going from $206K to $207K income adds <strong className="text-yellow-400">$83/month ($2K/year)</strong> in surcharges!</div>
            <div>Marginal tax rate at cliffs can exceed <strong className="text-red-400">50%</strong> when combining federal tax + IRMAA + state tax.</div>
          </div>
        </div>
      </div>
    </div>

    {/* QCD Calculator */}
    <div className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 border border-indigo-500/30 rounded-lg p-6">
      <h3 className="text-2xl font-semibold mb-4 flex items-center">
        <span className="text-2xl mr-2">🧮</span>
        QCD Strategy Calculator
      </h3>
      
      {(() => {
        const age73RMD = iraAmount / 26.5;
        const maxQCD = 105000;
        const potentialQCD = Math.min(age73RMD, maxQCD);
        const taxSavings = potentialQCD * 0.24;
        const irmaaSavings = age73RMD > 206000 && (age73RMD - potentialQCD) < 206000 ? 2000 : 0;
        const yearsEligible = 90 - 70.5;
        const lifetimeSavings = taxSavings * yearsEligible + irmaaSavings * 20;
        
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="bg-indigo-900/20 rounded p-4">
                <div className="text-sm text-indigo-300 mb-2">Your Situation at Age 73:</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Required RMD:</span>
                    <span className="text-white font-bold">${(age73RMD / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Maximum QCD:</span>
                    <span className="text-white font-bold">${(maxQCD / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between border-t border-indigo-600/30 pt-2">
                    <span className="text-slate-400">Potential QCD:</span>
                    <span className="text-green-400 font-bold">${(potentialQCD / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Remaining RMD taxable:</span>
                    <span className="text-white">${((age73RMD - potentialQCD) / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-900/20 rounded p-4">
                <div className="text-sm text-green-300 mb-2 font-semibold">Annual Savings:</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Income tax saved (24%):</span>
                    <span className="text-green-400 font-bold">${(taxSavings / 1000).toFixed(1)}K</span>
                  </div>
                  {irmaaSavings > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">IRMAA avoided:</span>
                      <span className="text-green-400 font-bold">$2.0K</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-green-600/30 pt-2 font-bold">
                    <span className="text-slate-300">Total annual savings:</span>
                    <span className="text-green-400 text-lg">${((taxSavings + irmaaSavings) / 1000).toFixed(1)}K</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-purple-900/20 rounded p-4">
                <div className="text-sm text-purple-300 mb-2 font-semibold">Lifetime Impact (Age 70.5-90):</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Years eligible:</span>
                    <span className="text-white">{yearsEligible} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Annual savings:</span>
                    <span className="text-white">${((taxSavings + irmaaSavings) / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="flex justify-between border-t border-purple-600/30 pt-2 font-bold">
                    <span className="text-slate-300">Lifetime savings:</span>
                    <span className="text-green-400 text-2xl">${(lifetimeSavings / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-900/20 rounded p-4">
                <div className="text-sm text-blue-300 mb-2 font-semibold">📋 Action Steps:</div>
                <ol className="text-xs text-slate-300 space-y-1 list-decimal list-inside">
                  <li>Wait until age 70.5 (can start 2.5 years before RMDs!)</li>
                  <li>Choose charities (must be 501(c)(3), not DAF)</li>
                  <li>Contact IRA custodian BEFORE year-end</li>
                  <li>Request direct transfer to charity (never touch funds)</li>
                  <li>Get written acknowledgment from charity</li>
                  <li>Report on tax return (Form 1040, excludes from income)</li>
                </ol>
              </div>
            </div>
          </div>
        );
      })()}
    </div>

    {/* Summary */}
    <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">💡 Key Takeaways</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-green-900/20 rounded p-3">
          <div className="font-semibold text-green-300 mb-2">For Everyone:</div>
          <ul className="text-slate-300 space-y-1 text-xs">
            <li>• Asset location: +0.8% alpha</li>
            <li>• Tax-loss harvesting: $3K-$100K/year</li>
            <li>• QCDs at 70.5+: $25K+/year savings</li>
          </ul>
        </div>
        <div className="bg-blue-900/20 rounded p-3">
          <div className="font-semibold text-blue-300 mb-2">Property Owners:</div>
          <ul className="text-slate-300 space-y-1 text-xs">
            <li>• Cost segregation: 3-4x depreciation year 1</li>
            <li>• 1031 exchange: Defer gains forever</li>
            <li>• STR loophole: Offset ordinary income</li>
          </ul>
        </div>
        <div className="bg-purple-900/20 rounded p-3">
          <div className="font-semibold text-purple-300 mb-2">High Net Worth:</div>
          <ul className="text-slate-300 space-y-1 text-xs">
            <li>• DAF: Front-load giving, avoid cap gains</li>
            <li>• CRT: $100K+/year income for life</li>
            <li>• CLT: Estate tax savings $1M+</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
)}
          {activeTab === 'roth' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Roth Conversion Strategy</h2>
              
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-6 border border-purple-500/30">
                <h3 className="text-xl font-semibold mb-2">
                  {continueAfterRMD ? `${rothTimeline.length}-Year Conversion Plan (to age ${rothTimeline[rothTimeline.length-1]?.age || 80})` : '14-Year Conversion Plan (to age 73)'}
                </h3>
                <p className="text-slate-300 mb-4">Convert ${(conversionAmount / 1000).toFixed(0)}K annually, targeting 24% federal bracket</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-slate-400">Total to Convert</div>
                    <div className="text-2xl font-bold">${((rothTimeline[rothTimeline.length-1]?.cumulativeConverted || iraAmount) / 1000000).toFixed(1)}M</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Federal Tax</div>
                    <div className="text-2xl font-bold text-yellow-400">${(rothTotalFederalTax / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Tax-on-Tax</div>
                    <div className="text-2xl font-bold text-orange-400">${(rothTotalCapitalGainsTax / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Total All-In Cost</div>
                    <div className="text-2xl font-bold text-red-400">${(rothTotalCost / 1000).toFixed(0)}K</div>
                  </div>
                </div>
              </div>

              {/* FRONT-LOADING STRATEGY */}
              {frontLoadConversions && (
                <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border-2 border-orange-600/50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 text-orange-400">🚀 Front-Loading Strategy: Act NOW While Taxes Are Low</h3>
                  <div className="space-y-3 text-sm text-slate-300">
                    <div className="bg-slate-800/50 rounded p-3">
                      <div className="font-semibold mb-2 text-orange-400">Why Front-Load?</div>
                      <ul className="space-y-1 ml-4 text-xs">
                        <li>• <strong>Historical context:</strong> We're in a LOW tax environment right now</li>
                        <li>• <strong>24% bracket</strong> is generous (historically, top rates were 50-90%)</li>
                        <li>• <strong>Federal debt:</strong> $36 trillion and growing - taxes WILL rise</li>
                        <li>• <strong>Better strategy:</strong> Pay 24-32% NOW vs 35-40%+ later</li>
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-800/50 rounded p-3">
                        <div className="font-semibold mb-2 text-green-400">Standard Strategy</div>
                        <div className="text-xs space-y-1">
                          <div>• $250K/year steady</div>
                          <div>• Stays in 24% bracket</div>
                          <div>• 14 years to complete</div>
                          <div>• Total converted: $3.5M</div>
                          <div className="text-green-400 font-semibold mt-1">Total cost: $757K</div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/50 rounded p-3 border border-orange-500/30">
                        <div className="font-semibold mb-2 text-orange-400">Front-Load Strategy ⭐</div>
                        <div className="text-xs space-y-1">
                          <div>• $475K years 1-3 (ages 60-62)</div>
                          <div>• $350K years 4-6 (ages 63-65)</div>
                          <div>• $250K years 7-10 (ages 66-69)</div>
                          <div>• $200K years 11-14 (ages 70-73)</div>
                          <div>• Pushes into 32% bracket early</div>
                          <div>• Total converted: $4.1M+</div>
                          <div className="text-orange-400 font-semibold mt-1">Total cost: $920K</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-orange-900/30 border border-orange-600/50 rounded p-3">
                      <div className="font-semibold mb-2 text-orange-400">The Math:</div>
                      <div className="text-xs space-y-1">
                        <div>• Extra $163K in taxes ($920K vs $757K)</div>
                        <div>• But: Convert extra $600K+ to Roth</div>
                        <div>• Future value of $600K @ 7% for 20 years = <strong className="text-green-400">$2.3M tax-free</strong></div>
                        <div>• If future tax rates rise to 35%, you'd pay $800K+ on that $2.3M</div>
                        <div className="text-green-400 font-semibold mt-2">Net benefit: $640K+ lifetime savings</div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-900/20 border border-yellow-600/30 rounded p-3">
                      <div className="font-semibold mb-2 text-yellow-400">⚠️ Trade-offs to Consider:</div>
                      <ul className="text-xs space-y-1 ml-4">
                        <li>• Higher tax bills years 1-6 (need more cash flow)</li>
                        <li>• May trigger IRMAA Medicare surcharges</li>
                        <li>• Less cash available for other investments</li>
                        <li>• But: Locked in low rates before they rise</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-900/30 border border-blue-600/50 rounded p-3">
                      <div className="font-semibold mb-2 text-blue-400">💡 Recommendation:</div>
                      <p className="text-xs">
                        <strong>Front-load if:</strong> (1) You believe taxes will rise (likely), (2) You have sufficient cash flow to handle $100-120K annual tax bills, and (3) You want to maximize Roth balance for long-term tax-free growth.
                      </p>
                      <p className="text-xs mt-2">
                        <strong>Standard approach if:</strong> (1) You prefer consistent predictable tax bills, (2) Cash flow is tighter, or (3) You're risk-averse about future tax policy.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* WHY STOP AT 73? */}
              <div className="bg-yellow-900/30 border-2 border-yellow-600/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-yellow-400">❓ Why Age 73 (2039)?</h3>
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="bg-slate-800/50 rounded p-3">
                    <div className="font-semibold mb-1">RMDs Start at Age 73</div>
                    <p>In 2039, Required Minimum Distributions (RMDs) begin. The IRS <strong>forces</strong> you to withdraw 3.9% of your IRA, whether you want to or not.</p>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded p-3">
                    <div className="font-semibold mb-1">The Problem with RMDs + Conversions</div>
                    <ul className="space-y-1 ml-4">
                      <li>• RMD + Roth conversion = <strong>double taxable income</strong></li>
                      <li>• Pushes you into 32% or 35% tax bracket (vs 24% now)</li>
                      <li>• Triggers higher Medicare IRMAA premiums (up to $5,800/year extra)</li>
                      <li>• Less efficient than converting earlier at lower rates</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-900/30 border border-green-600/50 rounded p-3">
                    <div className="font-semibold mb-1 text-green-400">✓ But You CAN Continue!</div>
                    <p className="mb-2">Many people DO continue Roth conversions after age 73. It's a trade-off:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="font-semibold text-green-400 mb-1">Benefits of Continuing:</div>
                        <ul className="space-y-1">
                          <li>• Convert more to tax-free Roth</li>
                          <li>• Reduce future RMDs (smaller IRA = smaller RMDs)</li>
                          <li>• Leave tax-free Roth to heirs</li>
                          <li>• Still beats keeping it in traditional IRA</li>
                        </ul>
                      </div>
                      <div>
                        <div className="font-semibold text-red-400 mb-1">Costs of Continuing:</div>
                        <ul className="space-y-1">
                          <li>• Higher tax rate (24% → 32%+)</li>
                          <li>• IRMAA surcharges (Medicare costs)</li>
                          <li>• More "tax-on-tax" from selling stocks</li>
                          <li>• Less efficient than age 60-72</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-900/30 border border-blue-600/50 rounded p-3 mt-3">
                    <div className="font-semibold mb-2 text-blue-400">💡 Recommendation</div>
                    <p><strong>Standard plan:</strong> Convert aggressively ages 60-73, then STOP and let Roth grow tax-free</p>
                    <p className="mt-1"><strong>Extended plan:</strong> Continue ages 73-80 with smaller $200K conversions IF:</p>
                    <ul className="ml-4 mt-1 space-y-1 text-xs">
                      <li>1. You have a large estate and want to maximize Roth for heirs</li>
                      <li>2. You can tolerate 32% tax rate + IRMAA</li>
                      <li>3. You expect to live past 90 (long time for tax-free growth)</li>
                    </ul>
                    <p className="mt-2 text-xs italic">Toggle "Continue after RMDs" above to see the extended plan numbers.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Conversion Timeline</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={rothTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="year" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" tickFormatter={(val) => `$${(val/1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(val) => `$${(val/1000000).toFixed(2)}M`} />
                    <Legend />
                    <Area type="monotone" dataKey="conversion" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Annual Conversion" />
                    <Area type="monotone" dataKey="rmd" stackId="1" stroke="#ef4444" fill="#ef4444" name="RMD (forced)" />
                    <Area type="monotone" dataKey="ira" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Remaining IRA" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="p-2 text-left">Year</th>
                      <th className="p-2 text-left">Age</th>
                      <th className="p-2 text-right">Conversion</th>
                      <th className="p-2 text-right">RMD</th>
                      <th className="p-2 text-right">Tax Rate</th>
                      <th className="p-2 text-right">Federal Tax</th>
                      <th className="p-2 text-right">Cap Gains Tax</th>
                      <th className="p-2 text-right">IRMAA</th>
                      <th className="p-2 text-right">Total Cost</th>
                      <th className="p-2 text-right">Remaining IRA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {rothTimeline.map((row) => (
                      <tr key={row.year} className={`hover:bg-slate-700/50 ${row.age >= 73 ? 'bg-yellow-900/10' : row.taxRate >= 0.32 ? 'bg-orange-900/10' : ''}`}>
                        <td className="p-2">{row.year}</td>
                        <td className="p-2">
                          {row.age}
                          {row.age === 73 && <span className="text-yellow-400 ml-1">★</span>}
                        </td>
                        <td className="p-2 text-right">
                          ${(row.conversion / 1000).toFixed(0)}K
                          {frontLoadConversions && row.conversion >= 350000 && <span className="text-orange-400 ml-1">⚡</span>}
                        </td>
                        <td className="p-2 text-right text-red-400">
                          {row.rmd > 0 ? `$${(row.rmd / 1000).toFixed(0)}K` : '-'}
                        </td>
                        <td className="p-2 text-right">
                          <span className={row.taxRate >= 0.32 ? 'text-orange-400 font-semibold' : 'text-green-400'}>
                            {(row.taxRate * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="p-2 text-right text-yellow-400">${(row.federalTax / 1000).toFixed(0)}K</td>
                        <td className="p-2 text-right text-orange-400">${(row.capitalGainsTax / 1000).toFixed(0)}K</td>
                        <td className="p-2 text-right text-red-400">
                          {row.irmaa > 0 ? `$${(row.irmaa / 1000).toFixed(1)}K` : '-'}
                        </td>
                        <td className="p-2 text-right font-bold text-red-400">${(row.allInCost / 1000).toFixed(0)}K</td>
                        <td className="p-2 text-right">${(row.ira / 1000000).toFixed(2)}M</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-700 font-bold">
                    <tr>
                      <td colSpan="2" className="p-2">TOTALS</td>
                      <td className="p-2 text-right">${(rothTotalConversion / 1000).toFixed(0)}K</td>
                      <td className="p-2 text-right text-red-400">${(rothTotalRMD / 1000).toFixed(0)}K</td>
                      <td className="p-2 text-right">
                        <span className="text-slate-400 text-xs">Avg</span> 
                        <span className={rothTotalFederalTax / rothTotalConversion >= 0.30 ? 'text-orange-400' : 'text-green-400'}>
                          {((rothTotalFederalTax / rothTotalConversion) * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="p-2 text-right text-yellow-400">${(rothTotalFederalTax / 1000).toFixed(0)}K</td>
                      <td className="p-2 text-right text-orange-400">${(rothTotalCapitalGainsTax / 1000).toFixed(0)}K</td>
                      <td className="p-2 text-right text-red-400">${(rothTotalIRMAA / 1000).toFixed(0)}K</td>
                      <td className="p-2 text-right text-red-400">${(rothTotalCost / 1000).toFixed(0)}K</td>
                      <td className="p-2 text-right">${(rothTimeline[rothTimeline.length-1]?.ira / 1000000).toFixed(2)}M</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                <h4 className="font-semibold text-blue-400 mb-2">Why This Strategy Works</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Texas residency: 0% state tax saves ~$80K vs California</li>
                  <li>• Target 24% bracket: Avoid 32%+ marginal rates</li>
                  <li>• Tax-on-tax included: Real all-in cost is shown (not just federal)</li>
                  <li>• IRMAA managed: Keep conversions ≤$250K to control Medicare costs</li>
                  <li>• Age 73 decision point: Stop and let Roth grow, OR continue if estate planning focused</li>
                </ul>
              </div>
              
              <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                <h4 className="font-semibold text-green-400 mb-2">💰 What You Save</h4>
                <div className="text-sm text-slate-300 space-y-2">
                  <p><strong>If you do nothing</strong> (leave in traditional IRA):</p>
                  <ul className="ml-4 space-y-1 text-xs">
                    <li>• RMDs force withdrawals at 32-35% tax rates</li>
                    <li>• Estimated lifetime tax: $1.2M - $1.5M</li>
                    <li>• Social Security may become taxable (adds 85% of SS to income)</li>
                    <li>• Heirs pay income tax on inherited IRA (within 10 years)</li>
                  </ul>
                  <p className="mt-2"><strong>With this Roth strategy:</strong></p>
                  <ul className="ml-4 space-y-1 text-xs">
                    <li>• Total tax cost: ${(rothTotalCost / 1000).toFixed(0)}K all-in</li>
                    <li>• <strong className="text-green-400">Savings: ${(rothSavings / 1000).toFixed(0)}K+ over lifetime</strong></li>
                    <li>• All future growth is tax-free</li>
                    <li>• Heirs inherit tax-free Roth (worth 30-40% more than traditional IRA)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rebalancing' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Rebalancing Strategy Analysis</h2>
              
              <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-red-400 mb-2">⚠️ Why NOT Monthly?</h3>
                <p className="text-sm text-slate-300">
                  Research from Vanguard shows that monthly rebalancing provides <strong>ZERO benefit</strong> over 
                  quarterly/annual while significantly increasing costs and taxes. You lose 0.5-0.8% annually to unnecessary trading.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Cost Comparison by Frequency</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={rebalancingAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="frequency" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="trades" fill="#ef4444" name="Annual Trades" />
                    <Bar dataKey="costs" fill="#f59e0b" name="Trading Costs ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Net Return After Costs</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={rebalancingAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="frequency" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" domain={[0, 8]} />
                    <Tooltip />
                    <Bar dataKey="netReturn" fill="#10b981" name="Net Return (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-green-400">Quarterly Rebalancing (Recommended)</h4>
                  <div className="text-sm text-slate-300 space-y-2">
                    <div className="flex justify-between">
                      <span>Annual Trades:</span>
                      <span className="font-semibold">32</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trading Costs:</span>
                      <span className="font-semibold">$1,600</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Drag:</span>
                      <span className="font-semibold">0.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Return:</span>
                      <span className="font-semibold text-green-400">7.1%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-yellow-400">5% Drift Trigger</h4>
                  <div className="text-sm text-slate-300 space-y-2">
                    <p>Only rebalance positions that drift &gt;5% from target</p>
                    <p className="text-yellow-400">Example: 10% target → rebalance if &lt;9.5% or &gt;10.5%</p>
                    <p>Benefits:</p>
                    <ul className="ml-4 space-y-1">
                      <li>• Reduces unnecessary trades</li>
                      <li>• Lets winners run (somewhat)</li>
                      <li>• Controls risk without over-trading</li>
                      <li>• Minimizes tax impact</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                <h4 className="font-semibold text-blue-400 mb-2">Optimal Strategy: Quarterly + 5% Triggers</h4>
                <div className="text-sm text-slate-300 space-y-2">
                  <p><strong>Review Schedule:</strong> End of March, June, September, December</p>
                  <p><strong>Action Threshold:</strong> Only rebalance if position drift &gt;5%</p>
                  <p><strong>Execution Priority:</strong></p>
                  <ol className="ml-4 space-y-1">
                    <li>1. Rebalance in IRA first (no tax consequences)</li>
                    <li>2. Use new dividends to buy underweight positions</li>
                    <li>3. Tax-loss harvest in taxable account</li>
                    <li>4. Only then make taxable trades if necessary</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'etfs' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">ETF Portfolio Details</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="p-3 text-left">Ticker</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Category</th>
                      <th className="p-3 text-right">Yield</th>
                      <th className="p-3 text-right">Expense</th>
                      <th className="p-3 text-left">Tax Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {etfDetails.map((etf) => (
                      <tr key={etf.ticker} className="hover:bg-slate-700/50">
                        <td className="p-3">
                          <span className="font-semibold text-blue-400">{etf.ticker}</span>
                        </td>
                        <td className="p-3">{etf.name}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded text-xs bg-slate-600">
                            {etf.category}
                          </span>
                        </td>
                        <td className="p-3 text-right text-green-400 font-semibold">
                          {etf.yield.toFixed(1)}%
                        </td>
                        <td className="p-3 text-right">{etf.expense.toFixed(2)}%</td>
                        <td className="p-3">
                          {etf.taxStatus === 'high' ? (
                            <span className="text-green-400">Taxable OK</span>
                          ) : etf.taxStatus === 'medium' ? (
                            <span className="text-yellow-400">Consider IRA</span>
                          ) : (
                            <span className="text-red-400">IRA Only</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Portfolio Costs</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Weighted Avg Expense Ratio:</span>
                      <span className="font-semibold">0.12%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Annual Expenses on $12.6M:</span>
                      <span className="font-semibold text-yellow-400">$15,120</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Trading Costs (Quarterly):</span>
                      <span className="font-semibold">~$1,600</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Tax Drag:</span>
                      <span className="font-semibold">~0.3%</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-600 pt-2 mt-2">
                      <span className="text-slate-300">Total All-In Costs:</span>
                      <span className="font-semibold text-red-400">0.45%/year</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Asset Location Strategy</h4>
                  <div className="text-sm text-slate-300 space-y-2">
                    <div className="mb-2">
                      <div className="font-semibold text-green-400 mb-1">Taxable Account:</div>
                      <div className="text-xs">VOO, SCHD, VIG, VYM, VTV, VEA, USMV, BND, GLD</div>
                    </div>
                    <div>
                      <div className="font-semibold text-yellow-400 mb-1">IRA/Roth (Tax-Inefficient):</div>
                      <div className="text-xs">VNQ, MTUM, VWO, GSG, VTIP</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                <h4 className="font-semibold text-green-400 mb-2">Tax-Efficiency Ranking</h4>
                <div className="text-sm text-slate-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="font-semibold mb-1 text-green-400">Most Tax-Efficient:</div>
                      <ul className="text-xs space-y-1">
                        <li>• VOO, SCHB (1.3-1.4% yield)</li>
                        <li>• VIG (1.7% qualified)</li>
                        <li>• GLD (no dividends)</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold mb-1 text-yellow-400">Moderately Efficient:</div>
                      <ul className="text-xs space-y-1">
                        <li>• SCHD, VYM (qualified divs)</li>
                        <li>• VTV, VEA (qualified)</li>
                        <li>• BND (ordinary interest)</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold mb-1 text-red-400">Least Efficient (IRA Only):</div>
                      <ul className="text-xs space-y-1">
                        <li>• VNQ (ordinary income)</li>
                        <li>• MTUM (high turnover)</li>
                        <li>• VWO (foreign withholding)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cpa-review' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">CPA Review & Follow-Up Checklist</h2>
                <div className="text-sm text-slate-400">
                  Tax Year {new Date().getFullYear()}
                </div>
              </div>

              {/* Key Tax Deadlines */}
              <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-600/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                  <span>📅</span> Key Tax Deadlines
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-400 mb-3">Quarterly Estimated Taxes</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Q1 (Jan 1 - Mar 31):</span>
                        <span className="font-semibold">April 15</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Q2 (Apr 1 - May 31):</span>
                        <span className="font-semibold">June 15</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Q3 (Jun 1 - Aug 31):</span>
                        <span className="font-semibold">September 15</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Q4 (Sep 1 - Dec 31):</span>
                        <span className="font-semibold">January 15 (next year)</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-400 mb-3">Annual Deadlines</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Roth Conversion Deadline:</span>
                        <span className="font-semibold text-red-400">December 31</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IRA Contribution Deadline:</span>
                        <span className="font-semibold">April 15 (next year)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax Return Filing:</span>
                        <span className="font-semibold">April 15 (next year)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>RMD Deadline (if applicable):</span>
                        <span className="font-semibold text-red-400">December 31</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pre-CPA Meeting Checklist */}
              <div className="bg-slate-700/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                  <span>📋</span> Pre-CPA Meeting Preparation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-400 mb-3">Documents to Gather</h4>
                    <div className="space-y-2 text-sm">
                      {[
                        'W-2s from all employers',
                        '1099-DIV (dividend income)',
                        '1099-INT (interest income)',
                        '1099-B (brokerage sales)',
                        '1099-R (retirement distributions)',
                        '1099-MISC (other income)',
                        'K-1s (partnership/trust income)',
                        'Property tax statements',
                        'Mortgage interest statements (1098)',
                        'Charitable contribution receipts',
                        'Medical expense receipts',
                        'State tax payment records'
                      ].map((item, idx) => (
                        <label key={idx} className="flex items-center gap-2 hover:bg-slate-600/30 p-2 rounded cursor-pointer">
                          <input type="checkbox" className="w-4 h-4" />
                          <span className="text-slate-300">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-400 mb-3">Questions to Discuss</h4>
                    <div className="space-y-2 text-sm">
                      {[
                        'Optimal Roth conversion amount for this year?',
                        'Should I pre-pay state taxes in December?',
                        'Are quarterly estimates on track?',
                        'QCD strategy for next year (if 70½+)?',
                        'Tax-loss harvesting opportunities?',
                        'IRMAA bracket management?',
                        'Should I bunch charitable contributions?',
                        'Real estate tax payment timing?',
                        'AMT exposure for this year?',
                        'Capital gains realization strategy?',
                        'Health insurance premium deductions?',
                        'Investment interest expense deduction?'
                      ].map((item, idx) => (
                        <label key={idx} className="flex items-center gap-2 hover:bg-slate-600/30 p-2 rounded cursor-pointer">
                          <input type="checkbox" className="w-4 h-4" />
                          <span className="text-slate-300">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Year-End Tax Planning Opportunities */}
              <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-600/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                  <span>💡</span> Year-End Tax Planning Opportunities (Before Dec 31)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-400 mb-3">Roth Conversions</h4>
                    <div className="text-sm text-slate-300 space-y-2">
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Calculate remaining capacity in current tax bracket</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Execute conversion before Dec 31</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Review IRMAA threshold impact</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Set aside cash for tax payment</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-400 mb-3">Charitable Giving</h4>
                    <div className="text-sm text-slate-300 space-y-2">
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>QCD from IRA (if 70½+, up to $105,000)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Donate appreciated securities (avoid cap gains)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Bunch contributions into DAF</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Get receipt/acknowledgment letters</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-400 mb-3">Capital Gains/Losses</h4>
                    <div className="text-sm text-slate-300 space-y-2">
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Harvest tax losses to offset gains</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Realize gains at 0% bracket (if applicable)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Avoid wash sales (30-day rule)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Review cost basis elections</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-400 mb-3">Retirement Accounts</h4>
                    <div className="text-sm text-slate-300 space-y-2">
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Take RMD if 73+ (by Dec 31)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Max out 401(k) contributions</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Consider backdoor Roth (if applicable)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Review beneficiary designations</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-400 mb-3">Deduction Timing</h4>
                    <div className="text-sm text-slate-300 space-y-2">
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Prepay Jan property tax in Dec?</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Prepay state income tax Q1 estimate?</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Accelerate medical expenses?</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Make Jan mortgage payment in Dec?</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-400 mb-3">Business/Self-Employment</h4>
                    <div className="text-sm text-slate-300 space-y-2">
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Accelerate/defer business income</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Buy equipment (Section 179/Bonus)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Maximize SEP-IRA/Solo 401(k)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" className="mt-1" />
                        <span>Document home office expenses</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post-Meeting Follow-Up Actions */}
              <div className="bg-slate-700/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                  <span>✅</span> Post-CPA Meeting Action Items
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-yellow-400 mb-3">Immediate Actions (Within 1 Week)</h4>
                    <div className="space-y-2 text-sm">
                      {[
                        'Execute agreed-upon Roth conversion',
                        'Make quarterly estimated tax payment',
                        'Initiate QCD to charity (if recommended)',
                        'Complete tax-loss harvesting trades',
                        'Update withholding (W-4 or 1099)',
                        'Schedule follow-up meeting date',
                        'Implement recommended charitable strategy'
                      ].map((item, idx) => (
                        <label key={idx} className="flex items-center gap-2 hover:bg-slate-600/30 p-2 rounded cursor-pointer">
                          <input type="checkbox" className="w-4 h-4" />
                          <span className="text-slate-300">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-400 mb-3">Ongoing Monitoring (Throughout Year)</h4>
                    <div className="space-y-2 text-sm">
                      {[
                        'Track income against projections',
                        'Monitor capital gains/losses realized',
                        'Review quarterly estimate adequacy',
                        'Watch for IRMAA threshold proximity',
                        'Keep charitable contribution records',
                        'Document business expenses monthly',
                        'Review portfolio tax efficiency',
                        'Schedule Q4 tax planning call',
                        'Update financial plan quarterly'
                      ].map((item, idx) => (
                        <label key={idx} className="flex items-center gap-2 hover:bg-slate-600/30 p-2 rounded cursor-pointer">
                          <input type="checkbox" className="w-4 h-4" />
                          <span className="text-slate-300">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Tax Situation Summary (from other tabs) */}
              <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-600/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                  <span>📊</span> Current Tax Planning Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Roth Conversion Plan</h4>
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      ${(conversionAmount / 1000).toFixed(0)}K/year
                    </div>
                    <div className="text-xs text-slate-400">
                      {frontLoadConversions ? 'Front-loaded strategy' : 'Level conversion strategy'}
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Tax Rates</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Federal:</span>
                        <span className="font-semibold">24%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">State:</span>
                        <span className="font-semibold">{stateTaxRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cap Gains:</span>
                        <span className="font-semibold">{capitalGainsRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Portfolio Value</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Taxable:</span>
                        <span className="font-semibold">${(taxableAmount / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">IRA:</span>
                        <span className="font-semibold">${(iraAmount / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-600 pt-1 mt-1">
                        <span className="text-slate-400">Total:</span>
                        <span className="font-semibold text-blue-400">${((taxableAmount + iraAmount) / 1000000).toFixed(1)}M</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="bg-slate-700/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                  <span>📝</span> CPA Meeting Notes & Action Items
                </h3>
                <textarea
                  className="w-full h-40 bg-slate-800 border border-slate-600 rounded-lg p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  placeholder="Document key decisions, action items, and recommendations from your CPA meeting...

Example:
- Agreed to convert $250K to Roth in December
- Will make QCD of $50K to charity instead of cash donation
- Need to harvest ~$30K in losses before year-end
- Schedule Q4 review in November to finalize strategy"
                ></textarea>
              </div>

              {/* Quick Reference Card */}
              <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border border-yellow-600/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">🎯 Quick Reference: Tax-Smart Strategies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-green-400 mb-2">Income Tax Reduction</h4>
                    <ul className="space-y-1 text-slate-300">
                      <li>• Max out retirement contributions (401k, IRA)</li>
                      <li>• HSA contributions ($8,300/family, $4,150/individual)</li>
                      <li>• QCD instead of cash donations (age 70½+)</li>
                      <li>• Bunch itemized deductions in alternating years</li>
                      <li>• Harvest tax losses to offset gains</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-400 mb-2">Capital Gains Management</h4>
                    <ul className="space-y-1 text-slate-300">
                      <li>• Hold investments &gt;1 year (15-20% vs 24-37%)</li>
                      <li>• Donate appreciated stock (avoid cap gains + deduction)</li>
                      <li>• Use tax-loss harvesting strategically</li>
                      <li>• Consider 0% cap gains bracket if income allows</li>
                      <li>• Specific share identification for sales</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-400 mb-2">IRMAA Avoidance (Medicare)</h4>
                    <ul className="space-y-1 text-slate-300">
                      <li>• Single: Keep MAGI under $106,000 (2026)</li>
                      <li>• Married: Keep MAGI under $212,000 (2026)</li>
                      <li>• Time Roth conversions carefully</li>
                      <li>• Manage capital gains realization</li>
                      <li>• File IRMAA appeal if income unusual</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-400 mb-2">Estate & Gift Planning</h4>
                    <ul className="space-y-1 text-slate-300">
                      <li>• Annual gift exclusion: $18,000/person (2024)</li>
                      <li>• Lifetime exemption: $13.61M (2024, sunsets 2025)</li>
                      <li>• Update beneficiary designations regularly</li>
                      <li>• Consider Roth conversions (tax-free to heirs)</li>
                      <li>• Review step-up in basis strategies</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-400 text-sm">
          <p>Interactive Portfolio Strategy Dashboard • Based on Professional Investment Research</p>
          <p className="mt-2">Adjust parameters above to see how different scenarios affect your portfolio performance and alpha generation</p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioStrategyDashboard;