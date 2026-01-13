// =============================================================================
// ALPHATIC - DEPLOY PORTFOLIO MODAL
// =============================================================================
// Confirmation modal for deploying portfolio changes to production
// Shows impact summary and allows user to save as template
// =============================================================================

import React, { useState } from 'react';

const DeployModal = ({ 
  isOpen,
  onClose,
  onConfirm,
  portfolioName,
  allocation,
  isValid,
  portfolioSummary
}) => {
  
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState(portfolioName || '');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployComplete, setDeployComplete] = useState(false);
  
  if (!isOpen) return null;
  
  const handleDeploy = async () => {
    setIsDeploying(true);
    
    // Simulate deployment process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsDeploying(false);
    setDeployComplete(true);
    
    // Call the actual deploy function
    onConfirm(saveAsTemplate, templateName);
    
    // Auto-close after showing success
    setTimeout(() => {
      setDeployComplete(false);
      onClose();
    }, 2000);
  };
  
  if (deployComplete) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full mx-4 border border-green-500/30 shadow-2xl">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-green-400 mb-2">
              Portfolio Deployed Successfully!
            </h3>
            <p className="text-slate-300 mb-4">
              All tabs have been updated with your new portfolio allocation.
            </p>
            {portfolioSummary && (
              <div className="bg-slate-900 rounded p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Expected Income:</span>
                  <span className="text-green-400 font-semibold">
                    ${(portfolioSummary.annualIncome / 1000).toFixed(0)}K/year
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sharpe Ratio:</span>
                  <span className="text-blue-400 font-semibold">
                    {portfolioSummary.sharpeRatio?.toFixed(2) || 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  if (isDeploying) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full mx-4 border border-blue-500/30 shadow-2xl">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-pulse">⚙️</div>
            <h3 className="text-xl font-bold text-blue-400 mb-4">
              Deploying Portfolio...
            </h3>
            <div className="space-y-2 text-sm text-slate-300 text-left bg-slate-900 rounded p-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Calculating allocations
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Updating Income projections
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Recalculating Roth conversions
              </div>
              <div className="flex items-center gap-2 animate-pulse">
                <span className="text-yellow-400">⏳</span> Running backtest analysis...
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full border border-slate-600 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-white">Deploy Portfolio to Production?</h2>
          
          <div className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-4 mb-4">
            <p className="text-blue-200 text-sm">
              <strong>⚠️ Important:</strong> This will update ALL dashboard tabs with your new portfolio allocation.
              Your current allocation will be replaced.
            </p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-slate-300 mb-3">This will update:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                '✓ Portfolio tab (account allocations)',
                '✓ Overview tab (summary statistics)',
                '✓ Analysis tab (performance metrics)',
                '✓ Income tab (income projections)',
                '✓ Backtest tab (historical analysis)',
                '✓ Roth tab (conversion projections)',
                '✓ Tax Optimization tab (efficiency)',
                '✓ Portfolio Health tab (drift tracking)'
              ].map((item, idx) => (
                <div key={idx} className="text-slate-300 bg-slate-900/50 rounded px-3 py-2">
                  {item}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6 bg-slate-900 rounded-lg p-4">
            <h3 className="font-semibold text-slate-300 mb-3">Portfolio Summary:</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-slate-400">Portfolio Name</div>
                <div className="text-white font-medium">{portfolioName || 'Unnamed Portfolio'}</div>
              </div>
              <div>
                <div className="text-slate-400">Status</div>
                <div className={`font-medium ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                  {isValid ? '✓ Valid (100%)' : '✗ Invalid'}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Number of Holdings</div>
                <div className="text-white font-medium">{allocation ? Object.keys(allocation).length : 0}</div>
              </div>
              <div>
                <div className="text-slate-400">Total Allocation</div>
                <div className="text-white font-medium">
                  {allocation ? Object.values(allocation).reduce((sum, w) => sum + w, 0).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={saveAsTemplate}
                onChange={(e) => setSaveAsTemplate(e.target.checked)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-white">Save as template</div>
                <div className="text-xs text-slate-400 mt-1">
                  Save this allocation for future reuse
                </div>
              </div>
            </label>
            
            {saveAsTemplate && (
              <div className="mt-3 ml-7">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Template name"
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeploy}
              disabled={!isValid}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveAsTemplate ? 'Save & Deploy' : 'Deploy Portfolio'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeployModal;
