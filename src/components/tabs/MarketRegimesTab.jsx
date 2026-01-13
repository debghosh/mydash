// =============================================================================
// ALPHATIC - MARKET REGIMES TAB
// =============================================================================
// Shows allocation recommendations for each market regime
// Displays factor performance by regime
// Allows selecting which regime to analyze
// =============================================================================

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MarketRegimesTab = ({ 
  marketRegime,
  setMarketRegime,
  allocations,
  regimeDefinitions,
  factorPerformance
}) => {
  
  // Prepare factor data for chart
  const factorData = useMemo(() => {
    if (!factorPerformance || !factorPerformance[marketRegime]) return [];
    
    return Object.entries(factorPerformance[marketRegime]).map(([factor, returnVal]) => ({
      name: factor,
      return: returnVal,
      spx: 10.0 // S&P 500 baseline
    }));
  }, [marketRegime, factorPerformance]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Market Regime Analysis</h2>
        <div className="text-sm text-slate-400">
          Current: <span className="font-semibold text-blue-400 capitalize">{regimeDefinitions[marketRegime]?.name || marketRegime}</span>
        </div>
      </div>
      
      {/* Regime Selector Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Select Market Regime to Analyze</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allocations && Object.keys(allocations).map(regime => (
            <div 
              key={regime} 
              className={`bg-slate-700 rounded-lg p-4 border-2 ${
                marketRegime === regime ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-transparent'
              } cursor-pointer hover:border-blue-400 transition-all`}
              onClick={() => setMarketRegime(regime)}
            >
              <h3 className="font-semibold mb-3 text-center capitalize text-lg">
                {regimeDefinitions[regime]?.name || regime}
              </h3>
              <div className="space-y-2 text-sm">
                {allocations[regime] && Object.entries(allocations[regime]).map(([name, value]) => (
                  <div key={name} className="flex justify-between">
                    <span className="text-slate-300">{name}</span>
                    <span className="font-semibold text-blue-400">{(value * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
              {marketRegime === regime && (
                <div className="mt-3 pt-3 border-t border-blue-500/30">
                  <div className="text-xs text-blue-300 text-center font-semibold">
                    ✓ Currently Selected
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Factor Performance Chart */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4">
          Factor Performance: {regimeDefinitions[marketRegime]?.name || marketRegime}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={factorData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" label={{ value: 'Return %', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
              formatter={(value) => `${value.toFixed(1)}%`}
            />
            <Legend />
            <Bar dataKey="return" fill="#8b5cf6" name="Factor Return" />
            <Bar dataKey="spx" fill="#3b82f6" name="S&P 500 Baseline" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Regime Insights */}
      <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-500/30">
        <h3 className="text-xl font-semibold mb-3">
          Key Insights: {regimeDefinitions[marketRegime]?.name || marketRegime} Market
        </h3>
        <div className="text-sm text-slate-300 space-y-2">
          {marketRegime === 'goldilocks' && (
            <>
              <p>• <strong>Momentum and Growth</strong> factors lead performance (+16-17% expected)</p>
              <p>• <strong>Reduce defensive</strong> positions, increase risk assets aggressively</p>
              <p>• <strong>Small cap and EM</strong> exposure beneficial in risk-on environment</p>
              <p>• <strong>Quality</strong> still performs well (+11%) for risk management</p>
            </>
          )}
          {marketRegime === 'boom' && (
            <>
              <p>• <strong>Growth and Quality</strong> factors outperform (+12-13%)</p>
              <p>• <strong>Momentum cools down</strong> as market heats up (still +11% but volatile)</p>
              <p>• <strong>Value picks up</strong> as rotation begins (+10%)</p>
              <p>• <strong>Start adding bonds</strong> as valuations stretch</p>
            </>
          )}
          {marketRegime === 'uncertainty' && (
            <>
              <p>• <strong>Quality and Value</strong> factors outperform in choppy markets (+11.5%, +9.2%)</p>
              <p>• <strong>Momentum underperforms</strong> significantly (+3%) - reduce exposure</p>
              <p>• <strong>Low Volatility</strong> provides stability (+8.9%)</p>
              <p>• <strong>Balanced allocation</strong> with defensive ballast recommended</p>
            </>
          )}
          {marketRegime === 'grind' && (
            <>
              <p>• <strong>Value and Quality</strong> lead in sideways markets (+10.8%, +10.5%)</p>
              <p>• <strong>Low Volatility</strong> shines (+9.2%) - defensive pays off</p>
              <p>• <strong>Growth still works</strong> (+8.1%) but avoid high valuations</p>
              <p>• <strong>Momentum limited</strong> (+6.5%) in range-bound conditions</p>
            </>
          )}
          {marketRegime === 'crisis' && (
            <>
              <p>• <strong>Quality and Low Volatility</strong> provide best protection (+1.2%, -3.8%)</p>
              <p>• <strong>Momentum crashes</strong> (-12.5%) - eliminate completely</p>
              <p>• <strong>Growth severely negative</strong> (-15.3%) - minimize exposure</p>
              <p>• <strong>Maximum bonds and gold</strong> (15%+ each) for capital preservation</p>
              <p>• <strong>Value holds up better</strong> (+2.3%) than growth in bear markets</p>
            </>
          )}
        </div>
      </div>

      {/* Regime Definitions Reference */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Market Regime Definitions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {regimeDefinitions && Object.entries(regimeDefinitions).map(([regime, def]) => (
            <div key={regime} className="bg-slate-700/50 rounded p-3">
              <div className="font-semibold text-blue-400 mb-1 capitalize">{def.name}</div>
              <div className="text-slate-300">{def.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-400 mb-2">💡 How to Use Market Regime Analysis</h4>
        <ol className="text-sm text-slate-300 space-y-1 ml-4">
          <li>1. <strong>Select a regime</strong> above to see recommended allocation</li>
          <li>2. <strong>Review factor performance</strong> to understand what works in each regime</li>
          <li>3. <strong>Compare with your current portfolio</strong> in the Recommendations tab</li>
          <li>4. <strong>Adjust allocation</strong> in Portfolio Builder based on regime outlook</li>
          <li>5. <strong>Move to Portfolio</strong> when ready to deploy</li>
        </ol>
      </div>
    </div>
  );
};

export default MarketRegimesTab;
