import React, { useState, useEffect } from 'react';
import { Mail, Phone, Users, TrendingUp, Building, Eye, CheckCircle, Clock, UserCheck, Star, Globe, MapPin, BarChart3, Upload, FileText, Plus, Download, X, Calendar } from 'lucide-react';

type View = 'home' | 'funding' | 'loan' | 'investor' | 'crm' | 'results' | 'pricing' | 'outreach' | 'dashboard' | 'discord' | 'help-center';

interface OutreachCampaignPageProps {
  onBack: () => void;
  onNavigate: (view: View) => void;
  user: any;
  clientData: any;
  setLoginModalOpen: (open: boolean) => void;
  favoriteInvestors?: any[];
}

// Status options for the tracker
const STATUS_OPTIONS = [
  { value: 'not_contacted', label: 'Not Contacted', color: 'bg-gray-100 text-gray-800' },
  { value: 'emailed', label: 'Emailed', color: 'bg-blue-100 text-blue-800' },
  { value: 'meeting_scheduled', label: 'Meeting Scheduled', color: 'bg-purple-100 text-purple-800' },
  { value: 'follow_up_needed', label: 'Follow-up Needed', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'passed', label: 'Passed', color: 'bg-red-100 text-red-800' },
  { value: 'invested', label: 'Invested', color: 'bg-green-100 text-green-800' }
];

// Mock investor data with status tracking
const mockInvestors = [
  {
    id: 1,
    name: 'Sequoia Capital',
    type: 'vc',
    email: 'contact@sequoiacap.com',
    website: 'https://sequoiacap.com',
    description: 'Leading venture capital firm investing in technology companies from seed to growth stage.',
    investmentRange: '$1M - $50M',
    focus: ['Technology', 'Healthcare'],
    location: 'Menlo Park, CA',
    matchScore: 95,
    lastContact: '2024-01-15',
    status: 'not_contacted',
    source: 'ai_matched'
  },
  {
    id: 2,
    name: 'Andreessen Horowitz',
    type: 'vc',
    email: 'info@a16z.com',
    website: 'https://a16z.com',
    description: 'Venture capital firm focused on investing in bold entrepreneurs building the future.',
    investmentRange: '$500K - $100M',
    focus: ['Technology', 'Crypto'],
    location: 'Menlo Park, CA',
    matchScore: 92,
    lastContact: '2024-01-14',
    status: 'emailed',
    source: 'ai_matched'
  },
  {
    id: 3,
    name: 'Kleiner Perkins',
    type: 'vc',
    email: 'contact@kpcb.com',
    website: 'https://kleinerperkins.com',
    description: 'Venture capital firm partnering with entrepreneurs to build disruptive companies.',
    investmentRange: '$2M - $25M',
    focus: ['Technology', 'Healthcare'],
    location: 'Menlo Park, CA',
    matchScore: 88,
    lastContact: '2024-01-13',
    status: 'meeting_scheduled',
    source: 'ai_matched'
  },
  {
    id: 4,
    name: 'First Round Capital',
    type: 'vc',
    email: 'team@firstround.com',
    website: 'https://firstround.com',
    description: 'Early-stage venture capital firm focused on pre-seed and seed investments.',
    investmentRange: '$100K - $5M',
    focus: ['Technology', 'Consumer'],
    location: 'Philadelphia, PA',
    matchScore: 85,
    lastContact: '2024-01-12',
    status: 'follow_up_needed',
    source: 'ai_matched'
  }
];

