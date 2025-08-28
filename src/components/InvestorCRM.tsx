import React, { useState } from 'react';
import { DollarSign, TrendingUp, Users, Building, MapPin, Clock, Eye, MessageSquare } from 'lucide-react';

type View = 'home' | 'funding' | 'loan' | 'investor' | 'crm' | 'results' | 'pricing' | 'outreach' | 'dashboard' | 'discord' | 'help-center';

interface InvestorCRMProps {
  onBack: () => void;
  onNavigate: (view: View) => void;
  user: any;
  setLoginModalOpen: (open: boolean) => void;
}

// Mock data for demonstration
const mockStartups = [
  {
    id: 1,
    name: 'TechFlow AI',
    industry: 'Technology',
    stage: 'Series A',
    fundingNeeded: 5000000,
    location: 'San Francisco, CA',
    description: 'AI-powered workflow automation platform for enterprises',
    founder: 'Sarah Chen',
    email: 'sarah@techflow.ai',
    phone: '(555) 123-4567',
    matchScore: 95,
    lastContact: '2024-01-15',
    status: 'Hot Lead',
    interests: ['Technology', 'Services'],
    teamSize: 25,
    revenue: 2500000,
    growth: '+150%'
  },
  {
    id: 2,
    name: 'GreenBuild Solutions',
    industry: 'Real Estate & Construction',
    stage: 'Seed',
    fundingNeeded: 1500000,
    location: 'Austin, TX',
    description: 'Sustainable construction materials and green building solutions',
    founder: 'Mike Rodriguez',
    email: 'mike@greenbuild.com',
    phone: '(555) 987-6543',
    matchScore: 88,
    lastContact: '2024-01-12',
    status: 'Interested',
    interests: ['Real Estate & Construction', 'Manufacturing'],
    teamSize: 12,
    revenue: 800000,
    growth: '+85%'
  },
  {
    id: 3,
    name: 'HealthTrack Pro',
    industry: 'Healthcare & Wellness',
    stage: 'Pre-Seed',
    fundingNeeded: 750000,
    location: 'Boston, MA',
    description: 'Digital health monitoring platform for chronic disease management',
    founder: 'Dr. Lisa Wang',
    email: 'lisa@healthtrack.com',
    phone: '(555) 456-7890',
    matchScore: 82,
    lastContact: '2024-01-10',
    status: 'Under Review',
    interests: ['Healthcare & Wellness', 'Technology'],
    teamSize: 8,
    revenue: 150000,
    growth: '+200%'
  }
];

export function InvestorCRM({ onBack, onNavigate, user, setLoginModalOpen }: InvestorCRMProps) {
  const [selectedStartup, setSelectedStartup] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hot Lead': return 'bg-red-100 text-red-800';
      case 'Interested': return 'bg-green-100 text-green-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (selectedStartup) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{selectedStartup.name}</h1>
                  <p className="text-purple-100 text-lg">{selectedStartup.description}</p>
                  <div className="flex items-center space-x-4 mt-4">
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                      {selectedStartup.stage}
                    </span>
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                      {selectedStartup.industry}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-2xl font-bold">{selectedStartup.matchScore}%</div>
                  <div className="text-purple-100 text-sm">Match Score</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Revenue</span>
                      </div>
                      <div className="text-2xl font-bold text-green-900">{formatCurrency(selectedStartup.revenue)}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Growth</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-900">{selectedStartup.growth}</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Team Size</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-900">{selectedStartup.teamSize}</div>
                    </div>
                  </div>

                  {/* Funding Details */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Funding Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Funding Stage</span>
                        <p className="font-semibold text-gray-900">{selectedStartup.stage}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Amount Needed</span>
                        <p className="font-semibold text-gray-900">{formatCurrency(selectedStartup.fundingNeeded)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Location</span>
                        <p className="font-semibold text-gray-900">{selectedStartup.location}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Industry Focus</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedStartup.interests.map((interest: string) => (
                            <span key={interest} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <button className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                      <Mail className="w-5 h-5" />
                      <span>Send Email</span>
                    </button>
                    <button className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                      <Phone className="w-5 h-5" />
                      <span>Schedule Call</span>
                    </button>
                    <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                      <MessageSquare className="w-5 h-5" />
                      <span>Add Note</span>
                    </button>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Contact Info */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Founder</span>
                        <p className="font-semibold text-gray-900">{selectedStartup.founder}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Email</span>
                        <p className="text-purple-600">{selectedStartup.email}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Phone</span>
                        <p className="text-gray-900">{selectedStartup.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Current Status</span>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedStartup.status)}`}>
                            {selectedStartup.status}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Last Contact</span>
                        <p className="text-gray-900">{selectedStartup.lastContact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Investor Dashboard</h1>
                <p className="text-gray-600">Discover and connect with promising startups</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{filteredStartups.length}</div>
              <div className="text-sm text-gray-600">Available Startups</div>
            </div>
          </div>

          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Investor CRM Dashboard</h3>
            <p className="text-gray-600 mb-6">
              This is your investor relationship management center. Use the Dashboard to discover and manage investors, 
              then come here to track detailed interactions and relationship progress.
            </p>
            <button
              onClick={() => onNavigate('dashboard')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}