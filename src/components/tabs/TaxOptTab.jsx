// =============================================================================
// ALPHATIC - TAX OPTIMIZATION TAB COMPONENT
// =============================================================================
// Tax optimization strategies and asset location guidance
// Auto-recalculates when portfolio changes
// =============================================================================

import React, { useMemo } from 'react';
import { ETF_UNIVERSE } from '../../data';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const TaxOptTab = ({ 
  allocation,
  taxableAmount,
  iraAmount,
  rothAmount,
  isValid 
}) => {
  
  // Analyze tax efficiency of current allocation
  const taxAnalysis = useMemo(() => {
    if (!allocation || !isValid) {
      return null;
    }

    const totalPortfolio = taxableAmount + iraAmount + rothAmount;
    
    // Categorize holdings by tax efficiency
    const highTaxEfficiency = [];
    const mediumTaxEfficiency = [];
    const lowTaxEfficiency = [];
    
    Object.entries(allocation).forEach(([symbol, weight]) => {
      const etf = ETF_UNIVERSE[symbol];
      if (!etf) return;
      
      const amount = totalPortfolio * (weight / 100);
      const holding = {
        symbol,
        name: etf.name,
        weight,
        amount,
        yield: etf.yield,
        taxEfficiency: etf.taxEfficiency,
        factor: etf.factor
      };
      
      if (etf.taxEfficiency === 'high') {
        highTaxEfficiency.push(holding);
      } else if (etf.taxEfficiency === 'medium') {
        mediumTaxEfficiency.push(holding);
      } else {
        lowTaxEfficiency.push(holding);
      }
    });

    return {
      highTaxEfficiency,
      mediumTaxEfficiency,
      lowTaxEfficiency,
      totalPortfolio
    };
  }, [allocation, taxableAmount, iraAmount, rothAmount, isValid]);

  if (!isValid || !taxAnalysis) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-xl font-semibold text-yellow-400">Portfolio Not Complete</h3>
        </div>
        <p className="text-slate-300">
          Please complete your portfolio allocation (must total 100%) to see tax optimization strategies.
        </p>
        <p className="text-sm text-slate-400 mt-2">
          Go to the <strong>Portfolio Builder</strong> tab to create or load a portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Tax Optimization Strategies</h2>

      {/* Tax Efficiency Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-lg p-4 border border-green-500/30">
          <div className="text-sm text-slate-400 mb-1">Tax-Efficient Holdings</div>
          <div className="text-2xl font-bold text-green-400">
            {taxAnalysis.highTaxEfficiency.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {formatCurrency(taxAnalysis.highTaxEfficiency.reduce((sum, h) => sum + h.amount, 0))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 rounded-lg p-4 border border-yellow-500/30">
          <div className="text-sm text-slate-400 mb-1">Medium Efficiency</div>
          <div className="text-2xl font-bold text-yellow-400">
            {taxAnalysis.mediumTaxEfficiency.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {formatCurrency(taxAnalysis.mediumTaxEfficiency.reduce((sum, h) => sum + h.amount, 0))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-lg p-4 border border-red-500/30">
          <div className="text-sm text-slate-400 mb-1">Tax-Inefficient Holdings</div>
          <div className="text-2xl font-bold text-red-400">
            {taxAnalysis.lowTaxEfficiency.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {formatCurrency(taxAnalysis.lowTaxEfficiency.reduce((sum, h) => sum + h.amount, 0))}
          </div>
        </div>
      </div>

      {/* Asset Location Strategy */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-600/30">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">Optimal Asset Location</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="font-semibold mb-3 text-green-400 flex items-center gap-2">
              <span>🟢</span> Taxable Account
            </div>
            {taxAnalysis.highTaxEfficiency.length > 0 ? (
              <div className="space-y-2">
                {taxAnalysis.highTaxEfficiency.map((holding) => (
                  <div key={holding.symbol} className="bg-green-900/20 rounded p-3 border border-green-600/30">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-sm text-green-400">{holding.symbol}</div>
                      <div className="text-xs text-slate-400">{formatPercent(holding.weight)}</div>
                    </div>
                    <div className="text-xs text-slate-300">{holding.name}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Yield: {formatPercent(holding.yield)} | {holding.factor}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">No tax-efficient holdings</div>
            )}
          </div>

          <div>
            <div className="font-semibold mb-3 text-purple-400 flex items-center gap-2">
              <span>🟣</span> Traditional IRA
            </div>
            {taxAnalysis.lowTaxEfficiency.length > 0 ? (
              <div className="space-y-2">
                {taxAnalysis.lowTaxEfficiency.map((holding) => (
                  <div key={holding.symbol} className="bg-purple-900/20 rounded p-3 border border-purple-600/30">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-sm text-purple-400">{holding.symbol}</div>
                      <div className="text-xs text-slate-400">{formatPercent(holding.weight)}</div>
                    </div>
                    <div className="text-xs text-slate-300">{holding.name}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Yield: {formatPercent(holding.yield)} | {holding.factor}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">No tax-inefficient holdings</div>
            )}
          </div>

          <div>
            <div className="font-semibold mb-3 text-cyan-400 flex items-center gap-2">
              <span>🔵</span> Roth IRA
            </div>
            <div className="bg-cyan-900/20 rounded p-4 border border-cyan-600/30">
              <div className="text-sm text-slate-300 mb-2">
                <strong>Best for:</strong>
              </div>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• High-growth assets</li>
                <li>• Long-term holds (10+ years)</li>
                <li>• Tax-inefficient with growth potential</li>
                <li>• No RMDs = indefinite tax-free growth</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Optimization Strategies */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-blue-400">Tax Minimization Strategies</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3 text-green-400">Income Tax Strategies</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <div>
                  <strong>Qualified Dividends:</strong> Hold dividend ETFs in taxable for 15% rate vs 24% ordinary
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <div>
                  <strong>Foreign Tax Credit:</strong> Hold international ETFs in taxable to claim credits
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <div>
                  <strong>Municipal Bonds:</strong> Consider for taxable if in high tax bracket
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <div>
                  <strong>LTCG Rates:</strong> Hold &gt;1 year for 15-20% vs 24-37% short-term
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-orange-400">Tax-Loss Harvesting</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-1">→</span>
                <div>
                  <strong>Harvest Losses:</strong> Sell losing positions to offset gains (taxable accounts only)
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-1">→</span>
                <div>
                  <strong>Wash Sale Rule:</strong> Wait 31 days before repurchasing (or buy similar ETF)
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-1">→</span>
                <div>
                  <strong>$3,000 Deduction:</strong> Unused losses deduct against ordinary income
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-1">→</span>
                <div>
                  <strong>Carry Forward:</strong> Losses roll forward indefinitely to future years
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Roth Conversion Benefits */}
      <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-purple-400">Roth Conversion Tax Benefits</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="font-semibold mb-2 text-cyan-400">Future Tax-Free Withdrawals:</div>
            <ul className="space-y-1 text-xs text-slate-300">
              <li>• No taxes on Roth distributions</li>
              <li>• No RMDs = control withdrawal timing</li>
              <li>• Lower MAGI = lower Medicare premiums</li>
              <li>• Save ~$6K-$12K/year on IRMAA</li>
            </ul>
          </div>

          <div>
            <div className="font-semibold mb-2 text-green-400">Estate Planning:</div>
            <ul className="space-y-1 text-xs text-slate-300">
              <li>• Tax-free inheritance for heirs</li>
              <li>• No income tax on distributions</li>
              <li>• 10-year distribution stretch</li>
              <li>• Better than Traditional IRA legacy</li>
            </ul>
          </div>

          <div>
            <div className="font-semibold mb-2 text-blue-400">Tax Rate Arbitrage:</div>
            <ul className="space-y-1 text-xs text-slate-300">
              <li>• Convert at 24% now</li>
              <li>• Avoid 32%+ in retirement</li>
              <li>• Hedge against higher future rates</li>
              <li>• Lock in today's tax code</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Critical Tax Rules */}
      <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
        <h4 className="font-semibold text-red-400 mb-3">⚠️ Critical Tax Rules to Never Violate</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          <div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✗</span>
                <div><strong>NEVER</strong> hold REITs (VNQ) in taxable - distributions taxed as ordinary income (24%+)</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✗</span>
                <div><strong>NEVER</strong> hold covered calls (JEPI/JEPQ) in taxable - income taxed at ordinary rates</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✗</span>
                <div><strong>NEVER</strong> hold bonds in taxable - interest taxed as ordinary income</div>
              </li>
            </ul>
          </div>
          <div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">✓</span>
                <div><strong>ALWAYS</strong> hold dividend ETFs (SCHD/VYM) in taxable - qualified dividend treatment (15%)</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">✓</span>
                <div><strong>ALWAYS</strong> hold international stocks in taxable - foreign tax credit available</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold">✓</span>
                <div><strong>ALWAYS</strong> hold growth stocks &gt;1 year - long-term capital gains (15-20%)</div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Year-End Tax Planning */}
      <div className="bg-slate-800/50 border border-slate-600/30 rounded-lg p-4">
        <h4 className="font-semibold text-slate-200 mb-3">📅 Year-End Tax Planning Checklist</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          <div>
            <div className="font-semibold mb-2">Before December 31:</div>
            <ul className="space-y-1 text-xs list-disc list-inside">
              <li>Harvest tax losses in taxable accounts</li>
              <li>Realize gains in low-income years</li>
              <li>Complete Roth conversions (before year-end)</li>
              <li>Max out 401(k) and IRA contributions</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Before April 15 (prior year):</div>
            <ul className="space-y-1 text-xs list-disc list-inside">
              <li>Make IRA contributions for prior year</li>
              <li>Contribute to HSA for prior year</li>
              <li>Pay estimated taxes (if required)</li>
              <li>File extension if needed (Oct 15)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxOptTab;
