// =============================================================================
// ALPHATIC - CURRENT PORTFOLIO COMPONENT
// =============================================================================
// Display current holdings with editable weights and remove buttons
// Matches the right side "Current Portfolio" section from screenshot
// =============================================================================

import React from 'react';
import { formatPercentage } from '../../utils';

const CurrentPortfolio = ({ 
  portfolio, 
  totalAllocation, 
  isValid,
  onWeightChange, 
  onRemove,
  onShowDetails 
}) => {
  
  if (portfolio.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Current Portfolio</h2>
        <div className="text-center text-gray-500 py-12">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <p className="text-lg mb-2">No holdings yet</p>
          <p className="text-sm">Add ETFs from the selector above to build your portfolio</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Current Portfolio</h2>
      
      <div className="space-y-2 mb-4">
        {portfolio.map(holding => (
          <div 
            key={holding.symbol}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <button
                onClick={() => onShowDetails(holding.symbol)}
                className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                {holding.symbol}
              </button>
              <div className="text-xs text-gray-600 truncate" title={holding.name}>
                {holding.name}
              </div>
              <div className="text-xs text-blue-600">
                {holding.factor}
              </div>
            </div>
            
            <div className="w-24">
              <input
                type="number"
                value={holding.weight.toFixed(2)}
                onChange={(e) => onWeightChange(holding.symbol, e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="0.1"
                min="0"
                max="100"
              />
            </div>
            
            <div className="w-16 text-right text-sm font-medium text-gray-700">
              {holding.weight.toFixed(1)}%
            </div>
            
            <button
              onClick={() => onRemove(holding.symbol)}
              className="text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition-colors"
              title="Remove from portfolio"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
      
      {/* Total Allocation */}
      <div className={`flex justify-between items-center p-3 rounded-lg font-semibold ${
        isValid 
          ? 'bg-green-50 text-green-700' 
          : 'bg-red-50 text-red-700'
      }`}>
        <span>Total Allocation</span>
        <span className="flex items-center gap-2">
          {totalAllocation.toFixed(2)}%
          {isValid ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                clipRule="evenodd" 
              />
            </svg>
          )}
        </span>
      </div>
      
      {!isValid && (
        <div className="mt-2 text-xs text-red-600">
          {totalAllocation < 100 
            ? `Add ${(100 - totalAllocation).toFixed(2)}% more to reach 100%`
            : `Reduce by ${(totalAllocation - 100).toFixed(2)}% to reach 100%`
          }
        </div>
      )}
    </div>
  );
};

export default CurrentPortfolio;
