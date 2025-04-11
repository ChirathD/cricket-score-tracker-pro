
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Player, Team } from '@/contexts/CricketContext';

interface InningsSwitchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (strikerId: string, nonStrikerId: string, bowlerId: string) => void;
  battingTeam: Team;
  bowlingTeam: Team;
}

const InningsSwitchDialog: React.FC<InningsSwitchDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  battingTeam,
  bowlingTeam
}) => {
  const [strikerId, setStrikerId] = useState<string>('');
  const [nonStrikerId, setNonStrikerId] = useState<string>('');
  const [bowlerId, setBowlerId] = useState<string>('');

  // Set initial values when dialog opens or teams change
  useEffect(() => {
    if (isOpen && battingTeam && battingTeam.players.length >= 2) {
      setStrikerId(battingTeam.players[0].id);
      setNonStrikerId(battingTeam.players[1].id);
    }
    if (isOpen && bowlingTeam && bowlingTeam.players.length >= 1) {
      setBowlerId(bowlingTeam.players[0].id);
    }
  }, [isOpen, battingTeam, bowlingTeam]);

  const handleConfirm = () => {
    if (!strikerId || !nonStrikerId || !bowlerId) {
      return;
    }
    onConfirm(strikerId, nonStrikerId, bowlerId);
  };

  // Filter available batsmen - non-striker can't be the same as striker
  const availableNonStrikers = battingTeam?.players.filter(
    player => player.id !== strikerId
  ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Switch Innings</DialogTitle>
          <DialogDescription>
            Select the striker, non-striker, and bowler for the new innings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="striker">Striker</Label>
            <Select 
              value={strikerId} 
              onValueChange={setStrikerId}
            >
              <SelectTrigger id="striker">
                <SelectValue placeholder="Select striker" />
              </SelectTrigger>
              <SelectContent>
                {battingTeam?.players.map((player: Player) => (
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
              value={nonStrikerId} 
              onValueChange={setNonStrikerId}
            >
              <SelectTrigger id="nonStriker">
                <SelectValue placeholder="Select non-striker" />
              </SelectTrigger>
              <SelectContent>
                {availableNonStrikers.map((player: Player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bowler">Bowler</Label>
            <Select 
              value={bowlerId} 
              onValueChange={setBowlerId}
            >
              <SelectTrigger id="bowler">
                <SelectValue placeholder="Select bowler" />
              </SelectTrigger>
              <SelectContent>
                {bowlingTeam?.players.map((player: Player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Start New Innings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InningsSwitchDialog;
