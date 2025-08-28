import React from 'react';
import { Check, DollarSign, Zap, Star, UserPlus, AlertTriangle } from 'lucide-react';
import { PricingCards } from '../components/PricingCards';

type View = 'home' | 'funding' | 'loan' | 'investor' | 'crm' | 'results' | 'pricing' | 'outreach' | 'dashboard' | 'discord' | 'help-center';

interface PricingPageProps {
  onBack: () => void;
  onNavigate: (view: View) => void;
  user: any;
  setLoginModalOpen: (open: boolean) => void;
}

export function PricingPage({ onBack, onNavigate, user, setLoginModalOpen }: PricingPageProps) {
  const handlePlanSelect = (planId: string) => {
    console.log('Plan selected:', planId);
    // Proceed with plan selection - user account will be created via Stripe webhook
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <PricingCards 
          onPlanSelect={handlePlanSelect} 
          onPaymentSuccessNavigate={onNavigate}
          user={user}
        />
      </div>
    </div>
  );
}