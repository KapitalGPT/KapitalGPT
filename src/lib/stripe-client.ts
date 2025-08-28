import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_live_51Qi5zUE1f3uMNweGm5I6uX9kelbMdiyvjsqmkEcVb8XFUbmnnImc4emjqZE59k4Cet3CDM0Ddj1vXSoTXfKgMhZK00unfdI7Th');

export { stripePromise };

export const STRIPE_PRICES = { 
  SELF_EMPLOYED: 'price_1Ry8uJE1f3uMNweGPcQkLASi',
  ENTREPRENEUR: 'price_1Ry9huE1f3uMNweGNsoCcMAw',
  MOGUL: 'price_1Ry8uJE1f3uMNweGPcQkLASi',
};

export const PRICING_PLANS = [
  {
    id: 'self-employed',
    name: 'Self Employed',
    price: 0,
    priceId: null,
    description: 'Daily Pay as you Go',
    features: [
      '100 Daily AI Text Phone Messages',
      '60 Minutes of AI Cold Calling',
      'Estimated 40 AI Cold Calls',
      '1 Daily Investor Match',
      'Investor CRM + Calendar Integration',
      'AI Customer Support',
      'Twilio + HubSpot Integration',
      'WhatsApp + Facebook Integration'
    ],
    popular: false,
  },
  {
    id: 'entrepreneur',
    name: 'Entrepreneur',
    price: 9900,
    priceId: STRIPE_PRICES.ENTREPRENEUR,
    description: 'Paid Weekly',
    features: [
      '2,000 AI Text Phone Messages',
      '480 Minutes of AI Cold Calling',
      'Estimated 360 AI Calls',
      '50 Weekly Investor Matches',
      'Investor CRM + Calendar Integration',
      'Human Customer Support',
      'Twilio + HubSpot Integration',
      'WhatsApp + Facebook Integration'
    ],
    popular: true,
  },
  {
    id: 'mogul',
    name: 'Mogul',
    price: 19900,
    priceId: STRIPE_PRICES.MOGUL,
    description: 'Paid Weekly',
    features: [
      '4,000 AI Text Phone Messages',
      '960 Minutes of AI Cold Calling',
      'Estimated 720 AI Calls',
      '100 Weekly Investor Matches',
      'Investor CRM + Calendar Integration',
      'Human Customer Support',
      'Twilio + HubSpot Integration',
      'WhatsApp + Facebook Integration'
    ],
    popular: false,
  },
];