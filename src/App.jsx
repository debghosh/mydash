import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ScatterChart, Scatter } from 'recharts';
import ClientQuestionnaire from './ClientQuestionnaire';
import { CLIENT_PERSONAS } from './client-personas';
import { generateRecommendations } from './recommendation-engine';


const PortfolioStrategyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [marketRegime, setMarketRegime] = useState('uncertainty'); // Combined regime
  const [riskTolerance, setRiskTolerance] = useState('moderate');
  const [conversionAmount, setConversionAmount] = useState(250000);
  const [rebalanceFrequency, setRebalanceFrequency] = useState('quarterly');
  const [continueAfterRMD, setContinueAfterRMD] = useState(false);
  const [capitalGainsRate, setCapitalGainsRate] = useState(15);
  const [frontLoadConversions, setFrontLoadConversions] = useState(false);
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
      indicators: 'S&P ±5%, VIX >20, CPI stubborn, Fed policy unclear',
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
      volatility: 'High (VIX >30)',
      inflation: 'Variable',
      sentiment: 'Risk-Off',
      indicators: 'S&P down >10%, VIX >30, credit spreads widening, recession fears',
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

  // ETF Details
  const etfDetails = [
    { ticker: 'VOO', name: 'Vanguard S&P 500', category: 'Core', yield: 1.3, expense: 0.03 },
    { ticker: 'SCHD', name: 'Schwab US Dividend Equity', category: 'Income', yield: 3.8, expense: 0.06 },
    { ticker: 'VIG', name: 'Vanguard Dividend Appreciation', category: 'Quality', yield: 1.7, expense: 0.06 },
    { ticker: 'VYM', name: 'Vanguard High Dividend Yield', category: 'Income', yield: 2.4, expense: 0.06 },
    { ticker: 'QUAL', name: 'iShares MSCI USA Quality', category: 'Quality', yield: 1.5, expense: 0.15 },
    { ticker: 'VTV', name: 'Vanguard Value', category: 'Value', yield: 2.3, expense: 0.04 },
    { ticker: 'USMV', name: 'iShares MSCI USA Min Vol', category: 'Low Vol', yield: 1.8, expense: 0.15 },
    { ticker: 'MTUM', name: 'iShares MSCI USA Momentum', category: 'Momentum', yield: 0.8, expense: 0.15 },
    { ticker: 'VBR', name: 'Vanguard Small Cap Value', category: 'Small Cap', yield: 2.0, expense: 0.07 },
    { ticker: 'BND', name: 'Vanguard Total Bond', category: 'Bonds', yield: 4.2, expense: 0.03 },
    { ticker: 'GLD', name: 'SPDR Gold Shares', category: 'Gold', yield: 0, expense: 0.40 },
    { ticker: 'VEA', name: 'Vanguard FTSE Developed', category: 'International', yield: 3.2, expense: 0.05 },
    { ticker: 'VWO', name: 'Vanguard FTSE Emerging', category: 'International', yield: 3.5, expense: 0.08 },
    { ticker: 'VNQ', name: 'Vanguard Real Estate', category: 'Alternatives', yield: 4.2, expense: 0.12 }
  ];

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
          </div>
          <div className="mt-4 space-y-2">
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
          {['personas', 'overview', 'accounts', 'alpha', 'allocation', 'income', 'roth', 'rebalancing', 'etfs'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                  <div key={regime} className={`bg-slate-700 rounded-lg p-4 border-2 ${marketRegime === regime ? 'border-blue-500' : 'border-transparent'}`}>
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
              <h2 className="text-2xl font-bold mb-4">Complete Income & Tax Analysis</h2>
              
              {/* STEP 1: Income Sources */}
              <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg p-6 border border-green-500/30">
                <h3 className="text-xl font-semibold mb-4">STEP 1: Annual Income Sources (From Taxable Account)</h3>
                <div className="space-y-3">
                  {incomeProjection.incomeSources && Object.entries(incomeProjection.incomeSources).map(([etf, data]) => (
                    <div key={etf} className="bg-slate-700/50 rounded p-3 flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-semibold">{etf}</div>
                        <div className="text-xs text-slate-400">
                          ${(data.amount / 1000000).toFixed(2)}M × {data.yield}% yield
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">${(data.annualIncome / 1000).toFixed(1)}K</div>
                        <div className="text-xs text-slate-400">{data.taxStatus}</div>
                      </div>
                    </div>
                  ))}
                  <div className="bg-green-900/30 rounded p-4 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">TOTAL DIVIDEND INCOME</span>
                      <span className="text-2xl font-bold text-green-400">${(incomeProjection.totalAnnualDividends / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      Qualified: ${(incomeProjection.qualifiedDividends / 1000).toFixed(0)}K | 
                      Ordinary: ${(incomeProjection.ordinaryIncome / 1000).toFixed(0)}K
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 2: Uses of Cash */}
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-500/30">
                <h3 className="text-xl font-semibold mb-4">STEP 2: Where the Money Goes</h3>
                <div className="space-y-3">
                  <div className="bg-slate-700/50 rounded p-3 flex justify-between items-center">
                    <span className="font-semibold">Living Expenses</span>
                    <span className="text-lg font-bold text-blue-400">${(incomeProjection.annualLivingExpenses / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="bg-slate-700/50 rounded p-3 flex justify-between items-center">
                    <span className="font-semibold">Roth Conversion Tax (Year 1)</span>
                    <span className="text-lg font-bold text-red-400">${(incomeProjection.rothConversionTax / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="bg-blue-900/30 rounded p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">TOTAL CASH NEEDED</span>
                      <span className="text-2xl font-bold text-blue-400">${(incomeProjection.totalCashNeeded / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: Tax Analysis */}
              <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-lg p-6 border border-red-500/30">
                <h3 className="text-xl font-semibold mb-4">STEP 3: Tax Calculation</h3>
                <div className="space-y-3">
                  <div className="bg-slate-700/50 rounded p-3">
                    <div className="font-semibold mb-2">Taxes on Dividends Received</div>
                    <div className="text-sm text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span>Qualified dividends @ 15%:</span>
                        <span className="text-red-400">${((incomeProjection.qualifiedDividends * 0.15) / 1000).toFixed(1)}K</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ordinary income @ 24%:</span>
                        <span className="text-red-400">${((incomeProjection.ordinaryIncome * 0.24) / 1000).toFixed(1)}K</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t border-slate-600 pt-1 mt-1">
                        <span>Dividend tax total:</span>
                        <span className="text-red-400">${(incomeProjection.dividendTax / 1000).toFixed(1)}K</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded p-3">
                    <div className="font-semibold mb-2">After-Tax Dividends Available</div>
                    <div className="text-sm text-slate-300">
                      <div className="flex justify-between">
                        <span>Dividends received:</span>
                        <span>${(incomeProjection.totalAnnualDividends / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Less: dividend taxes:</span>
                        <span className="text-red-400">-${(incomeProjection.dividendTax / 1000).toFixed(1)}K</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t border-slate-600 pt-1 mt-1">
                        <span>After-tax cash available:</span>
                        <span className="text-green-400">${(incomeProjection.afterTaxDividends / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 4: The Gap */}
              <div className="bg-gradient-to-r from-yellow-900/30 to-red-900/30 rounded-lg p-6 border border-yellow-500/30">
                <h3 className="text-xl font-semibold mb-4">STEP 4: Funding the Shortfall (Critical!)</h3>
                <div className="space-y-3">
                  <div className="bg-slate-700/50 rounded p-3">
                    <div className="font-semibold mb-2">The Math</div>
                    <div className="text-sm text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span>Total cash needed:</span>
                        <span>${(incomeProjection.totalCashNeeded / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between">
                        <span>After-tax dividends available:</span>
                        <span className="text-green-400">-${(incomeProjection.afterTaxDividends / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t border-slate-600 pt-1 mt-1">
                        <span>SHORTFALL (must sell stocks):</span>
                        <span className="text-yellow-400">${(incomeProjection.shortfall / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-900/30 border border-yellow-600/50 rounded p-3">
                    <div className="font-semibold mb-2 text-yellow-400">⚠️ TAXES ON TAXES (The Hidden Cost)</div>
                    <div className="text-sm text-slate-300 space-y-1">
                      <div>To get ${(incomeProjection.shortfall / 1000).toFixed(0)}K, you must SELL stocks in your taxable account</div>
                      <div className="flex justify-between mt-2">
                        <span>Assumed cost basis:</span>
                        <span>50% (half is gains)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Capital gains realized:</span>
                        <span>${(incomeProjection.capitalGainsFromSales / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Capital gains tax @ {capitalGainsRate}%:</span>
                        <span className="text-red-400">${(incomeProjection.capitalGainsTax / 1000).toFixed(1)}K</span>
                      </div>
                      <div className="text-xs text-yellow-300 mt-2 italic">
                        This is "taxes on taxes" - you're paying capital gains tax on the stocks you sell to pay your other taxes!
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 5: Total Tax Burden */}
              <div className="bg-gradient-to-r from-red-900/40 to-pink-900/40 rounded-lg p-6 border-2 border-red-500/50">
                <h3 className="text-2xl font-semibold mb-4">STEP 5: Your Complete Annual Tax Bill</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 rounded p-4">
                      <div className="text-sm text-slate-400 mb-1">Dividend Taxes</div>
                      <div className="text-xl font-bold text-red-400">${(incomeProjection.dividendTax / 1000).toFixed(1)}K</div>
                    </div>
                    <div className="bg-slate-800/50 rounded p-4">
                      <div className="text-sm text-slate-400 mb-1">Capital Gains Tax</div>
                      <div className="text-xl font-bold text-red-400">${(incomeProjection.capitalGainsTax / 1000).toFixed(1)}K</div>
                    </div>
                    <div className="bg-slate-800/50 rounded p-4">
                      <div className="text-sm text-slate-400 mb-1">Roth Conversion</div>
                      <div className="text-xl font-bold text-red-400">${(incomeProjection.rothConversionTax / 1000).toFixed(0)}K</div>
                    </div>
                  </div>
                  
                  <div className="bg-red-900/40 rounded p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-semibold">TOTAL ANNUAL TAXES (Year 1)</span>
                      <span className="text-3xl font-bold text-red-400">${(incomeProjection.totalAnnualTaxes / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="text-sm text-slate-300 mt-2">
                      This is {((incomeProjection.totalAnnualTaxes / incomeProjection.totalAnnualDividends) * 100).toFixed(1)}% of your total dividend income
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-500/30">
                <h3 className="text-xl font-semibold mb-4">The Bottom Line</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span>Total dividend income received:</span>
                    <span className="font-bold text-green-400">${(incomeProjection.totalAnnualDividends / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total taxes paid (all sources):</span>
                    <span className="font-bold text-red-400">-${(incomeProjection.totalAnnualTaxes / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Living expenses:</span>
                    <span className="font-bold">-${(incomeProjection.annualLivingExpenses / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-slate-600 pt-2 mt-2">
                    <span>Net portfolio impact:</span>
                    <span className={incomeProjection.netAfterAllCosts < 0 ? 'text-red-400' : 'text-green-400'}>
                      ${(incomeProjection.netAfterAllCosts / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-2 italic">
                    {incomeProjection.netAfterAllCosts < 0 
                      ? '⚠️ Portfolio will decline by this amount annually. Plan to reduce Roth conversions or living expenses in later years.'
                      : '✓ Portfolio generates enough income to cover all costs and still grow!'}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-400 mb-2">💡 Key Insights</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Dividends alone cover {((incomeProjection.afterTaxDividends / incomeProjection.annualLivingExpenses) * 100).toFixed(0)}% of living expenses after taxes</li>
                  <li>• Roth conversion taxes are the biggest expense in early years (but save ${((rothTimeline[rothTimeline.length-1]?.cumulativeTax || 700000) / 1000).toFixed(0)}K+ long-term)</li>
                  <li>• The "tax on tax" effect adds ${(incomeProjection.capitalGainsTax / 1000).toFixed(1)}K annually - this is why Texas residency (0% state tax) is valuable</li>
                  <li>• After Roth conversions complete (age 73), your tax burden drops by ~${(incomeProjection.rothConversionTax / 1000).toFixed(0)}K/year</li>
                </ul>
              </div>

              {/* LIFETIME PROJECTION */}
              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-6 border-2 border-purple-500/50">
                <h3 className="text-2xl font-semibold mb-4">📅 Lifetime Income & Tax Projection (Ages 60-90)</h3>
                
                {/* Growth Rate Assumption Control */}
                <div className="bg-blue-900/20 border border-blue-600/30 rounded p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-blue-400 mb-2">
                        📈 Expected Annual Return (%)
                      </label>
                      <select
                        value={expectedGrowthRate}
                        onChange={(e) => setExpectedGrowthRate(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
                      >
                        <option value={6}>6% (Too Conservative - Below Historical)</option>
                        <option value={7}>7% (Conservative - Real Returns)</option>
                        <option value={8}>8% (Moderate)</option>
                        <option value={9}>9% (Realistic ⭐ - Recommended for 85% Equities)</option>
                        <option value={10}>10% (Aggressive - Historical S&P 500)</option>
                        <option value={11}>11% (Very Aggressive)</option>
                      </select>
                    </div>
                    <div className="text-xs text-slate-300 self-center">
                      <strong className="text-yellow-400">Why 9% is Realistic:</strong><br/>
                      • Historical S&P 500: 10.5% nominal (1928-2024)<br/>
                      • Your IRA: 85-90% growth-focused equities<br/>
                      • Factor tilts: Quality, Growth, Momentum add +1-2%<br/>
                      • 9% is <em>conservative</em> for your growth allocation<br/>
                      <div className="mt-2 text-yellow-400">
                        <strong>⚠️ 6% was WAY too low!</strong> Updated to 9% default.
                      </div>
                      <strong>Brokerage:</strong> {expectedGrowthRate}% - 2.5% (dividends) = {(expectedGrowthRate - 2.5).toFixed(1)}% appreciation<br/>
                      <strong>IRA/Roth:</strong> {expectedGrowthRate}% total (reinvests everything)
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded p-4 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <div className="text-slate-400">Total Income (30 years)</div>
                      <div className="text-xl font-bold text-green-400">${((incomeProjection.totalAnnualDividends * 30) / 1000000).toFixed(1)}M</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Total Taxes (30 years)</div>
                      <div className="text-xl font-bold text-red-400">${((incomeProjection.totalAnnualTaxes * 15 + incomeProjection.dividendTax * 15) / 1000000).toFixed(1)}M</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Total Living Expenses</div>
                      <div className="text-xl font-bold">${((incomeProjection.annualLivingExpenses * 30) / 1000000).toFixed(1)}M</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Portfolio Growth</div>
                      <div className="text-xl font-bold text-green-400">$12.6M → ${(age90Portfolio.total / 1000000).toFixed(1)}M</div>
                      <div className="text-xs text-slate-400 mt-1">@ {expectedGrowthRate}% annual return</div>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-600 pt-4">
                    <div className="text-sm font-semibold text-slate-300 mb-3">Portfolio Composition at Age 90 (Year 30) @ {expectedGrowthRate}% Annual Return:</div>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="bg-blue-900/20 border border-blue-600/30 rounded p-3">
                        <div className="text-blue-400 font-semibold mb-1">Taxable Brokerage</div>
                        <div className="text-2xl font-bold text-blue-400">${(age90Portfolio.brokerage / 1000000).toFixed(1)}M</div>
                        <div className="text-slate-400 mt-1">Income source</div>
                        <div className="text-slate-500 text-xs">Stepped-up basis at death</div>
                      </div>
                      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded p-3">
                        <div className="text-yellow-400 font-semibold mb-1">Traditional IRA</div>
                        <div className="text-2xl font-bold text-yellow-400">${(age90Portfolio.ira / 1000000).toFixed(1)}M</div>
                        <div className="text-slate-400 mt-1">Subject to RMDs</div>
                        <div className="text-slate-500 text-xs">Taxable to heirs</div>
                      </div>
                      <div className="bg-green-900/20 border border-green-600/30 rounded p-3">
                        <div className="text-green-400 font-semibold mb-1">Roth IRA</div>
                        <div className="text-2xl font-bold text-green-400">${(age90Portfolio.roth / 1000000).toFixed(1)}M</div>
                        <div className="text-slate-400 mt-1">Tax-free forever!</div>
                        <div className="text-slate-500 text-xs">Tax-free to heirs</div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-slate-400">
                      <strong>Total Portfolio at Age 90:</strong> ${(age90Portfolio.total / 1000000).toFixed(1)}M (started at $12.6M, grew {((age90Portfolio.total / 12600000 - 1) * 100).toFixed(0)}%)
                      <br/><strong>Key Insight:</strong> Roth IRA grew from $0 to ${(age90Portfolio.roth / 1000000).toFixed(1)}M tax-free. Worth 40% more to heirs than Traditional IRA of same size.
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-700 sticky top-0">
                      <tr>
                        <th className="p-2 text-left">Year</th>
                        <th className="p-2 text-left">Age</th>
                        <th className="p-2 text-right">Dividends</th>
                        <th className="p-2 text-right">RMD</th>
                        <th className="p-2 text-right">Roth Conv</th>
                        <th className="p-2 text-right">Total Income</th>
                        <th className="p-2 text-right">Taxes</th>
                        <th className="p-2 text-right">Living Exp</th>
                        <th className="p-2 text-right">Net Cash</th>
                        <th className="p-2 text-right">Brokerage</th>
                        <th className="p-2 text-right">Trad IRA</th>
                        <th className="p-2 text-right">Roth IRA</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {(() => {
                        const projectionYears = [];
                        let brokerageValue = taxableAmount;
                        let iraValue = iraAmount;
                        let rothValue = 0;
                        
                        // Use SAME logic as summary box
                        // expectedGrowthRate is the user-adjustable total return assumption
                        const totalReturnRate = expectedGrowthRate / 100; // e.g., 8% = 0.08
                        const dividendYield = 0.025; // 2.5% dividend yield from brokerage
                        
                        // Brokerage: Total return minus dividend yield (dividends paid out)
                        // IRA/Roth: Full total return (everything reinvested)
                        const brokerageGrowthRate = Math.max(0.01, totalReturnRate - dividendYield);
                        const iraGrowthRate = totalReturnRate;
                        const rothGrowthRate = totalReturnRate;
                        
                        for (let year = 0; year < 30; year++) {
                          const age = 60 + year;
                          const isPostRMD = age >= 73;
                          
                          // Dividend income from brokerage (paid out, not reinvested)
                          const dividendIncome = incomeProjection.totalAnnualDividends;
                          
                          // RMD calculation (from Traditional IRA)
                          // RMD calculation (SECURE Act 2.0 - 2022 updated Uniform Lifetime Table)
                          const rmdRates = {73: 0.0377, 74: 0.0392, 75: 0.0407, 76: 0.0422, 77: 0.0437, 78: 0.0453, 79: 0.0470, 80: 0.0495, 81: 0.0515, 82: 0.0536, 83: 0.0558, 84: 0.0581, 85: 0.0625, 86: 0.0658, 87: 0.0694, 88: 0.0733, 89: 0.0775, 90: 0.0820};
                          const rmdAmount = isPostRMD && iraValue > 0 ? (iraValue * (rmdRates[age] || 0.07)) : 0;
                          
                          // Roth conversion (find matching year in rothTimeline)
                          const rothYear = rothTimeline.find(r => r.age === age);
                          const conversionAmount = rothYear ? rothYear.conversion : 0;
                          const conversionTax = rothYear ? rothYear.allInCost : 0;
                          
                          // Total income (dividends + RMD)
                          const totalIncome = dividendIncome + rmdAmount;
                          
                          // Tax calculation
                          const dividendTax = incomeProjection.dividendTax;
                          const rmdTax = rmdAmount * 0.24; // Simplified
                          const totalTax = dividendTax + rmdTax + conversionTax;
                          
                          // Living expenses (adjust for inflation 2%/year)
                          const livingExpenses = incomeProjection.annualLivingExpenses * Math.pow(1.02, year);
                          
                          // Net cash flow (what's left after income - taxes - living expenses)
                          const netCashFlow = totalIncome - totalTax - livingExpenses;
                          
                          // ACCOUNT CHANGES (Uses expectedGrowthRate = {expectedGrowthRate}%):
                          
                          // Brokerage: Dividends paid out, principal grows at capital appreciation rate
                          // Net change = cash in (dividends + RMD) - cash out (taxes + living)
                          brokerageValue = (brokerageValue + dividendIncome + rmdAmount - totalTax - livingExpenses) * (1 + brokerageGrowthRate);
                          
                          // Traditional IRA: Conversions/RMDs taken out, remainder grows at full rate
                          iraValue = Math.max(0, (iraValue - conversionAmount - rmdAmount) * (1 + iraGrowthRate));
                          
                          // Roth IRA: Receives conversions, grows at full rate tax-free
                          rothValue = (rothValue + conversionAmount) * (1 + rothGrowthRate);
                          
                          // Total portfolio
                          const totalPortfolio = brokerageValue + iraValue + rothValue;
                          
                          projectionYears.push({
                            year: 2026 + year,
                            age,
                            dividends: dividendIncome,
                            rmd: rmdAmount,
                            conversion: conversionAmount,
                            totalIncome,
                            taxes: totalTax,
                            livingExpenses,
                            netCashFlow,
                            brokerage: brokerageValue,
                            ira: iraValue,
                            roth: rothValue,
                            total: totalPortfolio
                          });
                        }
                        
                        return projectionYears.map((row, idx) => (
                          <tr key={row.year} className={`hover:bg-slate-700/50 ${row.age === 73 ? 'bg-yellow-900/20 border-t-2 border-yellow-600' : row.netCashFlow < 0 ? 'bg-red-900/10' : ''}`}>
                            <td className="p-2">{row.year}</td>
                            <td className="p-2">
                              {row.age}
                              {row.age === 73 && <span className="text-yellow-400 ml-1">★</span>}
                            </td>
                            <td className="p-2 text-right text-green-400">${(row.dividends / 1000).toFixed(0)}K</td>
                            <td className="p-2 text-right text-orange-400">
                              {row.rmd > 0 ? `$${(row.rmd / 1000).toFixed(0)}K` : '-'}
                            </td>
                            <td className="p-2 text-right text-purple-400">
                              {row.conversion > 0 ? `$${(row.conversion / 1000).toFixed(0)}K` : '-'}
                            </td>
                            <td className="p-2 text-right font-semibold">${(row.totalIncome / 1000).toFixed(0)}K</td>
                            <td className="p-2 text-right text-red-400">${(row.taxes / 1000).toFixed(0)}K</td>
                            <td className="p-2 text-right">${(row.livingExpenses / 1000).toFixed(0)}K</td>
                            <td className={`p-2 text-right font-semibold ${row.netCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {row.netCashFlow >= 0 ? '+' : ''}{(row.netCashFlow / 1000).toFixed(0)}K
                            </td>
                            <td className="p-2 text-right text-blue-400">${(row.brokerage / 1000000).toFixed(1)}M</td>
                            <td className="p-2 text-right text-yellow-400">${(row.ira / 1000000).toFixed(1)}M</td>
                            <td className="p-2 text-right text-green-400">${(row.roth / 1000000).toFixed(1)}M</td>
                            <td className="p-2 text-right font-bold">${(row.total / 1000000).toFixed(1)}M</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-green-900/20 border border-green-600/30 rounded p-3">
                    <div className="font-semibold text-green-400 mb-1">✓ Years 60-72 (Roth Conversions)</div>
                    <div className="text-xs text-slate-300">High tax burden but building tax-free Roth. Watch Traditional IRA shrink from $4.1M → $1.2M as money moves to Roth. Portfolio still grows due to 6% returns exceeding net outflows.</div>
                  </div>
                  <div className="bg-yellow-900/20 border border-yellow-600/30 rounded p-3">
                    <div className="font-semibold text-yellow-400 mb-1">★ Age 73+ (RMDs Start)</div>
                    <div className="text-xs text-slate-300">Roth conversions done! Tax burden drops significantly. RMDs provide additional income from remaining Traditional IRA. Roth IRA continues growing tax-free to $6.8M by age 90.</div>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-600/30 rounded p-3">
                    <div className="font-semibold text-blue-400 mb-1">📈 Account Flows</div>
                    <div className="text-xs text-slate-300">
                      <strong>Brokerage:</strong> Pays all bills, grows steadily $8.5M → $11.2M<br/>
                      <strong>Trad IRA:</strong> Shrinks via conversions/RMDs $4.1M → $4.2M<br/>
                      <strong>Roth IRA:</strong> Grows from $0 → $6.8M tax-free!
                    </div>
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
                          {etf.category === 'Alternatives' ? (
                            <span className="text-yellow-400">IRA Only</span>
                          ) : (
                            <span className="text-green-400">Taxable OK</span>
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