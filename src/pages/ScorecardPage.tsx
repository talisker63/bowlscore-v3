import { useState, useEffect } from 'react';
import { GameSetup } from '../components/GameSetup';
import { Scorecard } from '../components/Scorecard';
import { generateScorecardJPEG, downloadJPEG } from '../lib/jpegGenerator';
import { Download, RotateCcw, Save, Mail, History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const LOCAL_STORAGE_KEY = 'lawnbowls_game_state';

interface GameState {
  playersPerTeam: number[];
  endsCount: number;
  playerNames: string[];
  teamNames: string[];
  handicaps: Record<string, number>;
  scores: number[][];
}

const ScorecardPage = () => {
  const { user } = useAuth();
  const [playersPerTeam, setPlayersPerTeam] = useState<number[]>([1, 1]);
  const [endsCount, setEndsCount] = useState(18);
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [teamNames, setTeamNames] = useState<string[]>(['', '']);
  const [handicaps, setHandicaps] = useState<Record<string, number>>({});
  const [scores, setScores] = useState<number[][]>([[], []]);
  const [message, setMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [previewScorecard, setPreviewScorecard] = useState<any>(null);
  const [previewJpeg, setPreviewJpeg] = useState<string | null>(null);
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
        setHandicaps(state.handicaps);
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
      handicaps,
      scores,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [playersPerTeam, endsCount, playerNames, teamNames, handicaps, scores]);

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

  const handleHandicapChange = (key: string, value: number) => {
    setHandicaps({ ...handicaps, [key]: value });
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
    setHandicaps({});
    setScores([Array(18).fill(0), Array(18).fill(0)]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setShowResetAllConfirm(false);
  };

  const handleDownload = async () => {
    try {
      const jpeg = await generateScorecardJPEG(
        playersPerTeam,
        endsCount,
        playerNames,
        teamNames,
        handicaps,
        scores
      );
      downloadJPEG(jpeg, `lawn-bowls-scorecard-${Date.now()}.jpg`);
    } catch (error: any) {
      setMessage('Error generating download: ' + error.message);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleSaveToHistory = async () => {
    if (!user) {
      setMessage('Please sign in to save scorecard history');
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    setIsSaving(true);
    try {
      const gameData = {
        playersPerTeam,
        endsCount,
        playerNames,
        teamNames,
        handicaps,
        scores,
      };

      const { error } = await supabase
        .from('scorecards')
        .insert({
          user_id: user.id,
          data_json: gameData,
        });

      if (error) throw error;

      setMessage('Scorecard saved to history!');
      setTimeout(() => setMessage(''), 3000);
      loadHistory();
    } catch (error: any) {
      setMessage('Error saving scorecard: ' + error.message);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const loadHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scorecards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      console.error('Error loading history:', error);
    }
  };

  const loadScorecardFromHistory = (scorecard: any) => {
    const data = scorecard.data_json;
    setPlayersPerTeam(data.playersPerTeam);
    setEndsCount(data.endsCount);
    setPlayerNames(data.playerNames);
    setTeamNames(data.teamNames);
    setHandicaps(data.handicaps);
    setScores(data.scores);
    setShowHistory(false);
    setMessage('Scorecard loaded from history');
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePreviewScorecard = async (scorecard: any) => {
    try {
      const data = scorecard.data_json;
      const jpeg = await generateScorecardJPEG(
        data.playersPerTeam,
        data.endsCount,
        data.playerNames,
        data.teamNames,
        data.handicaps,
        data.scores
      );
      const url = URL.createObjectURL(jpeg);
      setPreviewJpeg(url);
      setPreviewScorecard(scorecard);
    } catch (error: any) {
      setMessage('Error generating preview: ' + error.message);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const closePreview = () => {
    if (previewJpeg) {
      URL.revokeObjectURL(previewJpeg);
    }
    setPreviewJpeg(null);
    setPreviewScorecard(null);
  };

  const handleEmailScorecard = async () => {
    if (!emailAddress || !emailAddress.includes('@')) {
      setMessage('Please enter a valid email address');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsEmailing(true);
    try {
      const jpeg = await generateScorecardJPEG(
        playersPerTeam,
        endsCount,
        playerNames,
        teamNames,
        handicaps,
        scores
      );

      const formData = new FormData();
      formData.append('jpeg', jpeg, 'scorecard.jpg');
      formData.append('email', emailAddress);
      formData.append('gameData', JSON.stringify({
        playersPerTeam,
        endsCount,
        playerNames,
        teamNames,
        handicaps,
        scores,
      }));

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email-scorecard`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to send email');

      setMessage('Scorecard sent successfully!');
      setEmailModalOpen(false);
      setEmailAddress('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage('Error sending email: ' + error.message);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsEmailing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 pb-8">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-green-800 mb-2">
            Lawn Bowls Score Card
          </h1>
        </header>

        {message && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded text-center max-w-2xl mx-auto">
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <GameSetup
              playersPerTeam={playersPerTeam}
              endsCount={endsCount}
              playerNames={playerNames}
              teamNames={teamNames}
              handicaps={handicaps}
              onPlayersPerTeamChange={handlePlayersPerTeamChange}
              onEndsCountChange={handleEndsCountChange}
              onPlayerNameChange={handlePlayerNameChange}
              onTeamNameChange={handleTeamNameChange}
              onHandicapChange={handleHandicapChange}
            />

            <div className="mt-6 space-y-3">
              <button
                onClick={handleDownload}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download JPEG
              </button>

              {user && (
                <>
                  <button
                    onClick={handleSaveToHistory}
                    disabled={isSaving}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save size={16} />
                    {isSaving ? 'Saving...' : 'Save to History'}
                  </button>

                  <button
                    onClick={() => setEmailModalOpen(true)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center justify-center gap-2"
                  >
                    <Mail size={16} />
                    Email Scorecard
                  </button>

                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center justify-center gap-2"
                  >
                    <History size={16} />
                    {showHistory ? 'Hide History' : 'View History'}
                  </button>
                </>
              )}

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
            <Scorecard
              playersPerTeam={playersPerTeam}
              endsCount={endsCount}
              playerNames={playerNames}
              teamNames={teamNames}
              handicaps={handicaps}
              scores={scores}
              onScoresChange={setScores}
            />

            {showHistory && user && (
              <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-green-800">Scorecard History</h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                  >
                    Return to Scorecard
                  </button>
                </div>
                {history.length === 0 ? (
                  <p className="text-gray-600">No saved scorecards yet</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => {
                      const data = item.data_json;
                      const team1Name = data.teamNames[0] || 'Team 1';
                      const team2Name = data.teamNames[1] || 'Team 2';
                      const team1Total = (data.scores[0]?.reduce((sum: number, score: number) => sum + score, 0) || 0) - (data.handicaps['team1'] || 0);
                      const team2Total = (data.scores[1]?.reduce((sum: number, score: number) => sum + score, 0) || 0) - (data.handicaps['team2'] || 0);

                      return (
                        <div
                          key={item.id}
                          className="border border-gray-200 rounded p-4 hover:bg-green-50 transition"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {team1Name} vs {team2Name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Score: {team1Total} - {team2Total}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handlePreviewScorecard(item)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                              >
                                View
                              </button>
                              <button
                                onClick={() => loadScorecardFromHistory(item)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                              >
                                Load
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {previewJpeg && previewScorecard && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={closePreview}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-green-800">Scorecard Preview</h3>
              <button
                onClick={closePreview}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
            <div className="overflow-auto max-h-[70vh]">
              <img src={previewJpeg} alt="Scorecard Preview" className="w-full" />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  loadScorecardFromHistory(previewScorecard);
                  closePreview();
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Load This Scorecard
              </button>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = previewJpeg;
                  link.download = `scorecard-${previewScorecard.id}.jpg`;
                  link.click();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Download JPEG
              </button>
            </div>
          </div>
        </div>
      )}

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

      {emailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-green-800 mb-4">Email Scorecard</h3>
            <p className="text-gray-600 mb-4">
              Enter an email address to send the scorecard with JPEG attachment
            </p>
            <input
              type="email"
              placeholder="email@example.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex gap-3">
              <button
                onClick={handleEmailScorecard}
                disabled={isEmailing}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {isEmailing ? 'Sending...' : 'Send Email'}
              </button>
              <button
                onClick={() => {
                  setEmailModalOpen(false);
                  setEmailAddress('');
                }}
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

export default ScorecardPage;
