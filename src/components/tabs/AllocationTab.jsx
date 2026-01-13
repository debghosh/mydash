// =============================================================================
// ALPHATIC - ALLOCATION TAB COMPONENT
// =============================================================================
// Compare current portfolio vs recommended allocations
// Shows drift analysis and rebalancing recommendations
// Auto-recalculates when portfolio or market regime changes
// =============================================================================

import React, { useMemo } from 'react';
import { ETF_UNIVERSE, getAllocationByRegime, getAllocationByGoal } from '../../data';
import { formatPercent } from '../../utils/formatters';

const AllocationTab = ({ 
  allocation,
  marketRegime,
  selectedTemplate,
  isValid 
}) => {
  
  // Get recommended allocation based on template or regime
  const recommendedAllocation = useMemo(() => {
    if (selectedTemplate) {
      // Use template allocation if specified
      if (selectedTemplate.startsWith('regime-')) {
        const regime = selectedTemplate.replace('regime-', '');
        return getAllocationByRegime(regime);
      } else if (selectedTemplate.startsWith('goal-')) {
        const goal = selectedTemplate.replace('goal-', '');
        return getAllocationByGoal(goal);
      }
    }
    
    // Default to current market regime
    return getAllocationByRegime(marketRegime);
  }, [selectedTemplate, marketRegime]);

  // Calculate drift analysis
  const driftAnalysis = useMemo(() => {
    if (!allocation || !isValid || !recommendedAllocation) {
      return null;
    }

    const currentHoldings = new Set(Object.keys(allocation));
    const recommendedHoldings = new Set(Object.keys(recommendedAllocation));
    
    // Find differences
    const missing = [...recommendedHoldings].filter(x => !currentHoldings.has(x));
    const extra = [...currentHoldings].filter(x => !recommendedHoldings.has(x));
    const common = [...currentHoldings].filter(x => recommendedHoldings.has(x));
    
    // Calculate weight differences for common holdings
    const weightDifferences = common.map(symbol => {
      const currentWeight = allocation[symbol] || 0;
      const recommendedWeight = recommendedAllocation[symbol] || 0;
      const diff = currentWeight - recommendedWeight;
      const absDiff = Math.abs(diff);
      
      return {
        symbol,
        currentWeight,
        recommendedWeight,
        difference: diff,
        absDifference: absDiff,
        status: absDiff > 5 ? 'Large Drift' : absDiff > 2 ? 'Moderate Drift' : 'On Target'
      };
    }).sort((a, b) => b.absDifference - a.absDifference);
    
    // Calculate total drift (sum of absolute differences for common holdings)
    const totalDrift = weightDifferences.reduce((sum, item) => sum + item.absDifference, 0);
    
    // Add missing holdings to drift calculation
    const missingDrift = missing.reduce((sum, symbol) => sum + (recommendedAllocation[symbol] || 0), 0);
    
    // Add extra holdings to drift calculation
    const extraDrift = extra.reduce((sum, symbol) => sum + (allocation[symbol] || 0), 0);
    
    const overallDrift = totalDrift + missingDrift + extraDrift;
    
    // Determine if rebalancing is needed
    const needsRebalancing = overallDrift > 10;
    const rebalancingUrgency = overallDrift > 20 ? 'High' : overallDrift > 10 ? 'Medium' : 'Low';
    
    return {
      weightDifferences,
      missing,
      extra,
      totalDrift,
      missingDrift,
      extraDrift,
      overallDrift,
      needsRebalancing,
      rebalancingUrgency,
      commonCount: common.length,
      missingCount: missing.length,
      extraCount: extra.length
    };
  }, [allocation, recommendedAllocation, isValid]);

  if (!isValid) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-xl font-semibold text-yellow-400">Portfolio Not Complete</h3>
        </div>
        <p className="text-slate-300">
          Please complete your portfolio allocation (must total 100%) to see allocation analysis.
        </p>
        <p className="text-sm text-slate-400 mt-2">
          Go to the <strong>Portfolio Builder</strong> tab to create or load a portfolio.
        </p>
      </div>
    );
  }

  if (!driftAnalysis) {
    return (
      <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6">
        <p className="text-slate-300">Unable to load recommended allocation for comparison.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Portfolio Allocation Analysis</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`rounded-lg p-4 border ${
          driftAnalysis.overallDrift < 10 ? 'bg-green-900/20 border-green-500/30' :
          driftAnalysis.overallDrift < 20 ? 'bg-yellow-900/20 border-yellow-500/30' :
          'bg-red-900/20 border-red-500/30'
        }`}>
          <div className="text-sm text-slate-400 mb-1">Overall Drift</div>
          <div className={`text-2xl font-bold ${
            driftAnalysis.overallDrift < 10 ? 'text-green-400' :
            driftAnalysis.overallDrift < 20 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {formatPercent(driftAnalysis.overallDrift)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            From recommended
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-lg p-4 border border-blue-500/30">
          <div className="text-sm text-slate-400 mb-1">Common Holdings</div>
          <div className="text-2xl font-bold text-blue-400">
            {driftAnalysis.commonCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Matching recommended
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-900/20 to-amber-900/20 rounded-lg p-4 border border-orange-500/30">
          <div className="text-sm text-slate-400 mb-1">Missing Holdings</div>
          <div className="text-2xl font-bold text-orange-400">
            {driftAnalysis.missingCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {formatPercent(driftAnalysis.missingDrift)} underweight
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-4 border border-purple-500/30">
          <div className="text-sm text-slate-400 mb-1">Extra Holdings</div>
          <div className="text-2xl font-bold text-purple-400">
            {driftAnalysis.extraCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {formatPercent(driftAnalysis.extraDrift)} not in template
          </div>
        </div>
      </div>

      {/* Rebalancing Recommendation */}
      {driftAnalysis.needsRebalancing && (
        <div className={`border rounded-lg p-4 ${
          driftAnalysis.rebalancingUrgency === 'High' ? 'bg-red-900/20 border-red-600/30' :
          'bg-yellow-900/20 border-yellow-600/30'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{driftAnalysis.rebalancingUrgency === 'High' ? '🚨' : '⚠️'}</span>
            <div>
              <h3 className={`font-semibold ${
                driftAnalysis.rebalancingUrgency === 'High' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                Rebalancing Recommended - {driftAnalysis.rebalancingUrgency} Priority
              </h3>
              <p className="text-sm text-slate-300 mt-1">
                Your portfolio has drifted {formatPercent(driftAnalysis.overallDrift)} from the recommended allocation.
                {driftAnalysis.rebalancingUrgency === 'High' && ' Consider rebalancing soon.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Weight Differences for Common Holdings */}
      {driftAnalysis.weightDifferences.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/30">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Weight Differences</h3>
          
          <div className="space-y-3">
            {driftAnalysis.weightDifferences.map((item) => {
              const isOverweight = item.difference > 0;
              const colorClass = Math.abs(item.difference) > 5 ? 'text-red-400' :
                                Math.abs(item.difference) > 2 ? 'text-yellow-400' :
                                'text-green-400';
              
              return (
                <div key={item.symbol} className="bg-slate-700/50 rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-blue-400">{item.symbol}</span>
                      <span className="text-xs text-slate-400 ml-2">
                        {ETF_UNIVERSE[item.symbol]?.name || item.symbol}
                      </span>
                    </div>
                    <div className={`text-sm font-semibold ${colorClass}`}>
                      {item.status}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-slate-500">Current</div>
                      <div className="text-slate-200 font-semibold">{formatPercent(item.currentWeight)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Recommended</div>
                      <div className="text-slate-200 font-semibold">{formatPercent(item.recommendedWeight)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Difference</div>
                      <div className={`font-semibold ${isOverweight ? 'text-orange-400' : 'text-cyan-400'}`}>
                        {isOverweight ? '+' : ''}{formatPercent(item.difference)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Visual bar */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 flex h-3 bg-slate-600 rounded overflow-hidden">
                      <div 
                        className="bg-cyan-500"
                        style={{ width: `${Math.min(100, item.recommendedWeight)}%` }}
                        title={`Recommended: ${item.recommendedWeight}%`}
                      />
                    </div>
                    <div className="flex-1 flex h-3 bg-slate-600 rounded overflow-hidden">
                      <div 
                        className={isOverweight ? 'bg-orange-500' : 'bg-blue-500'}
                        style={{ width: `${Math.min(100, item.currentWeight)}%` }}
                        title={`Current: ${item.currentWeight}%`}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>← Recommended</span>
                    <span>Current →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Missing Holdings */}
      {driftAnalysis.missing.length > 0 && (
        <div className="bg-orange-900/20 border border-orange-600/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-orange-400">
            Missing Holdings ({driftAnalysis.missing.length})
          </h3>
          <p className="text-sm text-slate-300 mb-4">
            These ETFs are in the recommended allocation but not in your current portfolio:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {driftAnalysis.missing.map((symbol) => {
              const etf = ETF_UNIVERSE[symbol];
              const recommendedWeight = recommendedAllocation[symbol] || 0;
              
              return (
                <div key={symbol} className="bg-slate-700/50 rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-blue-400">{symbol}</div>
                      <div className="text-xs text-slate-400">{etf?.name || symbol}</div>
                      {etf && (
                        <div className="text-xs text-slate-500 mt-1">
                          Factor: {etf.factor} | Yield: {formatPercent(etf.yield)}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-orange-400">
                        {formatPercent(recommendedWeight)}
                      </div>
                      <div className="text-xs text-slate-500">recommended</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Extra Holdings */}
      {driftAnalysis.extra.length > 0 && (
        <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-purple-400">
            Extra Holdings ({driftAnalysis.extra.length})
          </h3>
          <p className="text-sm text-slate-300 mb-4">
            These ETFs are in your portfolio but not in the recommended allocation:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {driftAnalysis.extra.map((symbol) => {
              const etf = ETF_UNIVERSE[symbol];
              const currentWeight = allocation[symbol] || 0;
              
              return (
                <div key={symbol} className="bg-slate-700/50 rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-blue-400">{symbol}</div>
                      <div className="text-xs text-slate-400">{etf?.name || symbol}</div>
                      {etf && (
                        <div className="text-xs text-slate-500 mt-1">
                          Factor: {etf.factor} | Yield: {formatPercent(etf.yield)}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-purple-400">
                        {formatPercent(currentWeight)}
                      </div>
                      <div className="text-xs text-slate-500">current</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-blue-900/20 rounded border border-blue-600/30">
            <div className="text-xs text-slate-400">
              <strong>Note:</strong> Extra holdings aren't necessarily bad - they may represent
              your customization or specific investment thesis. Review if they align with your strategy.
            </div>
          </div>
        </div>
      )}

      {/* Rebalancing Guide */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
        <h4 className="font-semibold text-blue-400 mb-3">📘 Rebalancing Guide</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          <div>
            <div className="font-semibold mb-2">When to Rebalance:</div>
            <ul className="space-y-1 text-xs list-disc list-inside">
              <li>Drift &gt; 20%: Rebalance immediately</li>
              <li>Drift 10-20%: Rebalance within 1-2 months</li>
              <li>Drift 5-10%: Consider at next review (quarterly)</li>
              <li>Drift &lt; 5%: No action needed</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Tax-Efficient Rebalancing:</div>
            <ul className="space-y-1 text-xs list-disc list-inside">
              <li>Rebalance in tax-advantaged accounts first (no tax)</li>
              <li>Use new contributions to rebalance</li>
              <li>Harvest tax losses when selling in taxable</li>
              <li>Hold winners &gt;1 year for long-term capital gains</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Current Regime Context */}
      <div className="bg-slate-800/50 border border-slate-600/30 rounded-lg p-4">
        <h4 className="font-semibold text-slate-200 mb-2">
          Comparison Base: <span className="text-blue-400 capitalize">{marketRegime}</span> Regime
        </h4>
        <p className="text-sm text-slate-300">
          Your allocation is being compared against the recommended allocation for the current {marketRegime} market regime.
          {selectedTemplate && ` (Using template: ${selectedTemplate})`}
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Change the market regime or load a different template to see how your portfolio compares to other strategies.
        </p>
      </div>
    </div>
  );
};

export default AllocationTab;
