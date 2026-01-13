// =============================================================================
// ALPHATIC - REBALANCING TAB COMPONENT
// =============================================================================
// Rebalancing strategies, triggers, and tax-efficient implementation
// Auto-recalculates when portfolio changes
// =============================================================================

import React, { useMemo } from 'react';
import { ETF_UNIVERSE } from '../../data';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const RebalancingTab = ({ 
  allocation,
  taxableAmount,
  iraAmount,
  rothAmount,
  marketRegime,
  isValid 
}) => {
  
  // Calculate rebalancing metrics
  const rebalancingMetrics = useMemo(() => {
    if (!allocation || !isValid) {
      return null;
    }

    const totalPortfolio = taxableAmount + iraAmount + rothAmount;
    
    // Simulate current market values (would use actual prices in production)
    const currentValues = {};
    let totalCurrentValue = 0;
    
    Object.entries(allocation).forEach(([symbol, targetWeight]) => {
      // Simulate some drift (random between -10% and +15%)
      const driftFactor = 1 + (Math.random() * 0.25 - 0.10);
      const targetAmount = totalPortfolio * (targetWeight / 100);
      const currentAmount = targetAmount * driftFactor;
      
      currentValues[symbol] = {
        targetWeight,
        targetAmount,
        currentAmount,
        currentWeight: 0, // Will calculate after getting total
        drift: 0 // Will calculate after getting total
      };
      
      totalCurrentValue += currentAmount;
    });
    
    // Calculate current weights and drift
    Object.keys(currentValues).forEach(symbol => {
      const currentWeight = (currentValues[symbol].currentAmount / totalCurrentValue) * 100;
      currentValues[symbol].currentWeight = currentWeight;
      currentValues[symbol].drift = currentWeight - currentValues[symbol].targetWeight;
    });
    
    // Calculate total absolute drift
    const totalDrift = Object.values(currentValues).reduce((sum, holding) => 
      sum + Math.abs(holding.drift), 0
    );
    
    // Find holdings needing rebalancing (>5% drift)
    const needsRebalancing = Object.entries(currentValues)
      .filter(([_, holding]) => Math.abs(holding.drift) > 5)
      .map(([symbol, holding]) => ({
        symbol,
        ...holding,
        etf: ETF_UNIVERSE[symbol]
      }))
      .sort((a, b) => Math.abs(b.drift) - Math.abs(a.drift));

    return {
      currentValues,
      totalCurrentValue,
      totalDrift,
      needsRebalancing,
      rebalancingRequired: totalDrift > 10
    };
  }, [allocation, taxableAmount, iraAmount, rothAmount, isValid]);

  if (!isValid || !rebalancingMetrics) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-xl font-semibold text-yellow-400">Portfolio Not Complete</h3>
        </div>
        <p className="text-slate-300">
          Please complete your portfolio allocation (must total 100%) to see rebalancing recommendations.
        </p>
        <p className="text-sm text-slate-400 mt-2">
          Go to the <strong>Portfolio Builder</strong> tab to create or load a portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Rebalancing Strategy</h2>

      {/* Rebalancing Status */}
      <div className={`rounded-lg p-6 border ${
        rebalancingMetrics.rebalancingRequired ? 
          'bg-yellow-900/20 border-yellow-600/30' : 
          'bg-green-900/20 border-green-600/30'
      }`}>
        <div className="flex items-center gap-4">
          <span className="text-4xl">{rebalancingMetrics.rebalancingRequired ? '⚠️' : '✅'}</span>
          <div>
            <h3 className={`text-xl font-semibold ${
              rebalancingMetrics.rebalancingRequired ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {rebalancingMetrics.rebalancingRequired ? 'Rebalancing Recommended' : 'Portfolio Balanced'}
            </h3>
            <p className="text-sm text-slate-300 mt-1">
              Total drift: {formatPercent(rebalancingMetrics.totalDrift)} 
              {rebalancingMetrics.rebalancingRequired ? 
                ' - Consider rebalancing to realign with target allocation' :
                ' - Portfolio is within acceptable drift range'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Rebalancing Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-lg p-6 border border-blue-500/30">
          <h3 className="text-lg font-semibold mb-4 text-blue-400">Taxable Account Schedule</h3>
          <div className="space-y-3 text-sm text-slate-300">
            <div>
              <div className="font-semibold mb-1">Frequency: Annual</div>
              <div className="text-xs text-slate-400">Review in December, execute in January</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Triggers:</div>
              <ul className="text-xs space-y-1 ml-4 list-disc">
                <li>Any holding drifts &gt;10% from target</li>
                <li>Total portfolio drift &gt;15%</li>
                <li>New contributions available</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-1">Tax Considerations:</div>
              <ul className="text-xs space-y-1 ml-4 list-disc">
                <li>Harvest losses when selling</li>
                <li>Hold winners &gt;1 year for LTCG</li>
                <li>Use new money to rebalance first</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-6 border border-purple-500/30">
          <h3 className="text-lg font-semibold mb-4 text-purple-400">Tax-Advantaged Accounts</h3>
          <div className="space-y-3 text-sm text-slate-300">
            <div>
              <div className="font-semibold mb-1">Frequency: Semi-Annual</div>
              <div className="text-xs text-slate-400">Review June & December</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Triggers:</div>
              <ul className="text-xs space-y-1 ml-4 list-disc">
                <li>Any holding drifts &gt;5% from target</li>
                <li>Total portfolio drift &gt;10%</li>
                <li>Market regime change</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-1">Tax Advantages:</div>
              <ul className="text-xs space-y-1 ml-4 list-disc">
                <li>No tax consequences on trades</li>
                <li>Can rebalance aggressively</li>
                <li>Rebalance here first</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Holdings Needing Rebalancing */}
      {rebalancingMetrics.needsRebalancing.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/30">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">
            Holdings Requiring Action ({rebalancingMetrics.needsRebalancing.length})
          </h3>
          
          <div className="space-y-3">
            {rebalancingMetrics.needsRebalancing.map((holding) => {
              const isOverweight = holding.drift > 0;
              const action = isOverweight ? 'Sell' : 'Buy';
              const actionAmount = Math.abs(holding.currentAmount - holding.targetAmount);
              
              return (
                <div key={holding.symbol} className={`rounded p-4 ${
                  isOverweight ? 'bg-red-900/20 border border-red-600/30' : 'bg-green-900/20 border border-green-600/30'
                }`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-lg text-blue-400">{holding.symbol}</div>
                      <div className="text-xs text-slate-400">{holding.etf?.name || holding.symbol}</div>
                    </div>
                    <div className={`text-lg font-bold ${isOverweight ? 'text-red-400' : 'text-green-400'}`}>
                      {isOverweight ? '+' : ''}{formatPercent(holding.drift)} drift
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <div className="text-xs text-slate-500">Target:</div>
                      <div className="text-slate-200 font-semibold">{formatPercent(holding.targetWeight)}</div>
                      <div className="text-xs text-slate-400">{formatCurrency(holding.targetAmount)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Current:</div>
                      <div className="text-slate-200 font-semibold">{formatPercent(holding.currentWeight)}</div>
                      <div className="text-xs text-slate-400">{formatCurrency(holding.currentAmount)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Action:</div>
                      <div className={`font-semibold ${isOverweight ? 'text-red-400' : 'text-green-400'}`}>
                        {action}
                      </div>
                      <div className="text-xs text-slate-400">{formatCurrency(actionAmount)}</div>
                    </div>
                  </div>

                  {holding.etf?.taxEfficiency === 'low' && (
                    <div className="pt-3 border-t border-slate-600 text-xs text-yellow-400">
                      ⚠️ Tax-inefficient: Rebalance in IRA/Roth first to avoid ordinary income taxes
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rebalancing Methods */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-blue-400">Rebalancing Methods</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold mb-3 text-green-400">1. New Contributions</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <div><strong>Most Tax-Efficient:</strong> Buy underweight positions with new money</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <div>No capital gains triggered</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <div>Use quarterly or monthly contributions</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <div>Best for taxable accounts</div>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-yellow-400">2. Threshold Rebalancing</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">→</span>
                <div><strong>Trigger-Based:</strong> Rebalance when drift exceeds threshold</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">→</span>
                <div>5% drift in tax-advantaged</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">→</span>
                <div>10% drift in taxable</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">→</span>
                <div>Avoids over-trading</div>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-purple-400">3. Calendar Rebalancing</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <div><strong>Time-Based:</strong> Set schedule regardless of drift</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <div>Annual for taxable accounts</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <div>Semi-annual for IRAs</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <div>Simple, disciplined approach</div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Market Regime Adjustments */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg p-6 border border-slate-600/30">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">
          Current Regime: <span className="text-blue-400 capitalize">{marketRegime}</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3 text-green-400">When to Rebalance MORE Often:</h4>
            <ul className="space-y-1 text-sm text-slate-300">
              <li>• High volatility periods (VIX &gt;25)</li>
              <li>• Strong momentum markets (trending hard)</li>
              <li>• After major market moves (&gt;10% in month)</li>
              <li>• When transitioning regimes</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-orange-400">When to Rebalance LESS Often:</h4>
            <ul className="space-y-1 text-sm text-slate-300">
              <li>• Strong bull markets (let winners run)</li>
              <li>• Low volatility environments (drift minimal)</li>
              <li>• Tax harvesting opportunities pending</li>
              <li>• During contribution accumulation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tax-Efficient Rebalancing Workflow */}
      <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4">
        <h4 className="font-semibold text-purple-400 mb-3">📋 Tax-Efficient Rebalancing Workflow</h4>
        <div className="space-y-2 text-sm text-slate-300">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-bold">1</span>
            <div>Check IRA/Roth accounts first - rebalance here (no tax consequences)</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-bold">2</span>
            <div>Use new contributions to buy underweight positions in taxable</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-bold">3</span>
            <div>Harvest tax losses when selling overweight positions</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-bold">4</span>
            <div>If gains unavoidable, prioritize long-term over short-term (15% vs 24%+)</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-bold">5</span>
            <div>Consider waiting until January for year-end tax optimization</div>
          </div>
        </div>
      </div>

      {/* Rebalancing Costs */}
      <div className="bg-slate-800/50 border border-slate-600/30 rounded-lg p-4">
        <h4 className="font-semibold text-slate-200 mb-3">💰 Rebalancing Costs to Consider</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-300">
          <div>
            <div className="font-semibold mb-2">Trading Costs:</div>
            <ul className="space-y-1 text-xs">
              <li>• Most brokers: $0 commission</li>
              <li>• Bid-ask spreads (minimal for ETFs)</li>
              <li>• Market impact (negligible for small accounts)</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Tax Costs:</div>
            <ul className="space-y-1 text-xs">
              <li>• Short-term gains: Up to 37%</li>
              <li>• Long-term gains: 15-20%</li>
              <li>• Ordinary income from dividends</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Opportunity Costs:</div>
            <ul className="space-y-1 text-xs">
              <li>• Missing momentum in winners</li>
              <li>• Behavioral costs (regret, timing)</li>
              <li>• Time and attention required</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RebalancingTab;
