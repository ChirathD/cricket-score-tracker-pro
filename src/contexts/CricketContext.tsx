
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

export type DismissalType = 'Bowled' | 'Caught' | 'LBW' | 'Run Out' | 'Stumped' | 'Hit Wicket' | 'Retired Hurt' | 'Not Out';

export interface Player {
  id: string;
  name: string;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  dismissalType: DismissalType;
  dismissedBy?: string;
  strikeRate: number;
  overs: number;
  runsConceded: number;
  wickets: number;
  economyRate: number;
  maidens: number;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  totalRuns: number;
  totalWickets: number;
  totalOvers: number;
  runRate: number;
}

export interface Match {
  id: string;
  teamA: Team;
  teamB: Team;
  battingTeam: string;
  bowlingTeam: string;
  tossWinner: string;
  tossChoice: 'bat' | 'bowl';
  striker?: Player;
  nonStriker?: Player;
  currentBowler?: Player;
  currentOver: number;
  currentBall: number;
  currentInnings: 1 | 2;
  isMatchStarted: boolean;
  isMatchCompleted: boolean;
}

interface CricketContextType {
  match: Match | null;
  createNewMatch: (matchDetails: Partial<Match>) => void;
  addTeam: (team: Partial<Team>) => void;
  addPlayer: (teamId: string, player: Partial<Player>) => void;
  startMatch: () => void;
  selectBattingTeam: (teamId: string) => void;
  selectBowlingTeam: (teamId: string) => void;
  selectStriker: (playerId: string) => void;
  selectNonStriker: (playerId: string) => void;
  selectBowler: (playerId: string) => void;
  addRuns: (runs: number) => void;
  recordWide: () => void;
  recordWicket: (dismissalType: DismissalType, newBatsman: string, dismissedBy?: string) => void;
  switchBatsmen: () => void;
  switchInnings: () => void;
  startNewOver: () => void;
  undoLastAction: () => void;
  isSetupComplete: boolean;
}

const defaultContextValue: CricketContextType = {
  match: null,
  createNewMatch: () => {},
  addTeam: () => {},
  addPlayer: () => {},
  startMatch: () => {},
  selectBattingTeam: () => {},
  selectBowlingTeam: () => {},
  selectStriker: () => {},
  selectNonStriker: () => {},
  selectBowler: () => {},
  addRuns: () => {},
  recordWide: () => {},
  recordWicket: () => {},
  switchBatsmen: () => {},
  switchInnings: () => {},
  startNewOver: () => {},
  undoLastAction: () => {},
  isSetupComplete: false,
};

const CricketContext = createContext<CricketContextType>(defaultContextValue);

export const useCricket = () => useContext(CricketContext);

