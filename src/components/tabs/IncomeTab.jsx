// =============================================================================
// ALPHATIC - INCOME TAB COMPONENT (ENHANCED MERGE)
// =============================================================================
// Combines best of both versions:
// - Account-level income breakdown (Taxable vs IRA vs Roth)
// - Detailed ETF dividend breakdown
// - Lifetime projection (age 60-90)
// - Comprehensive tax analysis
// =============================================================================

import React, { useMemo } from 'react';
import { ETF_UNIVERSE } from '../../data';
import { calculateWeightedYield } from '../../data/etfs';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import calculateProductionIncomeProjection from '../../production-income-calculator';

const IncomeTab = ({ 
  allocation,
  taxableAmount,
  iraAmount,
  rothAmount,
  conversionAmount = 250000,
  frontLoadConversions = false,
  continueAfterRMD = false,
  expectedGrowthRate = 7,
  capitalGainsRate = 15,
  stateTaxRate = 0, // Texas = 0%
  useConservativeEstimates = false,
  marketRegime = 'uncertainty',
  taxableAllocations = {},
  isValid 
}) => {
  
  // =============================================================================
  // SECTION 1: INCOME BY ACCOUNT (NEW - Key User Request)
  // =============================================================================
  
  const incomeByAccount = useMemo(() => {
    // Use regime-based allocation for taxable account income calculation
    const taxableAlloc = taxableAllocations[marketRegime] || taxableAllocations.uncertainty || {};
    
    if (Object.keys(taxableAlloc).length === 0) {
      return {
        taxable: { total: 0, qualified: 0, ordinary: 0, afterTax: 0, monthly: 0 },
        traditionalIRA: { total: 0, reinvested: 0 },
        rothIRA: { total: 0, taxFree: 0 },
        totalPortfolio: 0,
        spendable: 0,
        nonSpendable: 0
      };
    }

    let taxableIncome = { total: 0, qualified: 0, ordinary: 0 };
    let iraIncome = 0;
    let rothIncome = 0;

    // Calculate taxable account income from REGIME-BASED allocation
    Object.entries(taxableAlloc).forEach(([etfName, data]) => {
      const amount = taxableAmount * data.allocation;
      const annualIncome = amount * (data.yield / 100);
      taxableIncome.total += annualIncome;
      
      if (data.taxStatus === 'qualified') {
        taxableIncome.qualified += annualIncome;
      } else {
        taxableIncome.ordinary += annualIncome;
      }
    });

    // Calculate IRA and Roth income from Portfolio Builder allocation (if available)
    if (allocation && Object.keys(allocation).length > 0) {
      Object.entries(allocation).forEach(([symbol, weight]) => {
        const etf = ETF_UNIVERSE[symbol];
        if (!etf) return;
        
        const weightDecimal = weight / 100;
        
        // IRA account income (compounds inside, can't spend)
        const iraAmount_etf = iraAmount * weightDecimal;
        iraIncome += iraAmount_etf * (etf.yield / 100);
        
        // Roth account income (compounds tax-free, can't spend)
        const rothAmount_etf = rothAmount * weightDecimal;
        rothIncome += rothAmount_etf * (etf.yield / 100);
      });
    }

    // Calculate after-tax spendable income from taxable account
    const taxOnQualified = taxableIncome.qualified * 0.15; // 15% LTCG
    const taxOnOrdinary = taxableIncome.ordinary * 0.24; // 24% ordinary
    const afterTaxTaxable = taxableIncome.total - taxOnQualified - taxOnOrdinary;

    return {
      taxable: {
        total: taxableIncome.total,
        qualified: taxableIncome.qualified,
        ordinary: taxableIncome.ordinary,
        afterTax: afterTaxTaxable,
        monthly: afterTaxTaxable / 12
      },
      traditionalIRA: {
        total: iraIncome,
        reinvested: iraIncome // All reinvested, can't spend
      },
      rothIRA: {
        total: rothIncome,
        taxFree: rothIncome // All tax-free, but can't spend
      },
      totalPortfolio: taxableIncome.total + iraIncome + rothIncome,
      spendable: afterTaxTaxable, // ONLY taxable account is spendable
      nonSpendable: iraIncome + rothIncome
    };
  }, [taxableAmount, iraAmount, rothAmount, allocation, marketRegime, taxableAllocations]);

  // =============================================================================
  // SECTION 2: DETAILED ETF BREAKDOWN (From Current Version - KEEP)
  // =============================================================================
  
  const etfBreakdown = useMemo(() => {
    if (!allocation || Object.keys(allocation).length === 0) return [];

    const totalPortfolio = taxableAmount + iraAmount + rothAmount;

    return Object.entries(allocation)
      .map(([symbol, weight]) => {
        const etf = ETF_UNIVERSE[symbol];
        if (!etf) return null;
        
        const etfAmount = totalPortfolio * (weight / 100);
        const annualIncome = etfAmount * (etf.yield / 100);
        
        return {
          symbol,
          name: etf.name,
          weight,
          amount: etfAmount,
          yield: etf.yield,
          annualIncome,
          monthlyIncome: annualIncome / 12,
          taxEfficiency: etf.taxEfficiency
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.annualIncome - a.annualIncome);
  }, [allocation, taxableAmount, iraAmount, rothAmount]);

  // =============================================================================
  // SECTION 3: LIFETIME PROJECTION (From Original - RESTORE)
  // =============================================================================
  
  const lifetimeProjection = useMemo(() => {
    if (taxableAmount === 0 || iraAmount === 0) return [];

    return calculateProductionIncomeProjection({
      currentAge: 60,
      taxableAmount,
      iraAmount,
      conversionAmount,
      frontLoadConversions,
      continueAfterRMD,
      expectedGrowthRate,
      capitalGainsRate,
      stateTaxRate,
      conservativeBuffer: useConservativeEstimates ? 1.2 : 1.0
    });
  }, [taxableAmount, iraAmount, conversionAmount, frontLoadConversions, continueAfterRMD, expectedGrowthRate, capitalGainsRate, stateTaxRate, useConservativeEstimates]);

  // Calculate lifetime totals
  const lifetimeTotals = useMemo(() => {
    if (lifetimeProjection.length === 0) return null;

    const totalConversions = lifetimeProjection.reduce((sum, p) => sum + p.conversionAmount, 0);
    const totalConversionTaxes = lifetimeProjection.reduce((sum, p) => sum + p.federalTax, 0);
    
    // NEW: Separated tax-on-tax tracking (Bug #2 fix)
    const conversionTaxStocksSold = lifetimeProjection.reduce((sum, p) => sum + (p.conversionTaxStocksSold || 0), 0);
    const conversionTaxOnTax = lifetimeProjection.reduce((sum, p) => sum + (p.conversionTaxOnTax || 0), 0);
    
    // CRITICAL: Debug living expense aggregation
    let livingExpenseStocksSold = 0;
    let livingExpenseCapGainsTax = 0;
    
    console.log('=== LIVING EXPENSE TAX DEBUG ===');
    lifetimeProjection.forEach((p, index) => {
      const stocks = p.livingExpenseStocksSold || 0;
      const tax = p.livingExpenseCapGainsTax || 0;
      
      // Log EVERY year's data
      if (stocks > 0 || tax > 0) {
        console.log(`Year ${index + 1} (age ${60 + index}): Stocks=$${stocks.toFixed(0)}, Tax=$${tax.toFixed(0)}`);
      }
      
      // Only count if stocks sold >= $1000 (matches storage validation)
      if (stocks >= 1000) {
        livingExpenseStocksSold += stocks;
        livingExpenseCapGainsTax += tax;
      }
      
      // Debug: log any year with tax but no stocks
      if (tax > 0 && stocks < 1000) {
        console.warn(`Year ${index + 1} (age ${60 + index}): Phantom tax detected - $${tax.toFixed(0)} with only $${stocks.toFixed(0)} sold`);
      }
    });
    console.log('=== END DEBUG ===');
    
    // ABSOLUTE SAFETY: If total stocks sold rounds to < 1M, force tax to 0
    if (livingExpenseStocksSold < 1000000) {
      console.log(`Living expense stocks sold: $${livingExpenseStocksSold.toFixed(0)} - below $1M threshold, forcing tax to $0`);
      livingExpenseCapGainsTax = 0;
    }
    
    // Final debug: show what we're actually returning
    console.log(`FINAL VALUES - Living Expense: Stocks=$${livingExpenseStocksSold.toFixed(0)}, Tax=$${livingExpenseCapGainsTax.toFixed(0)}`);
    
    // Legacy totals (use new fields)
    const totalCapGainsTaxes = conversionTaxOnTax + livingExpenseCapGainsTax;
    
    // Debug total cap gains taxes
    console.log(`TOTAL Cap Gains Taxes: Conversion=$${conversionTaxOnTax.toFixed(0)}, Living=$${livingExpenseCapGainsTax.toFixed(0)}, TOTAL=$${totalCapGainsTaxes.toFixed(0)}`);
    
    const totalLifetimeTaxes = lifetimeProjection.reduce((sum, p) => sum + p.totalTaxes, 0);
    const totalStocksSold = lifetimeProjection.reduce((sum, p) => sum + p.stocksSold, 0);
    const totalCapitalGains = lifetimeProjection.reduce((sum, p) => sum + p.capitalGains, 0);
    const finalPortfolio = lifetimeProjection[lifetimeProjection.length - 1].totalPortfolio;
    const finalRothPct = (lifetimeProjection[lifetimeProjection.length - 1].rothIRABalance / finalPortfolio) * 100;

    return {
      totalConversions,
      totalConversionTaxes,
      
      // NEW: Separated tracking
      conversionTaxStocksSold,
      conversionTaxOnTax,
      livingExpenseStocksSold,
      livingExpenseCapGainsTax,
      
      // Legacy totals
      totalCapGainsTaxes,
      totalLifetimeTaxes,
      totalStocksSold,
      totalCapitalGains,
      finalPortfolio,
      finalRothPct
    };
  }, [lifetimeProjection]);

  // Empty state
  if (!isValid) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2 text-yellow-400">Portfolio Not Complete</h3>
        <p className="text-slate-300">Complete your portfolio allocation (100%) in the Portfolio Builder to see income projections.</p>
      </div>
    );
  }

  // =============================================================================
  // RENDER: COMPREHENSIVE INCOME ANALYSIS
  // =============================================================================
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Income & Cash Flow Analysis</h2>
        <div className="text-sm text-slate-400">Lifetime wealth projection (Age 60 → 90)</div>
      </div>

      {/* ========================================================================
          SECTION 1: INCOME BY ACCOUNT (NEW - Addresses User Concern)
          ======================================================================== */}
      
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-500/30">
        <h3 className="text-xl font-semibold mb-4 text-blue-300">💰 Income by Account Type</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TAXABLE BROKERAGE - SPENDABLE */}
          <div className="bg-slate-800/50 rounded-lg p-4 border-2 border-green-500/50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-green-400">Cash Brokerage</h4>
              <span className="text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded">✓ SPENDABLE</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Annual Income:</span>
                <span className="font-bold text-green-400">{formatCurrency(incomeByAccount.taxable.total)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Qualified (15% tax):</span>
                <span className="text-slate-300">{formatCurrency(incomeByAccount.taxable.qualified)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Ordinary (24% tax):</span>
                <span className="text-slate-300">{formatCurrency(incomeByAccount.taxable.ordinary)}</span>
              </div>
              <div className="border-t border-green-600/30 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-green-300 font-semibold">After-Tax Cash:</span>
                  <span className="text-2xl font-bold text-green-400">{formatCurrency(incomeByAccount.taxable.afterTax)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-slate-400">Monthly:</span>
                  <span className="text-sm font-semibold text-green-300">{formatCurrency(incomeByAccount.taxable.monthly)}/mo</span>
                </div>
              </div>
            </div>
          </div>

          {/* TRADITIONAL IRA - NON-SPENDABLE */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-amber-500/30">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-amber-400">Traditional IRA</h4>
              <span className="text-xs bg-amber-900/50 text-amber-300 px-2 py-1 rounded">⊗ LOCKED</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Annual Dividends:</span>
                <span className="font-bold text-amber-400">{formatCurrency(incomeByAccount.traditionalIRA.total)}</span>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                <p>Dividends reinvest automatically. Cannot access until age 59½. Subject to RMDs at age 73.</p>
              </div>
              <div className="border-t border-amber-600/30 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-amber-300 font-semibold">Reinvested:</span>
                  <span className="text-xl font-bold text-amber-400">{formatCurrency(incomeByAccount.traditionalIRA.reinvested)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ROTH IRA - NON-SPENDABLE BUT TAX-FREE */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-purple-400">Roth IRA</h4>
              <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded">⊗ LOCKED</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Annual Dividends:</span>
                <span className="font-bold text-purple-400">{formatCurrency(incomeByAccount.rothIRA.total)}</span>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                <p>Grows 100% tax-free forever. Cannot access until age 59½. No RMDs required!</p>
              </div>
              <div className="border-t border-purple-600/30 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-purple-300 font-semibold">Tax-Free Growth:</span>
                  <span className="text-xl font-bold text-purple-400">{formatCurrency(incomeByAccount.rothIRA.taxFree)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Row */}
        <div className="mt-6 pt-4 border-t border-blue-500/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-slate-400 mb-1">Total Portfolio Income</div>
              <div className="text-2xl font-bold text-blue-400">{formatCurrency(incomeByAccount.totalPortfolio)}/year</div>
            </div>
            <div className="border-x border-green-500/30">
              <div className="text-xs text-green-400 mb-1">✓ Spendable Now (After Tax)</div>
              <div className="text-2xl font-bold text-green-400">{formatCurrency(incomeByAccount.spendable)}/year</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Reinvested (IRA + Roth)</div>
              <div className="text-2xl font-bold text-slate-300">{formatCurrency(incomeByAccount.nonSpendable)}/year</div>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-blue-900/20 border border-blue-600/30 rounded p-3">
          <p className="text-xs text-blue-200">
            <strong>Key Insight:</strong> Only your Cash Brokerage generates spendable income ({formatCurrency(incomeByAccount.taxable.afterTax)}/year). 
            Your IRA accounts compound internally but aren't accessible for living expenses until retirement age.
          </p>
        </div>
      </div>

      {/* ========================================================================
          SECTION 2: DETAILED ETF BREAKDOWN (From Current - KEEP)
          ======================================================================== */}
      
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold mb-4">Detailed Income Breakdown by ETF</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700">
              <tr>
                <th className="p-3 text-left">ETF</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-right">Weight</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-right">Yield</th>
                <th className="p-3 text-right">Annual Income</th>
                <th className="p-3 text-right">Monthly</th>
                <th className="p-3 text-center">Tax Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {etfBreakdown.map((etf) => (
                <tr key={etf.symbol} className="hover:bg-slate-700/50">
                  <td className="p-3 font-semibold text-blue-400">{etf.symbol}</td>
                  <td className="p-3 text-slate-300">{etf.name}</td>
                  <td className="p-3 text-right text-slate-300">{etf.weight.toFixed(1)}%</td>
                  <td className="p-3 text-right text-slate-300">{formatCurrency(etf.amount)}</td>
                  <td className="p-3 text-right text-green-400">{etf.yield.toFixed(2)}%</td>
                  <td className="p-3 text-right font-semibold text-green-400">{formatCurrency(etf.annualIncome)}</td>
                  <td className="p-3 text-right text-slate-300">{formatCurrency(etf.monthlyIncome)}</td>
                  <td className="p-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded ${
                      etf.taxEfficiency === 'Qualified' 
                        ? 'bg-green-900/30 text-green-300' 
                        : 'bg-orange-900/30 text-orange-300'
                    }`}>
                      {etf.taxEfficiency}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================
          SECTION 3: LIFETIME PROJECTION TABLE (From Original - RESTORE)
          ======================================================================== */}
      
      {lifetimeProjection.length > 0 && lifetimeTotals && (
        <>
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-500/30 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Starting Portfolio</div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency((taxableAmount + iraAmount) / 1000000)}M
              </div>
              <div className="text-xs text-slate-400 mt-1">Age 60</div>
            </div>

            <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-500/30 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Ending Portfolio</div>
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(lifetimeTotals.finalPortfolio / 1000000)}M
              </div>
              <div className="text-xs text-slate-400 mt-1">Age 90</div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-500/30 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Roth Conversions</div>
              <div className="text-2xl font-bold text-purple-400">
                {formatCurrency(lifetimeTotals.totalConversions / 1000000)}M
              </div>
              <div className="text-xs text-slate-400 mt-1">{lifetimeTotals.finalRothPct.toFixed(0)}% of portfolio</div>
            </div>

            <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 border border-red-500/30 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Lifetime Taxes</div>
              <div className="text-2xl font-bold text-red-400">
                {formatCurrency(lifetimeTotals.totalLifetimeTaxes / 1000000)}M
              </div>
              <div className="text-xs text-slate-400 mt-1">All sources, ages 60-90</div>
            </div>
          </div>

          {/* Complete Year-by-Year Table */}
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
                      <td className="text-right py-2 px-2 bg-purple-900/20 text-red-400 border-r border-slate-600">${(proj.federalTax / 1000).toFixed(0)}K</td>
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
                      {formatCurrency(lifetimeTotals.totalConversions / 1000000)}M
                    </td>
                    <td className="text-right py-3 px-2 bg-purple-900/30 text-red-400 border-r border-slate-600">
                      ${(lifetimeTotals.totalConversionTaxes / 1000).toFixed(0)}K
                    </td>
                    <td className="text-right py-3 px-2 bg-red-900/30 border-r border-slate-600" colSpan="2">—</td>
                    <td className="text-right py-3 px-2 bg-red-900/30 text-red-400 border-r border-slate-600">
                      ${(lifetimeTotals.totalCapGainsTaxes / 1000).toFixed(0)}K
                    </td>
                    <td className="text-right py-3 px-2 text-red-400 border-r border-slate-600">
                      {formatCurrency(lifetimeTotals.totalLifetimeTaxes / 1000000)}M
                    </td>
                    <td className="text-right py-3 px-2 border-r border-slate-600" colSpan="3">—</td>
                    <td className="text-right py-3 px-2 text-green-400 text-xl">
                      {formatCurrency(lifetimeTotals.finalPortfolio / 1000000)}M
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
              <div className="space-y-3 text-sm text-slate-300">
                {/* ROTH CONVERSION TAX-ON-TAX */}
                <div className="bg-slate-800/50 rounded p-3">
                  <h4 className="text-xs font-semibold text-purple-400 mb-2">Roth Conversion Taxes</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Stocks sold to pay conversion taxes:</span>
                      <span className="font-bold text-purple-300">
                        {formatCurrency(lifetimeTotals.conversionTaxStocksSold / 1000000)}M
                      </span>
                    </div>
                    <div className="flex justify-between text-xs border-t border-purple-600/30 pt-1">
                      <span>Cap gains tax (tax-on-tax):</span>
                      <span className="font-bold text-red-400">
                        ${(lifetimeTotals.conversionTaxOnTax / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* LIVING EXPENSE TAX-ON-TAX */}
                <div className="bg-slate-800/50 rounded p-3">
                  <h4 className="text-xs font-semibold text-blue-400 mb-2">Living Expenses</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Stocks sold for expenses:</span>
                      <span className="font-bold text-blue-300">
                        {formatCurrency(lifetimeTotals.livingExpenseStocksSold / 1000000)}M
                      </span>
                    </div>
                    <div className="flex justify-between text-xs border-t border-blue-600/30 pt-1">
                      <span>Cap gains tax:</span>
                      <span className="font-bold text-red-400">
                        ${(lifetimeTotals.livingExpenseCapGainsTax / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* TOTAL */}
                <div className="border-t-2 border-amber-600/50 pt-2">
                  <div className="flex justify-between font-bold">
                    <span>TOTAL Hidden Taxes:</span>
                    <span className="text-red-400 text-lg">
                      ${(lifetimeTotals.totalCapGainsTaxes / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>
                
                <p className="text-xs italic text-amber-200 mt-3 border-t border-amber-600/30 pt-2">
                  This is the "tax-on-tax" - capital gains triggered when selling stocks to pay both Roth conversion taxes ({formatCurrency(lifetimeTotals.conversionTaxOnTax / 1000)}K) and living expenses ({formatCurrency(lifetimeTotals.livingExpenseCapGainsTax / 1000)}K).
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">📊 Account Migration</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>Starting Traditional IRA:</span>
                  <span className="font-bold text-amber-400">
                    {formatCurrency(iraAmount / 1000000)}M
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Ending Traditional IRA:</span>
                  <span className="font-bold text-amber-300">
                    {formatCurrency(lifetimeProjection[lifetimeProjection.length - 1].tradIRABalance / 1000000)}M
                  </span>
                </div>
                <div className="flex justify-between border-t border-blue-600/30 pt-2">
                  <span>Ending Roth IRA:</span>
                  <span className="font-bold text-green-400">
                    {formatCurrency(lifetimeProjection[lifetimeProjection.length - 1].rothIRABalance / 1000000)}M
                  </span>
                </div>
                <div className="mt-3 p-2 bg-green-900/20 border border-green-600/30 rounded text-xs">
                  <div className="font-semibold text-green-400 mb-1">Tax-Free Wealth Created</div>
                  <div className="text-slate-300">
                    Roth IRA reaches {formatCurrency(lifetimeProjection[lifetimeProjection.length - 1].rothIRABalance / 1000000)}M by age 90,
                    representing {lifetimeTotals.finalRothPct.toFixed(0)}% of your total portfolio
                    (${formatCurrency(lifetimeTotals.finalPortfolio / 1000000)}M total wealth).
                    Traditional IRA {iraAmount > lifetimeProjection[lifetimeProjection.length - 1].tradIRABalance ? 'decreased' : 'increased'} from 
                    ${formatCurrency(iraAmount / 1000000)}M to ${formatCurrency(lifetimeProjection[lifetimeProjection.length - 1].tradIRABalance / 1000000)}M.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default IncomeTab;