export function OutreachCampaignPage({ onBack, onNavigate, user, clientData, setLoginModalOpen, favoriteInvestors }: OutreachCampaignPageProps) {
  const [investors, setInvestors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submissionData, setSubmissionData] = useState<any>(null);
  
  // Phone number state
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isGettingPhoneNumber, setIsGettingPhoneNumber] = useState(false);
  
  // Chart state
  const [chartType, setChartType] = useState<'calls' | 'texts'>('calls');
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Manual investor import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [manualInvestors, setManualInvestors] = useState<any[]>([]);
  const [importType, setImportType] = useState<'single' | 'csv'>('single');
  const [csvData, setCsvData] = useState('');
  const [singleInvestorForm, setSingleInvestorForm] = useState({
    name: '',
    email: '',
    website: '',
    description: '',
    investmentRange: '',
    focus: '',
    location: ''
  });
  
  // Usage tracking state
  const [callsMadeCount, setCallsMadeCount] = useState(0);
  const [textsSentCount, setTextsSentCount] = useState(0);
  const [callsAnsweredCount, setCallsAnsweredCount] = useState(0);
  const [textsRepliedCount, setTextsRepliedCount] = useState(0);

  // Load persisted data from localStorage
  useEffect(() => {
    const savedPhoneNumber = localStorage.getItem('crm_phone_number');
    const savedCallsCount = localStorage.getItem('crm_calls_made');
    const savedTextsCount = localStorage.getItem('crm_texts_sent');
    const savedCallsAnswered = localStorage.getItem('crm_calls_answered');
    const savedTextsReplied = localStorage.getItem('crm_texts_replied');
    const savedManualInvestors = localStorage.getItem('crm_manual_investors');
    
    if (savedPhoneNumber) setPhoneNumber(savedPhoneNumber);
    if (savedCallsCount) setCallsMadeCount(parseInt(savedCallsCount, 10));
    if (savedTextsCount) setTextsSentCount(parseInt(savedTextsCount, 10));
    if (savedCallsAnswered) setCallsAnsweredCount(parseInt(savedCallsAnswered, 10));
    if (savedTextsReplied) setTextsRepliedCount(parseInt(savedTextsReplied, 10));
    if (savedManualInvestors) {
      try {
        setManualInvestors(JSON.parse(savedManualInvestors));
      } catch (e) {
        console.error('Error parsing saved manual investors:', e);
      }
    }
  }, []);

  // Generate mock chart data
  useEffect(() => {
    const generateChartData = () => {
      const data = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        if (chartType === 'calls') {
          data.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            made: Math.floor(Math.random() * 20) + 5,
            answered: Math.floor(Math.random() * 15) + 2
          });
        } else {
          data.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            sent: Math.floor(Math.random() * 50) + 10,
            replied: Math.floor(Math.random() * 25) + 3
          });
        }
      }
      
      setChartData(data);
    };
    
    generateChartData();
  }, [chartType]);

  // Fetch user's investor matches
