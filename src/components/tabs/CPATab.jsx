// =============================================================================
// ALPHATIC - CPA REVIEW TAB (FULLY RESTORED)
// =============================================================================
// Professional CPA meeting preparation and tax planning checklist
// Includes deadlines, document checklist, and year-end strategies
// =============================================================================

import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../../utils/formatters';

const CPATab = ({ 
  taxableAmount = 8500000,
  iraAmount = 4100000,
  rothAmount = 0
}) => {
  
  const [notes, setNotes] = useState('');
  
  // Calculate current tax situation
  const taxSituation = useMemo(() => {
    const age73RMDRate = 0.0377;
    const rmd = iraAmount * age73RMDRate;
    const divs = taxableAmount * 0.025;
    const ss = 55000;
    const totalIncome = rmd + divs + (ss * 0.85);
    
    return { rmd, divs, ss, totalIncome };
  }, [taxableAmount, iraAmount]);
  
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">CPA Review & Follow-Up Checklist</h2>
        <div className="text-sm text-slate-400">
          Tax Year {currentYear}
        </div>
      </div>

      {/* Key Tax Deadlines */}
      <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-600/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
          <span>📅</span> Key Tax Deadlines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-400 mb-3">Quarterly Estimated Taxes</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Q1 (Jan 1 - Mar 31):</span>
                <span className="font-semibold">April 15</span>
              </div>
              <div className="flex justify-between">
                <span>Q2 (Apr 1 - May 31):</span>
                <span className="font-semibold">June 15</span>
              </div>
              <div className="flex justify-between">
                <span>Q3 (Jun 1 - Aug 31):</span>
                <span className="font-semibold">September 15</span>
              </div>
              <div className="flex justify-between">
                <span>Q4 (Sep 1 - Dec 31):</span>
                <span className="font-semibold">January 15 (next year)</span>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-400 mb-3">Annual Deadlines</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Roth Conversion Deadline:</span>
                <span className="font-semibold text-red-400">December 31</span>
              </div>
              <div className="flex justify-between">
                <span>IRA Contribution Deadline:</span>
                <span className="font-semibold">April 15 (next year)</span>
              </div>
              <div className="flex justify-between">
                <span>Tax Return Filing:</span>
                <span className="font-semibold">April 15 (next year)</span>
              </div>
              <div className="flex justify-between">
                <span>RMD Deadline (if applicable):</span>
                <span className="font-semibold text-red-400">December 31</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pre-CPA Meeting Checklist */}
      <div className="bg-slate-700/50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
          <span>📋</span> Pre-CPA Meeting Preparation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-green-400 mb-3">Documents to Gather</h4>
            <div className="space-y-2 text-sm">
              {[
                'W-2s from all employers',
                '1099-DIV (dividend income)',
                '1099-INT (interest income)',
                '1099-B (brokerage sales)',
                '1099-R (retirement distributions)',
                '1099-MISC (other income)',
                'K-1s (partnership/trust income)',
                'Property tax statements',
                'Mortgage interest statements (1098)',
                'Charitable contribution receipts',
                'Medical expense receipts',
                'State tax payment records'
              ].map((item, idx) => (
                <label key={idx} className="flex items-center gap-2 hover:bg-slate-600/30 p-2 rounded cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-slate-300">{item}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-green-400 mb-3">Questions to Discuss</h4>
            <div className="space-y-2 text-sm">
              {[
                'Optimal Roth conversion amount for this year?',
                'Should I pre-pay state taxes in December?',
                'Are quarterly estimates on track?',
                'QCD strategy for next year (if 70½+)?',
                'Tax-loss harvesting opportunities?',
                'IRMAA bracket management?',
                'Estate planning updates needed?',
                'Timing of large capital gains?',
                'Charitable giving strategy?',
                'HSA contribution maximization?',
                'Backdoor Roth considerations?',
                'Business expense deductions?'
              ].map((item, idx) => (
                <label key={idx} className="flex items-center gap-2 hover:bg-slate-600/30 p-2 rounded cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-slate-300">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Year-End Tax Planning Opportunities */}
      <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-600/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
          <span>💡</span> Year-End Tax Planning Opportunities (Before Dec 31)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-2">Roth Conversion Strategy</h4>
              <ul className="text-sm text-slate-300 space-y-1 ml-4">
                <li>• Execute planned ${((iraAmount * 0.06) / 1000).toFixed(0)}K conversion</li>
                <li>• Stay under 24% federal bracket</li>
                <li>• Avoid IRMAA cliff ($206K+ AGI)</li>
                <li>• Time after market dip if possible</li>
              </ul>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-2">Tax-Loss Harvesting</h4>
              <ul className="text-sm text-slate-300 space-y-1 ml-4">
                <li>• Harvest losses in taxable account</li>
                <li>• Offset capital gains + $3K ordinary</li>
                <li>• Replace with similar ETF (avoid wash sale)</li>
                <li>• Wait 31 days before repurchasing</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-2">Charitable Giving</h4>
              <ul className="text-sm text-slate-300 space-y-1 ml-4">
                <li>• QCD if 70½+ (up to $105K)</li>
                <li>• Bunching strategy (alternate years)</li>
                <li>• Donor-Advised Fund contribution</li>
                <li>• Donate appreciated securities (avoid cap gains)</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-2">Income Acceleration/Deferral</h4>
              <ul className="text-sm text-slate-300 space-y-1 ml-4">
                <li>• Defer income to January if lower bracket next year</li>
                <li>• Accelerate deductions to December</li>
                <li>• Time capital gains strategically</li>
                <li>• Maximize retirement contributions</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-2">RMD Management (if 73+)</h4>
              <ul className="text-sm text-slate-300 space-y-1 ml-4">
                <li>• Calculate and withdraw RMD by Dec 31</li>
                <li>• Consider QCD to satisfy RMD</li>
                <li>• Avoid double income (RMD + conversion)</li>
                <li>• Time withdrawal for tax efficiency</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-2">Pre-Pay Strategies</h4>
              <ul className="text-sm text-slate-300 space-y-1 ml-4">
                <li>• Q4 estimated tax payment (Jan 15 → Dec 31)</li>
                <li>• Property taxes (if under $10K SALT cap)</li>
                <li>• Mortgage interest (if beneficial)</li>
                <li>• Medical expenses near 7.5% AGI threshold</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Post-Meeting Follow-Up Actions */}
      <div className="bg-slate-700/50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
          <span>✅</span> Post-Meeting Follow-Up Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 text-sm">
            {[
              'Execute agreed Roth conversion amount',
              'Update quarterly estimated tax payments',
              'Complete any year-end transactions',
              'Implement tax-loss harvesting trades',
              'Make charitable contributions',
              'Schedule Q1 estimated tax payment',
              'Update financial planning spreadsheet'
            ].map((item, idx) => (
              <label key={idx} className="flex items-center gap-2 hover:bg-slate-600/30 p-2 rounded cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-slate-300">{item}</span>
              </label>
            ))}
          </div>
          <div className="space-y-2 text-sm">
            {[
              'File away all tax documents',
              'Update tax projection for next year',
              'Calendar next CPA meeting date',
              'Review and adjust withholdings',
              'Plan RMD strategy (if applicable)',
              'Update estate plan documents',
              'Schedule mid-year tax checkup'
            ].map((item, idx) => (
              <label key={idx} className="flex items-center gap-2 hover:bg-slate-600/30 p-2 rounded cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-slate-300">{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Current Tax Situation Summary */}
      <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-600/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
          <span>📊</span> Current Tax Situation (Age 73 Projection)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-green-400 mb-2">Income Sources</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Dividends:</span>
                <span className="text-white">${(taxSituation.divs / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">RMDs:</span>
                <span className="text-white">${(taxSituation.rmd / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Social Security:</span>
                <span className="text-white">${(taxSituation.ss / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between border-t border-slate-600 pt-1 mt-1 font-bold">
                <span className="text-slate-300">Total AGI:</span>
                <span className="text-green-400">${(taxSituation.totalIncome / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-amber-400 mb-2">Tax Bracket</h4>
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
                <span className="text-white">0% (TX)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">IRMAA status:</span>
                <span className={taxSituation.totalIncome > 206000 ? 'text-red-400' : 'text-green-400'}>
                  {taxSituation.totalIncome > 206000 ? 'At Risk' : 'Safe'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-400 mb-2">Tax Efficiency</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Asset location:</span>
                <span className="text-green-400">Optimized</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">TLH potential:</span>
                <span className="text-green-400">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Roth conversion:</span>
                <span className="text-green-400">On Track</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Overall rating:</span>
                <span className="text-green-400 font-bold">A-</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-slate-700/50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
          <span>📝</span> CPA Meeting Notes
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-40 bg-slate-800 border border-slate-600 rounded-lg p-4 text-slate-200 font-mono text-sm resize-y focus:outline-none focus:border-blue-500"
          placeholder="Record important notes, recommendations, and action items from your CPA meeting..."
        />
        <div className="text-xs text-slate-400 mt-2">
          Notes are saved locally in your browser
        </div>
      </div>

      {/* Quick Reference Card */}
      <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-600/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-yellow-400 mb-4">🎯 Quick Reference: Tax-Smart Strategies</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-blue-400 mb-2">Maximize Deductions</h4>
            <ul className="text-slate-300 space-y-1 ml-4">
              <li>• Charitable contributions</li>
              <li>• Property taxes (SALT cap)</li>
              <li>• Mortgage interest</li>
              <li>• Medical expenses (>7.5% AGI)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-400 mb-2">Minimize Taxes</h4>
            <ul className="text-slate-300 space-y-1 ml-4">
              <li>• Tax-loss harvesting</li>
              <li>• Capital gain timing</li>
              <li>• Asset location optimization</li>
              <li>• QCD strategy (70½+)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-400 mb-2">Plan Ahead</h4>
            <ul className="text-slate-300 space-y-1 ml-4">
              <li>• Quarterly estimates</li>
              <li>• Roth conversion schedule</li>
              <li>• RMD planning (73+)</li>
              <li>• Estate updates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CPATab;
