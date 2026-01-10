import React, { useState } from 'react';
import { CLIENT_PERSONAS, detectPersona } from './client-personas.js';

/**
 * Comprehensive Client Questionnaire
 * 
 * Professional-grade intake form for wealth management
 * Suitable for C-suite demos at major financial institutions
 * 
 * Features:
 * - 20+ detailed questions with smart defaults
 * - Auto-detection of life stage
 * - Quick-load persona buttons
 * - Free-form notes section
 * - Progress indicator
 * - Validation
 */

const ClientQuestionnaire = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    age: 35,
    maritalStatus: 'single',
    dependents: 0,
    location: 'Austin, TX',
    
    // Income
    currentIncome: 75000,
    spouseIncome: 0,
    otherIncome: 0,
    expectedIncomeGrowth: 4,
    
    // Employment
    employerType: 'corporate',
    employer401kMatch: 5,
    employer401kMatchLimit: 5,
    employerHSA: 0,
    hasStockOptions: false,
    
    // Assets
    checking: 10000,
    savings: 25000,
    traditional401k: 50000,
    roth401k: 0,
    traditionalIRA: 0,
    rothIRA: 0,
    taxableBrokerage: 0,
    hsa: 0,
    realEstate: 0,
    otherAssets: 0,
    
    // Liabilities
    mortgage: 0,
    studentLoans: 0,
    autoLoans: 0,
    creditCard: 0,
    otherDebt: 0,
    
    // Goals & Timeline
    primaryGoal: 'retirement',
    retirementAge: 65,
    timeHorizon: 30,
    targetRetirementIncome: 100000,
    
    // Risk Profile
    riskTolerance: 'moderate',
    investmentKnowledge: 'intermediate',
    maxAcceptableDrawdown: 20,
    
    // Tax Situation
    taxFilingStatus: 'single',
    currentTaxBracket: 22,
    stateTaxRate: 5,
    
    // Special Circumstances
    hasRentalProperty: false,
    expectingInheritance: false,
    charitableGoals: false,
    needsCollegeFunding: false,
    
    // Free-form notes
    specialNotes: ''
  });
  
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Quick load persona
  const loadPersona = (personaId) => {
    const persona = CLIENT_PERSONAS[personaId];
    if (!persona) return;
    
    setFormData({
      name: persona.profileName,
      age: persona.age,
      maritalStatus: persona.maritalStatus,
      dependents: persona.dependents,
      location: persona.location,
      
      currentIncome: persona.currentIncome,
      spouseIncome: 0,
      otherIncome: persona.otherIncome,
      expectedIncomeGrowth: (persona.expectedIncomeGrowth * 100),
      
      employerType: 'corporate',
      employer401kMatch: (persona.employer401kMatch * 100),
      employer401kMatchLimit: (persona.employer401kMatchLimit * 100),
      employerHSA: persona.employerHSA,
      hasStockOptions: false,
      
      checking: persona.assets.checking,
      savings: persona.assets.savings,
      traditional401k: persona.assets.traditional401k,
      roth401k: persona.assets.roth401k,
      traditionalIRA: persona.assets.traditionalIRA,
      rothIRA: persona.assets.rothIRA,
      taxableBrokerage: persona.assets.taxableBrokerage,
      hsa: persona.assets.hsa,
      realEstate: persona.assets.realEstate,
      otherAssets: 0,
      
      mortgage: persona.liabilities.mortgage,
      studentLoans: persona.liabilities.studentLoans,
      autoLoans: persona.liabilities.auto,
      creditCard: persona.liabilities.creditCard,
      otherDebt: persona.liabilities.other,
      
      primaryGoal: 'retirement',
      retirementAge: persona.retirementAge,
      timeHorizon: persona.timeHorizon,
      targetRetirementIncome: 100000,
      
      riskTolerance: persona.riskTolerance,
      investmentKnowledge: persona.investmentKnowledge,
      maxAcceptableDrawdown: persona.riskTolerance === 'aggressive' ? 30 : 
                              persona.riskTolerance === 'moderately-aggressive' ? 25 :
                              persona.riskTolerance === 'moderate' ? 20 : 15,
      
      taxFilingStatus: persona.taxFilingStatus,
      currentTaxBracket: (persona.estimatedTaxBracket * 100),
      stateTaxRate: (persona.stateTaxRate * 100),
      
      hasRentalProperty: persona.assets.realEstate > 100000,
      expectingInheritance: false,
      charitableGoals: false,
      needsCollegeFunding: persona.dependents > 0,
      
      specialNotes: persona.specialNotes.trim()
    });
    
    setCurrentStep(1);
  };
  
  // Calculate totals
  const totalAssets = formData.checking + formData.savings + formData.traditional401k + 
                      formData.roth401k + formData.traditionalIRA + formData.rothIRA +
                      formData.taxableBrokerage + formData.hsa + formData.realEstate + formData.otherAssets;
  
  const totalLiabilities = formData.mortgage + formData.studentLoans + formData.autoLoans +
                           formData.creditCard + formData.otherDebt;
  
  const netWorth = totalAssets - totalLiabilities;
  
  // Auto-detect life stage
  const detectedStage = detectPersona(formData.age, totalAssets);
  
  // Form submission
  const handleSubmit = () => {
    // Package all data for analysis
    const clientData = {
      ...formData,
      totalAssets,
      totalLiabilities,
      netWorth,
      detectedLifeStage: detectedStage,
      submittedAt: new Date().toISOString()
    };
    
    onComplete(clientData);
  };
  
  // Render different steps
  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderFinancialSituation();
      case 3:
        return renderGoalsAndRisk();
      case 4:
        return renderTaxAndSpecial();
      case 5:
        return renderReview();
      default:
        return null;
    }
  };
  
  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-blue-400">Personal Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            placeholder="John Smith"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Age</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => updateField('age', parseInt(e.target.value))}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            min="18"
            max="100"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Marital Status</label>
          <select
            value={formData.maritalStatus}
            onChange={(e) => updateField('maritalStatus', e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
          >
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Number of Dependents</label>
          <input
            type="number"
            value={formData.dependents}
            onChange={(e) => updateField('dependents', parseInt(e.target.value))}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            min="0"
            max="10"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Location (City, State)</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => updateField('location', e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            placeholder="Austin, TX"
          />
        </div>
      </div>
      
      <div className="bg-blue-900/20 border border-blue-600/30 rounded p-4">
        <h4 className="font-semibold text-blue-400 mb-2">Income Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Annual Income</label>
            <input
              type="number"
              value={formData.currentIncome}
              onChange={(e) => updateField('currentIncome', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="1000"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Spouse Income (if applicable)</label>
            <input
              type="number"
              value={formData.spouseIncome}
              onChange={(e) => updateField('spouseIncome', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="1000"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Other Income (rental, side hustle, etc.)</label>
            <input
              type="number"
              value={formData.otherIncome}
              onChange={(e) => updateField('otherIncome', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="1000"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Expected Income Growth (%/year)</label>
            <input
              type="number"
              value={formData.expectedIncomeGrowth}
              onChange={(e) => updateField('expectedIncomeGrowth', parseFloat(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="0.5"
              min="0"
              max="20"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-purple-900/20 border border-purple-600/30 rounded p-4">
        <h4 className="font-semibold text-purple-400 mb-2">Employer Benefits</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">401(k) Match (%)</label>
            <input
              type="number"
              value={formData.employer401kMatch}
              onChange={(e) => updateField('employer401kMatch', parseFloat(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="0.5"
              min="0"
              max="10"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Match Limit (% of salary)</label>
            <input
              type="number"
              value={formData.employer401kMatchLimit}
              onChange={(e) => updateField('employer401kMatchLimit', parseFloat(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="0.5"
              min="0"
              max="10"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Employer HSA Contribution ($)</label>
            <input
              type="number"
              value={formData.employerHSA}
              onChange={(e) => updateField('employerHSA', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="100"
            />
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderFinancialSituation = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-green-400">Financial Situation</h3>
      
      <div className="bg-green-900/20 border border-green-600/30 rounded p-4">
        <h4 className="font-semibold text-green-400 mb-3">Assets</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Checking Account</label>
            <input
              type="number"
              value={formData.checking}
              onChange={(e) => updateField('checking', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="1000"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Savings / Emergency Fund</label>
            <input
              type="number"
              value={formData.savings}
              onChange={(e) => updateField('savings', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="1000"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Traditional 401(k)</label>
            <input
              type="number"
              value={formData.traditional401k}
              onChange={(e) => updateField('traditional401k', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="1000"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Roth 401(k)</label>
            <input
              type="number"
              value={formData.roth401k}
              onChange={(e) => updateField('roth401k', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="1000"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Traditional IRA</label>
            <input
              type="number"
              value={formData.traditionalIRA}
              onChange={(e) => updateField('traditionalIRA', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="1000"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Roth IRA</label>
            <input
              type="number"
              value={formData.rothIRA}
              onChange={(e) => updateField('rothIRA', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="1000"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Taxable Brokerage</label>
            <input
              type="number"
              value={formData.taxableBrokerage}
              onChange={(e) => updateField('taxableBrokerage', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="1000"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">HSA (Health Savings Account)</label>
            <input
              type="number"
              value={formData.hsa}
              onChange={(e) => updateField('hsa', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="1000"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Real Estate Equity</label>
            <input
              type="number"
              value={formData.realEstate}
              onChange={(e) => updateField('realEstate', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="10000"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Other Assets</label>
            <input
              type="number"
              value={formData.otherAssets}
              onChange={(e) => updateField('otherAssets', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="1000"
            />
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-green-500/10 rounded">
          <div className="text-lg font-semibold text-green-400">
            Total Assets: ${totalAssets.toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className="bg-red-900/20 border border-red-600/30 rounded p-4">
        <h4 className="font-semibold text-red-400 mb-3">Liabilities</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Mortgage Balance</label>
            <input
              type="number"
              value={formData.mortgage}
              onChange={(e) => updateField('mortgage', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="10000"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Student Loans</label>
            <input
              type="number"
              value={formData.studentLoans}
              onChange={(e) => updateField('studentLoans', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="1000"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Auto Loans</label>
            <input
              type="number"
              value={formData.autoLoans}
              onChange={(e) => updateField('autoLoans', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="1000"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Credit Card Debt</label>
            <input
              type="number"
              value={formData.creditCard}
              onChange={(e) => updateField('creditCard', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="1000"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Other Debt</label>
            <input
              type="number"
              value={formData.otherDebt}
              onChange={(e) => updateField('otherDebt', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="1000"
            />
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-red-500/10 rounded">
          <div className="text-lg font-semibold text-red-400">
            Total Liabilities: ${totalLiabilities.toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className="bg-blue-900/30 border-2 border-blue-500/50 rounded p-4">
        <div className="text-xl font-bold text-blue-400">
          Net Worth: ${netWorth.toLocaleString()}
        </div>
        <div className="text-sm text-slate-400 mt-1">
          Assets - Liabilities
        </div>
      </div>
    </div>
  );
  
  const renderGoalsAndRisk = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-purple-400">Goals & Risk Profile</h3>
      
      <div className="bg-purple-900/20 border border-purple-600/30 rounded p-4">
        <h4 className="font-semibold text-purple-400 mb-3">Investment Goals</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Primary Goal</label>
            <select
              value={formData.primaryGoal}
              onChange={(e) => updateField('primaryGoal', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            >
              <option value="retirement">Retirement</option>
              <option value="wealth-building">Wealth Building</option>
              <option value="college-funding">College Funding</option>
              <option value="home-purchase">Home Purchase</option>
              <option value="early-retirement">Early Retirement</option>
              <option value="legacy">Legacy / Estate Planning</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Target Retirement Age</label>
            <input
              type="number"
              value={formData.retirementAge}
              onChange={(e) => updateField('retirementAge', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              min="50"
              max="75"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Time Horizon (years)</label>
            <input
              type="number"
              value={formData.timeHorizon}
              onChange={(e) => updateField('timeHorizon', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              min="1"
              max="50"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Target Retirement Income ($/year)</label>
            <input
              type="number"
              value={formData.targetRetirementIncome}
              onChange={(e) => updateField('targetRetirementIncome', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="10000"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-orange-900/20 border border-orange-600/30 rounded p-4">
        <h4 className="font-semibold text-orange-400 mb-3">Risk Tolerance</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Risk Tolerance</label>
            <select
              value={formData.riskTolerance}
              onChange={(e) => updateField('riskTolerance', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            >
              <option value="conservative">Conservative (Stability > Growth)</option>
              <option value="moderate">Moderate (Balanced)</option>
              <option value="moderately-aggressive">Moderately Aggressive (Growth focus)</option>
              <option value="aggressive">Aggressive (Maximum growth)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Investment Knowledge</label>
            <select
              value={formData.investmentKnowledge}
              onChange={(e) => updateField('investmentKnowledge', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-2">
              Maximum Acceptable Portfolio Drawdown (%)
            </label>
            <input
              type="number"
              value={formData.maxAcceptableDrawdown}
              onChange={(e) => updateField('maxAcceptableDrawdown', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              min="5"
              max="50"
              step="5"
            />
            <div className="text-xs text-slate-400 mt-1">
              How much can your portfolio decline before you feel uncomfortable?
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderTaxAndSpecial = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-yellow-400">Tax & Special Circumstances</h3>
      
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded p-4">
        <h4 className="font-semibold text-yellow-400 mb-3">Tax Situation</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Tax Filing Status</label>
            <select
              value={formData.taxFilingStatus}
              onChange={(e) => updateField('taxFilingStatus', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            >
              <option value="single">Single</option>
              <option value="married">Married Filing Jointly</option>
              <option value="head-of-household">Head of Household</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Current Tax Bracket (%)</label>
            <select
              value={formData.currentTaxBracket}
              onChange={(e) => updateField('currentTaxBracket', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            >
              <option value="10">10%</option>
              <option value="12">12%</option>
              <option value="22">22%</option>
              <option value="24">24%</option>
              <option value="32">32%</option>
              <option value="35">35%</option>
              <option value="37">37%</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">State Tax Rate (%)</label>
            <input
              type="number"
              value={formData.stateTaxRate}
              onChange={(e) => updateField('stateTaxRate', parseFloat(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              step="0.1"
              min="0"
              max="13.3"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-slate-700/50 rounded p-4">
        <h4 className="font-semibold text-slate-300 mb-3">Special Circumstances</h4>
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.hasRentalProperty}
              onChange={(e) => updateField('hasRentalProperty', e.target.checked)}
              className="w-5 h-5"
            />
            <span className="text-slate-300">Own rental property / real estate investments</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.expectingInheritance}
              onChange={(e) => updateField('expectingInheritance', e.target.checked)}
              className="w-5 h-5"
            />
            <span className="text-slate-300">Expecting inheritance in next 10 years</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.charitableGoals}
              onChange={(e) => updateField('charitableGoals', e.target.checked)}
              className="w-5 h-5"
            />
            <span className="text-slate-300">Significant charitable giving goals</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.needsCollegeFunding}
              onChange={(e) => updateField('needsCollegeFunding', e.target.checked)}
              className="w-5 h-5"
            />
            <span className="text-slate-300">Need to fund college education</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.hasStockOptions}
              onChange={(e) => updateField('hasStockOptions', e.target.checked)}
              className="w-5 h-5"
            />
            <span className="text-slate-300">Receive stock options / RSUs from employer</span>
          </label>
        </div>
      </div>
      
      <div className="bg-blue-900/20 border border-blue-600/30 rounded p-4">
        <h4 className="font-semibold text-blue-400 mb-2">Additional Notes</h4>
        <div className="text-sm text-slate-400 mb-2">
          Please share any additional information that would help us create a comprehensive plan:
        </div>
        <textarea
          value={formData.specialNotes}
          onChange={(e) => updateField('specialNotes', e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white h-32"
          placeholder="Examples:
- Planning to start a business in 3 years
- Expecting to care for aging parents
- Want to retire to lower cost-of-living area
- Have significant unvested equity compensation
- Planning major purchase (home, vacation property)
- Health considerations affecting timeline
- Any other unique circumstances..."
        />
        <div className="text-xs text-slate-500 mt-1">
          {formData.specialNotes.length} characters
        </div>
      </div>
    </div>
  );
  
  const renderReview = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-green-400">Review & Submit</h3>
      
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-500/30">
        <h4 className="text-lg font-semibold mb-4">Client Profile Summary</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-slate-400">Name</div>
            <div className="font-semibold">{formData.name || 'Not provided'}</div>
          </div>
          
          <div>
            <div className="text-sm text-slate-400">Age / Life Stage</div>
            <div className="font-semibold">{formData.age} years old</div>
            <div className="text-xs text-blue-400">{LIFE_STAGE_INFO[detectedStage]?.title}</div>
          </div>
          
          <div>
            <div className="text-sm text-slate-400">Total Income</div>
            <div className="font-semibold text-green-400">
              ${(formData.currentIncome + formData.spouseIncome + formData.otherIncome).toLocaleString()}/year
            </div>
          </div>
          
          <div>
            <div className="text-sm text-slate-400">Net Worth</div>
            <div className="font-semibold text-blue-400">
              ${netWorth.toLocaleString()}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-slate-400">Primary Goal</div>
            <div className="font-semibold capitalize">{formData.primaryGoal.replace('-', ' ')}</div>
          </div>
          
          <div>
            <div className="text-sm text-slate-400">Risk Tolerance</div>
            <div className="font-semibold capitalize">{formData.riskTolerance.replace('-', ' ')}</div>
          </div>
          
          <div>
            <div className="text-sm text-slate-400">Retirement Target</div>
            <div className="font-semibold">Age {formData.retirementAge}</div>
            <div className="text-xs text-slate-400">{formData.retirementAge - formData.age} years away</div>
          </div>
          
          <div>
            <div className="text-sm text-slate-400">Tax Bracket</div>
            <div className="font-semibold">{formData.currentTaxBracket}% Federal + {formData.stateTaxRate}% State</div>
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded p-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <div className="font-semibold text-yellow-400 mb-1">Important Disclaimer</div>
            <div className="text-sm text-slate-300">
              This analysis is for informational purposes only and does not constitute financial advice.
              Please consult with a qualified financial advisor before making investment decisions.
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all"
      >
        Generate Comprehensive Analysis →
      </button>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Alphatic Wealth Management
          </h1>
          <p className="text-slate-400">
            Comprehensive Financial Planning for Every Life Stage
          </p>
        </div>
        
        {/* Quick Load Personas */}
        <div className="mb-8 bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4">Quick Load Sample Persona:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(CLIENT_PERSONAS).map(([id, persona]) => (
              <button
                key={id}
                onClick={() => loadPersona(id)}
                className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 hover:from-blue-600/40 hover:to-purple-600/40 border border-blue-500/30 rounded-lg p-4 text-left transition-all"
              >
                <div className="font-semibold text-sm mb-1">{persona.displayName}</div>
                <div className="text-xs text-slate-400">{persona.profileName}</div>
                <div className="text-xs text-blue-400 mt-1">Age {persona.age}</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`flex-1 mx-1 h-2 rounded ${
                  step <= currentStep ? 'bg-blue-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <div className="text-center text-sm text-slate-400">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
        
        {/* Main Form */}
        <div className="bg-slate-800/50 rounded-lg p-8 border border-slate-700">
          {renderStep()}
          
          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-all"
            >
              ← Previous
            </button>
            
            {currentStep < totalSteps && (
              <button
                onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-all"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientQuestionnaire;

// Import LIFE_STAGE_INFO for review section
import { LIFE_STAGE_INFO } from './client-personas.js';