useEffect(() => {
  const fetchUserMatches = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Check if we have favorite investors from dashboard (localStorage approach)
      const savedFavoriteInvestors = localStorage.getItem('favoriteInvestors');
      
      if (savedFavoriteInvestors) {
        const favoriteInvestors = JSON.parse(savedFavoriteInvestors);
        
        // Convert favorite investors to the format expected by the outreach page
        const formattedFavorites = favoriteInvestors.map((investor: any) => ({
          id: investor.id,
          name: investor.name,
          type: investor.type,
          email: investor.email,
          website: investor.website,
          description: investor.description,
          investmentRange: `${formatCurrency(investor.investmentRangeMin)} - ${formatCurrency(investor.investmentRangeMax)}`,
          focus: investor.preferredIndustries,
          location: investor.geographicFocus?.[0] || 'Global',
          matchScore: investor.matchScore,
          lastContact: new Date().toISOString().split('T')[0],
          status: 'not_contacted',
          source: 'favorite',
          isFavorite: true
        }));
        
        setInvestors(formattedFavorites);
        setIsLoading(false);
        
        // Clear the stored favorites after use
        localStorage.removeItem('favoriteInvestors');
        return;
      }

      // Check if favorite investors were passed via props (alternative approach)
      if (favoriteInvestors && favoriteInvestors.length > 0) {
        const formattedFavorites = favoriteInvestors.map((investor: any) => ({
          id: investor.id,
          name: investor.name,
          type: investor.type,
          email: investor.email,
          website: investor.website,
          description: investor.description,
          investmentRange: `${formatCurrency(investor.investmentRangeMin)} - ${formatCurrency(investor.investmentRangeMax)}`,
          focus: investor.preferredIndustries,
          location: investor.geographicFocus?.[0] || 'Global',
          matchScore: investor.matchScore,
          lastContact: new Date().toISOString().split('T')[0],
          status: 'not_contacted',
          source: 'favorite',
          isFavorite: true
        }));
        
        setInvestors(formattedFavorites);
        setIsLoading(false);
        return;
      }

      // Original logic for loading from submission or mock data
      const lastSubmissionId = localStorage.getItem('lastSubmissionId');
      
      if (lastSubmissionId) {
        const { SubmissionService } = await import('../lib/submissionService');
        const data = await SubmissionService.getSubmissionWithMatches(lastSubmissionId);
        
        if (data) {
          setSubmissionData(data);
          const investorData = data.matches.map((match: any, index: number) => ({
            id: match.investor?.id || index,
            name: match.investor?.name || 'Unknown Investor',
            type: match.investor?.type || 'vc',
            email: match.investor?.email || '',
            website: match.investor?.website || '',
            description: match.investor?.description || '',
            investmentRange: `${formatCurrency(match.investor?.investment_range_min || 0)} - ${formatCurrency(match.investor?.investment_range_max || 0)}`,
            focus: match.investor?.preferred_industries || [],
            location: match.investor?.geographic_focus?.[0] || 'Global',
            matchScore: match.match_score || 0,
            lastContact: new Date().toISOString().split('T')[0],
            status: 'not_contacted',
            source: 'ai_matched',
            isFavorite: false
          }));
          setInvestors([...investorData, ...manualInvestors]);
        }
      } else {
        // Use mock investors if no submission data
        setInvestors([...mockInvestors, ...manualInvestors]);
      }
    } catch (error) {
      console.error('Error fetching user matches:', error);
      // Fallback to mock data on error
      setInvestors([...mockInvestors, ...manualInvestors]);
    } finally {
      setIsLoading(false);
    }
  };

  fetchUserMatches();
}, [user, manualInvestors, favoriteInvestors]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const handleGetPhoneNumber = async () => {
    setIsGettingPhoneNumber(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock phone number
      const newPhoneNumber = `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
      setPhoneNumber(newPhoneNumber);
      
      // Increment calls made count
      const newCallsCount = callsMadeCount + 1;
      setCallsMadeCount(newCallsCount);
      
      // Save to localStorage
      localStorage.setItem('crm_phone_number', newPhoneNumber);
      localStorage.setItem('crm_calls_made', newCallsCount.toString());
      
    } catch (error) {
      console.error('Error getting phone number:', error);
    } finally {
      setIsGettingPhoneNumber(false);
    }
  };

  const updateInvestorStatus = (investorId: number, newStatus: string) => {
    setInvestors(prev => prev.map(investor => 
      investor.id === investorId 
        ? { ...investor, status: newStatus }
        : investor
    ));
  };

  const getStatusConfig = (status: string) => {
    return STATUS_OPTIONS.find(option => option.value === status) || STATUS_OPTIONS[0];
  };

  const getStatusCounts = () => {
    const counts = STATUS_OPTIONS.reduce((acc, option) => {
      acc[option.value] = investors.filter(inv => inv.status === option.value).length;
      return acc;
    }, {} as Record<string, number>);
    return counts;
  };

  const handleSingleInvestorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newInvestor = {
      id: Date.now(),
      name: singleInvestorForm.name,
      type: 'manual',
      email: singleInvestorForm.email,
      website: singleInvestorForm.website,
      description: singleInvestorForm.description,
      investmentRange: singleInvestorForm.investmentRange,
      focus: singleInvestorForm.focus.split(',').map(f => f.trim()).filter(f => f),
      location: singleInvestorForm.location,
      matchScore: 0,
      lastContact: new Date().toISOString().split('T')[0],
      status: 'not_contacted',
      source: 'manual'
    };
    
    const updatedManualInvestors = [...manualInvestors, newInvestor];
    setManualInvestors(updatedManualInvestors);
    localStorage.setItem('crm_manual_investors', JSON.stringify(updatedManualInvestors));
    
    // Reset form
    setSingleInvestorForm({
      name: '',
      email: '',
      website: '',
      description: '',
      investmentRange: '',
      focus: '',
      location: ''
    });
    
    setShowImportModal(false);
  };

  const handleCsvImport = () => {
    try {
      const lines = csvData.trim().split('\n');
      const newInvestors = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const [name, email, website, description, investmentRange, focus, location] = line.split(',').map(field => field.trim());
        
        if (name && email) {
          newInvestors.push({
            id: Date.now() + i,
            name,
            type: 'manual',
            email,
            website: website || '',
            description: description || '',
            investmentRange: investmentRange || '',
            focus: focus ? focus.split(';').map(f => f.trim()).filter(f => f) : [],
            location: location || '',
            matchScore: 0,
            lastContact: new Date().toISOString().split('T')[0],
            status: 'not_contacted',
            source: 'manual'
          });
        }
      }
      
      if (newInvestors.length > 0) {
        const updatedManualInvestors = [...manualInvestors, ...newInvestors];
        setManualInvestors(updatedManualInvestors);
        localStorage.setItem('crm_manual_investors', JSON.stringify(updatedManualInvestors));
        setCsvData('');
        setShowImportModal(false);
      }
    } catch (error) {
      console.error('Error parsing CSV data:', error);
      alert('Error parsing CSV data. Please check the format and try again.');
    }
  };

  const removeManualInvestor = (investorId: number) => {
    const updatedManualInvestors = manualInvestors.filter(inv => inv.id !== investorId);
    setManualInvestors(updatedManualInvestors);
    localStorage.setItem('crm_manual_investors', JSON.stringify(updatedManualInvestors));
  };

  const statusCounts = getStatusCounts();
  const maxChartValue = Math.max(...chartData.map(d => Math.max(d.made || d.sent || 0, d.answered || d.replied || 0)));

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {submissionData ? `${submissionData.submission.company_name} - Funding CRM` : 'Funding CRM'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {submissionData 
              ? `Manage your ${investors.length} matched investors and track your funding pipeline`
              : 'Manage your investor relationships and track your funding pipeline'
            }
          </p>
        </div>

        {/* Phone Number Section */}
        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Email Campaigns</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Track Emails Sent to Investor Prospects.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">AI Cold Calls</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Automate Outreach with AI Cold Calling.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Pipeline Management</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Track your Funding Progress & Manage Investors.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Dedicated Phone Number</h2>
            <button
              onClick={handleGetPhoneNumber}
              disabled={isGettingPhoneNumber || !!phoneNumber}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>{isGettingPhoneNumber ? 'Getting Number...' : 'Get Telephone Number'}</span>
            </button>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Phone className="w-6 h-6 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Your Outreach Number:</p>
                <p className="text-xl font-mono font-bold text-gray-900">
                  {phoneNumber || 'XXX-XXX-XXXX'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Tracking Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Usage Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${chartType === 'calls' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'} rounded-lg p-4`}>
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 ${chartType === 'calls' ? 'bg-blue-100' : 'bg-green-100'} rounded-xl flex items-center justify-center`}>
                  {chartType === 'calls' ? (
                    <Phone className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Mail className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${chartType === 'calls' ? 'text-blue-600' : 'text-green-600'}`}>
                    {chartType === 'calls' ? 'Calls Made' : 'Texts Sent'}
                  </p>
                  <p className={`text-2xl font-bold ${chartType === 'calls' ? 'text-blue-900' : 'text-green-900'}`}>
                    {chartType === 'calls' ? callsMadeCount : textsSentCount}
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`${chartType === 'calls' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'} rounded-lg p-4`}>
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 ${chartType === 'calls' ? 'bg-blue-100' : 'bg-green-100'} rounded-xl flex items-center justify-center`}>
                  {chartType === 'calls' ? (
                    <Phone className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Mail className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${chartType === 'calls' ? 'text-blue-600' : 'text-green-600'}`}>
                    {chartType === 'calls' ? 'Calls Answered' : 'Texts Replied'}
                  </p>
                  <p className={`text-2xl font-bold ${chartType === 'calls' ? 'text-blue-900' : 'text-green-900'}`}>
                    {chartType === 'calls' ? callsAnsweredCount : textsRepliedCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Chart Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Activity Overview</h2>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChartType('calls')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  chartType === 'calls' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Calls
              </button>
              <button
                onClick={() => setChartType('texts')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  chartType === 'texts' 
                    ? 'bg-white text-green-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Texts
              </button>
            </div>
          </div>
          
          <div className="h-64">
            <div className="flex items-end justify-between h-full space-x-2">
              {chartData.map((data, index) => {
                const primaryValue = chartType === 'calls' ? data.made : data.sent;
                const secondaryValue = chartType === 'calls' ? data.answered : data.replied;
                const primaryHeight = (primaryValue / maxChartValue) * 100;
                const secondaryHeight = (secondaryValue / maxChartValue) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex items-end justify-center space-x-1 h-48 mb-2">
                      <div className="flex flex-col items-center">
                        <div 
                          className={`w-6 rounded-t ${chartType === 'calls' ? 'bg-blue-500' : 'bg-green-500'}`}
                          style={{ height: `${primaryHeight}%` }}
                          title={`${chartType === 'calls' ? 'Calls Made' : 'Texts Sent'}: ${primaryValue}`}
                        />
                        <span className="text-xs text-gray-600 mt-1">{primaryValue}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div 
                          className={`w-6 rounded-t ${chartType === 'calls' ? 'bg-blue-300' : 'bg-green-300'}`}
                          style={{ height: `${secondaryHeight}%` }}
                          title={`${chartType === 'calls' ? 'Calls Answered' : 'Texts Replied'}: ${secondaryValue}`}
                        />
                        <span className="text-xs text-gray-600 mt-1">{secondaryValue}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{data.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded ${chartType === 'calls' ? 'bg-blue-500' : 'bg-green-500'}`} />
              <span className="text-sm text-gray-600">
                {chartType === 'calls' ? 'Calls Made' : 'Texts Sent'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded ${chartType === 'calls' ? 'bg-blue-300' : 'bg-green-300'}`} />
              <span className="text-sm text-gray-600">
                {chartType === 'calls' ? 'Calls Answered' : 'Texts Replied'}
              </span>
            </div>
          </div>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {STATUS_OPTIONS.map((status) => (
            <div key={status.value} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{statusCounts[status.value] || 0}</div>
                <div className={`text-xs px-2 py-1 rounded-full mt-2 ${status.color}`}>
                  {status.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Investor Pipeline Section */}
       

        {/* Recent Activity Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Email sent to Sequoia Capital</p>
                <p className="text-sm text-gray-600">Jan 15, 2024 at 2:30 PM</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Delivered
              </span>s
            </div>

            <div className="flex items-center space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">AI Cold Call to Andreessen Horowitz</p>
                <p className="text-sm text-gray-600">Jan 14, 2024 at 10:15 AM</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Completed
              </span>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Meeting scheduled with Kleiner Perkins</p>
                <p className="text-sm text-gray-600">Jan 12, 2024 at 4:45 PM</p>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                Scheduled
              </span>
            </div>
          </div>
        </div>

        {/* Investor Pipeline Table */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {submissionData ? 'Your Matched Investors' : 'Investor Pipeline'}
            </h2>
            {submissionData && (
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">{investors.length}</div>
                <div className="text-sm text-gray-600">Total Investors</div>
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your investor matches...</p>
            </div>
          ) : investors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Investors Yet</h3>
              <p className="text-gray-600 mb-6">
                Complete your startup profile to get AI-matched with relevant investors, or import investors manually.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => onNavigate('funding')}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Complete Your Profile
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Import Investors
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Investor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Investment Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Focus Areas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Match Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status Tracker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {investors.map((investor) => {
                    const statusConfig = getStatusConfig(investor.status);
                    return (
                      <tr key={investor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start space-x-3">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
  investor.source === 'manual' ? 'bg-purple-100' : 
  investor.source === 'favorite' ? 'bg-yellow-100' : 'bg-blue-100'
}`}>
  {investor.source === 'manual' ? (
    <UserCheck className="w-5 h-5 text-purple-600" />
  ) : investor.source === 'favorite' ? (
    <Star className="w-5 h-5 text-yellow-600 fill-current" />
  ) : (
    <Building className="w-5 h-5 text-blue-600" />
  )}
</div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-gray-900">{investor.name}</h3>
                                {investor.website && (
                                  <a
                                    href={investor.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <Globe className="w-4 h-4" />
                                  </a>
                                )}
                                {investor.source === 'manual' && (
                                  <button
                                    onClick={() => removeManualInvestor(investor.id)}
                                    className="text-red-500 hover:text-red-700"
                                    title="Remove manual investor"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{investor.location}</p>
                              {investor.description && (
                                <p className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                                  {investor.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{investor.investmentRange}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {investor.focus.map((area: string, idx: number) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                {area}
                              </span>
                            ))}
                          </div>
                        </td>
                      <td className="px-6 py-4">
  {investor.source === 'ai_matched' ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      {investor.matchScore}%
    </span>
  ) : investor.source === 'favorite' ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      {investor.matchScore}%
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
      Manual
    </span>
  )}
</td>
                        <td className="px-6 py-4">
                          <select
                            value={investor.status}
                            onChange={(e) => updateInvestorStatus(investor.id, e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => {
                                const newTextsCount = textsSentCount + 1;
                                const newTextsReplied = textsRepliedCount + Math.floor(Math.random() * 2); // 0 or 1 replies
                                setTextsSentCount(newTextsCount);
                                setTextsRepliedCount(newTextsReplied);
                                localStorage.setItem('crm_texts_sent', newTextsCount.toString());
                                localStorage.setItem('crm_texts_replied', newTextsReplied.toString());
                              }}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                            >
                              <Mail className="w-3 h-3 mr-1" />
                              Email
                            </button>
                            <button 
                              onClick={() => {
                                const newCallsCount = callsMadeCount + 1;
                                const newCallsAnswered = callsAnsweredCount + Math.floor(Math.random() * 2); // 0 or 1 calls answered
                                setCallsMadeCount(newCallsCount);
                                setCallsAnsweredCount(newCallsAnswered);
                                localStorage.setItem('crm_calls_made', newCallsCount.toString());
                                localStorage.setItem('crm_calls_answered', newCallsAnswered.toString());
                              }}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              Call
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Import Investors</h2>
                      <p className="text-purple-100 text-sm">Add investors manually or via CSV</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                  <button
                    onClick={() => setImportType('single')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      importType === 'single' 
                        ? 'bg-white text-purple-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Single Entry
                  </button>
                  <button
                    onClick={() => setImportType('csv')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      importType === 'csv' 
                        ? 'bg-white text-purple-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    CSV Import
                  </button>
                </div>

                {importType === 'single' ? (
                  <form onSubmit={handleSingleInvestorSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Investor Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={singleInvestorForm.name}
                          onChange={(e) => setSingleInvestorForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Acme Ventures"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={singleInvestorForm.email}
                          onChange={(e) => setSingleInvestorForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="contact@acmeventures.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Website
                        </label>
                        <input
                          type="url"
                          value={singleInvestorForm.website}
                          onChange={(e) => setSingleInvestorForm(prev => ({ ...prev, website: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="https://acmeventures.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Investment Range
                        </label>
                        <input
                          type="text"
                          value={singleInvestorForm.investmentRange}
                          onChange={(e) => setSingleInvestorForm(prev => ({ ...prev, investmentRange: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="$1M - $10M"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Focus Areas (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={singleInvestorForm.focus}
                        onChange={(e) => setSingleInvestorForm(prev => ({ ...prev, focus: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Technology, Healthcare, SaaS"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={singleInvestorForm.location}
                        onChange={(e) => setSingleInvestorForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={singleInvestorForm.description}
                        onChange={(e) => setSingleInvestorForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Brief description of the investor..."
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowImportModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Add Investor
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CSV Data
                      </label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
                        <p className="text-xs text-gray-600 mb-1">Format: Name, Email, Website, Description, Investment Range, Focus Areas (semicolon-separated), Location</p>
                        <p className="text-xs text-gray-500">Example: Acme Ventures, contact@acme.com, https://acme.com, Early stage VC, $1M-$10M, Technology;Healthcare, San Francisco CA</p>
                      </div>
                      <textarea
                        rows={8}
                        value={csvData}
                        onChange={(e) => setCsvData(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        placeholder="Paste your CSV data here..."
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowImportModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCsvImport}
                        disabled={!csvData.trim()}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Import CSV
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}