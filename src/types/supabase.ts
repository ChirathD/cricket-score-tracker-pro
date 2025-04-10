
export interface Database {
  public: {
    Tables: {
      matches: {
        Row: {
          id: string;
          team_a: string;
          team_b: string;
          toss_winner: string | null;
          elected_to: 'bat' | 'bowl' | null;
          batting_team: string | null;
          bowling_team: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_a: string;
          team_b: string;
          toss_winner?: string | null;
          elected_to?: 'bat' | 'bowl' | null;
          batting_team?: string | null;
          bowling_team?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          team_a?: string;
          team_b?: string;
          toss_winner?: string | null;
          elected_to?: 'bat' | 'bowl' | null;
          batting_team?: string | null;
          bowling_team?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          match_id: string;
          team_name: string;
          name: string;
          role: 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper' | null;
          is_playing: boolean;
        };
        Insert: {
          id?: string;
          match_id: string;
          team_name: string;
          name: string;
          role?: 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper' | null;
          is_playing?: boolean;
        };
        Update: {
          id?: string;
          match_id?: string;
          team_name?: string;
          name?: string;
          role?: 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper' | null;
          is_playing?: boolean;
        };
      };
      batsman_stats: {
        Row: {
          id: string;
          player_id: string;
          match_id: string;
          runs_scored: number;
          balls_faced: number;
          fours: number;
          sixes: number;
          is_out: boolean;
          dismissal_type: string | null;
          bowler_id: string | null;
          batting_order: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          match_id: string;
          runs_scored?: number;
          balls_faced?: number;
          fours?: number;
          sixes?: number;
          is_out?: boolean;
          dismissal_type?: string | null;
          bowler_id?: string | null;
          batting_order?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          match_id?: string;
          runs_scored?: number;
          balls_faced?: number;
          fours?: number;
          sixes?: number;
          is_out?: boolean;
          dismissal_type?: string | null;
          bowler_id?: string | null;
          batting_order?: number | null;
          created_at?: string;
        };
      };
      bowler_stats: {
        Row: {
          id: string;
          player_id: string;
          match_id: string;
          balls_bowled: number;
          runs_conceded: number;
          wickets: number;
          wides: number;
          no_balls: number;
          overs: number;
        };
        Insert: {
          id?: string;
          player_id: string;
          match_id: string;
          balls_bowled?: number;
          runs_conceded?: number;
          wickets?: number;
          wides?: number;
          no_balls?: number;
        };
        Update: {
          id?: string;
          player_id?: string;
          match_id?: string;
          balls_bowled?: number;
          runs_conceded?: number;
          wickets?: number;
          wides?: number;
          no_balls?: number;
        };
      };
      deliveries: {
        Row: {
          id: string;
          match_id: string;
          striker_id: string | null;
          non_striker_id: string | null;
          bowler_id: string | null;
          runs: number;
          is_boundary: boolean;
          is_six: boolean;
          is_wicket: boolean;
          dismissal_type: string | null;
          extra_type: string | null;
          ball_number: number | null;
          over_number: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          striker_id?: string | null;
          non_striker_id?: string | null;
          bowler_id?: string | null;
          runs?: number;
          is_boundary?: boolean;
          is_six?: boolean;
          is_wicket?: boolean;
          dismissal_type?: string | null;
          extra_type?: string | null;
          ball_number?: number | null;
          over_number?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          striker_id?: string | null;
          non_striker_id?: string | null;
          bowler_id?: string | null;
          runs?: number;
          is_boundary?: boolean;
          is_six?: boolean;
          is_wicket?: boolean;
          dismissal_type?: string | null;
          extra_type?: string | null;
          ball_number?: number | null;
          over_number?: number | null;
          created_at?: string;
        };
      };
      match_state: {
        Row: {
          match_id: string;
          striker_id: string | null;
          non_striker_id: string | null;
          current_bowler_id: string | null;
          total_runs: number;
          total_wickets: number;
          current_over: number;
          current_ball: number;
          last_updated: string;
        };
        Insert: {
          match_id: string;
          striker_id?: string | null;
          non_striker_id?: string | null;
          current_bowler_id?: string | null;
          total_runs?: number;
          total_wickets?: number;
          current_over?: number;
          current_ball?: number;
          last_updated?: string;
        };
        Update: {
          match_id?: string;
          striker_id?: string | null;
          non_striker_id?: string | null;
          current_bowler_id?: string | null;
          total_runs?: number;
          total_wickets?: number;
          current_over?: number;
          current_ball?: number;
          last_updated?: string;
        };
      };
    };
  };
}
