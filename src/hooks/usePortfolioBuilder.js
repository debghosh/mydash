// =============================================================================
// ALPHATIC - PORTFOLIO BUILDER HOOK
// =============================================================================
// Central portfolio state management with templates, persistence, and analysis
// All tabs react to portfolio changes for live recalculation
// =============================================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ETF_UNIVERSE, getAllocationByRegime, getAllocationByGoal, getIncomeAllocation } from '../data';
import { 
  analyzePortfolio, 
  calculateWeightedYield, 
  calculateWeightedExpenseRatio 
} from '../utils';

// =============================================================================
// PORTFOLIO TEMPLATES (From Phase 1 Allocations)
// =============================================================================

const PORTFOLIO_TEMPLATES = {
  // Regime-based templates
  'regime-goldilocks': {
    id: 'regime-goldilocks',
    name: 'Goldilocks (Full Risk-On)',
    description: 'Bull market + Low volatility + Low inflation',
    tags: ['Regime', 'Aggressive', 'Growth'],
    allocation: null, // Will load from getAllocationByRegime('goldilocks')
    source: 'regime'
  },
  'regime-boom': {
    id: 'regime-boom',
    name: 'Boom (Heating Up)',
    description: 'Bull market + Rising volatility + Rising inflation',
    tags: ['Regime', 'Balanced', 'Quality'],
    allocation: null,
    source: 'regime'
  },
  'regime-uncertainty': {
    id: 'regime-uncertainty',
    name: 'Uncertainty (Defensive)',
    description: 'Sideways + High volatility + Sticky inflation',
    tags: ['Regime', 'Conservative', 'Low-Vol'],
    allocation: null,
    source: 'regime'
  },
  'regime-grind': {
    id: 'regime-grind',
    name: 'Sideways Grind (Balanced)',
    description: 'Range-bound + Low volatility + Stable inflation',
    tags: ['Regime', 'Balanced', 'Quality'],
    allocation: null,
    source: 'regime'
  },
  'regime-crisis': {
    id: 'regime-crisis',
    name: 'Crisis (Maximum Defense)',
    description: 'Bear market + High volatility + Risk-off',
    tags: ['Regime', 'Defensive', 'Safety'],
    allocation: null,
    source: 'regime'
  },
  
  // Goal-based templates
  'goal-max-growth': {
    id: 'goal-max-growth',
    name: 'Maximum Growth',
    description: 'Aggressive growth portfolio',
    tags: ['Goal', 'Aggressive', 'Growth'],
    allocation: null,
    source: 'goal'
  },
  'goal-growth-income': {
    id: 'goal-growth-income',
    name: 'Growth + Income',
    description: 'Balanced growth with income generation',
    tags: ['Goal', 'Balanced', 'Income'],
    allocation: null,
    source: 'goal'
  },
  'goal-balanced': {
    id: 'goal-balanced',
    name: 'Balanced',
    description: 'Mix of growth and income',
    tags: ['Goal', 'Balanced', 'Diversified'],
    allocation: null,
    source: 'goal'
  },
  'goal-conservative': {
    id: 'goal-conservative',
    name: 'Conservative',
    description: 'Capital preservation focus',
    tags: ['Goal', 'Conservative', 'Safety'],
    allocation: null,
    source: 'goal'
  },
  'goal-early-retirement': {
    id: 'goal-early-retirement',
    name: 'Early Retirement',
    description: 'Income without principal depletion',
    tags: ['Goal', 'Income', 'Retirement'],
    allocation: null,
    source: 'goal'
  },
  
  // Income-focused templates
  'income-conservative': {
    id: 'income-conservative',
    name: 'Conservative Income',
    description: 'High income with stability',
    tags: ['Income', 'Conservative', 'Dividend'],
    allocation: null,
    source: 'income'
  },
  'income-moderate': {
    id: 'income-moderate',
    name: 'Moderate Income',
    description: 'Income with some growth',
    tags: ['Income', 'Balanced', 'Dividend'],
    allocation: null,
    source: 'income'
  },
  'income-aggressive': {
    id: 'income-aggressive',
    name: 'Aggressive Income',
    description: 'Maximum income generation',
    tags: ['Income', 'Aggressive', 'High-Yield'],
    allocation: null,
    source: 'income'
  }
};

