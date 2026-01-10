/**
 * Enhanced Income Tab
 * Comprehensive lifetime income analysis from current age to 90
 * Includes charitable strategies, real estate deductions, and advanced tax optimization
 */

import React, { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const IncomeTab = ({ 
  selectedClient,
  clientRecommendations,
  taxableAmount, 
  iraAmount,
  marketRegime 
}) => {
  // Use client age or default to 60
  const currentAge = selectedClient?.age || 60;
  
  // Comprehensive income projection to age 90
  const lifetimeIncomeProjection = useMemo(() => {
    const taxableAlloc = {
      'SCHD': { allocation: 0.25, yield: 3.8, taxStatus: '91% Qualified' },
      'VIG': { allocation: 0.15, yield: 1.7, taxStatus: '95% Qualified' },
      'VYM': { allocation: 0.10, yield: 2.4, taxStatus: '88% Qualified' },
      'VOO': { allocation: 0.20, yield: 1.3, taxStatus: '85% Qualified' },
      'VTV': { allocation: 0.08, yield: 2.3, taxStatus: '90% Qualified' },
      'VEA': { allocation: 0.12, yield: 3.2, taxStatus: '100% Qualified' },
      'BND': { allocation: 0.05, yield: 4.2, taxStatus: 'Ordinary' },
      'GLD': { allocation: 0.05, yield: 0, taxStatus: 'N/A' }
    };
    
    // Calculate annual dividend income
    let totalDividends = 0;
    let qualifiedDividends = 0;
    let ordinaryIncome = 0;
    
    Object.entries(taxableAlloc).forEach(([etf, data]) => {
      const amount = taxableAmount * data.allocation;
      const income = amount * (data.yield / 100);
      totalDividends += income;
      
      if (data.taxStatus.includes('Qualified')) {
        const qualifiedPct = parseInt(data.taxStatus) / 100;
        qualifiedDividends += income * qualifiedPct;
        ordinaryIncome += income * (1 - qualifiedPct);
      } else if (data.taxStatus === 'Ordinary') {
        ordinaryIncome += income;
      }
    });
    
    // RMD calculation function
    const calculateRMD = (iraBalance, age) => {
      const divisors = {
        73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1,
        80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2,
        87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2
      };
      return age >= 73 ? iraBalance / (divisors[age] || 12.2) : 0;
    };
    
    // Social Security calculation
    const socialSecurity = currentAge >= 70 ? 55000 : 0; // Delayed to 70
    
    // Project year by year to age 90
    const yearlyProjections = [];
    let currentIRA = iraAmount;
    let currentTaxable = taxableAmount;
    const growthRate = 0.09; // 9% growth
    
    for (let age = currentAge; age <= 90; age++) {
      const rmd = calculateRMD(currentIRA, age);
      const dividends = currentTaxable * (totalDividends / taxableAmount);
      const qualDiv = dividends * (qualifiedDividends / totalDividends);
      const ordDiv = dividends * (ordinaryIncome / totalDividends);
      const ss = age >= 70 ? socialSecurity : 0;
      
      // Total income
      const totalIncome = dividends + rmd + ss;
      
      // Calculate taxes
      const qualDivTax = qualDiv * 0.15; // 15% qualified dividend rate
      const ordDivTax = ordDiv * 0.24; // 24% ordinary rate
      const rmdTax = rmd * 0.24; // 24% on RMDs
      const ssTax = ss * 0.85 * 0.22; // 85% of SS taxable at 22%
      const totalTax = qualDivTax + ordDivTax + rmdTax + ssTax;
      
      // After-tax income
      const netIncome = totalIncome - totalTax;
      
      // Charitable strategies (if age 70.5+)
      const qcdOpportunity = age >= 70.5 ? Math.min(rmd, 105000) : 0; // QCD limit
      const qcdTaxSavings = qcdOpportunity * 0.24;
      
      yearlyProjections.push({
        age,
        year: age - currentAge + 1,
        dividends: Math.round(dividends),
        rmd: Math.round(rmd),
        socialSecurity: Math.round(ss),
        totalIncome: Math.round(totalIncome),
        totalTax: Math.round(totalTax),
        netIncome: Math.round(netIncome),
        iraBalance: Math.round(currentIRA),
        taxableBalance: Math.round(currentTaxable),
        qcdOpportunity: Math.round(qcdOpportunity),
        qcdTaxSavings: Math.round(qcdTaxSavings)
      });
      
      // Grow accounts for next year
      currentIRA = (currentIRA - rmd) * (1 + growthRate);
      currentTaxable = currentTaxable * (1 + growthRate);
    }
    
    return {
      yearlyProjections,
      totalDividends,
      qualifiedDividends,
      ordinaryIncome,
      incomeSources: Object.entries(taxableAlloc).map(([etf, data]) => ({
        etf,
        amount: taxableAmount * data.allocation,
        yield: data.yield,
        annualIncome: taxableAmount * data.allocation * (data.yield / 100),
        taxStatus: data.taxStatus
      }))
    };
  }, [taxableAmount, iraAmount, currentAge]);
  
  // Charitable strategies information
  const charitableStrategies = [
    {
      name: 'Qualified Charitable Distributions (QCDs)',
      ageRequirement: '70.5+',
      limit: '$105,000/year',
      benefit: 'Satisfy RMD, reduce AGI, avoid IRMAA',
      taxSavings: 'Up to $25,200/year (at 24% rate)',
      description: 'Donate directly from IRA to charity. Amount counts toward RMD but is NOT included in taxable income. Best strategy for those who don\'t itemize deductions.',
      example: currentAge >= 70 ? `At age ${currentAge}, you could QCD up to $105K of your $${(lifetimeIncomeProjection.yearlyProjections.find(p => p.age === currentAge)?.rmd || 0).toLocaleString()} RMD, saving $${((Math.min(lifetimeIncomeProjection.yearlyProjections.find(p => p.age === currentAge)?.rmd || 0, 105000) * 0.24) / 1000).toFixed(1)}K in taxes.` : 'Available at age 70.5'
    },
    {
      name: 'Donor-Advised Fund (DAF)',
      ageRequirement: 'Any age',
      limit: 'Unlimited',
      benefit: 'Immediate deduction, invest tax-free, donate later',
      taxSavings: 'Up to 60% of AGI deductible',
      description: 'Front-load charitable deductions in high-income years. Contribute appreciated stock to avoid capital gains, get full FMV deduction, and the DAF grows tax-free.',
      example: 'Contribute $100K of appreciated stock (cost basis $20K) → Avoid $12K capital gains tax + Get $24K income tax deduction (at 24%) = $36K total tax benefit'
    },
    {
      name: 'Charitable Remainder Trust (CRT)',
      ageRequirement: 'Any age',
      limit: 'Unlimited',
      benefit: 'Income for life, estate reduction, eventual charity donation',
      taxSavings: 'Immediate partial deduction + Avoid capital gains',
      description: 'Transfer appreciated assets to CRT, receive income stream for life (5-50% annually), remainder goes to charity at death. Great for highly appreciated real estate or stock.',
      example: 'Transfer $2M appreciated real estate → Avoid $400K capital gains, get $600K deduction, receive $100K/year for life (5% payout)'
    },
    {
      name: 'Charitable Lead Trust (CLT)',
      ageRequirement: 'Any age',
      limit: 'Unlimited',
      benefit: 'Reduce estate taxes, transfer wealth to heirs',
      taxSavings: 'Remove appreciation from estate',
      description: 'Charity gets income stream for term of years, then assets pass to heirs. Effective for rapidly appreciating assets. All growth passes to heirs estate-tax-free.',
      example: 'Fund CLT with $5M stock → Charity gets $250K/year for 10 years → Stock grows to $12M → Heirs receive $12M estate-tax-free (saved ~$4.8M in estate tax)'
    },
    {
      name: 'Real Estate Depreciation',
      ageRequirement: 'Any age (if rental property owner)',
      limit: 'Based on property value',
      benefit: 'Offset RMD income with passive losses',
      taxSavings: 'Up to $150K/year deduction',
      description: 'Rental property depreciation creates "paper losses" that offset passive income. Real estate professionals can deduct against ordinary income including RMDs.',
      example: currentAge >= 73 ? `$2M rental property → $72K annual depreciation → Offsets ${((72000 / (lifetimeIncomeProjection.yearlyProjections.find(p => p.age === currentAge)?.rmd || 1)) * 100).toFixed(0)}% of your RMD at age ${currentAge}` : '$2M rental property → $72K annual depreciation'
    },
    {
      name: 'Oil & Gas Partnerships',
      ageRequirement: 'Sophisticated investors',
      limit: 'Investment-dependent',
      benefit: 'Immediate tax deductions (70-85% first year)',
      taxSavings: '$70-85K deduction per $100K invested',
      description: 'Intangible drilling costs (IDC) are immediately deductible. Can offset high-income years. Risky - for sophisticated investors only with professional guidance.',
      example: 'Invest $200K → $140-170K immediate deduction → Save $33-40K in taxes (at 24%) → Generate passive income if successful'
    },
    {
      name: 'Opportunity Zone Investments',
      ageRequirement: 'Any age',
      limit: 'Based on capital gains',
      benefit: 'Defer & reduce capital gains, potential tax-free growth',
      taxSavings: '10% basis step-up after 5 years, 15% after 7 years, tax-free after 10 years',
      description: 'Defer capital gains by investing in designated Opportunity Zones. Hold 10+ years for completely tax-free appreciation.',
      example: '$500K capital gain → Invest in OZ → Defer tax until 2026, reduce by 15% ($75K savings), hold 10 years for tax-free growth on OZ investment'
    },
    {
      name: 'Estate Planning with Charitable Bequests',
      ageRequirement: 'Any age',
      limit: 'Unlimited',
      benefit: 'Reduce estate taxes, leave legacy',
      taxSavings: '40% of charitable bequest',
      description: 'Name charity as IRA beneficiary instead of heirs. IRA is heavily taxed to heirs (income + estate tax = 60-70%). Charity gets 100%, heirs get taxable assets.',
      example: 'Leave $2M IRA to charity, $2M taxable to heirs → Charity gets $2M (vs heirs getting ~$700K after taxes), heirs get $2M taxable (step-up basis, minimal tax)'
    }
  ];
  
  // Real estate strategies
  const realEstateStrategies = [
    {
      strategy: 'Cost Segregation',
      benefit: 'Accelerate depreciation',
      description: 'Engineering study reclassifies components (carpet, lighting, landscaping) from 27.5-year to 5, 7, 15-year schedules. Front-loads deductions.',
      example: '$1M property → Typically $36K/year depreciation → With cost seg: $100K+ first year'
    },
    {
      strategy: 'Bonus Depreciation',
      benefit: '100% immediate expensing (phasing out)',
      description: 'Certain improvements (HVAC, roof, security) qualify for immediate 100% deduction under bonus depreciation rules.',
      example: '$200K roof replacement → $200K immediate deduction vs $7K/year over 27.5 years'
    },
    {
      strategy: 'Section 1031 Exchange',
      benefit: 'Defer capital gains indefinitely',
      description: 'Sell investment property, buy replacement within 180 days. No capital gains tax. Can repeat indefinitely. Step-up at death.',
      example: 'Sell $2M property (basis $500K) → 1031 into $2.5M property → Defer $240K capital gains tax'
    },
    {
      strategy: 'Short-Term Rental Loophole',
      benefit: 'Passive losses offset ordinary income',
      description: 'Rent property <7 days average → Considered active business → Losses offset W-2 income, RMDs. Must materially participate (100+ hours).',
      example: 'Airbnb property: $80K losses from depreciation → Offset $80K RMD → Save $19K taxes'
    }
  ];
  
  // Milestones
  const milestones = [
    { age: 59.5, event: 'Penalty-free 401k/IRA withdrawals', impact: 'Access retirement funds' },
    { age: 62, event: 'Social Security earliest eligibility', impact: '~70% of full benefit' },
    { age: 65, event: 'Medicare eligibility', impact: 'IRMAA surcharges apply' },
    { age: 67, event: 'Social Security full retirement age', impact: '100% of benefit' },
    { age: 70, event: 'Social Security max benefit (+24%)', impact: 'Maximum monthly payment' },
    { age: 70.5, event: 'QCDs become available', impact: 'Charitable donations from IRA' },
    { age: 73, event: 'RMDs begin (SECURE Act 2.0)', impact: 'Forced withdrawals from IRA' },
    { age: 75, event: 'RMD divisor decreases', impact: 'Larger required withdrawals' },
    { age: 80, event: 'Higher IRMAA thresholds likely', impact: 'Plan conversions around Medicare' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Lifetime Income Analysis (Age {currentAge} → 90)</h2>
        <div className="text-sm text-slate-400">
          {selectedClient ? `Client: ${selectedClient.firstName} ${selectedClient.lastName}` : 'Default Portfolio'}
        </div>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-500/30 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Current Annual Dividends</div>
          <div className="text-2xl font-bold text-green-400">
            ${(lifetimeIncomeProjection.totalDividends / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-slate-400 mt-1">
            ${(lifetimeIncomeProjection.qualifiedDividends / 1000).toFixed(0)}K qualified (15% tax)
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-500/30 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Age 73 Total Income</div>
          <div className="text-2xl font-bold text-blue-400">
            ${((lifetimeIncomeProjection.yearlyProjections.find(p => p.age === 73)?.totalIncome || 0) / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Dividends + RMDs + SS
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-500/30 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Age 90 Net Income</div>
          <div className="text-2xl font-bold text-purple-400">
            ${((lifetimeIncomeProjection.yearlyProjections.find(p => p.age === 90)?.netIncome || 0) / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-slate-400 mt-1">
            After taxes
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 border border-yellow-500/30 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Lifetime QCD Savings</div>
          <div className="text-2xl font-bold text-yellow-400">
            ${(lifetimeIncomeProjection.yearlyProjections.filter(p => p.age >= 70.5).reduce((sum, p) => sum + p.qcdTaxSavings, 0) / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Ages 70.5-90 potential
          </div>
        </div>
      </div>

      {/* Lifetime Income Chart */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold mb-4">Income Sources by Age</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={lifetimeIncomeProjection.yearlyProjections}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="age" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" tickFormatter={(val) => `$${(val/1000).toFixed(0)}K`} />
            <Tooltip 
              formatter={(val) => `$${(val/1000).toFixed(1)}K`}
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
            />
            <Legend />
            <Area type="monotone" dataKey="dividends" stackId="1" stroke="#10b981" fill="#10b981" name="Dividends" />
            <Area type="monotone" dataKey="rmd" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="RMDs" />
            <Area type="monotone" dataKey="socialSecurity" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Social Security" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Year-by-Year Table (Key Ages) */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold mb-4">Detailed Income Projections (Every 5 Years)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-600">
              <tr className="text-slate-300">
                <th className="text-left py-2">Age</th>
                <th className="text-right py-2">Dividends</th>
                <th className="text-right py-2">RMDs</th>
                <th className="text-right py-2">Soc Sec</th>
                <th className="text-right py-2">Total Income</th>
                <th className="text-right py-2">Taxes</th>
                <th className="text-right py-2">Net Income</th>
                <th className="text-right py-2">IRA Balance</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {lifetimeIncomeProjection.yearlyProjections
                .filter((p, i) => i === 0 || p.age % 5 === 0 || p.age === 73 || p.age === 90)
                .map((proj) => (
                  <tr key={proj.age} className={`border-b border-slate-700 ${proj.age === 73 ? 'bg-purple-900/20' : ''}`}>
                    <td className="py-2 font-semibold">{proj.age}</td>
                    <td className="text-right">${(proj.dividends / 1000).toFixed(0)}K</td>
                    <td className="text-right text-purple-400">${(proj.rmd / 1000).toFixed(0)}K</td>
                    <td className="text-right text-blue-400">${(proj.socialSecurity / 1000).toFixed(0)}K</td>
                    <td className="text-right font-semibold">${(proj.totalIncome / 1000).toFixed(0)}K</td>
                    <td className="text-right text-red-400">${(proj.totalTax / 1000).toFixed(0)}K</td>
                    <td className="text-right text-green-400 font-semibold">${(proj.netIncome / 1000).toFixed(0)}K</td>
                    <td className="text-right text-slate-400">${(proj.iraBalance / 1000000).toFixed(2)}M</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charitable Strategies */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 border border-indigo-500/30 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="text-2xl mr-2">💝</span>
          Charitable Contribution Strategies
        </h3>
        <div className="space-y-4">
          {charitableStrategies.map((strategy, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-indigo-300 text-lg">{strategy.name}</h4>
                  <div className="text-xs text-slate-400">Age: {strategy.ageRequirement} | Limit: {strategy.limit}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-green-400">{strategy.benefit}</div>
                  <div className="text-xs text-slate-400">{strategy.taxSavings}</div>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-2">{strategy.description}</p>
              <div className="bg-indigo-900/30 rounded p-3">
                <div className="text-xs text-indigo-200">
                  <strong>Example:</strong> {strategy.example}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real Estate Strategies */}
      <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/40 border border-amber-500/30 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="text-2xl mr-2">🏠</span>
          Real Estate Deduction Strategies
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {realEstateStrategies.map((strategy, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-amber-300 mb-1">{strategy.strategy}</h4>
              <div className="text-xs text-green-400 mb-2">{strategy.benefit}</div>
              <p className="text-sm text-slate-300 mb-2">{strategy.description}</p>
              <div className="bg-amber-900/30 rounded p-2 text-xs text-amber-200">
                {strategy.example}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Milestones */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold mb-4">Key Age Milestones</h3>
        <div className="space-y-3">
          {milestones.map((milestone, i) => (
            <div 
              key={i} 
              className={`flex items-center p-3 rounded-lg ${
                currentAge >= milestone.age ? 'bg-green-900/20 border border-green-600/30' : 'bg-slate-700/50'
              }`}
            >
              <div className="text-3xl font-bold text-blue-400 w-16">{milestone.age}</div>
              <div className="flex-1">
                <div className="font-semibold text-white">{milestone.event}</div>
                <div className="text-sm text-slate-400">{milestone.impact}</div>
              </div>
              {currentAge >= milestone.age && (
                <div className="text-green-400 text-sm font-semibold">✓ Active</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Income Sources */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold mb-4">Current Annual Income Sources (Taxable Account)</h3>
        <div className="space-y-3">
          {lifetimeIncomeProjection.incomeSources.map((source) => (
            <div key={source.etf} className="bg-slate-700/50 rounded p-3 flex justify-between items-center">
              <div className="flex-1">
                <div className="font-semibold">{source.etf}</div>
                <div className="text-xs text-slate-400">
                  ${(source.amount / 1000000).toFixed(2)}M × {source.yield}% yield
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-400">
                  ${(source.annualIncome / 1000).toFixed(1)}K
                </div>
                <div className="text-xs text-slate-400">{source.taxStatus}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IncomeTab;
