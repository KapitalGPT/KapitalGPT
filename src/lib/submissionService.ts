import { supabase, isDemoMode } from './supabase';
import { InvestorMatchingService } from './investorMatching';
import type { StartupSubmission } from './supabase';

export class SubmissionService {
  static async submitStartup(formData: {
    companyName: string;
    companyType: string;
    category: string;
    fundingRequired: string;
    investmentStage: string;
    businessDescription: string;
    country: string;
    state: string;
    city: string;
    email: string;
    userId?: string;
  }): Promise<{ success: boolean; submissionId?: string; error?: string }> {
    try {
      // Demo mode - simulate successful submission
      if (isDemoMode || !supabase) {
        console.log('Demo mode: Simulating form submission', formData);
        
        const mockSubmissionId = 'demo-' + Date.now();
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          success: true,
          submissionId: mockSubmissionId
        };
      }

      // Real Supabase implementation would go here
      throw new Error('Supabase not configured');
    } catch (error) {
      console.error('Error submitting startup:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async getSubmissionWithMatches(submissionId: string) {
    try {
      // Demo mode - return mock data
      if (isDemoMode || !supabase) {
        return {
          submission: {
            id: submissionId,
            company_name: 'Demo Company',
            company_type: 'LLC',
            category: 'Technology',
            funding_required: 1000000,
            investment_stage: 'seed',
            business_description: 'Demo business description',
            country: 'United States',
            state: 'California',
            city: 'San Francisco',
            email: 'demo@example.com',
            matches_sent: true,
            created_at: new Date().toISOString()
          },
          matches: await InvestorMatchingService.getMatches(submissionId),
          matchCount: 2
        };
      }

      // Real Supabase implementation would go here
      throw new Error('Supabase not configured');
    } catch (error) {
      console.error('Error fetching submission:', error);
      return null;
    }
  }
}