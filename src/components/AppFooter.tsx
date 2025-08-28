import React from 'react';
import { TrendingUp } from 'lucide-react';

type View = 'home' | 'funding' | 'loan' | 'investor' | 'crm' | 'results' | 'pricing' | 'outreach' | 'dashboard' | 'discord' | 'help-center';

interface AppFooterProps {
  onNavigate: (view: View) => void;
}

export function AppFooter({ onNavigate }: AppFooterProps) {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">KapitalGPT</span>
            </div>
            <p className="text-gray-400">
              Automate your Path to Funding
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">RESOURCES</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a 
                  href="https://discord.gg/55azs6F2" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors"
                >
                  Discord Community
                </a>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('help-center')} 
                  className="hover:text-white transition-colors"
                >
                  Help Center
                </button>
              </li>
              <li>
                <a 
                  href="/Terms and Conditions (_Terms_) Kapitalgpt.pdf" 
                  download
                  className="hover:text-white transition-colors"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a 
                  href="/KapitalGPT Privacy Policy (1).pdf" 
                  download
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">CONTACT</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a 
                  href="mailto:Help@SmartEngineersGroup.com" 
                  className="hover:text-white transition-colors"
                >
                  Help@SmartEngineersGroup.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 KapitalGPT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}