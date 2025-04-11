import React, { useState } from 'react';
import { useCricket, DismissalType } from '@/contexts/CricketContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import InningsSwitchDialog from './InningsSwitchDialog';

const dismissalTypes: DismissalType[] = [
  'Bowled', 
  'Caught', 
  'LBW', 
  'Run Out', 
  'Stumped', 
  'Hit Wicket', 
  'Retired Hurt'
];

const Scoreboard = () => {
  const { 
    match, 
    addRuns, 
    recordWide, 
    recordWicket, 
    switchBatsmen, 
    switchInnings, 
    startNewOver, 
    undoLastAction,
    selectBowler,
    isInningsSwitchDialogOpen,
    confirmSwitchInnings,
    cancelSwitchInnings
  } = useCricket();

  const [isWicketDialogOpen, setIsWicketDialogOpen] = useState(false);
  const [dismissalType, setDismissalType] = useState<DismissalType>('Bowled');
  const [newBatsmanId, setNewBatsmanId] = useState('');
  const [dismissedBy, setDismissedBy] = useState('');
  const [isNewOverDialogOpen, setIsNewOverDialogOpen] = useState(false);
  const [newBowlerId, setNewBowlerId] = useState('');
  const [activeTab, setActiveTab] = useState('scoreboard');

  const handleRunsButtonClick = (runs: number) => {
    // Check if this will be the 6th (last) ball of the over
    const isLastBallOfCurrentOver = match && match.currentBall === 5;
    
    // Add runs first
    addRuns(runs);
    
    // Now check if we just completed an over
    if (isLastBallOfCurrentOver) {
      // Small delay to ensure the context has updated
      setTimeout(() => {
        openNewOverDialog();
      }, 100);
    }
  };

  const handleWideButtonClick = () => {
    recordWide();
    // No need to check over completion for wides as they don't count as a ball
  };

  const openWicketDialog = () => {
    if (!match) return;
    
    setIsWicketDialogOpen(true);
    
    // Default to first available batsman
    const battingTeam = match.battingTeam === 'team-a' ? match.teamA : match.teamB;
    const availableBatsmen = battingTeam.players.filter(
      p => !p.isOut && p.id !== match.striker?.id && p.id !== match.nonStriker?.id
    );
    
    if (availableBatsmen.length > 0) {
      setNewBatsmanId(availableBatsmen[0].id);
    } else {
      toast.error('No available batsmen left');
    }
  };

  const handleWicketConfirm = () => {
    if (!newBatsmanId) {
      toast.error('Please select new batsman');
      return;
    }

    // Check if this will be the 6th (last) ball of the over
    const isLastBallOfCurrentOver = match && match.currentBall === 5;
    
    recordWicket(dismissalType, newBatsmanId, dismissedBy);
    setIsWicketDialogOpen(false);
    
    // Now check if we just completed an over
    if (isLastBallOfCurrentOver) {
      // Small delay to ensure the context has updated
      setTimeout(() => {
        openNewOverDialog();
      }, 100);
    }
  };

  const openNewOverDialog = () => {
    if (!match) return;
    
    setIsNewOverDialogOpen(true);
    
    // Default to first available bowler
    const bowlingTeam = match.bowlingTeam === 'team-a' ? match.teamA : match.teamB;
    const availableBowlers = bowlingTeam.players.filter(
      p => p.id !== match.currentBowler?.id
    );
    
    if (availableBowlers.length > 0) {
      setNewBowlerId(availableBowlers[0].id);
    }
  };

  const handleNewOverConfirm = () => {
    if (!newBowlerId) {
      toast.error('Please select new bowler');
      return;
    }

    startNewOver();
    selectBowler(newBowlerId);
    setIsNewOverDialogOpen(false);
  };

  if (!match || !match.isMatchStarted) {
    return <div className="text-center p-10">Loading match...</div>;
  }

  const battingTeam = match.battingTeam === 'team-a' ? match.teamA : match.teamB;
  const bowlingTeam = match.bowlingTeam === 'team-a' ? match.teamA : match.teamB;
  // Six balls per over (indices 0-5)
  const isLastBallOfOver = match.currentBall === 5;
  // This is now only used for the manual button display
  const overCompleted = isLastBallOfOver;

  const formatOvers = (overs: number, balls: number) => {
    return `${overs}.${balls}`;
  };

  const hasTeam1Completed = match.currentInnings === 2;
  const team1 = hasTeam1Completed ? (match.battingTeam === 'team-a' ? match.teamB : match.teamA) : null;

  const newBattingTeam = match.bowlingTeam === 'team-a' ? match.teamA : match.teamB;
  const newBowlingTeam = match.battingTeam === 'team-a' ? match.teamA : match.teamB;

  return (
    <div className="container mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid grid-cols-4">
          <TabsTrigger value="scoreboard">Scoreboard</TabsTrigger>
          <TabsTrigger value="batting">Batting Card</TabsTrigger>
          <TabsTrigger value="bowling">Bowling Card</TabsTrigger>
          <TabsTrigger value="summary">Match Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scoreboard">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-white shadow-md">
              <CardHeader className="bg-cricket-green text-white">
                <CardTitle className="text-xl font-bold">
                  {battingTeam.name} - {battingTeam.totalRuns}/{battingTeam.totalWickets}
                </CardTitle>
                <div className="text-sm">
                  Overs: {formatOvers(match.currentOver, match.currentBall)} | 
                  RR: {battingTeam.runRate?.toFixed(2) || '0.00'}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">Striker</div>
                    <div className="font-bold">{match.striker?.name || 'N/A'} *</div>
                    <div className="text-sm">
                      {match.striker?.runs || 0} ({match.striker?.ballsFaced || 0})
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">Non-Striker</div>
                    <div className="font-bold">{match.nonStriker?.name || 'N/A'}</div>
                    <div className="text-sm">
                      {match.nonStriker?.runs || 0} ({match.nonStriker?.ballsFaced || 0})
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Bowler</div>
                  <div className="font-bold">{match.currentBowler?.name || 'N/A'}</div>
                  <div className="text-sm">
                    {match.currentBowler?.wickets || 0}-{match.currentBowler?.runsConceded || 0} 
                    ({match.currentBowler?.overs || 0}.{match.currentBall})
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-6 gap-1 mb-4">
                  {[0, 1, 2, 3, 4, 5].map((ball) => (
                    <div 
                      key={ball} 
                      className={`col-span-1 text-center p-2 rounded-md border 
                        ${match.currentBall > ball ? 'bg-cricket-green text-white' : 'bg-gray-100'}`}
                    >
                      {ball + 1}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-md">
              <CardHeader className="bg-cricket-navy text-white">
                <CardTitle className="text-xl font-bold">Scoring Controls</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <Button
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={() => handleRunsButtonClick(0)}
                  >
                    0
                  </Button>
                  <Button
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={() => handleRunsButtonClick(1)}
                  >
                    1
                  </Button>
                  <Button
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={() => handleRunsButtonClick(2)}
                  >
                    2
                  </Button>
                  <Button
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={() => handleRunsButtonClick(3)}
                  >
                    3
                  </Button>
                  <Button
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={() => handleRunsButtonClick(4)}
                  >
                    4
                  </Button>
                  <Button
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={() => handleRunsButtonClick(6)}
                  >
                    6
                  </Button>
                  <Button
                    className="bg-amber-500 hover:bg-amber-600"
                    onClick={handleWideButtonClick}
                  >
                    Wide
                  </Button>
                  <Button
                    className="bg-cricket-red hover:bg-red-700 text-white"
                    onClick={openWicketDialog}
                  >
                    Wicket
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button
                    variant="outline"
                    onClick={switchBatsmen}
                  >
                    Switch Batsmen
                  </Button>
                  <Button
                    variant="outline"
                    onClick={undoLastAction}
                  >
                    Undo
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {overCompleted && (
                    <Button
                      className="bg-cricket-green hover:bg-cricket-navy text-white"
                      onClick={openNewOverDialog}
                    >
                      Start New Over
                    </Button>
                  )}
                  
                  {battingTeam.totalWickets === 10 || match.currentInnings === 1 && (
                    <Button
                      className="bg-cricket-navy hover:bg-cricket-green text-white"
                      onClick={switchInnings}
                    >
                      Switch Innings
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="batting">
          <Card className="bg-white shadow-md">
            <CardHeader className="bg-cricket-green text-white">
              <CardTitle className="text-xl font-bold">
                {battingTeam.name} - Batting Scorecard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2">Batter</th>
                      <th className="text-right p-2">Runs</th>
                      <th className="text-right p-2">Balls</th>
                      <th className="text-right p-2">4s</th>
                      <th className="text-right p-2">6s</th>
                      <th className="text-right p-2">SR</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {battingTeam.players.map((player) => (
                      <tr key={player.id} className={`border-b ${(match.striker?.id === player.id || match.nonStriker?.id === player.id) ? 'bg-cricket-cream' : ''}`}>
                        <td className="text-left p-2 font-medium">
                          {player.name} {match.striker?.id === player.id ? '*' : match.nonStriker?.id === player.id ? '' : ''}
                        </td>
                        <td className="text-right p-2">{player.runs}</td>
                        <td className="text-right p-2">{player.ballsFaced}</td>
                        <td className="text-right p-2">{player.fours}</td>
                        <td className="text-right p-2">{player.sixes}</td>
                        <td className="text-right p-2">{player.strikeRate?.toFixed(2) || '0.00'}</td>
                        <td className="text-left p-2 text-xs">
                          {player.isOut ? player.dismissalType : 'Not Out'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-semibold">
                      <td className="text-left p-2">Total</td>
                      <td className="text-right p-2">{battingTeam.totalRuns}</td>
                      <td className="text-right p-2" colSpan={4}>{formatOvers(match.currentOver, match.currentBall)} Overs</td>
                      <td className="text-left p-2">{battingTeam.totalWickets} wickets</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bowling">
          <Card className="bg-white shadow-md">
            <CardHeader className="bg-cricket-navy text-white">
              <CardTitle className="text-xl font-bold">
                {bowlingTeam.name} - Bowling Figures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2">Bowler</th>
                      <th className="text-right p-2">Overs</th>
                      <th className="text-right p-2">Maidens</th>
                      <th className="text-right p-2">Runs</th>
                      <th className="text-right p-2">Wickets</th>
                      <th className="text-right p-2">Economy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bowlingTeam.players
                      .filter(player => player.overs > 0 || player.id === match.currentBowler?.id)
                      .map((player) => (
                        <tr key={player.id} className={`border-b ${match.currentBowler?.id === player.id ? 'bg-cricket-cream' : ''}`}>
                          <td className="text-left p-2 font-medium">
                            {player.name} {match.currentBowler?.id === player.id ? '*' : ''}
                          </td>
                          <td className="text-right p-2">
                            {player.overs}{player.id === match.currentBowler?.id ? '.' + match.currentBall : ''}
                          </td>
                          <td className="text-right p-2">{player.maidens}</td>
                          <td className="text-right p-2">{player.runsConceded}</td>
                          <td className="text-right p-2">{player.wickets}</td>
                          <td className="text-right p-2">{player.economyRate?.toFixed(2) || '0.00'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="summary">
          <Card className="bg-white shadow-md">
            <CardHeader className="bg-cricket-green text-white">
              <CardTitle className="text-xl font-bold">
                Match Summary - Match #{match.id}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Match Details</h3>
                <p className="text-sm mb-1">Toss won by: {match.tossWinner === 'team-a' ? match.teamA.name : match.teamB.name}</p>
                <p className="text-sm mb-1">Elected to: {match.tossChoice}</p>
                <p className="text-sm mb-4">Current Innings: {match.currentInnings}</p>
              </div>
              
              {hasTeam1Completed && team1 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{team1.name} - First Innings</h3>
                  <div className="bg-cricket-cream p-3 rounded-md">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Total Score</TableCell>
                          <TableCell>{team1.totalRuns}/{team1.totalWickets}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Overs</TableCell>
                          <TableCell>{team1.totalOvers.toFixed(1)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Run Rate</TableCell>
                          <TableCell>{team1.runRate?.toFixed(2) || '0.00'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">{battingTeam.name} - {match.currentInnings === 1 ? 'First' : 'Second'} Innings</h3>
                <div className="bg-cricket-cream p-3 rounded-md">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Total Score</TableCell>
                        <TableCell>{battingTeam.totalRuns}/{battingTeam.totalWickets}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Overs</TableCell>
                        <TableCell>{formatOvers(match.currentOver, match.currentBall)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Run Rate</TableCell>
                        <TableCell>{battingTeam.runRate?.toFixed(2) || '0.00'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {hasTeam1Completed && team1 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Required to Win</h3>
                  <div className="bg-cricket-cream p-3 rounded-md">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Runs</TableCell>
                          <TableCell>{team1.totalRuns + 1 - battingTeam.totalRuns}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Required Run Rate</TableCell>
                          <TableCell>
                            {(((team1.totalRuns + 1 - battingTeam.totalRuns) / 
                            Math.max(0.1, (20 - match.currentOver - (match.currentBall/6)))).toFixed(2))}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Wicket Dialog */}
      <Dialog open={isWicketDialogOpen} onOpenChange={setIsWicketDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wicket Details</DialogTitle>
            <DialogDescription>
              Select the type of dismissal and the new batsman.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Dismissal Type</Label>
              <RadioGroup 
                value={dismissalType} 
                onValueChange={(value) => setDismissalType(value as DismissalType)} 
                className="grid grid-cols-2 gap-2"
              >
                {dismissalTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type} id={`dismissal-${type}`} />
                    <Label htmlFor={`dismissal-${type}`}>{type}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            {(dismissalType === 'Caught' || dismissalType === 'Run Out' || dismissalType === 'Stumped') && (
              <div className="space-y-2">
                <Label htmlFor="dismissedBy">Dismissed By</Label>
                <Select 
                  value={dismissedBy} 
                  onValueChange={setDismissedBy}
                >
                  <SelectTrigger id="dismissedBy">
                    <SelectValue placeholder="Select fielder" />
                  </SelectTrigger>
                  <SelectContent>
                    {bowlingTeam.players.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="newBatsman">New Batsman</Label>
              <Select 
                value={newBatsmanId} 
                onValueChange={setNewBatsmanId}
              >
                <SelectTrigger id="newBatsman">
                  <SelectValue placeholder="Select new batsman" />
                </SelectTrigger>
                <SelectContent>
                  {battingTeam.players
                    .filter(p => !p.isOut && p.id !== match.striker?.id && p.id !== match.nonStriker?.id)
                    .map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWicketDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleWicketConfirm}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Over Dialog */}
      <Dialog open={isNewOverDialogOpen} onOpenChange={setIsNewOverDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Over</DialogTitle>
            <DialogDescription>
              Select bowler for the new over.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newBowler">Bowler</Label>
              <Select 
                value={newBowlerId} 
                onValueChange={setNewBowlerId}
              >
                <SelectTrigger id="newBowler">
                  <SelectValue placeholder="Select bowler" />
                </SelectTrigger>
                <SelectContent>
                  {bowlingTeam.players.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOverDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleNewOverConfirm}>
              Start Over
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Innings Switch Dialog */}
      <InningsSwitchDialog 
        isOpen={isInningsSwitchDialogOpen}
        onClose={cancelSwitchInnings}
        onConfirm={confirmSwitchInnings}
        battingTeam={newBattingTeam}
        bowlingTeam={newBowlingTeam}
      />
    </div>
  );
};

export default Scoreboard;
