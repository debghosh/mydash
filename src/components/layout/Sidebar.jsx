// =============================================================================
// ALPHATIC - SIDEBAR COMPONENT
// =============================================================================
// Vertical navigation + Settings panel
// Replaces horizontal tab navigation
// =============================================================================

import React, { useState } from 'react';

const Sidebar = ({
  // Navigation
  activeTab,
  onTabChange,
  
  // Scenario Settings
  marketRegime,
  onMarketRegimeChange,
  riskTolerance,
  onRiskToleranceChange,
  
  // Portfolio Settings
  taxableAmount,
  onTaxableAmountChange,
  iraAmount,
  onIraAmountChange,
  rothAmount,
  onRothAmountChange,
  
  // Tax Settings
  capitalGainsRate,
  onCapitalGainsRateChange,
  stateTaxRate,
  onStateTaxRateChange,
  
  // Roth Strategy Settings
  conversionAmount,
  onConversionAmountChange,
  frontLoadConversions,
  onFrontLoadConversionsChange,
  continueAfterRMD,
  onContinueAfterRMDChange,
  
  // Other Settings
  rebalanceFrequency,
  onRebalanceFrequencyChange,
  useConservativeEstimates,
  onUseConservativeEstimatesChange,
  expectedGrowthRate,
  onExpectedGrowthRateChange
}) => {
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSection, setExpandedSection] = useState('scenario'); // 'scenario', 'portfolio', 'tax', 'roth', null
  
  // Tab definitions with icons
  const tabs = [
    { id: 'personas', label: 'Personas', icon: '👤' },
    { id: 'portfolio-builder', label: 'Portfolio Builder', icon: '🎯' },
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' },
    { id: 'analysis', label: 'Analysis', icon: '📈' },
    { id: 'market-regimes', label: 'Market Regimes', icon: '🌐' },
    { id: 'income', label: 'Income', icon: '💰' },
    { id: 'backtest', label: 'Backtest', icon: '⏮️' },
    { id: 'tax-optimization', label: 'Tax Optimization', icon: '🏛️' },
    { id: 'roth', label: 'Roth', icon: '🔄' },
    { id: 'portfolio-health', label: 'Portfolio Health', icon: '❤️' },
    { id: 'etfs', label: 'ETFs', icon: '📋' },
    { id: 'cpa-review', label: 'CPA Review', icon: '✅' }
  ];
  
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  return (
    <div className={`fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-700 transition-all duration-300 z-50 overflow-y-auto ${
      isCollapsed ? 'w-16' : 'w-72'
    }`}>
      
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold text-blue-400">ALPHATIC</h1>
            <div className="text-xs text-slate-400">Wealth Dashboard</div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      
      {/* Navigation */}
      <div className="py-4">
        <div className={`px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider ${
          isCollapsed ? 'text-center' : ''
        }`}>
          {isCollapsed ? '📊' : 'Navigation'}
        </div>
        
        <div className="space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full px-4 py-2.5 flex items-center gap-3 transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? tab.label : ''}
            >
              <span className="text-lg">{tab.icon}</span>
              {!isCollapsed && <span className="text-sm">{tab.label}</span>}
            </button>
          ))}
        </div>
      </div>
      
      {/* Settings */}
      {!isCollapsed && (
        <div className="border-t border-slate-700 py-4">
          <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            ⚙️ Settings
          </div>
          
          {/* Scenario Settings */}
          <div className="mb-2">
            <button
              onClick={() => toggleSection('scenario')}
              className="w-full px-4 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors"
            >
              <span className="text-sm font-semibold text-slate-300">Scenario</span>
              <span className="text-slate-400">{expandedSection === 'scenario' ? '▼' : '▶'}</span>
            </button>
            
            {expandedSection === 'scenario' && (
              <div className="px-4 py-2 space-y-3 bg-slate-800/50">
                {/* Market Regime */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Market Regime</label>
                  <select
                    value={marketRegime}
                    onChange={(e) => onMarketRegimeChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-white"
                  >
                    <option value="goldilocks">🟢 Goldilocks</option>
                    <option value="boom">🟡 Boom</option>
                    <option value="uncertainty">🟠 Uncertainty</option>
                    <option value="grind">🔵 Grind</option>
                    <option value="crisis">🔴 Crisis</option>
                  </select>
                  <div className="text-xs text-slate-500 mt-1">
                    Affects recommended allocations
                  </div>
                </div>
                
                {/* Risk Tolerance */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Risk Tolerance</label>
                  <select
                    value={riskTolerance}
                    onChange={(e) => onRiskToleranceChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-white"
                  >
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>
                
                {/* Rebalance Frequency */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Rebalance Frequency</label>
                  <select
                    value={rebalanceFrequency}
                    onChange={(e) => onRebalanceFrequencyChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semiannually">Semi-annually</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
                
                {/* Expected Growth Rate */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Expected Growth: <span className="text-white font-semibold">{expectedGrowthRate}%</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="12"
                    step="0.5"
                    value={expectedGrowthRate}
                    onChange={(e) => onExpectedGrowthRateChange(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-slate-500 mt-1">
                    Long-term annual return assumption
                  </div>
                </div>
                
                {/* Conservative Estimates Toggle */}
                <label className="flex items-center text-xs text-slate-300 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={useConservativeEstimates}
                    onChange={(e) => onUseConservativeEstimatesChange(e.target.checked)}
                    className="mr-2"
                  />
                  <span>Use Conservative Estimates (+20% buffer)</span>
                </label>
              </div>
            )}
          </div>
          
          {/* Portfolio Settings */}
          <div className="mb-2">
            <button
              onClick={() => toggleSection('portfolio')}
              className={`w-full px-4 py-3 flex items-center justify-between transition-all ${
                expandedSection === 'portfolio' 
                  ? 'bg-yellow-900/30 text-yellow-400 border-l-4 border-yellow-500' 
                  : 'hover:bg-slate-800 text-yellow-500 hover:text-yellow-400'
              }`}
            >
              <span className="text-sm font-bold flex items-center gap-2">
                💼 Portfolio
              </span>
              <span className="text-lg font-bold">{expandedSection === 'portfolio' ? '▼' : '▶'}</span>
            </button>
            
            {expandedSection === 'portfolio' && (
              <div className="px-4 py-2 space-y-3 bg-slate-800/50">
                {/* Cash Brokerage */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Cash Brokerage</label>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm">$</span>
                    <input
                      type="number"
                      value={taxableAmount}
                      onChange={(e) => onTaxableAmountChange(parseFloat(e.target.value))}
                      className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-white"
                      step="100000"
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    ${(taxableAmount / 1000000).toFixed(2)}M
                  </div>
                </div>
                
                {/* Traditional IRA */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Traditional IRA</label>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm">$</span>
                    <input
                      type="number"
                      value={iraAmount}
                      onChange={(e) => onIraAmountChange(parseFloat(e.target.value))}
                      className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-white"
                      step="100000"
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    ${(iraAmount / 1000000).toFixed(2)}M
                  </div>
                </div>
                
                {/* Roth IRA */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Roth IRA</label>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm">$</span>
                    <input
                      type="number"
                      value={rothAmount}
                      onChange={(e) => onRothAmountChange(parseFloat(e.target.value))}
                      className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-white"
                      step="100000"
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    ${(rothAmount / 1000000).toFixed(2)}M
                  </div>
                </div>
                
                {/* Total */}
                <div className="pt-2 border-t border-slate-700">
                  <div className="text-xs text-slate-400">Total Portfolio</div>
                  <div className="text-lg font-bold text-green-400">
                    ${((taxableAmount + iraAmount + rothAmount) / 1000000).toFixed(2)}M
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Tax Settings */}
          <div className="mb-2">
            <button
              onClick={() => toggleSection('tax')}
              className={`w-full px-4 py-3 flex items-center justify-between transition-all ${
                expandedSection === 'tax' 
                  ? 'bg-yellow-900/30 text-yellow-400 border-l-4 border-yellow-500' 
                  : 'hover:bg-slate-800 text-yellow-500 hover:text-yellow-400'
              }`}
            >
              <span className="text-sm font-bold flex items-center gap-2">
                💵 Tax
              </span>
              <span className="text-lg font-bold">{expandedSection === 'tax' ? '▼' : '▶'}</span>
            </button>
            
            {expandedSection === 'tax' && (
              <div className="px-4 py-2 space-y-3 bg-slate-800/50">
                {/* Capital Gains Rate */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Cap Gains Rate: <span className="text-white font-semibold">{capitalGainsRate}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="23.8"
                    step="0.1"
                    value={capitalGainsRate}
                    onChange={(e) => onCapitalGainsRateChange(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-slate-500 mt-1">
                    {capitalGainsRate === 0 && '0% (lowest bracket)'}
                    {capitalGainsRate === 15 && '15% (standard)'}
                    {capitalGainsRate === 20 && '20% (high income)'}
                    {capitalGainsRate === 23.8 && '23.8% (highest + NIIT)'}
                  </div>
                </div>
                
                {/* State Tax Rate */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    State Tax: <span className="text-white font-semibold">{stateTaxRate.toFixed(1)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="13"
                    step="0.5"
                    value={stateTaxRate}
                    onChange={(e) => onStateTaxRateChange(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-slate-500 mt-1">
                    {stateTaxRate === 0 && 'No state tax (FL, TX, NV, WA)'}
                    {stateTaxRate > 0 && stateTaxRate <= 5 && 'Low-tax state'}
                    {stateTaxRate > 5 && stateTaxRate <= 8 && 'Medium-tax state'}
                    {stateTaxRate > 8 && 'High-tax state (CA, NY, NJ)'}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Roth Strategy Settings */}
          <div className="mb-2">
            <button
              onClick={() => toggleSection('roth')}
              className={`w-full px-4 py-3 flex items-center justify-between transition-all ${
                expandedSection === 'roth' 
                  ? 'bg-yellow-900/30 text-yellow-400 border-l-4 border-yellow-500' 
                  : 'hover:bg-slate-800 text-yellow-500 hover:text-yellow-400'
              }`}
            >
              <span className="text-sm font-bold flex items-center gap-2">
                🔄 Roth Strategy
              </span>
              <span className="text-lg font-bold">{expandedSection === 'roth' ? '▼' : '▶'}</span>
            </button>
            
            {expandedSection === 'roth' && (
              <div className="px-4 py-2 space-y-3 bg-slate-800/50">
                {/* Annual Conversion */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Annual Conversion</label>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm">$</span>
                    <input
                      type="number"
                      value={conversionAmount}
                      onChange={(e) => onConversionAmountChange(parseFloat(e.target.value))}
                      className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-white"
                      step="10000"
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    ${(conversionAmount / 1000).toFixed(0)}K/year
                  </div>
                </div>
                
                {/* Front-Load Toggle */}
                <label className="flex items-center text-xs text-slate-300 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={frontLoadConversions}
                    onChange={(e) => onFrontLoadConversionsChange(e.target.checked)}
                    className="mr-2"
                  />
                  <span>Front-Load Conversions</span>
                </label>
                <div className="text-xs text-slate-500 -mt-2 ml-5">
                  Higher amounts early, taper down
                </div>
                
                {/* Continue After RMD Toggle */}
                <label className="flex items-center text-xs text-slate-300 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={continueAfterRMD}
                    onChange={(e) => onContinueAfterRMDChange(e.target.checked)}
                    className="mr-2"
                  />
                  <span>Continue After RMDs (Age 73+)</span>
                </label>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
