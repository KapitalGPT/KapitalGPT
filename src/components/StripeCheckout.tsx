import React, { useState } from 'react';
import { stripePromise } from '../lib/stripe-client';
import { Loader, CreditCard, Shield, Zap } from 'lucide-react';

interface StripeCheckoutProps {
  planId: string;
  planName: string;
  price: number;
  priceId: string | null;
  user?: any;
  onSuccess?: (sessionId: string) => void;
  onError?: (error: string) => void;
}

export function StripeCheckout({ planId, planName, price, priceId, user, onSuccess, onError }: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    email: user?.email || '',
    name: '',
    company: '',
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!priceId) {
      // Handle free plan
      if (onSuccess) {
        onSuccess('free-plan');
      }
      return;
    }

    setIsLoading(true);

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user?.id || 'anonymous',
          customerEmail: customerInfo.email || user?.email,
          customerName: customerInfo.name,
          planId,
          planName,
          company: customerInfo.company,
          metadata: {
            planId,
            planName,
            company: customerInfo.company,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Checkout error:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : 'Checkout failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscribe to {planName}</h2>
        <p className="text-3xl font-bold text-purple-600 mb-1">
          {price === 0 ? 'FREE' : formatPrice(price)}
        </p>
        {price > 0 && <p className="text-gray-600">per month</p>}
      </div>

      <form onSubmit={handleCheckout} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={customerInfo.email}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
            disabled={!!user?.email}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="your@email.com"
          />
          {user?.email && (
            <p className="text-xs text-gray-500 mt-1">Using your account email</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={customerInfo.name}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            value={customerInfo.company}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, company: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Your Company"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Secure Payment</span>
          </div>
          <p className="text-xs text-blue-800">
            Your payment information is encrypted and secure. Powered by Stripe.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              <span>{price === 0 ? 'Get Started Free' : 'Subscribe Now'}</span>
            </>
          )}
        </button>

        {price > 0 && (
          <p className="text-xs text-gray-500 text-center">
            You can cancel anytime. No long-term commitments.
          </p>
        )}
      </form>
    </div>
  );
}