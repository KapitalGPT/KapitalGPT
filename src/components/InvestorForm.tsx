import React, { useState } from 'react';
import { Calculator, Building, Shield } from 'lucide-react';

type View = 'home' | 'funding' | 'investor' | 'crm' | 'pricing' | 'outreach' | 'dashboard' | 'help-center';

interface InvestorFormProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
  onNavigate: (view: View) => void;
  user: any;
  setLoginModalOpen: (open: boolean) => void;
}

const INVESTOR_TYPES = [
  'Angel Investor',
  'Venture Capital',
  'Private Equity',
  'Family Office',
  'Corporate VC',
  'Investment Bank',
  'Other'
];

const INTERESTS = [
  'Technology',
  'Healthcare & Wellness',
  'Finance & Insurance',
  'Retail & E-commerce',
  'Real Estate & Construction',
  'Manufacturing',
  'Services',
  'Media & Entertainment',
  'Transportation & Logistics',
  'Education'
];

export function InvestorForm({ onBack, onSubmit, onNavigate, user, setLoginModalOpen }: InvestorFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    investmentType: 'individual',
    entityName: '',
    email: '',
    phone: '',
    shareContact: false,
    networth: '',
    investorType: '',
    interests: [] as string[]
  });

  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorData, setCalculatorData] = useState({
    assets: '',
    liabilities: '',
    result: 0
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'investmentType' && value === 'individual') {
      setFormData(prev => ({
        ...prev,
        entityName: prev.name
      }));
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const calculateNetworth = () => {
    const assets = parseFloat(calculatorData.assets) || 0;
    const liabilities = parseFloat(calculatorData.liabilities) || 0;
    const result = assets - liabilities;
    setCalculatorData(prev => ({ ...prev, result }));
    setFormData(prev => ({ ...prev, networth: result.toString() }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Investor Registration</h1>
              <p className="text-gray-600">Connect with cutting-edge startups and founders</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Investment Type *
                </label>
                <select
                  required
                  value={formData.investmentType}
                  onChange={(e) => handleInputChange('investmentType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="individual">Individual</option>
                  <option value="business">Business/Trust</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {formData.investmentType === 'individual' ? 'Individual Name' : 'Entity Name'} *
              </label>
              <input
                type="text"
                required
                value={formData.entityName}
                onChange={(e) => handleInputChange('entityName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={formData.investmentType === 'individual' ? 'Your name' : 'Entity name'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="shareContact"
                  required
                  checked={formData.shareContact}
                  onChange={(e) => handleInputChange('shareContact', e.target.checked)}
                  className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="shareContact" className="text-sm text-gray-700">
                  <span className="font-semibold">Required:</span> I consent to sharing my name, email, and phone number with founders and startups seeking investment. *
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Net Worth (Optional)
                <button
                  type="button"
                  onClick={() => setShowCalculator(!showCalculator)}
                  className="ml-2 inline-flex items-center text-purple-600 hover:text-purple-700"
                >
                  <Calculator className="w-4 h-4 mr-1" />
                  <span className="text-xs">Calculator</span>
                </button>
              </label>
              
              {showCalculator && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Net Worth Calculator</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Total Assets</label>
                      <input
                        type="number"
                        value={calculatorData.assets}
                        onChange={(e) => setCalculatorData(prev => ({ ...prev, assets: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="1000000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Total Liabilities</label>
                      <input
                        type="number"
                        value={calculatorData.liabilities}
                        onChange={(e) => setCalculatorData(prev => ({ ...prev, liabilities: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="200000"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={calculateNetworth}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                  >
                    Calculate Net Worth
                  </button>
                  {calculatorData.result > 0 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-green-800 font-semibold">
                        Calculated Net Worth: {formatCurrency(calculatorData.result)}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <input
                type="number"
                value={formData.networth}
                onChange={(e) => handleInputChange('networth', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your net worth (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Investor Type *
              </label>
              <select
                required
                value={formData.investorType}
                onChange={(e) => handleInputChange('investorType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select investor type</option>
                {INVESTOR_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Investment Interests (Select all that apply)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {INTERESTS.map(interest => (
                  <label key={interest} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.interests.includes(interest)}
                      onChange={() => handleInterestToggle(interest)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Shield className="w-5 h-5" />
                <span>Register as Investor</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}