import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import * as cricketService from '@/services/cricketService';

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
  createNewMatch: (matchDetails: Partial<Match>) => Promise<void>;
  addTeam: (team: Partial<Team>) => Promise<void>;
  addPlayer: (teamId: string, player: Partial<Player>) => Promise<void>;
  startMatch: () => Promise<void>;
  selectBattingTeam: (teamId: string) => void;
  selectBowlingTeam: (teamId: string) => void;
  selectStriker: (playerId: string) => void;
  selectNonStriker: (playerId: string) => void;
  selectBowler: (playerId: string) => void;
  addRuns: (runs: number) => Promise<void>;
  recordWide: () => Promise<void>;
  recordWicket: (dismissalType: DismissalType, newBatsman: string, dismissedBy?: string) => Promise<void>;
  switchBatsmen: () => void;
  switchInnings: () => Promise<void>;
  startNewOver: () => Promise<void>;
  undoLastAction: () => void;
  isSetupComplete: boolean;
  isLoading: boolean;
  isInningsSwitchDialogOpen: boolean;
  confirmSwitchInnings: (strikerId: string, nonStrikerId: string, bowlerId: string) => Promise<void>;
  cancelSwitchInnings: () => void;
}

const defaultContextValue: CricketContextType = {
  match: null,
  createNewMatch: async () => {},
  addTeam: async () => {},
  addPlayer: async () => {},
  startMatch: async () => {},
  selectBattingTeam: () => {},
  selectBowlingTeam: () => {},
  selectStriker: () => {},
  selectNonStriker: () => {},
  selectBowler: () => {},
  addRuns: async () => {},
  recordWide: async () => {},
  recordWicket: async () => {},
  switchBatsmen: () => {},
  switchInnings: async () => {},
  startNewOver: async () => {},
  undoLastAction: () => {},
  isSetupComplete: false,
  isLoading: false,
  isInningsSwitchDialogOpen: false,
  confirmSwitchInnings: async () => {},
  cancelSwitchInnings: () => {},
};

const CricketContext = createContext<CricketContextType>(defaultContextValue);

export const useCricket = () => useContext(CricketContext);

