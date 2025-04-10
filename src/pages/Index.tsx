
import React from 'react';
import { useCricket } from '@/contexts/CricketContext';
import MatchSetup from '@/components/MatchSetup';
import Scoreboard from '@/components/Scoreboard';

const Index = () => {
  const { isSetupComplete, match } = useCricket();
  
  return (
    <div className="min-h-screen bg-cricket-cream">
      <header className="bg-cricket-green text-white py-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-center">Cricket Score Tracker Pro</h1>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4">
        {!isSetupComplete ? (
          <MatchSetup />
        ) : (
          <Scoreboard />
        )}
      </main>
      
      <footer className="bg-cricket-navy text-white py-3 mt-8">
        <div className="container mx-auto text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Cricket Score Tracker Pro - Live Cricket Scoring</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
