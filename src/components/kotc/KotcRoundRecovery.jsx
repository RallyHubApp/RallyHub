import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { generateNextRound, generateRound1, createKotcState } from '@/lib/kingOfCourtEngine';

export default function KotcRoundRecovery({ state, currentRoundNum, tournament, queryClient }) {
  const [recovering, setRecovering] = useState(false);

  const handleRecover = async () => {
    setRecovering(true);

    // Find the last saved round
    const lastRound = state.rounds?.[state.rounds.length - 1];

    if (!lastRound) {
      // No rounds at all — regenerate round 1
      const enginePlayers = state.players || [];
      const freshState = createKotcState({ players: enginePlayers, numCourts: state.numCourts || 4 });
      const round1 = generateRound1(freshState, true);
      const recoveredState = { ...freshState, rounds: [round1], pairingHistory: [] };
      await base44.entities.Tournament.update(tournament.id, {
        kotc_state: JSON.stringify(recoveredState),
        kotc_current_round: 1,
        status: 'In Progress',
      });
      toast.success('Round 1 regenerated!');
      queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
      setRecovering(false);
      return;
    }

    // We have rounds saved — generate the missing current round from the last one
    const lastRoundNumber = lastRound.roundNumber ?? state.rounds.length;
    const lastResults = state.results?.[lastRoundNumber] || {};

    // If last round has no results, use dummy results (all A wins) to unblock rotation
    const effectiveResults = Object.keys(lastResults).length > 0
      ? lastResults
      : Object.fromEntries(lastRound.courts.map(c => [c.courtNumber, 'A']));

    const stateWithResults = {
      ...state,
      results: { ...(state.results || {}), [lastRoundNumber]: effectiveResults },
    };

    const { nextRound, updatedState } = generateNextRound(stateWithResults, lastRoundNumber, effectiveResults);
    const recoveredState = {
      ...updatedState,
      rounds: [...updatedState.rounds, nextRound],
      pairingHistory: (updatedState.pairingHistory || []).slice(-50),
    };

    await base44.entities.Tournament.update(tournament.id, {
      kotc_state: JSON.stringify(recoveredState),
      kotc_current_round: currentRoundNum,
      status: 'In Progress',
    });

    toast.success(`Round ${currentRoundNum} recovered!`);
    queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
    setRecovering(false);
  };

  return (
    <div className="glass rounded-xl p-8 text-center space-y-4">
      <p className="text-sm text-muted-foreground">
        Round {currentRoundNum} data is missing — the previous save may have been interrupted.
      </p>
      <Button
        className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        onClick={handleRecover}
        disabled={recovering}
      >
        {recovering
          ? <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> Recovering…</>
          : <><RefreshCw className="w-4 h-4" /> Recover Round {currentRoundNum}</>
        }
      </Button>
    </div>
  );
}