export const CricketProvider = ({ children }: { children: ReactNode }) => {
  const [match, setMatch] = useState<Match | null>(null);
  const [previousMatchStates, setPreviousMatchStates] = useState<Match[]>([]);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInningsSwitchDialogOpen, setIsInningsSwitchDialogOpen] = useState(false);
  const [pendingSwitchInnings, setPendingSwitchInnings] = useState(false);

  const createNewMatch = async (matchDetails: Partial<Match>) => {
    try {
      setIsLoading(true);
      
      const newMatchData = await cricketService.createMatch(
        matchDetails.teamA?.name || 'Team A',
        matchDetails.teamB?.name || 'Team B'
      );
      
      const teamA: Team = {
        id: 'team-a',
        name: matchDetails.teamA?.name || 'Team A',
        players: [],
        totalRuns: 0,
        totalWickets: 0,
        totalOvers: 0,
        runRate: 0,
      };
      
      const teamB: Team = {
        id: 'team-b',
        name: matchDetails.teamB?.name || 'Team B',
        players: [],
        totalRuns: 0,
        totalWickets: 0,
        totalOvers: 0,
        runRate: 0,
      };

      const newMatch: Match = {
        id: newMatchData.id,
        teamA,
        teamB,
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
    } catch (error) {
      console.error('Error creating match:', error);
      toast.error('Failed to create match');
    } finally {
      setIsLoading(false);
    }
  };

  const addTeam = async (team: Partial<Team>) => {
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

  const addPlayer = async (teamId: string, player: Partial<Player>) => {
    if (!match) return;
    
    try {
      setIsLoading(true);
      
      const teamName = teamId === 'team-a' ? match.teamA.name : match.teamB.name;
      
      const newPlayerData = await cricketService.addPlayer(
        match.id,
        teamName,
        player.name || 'Player',
        'batsman'
      );
      
      const newPlayer: Player = {
        id: newPlayerData.id,
        name: player.name || 'Player',
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
      
      toast.success(`Player ${player.name} added to ${teamName}`);
    } catch (error) {
      console.error('Error adding player:', error);
      toast.error('Failed to add player');
    } finally {
      setIsLoading(false);
    }
  };

  const startMatch = async () => {
    if (!match || !match.teamA.name || !match.teamB.name || 
        match.teamA.players.length < 2 || match.teamB.players.length < 2 ||
        !match.battingTeam || !match.bowlingTeam || 
        !match.striker || !match.nonStriker || !match.currentBowler) {
      toast.error('Match setup is incomplete. Please complete all required fields.');
      return;
    }

    try {
      setIsLoading(true);
      
      await cricketService.updateMatchDetails(match.id, {
        toss_winner: match.tossWinner,
        elected_to: match.tossChoice,
        batting_team: match.battingTeam,
        bowling_team: match.bowlingTeam
      });
      
      await cricketService.updateMatchState(match.id, {
        striker_id: match.striker.id,
        non_striker_id: match.nonStriker.id,
        current_bowler_id: match.currentBowler.id,
        current_over: 0,
        current_ball: 0,
        total_runs: 0,
        total_wickets: 0
      });
      
      setPreviousMatchStates([match]);
      
      setMatch((prev) => {
        if (!prev) return prev;
        return { ...prev, isMatchStarted: true };
      });
      
      setIsSetupComplete(true);
      toast.success('Match started!');
    } catch (error) {
      console.error('Error starting match:', error);
      toast.error('Failed to start match');
    } finally {
      setIsLoading(false);
    }
  };

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

  const addRuns = async (runs: number) => {
    if (!match || !match.striker || !match.currentBowler) return;

    setPreviousMatchStates([...previousMatchStates, match]);

    try {
      setIsLoading(true);
      
      setMatch((prev) => {
        if (!prev || !prev.striker || !prev.nonStriker || !prev.currentBowler) return prev;

        const updatedMatch = { ...prev };
        const battingTeamId = prev.battingTeam;
        const bowlingTeamId = prev.bowlingTeam;
        
        if (!battingTeamId || !bowlingTeamId) return prev;

        battingTeamId === 'team-a' ? { ...prev.teamA } : { ...prev.teamB };
        battingTeam.totalRuns += runs;
        
        const totalOvers = prev.currentOver + (prev.currentBall / 6);
        battingTeam.runRate = totalOvers > 0 ? +(battingTeam.totalRuns / totalOvers).toFixed(2) : 0;
        
        bowlingTeamId === 'team-a' ? { ...prev.teamA } : { ...prev.teamB };
        const bowlerIndex = bowlingTeam.players.findIndex(p => p.id === prev.currentBowler?.id);
        
        if (bowlerIndex !== -1) {
          const updatedBowler = { ...bowlingTeam.players[bowlerIndex] };
          updatedBowler.runsConceded += runs;
          
          const bowlerOvers = updatedBowler.overs + (prev.currentBall === 5 ? 1 : prev.currentBall / 6);
          updatedBowler.economyRate = bowlerOvers > 0 ? +(updatedBowler.runsConceded / bowlerOvers).toFixed(2) : 0;
          
          bowlingTeam.players[bowlerIndex] = updatedBowler;
          updatedMatch.currentBowler = updatedBowler;
        }
        
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
        
        let currentBall = prev.currentBall + 1;
        let currentOver = prev.currentOver;
        
        if (currentBall > 5) {
          currentBall = 0;
          currentOver += 1;
          
          if (bowlerIndex !== -1) {
            const updatedBowler = { ...bowlingTeam.players[bowlerIndex] };
            updatedBowler.overs += 1;
            bowlingTeam.players[bowlerIndex] = updatedBowler;
          }
          
          updatedMatch.striker = prev.nonStriker;
          updatedMatch.nonStriker = prev.striker;
        } else {
          if (runs % 2 === 1) {
            updatedMatch.striker = prev.nonStriker;
            updatedMatch.nonStriker = prev.striker;
          }
        }
        
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
      
      if (match && match.striker && match.currentBowler) {
        await cricketService.recordDelivery(match.id, {
          striker_id: match.striker.id,
          non_striker_id: match.nonStriker?.id,
          bowler_id: match.currentBowler.id,
          runs,
          is_boundary: runs === 4,
          is_six: runs === 6,
          is_wicket: false,
          ball_number: match.currentBall + 1,
          over_number: match.currentOver
        });
        
        await cricketService.updateBattingStats(match.striker.id, match.id, {
          runs_scored: match.striker.runs + runs,
          balls_faced: match.striker.ballsFaced + 1,
          fours: match.striker.fours + (runs === 4 ? 1 : 0),
          sixes: match.striker.sixes + (runs === 6 ? 1 : 0)
        });
        
        await cricketService.updateBowlingStats(match.currentBowler.id, match.id, {
          balls_bowled: match.currentBowler.overs * 6 + match.currentBall + 1,
          runs_conceded: match.currentBowler.runsConceded + runs
        });
        
        const battingTeam = match.battingTeam === 'team-a' ? match.teamA : match.teamB;
        const nextBall = match.currentBall + 1 > 5 ? 0 : match.currentBall + 1;
        const nextOver = match.currentBall + 1 > 5 ? match.currentOver + 1 : match.currentOver;
        
        let nextStriker = match.striker;
        let nextNonStriker = match.nonStriker;
        
        if (nextBall === 0) {
          nextStriker = match.nonStriker;
          nextNonStriker = match.striker;
        } else if (runs % 2 === 1) {
          nextStriker = match.nonStriker;
          nextNonStriker = match.striker;
        }
        
        await cricketService.updateMatchState(match.id, {
          striker_id: nextStriker?.id,
          non_striker_id: nextNonStriker?.id,
          current_bowler_id: match.currentBowler.id,
          total_runs: battingTeam.totalRuns + runs,
          current_over: nextOver,
          current_ball: nextBall
        });
      }
    } catch (error) {
      console.error('Error adding runs:', error);
      toast.error('Failed to update run information');
    } finally {
      setIsLoading(false);
    }
  };

  const recordWide = async () => {
    if (!match) return;

    setPreviousMatchStates([...previousMatchStates, match]);

    try {
      setIsLoading(true);
      
      setMatch((prev) => {
        if (!prev || !prev.currentBowler) return prev;

        const updatedMatch = { ...prev };
        const battingTeamId = prev.battingTeam;
        const bowlingTeamId = prev.bowlingTeam;
        
        if (!battingTeamId || !bowlingTeamId) return prev;

        battingTeamId === 'team-a' ? { ...prev.teamA } : { ...prev.teamB };
        battingTeam.totalRuns += 1;
        
        const totalOvers = prev.currentOver + (prev.currentBall / 6);
        battingTeam.runRate = totalOvers > 0 ? +(battingTeam.totalRuns / totalOvers).toFixed(2) : 0;
        
        bowlingTeamId === 'team-a' ? { ...prev.teamA } : { ...prev.teamB };
        const bowlerIndex = bowlingTeam.players.findIndex(p => p.id === prev.currentBowler?.id);
        
        if (bowlerIndex !== -1) {
          const updatedBowler = { ...bowlingTeam.players[bowlerIndex] };
          updatedBowler.runsConceded += 1;
          
          const bowlerOvers = updatedBowler.overs + (prev.currentBall / 6);
          updatedBowler.economyRate = bowlerOvers > 0 ? +(updatedBowler.runsConceded / bowlerOvers).toFixed(2) : 0;
          
          bowlingTeam.players[bowlerIndex] = updatedBowler;
          updatedMatch.currentBowler = updatedBowler;
        }
        
        if (battingTeamId === 'team-a') {
          updatedMatch.teamA = battingTeam;
          updatedMatch.teamB = bowlingTeam;
        } else {
          updatedMatch.teamA = bowlingTeam;
          updatedMatch.teamB = battingTeam;
        }
        
        return updatedMatch;
      });
      
      if (match && match.currentBowler) {
        await cricketService.recordDelivery(match.id, {
          striker_id: match.striker?.id,
          non_striker_id: match.nonStriker?.id,
          bowler_id: match.currentBowler.id,
          runs: 1,
          is_boundary: false,
          is_six: false,
          is_wicket: false,
          extra_type: 'wide',
          ball_number: match.currentBall,
          over_number: match.currentOver
        });
        
        await cricketService.updateBowlingStats(match.currentBowler.id, match.id, {
          runs_conceded: match.currentBowler.runsConceded + 1,
          wides: 1
        });
        
        const battingTeam = match.battingTeam === 'team-a' ? match.teamA : match.teamB;
        await cricketService.updateMatchState(match.id, {
          total_runs: battingTeam.totalRuns + 1
        });
      }
    } catch (error) {
      console.error('Error recording wide:', error);
      toast.error('Failed to record wide');
    } finally {
      setIsLoading(false);
    }
  };

  const recordWicket = async (dismissalType: DismissalType, newBatsmanId: string, dismissedBy?: string) => {
    if (!match || !match.striker) return;

    setPreviousMatchStates([...previousMatchStates, match]);

    try {
      setIsLoading(true);
      
      setMatch((prev) => {
        if (!prev || !prev.striker || !prev.currentBowler) return prev;

        const updatedMatch = { ...prev };
        const battingTeamId = prev.battingTeam;
        const bowlingTeamId = prev.bowlingTeam;
        
        if (!battingTeamId || !bowlingTeamId) return prev;

        battingTeamId === 'team-a' ? { ...prev.teamA } : { ...prev.teamB };
        battingTeam.totalWickets += 1;
        
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
        
        const strikerIndex = battingTeam.players.findIndex(p => p.id === prev.striker?.id);
        
        if (strikerIndex !== -1) {
          const updatedStriker = { ...battingTeam.players[strikerIndex] };
          updatedStriker.isOut = true;
          updatedStriker.dismissalType = dismissalType;
          updatedStriker.dismissedBy = dismissedBy;
          updatedStriker.ballsFaced += 1;
          
          battingTeam.players[strikerIndex] = updatedStriker;
        }
        
        const newBatsman = battingTeam.players.find(p => p.id === newBatsmanId);
        
        if (!newBatsman) {
          toast.error('Selected batsman not found!');
          return prev;
        }
        
        let currentBall = prev.currentBall + 1;
        let currentOver = prev.currentOver;
        
        if (currentBall > 5) {
          currentBall = 0;
          currentOver += 1;
          
          updatedMatch.striker = newBatsman;
        } else {
          updatedMatch.striker = newBatsman;
        }
        
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
      
      if (match && match.striker && match.currentBowler) {
        const nextBall = match.currentBall + 1 > 5 ? 0 : match.currentBall + 1;
        const nextOver = match.currentBall + 1 > 5 ? match.currentOver + 1 : match.currentOver;
        
        await cricketService.recordDelivery(match.id, {
          striker_id: match.striker.id,
          non_striker_id: match.nonStriker?.id,
          bowler_id: match.currentBowler.id,
          runs: 0,
          is_boundary: false,
          is_six: false,
          is_wicket: true,
          dismissal_type: dismissalType,
          ball_number: match.currentBall + 1,
          over_number: match.currentOver
        });
        
        await cricketService.updateBattingStats(match.striker.id, match.id, {
          balls_faced: match.striker.ballsFaced + 1,
          is_out: true,
          dismissal_type: dismissalType,
          bowler_id: dismissalType === 'Bowled' || dismissalType === 'LBW' ? match.currentBowler.id : undefined
        });
        
        if (['Bowled', 'LBW', 'Caught', 'Stumped'].includes(dismissalType)) {
          await cricketService.updateBowlingStats(match.currentBowler.id, match.id, {
            balls_bowled: match.currentBowler.overs * 6 + match.currentBall + 1,
            wickets: match.currentBowler.wickets + 1
          });
        }
        
        const battingTeam = match.battingTeam === 'team-a' ? match.teamA : match.teamB;
        await cricketService.updateMatchState(match.id, {
          striker_id: newBatsmanId,
          total_wickets: battingTeam.totalWickets + 1,
          current_over: nextOver,
          current_ball: nextBall
        });
      }
    } catch (error) {
      console.error('Error recording wicket:', error);
      toast.error('Failed to record wicket');
    } finally {
      setIsLoading(false);
    }
  };

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

  const switchInnings = async () => {
    if (!match) return;
    
    setIsInningsSwitchDialogOpen(true);
    setPendingSwitchInnings(true);
  };

  const confirmSwitchInnings = async (strikerId: string, nonStrikerId: string, bowlerId: string) => {
    if (!match || !pendingSwitchInnings) return;
    
    try {
      setIsLoading(true);
      
      setMatch((prev) => {
        if (!prev) return prev;

        const newBattingTeam = prev.bowlingTeam;
        const newBowlingTeam = prev.battingTeam;
        
        const newBattingTeamObj = newBattingTeam === 'team-a' ? prev.teamA : prev.teamB;
        const newBowlingTeamObj = newBowlingTeam === 'team-a' ? prev.teamA : prev.teamB;
        
        const striker = newBattingTeamObj.players.find(p => p.id === strikerId);
        const nonStriker = newBattingTeamObj.players.find(p => p.id === nonStrikerId);
        const bowler = newBowlingTeamObj.players.find(p => p.id === bowlerId);
        
        if (!striker || !nonStriker || !bowler) {
          toast.error('Player selection error');
          return prev;
        }
        
        const newMatch = {
          ...prev,
          battingTeam: newBattingTeam,
          bowlingTeam: newBowlingTeam,
          currentOver: 0,
          currentBall: 0,
          currentInnings: 2 as const,
          striker: striker,
          nonStriker: nonStriker,
          currentBowler: bowler
        };
        
        toast.success('Innings switched successfully');
        
        return newMatch;
      });
      
      setTimeout(async () => {
        if (match) {
          await cricketService.updateMatchState(match.id, {
            current_over: 0,
            current_ball: 0,
            total_runs: 0,
            total_wickets: 0,
            striker_id: strikerId,
            non_striker_id: nonStrikerId,
            current_bowler_id: bowlerId,
            batting_team: match.bowlingTeam,
            bowling_team: match.battingTeam
          });
        }
      }, 100);
      
      setPendingSwitchInnings(false);
      setIsInningsSwitchDialogOpen(false);
    } catch (error) {
      console.error('Error switching innings:', error);
      toast.error('Failed to switch innings');
      setPendingSwitchInnings(false);
      setIsInningsSwitchDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSwitchInnings = () => {
    setPendingSwitchInnings(false);
    setIsInningsSwitchDialogOpen(false);
  };

  const startNewOver = async () => {
    if (!match) return;
    
    toast.info('Starting new over');
  };

  const undoLastAction = () => {
    if (previousMatchStates.length === 0) {
      toast.info('Nothing to undo');
      return;
    }
    
    const previousState = previousMatchStates[previousMatchStates.length - 1];
    setMatch(previousState);
    setPreviousMatchStates(previousMatchStates.slice(0, -1));
    toast.info('Action undone');
  };

  return (
    <CricketContext.Provider value={{
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
      isLoading,
      isInningsSwitchDialogOpen,
      confirmSwitchInnings,
      cancelSwitchInnings
    }}>
      {children}
    </CricketContext.Provider>
  );
};

export default CricketProvider;
