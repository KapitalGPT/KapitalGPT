import React, { useEffect, useState } from 'react';
import { TrendingUp, Star, Heart, Mail, Globe, Building, Filter, Search, Eye, Plus, ArrowRight, XCircle, LayoutDashboard } from 'lucide-react';

type View = 'home' | 'funding' | 'investor' | 'crm' | 'pricing' | 'outreach' | 'dashboard' | 'help-center';

interface DashboardProps {
  onBack: () => void;
  onNavigate: (view: View) => void;
  user: any;
  clientData: any;
  setLoginModalOpen: (open: boolean) => void;
  favoriteInvestors: any[];
  setFavoriteInvestors: (investors: any[]) => void;
}

const mockInvestors = [
  {
    id: 1,
    name: 'Sequoia Capital',
    type: 'vc',
    email: 'contact@sequoiacap.com',
    website: 'https://sequoiacap.com',
    description: 'Leading venture capital firm investing in technology companies from seed to growth stage.',
    investmentRangeMin: 1000000,
    investmentRangeMax: 50000000,
    preferredStages: ['seed', 'series-a', 'series-b'],
    preferredIndustries: ['Technology', 'Healthcare'],
    geographicFocus: ['United States', 'Global'],
    portfolioCompanies: ['Apple', 'Google', 'WhatsApp', 'Airbnb'],
    matchScore: 95,
    responseTime: 'within_week',
    lastActive: '2024-01-15',
    isFavorite: false
  },
  {
    id: 2,
    name: 'Andreessen Horowitz',
    type: 'vc',
    email: 'info@a16z.com',
    website: 'https://a16z.com',
    description: 'Venture capital firm focused on investing in bold entrepreneurs building the future.',
    investmentRangeMin: 500000,
    investmentRangeMax: 100000000,
    preferredStages: ['seed', 'series-a', 'series-b', 'growth'],
    preferredIndustries: ['Technology', 'Crypto', 'Healthcare'],
    geographicFocus: ['United States'],
    portfolioCompanies: ['Facebook', 'Twitter', 'Coinbase', 'Slack'],
    matchScore: 92,
    responseTime: 'within_2weeks',
    lastActive: '2024-01-14',
    isFavorite: false
  },
  {
    id: 3,
    name: 'Kleiner Perkins',
    type: 'vc',
    email: 'contact@kpcb.com',
    website: 'https://kleinerperkins.com',
    description: 'Venture capital firm partnering with entrepreneurs to build disruptive companies.',
    investmentRangeMin: 2000000,
    investmentRangeMax: 25000000,
    preferredStages: ['series-a', 'series-b'],
    preferredIndustries: ['Technology', 'Healthcare', 'Clean Tech'],
    geographicFocus: ['United States'],
    portfolioCompanies: ['Amazon', 'Google', 'Uber', 'Spotify'],
    matchScore: 88,
    responseTime: 'within_week',
    lastActive: '2024-01-13',
    isFavorite: false
  }
];