// Load allocations from data layer
const loadTemplateAllocations = () => {
  // Regime allocations
  PORTFOLIO_TEMPLATES['regime-goldilocks'].allocation = getAllocationByRegime('goldilocks');
  PORTFOLIO_TEMPLATES['regime-boom'].allocation = getAllocationByRegime('boom');
  PORTFOLIO_TEMPLATES['regime-uncertainty'].allocation = getAllocationByRegime('uncertainty');
  PORTFOLIO_TEMPLATES['regime-grind'].allocation = getAllocationByRegime('grind');
  PORTFOLIO_TEMPLATES['regime-crisis'].allocation = getAllocationByRegime('crisis');
  
  // Goal allocations
  PORTFOLIO_TEMPLATES['goal-max-growth'].allocation = getAllocationByGoal('max-growth');
  PORTFOLIO_TEMPLATES['goal-growth-income'].allocation = getAllocationByGoal('growth-income');
  PORTFOLIO_TEMPLATES['goal-balanced'].allocation = getAllocationByGoal('balanced');
  PORTFOLIO_TEMPLATES['goal-conservative'].allocation = getAllocationByGoal('conservative');
  PORTFOLIO_TEMPLATES['goal-early-retirement'].allocation = getAllocationByGoal('early-retirement');
  
  // Income allocations
  PORTFOLIO_TEMPLATES['income-conservative'].allocation = getIncomeAllocation('conservative-income');
  PORTFOLIO_TEMPLATES['income-moderate'].allocation = getIncomeAllocation('moderate-income');
  PORTFOLIO_TEMPLATES['income-aggressive'].allocation = getIncomeAllocation('aggressive-income');
};

// Initialize templates
loadTemplateAllocations();

// =============================================================================
// PORTFOLIO BUILDER HOOK
// =============================================================================

