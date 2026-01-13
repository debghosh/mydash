// =============================================================================
// ALPHATIC - ALPHA TAB COMPONENT
// =============================================================================
// Expected returns, alpha generation, factor attribution, and risk metrics
// Auto-recalculates when portfolio allocation changes
// =============================================================================

import React, { useMemo } from 'react';
import { ETF_UNIVERSE } from '../../data';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const AlphaTab = ({ 
  allocation,
  marketRegime,
  taxableAmount,
  iraAmount,
  rothAmount,
  isValid 
}) => {
  
  // Calculate expected returns and alpha
  const alphaAnalysis = useMemo(() => {
    if (!allocation || !isValid) {
      return null;
    }

    const totalPortfolio = taxableAmount + iraAmount + rothAmount;
    
    // Base return expectations by regime
    const baseReturns = {
      goldilocks: 14,
      boom: 11,
      uncertainty: 7,
      grind: 8,
      crisis: -5
    };
    const marketReturn = baseReturns[marketRegime] || 7;
    
    // Calculate factor tilts from allocation
    let growthTilt = 0;
    let valueTilt = 0;
    let momentumTilt = 0;
    let qualityTilt = 0;
    let dividendTilt = 0;
    let volatilityExposure = 0;
    
    Object.entries(allocation).forEach(([symbol, weight]) => {
      const etf = ETF_UNIVERSE[symbol];
      if (!etf) return;
      
      const w = weight / 100;
      
      // Factor classification
      if (etf.factor === 'Growth' || etf.factor === 'Tech/Growth') {
        growthTilt += w;
      } else if (etf.factor === 'Value' || etf.factor === 'Value/Small') {
        valueTilt += w;
      } else if (etf.factor === 'Momentum') {
        momentumTilt += w;
      } else if (etf.factor === 'Quality') {
        qualityTilt += w;
      } else if (etf.factor.includes('Dividend') || etf.factor.includes('Income')) {
        dividendTilt += w;
      } else if (etf.factor === 'Low Volatility') {
        volatilityExposure -= w * 0.5; // Reduces volatility
      }
      
      // High volatility assets
      if (etf.factor === 'Innovation' || etf.symbol === 'ARKK') {
        volatilityExposure += w * 1.5;
      }
    });
    
    // Calculate factor alpha contributions by regime
    const factorAlphas = {
      goldilocks: {
        growth: 0.5,
        value: -0.3,
        momentum: 0.8,
        quality: 0.3,
        dividend: 0.2
      },
      boom: {
        growth: 0.8,
        value: 0.0,
        momentum: 1.2,
        quality: 0.5,
        dividend: -0.2
      },
      uncertainty: {
        growth: 0.3,
        value: 0.8,
        momentum: 0.5,
        quality: 1.0,
        dividend: 0.6
      },
      grind: {
        growth: 0.2,
        value: 1.0,
        momentum: 0.3,
        quality: 0.8,
        dividend: 0.8
      },
      crisis: {
        growth: -0.5,
        value: 0.5,
        momentum: -0.8,
        quality: 2.0,
        dividend: 1.2
      }
    };
    
    const regimeFactors = factorAlphas[marketRegime] || factorAlphas.uncertainty;
    
    const growthAlpha = growthTilt * regimeFactors.growth;
    const valueAlpha = valueTilt * regimeFactors.value;
    const momentumAlpha = momentumTilt * regimeFactors.momentum;
    const qualityAlpha = qualityTilt * regimeFactors.quality;
    const dividendAlpha = dividendTilt * regimeFactors.dividend;
    
    const totalAlpha = growthAlpha + valueAlpha + momentumAlpha + qualityAlpha + dividendAlpha;
    const totalReturn = marketReturn + totalAlpha;
    
    // Risk metrics (simplified)
    const baseVolatility = 15; // 15% base volatility
    const portfolioVolatility = baseVolatility + (volatilityExposure * 5);
    const sharpeRatio = (totalReturn - 4) / portfolioVolatility; // Assuming 4% risk-free rate
    
    // Diversification score
    const holdingsCount = Object.keys(allocation).length;
    const diversificationScore = Math.min(100, holdingsCount * 5); // Max 100, 5 points per holding
    
    // Concentration risk
    const maxWeight = Math.max(...Object.values(allocation));
    const concentrationRisk = maxWeight > 20 ? 'High' : maxWeight > 10 ? 'Medium' : 'Low';
    
    return {
      marketReturn,
      totalAlpha,
      totalReturn,
      portfolioVolatility,
      sharpeRatio,
      factorBreakdown: {
        growth: { tilt: growthTilt * 100, alpha: growthAlpha },
        value: { tilt: valueTilt * 100, alpha: valueAlpha },
        momentum: { tilt: momentumTilt * 100, alpha: momentumAlpha },
        quality: { tilt: qualityTilt * 100, alpha: qualityAlpha },
        dividend: { tilt: dividendTilt * 100, alpha: dividendAlpha }
      },
      diversificationScore,
      concentrationRisk,
      holdingsCount,
      maxWeight
    };
  }, [allocation, marketRegime, taxableAmount, iraAmount, rothAmount, isValid]);

  if (!isValid || !alphaAnalysis) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-xl font-semibold text-yellow-400">Portfolio Not Complete</h3>
        </div>
        <p className="text-slate-300">
          Please complete your portfolio allocation (must total 100%) to see expected returns analysis.
        </p>
        <p className="text-sm text-slate-400 mt-2">
          Go to the <strong>Portfolio Builder</strong> tab to create or load a portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Expected Returns & Alpha Analysis</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-lg p-4 border border-green-500/30">
          <div className="text-sm text-slate-400 mb-1">Expected Return</div>
          <div className="text-2xl font-bold text-green-400">
            {formatPercent(alphaAnalysis.totalReturn)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Annual expected
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-4 border border-purple-500/30">
          <div className="text-sm text-slate-400 mb-1">Alpha Generated</div>
          <div className="text-2xl font-bold text-purple-400">
            +{formatPercent(alphaAnalysis.totalAlpha)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            vs {formatPercent(alphaAnalysis.marketReturn)} market
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-lg p-4 border border-blue-500/30">
          <div className="text-sm text-slate-400 mb-1">Sharpe Ratio</div>
          <div className="text-2xl font-bold text-blue-400">
            {alphaAnalysis.sharpeRatio.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Risk-adjusted return
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-900/20 to-amber-900/20 rounded-lg p-4 border border-orange-500/30">
          <div className="text-sm text-slate-400 mb-1">Volatility</div>
          <div className="text-2xl font-bold text-orange-400">
            {formatPercent(alphaAnalysis.portfolioVolatility)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Expected annual
          </div>
        </div>
      </div>

      {/* Market Regime Context */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2 text-blue-400">
          Current Market Regime: <span className="capitalize">{marketRegime}</span>
        </h3>
        <p className="text-sm text-slate-300">
          Expected market return in this regime: <strong>{formatPercent(alphaAnalysis.marketReturn)}</strong>
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Your portfolio's factor tilts generate <strong>+{formatPercent(alphaAnalysis.totalAlpha)}</strong> alpha in this regime,
          for a total expected return of <strong>{formatPercent(alphaAnalysis.totalReturn)}</strong>.
        </p>
      </div>

      {/* Factor Attribution */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/30">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">Factor Attribution Analysis</h3>
        
        <div className="space-y-4">
          {Object.entries(alphaAnalysis.factorBreakdown).map(([factor, data]) => {
            const isPositive = data.alpha >= 0;
            const colorClass = isPositive ? 'text-green-400' : 'text-red-400';
            const bgClass = isPositive ? 'bg-green-900/20' : 'bg-red-900/20';
            
            if (data.tilt === 0) return null; // Skip factors with no exposure
            
            return (
              <div key={factor} className={`${bgClass} rounded p-4`}>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-semibold text-slate-200 capitalize">{factor} Factor</span>
                    <span className="text-xs text-slate-400 ml-2">
                      ({formatPercent(data.tilt)} of portfolio)
                    </span>
                  </div>
                  <div className={`text-lg font-bold ${colorClass}`}>
                    {isPositive ? '+' : ''}{formatPercent(data.alpha)}
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-slate-700 rounded h-2">
                  <div 
                    className={`h-2 rounded ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, Math.abs(data.tilt))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-blue-900/20 rounded border border-blue-600/30">
          <div className="text-xs text-slate-400">
            <strong>Factor Attribution:</strong> Shows how each factor tilt in your portfolio contributes to alpha.
            In the current <strong>{marketRegime}</strong> regime, different factors perform differently.
          </div>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/30">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Risk Metrics</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Volatility (Annual):</span>
              <span className="text-slate-200 font-semibold">{formatPercent(alphaAnalysis.portfolioVolatility)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sharpe Ratio:</span>
              <span className="text-slate-200 font-semibold">{alphaAnalysis.sharpeRatio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Max Single Position:</span>
              <span className="text-slate-200 font-semibold">{formatPercent(alphaAnalysis.maxWeight)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Concentration Risk:</span>
              <span className={`font-semibold ${
                alphaAnalysis.concentrationRisk === 'High' ? 'text-red-400' :
                alphaAnalysis.concentrationRisk === 'Medium' ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {alphaAnalysis.concentrationRisk}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/30">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Diversification</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Holdings Count:</span>
              <span className="text-slate-200 font-semibold">{alphaAnalysis.holdingsCount} ETFs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Diversification Score:</span>
              <span className="text-slate-200 font-semibold">{alphaAnalysis.diversificationScore}/100</span>
            </div>
            
            {/* Diversification bar */}
            <div className="mt-4">
              <div className="w-full bg-slate-700 rounded h-4">
                <div 
                  className={`h-4 rounded ${
                    alphaAnalysis.diversificationScore >= 80 ? 'bg-green-500' :
                    alphaAnalysis.diversificationScore >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${alphaAnalysis.diversificationScore}%` }}
                />
              </div>
              <div className="text-xs text-slate-400 mt-2">
                {alphaAnalysis.diversificationScore >= 80 ? 'Excellent diversification' :
                 alphaAnalysis.diversificationScore >= 50 ? 'Adequate diversification' :
                 'Consider adding more holdings'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sharpe Ratio Explanation */}
      <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4">
        <h4 className="font-semibold text-purple-400 mb-3">📊 Understanding Your Risk-Adjusted Returns</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-300">
          <div>
            <div className="font-semibold mb-2">Sharpe Ratio Guide:</div>
            <ul className="space-y-1 text-xs">
              <li>&lt; 0: Underperforming risk-free rate</li>
              <li>0 - 1.0: Good risk-adjusted returns</li>
              <li>1.0 - 2.0: Very good returns</li>
              <li>&gt; 2.0: Excellent (rare)</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Your Portfolio:</div>
            <ul className="space-y-1 text-xs">
              <li>Return: {formatPercent(alphaAnalysis.totalReturn)}</li>
              <li>Risk: {formatPercent(alphaAnalysis.portfolioVolatility)}</li>
              <li>Sharpe: {alphaAnalysis.sharpeRatio.toFixed(2)}</li>
              <li className={alphaAnalysis.sharpeRatio >= 1.0 ? 'text-green-400' : 'text-yellow-400'}>
                {alphaAnalysis.sharpeRatio >= 1.5 ? 'Excellent!' :
                 alphaAnalysis.sharpeRatio >= 1.0 ? 'Very good' :
                 alphaAnalysis.sharpeRatio >= 0.5 ? 'Good' :
                 'Consider optimization'}
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Optimization Tips:</div>
            <ul className="space-y-1 text-xs">
              <li>• Add low-correlation assets</li>
              <li>• Balance growth vs stability</li>
              <li>• Consider quality factors</li>
              <li>• Review concentration risk</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Strategy Recommendations */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
        <h4 className="font-semibold text-blue-400 mb-3">💡 Optimization Strategies for {marketRegime} Regime</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          <div>
            <div className="font-semibold mb-2">For Higher Returns:</div>
            <ul className="space-y-1 text-xs list-disc list-inside">
              {marketRegime === 'goldilocks' && (
                <>
                  <li>Increase growth and momentum tilts</li>
                  <li>Add tech sector exposure (VGT, XLK)</li>
                  <li>Consider Nasdaq-100 (QQQ)</li>
                </>
              )}
              {marketRegime === 'crisis' && (
                <>
                  <li>Focus on quality factors (QUAL)</li>
                  <li>Add defensive sectors (XLV, XLP)</li>
                  <li>Consider low volatility (USMV)</li>
                </>
              )}
              {(marketRegime === 'uncertainty' || marketRegime === 'grind') && (
                <>
                  <li>Balance growth and value</li>
                  <li>Add dividend growers (SCHD, VIG)</li>
                  <li>Consider quality tilt (QUAL)</li>
                </>
              )}
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">For Lower Risk:</div>
            <ul className="space-y-1 text-xs list-disc list-inside">
              <li>Add bonds for ballast (BND, AGG)</li>
              <li>Include low volatility factors (USMV)</li>
              <li>Increase diversification (15+ holdings)</li>
              <li>Reduce single position sizes (&lt;10%)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlphaTab;
