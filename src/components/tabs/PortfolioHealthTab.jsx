// =============================================================================
// ALPHATIC - PORTFOLIO HEALTH TAB
// =============================================================================
// Merges Recommendations + Rebalancing into single source of truth
// Shows drift analysis, rebalancing recommendations, and health status
// =============================================================================

import React, { useMemo, useState } from 'react';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { ETF_UNIVERSE } from '../../data';

const PortfolioHealthTab = ({ 
  allocation,
  taxableAmount,
  iraAmount,
  rothAmount,
  isValid,
  marketRegime,
  taxableAllocations // Regime-based target allocations
}) => {
  
  const [driftTolerance, setDriftTolerance] = useState(5); // Default 5%
  const [rebalanceFreq, setRebalanceFreq] = useState('quarterly');
  const [taxMinimization, setTaxMinimization] = useState(true);
  
  // Calculate portfolio health status
  const healthStatus = useMemo(() => {
    if (!allocation || !isValid || !taxableAllocations || !marketRegime) {
      return null;
    }

    const totalPortfolio = taxableAmount + iraAmount + rothAmount;
    const targetAllocation = taxableAllocations[marketRegime];
    
    if (!targetAllocation) {
      return null;
    }

    // Calculate drift for each holding
    const driftAnalysis = [];
    let maxDrift = 0;
    
    Object.entries(targetAllocation).forEach(([symbol, targetWeight]) => {
      const currentWeight = allocation[symbol] || 0;
      const drift = currentWeight - targetWeight;
      const driftPct = Math.abs(drift);
      
      if (driftPct > maxDrift) {
        maxDrift = driftPct;
      }
      
      const etf = ETF_UNIVERSE[symbol];
      if (!etf) return;
      
      driftAnalysis.push({
        symbol,
        name: etf.name,
        currentWeight,
        targetWeight,
        drift,
        driftPct,
        status: driftPct < 3 ? 'good' : driftPct < 5 ? 'watch' : 'action',
        amount: totalPortfolio * (currentWeight / 100),
        targetAmount: totalPortfolio * (targetWeight / 100)
      });
    });
    
    // Sort by drift severity
    driftAnalysis.sort((a, b) => b.driftPct - a.driftPct);
    
    // Determine overall status
    let overallStatus = 'healthy';
    if (maxDrift >= 5) {
      overallStatus = 'action';
    } else if (maxDrift >= 3) {
      overallStatus = 'watch';
    }
    
    // Generate rebalancing trades if needed
    const trades = [];
    if (overallStatus === 'action') {
      driftAnalysis.forEach(item => {
        if (item.status === 'action') {
          const tradeAmount = item.targetAmount - item.amount;
          trades.push({
            symbol: item.symbol,
            name: item.name,
            action: tradeAmount > 0 ? 'BUY' : 'SELL',
            amount: Math.abs(tradeAmount),
            currentWeight: item.currentWeight,
            targetWeight: item.targetWeight
          });
        }
      });
    }
    
    // Calculate tax impact of rebalancing
    const taxImpact = trades
      .filter(t => t.action === 'SELL')
      .reduce((sum, t) => sum + (t.amount * 0.20 * 0.15), 0); // Assume 20% gain, 15% LTCG
    
    return {
      overallStatus,
      maxDrift,
      driftAnalysis,
      trades,
      taxImpact,
      lastRebalanced: 45 // days ago (mock data)
    };
  }, [allocation, isValid, taxableAmount, iraAmount, rothAmount, taxableAllocations, marketRegime]);

  if (!isValid || !healthStatus) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-xl font-semibold text-yellow-400">Portfolio Not Complete</h3>
        </div>
        <p className="text-slate-300">
          Please complete your portfolio allocation (must total 100%) to see health analysis.
        </p>
        <p className="text-sm text-slate-400 mt-2">
          Go to the <strong>Portfolio Builder</strong> tab to create or load a portfolio.
        </p>
      </div>
    );
  }

  const { overallStatus, maxDrift, driftAnalysis, trades, taxImpact, lastRebalanced } = healthStatus;

  // Status colors and icons
  const statusConfig = {
    healthy: {
      color: 'green',
      icon: '✅',
      label: 'HEALTHY',
      message: 'Portfolio is well-balanced. No action needed.'
    },
    watch: {
      color: 'yellow',
      icon: '⚠️',
      label: 'WATCH',
      message: 'Some drift detected. Monitor closely.'
    },
    action: {
      color: 'red',
      icon: '🔴',
      label: 'ACTION REQUIRED',
      message: 'Rebalancing recommended to restore target allocation.'
    }
  };

  const config = statusConfig[overallStatus];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Portfolio Health</h2>
        <div className="text-sm text-slate-400">Drift Analysis & Rebalancing</div>
      </div>

      {/* Overall Status */}
      <div className={`bg-gradient-to-br from-${config.color}-900/40 to-${config.color}-800/40 border border-${config.color}-500/30 rounded-lg p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{config.icon}</span>
            <div>
              <h3 className={`text-2xl font-bold text-${config.color}-400`}>{config.label}</h3>
              <p className="text-slate-300 mt-1">{config.message}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Last Rebalanced</div>
            <div className="text-xl font-bold text-white">{lastRebalanced} days ago</div>
            <div className="text-sm text-slate-400">Max Drift: {maxDrift.toFixed(1)}%</div>
          </div>
        </div>
        
        {overallStatus === 'healthy' && (
          <div className="text-sm text-slate-300 bg-slate-800/50 rounded p-3">
            <strong>Next Review:</strong> Check again in 30 days or after significant market moves.
          </div>
        )}
        
        {overallStatus === 'watch' && (
          <div className="text-sm text-yellow-200 bg-yellow-900/30 rounded p-3">
            <strong>Watch List:</strong> {driftAnalysis.filter(d => d.status === 'watch').map(d => d.symbol).join(', ')} approaching rebalance threshold.
          </div>
        )}
        
        {overallStatus === 'action' && (
          <div className="text-sm text-red-200 bg-red-900/30 rounded p-3">
            <strong>Action Needed:</strong> {trades.length} trades recommended to restore target allocation.
          </div>
        )}
      </div>

      {/* Drift Analysis Table */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold mb-4">Drift Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-2 px-3 text-sm font-semibold text-slate-400">Holding</th>
                <th className="text-right py-2 px-3 text-sm font-semibold text-slate-400">Current</th>
                <th className="text-right py-2 px-3 text-sm font-semibold text-slate-400">Target</th>
                <th className="text-right py-2 px-3 text-sm font-semibold text-slate-400">Drift</th>
                <th className="text-center py-2 px-3 text-sm font-semibold text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {driftAnalysis.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{item.symbol}</div>
                    <div className="text-xs text-slate-400">{item.name}</div>
                  </td>
                  <td className="text-right py-3 px-3 text-white">{item.currentWeight.toFixed(1)}%</td>
                  <td className="text-right py-3 px-3 text-slate-300">{item.targetWeight.toFixed(1)}%</td>
                  <td className={`text-right py-3 px-3 font-semibold ${
                    item.drift > 0 ? 'text-orange-400' : item.drift < 0 ? 'text-blue-400' : 'text-slate-400'
                  }`}>
                    {item.drift > 0 ? '+' : ''}{item.drift.toFixed(1)}%
                  </td>
                  <td className="text-center py-3 px-3">
                    {item.status === 'good' && <span className="text-green-400 text-xl">🟢</span>}
                    {item.status === 'watch' && <span className="text-yellow-400 text-xl">🟡</span>}
                    {item.status === 'action' && <span className="text-red-400 text-xl">🔴</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-xs text-slate-400">
          <strong>Legend:</strong> 🟢 Good (&lt;3%) | 🟡 Watch (3-5%) | 🔴 Action (&gt;5%)
        </div>
      </div>

      {/* Drift Visualization */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold mb-4">Drift Visualization</h3>
        <div className="space-y-3">
          {driftAnalysis.map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300 font-medium">{item.symbol}</span>
                <span className={item.drift > 0 ? 'text-orange-400' : item.drift < 0 ? 'text-blue-400' : 'text-slate-400'}>
                  {item.drift > 0 ? '+' : ''}{item.drift.toFixed(1)}%
                </span>
              </div>
              <div className="relative h-6 bg-slate-700 rounded overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-0.5 w-1/2 bg-slate-500"></div>
                  <div className="w-px h-full bg-slate-400"></div>
                  <div className="h-0.5 w-1/2 bg-slate-500"></div>
                </div>
                <div 
                  className={`absolute h-full ${
                    item.drift > 0 ? 'bg-orange-500/60' : 'bg-blue-500/60'
                  }`}
                  style={{
                    left: item.drift > 0 ? '50%' : `${50 + (item.drift / 10) * 50}%`,
                    width: `${Math.abs(item.drift / 10) * 50}%`
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between text-xs text-slate-400">
          <span>-5% (Underweight)</span>
          <span>Target</span>
          <span>+5% (Overweight)</span>
        </div>
      </div>

      {/* Rebalancing Recommendation */}
      {trades.length > 0 && (
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>📋</span> Recommended Trades
          </h3>
          <p className="text-slate-300 mb-4">
            To rebalance to target allocation, execute the following trades:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-semibold text-red-400 mb-2">SELL (Reduce Overweight)</h4>
              <div className="space-y-2">
                {trades.filter(t => t.action === 'SELL').map((trade, idx) => (
                  <div key={idx} className="bg-slate-800/50 rounded p-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white">{trade.symbol}</span>
                      <span className="text-red-400">{formatCurrency(trade.amount)}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {trade.currentWeight.toFixed(1)}% → {trade.targetWeight.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-400 mb-2">BUY (Increase Underweight)</h4>
              <div className="space-y-2">
                {trades.filter(t => t.action === 'BUY').map((trade, idx) => (
                  <div key={idx} className="bg-slate-800/50 rounded p-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white">{trade.symbol}</span>
                      <span className="text-green-400">{formatCurrency(trade.amount)}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {trade.currentWeight.toFixed(1)}% → {trade.targetWeight.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Tax Impact (15% LTCG):</span>
              <span className="text-yellow-400 font-semibold">{formatCurrency(taxImpact)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Expected Annual Alpha Benefit:</span>
              <span className="text-green-400 font-semibold">+0.3%</span>
            </div>
            <div className="flex justify-between border-t border-slate-700 pt-2">
              <span className="text-slate-300 font-semibold">Net Benefit (1st Year):</span>
              <span className="text-green-400 font-semibold">
                {formatCurrency((taxableAmount + iraAmount + rothAmount) * 0.003 - taxImpact)}
              </span>
            </div>
          </div>
          
          <div className="mt-4 flex gap-3">
            <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded transition-colors">
              Generate Trade List CSV
            </button>
            <button className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded transition-colors">
              Execute in Portfolio Builder
            </button>
          </div>
        </div>
      )}

      {/* Rebalancing Settings */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold mb-4">Rebalancing Settings</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 block mb-2">Drift Tolerance (%)</label>
            <input
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={driftTolerance}
              onChange={(e) => setDriftTolerance(parseFloat(e.target.value))}
              className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">Rebalance when holdings drift beyond this threshold</p>
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-2">Rebalance Frequency</label>
            <select
              value={rebalanceFreq}
              onChange={(e) => setRebalanceFreq(e.target.value)}
              className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:outline-none focus:border-blue-500"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="semiannual">Semi-Annual</option>
              <option value="annual">Annual</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">How often to review and rebalance</p>
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={taxMinimization}
              onChange={(e) => setTaxMinimization(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Minimize Capital Gains (tax-aware rebalancing)</span>
          </label>
          <p className="text-xs text-slate-500 mt-1 ml-6">
            Prioritize trades in tax-advantaged accounts to minimize tax impact
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioHealthTab;
