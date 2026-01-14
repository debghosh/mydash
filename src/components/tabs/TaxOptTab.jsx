import React from 'react';

const TaxOptimizationTab = ({
  taxableAmount,
  iraAmount,
  currentAge,
  stateTaxRate
}) => {
  // Calculate current tax situation at age 73 (RMD start)
  const age73Divs = taxableAmount * 0.025; // 2.5% dividend yield
  const age73RMD = iraAmount / 26.5; // Life expectancy factor at 73
  const age73SS = 55000; // Assumed Social Security
  const age73AGI = age73Divs + age73RMD + (age73SS * 0.85); // 85% SS taxable
  
  // IRMAA calculation
  const getIRMAAInfo = (agi) => {
    const threshold1 = 206000;
    const threshold2 = 258000;
    const threshold3 = 322000;
    const threshold4 = 386000;
    const threshold5 = 750000;
    
    let partB, partD, surcharge;
    if (agi > threshold5) {
      partB = 594.00;
      partD = 81.00;
      surcharge = 675.00;
    } else if (agi > threshold4) {
      partB = 489.90;
      partD = 76.40;
      surcharge = 566.30;
    } else if (agi > threshold3) {
      partB = 454.20;
      partD = 70.00;
      surcharge = 524.20;
    } else if (agi > threshold2) {
      partB = 349.40;
      partD = 33.30;
      surcharge = 382.70;
    } else if (agi > threshold1) {
      partB = 244.60;
      partD = 12.90;
      surcharge = 257.50;
    } else {
      partB = 174.70;
      partD = 0;
      surcharge = 174.70;
    }
    
    const annualCouple = surcharge * 12 * 2;
    const isAtRisk = agi > threshold1;
    
    return { surcharge, annualCouple, isAtRisk, partB, partD };
  };
  
  const irmaaInfo = getIRMAAInfo(age73AGI);
  
  // QCD Savings calculation
  const yearsEligible = Math.max(0, 90 - Math.max(currentAge, 70.5));
  const avgQCD = Math.min(age73RMD, 105000);
  const qcdLifetimeSavings = (avgQCD * 0.24 * yearsEligible) / 1000;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Tax Optimization Strategies</h2>
        <div className="text-sm text-slate-400">Comprehensive guide to minimize lifetime taxes</div>
      </div>

      {/* Tax Savings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-500/30 rounded-lg p-4">
          <div className="text-xs text-slate-400 mb-1">Potential QCD Savings</div>
          <div className="text-2xl font-bold text-green-400">
            ${qcdLifetimeSavings.toFixed(0)}K
          </div>
          <div className="text-xs text-slate-400 mt-1">Age 70.5-90 (if charitable)</div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-500/30 rounded-lg p-4">
          <div className="text-xs text-slate-400 mb-1">Asset Location Benefit</div>
          <div className="text-2xl font-bold text-blue-400">
            +0.8%
          </div>
          <div className="text-xs text-slate-400 mt-1">Annual alpha from tax efficiency</div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-500/30 rounded-lg p-4">
          <div className="text-xs text-slate-400 mb-1">Tax-Loss Harvesting</div>
          <div className="text-2xl font-bold text-purple-400">
            $3K-$100K
          </div>
          <div className="text-xs text-slate-400 mt-1">Annual deduction potential</div>
        </div>

        <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/40 border border-amber-500/30 rounded-lg p-4">
          <div className="text-xs text-slate-400 mb-1">IRMAA Threshold Risk</div>
          <div className="text-2xl font-bold text-amber-400">
            {irmaaInfo.isAtRisk ? `$${(irmaaInfo.annualCouple / 1000).toFixed(0)}K/yr` : 'Safe'}
          </div>
          <div className="text-xs text-slate-400 mt-1">Medicare surcharge at age 65+</div>
        </div>
      </div>

      {/* Current Tax Situation */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="text-2xl mr-2">📊</span>
          Your Current Tax Situation (Age 73 Projection)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-blue-300 mb-2">Income Sources</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Dividends:</span>
                <span className="text-white">${(age73Divs / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">RMDs:</span>
                <span className="text-white">${(age73RMD / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Social Security:</span>
                <span className="text-white">${(age73SS / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between border-t border-slate-600 pt-1 mt-1 font-bold">
                <span className="text-slate-300">Total AGI:</span>
                <span className="text-green-400">${(age73AGI / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-amber-300 mb-2">Tax Bracket</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Current bracket:</span>
                <span className="text-white">24%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">LTCG rate:</span>
                <span className="text-white">15%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">State tax:</span>
                <span className="text-white">{stateTaxRate}%</span>
              </div>
              <div className="flex justify-between border-t border-slate-600 pt-1 mt-1 font-bold">
                <span className="text-slate-300">Combined marginal:</span>
                <span className="text-amber-400">{(24 + stateTaxRate).toFixed(0)}%</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-red-300 mb-2">IRMAA Risk</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Projected AGI:</span>
                <span className="text-white">${(age73AGI / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Safe threshold:</span>
                <span className="text-white">$206K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Monthly surcharge:</span>
                <span className={irmaaInfo.surcharge > 174.70 ? 'text-red-400' : 'text-green-400'}>
                  ${irmaaInfo.surcharge.toFixed(0)}/mo
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-600 pt-1 mt-1 font-bold">
                <span className="text-slate-300">Annual IRMAA:</span>
                <span className={irmaaInfo.isAtRisk ? 'text-red-400 font-bold' : 'text-green-400'}>
                  {irmaaInfo.isAtRisk ? `$${(irmaaInfo.annualCouple / 1000).toFixed(1)}K` : 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8 CHARITABLE STRATEGIES */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 border border-indigo-500/30 rounded-lg p-6">
        <h3 className="text-2xl font-semibold mb-4 flex items-center">
          <span className="text-3xl mr-2">💝</span>
          8 Charitable Contribution Strategies
        </h3>
        <p className="text-slate-300 text-sm mb-6">
          These strategies can offset RMDs, reduce IRMAA surcharges, and provide significant tax savings while supporting causes you care about.
        </p>
        
        <div className="space-y-6">
          {/* Strategy 1: QCDs */}
          <div className="bg-slate-800/70 rounded-lg p-5 border-l-4 border-indigo-500">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-xl font-bold text-indigo-300">1. Qualified Charitable Distributions (QCDs)</h4>
                <div className="text-xs text-slate-400 mt-1">
                  Age: 70.5+ | Limit: $105,000/year | Tax Bracket: All
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-400 font-semibold">Potential Savings</div>
                <div className="text-2xl font-bold text-green-400">
                  ${((avgQCD * 0.24) / 1000).toFixed(1)}K/year
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-indigo-900/30 rounded p-3">
                <div className="font-semibold text-indigo-200 mb-2">💡 How It Works:</div>
                <p className="text-sm text-slate-300">
                  Donate directly from your IRA to a qualified charity. The distribution counts toward your RMD but is NOT included in your taxable income. This is the #1 strategy for anyone age 70.5+ who gives to charity.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-green-900/20 rounded p-3">
                  <div className="font-semibold text-green-300 mb-1 text-sm">✓ Benefits:</div>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li>• Satisfies RMD requirement</li>
                    <li>• Reduces AGI (helps avoid IRMAA)</li>
                    <li>• No need to itemize deductions</li>
                    <li>• Simple process (IRA → Charity direct)</li>
                    <li>• Can split among multiple charities</li>
                  </ul>
                </div>
                
                <div className="bg-amber-900/20 rounded p-3">
                  <div className="font-semibold text-amber-300 mb-1 text-sm">⚠️ Rules & Limits:</div>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li>• Must be age 70.5 or older</li>
                    <li>• $105,000 max per person per year</li>
                    <li>• Must go directly to charity (not DAF)</li>
                    <li>• Only from IRA (not 401k)</li>
                    <li>• Charity must be 501(c)(3)</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-900/20 rounded p-3">
                <div className="font-semibold text-blue-300 mb-2 text-sm">📝 Your Specific Example:</div>
                <div className="text-sm text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Age 73 RMD:</span>
                    <span className="font-bold">${(age73RMD / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maximum QCD:</span>
                    <span className="font-bold">$105K</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax bracket:</span>
                    <span className="font-bold">24%</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-600/30 pt-1 mt-1">
                    <span className="font-bold">Annual tax savings:</span>
                    <span className="font-bold text-green-400">${(Math.min(age73RMD, 105000) * 0.24 / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Lifetime savings (age 70.5-90):</span>
                    <span className="font-bold text-green-400">${qcdLifetimeSavings.toFixed(0)}K</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-900/20 rounded p-3">
                <div className="font-semibold text-purple-300 mb-2 text-sm">🎯 Pro Tips:</div>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• <strong>Start at 70.5, not 73:</strong> You can do QCDs 2.5 years before RMDs begin!</li>
                  <li>• <strong>Use instead of itemizing:</strong> If you take standard deduction, QCD gives you a "free" charitable deduction</li>
                  <li>• <strong>Time it right:</strong> Do QCD before year-end RMD to avoid excess withdrawal</li>
                  <li>• <strong>Keep records:</strong> Get written acknowledgment from charity (IRS requirement)</li>
                  <li>• <strong>Direct transfer:</strong> Have IRA custodian send check directly to charity (never touch the money yourself)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Strategy 2: DAF */}
          <div className="bg-slate-800/70 rounded-lg p-5 border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-xl font-bold text-blue-300">2. Donor-Advised Fund (DAF)</h4>
                <div className="text-xs text-slate-400 mt-1">
                  Age: Any | Limit: 60% of AGI | Tax Bracket: High earners
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-400 font-semibold">One-Time Benefit</div>
                <div className="text-2xl font-bold text-green-400">$36K+</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-blue-900/30 rounded p-3">
                <div className="font-semibold text-blue-200 mb-2">💡 How It Works:</div>
                <p className="text-sm text-slate-300">
                  Contribute appreciated stock to a DAF in a high-income year. Get immediate tax deduction at fair market value, avoid capital gains tax, and the DAF grows tax-free. Distribute to charities over time. Perfect for "bunching" deductions to exceed standard deduction threshold.
                </p>
              </div>
              
              <div className="bg-blue-900/20 rounded p-3">
                <div className="font-semibold text-blue-300 mb-2 text-sm">📊 Example: $100K Stock Contribution</div>
                <div className="text-sm text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Stock value (FMV):</span>
                    <span>$100,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost basis:</span>
                    <span>$20,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capital gain avoided:</span>
                    <span className="text-green-400">$80,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cap gains tax saved (15%):</span>
                    <span className="text-green-400 font-bold">$12,000</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-600/30 pt-1 mt-1">
                    <span>Charitable deduction (24%):</span>
                    <span className="text-green-400 font-bold">$24,000</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-600/30 pt-1 font-bold">
                    <span>Total tax savings:</span>
                    <span className="text-green-400 font-bold">$36,000</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-green-900/20 rounded p-2">
                  <div className="font-semibold text-green-300 mb-1">✓ Benefits:</div>
                  <ul className="text-slate-300 space-y-0.5">
                    <li>• Immediate full deduction</li>
                    <li>• Avoid cap gains tax</li>
                    <li>• Distribute over many years</li>
                    <li>• Tax-free growth inside DAF</li>
                  </ul>
                </div>
                <div className="bg-amber-900/20 rounded p-2">
                  <div className="font-semibold text-amber-300 mb-1">💰 Providers:</div>
                  <ul className="text-slate-300 space-y-0.5">
                    <li>• Fidelity Charitable</li>
                    <li>• Schwab Charitable</li>
                    <li>• Vanguard Charitable</li>
                    <li>• Minimums: $5K-$25K</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Strategies 3-8: Compact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strategy 3: CRT */}
            <div className="bg-slate-800/70 rounded-lg p-4 border-l-4 border-cyan-500">
              <h4 className="text-lg font-bold text-cyan-300 mb-2">3. Charitable Remainder Trust (CRT)</h4>
              <p className="text-sm text-slate-300 mb-2">
                Donate appreciated assets, receive income stream for life, remainder goes to charity. Avoid capital gains tax, get partial income tax deduction, reduce estate.
              </p>
              <div className="text-xs text-cyan-200 bg-cyan-900/20 rounded p-2">
                Example: $1M stock → CRT → 5% income ($50K/year) → Tax deduction $400K+ → Estate-tax-free
              </div>
            </div>

            {/* Strategy 4: CLT */}
            <div className="bg-slate-800/70 rounded-lg p-4 border-l-4 border-purple-500">
              <h4 className="text-lg font-bold text-purple-300 mb-2">4. Charitable Lead Trust (CLT)</h4>
              <p className="text-sm text-slate-300 mb-2">
                For wealthy estates ($10M+): Charity receives income stream for X years, then assets pass to heirs. All appreciation passes estate-tax-free.
              </p>
              <div className="text-xs text-purple-200 bg-purple-900/20 rounded p-2">
                Example: $5M stock → $250K/yr × 10yrs → grows to $12M → heirs get $12M estate-tax-free (save $4.8M)
              </div>
            </div>

            {/* Strategy 5: Real Estate */}
            <div className="bg-slate-800/70 rounded-lg p-4 border-l-4 border-amber-500">
              <h4 className="text-lg font-bold text-amber-300 mb-2">5. Real Estate Depreciation</h4>
              <p className="text-sm text-slate-300 mb-2">
                Rental property: $2M ÷ 27.5 years = $72K annual depreciation. Offsets passive income (or all income if "real estate professional"). Can offset {((72000 / age73RMD) * 100).toFixed(0)}% of your RMD.
              </p>
              <div className="text-xs text-amber-200">
                Savings: $17K/year (at 24% bracket)
              </div>
            </div>

            {/* Strategy 6: Oil & Gas */}
            <div className="bg-slate-800/70 rounded-lg p-4 border-l-4 border-orange-500">
              <h4 className="text-lg font-bold text-orange-300 mb-2">6. Oil & Gas Partnerships</h4>
              <p className="text-sm text-slate-300 mb-2">
                Intangible drilling costs (IDC) are 70-85% deductible immediately. $200K investment → $140-170K deduction → $33-40K tax savings (24% bracket). HIGH RISK - sophisticated investors only.
              </p>
              <div className="text-xs text-orange-200">
                For offsetting one-time high income events
              </div>
            </div>

            {/* Strategy 7: Opportunity Zones */}
            <div className="bg-slate-800/70 rounded-lg p-4 border-l-4 border-cyan-500">
              <h4 className="text-lg font-bold text-cyan-300 mb-2">7. Opportunity Zones</h4>
              <p className="text-sm text-slate-300 mb-2">
                Defer capital gains by investing in designated OZ. 10% basis step-up after 5 years, 15% after 7 years. Hold 10+ years = all OZ appreciation is TAX-FREE.
              </p>
              <div className="text-xs text-cyan-200">
                Best for long-term capital gains ($500K+)
              </div>
            </div>

            {/* Strategy 8: Charitable Bequests */}
            <div className="bg-slate-800/70 rounded-lg p-4 border-l-4 border-pink-500">
              <h4 className="text-lg font-bold text-pink-300 mb-2">8. Charitable Bequests (Estate)</h4>
              <p className="text-sm text-slate-300 mb-2">
                Leave IRA to charity (they pay 0% tax), leave taxable to heirs (step-up basis). IRA to heirs = 60-70% total tax. $2M IRA → charity gets $2M, heirs avoid $1.2M+ tax hit.
              </p>
              <div className="text-xs text-pink-200">
                40% estate tax deduction for charitable bequest
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Tax Strategies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tax-Loss Harvesting */}
        <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 border border-red-500/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="text-2xl mr-2">📉</span>
            Tax-Loss Harvesting
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-slate-300">
              Sell losing positions to offset gains. $3K annual deduction against ordinary income. Unlimited carryforward.
            </p>
            <div className="bg-red-900/20 rounded p-3 text-sm">
              <div className="font-semibold text-red-300 mb-2">Strategy:</div>
              <ul className="text-slate-300 space-y-1 text-xs">
                <li>• Harvest losses in down markets</li>
                <li>• Replace immediately with similar (not identical) fund</li>
                <li>• Wait 31 days to avoid wash sale</li>
                <li>• Use losses to offset Roth conversion taxes</li>
                <li>• Or offset capital gains from rebalancing</li>
              </ul>
            </div>
            <div className="text-xs text-slate-400 bg-red-900/20 rounded p-2">
              Example: Harvest $100K loss → Offset $100K Roth conversion → Save $24K tax
            </div>
          </div>
        </div>

        {/* Asset Location */}
        <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-500/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="text-2xl mr-2">🎯</span>
            Asset Location Optimization
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-slate-300">
              Put tax-inefficient assets in tax-advantaged accounts. Worth +0.8% annual alpha (~${((taxableAmount * 0.008) / 1000).toFixed(0)}K/year for you).
            </p>
            <div className="bg-green-900/20 rounded p-3 text-sm">
              <div className="font-semibold text-green-300 mb-2">Optimal Placement:</div>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="text-blue-300 font-semibold">Taxable account:</div>
                  <div className="text-slate-300">• Tax-efficient stock ETFs (VTI, VOO)</div>
                  <div className="text-slate-300">• Municipal bonds (if high bracket)</div>
                  <div className="text-slate-300">• Qualified dividends (low 15% tax)</div>
                </div>
                <div>
                  <div className="text-amber-300 font-semibold">Traditional IRA:</div>
                  <div className="text-slate-300">• Bonds (ordinary income)</div>
                  <div className="text-slate-300">• REITs (high distributions)</div>
                  <div className="text-slate-300">• High-turnover funds</div>
                </div>
                <div>
                  <div className="text-green-300 font-semibold">Roth IRA:</div>
                  <div className="text-slate-300">• Highest growth assets (QQQ, VUG)</div>
                  <div className="text-slate-300">• Small cap value</div>
                  <div className="text-slate-300">• Anything with high expected return</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IRMAA Thresholds */}
      <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 border border-orange-500/30 rounded-lg p-6">
        <h3 className="text-2xl font-semibold mb-4 flex items-center">
          <span className="text-2xl mr-2">⚠️</span>
          IRMAA Thresholds & Avoidance Strategies
        </h3>
        <p className="text-slate-300 text-sm mb-4">
          Income-Related Monthly Adjustment Amount (IRMAA) increases Medicare Part B & D premiums based on income from 2 years prior. Small income increases can trigger large surcharges.
        </p>
        
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead className="bg-orange-900/30">
              <tr className="text-orange-200">
                <th className="text-left py-2 px-3">Income (MAGI)</th>
                <th className="text-right py-2 px-3">Part B</th>
                <th className="text-right py-2 px-3">Part D</th>
                <th className="text-right py-2 px-3">Total/Person</th>
                <th className="text-right py-2 px-3">Couple/Year</th>
              </tr>
            </thead>
            <tbody className="text-white">
              <tr className="border-b border-orange-700/30 bg-green-900/20">
                <td className="py-2 px-3">≤ $206,000</td>
                <td className="text-right py-2 px-3">$174.70</td>
                <td className="text-right py-2 px-3">$0</td>
                <td className="text-right py-2 px-3 font-bold text-green-400">$174.70/mo</td>
                <td className="text-right py-2 px-3 font-bold text-green-400">$4.2K</td>
              </tr>
              <tr className="border-b border-orange-700/30">
                <td className="py-2 px-3">$206,001 - $258,000</td>
                <td className="text-right py-2 px-3">$244.60</td>
                <td className="text-right py-2 px-3">$12.90</td>
                <td className="text-right py-2 px-3 font-bold text-yellow-400">$257.50/mo</td>
                <td className="text-right py-2 px-3 font-bold text-yellow-400">$6.2K</td>
              </tr>
              <tr className="border-b border-orange-700/30">
                <td className="py-2 px-3">$258,001 - $322,000</td>
                <td className="text-right py-2 px-3">$349.40</td>
                <td className="text-right py-2 px-3">$33.30</td>
                <td className="text-right py-2 px-3 font-bold text-orange-400">$382.70/mo</td>
                <td className="text-right py-2 px-3 font-bold text-orange-400">$9.2K</td>
              </tr>
              <tr className="border-b border-orange-700/30 bg-amber-900/20">
                <td className="py-2 px-3">$322,001 - $386,000</td>
                <td className="text-right py-2 px-3">$454.20</td>
                <td className="text-right py-2 px-3">$70.00</td>
                <td className="text-right py-2 px-3 font-bold text-red-400">$524.20/mo</td>
                <td className="text-right py-2 px-3 font-bold text-red-400">$12.6K</td>
              </tr>
              <tr className="border-b border-orange-700/30">
                <td className="py-2 px-3">$386,001 - $750,000</td>
                <td className="text-right py-2 px-3">$489.90</td>
                <td className="text-right py-2 px-3">$76.40</td>
                <td className="text-right py-2 px-3 font-bold text-red-500">$566.30/mo</td>
                <td className="text-right py-2 px-3 font-bold text-red-500">$13.6K</td>
              </tr>
              <tr className="bg-red-900/30">
                <td className="py-2 px-3">&gt; $750,000</td>
                <td className="text-right py-2 px-3">$594.00</td>
                <td className="text-right py-2 px-3">$81.00</td>
                <td className="text-right py-2 px-3 font-bold text-red-600">$675.00/mo</td>
                <td className="text-right py-2 px-3 font-bold text-red-600">$16.2K</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-orange-900/20 rounded p-4">
          <div className="font-semibold text-orange-300 mb-2">🎯 Avoidance Strategies:</div>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• <strong>Time Roth conversions before age 63</strong> (2-year lookback means conversions at 62 won't affect Medicare at 65)</li>
            <li>• <strong>Use QCDs instead of cash withdrawals</strong> to reduce AGI</li>
            <li>• <strong>Harvest tax losses</strong> to offset gains and reduce MAGI</li>
            <li>• <strong>Defer income in high-income years</strong> (bonuses, consulting fees)</li>
            <li>• <strong>Watch the cliffs!</strong> Going from $206K to $206,001 costs $2K/year extra</li>
            <li>• <strong>Appeal if life-changing event</strong> (death of spouse, divorce, work stoppage)</li>
          </ul>
          <div className="mt-3 p-2 bg-red-900/30 border border-red-600/40 rounded text-xs">
            <strong className="text-red-300">WARNING:</strong> Marginal tax rate at cliffs can exceed <strong className="text-red-400">50%</strong> when combining federal tax + IRMAA + state tax. Plan carefully around $206K, $258K, $322K, $386K thresholds!
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-500/30 rounded-lg p-6">
        <h3 className="text-2xl font-semibold mb-4 flex items-center">
          <span className="text-2xl mr-2">📋</span>
          Recommended Action Items
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-purple-300 mb-2">Before Age 65:</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Max out Roth conversions (no IRMAA impact yet)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Set up DAF for appreciated stock donations</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Implement tax-loss harvesting system</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Optimize asset location across accounts</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-purple-300 mb-2">Age 70.5+:</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Begin QCDs (can start before RMDs at 73!)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Monitor IRMAA thresholds annually</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Consider CRT for large appreciated positions</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Review estate plan (IRA to charity?)</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-purple-900/20 border border-purple-600/30 rounded">
          <div className="font-semibold text-purple-300 mb-2">💡 Next Steps:</div>
          <p className="text-sm text-slate-300">
            Consult with a CPA or tax attorney to implement these strategies. Many require specific documentation, timing, and setup. The potential savings ($100K+ lifetime) far exceed professional fees.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaxOptimizationTab;
