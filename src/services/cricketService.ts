
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { DismissalType, Player, Team } from '@/contexts/CricketContext';

// Match operations
export const createMatch = async (teamA: string, teamB: string) => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .insert({
        team_a: teamA,
        team_b: teamB,
        status: 'ongoing'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    toast.error(`Failed to create match: ${error.message}`);
    throw error;
  }
};

export const updateMatchDetails = async (
  matchId: string,
  details: {
    toss_winner?: string;
    elected_to?: 'bat' | 'bowl';
    batting_team?: string;
    bowling_team?: string;
    status?: string;
  }
) => {
  try {
    const { error } = await supabase
      .from('matches')
      .update(details)
      .eq('id', matchId);
    
    if (error) throw error;
  } catch (error: any) {
    toast.error(`Failed to update match: ${error.message}`);
    throw error;
  }
};

// Player operations
export const addPlayer = async (
  matchId: string,
  teamName: string,
  playerName: string,
  role: 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper'
) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .insert({
        match_id: matchId,
        team_name: teamName,
        name: playerName,
        role: role
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Initialize batting and bowling stats
    await supabase.from('batsman_stats').insert({
      player_id: data.id,
      match_id: matchId
    });
    
    await supabase.from('bowler_stats').insert({
      player_id: data.id,
      match_id: matchId
    });
    
    return data;
  } catch (error: any) {
    toast.error(`Failed to add player: ${error.message}`);
    throw error;
  }
};

export const getPlayers = async (matchId: string, teamName: string) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select(`
        id,
        name,
        role,
        is_playing,
        batsman_stats!inner(
          runs_scored,
          balls_faced,
          fours,
          sixes,
          is_out,
          dismissal_type
        ),
        bowler_stats!inner(
          balls_bowled,
          runs_conceded,
          wickets,
          wides,
          no_balls,
          overs
        )
      `)
      .eq('match_id', matchId)
      .eq('team_name', teamName)
      .eq('is_playing', true);
    
    if (error) throw error;
    
    return data.map(player => ({
      id: player.id,
      name: player.name,
      runs: player.batsman_stats[0].runs_scored,
      ballsFaced: player.batsman_stats[0].balls_faced,
      fours: player.batsman_stats[0].fours,
      sixes: player.batsman_stats[0].sixes,
      isOut: player.batsman_stats[0].is_out,
      dismissalType: player.batsman_stats[0].dismissal_type as DismissalType || 'Not Out',
      strikeRate: player.batsman_stats[0].balls_faced > 0 
        ? +(player.batsman_stats[0].runs_scored / player.batsman_stats[0].balls_faced * 100).toFixed(2)
        : 0,
      overs: Math.floor(player.bowler_stats[0].balls_bowled / 6),
      runsConceded: player.bowler_stats[0].runs_conceded,
      wickets: player.bowler_stats[0].wickets,
      economyRate: player.bowler_stats[0].balls_bowled > 0
        ? +(player.bowler_stats[0].runs_conceded / (player.bowler_stats[0].balls_bowled / 6)).toFixed(2)
        : 0,
      maidens: 0, // This would need additional logic or a separate field
      dismissedBy: undefined
    }));
  } catch (error: any) {
    toast.error(`Failed to get players: ${error.message}`);
    return [];
  }
};

// Batting operations
export const updateBattingStats = async (
  playerId: string,
  matchId: string,
  stats: {
    runs_scored?: number;
    balls_faced?: number;
    fours?: number;
    sixes?: number;
    is_out?: boolean;
    dismissal_type?: string;
    bowler_id?: string;
  }
) => {
  try {
    const { error } = await supabase
      .from('batsman_stats')
      .update(stats)
      .eq('player_id', playerId)
      .eq('match_id', matchId);
    
    if (error) throw error;
  } catch (error: any) {
    toast.error(`Failed to update batting stats: ${error.message}`);
    throw error;
  }
};

// Bowling operations
export const updateBowlingStats = async (
  playerId: string,
  matchId: string,
  stats: {
    balls_bowled?: number;
    runs_conceded?: number;
    wickets?: number;
    wides?: number;
    no_balls?: number;
  }
) => {
  try {
    const { error } = await supabase
      .from('bowler_stats')
      .update(stats)
      .eq('player_id', playerId)
      .eq('match_id', matchId);
    
    if (error) throw error;
  } catch (error: any) {
    toast.error(`Failed to update bowling stats: ${error.message}`);
    throw error;
  }
};

// Delivery operations
export const recordDelivery = async (
  matchId: string,
  delivery: {
    striker_id?: string;
    non_striker_id?: string;
    bowler_id?: string;
    runs: number;
    is_boundary: boolean;
    is_six: boolean;
    is_wicket: boolean;
    dismissal_type?: string;
    extra_type?: string;
    ball_number: number;
    over_number: number;
  }
) => {
  try {
    const { error } = await supabase
      .from('deliveries')
      .insert({
        match_id: matchId,
        ...delivery
      });
    
    if (error) throw error;
  } catch (error: any) {
    toast.error(`Failed to record delivery: ${error.message}`);
    throw error;
  }
};

// Match state operations
export const updateMatchState = async (
  matchId: string,
  state: {
    striker_id?: string;
    non_striker_id?: string;
    current_bowler_id?: string;
    total_runs?: number;
    total_wickets?: number;
    current_over?: number;
    current_ball?: number;
  }
) => {
  try {
    // Check if match state exists
    const { data: existingState } = await supabase
      .from('match_state')
      .select('match_id')
      .eq('match_id', matchId)
      .single();
    
    if (existingState) {
      // Update existing state
      const { error } = await supabase
        .from('match_state')
        .update({
          ...state,
          last_updated: new Date().toISOString()
        })
        .eq('match_id', matchId);
      
      if (error) throw error;
    } else {
      // Insert new state
      const { error } = await supabase
        .from('match_state')
        .insert({
          match_id: matchId,
          ...state,
          last_updated: new Date().toISOString()
        });
      
      if (error) throw error;
    }
  } catch (error: any) {
    toast.error(`Failed to update match state: ${error.message}`);
    throw error;
  }
};

export const getMatchState = async (matchId: string) => {
  try {
    const { data, error } = await supabase
      .from('match_state')
      .select('*')
      .eq('match_id', matchId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    toast.error(`Failed to get match state: ${error.message}`);
    return null;
  }
};

// Utility function to convert database team to our app's Team type
export const convertToTeam = async (matchId: string, teamName: string): Promise<Team> => {
  const players = await getPlayers(matchId, teamName);
  const matchState = await getMatchState(matchId);
  
  // Calculate team stats
  const totalRuns = matchState?.total_runs || 0;
  const totalWickets = matchState?.total_wickets || 0;
  const totalOvers = matchState?.current_over || 0;
  const runRate = totalOvers > 0 ? +(totalRuns / totalOvers).toFixed(2) : 0;
  
  return {
    id: teamName === 'team-a' ? 'team-a' : 'team-b',
    name: teamName,
    players: players,
    totalRuns,
    totalWickets,
    totalOvers,
    runRate,
  };
};
