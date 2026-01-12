// =============================================================================
// ALPHATIC - TEMPLATE SELECTOR COMPONENT
// =============================================================================
// Modal to select and load pre-built portfolio templates
// Shows regime-based, goal-based, and income-focused templates
// =============================================================================

import React, { useState, useMemo } from 'react';

const TemplateSelector = ({ templates, onSelectTemplate, onClose }) => {
  const [selectedTab, setSelectedTab] = useState('all');
  
  // Group templates by source
  const groupedTemplates = useMemo(() => {
    const groups = {
      regime: [],
      goal: [],
      income: []
    };
    
    templates.forEach(template => {
      if (groups[template.source]) {
        groups[template.source].push(template);
      }
    });
    
    return groups;
  }, [templates]);
  
  const filteredTemplates = useMemo(() => {
    if (selectedTab === 'all') {
      return templates;
    }
    return templates.filter(t => t.source === selectedTab);
  }, [templates, selectedTab]);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Load Portfolio Template</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        
        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                selectedTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({templates.length})
            </button>
            <button
              onClick={() => setSelectedTab('regime')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                selectedTab === 'regime'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Regime ({groupedTemplates.regime.length})
            </button>
            <button
              onClick={() => setSelectedTab('goal')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                selectedTab === 'goal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Goal ({groupedTemplates.goal.length})
            </button>
            <button
              onClick={() => setSelectedTab('income')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                selectedTab === 'income'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Income ({groupedTemplates.income.length})
            </button>
          </div>
        </div>
        
        {/* Template Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => onSelectTemplate(template.id)}
              >
                <h3 className="font-semibold text-gray-800 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags.map(tag => (
                    <span 
                      key={tag}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Holdings count */}
                {template.allocation && (
                  <div className="text-xs text-gray-500">
                    {Object.keys(template.allocation).length} holdings
                  </div>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplate(template.id);
                  }}
                  className="mt-3 w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                >
                  Load Template
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            💡 <strong>Tip:</strong> Templates are starting points. You can customize any template after loading.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
