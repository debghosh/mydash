// =============================================================================
// ALPHATIC - PORTFOLIO ACTIONS COMPONENT
// =============================================================================
// Action buttons: Normalize, Clear, Save, Export, Import, Analyze, Backtest
// =============================================================================

import React from 'react';

const PortfolioActions = ({
  portfolio,
  isValid,
  onNormalize,
  onClear,
  onSave,
  onExport,
  onImport,
  showAnalysisButton,
  showBacktestButton
}) => {
  
  const handleExport = () => {
    const data = onExport();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert(`Portfolio "${data.name}" exported successfully!`);
  };
  
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (onImport(data)) {
            alert(`Portfolio "${data.name || 'Imported'}" loaded successfully!`);
          } else {
            alert('Error importing portfolio. Check file format.');
          }
        } catch (error) {
          alert(`Error importing portfolio: ${error.message}`);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };
  
  const handleSave = () => {
    const name = prompt('Enter portfolio name:', portfolio.name || 'My Portfolio');
    if (name) {
      const saved = onSave(name);
      alert(`Portfolio "${saved.name}" saved successfully!`);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="font-semibold text-gray-800 mb-4">Portfolio Actions</h3>
      
      <div className="space-y-2">
        {/* Normalize */}
        <button
          onClick={onNormalize}
          disabled={portfolio.length === 0}
          className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
        >
          ⚖️ Normalize to 100%
        </button>
        
        {/* Clear */}
        <button
          onClick={() => {
            if (confirm('Clear all holdings? This cannot be undone.')) {
              onClear();
            }
          }}
          disabled={portfolio.length === 0}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
        >
          🗑️ Clear All
        </button>
        
        <div className="border-t border-gray-200 my-3"></div>
        
        {/* Save */}
        <button
          onClick={handleSave}
          disabled={portfolio.length === 0 || !isValid}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
        >
          💾 Save Portfolio
        </button>
        
        {/* Export */}
        <button
          onClick={handleExport}
          disabled={portfolio.length === 0}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
        >
          📥 Export
        </button>
        
        {/* Import */}
        <button
          onClick={handleImport}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          📤 Import
        </button>
        
        {showAnalysisButton && (
          <>
            <div className="border-t border-gray-200 my-3"></div>
            <button
              onClick={() => alert('Analysis tab - Coming in Phase 4')}
              disabled={portfolio.length === 0 || !isValid}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
            >
              📊 Analyze Portfolio
            </button>
          </>
        )}
        
        {showBacktestButton && (
          <button
            onClick={() => alert('Backtest tab - Coming in Phase 4')}
            disabled={portfolio.length === 0 || !isValid}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            📈 Backtest
          </button>
        )}
      </div>
      
      {!isValid && portfolio.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
          ⚠️ Portfolio must total 100% to save, analyze, or backtest
        </div>
      )}
    </div>
  );
};

export default PortfolioActions;
