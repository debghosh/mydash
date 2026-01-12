// =============================================================================
// ALPHATIC - SAVED PORTFOLIOS COMPONENT
// =============================================================================
// Display list of saved portfolios with load and delete actions
// Matches the "Saved Portfolios" section from screenshot
// =============================================================================

import React from 'react';

const SavedPortfolios = ({ savedPortfolios, onLoad, onDelete }) => {
  
  if (savedPortfolios.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Saved Portfolios</h3>
        <div className="text-center text-gray-500 py-8">
          <svg 
            className="mx-auto h-10 w-10 text-gray-400 mb-3" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" 
            />
          </svg>
          <p className="text-sm">No saved portfolios yet</p>
          <p className="text-xs text-gray-400 mt-1">Save your first portfolio to see it here</p>
        </div>
      </div>
    );
  }
  
  // Sort by most recent first
  const sortedPortfolios = [...savedPortfolios].sort((a, b) => 
    new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
  );
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="font-semibold text-gray-800 mb-4">
        Saved Portfolios ({savedPortfolios.length})
      </h3>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedPortfolios.map(portfolio => (
          <div
            key={portfolio.id}
            className="border border-gray-200 rounded-lg p-3 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-800 truncate">
                  {portfolio.name}
                </h4>
                {portfolio.description && (
                  <p className="text-xs text-gray-600 truncate">
                    {portfolio.description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Tags */}
            {portfolio.tags && portfolio.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {portfolio.tags.slice(0, 3).map(tag => (
                  <span 
                    key={tag}
                    className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {portfolio.tags.length > 3 && (
                  <span className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 rounded">
                    +{portfolio.tags.length - 3}
                  </span>
                )}
              </div>
            )}
            
            {/* Info */}
            <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
              <span>{portfolio.holdings.length} holdings</span>
              <span>{formatDate(portfolio.updatedAt || portfolio.createdAt)}</span>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onLoad(portfolio.id)}
                className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
              >
                Load
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete "${portfolio.name}"? This cannot be undone.`)) {
                    onDelete(portfolio.id);
                  }
                }}
                className="px-3 py-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedPortfolios;
