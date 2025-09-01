import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TrendingUp, Menu, X, Phone, Users, LogIn, UserPlus, Home, LayoutDashboard, DollarSign, MessageSquare, LifeBuoy } from 'lucide-react';
import { FundingForm } from './components/FundingForm';
import { InvestorForm } from './components/InvestorForm';
import { InvestorCRM } from './components/InvestorCRM';
import { PricingPage } from './pages/PricingPage';
import { OutreachCampaignPage } from './pages/OutreachCampaignPage';
import { Dashboard } from './pages/Dashboard';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { VoiceAgentModal } from './components/VoiceAgentModal';
import { LoginModal } from './components/LoginModal';
import { AppFooter } from './components/AppFooter';
import { UserProvider } from './context/UserContext';
import { SignupModal } from './components/SignupModal';
import { useUser } from './context/useUser';
import { supabase } from './lib/supabaseClient';
import { useNavigate } from 'react-router-dom';


type View = 'home' | 'funding' | 'investor' | 'crm' | 'pricing' | 'outreach' | 'dashboard' | 'help-center' | 'signup' | 're';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [visitorCount, setVisitorCount] = useState(0);
  const [membersCount, setMembersCount] = useState(0);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [voiceAgentOpen, setVoiceAgentOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [favoriteInvestors, setFavoriteInvestors] = useState<any[]>([]);
  const [clientData, setClientData] = useState<any>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const { user, signOut, totalUsersCount, plan } = useUser()
  const navigate = useNavigate();

const fetchClientData = async (userEmail: string) => {
  const { data, error } = await supabase
    .from('clients')
    .select('plan_name')
    .eq('email', userEmail)
    .single();

  if (error) {
    console.error('Error fetching client data:', error);
    setClientData(null);
  } else {
    setClientData(data);
  }
};



  useEffect(() => {
     if (user?.email) {
    fetchClientData(user.email);
  } else {
    setClientData(null);
  }

    const hasVisited = sessionStorage.getItem('hasVisited');
    async function incrementVisitorCount() {
      await supabase.rpc('increment_visitor_count');
    }

    async function fetchVisitorCountFromDB() {
      const { data, error } = await supabase
        .from('visitor_stats')
        .select('count')
        .eq('id', 1)
        .single();
      if (!error && data) setVisitorCount(data.count);
    }

    if (!hasVisited) {
      incrementVisitorCount().then(fetchVisitorCountFromDB);
      sessionStorage.setItem('hasVisited', 'true');
    } else {
      fetchVisitorCountFromDB();
    }

    const channel = supabase
      .channel('public:visitor_stats')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'visitor_stats' },
        (payload) => {
          setVisitorCount(payload.new.count);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);


  const handleOpenLoginModal = () => {
  setSignupModalOpen(false);
  setLoginModalOpen(true);
};

const handleOpenSignupModal = () => {
  setLoginModalOpen(false);
  setSignupModalOpen(true);
};

const handleLogout = async () => {
  await signOut()
};

  const handleCancelAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      'Are you sure you want to cancel your account? This will immediately cancel your subscription and you will lose access to all features. This action cannot be undone.'
    );

    if (!confirmed) return;

    setIsCancelling(true);

    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerEmail: user.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel subscription');
      }

      alert('Your subscription has been canceled successfully. You will be logged out now.');
      await handleLogout();
      setCurrentView('home');
      setSideMenuOpen(false);

    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert(`Failed to cancel subscription: ${error instanceof Error ? error.message : 'Unknown error'}. Please contact support at Help@SmartEngineersGroup.com`);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleFundingSubmit = async (id: string) => {
    const currentMembersCount = parseInt(localStorage.getItem('membersCount') || '0', 10);
    const newMembersCount = currentMembersCount + 1;
    localStorage.setItem('membersCount', newMembersCount.toString());
    setMembersCount(newMembersCount);
    
    localStorage.setItem('lastSubmissionId', id);
    setCurrentView('outreach');
  };

  const handleInvestorSubmit = (data: any) => {
    console.log('Investor registration:', data);
    setCurrentView('home');
  };

  const handleMenuItemClick = (view: View) => {
    setCurrentView(view);
    setSideMenuOpen(false);
  };

  const GlobalHeader = () => (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSideMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Menu className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Menu</span>
              </div>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KapitalGPT</h1>
                <p className="text-xs text-gray-600">AI-powered fundraising platform</p>
              </div>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <button
                disabled={!user?.aud}
                onClick={() => navigate('/retell-call-agent')}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">Test AI Cold Call</span>
              </button>
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 font-medium">{visitorCount} Visitors</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-700 font-medium">{totalUsersCount} Members</span>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );

  const GlobalSideMenu = () => (
    <>
      {sideMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setSideMenuOpen(false)}
        />
      )}

      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        sideMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">KapitalGPT</h2>
                <p className="text-xs text-gray-600">Menu</p>
              </div>
            </div>
            <button
              onClick={() => setSideMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => handleMenuItemClick('home')}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <Home className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Home</span>
            </button>

            {!user && (
              <>
                <button
                  onClick={() => { setLoginModalOpen(true); setSideMenuOpen(false); }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  <LogIn className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700 font-medium">Login</span>
                </button>

                <button
                  onClick={() => { setSignupModalOpen(true); setSideMenuOpen(false); }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  <UserPlus className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700 font-medium">Sign Up</span>
                </button>
              </>
            )}

            <button
              onClick={() => handleMenuItemClick('dashboard')}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <LayoutDashboard className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => handleMenuItemClick('pricing')}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <DollarSign className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Pricing</span>
            </button>

            <button
              onClick={() => handleMenuItemClick('funding')}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <Users className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Find Investors</span>
            </button>

            <button
              onClick={() => handleMenuItemClick('outreach')}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Funding CRM</span>
            </button>

            <button
              onClick={() => window.open('https://discord.gg/55azs6F2', '_blank')}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Discord Community</span>
            </button>

            <button
              onClick={() => handleMenuItemClick('help-center')}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <LifeBuoy className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Help Center</span>
            </button>

            {user && (
              <>
                <button
                  onClick={() => { handleLogout(); setSideMenuOpen(false); }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  <LogIn className="w-5 h-5 text-red-600 rotate-180" />
                  <span className="text-gray-700 font-medium">Logout</span>
                </button>

                <button
                  onClick={handleCancelAccount}
                  disabled={isCancelling}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-100 transition-colors text-left border-t border-gray-200 mt-4 pt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5 text-red-600" />
                  <span className="text-red-700 font-medium">
                    {isCancelling ? 'Cancelling...' : 'Cancel Account'}
                  </span>
                </button>
              </>
            )}
          </nav>

          <div className="mt-8 space-y-3">
            {user && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                    {clientData && (
                      <>
                      <p className="text-xs text-purple-600 font-medium">Demo Account</p>
                      {/* <p className="text-xs text-purple-600 font-medium">{clientData.plan_name} Plan</p> */}
                     
                      </>
                    )}
                   {clientData && (
                     <button
                       onClick={() => { setCurrentView('pricing'); setSideMenuOpen(false); }}
                       className="text-xs text-blue-600 font-medium hover:underline"
                     >
                       Upgrade Plan ⭐️
                     </button>
                   )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 font-medium">{visitorCount} Visitors</span>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-700 font-medium">{totalUsersCount} Members</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

const renderCurrentView = () => {
  const commonProps = {
    onBack: () => setCurrentView('home'),
    onNavigate: handleMenuItemClick,
    user,
    setLoginModalOpen,
    favoriteInvestors,
    setFavoriteInvestors
  };


    switch (currentView) {
      case 'funding':
        return <FundingForm {...commonProps} onSubmit={handleFundingSubmit} />;
      case 'investor':
        return <InvestorForm {...commonProps} onSubmit={handleInvestorSubmit} />;
      case 'crm':
        return <InvestorCRM {...commonProps} />;
      case 'pricing':
        return <PricingPage {...commonProps} />;
     case 'dashboard':
      return <Dashboard {...commonProps} clientData={clientData} />;
    case 'outreach':
      return <OutreachCampaignPage {...commonProps} clientData={clientData} favoriteInvestors={favoriteInvestors} />;
      case 'help-center':
        return <HelpCenterPage {...commonProps} clientData={clientData} />;
      default:
        return <HomePage />;
    }
  };

  const HomePage = () => (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 to-black bg-clip-text text-transparent">K</span>
              <span className="text-gray-900">apitalGPT</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              We are a <span className="text-purple-600 font-semibold">FinTech</span> app that helps <span className="text-blue-600 font-semibold">Founders</span> Raise Money using <span className="text-green-600 font-semibold">AI</span>!
            </p>
            
            <div className="flex justify-center mb-12">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Funding</h3>
                  <p className="text-gray-600">Find Investors + Raise capital with AI.</p>
                </div>
                <button
                  onClick={() => setCurrentView('funding')}
                  className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  Get Funding
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
                <div className="text-gray-600">Investor Database</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">$1 Trillion+</div>
                <div className="text-gray-600">Capital Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">150+</div>
                <div className="text-gray-600">Hours Saved</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
             Our AI Matching system Connects you with Investors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Automated Fundraising</h3>
              <p className="text-gray-600">
                Our AI analyzes your startup and matches you with the most relevant investors based on stage, industry, and funding requirements.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Comprehensive Database</h3>
              <p className="text-gray-600">
                Access Thousands of Verified Investors, VCs, and Lenders with detailed profiles, investment criteria, and contact information.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI Cold Calls</h3>
              <p className="text-gray-600">
                Automate your outreach with AI-powered cold calling that personalizes each conversation based on investor preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Raise Capital?</h2>
          <p className="text-xl text-blue-100 mb-8">
            We are your AI Co-Founder for Raising Capital
          </p>
          <button
            onClick={() => setCurrentView('funding')}
            className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl mx-auto"
          >
            Get Funding
          </button>
        </div>
      </section>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <GlobalHeader />
        <GlobalSideMenu />
        
        <main className="flex-1">
          {renderCurrentView()}
        </main>
        
        <AppFooter onNavigate={handleMenuItemClick} />
        
        <VoiceAgentModal 
          isOpen={voiceAgentOpen} 
          onClose={() => setVoiceAgentOpen(false)} 
          startColdCallDemo={true}
        />
        
        <LoginModal 
          isOpen={loginModalOpen} 
          onClose={() => setLoginModalOpen(false)}
          onLoginSuccess={() => {setLoginModalOpen(false);
            setCurrentView('dashboard');
           }}
          onNavigate={handleMenuItemClick}
          onOpenSignupModal={handleOpenSignupModal}
        />
        <SignupModal
          isOpen={signupModalOpen}
          onClose={() => setSignupModalOpen(false)}
          onSignupSuccess={() => {
            setSignupModalOpen(false);
            setCurrentView('dashboard');
          }}
          onNavigate={handleMenuItemClick}
          onOpenLoginModal={handleOpenLoginModal}
        />
      </div>
    </ErrorBoundary>
  );
}

export default function App() {
  return (

      <AppContent />

  );
}