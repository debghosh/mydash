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
            <input
              type="text"
              value={portfolioName}
              onChange={(e) => updateMetadata({ name: e.target.value })}
              className="text-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-500 px-2 py-1 rounded"
              placeholder="Portfolio Name"
            />
            <input
              type="text"
              value={portfolioDescription}
              onChange={(e) => updateMetadata({ description: e.target.value })}
              className="text-sm text-gray-600 border-none outline-none focus:ring-2 focus:ring-blue-500 px-2 py-1 rounded w-full mt-1"
              placeholder="Add a description..."
            />
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {portfolioTags.map(tag => (
                <span 
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={() => {
                  const tag = prompt('Enter tag:');
                  if (tag) addTag(tag);
                }}
                className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full hover:bg-gray-200"
              >
                + Add Tag
              </button>
            </div>
            
            {/* Template Badge */}
            {portfolioTemplateId && (
              <div className="mt-2 text-xs text-gray-500">
                Based on template: <span className="font-medium">{portfolioTemplateId}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowTemplateSelector(!showTemplateSelector)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              📋 Load Template
            </button>
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
