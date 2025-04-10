
// Helper for MatchSetup component to ensure proper Team objects are created
export const createInitialTeam = (id: string, name: string) => {
  return {
    id,
    name,
    players: [],
    totalRuns: 0,
    totalWickets: 0,
    totalOvers: 0,
    runRate: 0,
  };
};
