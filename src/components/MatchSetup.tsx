
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCricket } from '@/contexts/CricketContext';
import { toast } from 'sonner';
import { createInitialTeam } from './MatchSetupHelper';

const MatchSetup = () => {
  const { 
    createNewMatch, 
    addTeam, 
    addPlayer, 
    selectBattingTeam,
    selectBowlingTeam,
    selectStriker,
    selectNonStriker,
    selectBowler,
    startMatch,
    match
  } = useCricket();

  const [tab, setTab] = useState("teams");
  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");
  const [tossWinner, setTossWinner] = useState("");
  const [tossChoice, setTossChoice] = useState<"bat" | "bowl">("bat");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [selectedTeamForPlayer, setSelectedTeamForPlayer] = useState("team-a");

  const handleCreateMatch = () => {
    if (!teamAName || !teamBName) {
      toast.error("Please enter names for both teams");
      return;
    }

    createNewMatch({
      teamA: createInitialTeam('team-a', teamAName),
      teamB: createInitialTeam('team-b', teamBName),
      tossWinner,
      tossChoice
    });

    setTab("players");
  };

  const handleAddPlayer = () => {
    if (!newPlayerName) {
      toast.error("Please enter player name");
      return;
    }

    addPlayer(selectedTeamForPlayer, { name: newPlayerName });
    setNewPlayerName("");
  };

  const handleSelectBattingTeam = (teamId: string) => {
    selectBattingTeam(teamId);
    
    // Auto-select bowling team (the other team)
    const bowlingTeamId = teamId === 'team-a' ? 'team-b' : 'team-a';
    selectBowlingTeam(bowlingTeamId);
  };

  const handleStartMatch = () => {
    if (!match?.battingTeam || !match?.bowlingTeam) {
      toast.error("Please select batting and bowling teams");
      return;
    }

    if (!match.striker || !match.nonStriker) {
      toast.error("Please select striker and non-striker batsmen");
      return;
    }

    if (!match.currentBowler) {
      toast.error("Please select current bowler");
      return;
    }

    startMatch();
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="bg-cricket-green text-white">
            <CardTitle className="text-2xl">Cricket Match Setup</CardTitle>
            <CardDescription className="text-cricket-cream">Complete all steps to start the match</CardDescription>
          </CardHeader>
          
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-3 m-4">
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="players">Players</TabsTrigger>
              <TabsTrigger value="selectPlaying11">Match Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="teams">
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamA">Team A Name</Label>
                  <Input 
                    id="teamA" 
                    placeholder="Enter Team A name" 
                    value={teamAName} 
                    onChange={(e) => setTeamAName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="teamB">Team B Name</Label>
                  <Input 
                    id="teamB" 
                    placeholder="Enter Team B name" 
                    value={teamBName} 
                    onChange={(e) => setTeamBName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Toss Winner</Label>
                  <RadioGroup 
                    value={tossWinner} 
                    onValueChange={setTossWinner} 
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="team-a" id="teamA-toss" />
                      <Label htmlFor="teamA-toss">{teamAName || "Team A"}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="team-b" id="teamB-toss" />
                      <Label htmlFor="teamB-toss">{teamBName || "Team B"}</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {tossWinner && (
                  <div className="space-y-2">
                    <Label>Chose to</Label>
                    <RadioGroup 
                      value={tossChoice} 
                      onValueChange={(value) => setTossChoice(value as "bat" | "bowl")} 
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bat" id="bat-choice" />
                        <Label htmlFor="bat-choice">Bat</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bowl" id="bowl-choice" />
                        <Label htmlFor="bowl-choice">Bowl</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="bg-cricket-green hover:bg-cricket-navy text-white" 
                  onClick={handleCreateMatch}
                >
                  Save & Continue
                </Button>
              </CardFooter>
            </TabsContent>
            
            <TabsContent value="players">
              <CardContent className="space-y-4">
                {match && (
                  <>
                    <div className="space-y-2">
                      <Label>Add Player To</Label>
                      <RadioGroup 
                        value={selectedTeamForPlayer} 
                        onValueChange={setSelectedTeamForPlayer} 
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="team-a" id="teamA-player" />
                          <Label htmlFor="teamA-player">{match.teamA.name}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="team-b" id="teamB-player" />
                          <Label htmlFor="teamB-player">{match.teamB.name}</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Enter player name" 
                        value={newPlayerName} 
                        onChange={(e) => setNewPlayerName(e.target.value)}
                      />
                      <Button 
                        className="bg-cricket-green hover:bg-cricket-navy text-white" 
                        onClick={handleAddPlayer}
                      >
                        Add
                      </Button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2">{match.teamA.name} Players:</h3>
                        <ul className="bg-cricket-cream rounded-md p-2 space-y-1">
                          {match.teamA.players.map((player, index) => (
                            <li key={player.id} className="py-1 px-2 border-b">
                              {index + 1}. {player.name}
                            </li>
                          ))}
                          {match.teamA.players.length === 0 && (
                            <li className="py-1 px-2 text-gray-500">No players added</li>
                          )}
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-2">{match.teamB.name} Players:</h3>
                        <ul className="bg-cricket-cream rounded-md p-2 space-y-1">
                          {match.teamB.players.map((player, index) => (
                            <li key={player.id} className="py-1 px-2 border-b">
                              {index + 1}. {player.name}
                            </li>
                          ))}
                          {match.teamB.players.length === 0 && (
                            <li className="py-1 px-2 text-gray-500">No players added</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              
              <CardFooter>
                {match && match.teamA.players.length >= 2 && match.teamB.players.length >= 2 ? (
                  <Button 
                    className="bg-cricket-green hover:bg-cricket-navy text-white" 
                    onClick={() => setTab("selectPlaying11")}
                  >
                    Continue to Match Settings
                  </Button>
                ) : (
                  <Button disabled>
                    Add at least 2 players to each team
                  </Button>
                )}
              </CardFooter>
            </TabsContent>
            
            <TabsContent value="selectPlaying11">
              <CardContent className="space-y-4">
                {match && (
                  <>
                    <div className="space-y-2">
                      <Label>Batting Team</Label>
                      <RadioGroup 
                        value={match.battingTeam} 
                        onValueChange={handleSelectBattingTeam} 
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="team-a" id="teamA-batting" />
                          <Label htmlFor="teamA-batting">{match.teamA.name}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="team-b" id="teamB-batting" />
                          <Label htmlFor="teamB-batting">{match.teamB.name}</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {match.battingTeam && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="striker">Striker</Label>
                          <Select 
                            onValueChange={(value) => selectStriker(value)}
                            value={match.striker?.id}
                          >
                            <SelectTrigger id="striker">
                              <SelectValue placeholder="Select striker" />
                            </SelectTrigger>
                            <SelectContent>
                              {(match.battingTeam === 'team-a' ? match.teamA.players : match.teamB.players)
                                .map((player) => (
                                  <SelectItem key={player.id} value={player.id}>
                                    {player.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="nonStriker">Non-Striker</Label>
                          <Select 
                            onValueChange={(value) => selectNonStriker(value)}
                            value={match.nonStriker?.id}
                          >
                            <SelectTrigger id="nonStriker">
                              <SelectValue placeholder="Select non-striker" />
                            </SelectTrigger>
                            <SelectContent>
                              {(match.battingTeam === 'team-a' ? match.teamA.players : match.teamB.players)
                                .filter(player => player.id !== match.striker?.id)
                                .map((player) => (
                                  <SelectItem key={player.id} value={player.id}>
                                    {player.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                    
                    {match.bowlingTeam && (
                      <div className="space-y-2">
                        <Label htmlFor="bowler">Bowler</Label>
                        <Select 
                          onValueChange={(value) => selectBowler(value)}
                          value={match.currentBowler?.id}
                        >
                          <SelectTrigger id="bowler">
                            <SelectValue placeholder="Select bowler" />
                          </SelectTrigger>
                          <SelectContent>
                            {(match.bowlingTeam === 'team-a' ? match.teamA.players : match.teamB.players)
                              .map((player) => (
                                <SelectItem key={player.id} value={player.id}>
                                  {player.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="bg-cricket-green hover:bg-cricket-navy text-white" 
                  onClick={handleStartMatch}
                >
                  Start Match
                </Button>
              </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default MatchSetup;
