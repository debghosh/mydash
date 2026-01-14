// =============================================================================
// ALPHATIC - PORTFOLIO BUILDER COMPONENT
// =============================================================================
// Main portfolio builder interface with ETF selector and current portfolio
// Integrates templates, analysis, and persistence
// =============================================================================

import React from 'react';
import { usePortfolioBuilder } from '../../hooks/usePortfolioBuilder';
import ETFSelector from './ETFSelector';
import CurrentPortfolio from './CurrentPortfolio';
import PortfolioActions from './PortfolioActions';
import TemplateSelector from './TemplateSelector';
import SavedPortfolios from './SavedPortfolios';
import ETFDetailModal from './ETFDetailModal';

const PortfolioBuilder = ({ 
  onPortfolioChange,
  initialTemplate = null,
  showAnalysisButton = true,
  showBacktestButton = true 
}) => {
  const portfolioBuilder = usePortfolioBuilder({
    initialTemplate,
    onPortfolioChange,
    autoSave: true
  });
  
  const {
    portfolio,
    totalAllocation,
    isValid,
    portfolioName,
    portfolioDescription,
    portfolioTags,
    portfolioTemplateId,
    
    // Actions
    addETF,
    removeETF,
    updateWeight,
    normalizeWeights,
    clearPortfolio,
    
    // Metadata
    updateMetadata,
    addTag,
    removeTag,
    
    // Templates
    loadTemplate,
    getAvailableTemplates,
    showTemplateSelector,
    setShowTemplateSelector,
    
    // Persistence
    savePortfolio,
    getSavedPortfolios,
    loadSavedPortfolio,
    deleteSavedPortfolio,
    
    // Import/Export
    exportPortfolio,
    importPortfolio,
    
    // ETF Modal
    showETFModal,
    setShowETFModal,
    selectedETF,
    setSelectedETF,
    
    // Analysis
    portfolioAnalysis,
    weightedYield,
    weightedExpenseRatio
  } = portfolioBuilder;
  
  // Handle showing ETF details
  const handleShowETFDetail = (symbol) => {
    setSelectedETF(symbol);
    setShowETFModal(true);
  };
  
  return (
    <div className="portfolio-builder max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="text-2xl font-bold text-slate-100 mb-2">
              {portfolioName || 'My Portfolio'}
            </div>
            <div className="text-sm text-slate-400 mb-3">
              {portfolioDescription || 'Build your custom portfolio allocation'}
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center gap-3">
              {isValid ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-900/30 border border-green-600/50 rounded text-sm">
                  <span className="text-green-400">✓ Portfolio Complete</span>
                  <span className="text-slate-400">({Object.keys(portfolio).length} ETFs, {totalAllocation.toFixed(1)}%)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-900/30 border border-yellow-600/50 rounded text-sm">
                  <span className="text-yellow-400">⚠ Incomplete</span>
                  <span className="text-slate-400">{totalAllocation.toFixed(1)}% allocated (need 100%)</span>
                </div>
              )}
              
              {/* Template Badge */}
              {portfolioTemplateId && (
                <div className="text-xs text-slate-500 px-2 py-1 bg-slate-800 rounded">
                  From template: <span className="font-medium text-blue-400">{portfolioTemplateId}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowTemplateSelector(!showTemplateSelector)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              📋 Load Template
            </button>
            
            {/* DONE BUTTON - Apply portfolio to all tabs */}
            {isValid && onPortfolioChange && (
              <button
                onClick={() => {
                  // Portfolio is already being applied via useEffect in hook
                  // This button just gives visual feedback
                  alert('✅ Portfolio applied! All dashboard tabs will use this allocation.');
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-bold shadow-lg"
              >
                ✓ DONE - Apply Portfolio
              </button>
            )}
          </div>
        </div>
        
        {/* Template Selector */}
        {showTemplateSelector && (
          <TemplateSelector
            templates={getAvailableTemplates()}
            onSelectTemplate={(templateId) => {
              loadTemplate(templateId);
              setShowTemplateSelector(false);
            }}
            onClose={() => setShowTemplateSelector(false)}
          />
        )}
        
        {/* Portfolio Summary */}
        {portfolio.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-xs text-gray-500">Holdings</div>
              <div className="text-lg font-semibold">{portfolio.length}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Total Allocation</div>
              <div className={`text-lg font-semibold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                {totalAllocation.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Weighted Yield</div>
              <div className="text-lg font-semibold">{weightedYield.toFixed(2)}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Expense Ratio</div>
              <div className="text-lg font-semibold">{weightedExpenseRatio.toFixed(2)}%</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: ETF Selector (2/3 width) */}
        <div className="lg:col-span-2">
          <ETFSelector
            currentPortfolio={portfolio}
            onAddETF={addETF}
            onShowDetails={handleShowETFDetail}
          />
        </div>
        
        {/* Right: Current Portfolio & Actions (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">
          <CurrentPortfolio
            portfolio={portfolio}
            totalAllocation={totalAllocation}
            isValid={isValid}
            onWeightChange={updateWeight}
            onRemove={removeETF}
            onShowDetails={handleShowETFDetail}
          />
          
          <PortfolioActions
            portfolio={portfolio}
            isValid={isValid}
            onNormalize={normalizeWeights}
            onClear={clearPortfolio}
            onSave={savePortfolio}
            onExport={exportPortfolio}
            onImport={importPortfolio}
            showAnalysisButton={showAnalysisButton}
            showBacktestButton={showBacktestButton}
          />
          
          <SavedPortfolios
            savedPortfolios={getSavedPortfolios()}
            onLoad={loadSavedPortfolio}
            onDelete={deleteSavedPortfolio}
          />
        </div>
      </div>
      
      {/* ETF Detail Modal */}
      {showETFModal && selectedETF && (
        <ETFDetailModal
          symbol={selectedETF}
          isOpen={showETFModal}
          onClose={() => {
            setShowETFModal(false);
            setSelectedETF(null);
          }}
          onAddToPortfolio={() => {
            addETF(selectedETF);
            setShowETFModal(false);
            setSelectedETF(null);
          }}
          isInPortfolio={portfolio.some(h => h.symbol === selectedETF)}
        />
      )}
    </div>
  );
};

export default PortfolioBuilder;
