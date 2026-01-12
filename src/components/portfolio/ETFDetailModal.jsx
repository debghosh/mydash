// =============================================================================
// ALPHATIC - ETF DETAIL MODAL COMPONENT
// =============================================================================
// Modal popup showing detailed ETF information
// Includes metadata, performance metrics, and add to portfolio button
// =============================================================================

import React from 'react';
import { ETF_UNIVERSE } from '../../data';
import { formatPercentage, formatCurrency } from '../../utils';

const ETFDetailModal = ({ 
  symbol, 
  isOpen, 
  onClose, 
  onAddToPortfolio,
  isInPortfolio 
}) => {
  if (!isOpen) return null;
  
  const etf = ETF_UNIVERSE[symbol];
  
  if (!etf) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">ETF Not Found</h2>
          <p>No information available for {symbol}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }
  
  // Calculate years since inception
  const getYearsSinceInception = () => {
    if (!etf.inception) return null;
    const inception = new Date(etf.inception);
    const now = new Date();
    const years = (now - inception) / (365.25 * 24 * 60 * 60 * 1000);
    return years.toFixed(1);
  };
  
  const years = getYearsSinceInception();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{symbol}</h2>
            <p className="text-gray-600 mt-1">{etf.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Category</div>
              <div className="text-lg font-semibold text-gray-800">{etf.category}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Factor</div>
              <div className="text-lg font-semibold text-blue-600">{etf.factor}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Expense Ratio</div>
              <div className="text-lg font-semibold text-gray-800">{etf.expense}%</div>
            </div>
            {etf.yield > 0 && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Yield</div>
                <div className="text-lg font-semibold text-green-600">{etf.yield.toFixed(2)}%</div>
              </div>
            )}
            {etf.inception && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Inception</div>
                <div className="text-lg font-semibold text-gray-800">
                  {etf.inception}
                  {years && <span className="text-sm text-gray-500 ml-2">({years} years)</span>}
                </div>
              </div>
            )}
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Tax Efficiency</div>
              <div className={`text-lg font-semibold ${
                etf.taxEfficiency === 'high' ? 'text-green-600' :
                etf.taxEfficiency === 'medium' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {etf.taxEfficiency ? etf.taxEfficiency.charAt(0).toUpperCase() + etf.taxEfficiency.slice(1) : 'N/A'}
              </div>
            </div>
          </div>
          
          {/* Description */}
          {etf.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Description
              </h3>
              <p className="text-gray-600">{etf.description}</p>
            </div>
          )}
          
          {/* Key Features */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Key Features
            </h3>
            <div className="space-y-2 text-sm">
              {etf.yield > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Yield</span>
                  <span className="font-medium text-green-600">{etf.yield.toFixed(2)}%</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Annual Cost</span>
                <span className="font-medium">{etf.expense}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Track Record</span>
                <span className="font-medium">{years ? `${years} years` : 'N/A'}</span>
              </div>
              {etf.taxEfficiency && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax Treatment</span>
                  <span className={`font-medium ${
                    etf.taxEfficiency === 'high' ? 'text-green-600' :
                    etf.taxEfficiency === 'medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {etf.taxEfficiency === 'high' ? 'Tax-efficient (Taxable OK)' :
                     etf.taxEfficiency === 'medium' ? 'Moderate (Consider IRA)' :
                     'Tax-inefficient (Use IRA)'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Placeholder for chart */}
          <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>Historical chart - Coming in Phase 4</p>
            <p className="text-xs mt-1">Will show {years} years of price history</p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Close
          </button>
          {!isInPortfolio && (
            <button
              onClick={() => {
                onAddToPortfolio();
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Add to Portfolio
            </button>
          )}
          {isInPortfolio && (
            <div className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium text-center">
              ✓ In Portfolio
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ETFDetailModal;