export const usePortfolioBuilder = (options = {}) => {
  const {
    initialPortfolio = null,
    initialTemplate = null,
    onPortfolioChange = null,
    autoSave = true
  } = options;
  
  // Core portfolio state
  const [portfolio, setPortfolio] = useState([]);
  
  // Portfolio metadata
  const [portfolioName, setPortfolioName] = useState('My Portfolio');
  const [portfolioDescription, setPortfolioDescription] = useState('');
  const [portfolioTags, setPortfolioTags] = useState([]);
  const [portfolioCreatedAt, setPortfolioCreatedAt] = useState(new Date().toISOString());
  const [portfolioTemplateId, setPortfolioTemplateId] = useState(null);
  
  // UI state
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showETFModal, setShowETFModal] = useState(false);
  const [selectedETF, setSelectedETF] = useState(null);
  
  // =============================================================================
  // INITIALIZATION
  // =============================================================================
  
  useEffect(() => {
    // Load initial portfolio
    if (initialPortfolio) {
      loadPortfolioData(initialPortfolio);
    } else if (initialTemplate) {
      loadTemplate(initialTemplate);
    } else {
      // Try to load last used portfolio from localStorage
      const lastPortfolio = localStorage.getItem('alphatic_current_portfolio');
      if (lastPortfolio) {
        try {
          const data = JSON.parse(lastPortfolio);
          loadPortfolioData(data);
        } catch (e) {
          console.error('Failed to load last portfolio:', e);
        }
      }
    }
  }, []);
  
  // Auto-save to localStorage
  useEffect(() => {
    if (autoSave && portfolio.length > 0) {
      const portfolioData = {
        name: portfolioName,
        description: portfolioDescription,
        tags: portfolioTags,
        createdAt: portfolioCreatedAt,
        templateId: portfolioTemplateId,
        holdings: portfolio,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('alphatic_current_portfolio', JSON.stringify(portfolioData));
    }
  }, [portfolio, portfolioName, portfolioDescription, portfolioTags, autoSave]);
  
  // Trigger callback when portfolio changes
  useEffect(() => {
    if (onPortfolioChange && portfolio.length > 0) {
      const allocation = portfolioToAllocation(portfolio);
      onPortfolioChange({
        portfolio,
        allocation,
        metadata: {
          name: portfolioName,
          description: portfolioDescription,
          tags: portfolioTags,
          templateId: portfolioTemplateId
        }
      });
    }
  }, [portfolio, onPortfolioChange]);
  
  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================
  
  const totalAllocation = useMemo(() => {
    return portfolio.reduce((sum, holding) => sum + holding.weight, 0);
  }, [portfolio]);
  
  const isValid = useMemo(() => {
    return Math.abs(totalAllocation - 100) < 0.01;
  }, [totalAllocation]);
  
  const allocation = useMemo(() => {
    return portfolioToAllocation(portfolio);
  }, [portfolio]);
  
  const portfolioAnalysis = useMemo(() => {
    if (portfolio.length === 0) return null;
    
    try {
      return analyzePortfolio(
        allocation,
        'uncertainty', // Default regime, can be overridden
        'quarterly'
      );
    } catch (e) {
      console.error('Portfolio analysis failed:', e);
      return null;
    }
  }, [allocation]);
  
  // =============================================================================
  // TEMPLATE MANAGEMENT
  // =============================================================================
  
  const loadTemplate = useCallback((templateId) => {
    const template = PORTFOLIO_TEMPLATES[templateId];
    if (!template || !template.allocation) {
      console.error('Template not found:', templateId);
      return false;
    }
    
    // Convert allocation to portfolio holdings
    const holdings = Object.entries(template.allocation).map(([symbol, weight]) => {
      const etf = ETF_UNIVERSE[symbol];
      return {
        symbol,
        weight,
        name: etf?.name || 'Unknown',
        factor: etf?.factor || 'Unknown',
        expense: etf?.expense || 0,
        yield: etf?.yield || 0,
        category: etf?.category || 'Unknown'
      };
    });
    
    setPortfolio(holdings);
    setPortfolioName(template.name);
    setPortfolioDescription(template.description);
    setPortfolioTags(template.tags);
    setPortfolioTemplateId(templateId);
    setPortfolioCreatedAt(new Date().toISOString());
    
    return true;
  }, []);
  
  const getAvailableTemplates = useCallback(() => {
    return Object.values(PORTFOLIO_TEMPLATES);
  }, []);
  
  const getTemplatesByTag = useCallback((tag) => {
    return Object.values(PORTFOLIO_TEMPLATES).filter(t => 
      t.tags.includes(tag)
    );
  }, []);
  
  // =============================================================================
  // PORTFOLIO MANAGEMENT
  // =============================================================================
  
  const addETF = useCallback((symbol, weight = null) => {
    // Check if already in portfolio
    if (portfolio.find(h => h.symbol === symbol)) {
      return false;
    }
    
    const etf = ETF_UNIVERSE[symbol];
    if (!etf) {
      console.error('ETF not found:', symbol);
      return false;
    }
    
    // Calculate weight
    let newWeight = weight;
    if (newWeight === null) {
      // Equal weight allocation
      newWeight = 100 / (portfolio.length + 1);
      // Adjust existing holdings
      const updatedPortfolio = portfolio.map(h => ({
        ...h,
        weight: newWeight
      }));
      setPortfolio([...updatedPortfolio, {
        symbol,
        weight: newWeight,
        name: etf.name,
        factor: etf.factor,
        expense: etf.expense,
        yield: etf.yield,
        category: etf.category
      }]);
    } else {
      // Use specified weight
      setPortfolio([...portfolio, {
        symbol,
        weight: newWeight,
        name: etf.name,
        factor: etf.factor,
        expense: etf.expense,
        yield: etf.yield,
        category: etf.category
      }]);
    }
    
    return true;
  }, [portfolio]);
  
  const removeETF = useCallback((symbol) => {
    setPortfolio(portfolio.filter(h => h.symbol !== symbol));
    return true;
  }, [portfolio]);
  
  const updateWeight = useCallback((symbol, newWeight) => {
    setPortfolio(portfolio.map(h => 
      h.symbol === symbol ? { ...h, weight: parseFloat(newWeight) } : h
    ));
    return true;
  }, [portfolio]);
  
  const normalizeWeights = useCallback(() => {
    const total = totalAllocation;
    if (total === 0) return false;
    
    setPortfolio(portfolio.map(h => ({
      ...h,
      weight: (h.weight / total) * 100
    })));
    
    return true;
  }, [portfolio, totalAllocation]);
  
  const clearPortfolio = useCallback(() => {
    setPortfolio([]);
    setPortfolioName('My Portfolio');
    setPortfolioDescription('');
    setPortfolioTags([]);
    setPortfolioTemplateId(null);
    setPortfolioCreatedAt(new Date().toISOString());
    return true;
  }, []);
  
  // =============================================================================
  // METADATA MANAGEMENT
  // =============================================================================
  
  const updateMetadata = useCallback((updates) => {
    if (updates.name !== undefined) setPortfolioName(updates.name);
    if (updates.description !== undefined) setPortfolioDescription(updates.description);
    if (updates.tags !== undefined) setPortfolioTags(updates.tags);
  }, []);
  
  const addTag = useCallback((tag) => {
    if (!portfolioTags.includes(tag)) {
      setPortfolioTags([...portfolioTags, tag]);
    }
  }, [portfolioTags]);
  
  const removeTag = useCallback((tag) => {
    setPortfolioTags(portfolioTags.filter(t => t !== tag));
  }, [portfolioTags]);
  
  // =============================================================================
  // PERSISTENCE (Save/Load)
  // =============================================================================
  
  const savePortfolio = useCallback((name = null) => {
    const portfolioData = {
      id: `portfolio_${Date.now()}`,
      name: name || portfolioName,
      description: portfolioDescription,
      tags: portfolioTags,
      createdAt: portfolioCreatedAt,
      updatedAt: new Date().toISOString(),
      templateId: portfolioTemplateId,
      holdings: portfolio
    };
    
    // Get existing saved portfolios
    const saved = JSON.parse(localStorage.getItem('alphatic_saved_portfolios') || '[]');
    saved.push(portfolioData);
    localStorage.setItem('alphatic_saved_portfolios', JSON.stringify(saved));
    
    return portfolioData;
  }, [portfolio, portfolioName, portfolioDescription, portfolioTags, portfolioCreatedAt, portfolioTemplateId]);
  
  const getSavedPortfolios = useCallback(() => {
    const saved = localStorage.getItem('alphatic_saved_portfolios');
    return saved ? JSON.parse(saved) : [];
  }, []);
  
  const loadSavedPortfolio = useCallback((portfolioId) => {
    const saved = getSavedPortfolios();
    const found = saved.find(p => p.id === portfolioId);
    
    if (!found) return false;
    
    loadPortfolioData(found);
    return true;
  }, [getSavedPortfolios]);
  
  const deleteSavedPortfolio = useCallback((portfolioId) => {
    const saved = getSavedPortfolios();
    const filtered = saved.filter(p => p.id !== portfolioId);
    localStorage.setItem('alphatic_saved_portfolios', JSON.stringify(filtered));
    return true;
  }, [getSavedPortfolios]);
  
  // =============================================================================
  // IMPORT/EXPORT
  // =============================================================================
  
  const exportPortfolio = useCallback(() => {
    const portfolioData = {
      name: portfolioName,
      description: portfolioDescription,
      tags: portfolioTags,
      createdAt: portfolioCreatedAt,
      templateId: portfolioTemplateId,
      holdings: portfolio,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    return portfolioData;
  }, [portfolio, portfolioName, portfolioDescription, portfolioTags, portfolioCreatedAt, portfolioTemplateId]);
  
  const importPortfolio = useCallback((data) => {
    if (!data || !data.holdings || !Array.isArray(data.holdings)) {
      return false;
    }
    
    try {
      loadPortfolioData(data);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }, []);
  
  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================
  
  const loadPortfolioData = (data) => {
    setPortfolio(data.holdings || []);
    setPortfolioName(data.name || 'Imported Portfolio');
    setPortfolioDescription(data.description || '');
    setPortfolioTags(data.tags || []);
    setPortfolioCreatedAt(data.createdAt || new Date().toISOString());
    setPortfolioTemplateId(data.templateId || null);
  };
  
  const portfolioToAllocation = (portfolio) => {
    const allocation = {};
    portfolio.forEach(holding => {
      allocation[holding.symbol] = holding.weight;
    });
    return allocation;
  };
  
  // =============================================================================
  // RETURN API
  // =============================================================================
  
  return {
    // Portfolio state
    portfolio,
    allocation,
    totalAllocation,
    isValid,
    
    // Metadata
    portfolioName,
    portfolioDescription,
    portfolioTags,
    portfolioCreatedAt,
    portfolioTemplateId,
    
    // Analysis
    portfolioAnalysis,
    weightedYield: calculateWeightedYield(allocation),
    weightedExpenseRatio: calculateWeightedExpenseRatio(allocation),
    
    // Portfolio management
    addETF,
    removeETF,
    updateWeight,
    normalizeWeights,
    clearPortfolio,
    
    // Metadata management
    updateMetadata,
    addTag,
    removeTag,
    
    // Template management
    loadTemplate,
    getAvailableTemplates,
    getTemplatesByTag,
    
    // Persistence
    savePortfolio,
    getSavedPortfolios,
    loadSavedPortfolio,
    deleteSavedPortfolio,
    
    // Import/Export
    exportPortfolio,
    importPortfolio,
    
    // UI state
    showTemplateSelector,
    setShowTemplateSelector,
    showETFModal,
    setShowETFModal,
    selectedETF,
    setSelectedETF
  };
};

export default usePortfolioBuilder;
