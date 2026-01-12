// =============================================================================
// ALPHATIC - ETF SELECTOR COMPONENT
// =============================================================================
// Display all 63 ETFs organized by category with add buttons
// Matches the left side of the Portfolio Builder screenshot
// =============================================================================

import React, { useState, useMemo } from 'react';
import { ETF_UNIVERSE, FACTOR_GROUPS } from '../../data';

const ETFSelector = ({ currentPortfolio, onAddETF, onShowDetails }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Organize ETFs by category
  const etfsByCategory = useMemo(() => {
    const categories = {};
    
    Object.values(ETF_UNIVERSE).forEach(etf => {
      const category = etf.category;
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(etf);
    });
    
    // Sort ETFs within each category by symbol
    Object.keys(categories).forEach(category => {
      categories[category].sort((a, b) => a.symbol.localeCompare(b.symbol));
    });
    
    return categories;
  }, []);
  
  // Filter ETFs based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery && selectedCategory === 'all') {
      return etfsByCategory;
    }
    
    const filtered = {};
    const query = searchQuery.toLowerCase();
    
    Object.entries(etfsByCategory).forEach(([category, etfs]) => {
      if (selectedCategory !== 'all' && category !== selectedCategory) {
        return;
      }
      
      const matchingETFs = etfs.filter(etf => 
        etf.symbol.toLowerCase().includes(query) ||
        etf.name.toLowerCase().includes(query) ||
        etf.factor.toLowerCase().includes(query)
      );
      
      if (matchingETFs.length > 0) {
        filtered[category] = matchingETFs;
      }
    });
    
    return filtered;
  }, [etfsByCategory, searchQuery, selectedCategory]);
  
  // Calculate years since inception
  const getYearsSinceInception = (inceptionDate) => {
    if (!inceptionDate) return null;
    const inception = new Date(inceptionDate);
    const now = new Date();
    const years = Math.floor((now - inception) / (365.25 * 24 * 60 * 60 * 1000));
    return years;
  };
  
  // Check if ETF is in portfolio
  const isInPortfolio = (symbol) => {
    return currentPortfolio.some(h => h.symbol === symbol);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">ETF Universe</h2>
        
        {/* Search and Filter */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ETFs by symbol, name, or factor..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {Object.keys(etfsByCategory).sort().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {Object.values(filteredCategories).flat().length} of {Object.values(ETF_UNIVERSE).length} ETFs
        </div>
      </div>
      
      {/* ETF Grid by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
        {Object.entries(filteredCategories).map(([category, etfs]) => (
          <div key={category} className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 text-sm mb-3 border-b border-gray-200 pb-2">
              {category}
            </h3>
            <div className="space-y-2">
              {etfs.map(etf => {
                const inPortfolio = isInPortfolio(etf.symbol);
                const yearsHistory = getYearsSinceInception(etf.inception);
                
                return (
                  <div 
                    key={etf.symbol}
                    className={`flex justify-between items-center p-2 rounded hover:bg-white transition-colors ${inPortfolio ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onShowDetails(etf.symbol)}
                          className="font-medium text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {etf.symbol}
                        </button>
                        {yearsHistory && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {yearsHistory}y
                          </span>
                        )}
                        {etf.yield && etf.yield > 0 && (
                          <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium">
                            {etf.yield.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate" title={etf.name}>
                        {etf.factor}
                      </div>
                      {etf.inception && (
                        <div className="text-xs text-gray-400">
                          Since {etf.inception}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onAddETF(etf.symbol)}
                      disabled={inPortfolio}
                      className={`ml-2 px-3 py-1 text-sm font-medium rounded transition-colors ${
                        inPortfolio
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {inPortfolio ? '✓' : '+'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {Object.keys(filteredCategories).length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg">No ETFs found</p>
          <p className="text-sm mt-2">Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  );
};

export default ETFSelector;
