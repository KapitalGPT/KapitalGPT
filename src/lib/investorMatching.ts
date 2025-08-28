import type { StartupSubmission, Investor, InvestorMatch } from './supabase';

// Mock investor data for demo purposes
const MOCK_INVESTORS: Investor[] = [
  {
    id: 'demo-investor-1',
    name: 'Demo Venture Capital',
    type: 'vc',
    email: 'contact@demovc.com',
    website: 'https://demovc.com',
    description: 'Leading venture capital firm focused on early-stage technology companies',
    investment_range_min: 500000,
    investment_range_max: 5000000,
    preferred_stages: ['seed', 'series-a'],
    preferred_industries: ['Technology', 'Healthcare'],
    preferred_company_types: ['LLC', 'C Corporation'],
    geographic_focus: ['United States', 'Canada'],
    portfolio_companies: ['TechCorp', 'HealthStart', 'DataFlow'],
    notable_investments: 'Invested in 50+ startups with 12 successful exits',
    investment_criteria: 'Strong team, scalable business model, large market opportunity',
    response_time: 'within_week',
    last_active: new Date().toISOString(),
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-investor-2',
    name: 'Angel Investor Network',
    type: 'angel',
    email: 'angels@network.com',
    website: 'https://angelnetwork.com',
    description: 'Network of experienced angel investors supporting innovative startups',
    investment_range_min: 250000,
    investment_range_max: 2000000,
    preferred_stages: ['pre-seed', 'seed'],
    preferred_industries: ['Technology', 'E-commerce'],
    preferred_company_types: ['LLC', 'C Corporation'],
    geographic_focus: ['United States'],
    portfolio_companies: ['StartupA', 'CompanyB', 'VentureC'],
    notable_investments: 'Active in 30+ investments across various sectors',
    investment_criteria: 'Experienced founders, proven traction, clear path to profitability',
    response_time: 'within_2weeks',
    last_active: new Date().toISOString(),
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export class InvestorMatchingService {
  static async findMatches(submission: StartupSubmission): Promise<InvestorMatch[]> {
    // Simulate matching algorithm
    const matches: InvestorMatch[] = [];
    
    for (const investor of MOCK_INVESTORS) {
      const score = this.calculateMatchScore(submission, investor);
      if (score > 50) { // Only include matches above 50%
        matches.push({
          id: `match-${submission.id}-${investor.id}`,
          submission_id: submission.id,
          investor_id: investor.id,
          match_score: score,
          match_reasons: this.getMatchReasons(submission, investor),
          created_at: new Date().toISOString(),
          investor
        });
      }
    }
    
    return matches.sort((a, b) => b.match_score - a.match_score);
  }

  static async saveMatches(matches: InvestorMatch[]): Promise<void> {
    // In demo mode, just log the matches
    console.log('Saving matches:', matches);
  }

  static async getMatches(submissionId: string): Promise<InvestorMatch[]> {
    // Return mock matches for demo
    return MOCK_INVESTORS.map((investor, index) => ({
      id: `match-${submissionId}-${investor.id}`,
      submission_id: submissionId,
      investor_id: investor.id,
      match_score: 85 - (index * 7),
      match_reasons: ['Industry match', 'Stage alignment', 'Geographic focus'],
      created_at: new Date().toISOString(),
      investor
    }));
  }

  private static calculateMatchScore(submission: StartupSubmission, investor: Investor): number {
    let score = 0;
    let factors = 0;

    // Industry match (30% weight)
    if (investor.preferred_industries.includes(submission.category)) {
      score += 30;
    }
    factors++;

    // Stage match (25% weight)
    if (investor.preferred_stages.includes(submission.investment_stage)) {
      score += 25;
    }
    factors++;

    // Company type match (15% weight)
    if (investor.preferred_company_types.includes(submission.company_type)) {
      score += 15;
    }
    factors++;

    // Funding range match (20% weight)
    if (submission.funding_required >= investor.investment_range_min &&
        (!investor.investment_range_max || submission.funding_required <= investor.investment_range_max)) {
      score += 20;
    }
    factors++;

    // Geographic match (10% weight)
    if (investor.geographic_focus.includes(submission.country) || 
        investor.geographic_focus.includes('Global')) {
      score += 10;
    }
    factors++;

    return Math.min(100, score);
  }

  private static getMatchReasons(submission: StartupSubmission, investor: Investor): string[] {
    const reasons: string[] = [];

    if (investor.preferred_industries.includes(submission.category)) {
      reasons.push('Industry match');
    }

    if (investor.preferred_stages.includes(submission.investment_stage)) {
      reasons.push('Stage alignment');
    }

    if (investor.preferred_company_types.includes(submission.company_type)) {
      reasons.push('Company type preference');
    }

    if (submission.funding_required >= investor.investment_range_min &&
        (!investor.investment_range_max || submission.funding_required <= investor.investment_range_max)) {
      reasons.push('Funding range match');
    }

    if (investor.geographic_focus.includes(submission.country) || 
        investor.geographic_focus.includes('Global')) {
      reasons.push('Geographic focus');
    }

    return reasons;
  }
}