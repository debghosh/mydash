// =============================================================================
// ALPHATIC - ROTH CONVERSION TAB COMPONENT (FULLY RESTORED)
// =============================================================================
// Comprehensive Roth conversion strategy with educational content
// Auto-recalculates when IRA balance or conversion settings change
// Restored from original with all rich content and calculations
// =============================================================================

import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, 
  CartesianGrid, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const RothTab = ({ 
  iraAmount = 3500000,
  rothAmount = 0,
  taxableAmount = 3000000,
  currentAge = 60,
  continueAfterRMD = false,
  frontLoadConversions = false,
  conversionAmount = 250000,
  capitalGainsRate = 15
}) => {
  
  // =============================================================================
  // ROTH CONVERSION TIMELINE CALCULATION (Original Logic Restored)
  // =============================================================================
  
  const rothTimeline = useMemo(() => {
    const timeline = [];
    let remainingIRA = iraAmount;
    const annualReturn = 0.06;
    const yearsToConvert = continueAfterRMD ? 20 : 14;
    
    // 2026 Federal Tax Brackets (Single Filer)
    const calculateFederalTax = (taxableIncome) => {
      const brackets = [
        { limit: 11600, rate: 0.10 },
        { limit: 47150, rate: 0.12 },
        { limit: 100525, rate: 0.22 },
        { limit: 191950, rate: 0.24 },
        { limit: 243725, rate: 0.32 },
        { limit: 609350, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ];
      
      let tax = 0;
      let previousLimit = 0;
      
      for (const bracket of brackets) {
        if (taxableIncome > previousLimit) {
          const taxableInBracket = Math.min(taxableIncome - previousLimit, bracket.limit - previousLimit);
          tax += taxableInBracket * bracket.rate;
          previousLimit = bracket.limit;
        }
        if (taxableIncome <= bracket.limit) break;
      }
      
      return tax;
    };
    
    for (let year = 0; year < yearsToConvert; year++) {
      const age = 60 + year;
      const isPostRMD = age >= 73;
      
      // RMD amount if age 73+ (SECURE Act 2.0 - 2022 updated table)
      const rmdRate = age >= 73 ? (age === 73 ? 0.0377 : age === 74 ? 0.0392 : age === 75 ? 0.0407 : age === 76 ? 0.0422 : age === 77 ? 0.0437 : age === 78 ? 0.0453 : age === 79 ? 0.0470 : age === 80 ? 0.0495 : 0.055) : 0;
      const rmdAmount = isPostRMD ? remainingIRA * rmdRate : 0;
      
      // Determine conversion amount based on strategy
      let conversion;
      
      if (frontLoadConversions && !isPostRMD) {
        // FRONT-LOADING STRATEGY
        if (year <= 2) {
          conversion = 475000; // Years 1-3: Aggressive
        } else if (year <= 5) {
          conversion = 350000; // Years 4-6: Still aggressive
        } else if (year <= 9) {
          conversion = 250000; // Years 7-10: Standard
        } else if (year <= 13) {
          conversion = 200000; // Years 11-14: Taper
        } else {
          conversion = 150000; // Post-73: Minimal
        }
      } else {
        // STEADY STRATEGY
        conversion = year === 12 && !continueAfterRMD ? 300000 : 
                    year === 13 && !continueAfterRMD ? Math.min(remainingIRA, 950000) : 
                    conversionAmount;
      }
      
      // Reduce conversion if we have RMD
      if (isPostRMD) {
        conversion = Math.min(conversion, 200000);
      }
      
      conversion = Math.min(conversion, remainingIRA);
      
      // Calculate federal tax using PROPER marginal brackets
      const standardDeduction = age >= 65 ? 16550 : 14600; // 2026 estimates
      const otherIncome = 25000; // Estimated ordinary income
      const totalIncome = conversion + rmdAmount + otherIncome;
      const taxableIncome = Math.max(0, totalIncome - standardDeduction);
      
      const federalTax = calculateFederalTax(taxableIncome);
      const effectiveTaxRate = federalTax / conversion;
      
      // CRITICAL: Tax on Tax Calculation
      const taxPaymentNeeded = federalTax;
      const capitalGainsOnTaxPayment = (taxPaymentNeeded * 0.50) * (capitalGainsRate / 100);
      
      const totalTaxCost = federalTax + capitalGainsOnTaxPayment;
      
      // Medicare IRMAA impact (2-year lookback, modified AGI thresholds)
      const magi = totalIncome;
      const irmaaSurcharge = magi > 200000 ? 5800 : magi > 176000 ? 4200 : magi > 148000 ? 2800 : magi > 111000 ? 1400 : 0;
      
      timeline.push({
        year: 2026 + year,
        age,
        conversion: conversion,
        rmd: rmdAmount,
        ira: remainingIRA,
        federalTax: federalTax,
        taxRate: effectiveTaxRate,
        capitalGainsTax: capitalGainsOnTaxPayment,
        totalTaxCost: totalTaxCost,
        irmaa: irmaaSurcharge,
        allInCost: totalTaxCost + irmaaSurcharge,
        cumulativeConverted: timeline.reduce((sum, t) => sum + t.conversion, 0) + conversion,
        cumulativeTax: timeline.reduce((sum, t) => sum + t.allInCost, 0) + totalTaxCost + irmaaSurcharge
      });
      
      remainingIRA = Math.max(0, remainingIRA - conversion - rmdAmount) * (1 + annualReturn);
      
      if (remainingIRA < 10000) break;
    }
    
    return timeline;
  }, [iraAmount, conversionAmount, continueAfterRMD, capitalGainsRate, frontLoadConversions]);

  // =============================================================================
  // SUMMARY CALCULATIONS (Original Logic Restored)
  // =============================================================================
  
  const rothTotalCost = rothTimeline.reduce((sum, t) => sum + t.allInCost, 0);
  const rothSavings = 1200000 - rothTotalCost;
  const rothTotalFederalTax = rothTimeline.reduce((sum, t) => sum + t.federalTax, 0);
  const rothTotalCapitalGainsTax = rothTimeline.reduce((sum, t) => sum + t.capitalGainsTax, 0);
  const rothTotalConversion = rothTimeline.reduce((sum, t) => sum + t.conversion, 0);
  const rothTotalRMD = rothTimeline.reduce((sum, t) => sum + t.rmd, 0);
  const rothTotalIRMAA = rothTimeline.reduce((sum, t) => sum + t.irmaa, 0);

  // Empty state check
  if (!iraAmount || iraAmount === 0) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2 text-yellow-400">No IRA Balance</h3>
        <p className="text-slate-300">Enter your Traditional IRA balance in the Accounts tab to see Roth conversion projections.</p>
      </div>
    );
  }

  // =============================================================================
  // RENDER: FULLY RESTORED ORIGINAL CONTENT
  // =============================================================================
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Roth Conversion Strategy</h2>
      
      {/* SUMMARY CARD */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-6 border border-purple-500/30">
        <h3 className="text-xl font-semibold mb-2">
          {continueAfterRMD ? `${rothTimeline.length}-Year Conversion Plan (to age ${rothTimeline[rothTimeline.length-1]?.age || 80})` : '14-Year Conversion Plan (to age 73)'}
        </h3>
        <p className="text-slate-300 mb-4">Convert ${(conversionAmount / 1000).toFixed(0)}K annually, targeting 24% federal bracket</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-slate-400">Total to Convert</div>
            <div className="text-2xl font-bold">${((rothTimeline[rothTimeline.length-1]?.cumulativeConverted || iraAmount) / 1000000).toFixed(1)}M</div>
          </div>
          <div>
            <div className="text-slate-400">Federal Tax</div>
            <div className="text-2xl font-bold text-yellow-400">${(rothTotalFederalTax / 1000).toFixed(0)}K</div>
          </div>
          <div>
            <div className="text-slate-400">Tax-on-Tax</div>
            <div className="text-2xl font-bold text-orange-400">${(rothTotalCapitalGainsTax / 1000).toFixed(0)}K</div>
          </div>
          <div>
            <div className="text-slate-400">Total All-In Cost</div>
            <div className="text-2xl font-bold text-red-400">${(rothTotalCost / 1000).toFixed(0)}K</div>
          </div>
        </div>
      </div>

      {/* FRONT-LOADING STRATEGY */}
      {frontLoadConversions && (
        <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border-2 border-orange-600/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-orange-400">🚀 Front-Loading Strategy: Act NOW While Taxes Are Low</h3>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="bg-slate-800/50 rounded p-3">
              <div className="font-semibold mb-2 text-orange-400">Why Front-Load?</div>
              <ul className="space-y-1 ml-4 text-xs">
                <li>• <strong>Historical context:</strong> We're in a LOW tax environment right now</li>
                <li>• <strong>24% bracket</strong> is generous (historically, top rates were 50-90%)</li>
                <li>• <strong>Federal debt:</strong> $36 trillion and growing - taxes WILL rise</li>
                <li>• <strong>Better strategy:</strong> Pay 24-32% NOW vs 35-40%+ later</li>
              </ul>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded p-3">
                <div className="font-semibold mb-2 text-green-400">Standard Strategy</div>
                <div className="text-xs space-y-1">
                  <div>• $250K/year steady</div>
                  <div>• Stays in 24% bracket</div>
                  <div>• 14 years to complete</div>
                  <div>• Total converted: $3.5M</div>
                  <div className="text-green-400 font-semibold mt-1">Total cost: $757K</div>
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded p-3 border border-orange-500/30">
                <div className="font-semibold mb-2 text-orange-400">Front-Load Strategy ⭐</div>
                <div className="text-xs space-y-1">
                  <div>• $475K years 1-3 (ages 60-62)</div>
                  <div>• $350K years 4-6 (ages 63-65)</div>
                  <div>• $250K years 7-10 (ages 66-69)</div>
                  <div>• $200K years 11-14 (ages 70-73)</div>
                  <div>• Pushes into 32% bracket early</div>
                  <div>• Total converted: $4.1M+</div>
                  <div className="text-orange-400 font-semibold mt-1">Total cost: $920K</div>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-900/30 border border-orange-600/50 rounded p-3">
              <div className="font-semibold mb-2 text-orange-400">The Math:</div>
              <div className="text-xs space-y-1">
                <div>• Extra $163K in taxes ($920K vs $757K)</div>
                <div>• But: Convert extra $600K+ to Roth</div>
                <div>• Future value of $600K @ 7% for 20 years = <strong className="text-green-400">$2.3M tax-free</strong></div>
                <div>• If future tax rates rise to 35%, you'd pay $800K+ on that $2.3M</div>
                <div className="text-green-400 font-semibold mt-2">Net benefit: $640K+ lifetime savings</div>
              </div>
            </div>
            
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded p-3">
              <div className="font-semibold mb-2 text-yellow-400">⚠️ Trade-offs to Consider:</div>
              <ul className="text-xs space-y-1 ml-4">
                <li>• Higher tax bills years 1-6 (need more cash flow)</li>
                <li>• May trigger IRMAA Medicare surcharges</li>
                <li>• Less cash available for other investments</li>
                <li>• But: Locked in low rates before they rise</li>
              </ul>
            </div>
            
            <div className="bg-blue-900/30 border border-blue-600/50 rounded p-3">
              <div className="font-semibold mb-2 text-blue-400">💡 Recommendation:</div>
              <p className="text-xs">
                <strong>Front-load if:</strong> (1) You believe taxes will rise (likely), (2) You have sufficient cash flow to handle $100-120K annual tax bills, and (3) You want to maximize Roth balance for long-term tax-free growth.
              </p>
              <p className="text-xs mt-2">
                <strong>Standard approach if:</strong> (1) You prefer consistent predictable tax bills, (2) Cash flow is tighter, or (3) You're risk-averse about future tax policy.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* WHY STOP AT 73? */}
      <div className="bg-yellow-900/30 border-2 border-yellow-600/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-3 text-yellow-400">❓ Why Age 73 (2039)?</h3>
        <div className="space-y-3 text-sm text-slate-300">
          <div className="bg-slate-800/50 rounded p-3">
            <div className="font-semibold mb-1">RMDs Start at Age 73</div>
            <p>In 2039, Required Minimum Distributions (RMDs) begin. The IRS <strong>forces</strong> you to withdraw 3.9% of your IRA, whether you want to or not.</p>
          </div>
          
          <div className="bg-slate-800/50 rounded p-3">
            <div className="font-semibold mb-1">The Problem with RMDs + Conversions</div>
            <ul className="space-y-1 ml-4">
              <li>• RMD + Roth conversion = <strong>double taxable income</strong></li>
              <li>• Pushes you into 32% or 35% tax bracket (vs 24% now)</li>
              <li>• Triggers higher Medicare IRMAA premiums (up to $5,800/year extra)</li>
              <li>• Less efficient than converting earlier at lower rates</li>
            </ul>
          </div>
          
          <div className="bg-green-900/30 border border-green-600/50 rounded p-3">
            <div className="font-semibold mb-1 text-green-400">✓ But You CAN Continue!</div>
            <p className="mb-2">Many people DO continue Roth conversions after age 73. It's a trade-off:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <div className="font-semibold text-green-400 mb-1">Benefits of Continuing:</div>
                <ul className="space-y-1">
                  <li>• Convert more to tax-free Roth</li>
                  <li>• Reduce future RMDs (smaller IRA = smaller RMDs)</li>
                  <li>• Leave tax-free Roth to heirs</li>
                  <li>• Still beats keeping it in traditional IRA</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-red-400 mb-1">Costs of Continuing:</div>
                <ul className="space-y-1">
                  <li>• Higher tax rate (24% → 32%+)</li>
                  <li>• IRMAA surcharges (Medicare costs)</li>
                  <li>• More "tax-on-tax" from selling stocks</li>
                  <li>• Less efficient than age 60-72</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-900/30 border border-blue-600/50 rounded p-3 mt-3">
            <div className="font-semibold mb-2 text-blue-400">💡 Recommendation</div>
            <p><strong>Standard plan:</strong> Convert aggressively ages 60-73, then STOP and let Roth grow tax-free</p>
            <p className="mt-1"><strong>Extended plan:</strong> Continue ages 73-80 with smaller $200K conversions IF:</p>
            <ul className="ml-4 mt-1 space-y-1 text-xs">
              <li>1. You have a large estate and want to maximize Roth for heirs</li>
              <li>2. You can tolerate 32% tax rate + IRMAA</li>
              <li>3. You expect to live past 90 (long time for tax-free growth)</li>
            </ul>
            <p className="mt-2 text-xs italic">Toggle "Continue after RMDs" above to see the extended plan numbers.</p>
          </div>
        </div>
      </div>

      {/* CHART VISUALIZATION */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Conversion Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={rothTimeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="year" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" tickFormatter={(val) => `$${(val/1000000).toFixed(1)}M`} />
            <Tooltip formatter={(val) => `$${(val/1000000).toFixed(2)}M`} />
            <Legend />
            <Area type="monotone" dataKey="conversion" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Annual Conversion" />
            <Area type="monotone" dataKey="rmd" stackId="1" stroke="#ef4444" fill="#ef4444" name="RMD (forced)" />
            <Area type="monotone" dataKey="ira" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Remaining IRA" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* DETAILED TIMELINE TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-700">
            <tr>
              <th className="p-2 text-left">Year</th>
              <th className="p-2 text-left">Age</th>
              <th className="p-2 text-right">Conversion</th>
              <th className="p-2 text-right">RMD</th>
              <th className="p-2 text-right">Tax Rate</th>
              <th className="p-2 text-right">Federal Tax</th>
              <th className="p-2 text-right">Cap Gains Tax</th>
              <th className="p-2 text-right">IRMAA</th>
              <th className="p-2 text-right">Total Cost</th>
              <th className="p-2 text-right">Remaining IRA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {rothTimeline.map((row) => (
              <tr key={row.year} className={`hover:bg-slate-700/50 ${row.age >= 73 ? 'bg-yellow-900/10' : row.taxRate >= 0.32 ? 'bg-orange-900/10' : ''}`}>
                <td className="p-2">{row.year}</td>
                <td className="p-2">
                  {row.age}
                  {row.age === 73 && <span className="text-yellow-400 ml-1">★</span>}
                </td>
                <td className="p-2 text-right">
                  ${(row.conversion / 1000).toFixed(0)}K
                  {frontLoadConversions && row.conversion >= 350000 && <span className="text-orange-400 ml-1">⚡</span>}
                </td>
                <td className="p-2 text-right text-red-400">
                  {row.rmd > 0 ? `$${(row.rmd / 1000).toFixed(0)}K` : '-'}
                </td>
                <td className="p-2 text-right">
                  <span className={row.taxRate >= 0.32 ? 'text-orange-400 font-semibold' : 'text-green-400'}>
                    {(row.taxRate * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="p-2 text-right text-yellow-400">${(row.federalTax / 1000).toFixed(0)}K</td>
                <td className="p-2 text-right text-orange-400">${(row.capitalGainsTax / 1000).toFixed(0)}K</td>
                <td className="p-2 text-right text-red-400">
                  {row.irmaa > 0 ? `$${(row.irmaa / 1000).toFixed(1)}K` : '-'}
                </td>
                <td className="p-2 text-right font-bold text-red-400">${(row.allInCost / 1000).toFixed(0)}K</td>
                <td className="p-2 text-right">${(row.ira / 1000000).toFixed(2)}M</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-700 font-bold">
            <tr>
              <td colSpan="2" className="p-2">TOTALS</td>
              <td className="p-2 text-right">${(rothTotalConversion / 1000).toFixed(0)}K</td>
              <td className="p-2 text-right text-red-400">${(rothTotalRMD / 1000).toFixed(0)}K</td>
              <td className="p-2 text-right">
                <span className="text-slate-400 text-xs">Avg</span> 
                <span className={rothTotalFederalTax / rothTotalConversion >= 0.30 ? 'text-orange-400' : 'text-green-400'}>
                  {((rothTotalFederalTax / rothTotalConversion) * 100).toFixed(0)}%
                </span>
              </td>
              <td className="p-2 text-right text-yellow-400">${(rothTotalFederalTax / 1000).toFixed(0)}K</td>
              <td className="p-2 text-right text-orange-400">${(rothTotalCapitalGainsTax / 1000).toFixed(0)}K</td>
              <td className="p-2 text-right text-red-400">${(rothTotalIRMAA / 1000).toFixed(0)}K</td>
              <td className="p-2 text-right text-red-400">${(rothTotalCost / 1000).toFixed(0)}K</td>
              <td className="p-2 text-right">${(rothTimeline[rothTimeline.length-1]?.ira / 1000000).toFixed(2)}M</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* WHY THIS STRATEGY WORKS */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
        <h4 className="font-semibold text-blue-400 mb-2">Why This Strategy Works</h4>
        <ul className="text-sm text-slate-300 space-y-1">
          <li>• Texas residency: 0% state tax saves ~$80K vs California</li>
          <li>• Target 24% bracket: Avoid 32%+ marginal rates</li>
          <li>• Tax-on-tax included: Real all-in cost is shown (not just federal)</li>
          <li>• IRMAA managed: Keep conversions ≤$250K to control Medicare costs</li>
          <li>• Age 73 decision point: Stop and let Roth grow, OR continue if estate planning focused</li>
        </ul>
      </div>
      
      {/* WHAT YOU SAVE */}
      <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
        <h4 className="font-semibold text-green-400 mb-2">💰 What You Save</h4>
        <div className="text-sm text-slate-300 space-y-2">
          <p><strong>If you do nothing</strong> (leave in traditional IRA):</p>
          <ul className="ml-4 space-y-1 text-xs">
            <li>• RMDs force withdrawals at 32-35% tax rates</li>
            <li>• Estimated lifetime tax: $1.2M - $1.5M</li>
            <li>• Social Security may become taxable (adds 85% of SS to income)</li>
            <li>• Heirs pay income tax on inherited IRA (within 10 years)</li>
          </ul>
          <p className="mt-2"><strong>With this Roth strategy:</strong></p>
          <ul className="ml-4 space-y-1 text-xs">
            <li>• Total tax cost: ${(rothTotalCost / 1000).toFixed(0)}K all-in</li>
            <li>• <strong className="text-green-400">Savings: ${(rothSavings / 1000).toFixed(0)}K+ over lifetime</strong></li>
            <li>• All future growth is tax-free</li>
            <li>• Heirs inherit tax-free Roth (worth 30-40% more than traditional IRA)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RothTab;