export function Dashboard({ onBack, onNavigate, user, clientData, setLoginModalOpen, favoriteInvestors, setFavoriteInvestors }: DashboardProps) {
  const [investors, setInvestors] = useState(mockInvestors);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');

  // const favoriteInvestors = investors.filter(investor => investor.isFavorite);
  const potentialInvestors = investors.filter(investor => !investor.isFavorite);
  

  const filteredPotentialInvestors = potentialInvestors.filter(investor => {
    const matchesSearch = investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investor.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = !selectedStage || investor.preferredStages.includes(selectedStage);
    const matchesIndustry = !selectedIndustry || investor.preferredIndustries.includes(selectedIndustry);
    
    return matchesSearch && matchesStage && matchesIndustry;
  });

    useEffect(() => {
    const currentFavorites = investors.filter(investor => investor.isFavorite);
    setFavoriteInvestors(currentFavorites);
  }, [investors, setFavoriteInvestors]);

  const toggleFavorite = (investorId: number) => {
    setInvestors(prev => prev.map(investor => 
      investor.id === investorId 
        ? { ...investor, isFavorite: !investor.isFavorite }
        : investor
    ));
  };

  const removeInvestor = (investorId: number) => {
    setInvestors(prev => prev.filter(investor => investor.id !== investorId));
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getInvestorTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'individual': 'Individual',
      'vc': 'Venture Capital',
      'angel': 'Angel Investor',
      'pe': 'Private Equity',
      'family_office': 'Family Office',
      'corporate': 'Corporate VC'
    };
    return types[type] || type;
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

const handleOutreachCampaign = () => {
  setFavoriteInvestors(favoriteInvestors);
  onNavigate('outreach');
}

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome{user ? `, ${user.email?.split('@')[0]}` : ''}!
          </h1>
          <p className="text-xl text-gray-600 mb-4">Your dedicated CRM for managing investor relationships</p>
          
          {!user && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <p className="text-yellow-800 text-sm font-medium text-center">
                Must Have an Account to Proceed
              </p>
            </div>
          )}
          
          <button
            onClick={() => onNavigate('outreach')}
            disabled={!user}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrendingUp className="w-6 h-6" />
            <span>Start Outreach Campaign</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Potential Investors</h2>
                  <p className="text-gray-600">AI-matched investors based on your profile</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{filteredPotentialInvestors.length}</div>
                  <div className="text-sm text-gray-600">Available</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search investors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Stages</option>
                  <option value="pre-seed">Pre-Seed</option>
                  <option value="seed">Seed</option>
                  <option value="series-a">Series A</option>
                  <option value="series-b">Series B</option>
                </select>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Industries</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Consumer">Consumer</option>
                </select>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredPotentialInvestors.map(investor => (
                  <div key={investor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <button
                        onClick={() => removeInvestor(investor.id)}
                        className="p-1 rounded-full hover:bg-red-100 transition-colors group"
                        title="Remove Investor"
                      >
                        <XCircle className="w-5 h-5 text-red-500 group-hover:text-red-600" />
                      </button>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(investor.matchScore)}`}>
                          {investor.matchScore}% Match
                        </span>
                        <button
                          onClick={() => toggleFavorite(investor.id)}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <Building className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{investor.name}</h3>
                        <p className="text-sm text-gray-600">{getInvestorTypeLabel(investor.type)}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{investor.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-600">Investment Range:</span>
                        <p className="font-medium">{formatCurrency(investor.investmentRangeMin)} - {formatCurrency(investor.investmentRangeMax)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Focus:</span>
                        <p className="font-medium">{investor.preferredIndustries.slice(0, 2).join(', ')}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {investor.email && (
                          <button className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                            <Mail className="w-4 h-4" />
                            <span className="text-xs">Email</span>
                          </button>
                        )}
                        {investor.website && (
                          <button className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <Globe className="w-4 h-4" />
                            <span className="text-xs">Website</span>
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => toggleFavorite(investor.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-xs">Add to Favorites</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Favorite Investors</h2>
                  <p className="text-gray-600 text-sm">Your workspace</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-purple-600">{favoriteInvestors.length}</div>
                  <div className="text-xs text-gray-600">Favorites</div>
                </div>
              </div>

              {favoriteInvestors.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Favorites Yet</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Add investors to your favorites to create your personalized workspace.
                  </p>
                  <div className="flex items-center justify-center space-x-1 text-purple-600">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">Click the heart icon to add favorites</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {favoriteInvestors.map(investor => (
                    <div key={investor.id} className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">{investor.name}</h4>
                          <p className="text-xs text-gray-600">{getInvestorTypeLabel(investor.type)}</p>
                        </div>
                        <button
                          onClick={() => toggleFavorite(investor.id)}
                          className="p-1 rounded-full hover:bg-purple-100 transition-colors"
                        >
                          <Star className="w-4 h-4 text-purple-500 fill-current" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(investor.matchScore)}`}>
                          {investor.matchScore}% Match
                        </span>
                        <div className="flex space-x-1">
                          <button className="p-1 rounded hover:bg-purple-100 transition-colors">
                            <Mail className="w-3 h-3 text-purple-600" />
                          </button>
                          <button className="p-1 rounded hover:bg-purple-100 transition-colors">
                            <Eye className="w-3 h-3 text-purple-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {favoriteInvestors.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                  onClick={handleOutreachCampaign}
                   className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                    <ArrowRight className="w-4 h-4" />
                    <span className="text-sm">Start Outreach Campaign</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}