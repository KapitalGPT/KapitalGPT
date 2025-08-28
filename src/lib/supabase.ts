// Simplified configuration for demo mode
export const supabase = null;
export const isDemoMode = true;

export interface Investor {
  id: string;
  name: string;
  type: 'individual' | 'vc' | 'angel' | 'pe' | 'family_office' | 'corporate';
  email?: string;
  website?: string;
  description?: string;
  investment_range_min: number;
  investment_range_max?: number;
  preferred_stages: string[];
  preferred_industries: string[];
  preferred_company_types: string[];
  geographic_focus: string[];
  portfolio_companies: string[];
  notable_investments?: string;
  investment_criteria?: string;
  response_time: string;
  last_active: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StartupSubmission {
  id: string;
  company_name: string;
  company_type: string;
  category: string;
  funding_required: number;
  investment_stage: string;
  business_description: string;
  country: string;
  state: string;
  city: string;
  email: string;
  matches_sent: boolean;
  created_at: string;
}

export interface InvestorMatch {
  id: string;
  submission_id: string;
  investor_id: string;
  match_score: number;
  match_reasons: string[];
  created_at: string;
  investor?: Investor;
}