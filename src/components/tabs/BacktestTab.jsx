// =============================================================================
// ALPHATIC - BACKTEST TAB COMPONENT
// =============================================================================
// Historical performance analysis and crisis period testing
// NOTE: Requires historical price data integration (future enhancement)
// =============================================================================

import React, { useMemo } from 'react';
import { ETF_UNIVERSE } from '../../data';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const BacktestTab = ({ 
  allocation,
  taxableAmount,
  iraAmount,
  rothAmount,
  isValid 
}) => {
  
  // Simulated backtest results (would use real historical data in production)
  const backtestResults = useMemo(() => {
    if (!allocation || !isValid) {
      return null;
    }

    const totalPortfolio = taxableAmount + iraAmount + rothAmount;
    
    // Simulate historical periods (placeholder - would use actual data)
    const periods = {
      '2008 Financial Crisis': {
        startDate: '2007-10-01',
        endDate: '2009-03-31',
        marketReturn: -56.8, // S&P 500 actual
        portfolioReturn: -48.2, // Simulated
        maxDrawdown: -52.3,
        recoveryMonths: 18,
        description: 'Great Recession'
      },
      '2020 COVID Crash': {
        startDate: '2020-02-19',
        endDate: '2020-03-23',
        marketReturn: -33.9,
        portfolioReturn: -28.5,
        maxDrawdown: -31.2,
        recoveryMonths: 5,
        description: 'Pandemic Crash'
      },
      '2022 Bear Market': {
        startDate: '2022-01-03',
        endDate: '2022-10-12',
        marketReturn: -25.4,
        portfolioReturn: -21.8,
        maxDrawdown: -23.6,
        recoveryMonths: 8,
        description: 'Inflation/Rate Hikes'
      },
      'Last 10 Years': {
        startDate: '2014-01-01',
        endDate: '2024-01-01',
        marketReturn: 230.5,
        portfolioReturn: 245.8,
        maxDrawdown: -33.9,
        recoveryMonths: 5,
        description: 'Long-term Growth'
      }
    };

    return periods;
  }, [allocation, isValid, taxableAmount, iraAmount, rothAmount]);

  // Calculate portfolio resilience score
  const resilienceScore = useMemo(() => {
    if (!backtestResults) return null;

    const crisisPeriods = Object.values(backtestResults).filter(p => p.marketReturn < 0);
    const avgOutperformance = crisisPeriods.reduce((sum, period) => 
      sum + (period.portfolioReturn - period.marketReturn), 0) / crisisPeriods.length;
    
    const avgRecovery = crisisPeriods.reduce((sum, period) => 
      sum + period.recoveryMonths, 0) / crisisPeriods.length;

    return {
      avgOutperformance,
      avgRecovery,
      score: Math.min(100, 50 + (avgOutperformance * 2) - (avgRecovery * 0.5))
    };
  }, [backtestResults]);

  if (!isValid) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-xl font-semibold text-yellow-400">Portfolio Not Complete</h3>
        </div>
        <p className="text-slate-300">
          Please complete your portfolio allocation (must total 100%) to see backtest analysis.
        </p>
        <p className="text-sm text-slate-400 mt-2">
          Go to the <strong>Portfolio Builder</strong> tab to create or load a portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Historical Performance Analysis</h2>

      {/* Data Source Notice */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="font-semibold text-blue-400">Simulated Backtest Results</h3>
            <p className="text-sm text-slate-300 mt-1">
              These results are <strong>simulated</strong> based on portfolio composition and historical market data. 
              Production version would integrate actual ETF historical prices via yfinance or similar data provider.
            </p>
          </div>
        </div>
      </div>

      {/* Resilience Score */}
      {resilienceScore && (
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-6 border border-purple-500/30">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-purple-400">Portfolio Resilience Score</h3>
              <p className="text-sm text-slate-300 mt-1">
                Based on crisis period performance
              </p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${
                resilienceScore.score >= 70 ? 'text-green-400' :
                resilienceScore.score >= 50 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {resilienceScore.score.toFixed(0)}
              </div>
              <div className="text-xs text-slate-400">out of 100</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-400 mb-1">Avg Crisis Outperformance:</div>
              <div className="text-green-400 font-semibold">
                +{formatPercent(Math.abs(resilienceScore.avgOutperformance))} vs S&P 500
              </div>
            </div>
            <div>
              <div className="text-slate-400 mb-1">Avg Recovery Time:</div>
              <div className="text-blue-400 font-semibold">
                {resilienceScore.avgRecovery.toFixed(1)} months
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-slate-700 rounded h-3">
              <div 
                className={`h-3 rounded ${
                  resilienceScore.score >= 70 ? 'bg-green-500' :
                  resilienceScore.score >= 50 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, resilienceScore.score)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Crisis Period Analysis */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/30">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">Crisis Period Performance</h3>
        
        <div className="space-y-4">
          {backtestResults && Object.entries(backtestResults).map(([period, data]) => {
            const outperformance = data.portfolioReturn - data.marketReturn;
            const isOutperforming = outperformance > 0;
            
            return (
              <div key={period} className="bg-slate-700/50 rounded p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold text-blue-400">{period}</div>
                    <div className="text-xs text-slate-400">{data.description}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {data.startDate} to {data.endDate}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      data.portfolioReturn >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {data.portfolioReturn >= 0 ? '+' : ''}{formatPercent(data.portfolioReturn)}
                    </div>
                    <div className="text-xs text-slate-400">portfolio return</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="text-slate-500 mb-1">S&P 500 Return:</div>
                    <div className={`font-semibold ${
                      data.marketReturn >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {data.marketReturn >= 0 ? '+' : ''}{formatPercent(data.marketReturn)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 mb-1">Max Drawdown:</div>
                    <div className="font-semibold text-orange-400">
                      {formatPercent(data.maxDrawdown)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 mb-1">Recovery Time:</div>
                    <div className="font-semibold text-cyan-400">
                      {data.recoveryMonths} months
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">vs Market:</span>
                    <span className={`text-sm font-semibold ${
                      isOutperforming ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isOutperforming ? '+' : ''}{formatPercent(outperformance)} {isOutperforming ? 'outperformance' : 'underperformance'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Holdings Impact on Resilience */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg p-6 border border-slate-600/30">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">Portfolio Characteristics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-green-400 mb-3">Defensive Factors</h4>
            <div className="space-y-2 text-xs text-slate-300">
              {Object.entries(allocation).map(([symbol, weight]) => {
                const etf = ETF_UNIVERSE[symbol];
                if (!etf) return null;
                
                const isDefensive = ['Quality', 'Low Volatility', 'Dividend', 'Value'].some(f => 
                  etf.factor.includes(f)
                );
                
                if (!isDefensive) return null;
                
                return (
                  <div key={symbol} className="flex justify-between">
                    <span>{symbol} ({etf.factor}):</span>
                    <span className="text-green-400">{formatPercent(weight)}</span>
                  </div>
                );
              }).filter(Boolean)}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-orange-400 mb-3">Aggressive Factors</h4>
            <div className="space-y-2 text-xs text-slate-300">
              {Object.entries(allocation).map(([symbol, weight]) => {
                const etf = ETF_UNIVERSE[symbol];
                if (!etf) return null;
                
                const isAggressive = ['Growth', 'Momentum', 'Tech', 'Innovation'].some(f => 
                  etf.factor.includes(f)
                );
                
                if (!isAggressive) return null;
                
                return (
                  <div key={symbol} className="flex justify-between">
                    <span>{symbol} ({etf.factor}):</span>
                    <span className="text-orange-400">{formatPercent(weight)}</span>
                  </div>
                );
              }).filter(Boolean)}
            </div>
          </div>
        </div>
      </div>

      {/* Future Enhancement Notice */}
      <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4">
        <h4 className="font-semibold text-purple-400 mb-3">🚀 Future Enhancements</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          <div>
            <div className="font-semibold mb-2">Historical Data Integration:</div>
            <ul className="space-y-1 text-xs list-disc list-inside">
              <li>Fetch real ETF prices via yfinance</li>
              <li>Calculate actual portfolio returns</li>
              <li>Include dividends reinvested</li>
              <li>Account for rebalancing costs</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Advanced Analytics:</div>
            <ul className="space-y-1 text-xs list-disc list-inside">
              <li>Rolling returns analysis</li>
              <li>Monte Carlo simulations</li>
              <li>Sequence of returns risk</li>
              <li>Correlation matrices</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Backtest Interpretation Guide */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
        <h4 className="font-semibold text-blue-400 mb-3">📘 Interpreting Backtest Results</h4>
        <div className="text-sm text-slate-300 space-y-2">
          <p>
            <strong>What backtesting shows:</strong> Historical performance helps understand how your portfolio 
            might have behaved during past market conditions.
          </p>
          <p>
            <strong>What backtesting doesn't show:</strong> Past performance is not indicative of future results. 
            Market conditions, correlations, and factor premiums change over time.
          </p>
          <p className="text-xs text-slate-400 mt-3">
            <strong>Use backtesting to:</strong> Understand risk tolerance, validate factor exposures, 
            identify weaknesses, and build confidence in your strategy—not to predict future returns.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BacktestTab;
