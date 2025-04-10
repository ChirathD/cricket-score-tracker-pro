
import React from 'react';
import { useCricket } from '@/contexts/CricketContext';
import MatchSetup from '@/components/MatchSetup';
import Scoreboard from '@/components/Scoreboard';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { isSetupComplete, match, isLoading } = useCricket();
  
  return (
    <div className="min-h-screen bg-cricket-cream">
      <header className="bg-cricket-green text-white py-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-center">Cricket Score Tracker</h1>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4">
        {isLoading && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
              <Loader2 className="h-8 w-8 animate-spin text-cricket-green" />
              <p className="text-lg font-medium">Processing...</p>
            </div>
          </div>
        )}
        
        {!isSetupComplete ? (
          <MatchSetup />
        ) : (
          <Scoreboard />
        )}
      </main>
      
      <footer className="bg-cricket-navy text-white py-3 mt-8">
        <div className="container mx-auto text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Weekend Cricket Club</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