export const CricketProvider = ({ children }: { children: ReactNode }) => {
  const [match, setMatch] = useState<Match | null>(null);
  const [previousMatchStates, setPreviousMatchStates] = useState<Match[]>([]);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  // Create a new match
  const createNewMatch = (matchDetails: Partial<Match>) => {
    const newMatch: Match = {
      id: Date.now().toString(),
      teamA: {
        id: 'team-a',
        name: '',
        players: [],
        totalRuns: 0,
        totalWickets: 0,
        totalOvers: 0,
        runRate: 0,
      },
      teamB: {
        id: 'team-b',
        name: '',
        players: [],
        totalRuns: 0,
        totalWickets: 0,
        totalOvers: 0,
        runRate: 0,
      },
      battingTeam: '',
      bowlingTeam: '',
      tossWinner: '',
      tossChoice: 'bat',
      currentOver: 0,
      currentBall: 0,
      currentInnings: 1,
      isMatchStarted: false,
      isMatchCompleted: false,
      ...matchDetails,
    };

    setMatch(newMatch);
    toast.success('New match created!');
  };

  // Add or update a team
  const addTeam = (team: Partial<Team>) => {
    if (!match) return;

    setMatch((prev) => {
      if (!prev) return prev;

      const updatedMatch = { ...prev };
      
      if (team.id === 'team-a') {
        updatedMatch.teamA = { ...updatedMatch.teamA, ...team };
      } else if (team.id === 'team-b') {
        updatedMatch.teamB = { ...updatedMatch.teamB, ...team };
      }

      return updatedMatch;
    });
  };

  // Add a player to a team
  const addPlayer = (teamId: string, player: Partial<Player>) => {
    if (!match) return;

    const newPlayer: Player = {
      id: Date.now().toString(),
      name: '',
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      isOut: false,
      dismissalType: 'Not Out',
      strikeRate: 0,
      overs: 0,
      runsConceded: 0,
      wickets: 0,
      economyRate: 0,
      maidens: 0,
      ...player,
    };

    setMatch((prev) => {
      if (!prev) return prev;

      const updatedMatch = { ...prev };
      
      if (teamId === 'team-a') {
        updatedMatch.teamA.players = [...updatedMatch.teamA.players, newPlayer];
      } else if (teamId === 'team-b') {
        updatedMatch.teamB.players = [...updatedMatch.teamB.players, newPlayer];
      }

      return updatedMatch;
    });
  };

  // Start the match
  const startMatch = () => {
    if (!match || !match.teamA.name || !match.teamB.name || 
        match.teamA.players.length < 2 || match.teamB.players.length < 2 ||
        !match.battingTeam || !match.bowlingTeam || 
        !match.striker || !match.nonStriker || !match.currentBowler) {
      toast.error('Match setup is incomplete. Please complete all required fields.');
      return;
    }

    setPreviousMatchStates([match]);
    
    setMatch((prev) => {
      if (!prev) return prev;
      return { ...prev, isMatchStarted: true };
    });
    
    setIsSetupComplete(true);
    toast.success('Match started!');
  };

  // Select batting team
  const selectBattingTeam = (teamId: string) => {
    if (!match) return;

    setMatch((prev) => {
      if (!prev) return prev;

      const bowlingTeamId = teamId === 'team-a' ? 'team-b' : 'team-a';
      
      return { 
        ...prev, 
        battingTeam: teamId,
        bowlingTeam: bowlingTeamId
      };
    });
  };

  // Select bowling team
  const selectBowlingTeam = (teamId: string) => {
    if (!match) return;

    setMatch((prev) => {
      if (!prev) return prev;

      const battingTeamId = teamId === 'team-a' ? 'team-b' : 'team-a';
      
      return { 
        ...prev, 
        battingTeam: battingTeamId,
        bowlingTeam: teamId
      };
    });
  };

  // Select a striker
  const selectStriker = (playerId: string) => {
    if (!match) return;

    setMatch((prev) => {
      if (!prev) return prev;

      const battingTeam = prev.battingTeam === 'team-a' ? prev.teamA : prev.teamB;
      const striker = battingTeam.players.find(p => p.id === playerId);

      if (!striker) return prev;

      return { ...prev, striker };
    });
  };

  // Select a non-striker
  const selectNonStriker = (playerId: string) => {
    if (!match) return;

    setMatch((prev) => {
      if (!prev) return prev;

      const battingTeam = prev.battingTeam === 'team-a' ? prev.teamA : prev.teamB;
      const nonStriker = battingTeam.players.find(p => p.id === playerId);

      if (!nonStriker) return prev;

      return { ...prev, nonStriker };
    });
  };

  // Select a bowler
  const selectBowler = (playerId: string) => {
    if (!match) return;

    setMatch((prev) => {
      if (!prev) return prev;

      const bowlingTeam = prev.bowlingTeam === 'team-a' ? prev.teamA : prev.teamB;
      const bowler = bowlingTeam.players.find(p => p.id === playerId);

      if (!bowler) return prev;

      return { ...prev, currentBowler: bowler };
    });
  };

  // Add runs scored
  const addRuns = (runs: number) => {
    if (!match || !match.striker || !match.currentBowler) return;

    // Save current state for undo
    setPreviousMatchStates([...previousMatchStates, match]);

    setMatch((prev) => {
      if (!prev || !prev.striker || !prev.nonStriker || !prev.currentBowler) return prev;

      const updatedMatch = { ...prev };
      const battingTeamId = prev.battingTeam;
      const bowlingTeamId = prev.bowlingTeam;
      
      if (!battingTeamId || !bowlingTeamId) return prev;

      // Update batting team
      const battingTeam = battingTeamId === 'team-a' ? { ...prev.teamA } : { ...prev.teamB };
      battingTeam.totalRuns += runs;
      
      // Calculate run rate
      const totalOvers = prev.currentOver + (prev.currentBall / 6);
      battingTeam.runRate = totalOvers > 0 ? +(battingTeam.totalRuns / totalOvers).toFixed(2) : 0;
      
      // Update bowler
      const bowlingTeam = bowlingTeamId === 'team-a' ? { ...prev.teamA } : { ...prev.teamB };
      const bowlerIndex = bowlingTeam.players.findIndex(p => p.id === prev.currentBowler?.id);
      
      if (bowlerIndex !== -1) {
        const updatedBowler = { ...bowlingTeam.players[bowlerIndex] };
        updatedBowler.runsConceded += runs;
        
        // Calculate economy rate
        const bowlerOvers = updatedBowler.overs + (prev.currentBall === 5 ? 1 : prev.currentBall / 6);
        updatedBowler.economyRate = bowlerOvers > 0 ? +(updatedBowler.runsConceded / bowlerOvers).toFixed(2) : 0;
        
        bowlingTeam.players[bowlerIndex] = updatedBowler;
        updatedMatch.currentBowler = updatedBowler;
      }
      
      // Update striker
      const strikerIndex = battingTeam.players.findIndex(p => p.id === prev.striker?.id);
      
      if (strikerIndex !== -1) {
        const updatedStriker = { ...battingTeam.players[strikerIndex] };
        updatedStriker.runs += runs;
        updatedStriker.ballsFaced += 1;
        
        if (runs === 4) updatedStriker.fours += 1;
        if (runs === 6) updatedStriker.sixes += 1;
        
        updatedStriker.strikeRate = +(updatedStriker.runs / updatedStriker.ballsFaced * 100).toFixed(2);
        
        battingTeam.players[strikerIndex] = updatedStriker;
        updatedMatch.striker = updatedStriker;
      }
      
      // Update ball count
      let currentBall = prev.currentBall + 1;
      let currentOver = prev.currentOver;
      
      if (currentBall > 5) { // Over completed (0-5 index, so 6 balls)
        currentBall = 0;
        currentOver += 1;
        
        // Bowler completed an over
        if (bowlerIndex !== -1) {
          const updatedBowler = { ...bowlingTeam.players[bowlerIndex] };
          updatedBowler.overs += 1;
          bowlingTeam.players[bowlerIndex] = updatedBowler;
        }
        
        // Switch batsmen at end of over
        updatedMatch.striker = prev.nonStriker;
        updatedMatch.nonStriker = prev.striker;
      } else {
        // Switch batsmen for odd runs
        if (runs % 2 === 1) {
          updatedMatch.striker = prev.nonStriker;
          updatedMatch.nonStriker = prev.striker;
        }
      }
      
      // Update teams in match object
      if (battingTeamId === 'team-a') {
        updatedMatch.teamA = battingTeam;
        updatedMatch.teamB = bowlingTeam;
      } else {
        updatedMatch.teamA = bowlingTeam;
        updatedMatch.teamB = battingTeam;
      }
      
      updatedMatch.currentBall = currentBall;
      updatedMatch.currentOver = currentOver;
      
      return updatedMatch;
    });
  };

  // Record a wide
  const recordWide = () => {
    if (!match) return;

    // Save current state for undo
    setPreviousMatchStates([...previousMatchStates, match]);

    setMatch((prev) => {
      if (!prev || !prev.currentBowler) return prev;

      const updatedMatch = { ...prev };
      const battingTeamId = prev.battingTeam;
      const bowlingTeamId = prev.bowlingTeam;
      
      if (!battingTeamId || !bowlingTeamId) return prev;

      // Update batting team (wide adds 1 run)
      const battingTeam = battingTeamId === 'team-a' ? { ...prev.teamA } : { ...prev.teamB };
      battingTeam.totalRuns += 1;
      
      // Calculate run rate
      const totalOvers = prev.currentOver + (prev.currentBall / 6);
      battingTeam.runRate = totalOvers > 0 ? +(battingTeam.totalRuns / totalOvers).toFixed(2) : 0;
      
      // Update bowler (wide adds 1 run to bowler's conceded runs)
      const bowlingTeam = bowlingTeamId === 'team-a' ? { ...prev.teamA } : { ...prev.teamB };
      const bowlerIndex = bowlingTeam.players.findIndex(p => p.id === prev.currentBowler?.id);
      
      if (bowlerIndex !== -1) {
        const updatedBowler = { ...bowlingTeam.players[bowlerIndex] };
        updatedBowler.runsConceded += 1;
        
        // Calculate economy rate
        const bowlerOvers = updatedBowler.overs + (prev.currentBall / 6);
        updatedBowler.economyRate = bowlerOvers > 0 ? +(updatedBowler.runsConceded / bowlerOvers).toFixed(2) : 0;
        
        bowlingTeam.players[bowlerIndex] = updatedBowler;
        updatedMatch.currentBowler = updatedBowler;
      }
      
      // Update teams in match object
      if (battingTeamId === 'team-a') {
        updatedMatch.teamA = battingTeam;
        updatedMatch.teamB = bowlingTeam;
      } else {
        updatedMatch.teamA = bowlingTeam;
        updatedMatch.teamB = battingTeam;
      }
      
      // Note: Ball count doesn't increment for wides
      
      return updatedMatch;
    });
  };

  // Record a wicket
  const recordWicket = (dismissalType: DismissalType, newBatsmanId: string, dismissedBy?: string) => {
    if (!match || !match.striker) return;

    // Save current state for undo
    setPreviousMatchStates([...previousMatchStates, match]);

    setMatch((prev) => {
      if (!prev || !prev.striker || !prev.currentBowler) return prev;

      const updatedMatch = { ...prev };
      const battingTeamId = prev.battingTeam;
      const bowlingTeamId = prev.bowlingTeam;
      
      if (!battingTeamId || !bowlingTeamId) return prev;

      // Update batting team
      const battingTeam = battingTeamId === 'team-a' ? { ...prev.teamA } : { ...prev.teamB };
      battingTeam.totalWickets += 1;
      
      // Update bowler (increment wickets for dismissal types credited to bowler)
      const isBowlerWicket = ['Bowled', 'LBW', 'Caught', 'Stumped'].includes(dismissalType);
      const bowlingTeam = bowlingTeamId === 'team-a' ? { ...prev.teamA } : { ...prev.teamB };
      
      if (isBowlerWicket && prev.currentBowler) {
        const bowlerIndex = bowlingTeam.players.findIndex(p => p.id === prev.currentBowler?.id);
        
        if (bowlerIndex !== -1) {
          const updatedBowler = { ...bowlingTeam.players[bowlerIndex] };
          updatedBowler.wickets += 1;
          bowlingTeam.players[bowlerIndex] = updatedBowler;
          updatedMatch.currentBowler = updatedBowler;
        }
      }
      
      // Update striker (mark as out)
      const strikerIndex = battingTeam.players.findIndex(p => p.id === prev.striker?.id);
      
      if (strikerIndex !== -1) {
        const updatedStriker = { ...battingTeam.players[strikerIndex] };
        updatedStriker.isOut = true;
        updatedStriker.dismissalType = dismissalType;
        updatedStriker.dismissedBy = dismissedBy;
        updatedStriker.ballsFaced += 1; // Increment balls faced
        
        battingTeam.players[strikerIndex] = updatedStriker;
      }
      
      // Find new batsman
      const newBatsman = battingTeam.players.find(p => p.id === newBatsmanId);
      
      if (!newBatsman) {
        toast.error('Selected batsman not found!');
        return prev;
      }
      
      // Update ball count
      let currentBall = prev.currentBall + 1;
      let currentOver = prev.currentOver;
      
      if (currentBall > 5) { // Over completed (6 balls, 0-5 index)
        currentBall = 0;
        currentOver += 1;
        
        // Switch non-striker to strike
        updatedMatch.striker = newBatsman;
        // Non-striker remains the same at the end of the over
      } else {
        // New batsman comes in at striker's end
        updatedMatch.striker = newBatsman;
        // Non-striker remains the same
      }
      
      // Update teams in match object
      if (battingTeamId === 'team-a') {
        updatedMatch.teamA = battingTeam;
        updatedMatch.teamB = bowlingTeam;
      } else {
        updatedMatch.teamA = bowlingTeam;
        updatedMatch.teamB = battingTeam;
      }
      
      updatedMatch.currentBall = currentBall;
      updatedMatch.currentOver = currentOver;
      
      return updatedMatch;
    });
  };

  // Switch batsmen
  const switchBatsmen = () => {
    if (!match || !match.striker || !match.nonStriker) return;

    setMatch((prev) => {
      if (!prev || !prev.striker || !prev.nonStriker) return prev;

      return {
        ...prev,
        striker: prev.nonStriker,
        nonStriker: prev.striker
      };
    });
  };

  // Switch innings
  const switchInnings = () => {
    if (!match) return;

    setMatch((prev) => {
      if (!prev) return prev;

      // Swap batting and bowling teams
      const newBattingTeam = prev.bowlingTeam;
      const newBowlingTeam = prev.battingTeam;
      
      // Reset ball and over count
      const newMatch = {
        ...prev,
        battingTeam: newBattingTeam,
        bowlingTeam: newBowlingTeam,
        currentOver: 0,
        currentBall: 0,
        currentInnings: 2 as const,
        striker: undefined,
        nonStriker: undefined,
        currentBowler: undefined
      };
      
      return newMatch;
    });
  };

  // Start a new over
  const startNewOver = () => {
    if (!match) return;

    setMatch((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        currentBall: 0,
        currentOver: prev.currentOver + 1,
        striker: prev.nonStriker,
        nonStriker: prev.striker,
        currentBowler: undefined // Require selecting a new bowler
      };
    });
  };

  // Undo last action
  const undoLastAction = () => {
    if (previousMatchStates.length === 0) {
      toast.error('No actions to undo');
      return;
    }

    const lastState = previousMatchStates.pop();
    if (lastState) {
      setMatch(lastState);
      setPreviousMatchStates([...previousMatchStates]);
      toast.success('Last action undone');
    }
  };

  const value = {
    match,
    createNewMatch,
    addTeam,
    addPlayer,
    startMatch,
    selectBattingTeam,
    selectBowlingTeam,
    selectStriker,
    selectNonStriker,
    selectBowler,
    addRuns,
    recordWide,
    recordWicket,
    switchBatsmen,
    switchInnings,
    startNewOver,
    undoLastAction,
    isSetupComplete,
  };

  return (
    <CricketContext.Provider value={value}>
      {children}
    </CricketContext.Provider>
  );
};
