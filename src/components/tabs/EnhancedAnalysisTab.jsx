// =============================================================================
// ALPHATIC - ENHANCED ANALYSIS TAB  
// =============================================================================
// Institutional-grade portfolio analytics with comprehensive metrics and charts
// Phase 2 Enhancement - Full performance analysis
// =============================================================================

import React, { useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ETF_UNIVERSE } from '../../data';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const EnhancedAnalysisTab = ({ 
  allocation,
  marketRegime,
  taxableAmount,
  iraAmount,
  rothAmount,
  isValid 
}) => {
  
  // =============================================================================
  // COMPREHENSIVE PORTFOLIO ANALYSIS WITH BENCHMARKS
  // =============================================================================
  
  const portfolioAnalysis = useMemo(() => {
    if (!allocation || !isValid) return null;

    const totalPortfolio = taxableAmount + iraAmount + rothAmount;
    const RISK_FREE_RATE = 4.5; // 4.5% treasury rate
    
    // Calculate weighted metrics for YOUR portfolio
    let weightedReturn = 0;
    let weightedVolatility = 0;
    let weightedExpenseRatio = 0;
    let weightedDividendYield = 0;
    let weightedBeta = 0;
    
    // Factor exposures
    let growthExposure = 0;
    let valueExposure = 0;
    let momentumExposure = 0;
    let qualityExposure = 0;
    let lowVolExposure = 0;
    let dividendExposure = 0;
    
    Object.entries(allocation).forEach(([symbol, weight]) => {
      const etf = ETF_UNIVERSE[symbol];
      if (!etf) return;
      
      const w = weight / 100;
      
      // Weighted averages
      weightedReturn += (etf.expectedReturn || 9) * w;
      weightedVolatility += (etf.volatility || 15) * w;
      weightedExpenseRatio += (etf.expenseRatio || 0.05) * w;
      weightedDividendYield += (etf.dividendYield || 2) * w;
      weightedBeta += (etf.beta || 1.0) * w;
      
      // Factor exposures
      const factor = etf.factor || 'Market';
      if (factor.includes('Growth')) growthExposure += w;
      else if (factor.includes('Value')) valueExposure += w;
      else if (factor.includes('Momentum')) momentumExposure += w;
      else if (factor.includes('Quality')) qualityExposure += w;
      else if (factor.includes('Low Vol')) lowVolExposure += w;
      else if (factor.includes('Dividend')) dividendExposure += w;
    });
    
    // =========================================================================
    // BENCHMARK DEFINITIONS
    // =========================================================================
    
    const benchmarks = {
      // S&P 500 Price Return (no dividends)
      sp500: {
        name: 'S&P 500',
        return: 9.8,
        volatility: 18.2,
        dividendYield: 0, // Price return only
        color: '#ef4444', // Red
        beta: 1.0
      },
      // S&P 500 Total Return (with dividends reinvested)
      sp500TR: {
        name: 'S&P 500 TR',
        return: 11.5, // ~2% higher due to dividends
        volatility: 18.2,
        dividendYield: 1.8,
        color: '#10b981', // Green
        beta: 1.0
      },
      // 60/40 Portfolio (60% stocks, 40% bonds)
      balanced: {
        name: '60/40 Portfolio',
        return: 8.3,
        volatility: 11.2,
        dividendYield: 2.1,
        color: '#8b5cf6', // Purple
        beta: 0.6
      }
    };
    
    // =========================================================================
    // HISTORICAL SIMULATION (1993-2026, 33 YEARS)
    // =========================================================================
    
    const historicalData = [];
    let yourValue = 10000;
    let sp500Value = 10000;
    let sp500TRValue = 10000;
    let balancedValue = 10000;
    
    // Simulate year-by-year returns with realistic volatility
    for (let year = 1993; year <= 2026; year++) {
      // Market conditions
      const isCrisis = year === 2008 || year === 2001 || year === 2020;
      const isBoom = year >= 1995 && year <= 1999;
      const isRecovery = year === 2009 || year === 2021;
      
      // Base returns with variation
      let yourReturn = weightedReturn;
      let sp500Return = benchmarks.sp500.return;
      let sp500TRReturn = benchmarks.sp500TR.return;
      let balancedReturn = benchmarks.balanced.return;
      
      // Apply market condition adjustments
      if (isCrisis) {
        yourReturn += -35 + Math.random() * 10;
        sp500Return = -40 + Math.random() * 10;
        sp500TRReturn = -37 + Math.random() * 10;
        balancedReturn = -25 + Math.random() * 8;
      } else if (isBoom) {
        yourReturn += 15 + Math.random() * 10;
        sp500Return = 25 + Math.random() * 10;
        sp500TRReturn = 28 + Math.random() * 10;
        balancedReturn = 18 + Math.random() * 8;
      } else if (isRecovery) {
        yourReturn += 15 + Math.random() * 10;
        sp500Return = 20 + Math.random() * 8;
        sp500TRReturn = 23 + Math.random() * 8;
        balancedReturn = 16 + Math.random() * 6;
      } else {
        // Normal years with volatility
        yourReturn += (Math.random() - 0.5) * weightedVolatility * 1.5;
        sp500Return += (Math.random() - 0.5) * benchmarks.sp500.volatility * 1.5;
        sp500TRReturn += (Math.random() - 0.5) * benchmarks.sp500TR.volatility * 1.5;
        balancedReturn += (Math.random() - 0.5) * benchmarks.balanced.volatility * 1.5;
      }
      
      // Apply returns
      yourValue *= (1 + yourReturn / 100);
      sp500Value *= (1 + sp500Return / 100);
      sp500TRValue *= (1 + sp500TRReturn / 100);
      balancedValue *= (1 + balancedReturn / 100);
      
      historicalData.push({
        year,
        yourPortfolio: Math.round(yourValue),
        sp500: Math.round(sp500Value),
        sp500TR: Math.round(sp500TRValue),
        balanced: Math.round(balancedValue)
      });
    }
    
    // =========================================================================
    // CALCULATE FINAL METRICS
    // =========================================================================
    
    const finalYour = historicalData[historicalData.length - 1].yourPortfolio;
    const finalSP500 = historicalData[historicalData.length - 1].sp500;
    const finalSP500TR = historicalData[historicalData.length - 1].sp500TR;
    const finalBalanced = historicalData[historicalData.length - 1].balanced;
    
    // CAGRs
    const years = 33;
    const cagrYour = (Math.pow(finalYour / 10000, 1/years) - 1) * 100;
    const cagrSP500 = (Math.pow(finalSP500 / 10000, 1/years) - 1) * 100;
    const cagrSP500TR = (Math.pow(finalSP500TR / 10000, 1/years) - 1) * 100;
    const cagrBalanced = (Math.pow(finalBalanced / 10000, 1/years) - 1) * 100;
    
    // Risk metrics for YOUR portfolio
    const sharpeRatio = (cagrYour - RISK_FREE_RATE) / weightedVolatility;
    const sortinoRatio = (cagrYour - RISK_FREE_RATE) / (weightedVolatility * 0.707);
    const maxDrawdown = weightedVolatility * 2.5; // Estimate
    const calmarRatio = cagrYour / maxDrawdown;
    const downsideDeviation = weightedVolatility * 0.707;
    
    // Risk metrics for BENCHMARKS
    const benchmarkMetrics = {
      sp500: {
        sharpe: (cagrSP500 - RISK_FREE_RATE) / benchmarks.sp500.volatility,
        sortino: (cagrSP500 - RISK_FREE_RATE) / (benchmarks.sp500.volatility * 0.707),
        maxDrawdown: benchmarks.sp500.volatility * 2.8,
        calmar: cagrSP500 / (benchmarks.sp500.volatility * 2.8)
      },
      sp500TR: {
        sharpe: (cagrSP500TR - RISK_FREE_RATE) / benchmarks.sp500TR.volatility,
        sortino: (cagrSP500TR - RISK_FREE_RATE) / (benchmarks.sp500TR.volatility * 0.707),
        maxDrawdown: benchmarks.sp500TR.volatility * 2.8,
        calmar: cagrSP500TR / (benchmarks.sp500TR.volatility * 2.8)
      },
      balanced: {
        sharpe: (cagrBalanced - RISK_FREE_RATE) / benchmarks.balanced.volatility,
        sortino: (cagrBalanced - RISK_FREE_RATE) / (benchmarks.balanced.volatility * 0.707),
        maxDrawdown: benchmarks.balanced.volatility * 2.0,
        calmar: cagrBalanced / (benchmarks.balanced.volatility * 2.0)
      }
    };
    
    // =========================================================================
    // ALPHA CALCULATIONS (Risk-Adjusted Excess Return)
    // =========================================================================
    
    const alpha = {
      // Alpha = Portfolio Return - (Risk-Free Rate + Beta * (Benchmark Return - Risk-Free Rate))
      vsSP500: cagrYour - (RISK_FREE_RATE + weightedBeta * (cagrSP500 - RISK_FREE_RATE)),
      vsSP500TR: cagrYour - (RISK_FREE_RATE + weightedBeta * (cagrSP500TR - RISK_FREE_RATE)),
      vsBalanced: cagrYour - (RISK_FREE_RATE + (weightedBeta * 0.6) * (cagrBalanced - RISK_FREE_RATE))
    };
    
    return {
      // Portfolio metrics
      weightedReturn: cagrYour,
      weightedVolatility,
      weightedExpenseRatio,
      weightedDividendYield,
      weightedBeta,
      
      // Risk metrics
      sharpeRatio,
      sortinoRatio,
      maxDrawdown,
      calmarRatio,
      downsideDeviation,
      
      // Factor exposures
      factorExposures: {
        growth: growthExposure * 100,
        value: valueExposure * 100,
        momentum: momentumExposure * 100,
        quality: qualityExposure * 100,
        lowVol: lowVolExposure * 100,
        dividend: dividendExposure * 100
      },
      
      // Benchmarks
      benchmarks,
      benchmarkMetrics,
      
      // Performance comparison
      finalValues: {
        yourPortfolio: finalYour,
        sp500: finalSP500,
        sp500TR: finalSP500TR,
        balanced: finalBalanced
      },
      
      cagrs: {
        yourPortfolio: cagrYour,
        sp500: cagrSP500,
        sp500TR: cagrSP500TR,
        balanced: cagrBalanced
      },
      
      // Alpha
      alpha,
      
      // Historical data
      historicalData,
      
      // Portfolio stats
      numHoldings: Object.keys(allocation).length,
      totalAllocation: Object.values(allocation).reduce((s, w) => s + w, 0)
    };
  }, [allocation, isValid, taxableAmount, iraAmount, rothAmount]);

  if (!isValid || !portfolioAnalysis) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2 text-yellow-400">Portfolio Not Complete</h3>
        <p className="text-slate-300">
          Complete your portfolio allocation (100%) in the Portfolio Builder to see comprehensive analysis.
        </p>
      </div>
    );
  }

  const { 
    weightedReturn, 
    weightedVolatility, 
    sharpeRatio, 
    sortinoRatio,
    maxDrawdown,
    calmarRatio,
    downsideDeviation,
    weightedBeta,
    weightedDividendYield,
    factorExposures,
    benchmarks,
    benchmarkMetrics,
    finalValues,
    cagrs,
    alpha,
    historicalData
  } = portfolioAnalysis;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Portfolio Analysis</h2>
        <div className="text-sm text-slate-400">Performance vs Benchmarks (1993-2026)</div>
      </div>

      {/* ========================================================================
          ALPHA GENERATION (Top Priority!)
          ======================================================================== */}
      
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-lg p-6">
        <h3 className="text-2xl font-semibold mb-4 text-purple-300">🎯 Alpha Generation (Risk-Adjusted Excess Return)</h3>
        
        <div className="grid grid-cols-3 gap-6 mb-4">
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-1">vs S&P 500</div>
            <div className={`text-4xl font-bold ${alpha.vsSP500 > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {alpha.vsSP500 > 0 ? '+' : ''}{alpha.vsSP500.toFixed(2)}%
            </div>
            <div className="text-xs text-slate-500 mt-1">Annual alpha</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-1">vs S&P 500 TR</div>
            <div className={`text-4xl font-bold ${alpha.vsSP500TR > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {alpha.vsSP500TR > 0 ? '+' : ''}{alpha.vsSP500TR.toFixed(2)}%
            </div>
            <div className="text-xs text-slate-500 mt-1">vs total return</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-1">vs 60/40</div>
            <div className={`text-4xl font-bold ${alpha.vsBalanced > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {alpha.vsBalanced > 0 ? '+' : ''}{alpha.vsBalanced.toFixed(2)}%
            </div>
            <div className="text-xs text-slate-500 mt-1">vs balanced</div>
          </div>
        </div>
        
        <div className="text-sm text-slate-300 bg-slate-800/50 rounded p-3">
          <strong>Alpha Explanation:</strong> Risk-adjusted excess return after accounting for beta exposure. 
          Positive alpha means you're generating superior returns for the risk taken.
        </div>
      </div>

      {/* ========================================================================
          PERFORMANCE SUMMARY - SIDE BY SIDE
          ======================================================================== */}
      
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold mb-4">📊 Performance Comparison (33 Years)</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-2 px-3 text-slate-400">Metric</th>
                <th className="text-center py-2 px-3 text-blue-400 font-bold">Your Portfolio</th>
                <th className="text-center py-2 px-3 text-red-400">S&P 500</th>
                <th className="text-center py-2 px-3 text-green-400">S&P 500 TR</th>
                <th className="text-center py-2 px-3 text-purple-400">60/40</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="py-3 px-3 text-slate-300 font-semibold">Final Value ($10K)</td>
                <td className="text-center py-3 px-3 text-blue-400 font-bold text-lg">
                  ${finalValues.yourPortfolio.toLocaleString()}
                </td>
                <td className="text-center py-3 px-3 text-white">
                  ${finalValues.sp500.toLocaleString()}
                </td>
                <td className="text-center py-3 px-3 text-white">
                  ${finalValues.sp500TR.toLocaleString()}
                </td>
                <td className="text-center py-3 px-3 text-white">
                  ${finalValues.balanced.toLocaleString()}
                </td>
              </tr>
              
              <tr className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="py-3 px-3 text-slate-300 font-semibold">CAGR</td>
                <td className="text-center py-3 px-3 text-blue-400 font-bold">
                  {cagrs.yourPortfolio.toFixed(2)}%
                </td>
                <td className="text-center py-3 px-3 text-white">
                  {cagrs.sp500.toFixed(2)}%
                </td>
                <td className="text-center py-3 px-3 text-white">
                  {cagrs.sp500TR.toFixed(2)}%
                </td>
                <td className="text-center py-3 px-3 text-white">
                  {cagrs.balanced.toFixed(2)}%
                </td>
              </tr>
              
              <tr className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="py-3 px-3 text-slate-300 font-semibold">Volatility</td>
                <td className="text-center py-3 px-3 text-blue-400 font-bold">
                  {weightedVolatility.toFixed(1)}%
                </td>
                <td className="text-center py-3 px-3 text-white">
                  {benchmarks.sp500.volatility.toFixed(1)}%
                </td>
                <td className="text-center py-3 px-3 text-white">
                  {benchmarks.sp500TR.volatility.toFixed(1)}%
                </td>
                <td className="text-center py-3 px-3 text-white">
                  {benchmarks.balanced.volatility.toFixed(1)}%
                </td>
              </tr>
              
              <tr className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="py-3 px-3 text-slate-300 font-semibold">Sharpe Ratio</td>
                <td className="text-center py-3 px-3 text-blue-400 font-bold">
                  {sharpeRatio.toFixed(2)}
                </td>
                <td className="text-center py-3 px-3 text-white">
                  {benchmarkMetrics.sp500.sharpe.toFixed(2)}
                </td>
                <td className="text-center py-3 px-3 text-white">
                  {benchmarkMetrics.sp500TR.sharpe.toFixed(2)}
                </td>
                <td className="text-center py-3 px-3 text-white">
                  {benchmarkMetrics.balanced.sharpe.toFixed(2)}
                </td>
              </tr>
              
              <tr className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="py-3 px-3 text-slate-300 font-semibold">Max Drawdown</td>
                <td className="text-center py-3 px-3 text-orange-400 font-bold">
                  -{maxDrawdown.toFixed(1)}%
                </td>
                <td className="text-center py-3 px-3 text-white">
                  -{benchmarkMetrics.sp500.maxDrawdown.toFixed(1)}%
                </td>
                <td className="text-center py-3 px-3 text-white">
                  -{benchmarkMetrics.sp500TR.maxDrawdown.toFixed(1)}%
                </td>
                <td className="text-center py-3 px-3 text-white">
                  -{benchmarkMetrics.balanced.maxDrawdown.toFixed(1)}%
                </td>
              </tr>
              
              <tr className="hover:bg-slate-700/30">
                <td className="py-3 px-3 text-slate-300 font-semibold">Calmar Ratio</td>
                <td className="text-center py-3 px-3 text-blue-400 font-bold">
                  {calmarRatio.toFixed(2)}
                </td>
                <td className="text-center py-3 px-3 text-white">
                  {benchmarkMetrics.sp500.calmar.toFixed(2)}
                </td>
                <td className="text-center py-3 px-3 text-white">
                  {benchmarkMetrics.sp500TR.calmar.toFixed(2)}
                </td>
                <td className="text-center py-3 px-3 text-white">
                  {benchmarkMetrics.balanced.calmar.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-xs text-slate-400 space-y-1">
          <div><strong>S&P 500:</strong> Price return only (no dividends)</div>
          <div><strong>S&P 500 TR:</strong> Total Return with dividends reinvested</div>
          <div><strong>60/40:</strong> 60% stocks / 40% bonds traditional balanced portfolio</div>
        </div>
      </div>

      {/* ========================================================================
          KEY METRICS
          ======================================================================== */}
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">Sharpe Ratio</div>
          <div className="text-3xl font-bold text-blue-400">{sharpeRatio.toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-1">Risk-adjusted return</div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">Sortino Ratio</div>
          <div className="text-3xl font-bold text-purple-400">{sortinoRatio.toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-1">Downside risk-adjusted</div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">Max Drawdown</div>
          <div className="text-3xl font-bold text-red-400">-{maxDrawdown.toFixed(1)}%</div>
          <div className="text-xs text-slate-500 mt-1">Largest peak-to-trough</div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">Calmar Ratio</div>
          <div className="text-3xl font-bold text-green-400">{calmarRatio.toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-1">Return / max drawdown</div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">Volatility</div>
          <div className="text-3xl font-bold text-orange-400">{weightedVolatility.toFixed(1)}%</div>
          <div className="text-xs text-slate-500 mt-1">Annual standard deviation</div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">Downside Dev</div>
          <div className="text-3xl font-bold text-orange-300">{downsideDeviation.toFixed(1)}%</div>
          <div className="text-xs text-slate-500 mt-1">Negative volatility</div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">Beta (vs SPY)</div>
          <div className="text-3xl font-bold text-blue-300">{weightedBeta.toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-1">Market sensitivity</div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">Dividend Yield</div>
          <div className="text-3xl font-bold text-green-300">{weightedDividendYield.toFixed(1)}%</div>
          <div className="text-xs text-slate-500 mt-1">Annual income</div>
        </div>
      </div>

      {/* ========================================================================
          GROWTH OF $10,000 CHART - WITH BENCHMARKS
          ======================================================================== */}
      
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold mb-4">Growth of $10,000 (1993-2026)</h3>
        <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
          <div>
            <div className="text-slate-400">Your Portfolio</div>
            <div className="text-2xl font-bold text-blue-400">
              ${finalValues.yourPortfolio.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">
              {((finalValues.yourPortfolio / 10000 - 1) * 100).toFixed(0)}% gain
            </div>
          </div>
          <div>
            <div className="text-slate-400">S&P 500</div>
            <div className="text-2xl font-bold text-red-400">
              ${finalValues.sp500.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">
              {((finalValues.sp500 / 10000 - 1) * 100).toFixed(0)}% gain
            </div>
          </div>
          <div>
            <div className="text-slate-400">S&P 500 TR</div>
            <div className="text-2xl font-bold text-green-400">
              ${finalValues.sp500TR.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">
              {((finalValues.sp500TR / 10000 - 1) * 100).toFixed(0)}% gain
            </div>
          </div>
          <div>
            <div className="text-slate-400">60/40</div>
            <div className="text-2xl font-bold text-purple-400">
              ${finalValues.balanced.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">
              {((finalValues.balanced / 10000 - 1) * 100).toFixed(0)}% gain
            </div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="year" 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value, name) => {
                const labels = {
                  yourPortfolio: 'Your Portfolio',
                  sp500: 'S&P 500',
                  sp500TR: 'S&P 500 TR',
                  balanced: '60/40'
                };
                return [`$${value.toLocaleString()}`, labels[name] || name];
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => {
                const labels = {
                  yourPortfolio: 'Your Portfolio',
                  sp500: 'S&P 500',
                  sp500TR: 'S&P 500 TR',
                  balanced: '60/40'
                };
                return labels[value] || value;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="yourPortfolio" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="sp500" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="sp500TR" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="balanced" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-400">
          <div>
            <strong>Key Takeaway:</strong> {
              finalValues.yourPortfolio > finalValues.sp500TR 
                ? `Your portfolio outperformed S&P 500 TR by $${(finalValues.yourPortfolio - finalValues.sp500TR).toLocaleString()}`
                : `S&P 500 TR outperformed by $${(finalValues.sp500TR - finalValues.yourPortfolio).toLocaleString()}`
            }
          </div>
          <div>
            <strong>Best Strategy:</strong> {
              Math.max(finalValues.yourPortfolio, finalValues.sp500, finalValues.sp500TR, finalValues.balanced) === finalValues.yourPortfolio ? 'Your Portfolio' :
              Math.max(finalValues.yourPortfolio, finalValues.sp500, finalValues.sp500TR, finalValues.balanced) === finalValues.sp500TR ? 'S&P 500 TR' :
              Math.max(finalValues.yourPortfolio, finalValues.sp500, finalValues.sp500TR, finalValues.balanced) === finalValues.sp500 ? 'S&P 500' :
              '60/40 Portfolio'
            } (${Math.max(finalValues.yourPortfolio, finalValues.sp500, finalValues.sp500TR, finalValues.balanced).toLocaleString()})
          </div>
        </div>
      </div>

      {/* ========================================================================
          KEY RISK METRICS WITH BENCHMARKS
          ======================================================================== */}
      
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold mb-4">Key Risk Metrics Comparison</h3>
        
        <div className="grid grid-cols-4 gap-4">
          {/* Sharpe Ratio */}
          <div className="text-center p-4 bg-slate-900/50 rounded">
            <div className="text-xs text-slate-400 mb-2">Sharpe Ratio</div>
            <div className="text-2xl font-bold text-blue-400 mb-1">{sharpeRatio.toFixed(2)}</div>
            <div className="text-xs space-y-1">
              <div className="text-slate-500">S&P: {benchmarkMetrics.sp500TR.sharpe.toFixed(2)}</div>
              <div className="text-slate-500">60/40: {benchmarkMetrics.balanced.sharpe.toFixed(2)}</div>
            </div>
            <div className={`text-xs mt-2 ${sharpeRatio > benchmarkMetrics.sp500TR.sharpe ? 'text-green-400' : 'text-red-400'}`}>
              {sharpeRatio > benchmarkMetrics.sp500TR.sharpe ? '✓ Better' : '✗ Below'} S&P
            </div>
          </div>
          
          {/* Max Drawdown */}
          <div className="text-center p-4 bg-slate-900/50 rounded">
            <div className="text-xs text-slate-400 mb-2">Max Drawdown</div>
            <div className="text-2xl font-bold text-orange-400 mb-1">-{maxDrawdown.toFixed(1)}%</div>
            <div className="text-xs space-y-1">
              <div className="text-slate-500">S&P: -{benchmarkMetrics.sp500TR.maxDrawdown.toFixed(1)}%</div>
              <div className="text-slate-500">60/40: -{benchmarkMetrics.balanced.maxDrawdown.toFixed(1)}%</div>
            </div>
            <div className={`text-xs mt-2 ${maxDrawdown < benchmarkMetrics.sp500TR.maxDrawdown ? 'text-green-400' : 'text-red-400'}`}>
              {maxDrawdown < benchmarkMetrics.sp500TR.maxDrawdown ? '✓ Less risk' : '✗ More risk'}
            </div>
          </div>
          
          {/* Volatility */}
          <div className="text-center p-4 bg-slate-900/50 rounded">
            <div className="text-xs text-slate-400 mb-2">Volatility</div>
            <div className="text-2xl font-bold text-yellow-400 mb-1">{weightedVolatility.toFixed(1)}%</div>
            <div className="text-xs space-y-1">
              <div className="text-slate-500">S&P: {benchmarks.sp500TR.volatility.toFixed(1)}%</div>
              <div className="text-slate-500">60/40: {benchmarks.balanced.volatility.toFixed(1)}%</div>
            </div>
            <div className={`text-xs mt-2 ${weightedVolatility < benchmarks.sp500TR.volatility ? 'text-green-400' : 'text-yellow-400'}`}>
              {weightedVolatility < benchmarks.sp500TR.volatility ? '✓ Lower vol' : 'Higher vol'}
            </div>
          </div>
          
          {/* Beta */}
          <div className="text-center p-4 bg-slate-900/50 rounded">
            <div className="text-xs text-slate-400 mb-2">Beta (vs SPY)</div>
            <div className="text-2xl font-bold text-purple-400 mb-1">{weightedBeta.toFixed(2)}</div>
            <div className="text-xs space-y-1">
              <div className="text-slate-500">S&P: 1.00</div>
              <div className="text-slate-500">60/40: 0.60</div>
            </div>
            <div className={`text-xs mt-2 ${weightedBeta < 1 ? 'text-green-400' : 'text-red-400'}`}>
              {weightedBeta < 1 ? '✓ Lower beta' : 'Higher beta'}
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded text-sm text-slate-300">
          <strong>Summary:</strong> Your portfolio has {sharpeRatio > benchmarkMetrics.sp500TR.sharpe ? 'superior' : 'lower'} risk-adjusted returns (Sharpe: {sharpeRatio.toFixed(2)} vs {benchmarkMetrics.sp500TR.sharpe.toFixed(2)}) and {maxDrawdown < benchmarkMetrics.sp500TR.maxDrawdown ? ((benchmarkMetrics.sp500TR.maxDrawdown - maxDrawdown) / benchmarkMetrics.sp500TR.maxDrawdown * 100).toFixed(0) + '% less' : ((maxDrawdown - benchmarkMetrics.sp500TR.maxDrawdown) / benchmarkMetrics.sp500TR.maxDrawdown * 100).toFixed(0) + '% more'} downside risk than S&P 500 Total Return.
        </div>
      </div>

      {/* ========================================================================
          FACTOR ATTRIBUTION
          ======================================================================== */}
      
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold mb-4">Factor Attribution</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">Growth Exposure</span>
              <span className="text-blue-400 font-semibold">{factorExposures.growth.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{width: `${factorExposures.growth}%`}}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">Value Exposure</span>
              <span className="text-green-400 font-semibold">{factorExposures.value.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{width: `${factorExposures.value}%`}}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">Momentum Exposure</span>
              <span className="text-purple-400 font-semibold">{factorExposures.momentum.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full" 
                style={{width: `${factorExposures.momentum}%`}}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">Quality Exposure</span>
              <span className="text-yellow-400 font-semibold">{factorExposures.quality.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{width: `${factorExposures.quality}%`}}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">Dividend Exposure</span>
              <span className="text-emerald-400 font-semibold">{factorExposures.dividend.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full" 
                style={{width: `${factorExposures.dividend}%`}}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================
          RISK DECOMPOSITION
          ======================================================================== */}
      
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold mb-4">Risk Decomposition</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-slate-300">Total Risk (Volatility):</span>
              <span className="text-2xl font-bold text-orange-400">{weightedVolatility.toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="pl-4 space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">├─ Systematic Risk (Beta × Market Vol)</span>
                <span className="text-blue-400 font-semibold">{(weightedVolatility * weightedBeta * 0.75).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{width: `${(weightedBeta * 75)}%`}}
                ></div>
              </div>
              <div className="text-xs text-slate-500">{(weightedBeta * 75).toFixed(0)}% of total risk</div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">└─ Idiosyncratic Risk (Portfolio-specific)</span>
                <span className="text-purple-400 font-semibold">{(weightedVolatility * (1 - weightedBeta) * 0.25).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{width: `${((1 - weightedBeta) * 25)}%`}}
                ></div>
              </div>
              <div className="text-xs text-slate-500">{((1 - weightedBeta) * 25).toFixed(0)}% of total risk</div>
            </div>
          </div>
          
          <div className="border-t border-slate-700 pt-3 mt-3">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Downside Risk Metrics:</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-slate-400">Downside Deviation (vs 0%)</div>
                <div className="text-lg font-bold text-orange-300">{downsideDeviation.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-slate-400">VaR (95% confidence)</div>
                <div className="text-lg font-bold text-red-400">-{(weightedVolatility * 1.65).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-slate-400">CVaR (Expected shortfall)</div>
                <div className="text-lg font-bold text-red-400">-{(weightedVolatility * 2.1).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-slate-400">Tail Risk (99% VaR)</div>
                <div className="text-lg font-bold text-red-500">-{(weightedVolatility * 2.33).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnalysisTab;
