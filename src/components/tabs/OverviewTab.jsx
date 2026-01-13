// =============================================================================
// ALPHATIC - OVERVIEW TAB COMPONENT
// =============================================================================
// Portfolio dashboard summary with key metrics and visualizations
// Auto-recalculates when portfolio changes
// =============================================================================

import React, { useMemo } from 'react';
import { ETF_UNIVERSE } from '../../data';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { calculateWeightedYield, calculateWeightedExpenseRatio } from '../../data/etfs';

const OverviewTab = ({ 
  allocation,
  taxableAmount,
  iraAmount,
  rothAmount,
  marketRegime,
  isValid 
}) => {
  
  // Calculate portfolio summary statistics
  const portfolioSummary = useMemo(() => {
    if (!allocation || !isValid) {
      return null;
    }

    const totalPortfolio = taxableAmount + iraAmount + rothAmount;
    const weightedYield = calculateWeightedYield(allocation);
    const weightedExpenseRatio = calculateWeightedExpenseRatio(allocation);
    
    // Calculate total annual income
    const totalAnnualIncome = Object.entries(allocation).reduce((sum, [symbol, weight]) => {
      const etf = ETF_UNIVERSE[symbol];
      if (!etf) return sum;
      const etfAmount = totalPortfolio * (weight / 100);
      return sum + (etfAmount * (etf.yield / 100));
    }, 0);

    // Count holdings by category
    const categoryCounts = {};
    Object.keys(allocation).forEach(symbol => {
      const etf = ETF_UNIVERSE[symbol];
      if (etf) {
        categoryCounts[etf.category] = (categoryCounts[etf.category] || 0) + 1;
      }
    });

    // Count holdings by factor
    const factorCounts = {};
    Object.keys(allocation).forEach(symbol => {
      const etf = ETF_UNIVERSE[symbol];
      if (etf) {
        factorCounts[etf.factor] = (factorCounts[etf.factor] || 0) + 1;
      }
    });

    return {
      totalPortfolio,
      weightedYield,
      weightedExpenseRatio,
      totalAnnualIncome,
      monthlyIncome: totalAnnualIncome / 12,
      holdingsCount: Object.keys(allocation).length,
      categoryCounts,
      factorCounts
    };
  }, [allocation, taxableAmount, iraAmount, rothAmount, isValid]);

  // Calculate account breakdown
  const accountBreakdown = useMemo(() => {
    const total = taxableAmount + iraAmount + rothAmount;
    return {
      taxable: {
        amount: taxableAmount,
        percentage: (taxableAmount / total) * 100
      },
      traditional: {
        amount: iraAmount,
        percentage: (iraAmount / total) * 100
      },
      roth: {
        amount: rothAmount,
        percentage: (rothAmount / total) * 100
      }
    };
  }, [taxableAmount, iraAmount, rothAmount]);

  if (!isValid || !portfolioSummary) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-xl font-semibold text-yellow-400">Portfolio Not Complete</h3>
        </div>
        <p className="text-slate-300">
          Please complete your portfolio allocation (must total 100%) to see overview.
        </p>
        <p className="text-sm text-slate-400 mt-2">
          Go to the <strong>Portfolio Builder</strong> tab to create or load a portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Portfolio Overview</h2>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-lg p-4 border border-blue-500/30">
          <div className="text-sm text-slate-400 mb-1">Total Portfolio</div>
          <div className="text-2xl font-bold text-blue-400">
            {formatCurrency(portfolioSummary.totalPortfolio)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {portfolioSummary.holdingsCount} holdings
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-lg p-4 border border-green-500/30">
          <div className="text-sm text-slate-400 mb-1">Annual Income</div>
          <div className="text-2xl font-bold text-green-400">
            {formatCurrency(portfolioSummary.totalAnnualIncome)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {formatCurrency(portfolioSummary.monthlyIncome)}/month
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-4 border border-purple-500/30">
          <div className="text-sm text-slate-400 mb-1">Portfolio Yield</div>
          <div className="text-2xl font-bold text-purple-400">
            {formatPercent(portfolioSummary.weightedYield)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Weighted average
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-900/20 to-amber-900/20 rounded-lg p-4 border border-orange-500/30">
          <div className="text-sm text-slate-400 mb-1">Total Expenses</div>
          <div className="text-2xl font-bold text-orange-400">
            {formatPercent(portfolioSummary.weightedExpenseRatio)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {formatCurrency(portfolioSummary.totalPortfolio * portfolioSummary.weightedExpenseRatio / 100)}/year
          </div>
        </div>
      </div>

      {/* Account Breakdown */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/30">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">Account Breakdown</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-900/20 rounded p-4 border border-green-600/30">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-slate-400">Taxable Brokerage</div>
              <div className="text-lg font-bold text-green-400">
                {formatPercent(accountBreakdown.taxable.percentage)}
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-200">
              {formatCurrency(accountBreakdown.taxable.amount)}
            </div>
            <div className="text-xs text-slate-500 mt-2">Income-focused, tax-efficient</div>
          </div>

          <div className="bg-purple-900/20 rounded p-4 border border-purple-600/30">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-slate-400">Traditional IRA</div>
              <div className="text-lg font-bold text-purple-400">
                {formatPercent(accountBreakdown.traditional.percentage)}
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-200">
              {formatCurrency(accountBreakdown.traditional.amount)}
            </div>
            <div className="text-xs text-slate-500 mt-2">Growth-focused, converting to Roth</div>
          </div>

          <div className="bg-cyan-900/20 rounded p-4 border border-cyan-600/30">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-slate-400">Roth IRA</div>
              <div className="text-lg font-bold text-cyan-400">
                {formatPercent(accountBreakdown.roth.percentage)}
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-200">
              {formatCurrency(accountBreakdown.roth.amount)}
            </div>
            <div className="text-xs text-slate-500 mt-2">Tax-free growth forever</div>
          </div>
        </div>
      </div>

      {/* Holdings by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/30">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Holdings by Category</h3>
          
          <div className="space-y-3">
            {Object.entries(portfolioSummary.categoryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">{category}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-700 rounded h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded"
                        style={{ width: `${(count / portfolioSummary.holdingsCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-blue-400 w-8">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/30">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Factor Exposure</h3>
          
          <div className="space-y-3">
            {Object.entries(portfolioSummary.factorCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8) // Top 8 factors
              .map(([factor, count]) => (
                <div key={factor} className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">{factor}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-700 rounded h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded"
                        style={{ width: `${(count / portfolioSummary.holdingsCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-purple-400 w-8">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Current Market Regime */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2 text-blue-400">
          Current Market Regime: <span className="capitalize">{marketRegime}</span>
        </h3>
        <p className="text-sm text-slate-300">
          Your portfolio allocation is optimized for the current {marketRegime} market conditions.
          Rebalancing recommendations adjust automatically based on regime changes.
        </p>
      </div>

      {/* Portfolio Health Indicators */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg p-6 border border-slate-600/30">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">Portfolio Health Check</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`rounded p-4 ${
            portfolioSummary.holdingsCount >= 10 ? 'bg-green-900/20 border border-green-600/30' :
            portfolioSummary.holdingsCount >= 5 ? 'bg-yellow-900/20 border border-yellow-600/30' :
            'bg-red-900/20 border border-red-600/30'
          }`}>
            <div className="text-sm text-slate-400 mb-1">Diversification</div>
            <div className={`text-xl font-bold ${
              portfolioSummary.holdingsCount >= 10 ? 'text-green-400' :
              portfolioSummary.holdingsCount >= 5 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {portfolioSummary.holdingsCount >= 10 ? 'Excellent' :
               portfolioSummary.holdingsCount >= 5 ? 'Adequate' :
               'Limited'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {portfolioSummary.holdingsCount} holdings
            </div>
          </div>

          <div className={`rounded p-4 ${
            portfolioSummary.weightedExpenseRatio < 0.15 ? 'bg-green-900/20 border border-green-600/30' :
            portfolioSummary.weightedExpenseRatio < 0.30 ? 'bg-yellow-900/20 border border-yellow-600/30' :
            'bg-red-900/20 border border-red-600/30'
          }`}>
            <div className="text-sm text-slate-400 mb-1">Cost Efficiency</div>
            <div className={`text-xl font-bold ${
              portfolioSummary.weightedExpenseRatio < 0.15 ? 'text-green-400' :
              portfolioSummary.weightedExpenseRatio < 0.30 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {portfolioSummary.weightedExpenseRatio < 0.15 ? 'Excellent' :
               portfolioSummary.weightedExpenseRatio < 0.30 ? 'Good' :
               'High'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {formatPercent(portfolioSummary.weightedExpenseRatio)} avg expense
            </div>
          </div>

          <div className={`rounded p-4 ${
            portfolioSummary.weightedYield >= 3.0 ? 'bg-green-900/20 border border-green-600/30' :
            portfolioSummary.weightedYield >= 1.5 ? 'bg-yellow-900/20 border border-yellow-600/30' :
            'bg-blue-900/20 border border-blue-600/30'
          }`}>
            <div className="text-sm text-slate-400 mb-1">Income Generation</div>
            <div className={`text-xl font-bold ${
              portfolioSummary.weightedYield >= 3.0 ? 'text-green-400' :
              portfolioSummary.weightedYield >= 1.5 ? 'text-yellow-400' :
              'text-blue-400'
            }`}>
              {portfolioSummary.weightedYield >= 3.0 ? 'High Income' :
               portfolioSummary.weightedYield >= 1.5 ? 'Moderate' :
               'Growth Focus'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {formatPercent(portfolioSummary.weightedYield)} yield
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4">
        <h4 className="font-semibold text-purple-400 mb-3">⚡ Quick Navigation</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <button className="bg-slate-700 hover:bg-slate-600 rounded p-2 text-slate-200 transition">
            View Income Details →
          </button>
          <button className="bg-slate-700 hover:bg-slate-600 rounded p-2 text-slate-200 transition">
            Check Allocation →
          </button>
          <button className="bg-slate-700 hover:bg-slate-600 rounded p-2 text-slate-200 transition">
            Analyze Returns →
          </button>
          <button className="bg-slate-700 hover:bg-slate-600 rounded p-2 text-slate-200 transition">
            Roth Conversion →
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
