import React, { useState } from 'react';
import { Check, Star, Zap, DollarSign } from 'lucide-react';
import { PRICING_PLANS } from '../lib/stripe-client';
import { StripeCheckout } from './StripeCheckout';

type View = 'home' | 'funding' | 'investor' | 'crm' | 'pricing' | 'outreach' | 'dashboard' | 'help-center';

interface PricingCardsProps {
  onPlanSelect?: (planId: string) => void;
  onPaymentSuccessNavigate?: (view: View) => void;
  user?: any;
}

export function PricingCards({ onPlanSelect, onPaymentSuccessNavigate, user }: PricingCardsProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const handlePlanSelect = (planId: string) => {
    const plan = PRICING_PLANS.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(planId);
      setShowCheckout(true);
      if (onPlanSelect) {
        onPlanSelect(planId);
      }
    }
  };

  const formatPrice = (cents: number) => {
    if (cents === 0) return 'FREE';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const selectedPlanData = PRICING_PLANS.find(p => p.id === selectedPlan);

  if (showCheckout && selectedPlanData) {
    return (
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 text-center">
          <button
            onClick={() => setShowCheckout(false)}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Plans
          </button>
        </div>
        <StripeCheckout
          planId={selectedPlanData.id}
          planName={selectedPlanData.name}
          price={selectedPlanData.price}
          priceId={selectedPlanData.priceId}
          user={user}
          onSuccess={(sessionId) => {
            console.log('Payment successful:', sessionId);
            if (onPlanSelect) {
              onPlanSelect(selectedPlanData.id);
            }
          }}
          onError={(error) => {
            console.error('Payment error:', error);
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
        <p className="text-xl text-gray-600">
          Select the perfect plan to accelerate your fundraising journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PRICING_PLANS.map((plan) => {
          const IconComponent = plan.id === 'self-employed' ? DollarSign : 
                               plan.id === 'entrepreneur' ? Zap : Star;
          
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 transition-all hover:shadow-xl ${
                plan.popular 
                  ? 'border-purple-500 transform scale-105' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                  plan.id === 'self-employed' ? 'bg-green-100' :
                  plan.id === 'entrepreneur' ? 'bg-purple-100' : 'bg-yellow-100'
                }`}>
                  <IconComponent className={`w-8 h-8 ${
                    plan.id === 'self-employed' ? 'text-green-600' :
                    plan.id === 'entrepreneur' ? 'text-purple-600' : 'text-yellow-600'
                  }`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(plan.price)}
                  </span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanSelect(plan.id)}
                disabled={plan.price === 0}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed ${
                  plan.popular
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.price === 0 ? 'Current Plan' : 'Choose Plan'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="font-semibold text-blue-900 mb-2">🔒 Secure Payment Processing</h3>
          <p className="text-blue-800 text-sm">
            All payments are processed securely through Stripe. Your payment information is encrypted 
            and never stored on our servers. Cancel anytime with no long-term commitments.
          </p>
        </div>
      </div>
    </div>
  );
}