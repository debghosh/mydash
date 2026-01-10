/**
 * Shared Client Data Hook
 * Manages state for selected client, recommendations, and portfolio data
 * Used by all tabs to access consistent client information
 */

import { useState, useEffect } from 'react';
import { generateRecommendations } from '../recommendation-engine';

export const useClientData = () => {
  // Client selection and recommendations
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientRecommendations, setClientRecommendations] = useState(null);
  const [customPortfolio, setCustomPortfolio] = useState(null);
  
  // Portfolio parameters
  const [taxableAmount, setTaxableAmount] = useState(8500000);
  const [iraAmount, setIraAmount] = useState(4100000);
  
  // Strategy parameters
  const [marketRegime, setMarketRegime] = useState('uncertainty');
  const [riskTolerance, setRiskTolerance] = useState('moderate');
  const [conversionAmount, setConversionAmount] = useState(250000);
  const [rebalanceFrequency, setRebalanceFrequency] = useState('quarterly');
  const [continueAfterRMD, setContinueAfterRMD] = useState(false);
  const [capitalGainsRate, setCapitalGainsRate] = useState(15);
  const [frontLoadConversions, setFrontLoadConversions] = useState(false);
  const [expectedGrowthRate, setExpectedGrowthRate] = useState(9);
  
  // When client is selected, generate recommendations
  useEffect(() => {
    if (selectedClient) {
      const recommendations = generateRecommendations(selectedClient);
      setClientRecommendations(recommendations);
      
      // Update portfolio amounts based on client
      const totalAssets = selectedClient.totalAssets || 0;
      const iraAssets = (selectedClient.traditionalIRA || 0) + (selectedClient.traditional401k || 0);
      const taxableAssets = selectedClient.taxableBrokerage || 0;
      
      if (totalAssets > 0) {
        setIraAmount(iraAssets);
        setTaxableAmount(taxableAssets);
      }
    }
  }, [selectedClient]);
  
  // Calculate derived values
  const totalPortfolio = taxableAmount + iraAmount;
  
  return {
    // Client data
    selectedClient,
    setSelectedClient,
    clientRecommendations,
    setClientRecommendations,
    customPortfolio,
    setCustomPortfolio,
    
    // Portfolio amounts
    taxableAmount,
    setTaxableAmount,
    iraAmount,
    setIraAmount,
    totalPortfolio,
    
    // Strategy parameters
    marketRegime,
    setMarketRegime,
    riskTolerance,
    setRiskTolerance,
    conversionAmount,
    setConversionAmount,
    rebalanceFrequency,
    setRebalanceFrequency,
    continueAfterRMD,
    setContinueAfterRMD,
    capitalGainsRate,
    setCapitalGainsRate,
    frontLoadConversions,
    setFrontLoadConversions,
    expectedGrowthRate,
    setExpectedGrowthRate
  };
};
