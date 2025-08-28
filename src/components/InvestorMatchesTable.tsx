import React from 'react';
import { ExternalLink, Mail, Globe, TrendingUp, MapPin, Users, DollarSign } from 'lucide-react';
import type { InvestorMatch } from '../lib/supabase';

interface InvestorMatchesTableProps {
  matches: InvestorMatch[];
  companyName: string;
}

export function InvestorMatchesTable({ matches, companyName }: InvestorMatchesTableProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-blue-100 text-blue-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getInvestorTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'individual': 'Individual',
      'vc': 'Venture Capital',
      'angel': 'Angel Investor',
      'pe': 'Private Equity',
      'family_office': 'Family Office',
      'corporate': 'Corporate VC'
    };
    return types[type] || type;
  };

  if (matches.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Matches Found</h3>
        <p className="text-gray-600">
          We couldn't find any investors matching your criteria at this time. 
          Try adjusting your funding requirements or business category.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-8 py-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Investor Matches for {companyName}
        </h2>
        <p className="text-blue-100">
          Found {matches.length} potential investor{matches.length !== 1 ? 's' : ''} matching your criteria
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Investment Range & Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Industries
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Match Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Investor
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {matches.map((match, index) => (
              <tr key={match.id || index} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-1 text-sm text-gray-900">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span>
                      {formatCurrency(match.investor?.investment_range_min || 0)} - {' '}
                      {match.investor?.investment_range_max 
                        ? formatCurrency(match.investor.investment_range_max)
                        : 'No limit'
                      }
                    </span>
                  </div>
                  <div className="mt-1">
                    {match.investor?.preferred_stages && match.investor.preferred_stages.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {match.investor.preferred_stages.slice(0, 2).map((stage, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            {stage}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {match.investor?.preferred_industries && match.investor.preferred_industries.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {match.investor.preferred_industries.slice(0, 2).map((industry, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                            {industry}
                          </span>
                        ))}
                        {match.investor.preferred_industries.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{match.investor.preferred_industries.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {match.investor?.geographic_focus && match.investor.geographic_focus.length > 0 && (
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{match.investor.geographic_focus.slice(0, 2).join(', ')}</span>
                      {match.investor.geographic_focus.length > 2 && (
                        <span className="text-gray-500">+{match.investor.geographic_focus.length - 2}</span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMatchScoreColor(match.match_score || 0)}`}>
                    {match.match_score || 0}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  {match.investor?.email && (
                    <a
                      href={`mailto:${match.investor.email}?subject=Investment Opportunity - ${companyName}`}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Contact</span>
                    </a>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{match.investor?.name}</h3>
                        {match.investor?.website && (
                          <a
                            href={match.investor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {getInvestorTypeLabel(match.investor?.type || '')}
                      </p>
                      {match.investor?.description && (
                        <p className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                          {match.investor.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-8 py-4">
        <p className="text-sm text-gray-600">
          <strong>Pro Tip:</strong> Personalize your outreach by mentioning specific portfolio companies or investment themes that align with your startup.
        </p>
      </div>
    </div>
  );
}