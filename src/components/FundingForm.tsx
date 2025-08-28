import React, { useState, useEffect } from 'react';
import { Users, DollarSign, FileText, Info, CheckCircle } from 'lucide-react';
import { SubmissionService } from '../lib/submissionService';
import { useUser } from '../context/useUser';

type View = 'home' | 'funding' | 'investor' | 'crm' | 'pricing' | 'outreach' | 'dashboard' | 'help-center';

interface FundingFormProps {
  onBack: () => void;
  onSubmit: (submissionId: string) => void;
  onNavigate: (view: View) => void;
  user: any;
  setLoginModalOpen: (open: boolean) => void;
}

const getInvestmentStage = (amount: number): string => {
  if (amount <= 500000) return 'pre-seed';
  if (amount <= 2000000) return 'seed';
  if (amount <= 10000000) return 'series-a';
  if (amount <= 50000000) return 'series-b';
  return 'late-stage';
};

const COMPANY_TYPES = [
  'LLC',
  'C Corporation',
  'S Corporation',
  'Partnership',
  'Sole Proprietorship',
  'Other'
];

const CATEGORIES = [
  'Technology',
  'Healthcare & Wellness',
  'Finance & Insurance',
  'Retail & E-commerce',
  'Real Estate & Construction',
  'Manufacturing',
  'Services',
  'Media & Entertainment',
  'Transportation & Logistics',
  'Education',
  'Other'
];

export function FundingForm({ onBack, onSubmit, onNavigate, setLoginModalOpen }: FundingFormProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    companyType: '',
    category: '',
    customCategory: '',
    fundingRequired: '',
    investmentStage: '',
    businessDescription: '',
    email: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [unAuthenticated, setUnAuthenticated] = useState(false);
  const {user} = useUser();


  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user?.email }));
    }
    if (unAuthenticated) {
      setLoginModalOpen(true);
      setUnAuthenticated(false);
    }

  }, [user, setLoginModalOpen, unAuthenticated]);

  const handleInputChange = (field: string, value: string) => {
    if (value.length >= 4 && !user) {
    return setUnAuthenticated(true);
    } else {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'fundingRequired') {
        const amount = parseFloat(value) || 0;
        updated.investmentStage = getInvestmentStage(amount);
      }
      
      return updated;
    });
  }
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      if (!acceptTerms) {
        setError('You must accept the Terms & Conditions and Privacy Policy to proceed');
        setIsSubmitting(false);
        return;
      }

      const finalCategory = formData.category === 'Other' ? formData.customCategory : formData.category;
      
      const result = await SubmissionService.submitStartup({
        companyName: formData.companyName,
        companyType: formData.companyType,
        category: finalCategory,
        fundingRequired: formData.fundingRequired,
        investmentStage: formData.investmentStage,
        businessDescription: formData.businessDescription,
        country: 'United States',
        state: 'California',
        city: 'San Francisco',
        email: user?.email,
        userId: user?.id
      });

      if (result.success && result.submissionId) {
        localStorage.setItem('lastSubmissionId', result.submissionId);
        onSubmit(result.submissionId);
      } else {
        setError(result.error || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Investors</h1>
              <p className="text-gray-600">Submit your startup details to find AI-matched investors</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Type *
                </label>
                <select
                  required
                  value={formData.companyType}
                  onChange={(e) => handleInputChange('companyType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select company type</option>
                  {COMPANY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select your business category</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {formData.category === 'Other' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Please specify your business category *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customCategory}
                  onChange={(e) => handleInputChange('customCategory', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your specific business category"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Funding Required *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={formData.fundingRequired}
                    onChange={(e) => handleInputChange('fundingRequired', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="500000"
                  />
                </div>
                {formData.fundingRequired && (
                  <p className="text-sm text-gray-600 mt-1">
                    {formatCurrency(formData.fundingRequired)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Investment Stage * 
                  <span className="text-xs text-blue-600 ml-2">(Auto-selected based on funding amount)</span>
                </label>
                <select
                  value={formData.investmentStage}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                  disabled
                >
                  <option value="">Enter funding amount to auto-select stage</option>
                  <option value="pre-seed">Pre-Seed ($0 - $500K)</option>
                  <option value="seed">Seed ($500K - $2M)</option>
                  <option value="series-a">Series A ($2M - $10M)</option>
                  <option value="series-b">Series B ($10M - $50M)</option>
                  <option value="late-stage">Late Stage ($50M+)</option>
                </select>
                <p className="text-xs text-blue-600 mt-1 font-medium">
                  💡 Stage updates automatically when you enter funding amount above
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Description *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  required
                  rows={4}
                  value={formData.businessDescription}
                  onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe your business, what problem you solve, your target market, and what makes you unique..."
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This description will be shared with potential investors
              </p>
            </div>

            {user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Logged in as {user.email}</p>
                    <p>Submit your startup details to get AI-matched with relevant investors from our database.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Privacy & Data Usage</p>
                  <p>
                    Your information will be shared with relevant investors who match your criteria. 
                    We respect your privacy and only share necessary business information to facilitate connections.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  required
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                  <span className="font-semibold">Required:</span> I accept the{' '}
                  <a 
                    href="/Terms and Conditions (_Terms_) Kapitalgpt.pdf" 
                    download
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Terms & Conditions
                  </a>
                  {' '}and{' '}
                  <a 
                    href="/KapitalGPT Privacy Policy (1).pdf" 
                    download
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Privacy Policy
                  </a>
                  . *
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              {user ? (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Users className="w-5 h-5" />
                  <span>{isSubmitting ? 'Finding Investors...' : 'Find My Investors'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate('pricing')}
                  className="bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                >
                  <Users className="w-5 h-5" />
                  <span>Must have an account to proceed</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}