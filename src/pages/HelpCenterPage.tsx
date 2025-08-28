import React, { useState } from 'react';
import { LifeBuoy, BookOpen, CreditCard, User, Mail, ExternalLink, Search, ChevronRight, TrendingUp, Users, Phone } from 'lucide-react';

type View = 'home' | 'funding' | 'loan' | 'investor' | 'crm' | 'results' | 'pricing' | 'outreach' | 'dashboard' | 'discord' | 'help-center';

interface HelpCenterPageProps {
  onBack: () => void;
  onNavigate: (view: View) => void;
  user: any;
  clientData: any;
  setLoginModalOpen: (open: boolean) => void;
}

const popularDocs = [
  {
    title: 'How It Works',
    description: 'Learn how our AI Matching system connects you with investors.',
    icon: TrendingUp,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    title: 'Automated Fundraising',
    description: 'Discover how our AI analyzes your startup and matches you with the most relevant investors.',
    icon: Users,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    title: 'Comprehensive Database',
    description: 'Access thousands of verified investors, VCs, and lenders.',
    icon: BookOpen,
    color: 'bg-green-100 text-green-600'
  },
  {
    title: 'AI Cold Calls',
    description: 'Automate your outreach with AI-powered personalized cold calling.',
    icon: Phone,
    color: 'bg-orange-100 text-orange-600'
  }
];

const accountDocs = [
  {
    title: 'Billing',
    description: 'Learn about billing and subscription management.',
    icon: CreditCard,
    color: 'bg-green-100 text-green-600'
  },
  {
    title: 'Accounts',
    description: 'Manage your KapitalGPT account.',
    icon: User,
    color: 'bg-blue-100 text-blue-600'
  }
];

export function HelpCenterPage({ onBack, onNavigate, user, clientData, setLoginModalOpen }: HelpCenterPageProps) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LifeBuoy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to the KapitalGPT Help Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Start raising capital faster with easy-to-follow guides and helpful resources.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Popular Docs Section */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Popular Docs</h2>
            <p className="text-gray-600 mb-8">
              Explore our top resources for helping you unlock KapitalGPT's full potential and solve common issues.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {popularDocs.map((doc, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.color}`}>
                      <doc.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-gray-600 text-sm">{doc.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started with KapitalGPT</h2>
            <p className="text-gray-600 mb-6">
              Need the basics on our FinTech app? This quick guide shows how it works and who it's made for.
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Quick Start Guide</h3>
                  <p className="text-gray-600 text-sm">Learn the fundamentals of using KapitalGPT to raise capital</p>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Accounts and Subscriptions Section */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Accounts and Subscriptions</h2>
            <p className="text-gray-600 mb-8">
              Have a question about your account, billing, or your subscription? See the following support articles:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {accountDocs.map((doc, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.color}`}>
                      <doc.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-gray-600 text-sm">{doc.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ready to Raise Capital CTA */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Raise Capital?</h2>
            <p className="text-xl text-purple-100 mb-8">We are your AI Co-Founder for raising capital.</p>
            <button
              onClick={() => onNavigate('funding')}
              className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started Now
            </button>
          </div>
        </div>

        {/* Still Have Questions Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Still Have Questions?</h2>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 mb-6">
              We know how frustrating unexpected issues can be, and we're actively improving our Help Center to help you find answers as quickly as you're building.
            </p>
            
            <p className="text-gray-700 mb-6">
              But if you can't find the information you need, please email us. We are absolutely committed to responding to every individual inquiry. We're a small team, but we're working hard on building a dedicated support crew. In the meantime, other team members are stepping in to help. Thank you for your patience while we get you the answers you need to continue building new and great things with KapitalGPT.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-1">Contact Support</h3>
                <p className="text-blue-800 text-sm mb-2">
                  For support on billing, refunds, and other urgent issues, email us at:
                </p>
                <a 
                  href="mailto:Help@SmartEngineersGroup.com"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <span>Help@SmartEngineersGroup.com</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}