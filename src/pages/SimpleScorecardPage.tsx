import { useState, useEffect } from 'react';
import { SimplifiedGameSetup } from '../components/SimplifiedGameSetup';
import { SimplifiedScorecard } from '../components/SimplifiedScorecard';
import { RotateCcw } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'lawnbowls_simple_game_state';

interface GameState {
  playersPerTeam: number[];
  endsCount: number;
  playerNames: string[];
  teamNames: string[];
  scores: number[][];
}

const SimpleScorecardPage = () => {
  const [playersPerTeam, setPlayersPerTeam] = useState<number[]>([1, 1]);
  const [endsCount, setEndsCount] = useState(18);
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [teamNames, setTeamNames] = useState<string[]>(['', '']);
  const [scores, setScores] = useState<number[][]>([[], []]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetAllConfirm, setShowResetAllConfirm] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedState) {
      try {
        const state: GameState = JSON.parse(savedState);
        setPlayersPerTeam(state.playersPerTeam);
        setEndsCount(state.endsCount);
        setPlayerNames(state.playerNames);
        setTeamNames(state.teamNames);
        setScores(state.scores);
      } catch (e) {
        console.error('Failed to load saved state', e);
      }
    }
  }, []);

  useEffect(() => {
    const state: GameState = {
      playersPerTeam,
      endsCount,
      playerNames,
      teamNames,
      scores,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [playersPerTeam, endsCount, playerNames, teamNames, scores]);

  const handlePlayerNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    while (newNames.length <= index) {
      newNames.push('');
    }
    newNames[index] = name;
    setPlayerNames(newNames);

    if (playersPerTeam[0] === 1 && index === 0) {
      const newTeamNames = [...teamNames];
      newTeamNames[0] = name;
      setTeamNames(newTeamNames);
    } else if (playersPerTeam[1] === 1 && index === playersPerTeam[0]) {
      const newTeamNames = [...teamNames];
      newTeamNames[1] = name;
      setTeamNames(newTeamNames);
    }
  };

  const handleTeamNameChange = (index: number, name: string) => {
    const newNames = [...teamNames];
    newNames[index] = name;
    setTeamNames(newNames);
  };

  const handlePlayersPerTeamChange = (newPlayersPerTeam: number[]) => {
    setPlayersPerTeam(newPlayersPerTeam);
    const totalPlayers = newPlayersPerTeam[0] + newPlayersPerTeam[1];
    const newNames = Array(totalPlayers).fill('').map((_, i) => playerNames[i] || '');
    setPlayerNames(newNames);

    const newTeamNames = [...teamNames];
    if (newPlayersPerTeam[0] === 1 && playerNames[0]) {
      newTeamNames[0] = playerNames[0];
    }
    if (newPlayersPerTeam[1] === 1 && playerNames[newPlayersPerTeam[0]]) {
      newTeamNames[1] = playerNames[newPlayersPerTeam[0]];
    }
    setTeamNames(newTeamNames);
  };

  const handleEndsCountChange = (count: number) => {
    setEndsCount(count);
    const newScores = scores.map(teamScores => {
      const updated = [...teamScores];
      while (updated.length < count) updated.push(0);
      return updated.slice(0, count);
    });
    setScores(newScores);
  };

  const handleResetResults = () => {
    setScores([Array(endsCount).fill(0), Array(endsCount).fill(0)]);
    setShowResetConfirm(false);
  };

  const handleResetAll = () => {
    setPlayersPerTeam([1, 1]);
    setEndsCount(18);
    setPlayerNames(['', '']);
    setTeamNames(['', '']);
    setScores([Array(18).fill(0), Array(18).fill(0)]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setShowResetAllConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 pb-8">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-green-800 mb-2">
            Lawn Bowls Score Card
          </h1>
          <p className="text-gray-600">Simple scoring for your game</p>
          <p className="text-sm text-gray-500 mt-2">
            For Premium featured Scorecard including saved games, history and more become a subscriber
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <SimplifiedGameSetup
              playersPerTeam={playersPerTeam}
              endsCount={endsCount}
              playerNames={playerNames}
              teamNames={teamNames}
              onPlayersPerTeamChange={handlePlayersPerTeamChange}
              onEndsCountChange={handleEndsCountChange}
              onPlayerNameChange={handlePlayerNameChange}
              onTeamNameChange={handleTeamNameChange}
            />

            <div className="mt-6 space-y-3">
              <div className="border-t border-gray-300 pt-3 space-y-2">
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} />
                  Reset Results
                </button>

                <button
                  onClick={() => setShowResetAllConfirm(true)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} />
                  Reset All
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <SimplifiedScorecard
              playersPerTeam={playersPerTeam}
              endsCount={endsCount}
              playerNames={playerNames}
              teamNames={teamNames}
              scores={scores}
              onScoresChange={setScores}
            />
          </div>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-orange-800 mb-4">Reset Results?</h3>
            <p className="text-gray-600 mb-6">
              This will reset all scores to 0. Player and team names will be kept.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleResetResults}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Reset Results
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-red-800 mb-4">Reset Everything?</h3>
            <p className="text-gray-600 mb-6">
              This will reset everything including names, settings, and scores. All data will be cleared.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleResetAll}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowResetAllConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleScorecardPage;
