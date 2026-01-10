/**
 * Personas Tab Component
 * Client selection and comprehensive financial planning interface
 */

import React, { useState } from 'react';
import ClientQuestionnaire from '../ClientQuestionnaire';
import { generateRecommendations } from '../recommendation-engine';

export const PersonasTab = ({ 
  selectedClient,
  setSelectedClient,
  clientRecommendations,
  setClientRecommendations 
}) => {
  const [showQuestionnaire, setShowQuestionnaire] = useState(true);

  const handleQuestionnaireComplete = (data) => {
    const recommendations = generateRecommendations(data);
    setSelectedClient(data);
    setClientRecommendations(recommendations);
    setShowQuestionnaire(false);
  };

  const handleNewClient = () => {
    setClientRecommendations(null);
    setShowQuestionnaire(true);
  };

  return (
    <div>
      {!clientRecommendations && showQuestionnaire && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Client Financial Planning</h2>
          </div>
          <ClientQuestionnaire onComplete={handleQuestionnaireComplete} />
        </div>
      )}
      
      {clientRecommendations && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">
              Financial Plan - {clientRecommendations.lifeStage.replace(/_/g, ' ').toUpperCase()}
            </h2>
            <button
              onClick={handleNewClient}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              New Client
            </button>
          </div>

          {/* Executive Summary */}
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-500/30 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-300 mb-3 flex items-center">
              <span className="text-2xl mr-2">📊</span>
              Executive Summary
            </h3>
            <p className="text-white text-lg leading-relaxed">{clientRecommendations.summary}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Allocation */}
            <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-500/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-300 mb-4">Asset Allocation</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Stocks</div>
                  <div className="text-3xl font-bold text-white">
                    {(clientRecommendations.assetAllocation.stocks * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Bonds</div>
                  <div className="text-3xl font-bold text-white">
                    {(clientRecommendations.assetAllocation.bonds * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Cash</div>
                  <div className="text-3xl font-bold text-white">
                    {(clientRecommendations.assetAllocation.cash * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-300 italic">{clientRecommendations.assetAllocation.rationale}</p>
            </div>

            {/* Alpha Generation */}
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-500/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-purple-300 mb-4">Alpha Generation</h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-purple-300">
                  +{clientRecommendations.alphaGeneration.totalAlpha.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-400 mt-1">{clientRecommendations.alphaGeneration.vsIndex}</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Factor Tilts:</span>
                  <span className="text-white">+{clientRecommendations.alphaGeneration.factorTilts.amount}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tax Efficiency:</span>
                  <span className="text-white">+{clientRecommendations.alphaGeneration.taxEfficiency.amount}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Strategies */}
          <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 border border-yellow-500/30 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4">Tax Optimization Strategies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientRecommendations.taxStrategies.map((strategy, i) => (
                <div key={i} className="flex items-start bg-slate-800/50 rounded-lg p-3">
                  <span className="text-green-400 mr-3 mt-0.5 text-lg">✓</span>
                  <span className="text-white text-sm">{strategy}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Plan */}
          <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 border border-red-500/30 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-red-300 mb-4">Immediate Action Plan</h3>
            <div className="space-y-3">
              {clientRecommendations.actionPlan.immediate.map((action, i) => (
                <div key={i} className="flex items-start bg-slate-800/50 rounded-lg p-4">
                  <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-white">{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 30-Year Projection */}
          <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/40 border border-cyan-500/30 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-cyan-300 mb-4">30-Year Wealth Projection</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-xs text-slate-400 mb-1">Final Portfolio</div>
                <div className="text-3xl font-bold text-cyan-300">
                  ${(clientRecommendations.projections.finalValue / 1000000).toFixed(1)}M
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-xs text-slate-400 mb-1">Total Growth</div>
                <div className="text-3xl font-bold text-green-400">
                  {clientRecommendations.projections.totalGrowth}%
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-xs text-slate-400 mb-1">Expected Return</div>
                <div className="text-3xl font-bold text-white">
                  {clientRecommendations.projections.assumptions.return}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!clientRecommendations && !showQuestionnaire && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-2xl font-bold text-white mb-4">Client Financial Planning</h3>
          <p className="text-slate-400 mb-6">Create comprehensive financial plans for clients across all life stages</p>
          <button
            onClick={() => setShowQuestionnaire(true)}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:shadow-lg transition-all"
          >
            Start New Client Assessment
          </button>
        </div>
      )}
    </div>
  );
};

export default PersonasTab;
