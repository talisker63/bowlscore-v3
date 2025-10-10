import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Download, Mail, Calendar, History, ArrowLeft, Trophy, TrendingUp } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type BowlResult = 'HELD' | 'CROSSED' | 'SHORT' | 'NONE';

interface EndResult {
  playerA: BowlResult[];
  playerB: BowlResult[];
  playerAHeld: number;
  playerBHeld: number;
  playerAPoints: number;
  playerBPoints: number;
  playerACumulative: number;
  playerBCumulative: number;
  crossed: number;
  short: number;
}

interface GameSession {
  id: string;
  player_a_name: string;
  player_b_name: string;
  session_date: string;
  weather: string[];
  green_speed: string;
  bowls_per_player: number;
  number_of_ends: number;
  ends_data: EndResult[];
  player_a_final_score: number;
  player_b_final_score: number;
  winner: string;
  player_a_total_held: number;
  player_b_total_held: number;
  player_a_total_penalties: number;
  player_b_total_penalties: number;
  image_url: string;
  created_at: string;
}

const LeadVsLeadDrill: React.FC = () => {
  const scoreCardRef = useRef<HTMLDivElement>(null);
  const { user, profile } = useAuth();

  const [gameState, setGameState] = useState<'setup' | 'playing' | 'summary'>('setup');
  const [currentEnd, setCurrentEnd] = useState(0);

  const [playerAName, setPlayerAName] = useState('');
  const [playerBName, setPlayerBName] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [weather, setWeather] = useState<string[]>([]);
  const [greenSpeed, setGreenSpeed] = useState('');
  const [bowlsPerPlayer, setBowlsPerPlayer] = useState(4);
  const [numberOfEnds, setNumberOfEnds] = useState(10);

  const [ends, setEnds] = useState<EndResult[]>([]);
  const [currentEndBowls, setCurrentEndBowls] = useState<{
    playerA: BowlResult[];
    playerB: BowlResult[];
  }>({
    playerA: Array(4).fill('NONE'),
    playerB: Array(4).fill('NONE'),
  });

  const [emailAddress, setEmailAddress] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historySessions, setHistorySessions] = useState<GameSession[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (showHistory && user) {
      loadHistory();
    }
  }, [showHistory, user]);

  const loadHistory = async () => {
    if (!user) return;

    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('lead_vs_lead_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistorySessions(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
      alert('Failed to load history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const toggleWeather = (condition: string) => {
    setWeather(prev =>
      prev.includes(condition)
        ? prev.filter(w => w !== condition)
        : [...prev, condition]
    );
  };

  const startGame = () => {
    if (!playerAName || !playerBName || !sessionDate) {
      alert('Please fill in all required fields');
      return;
    }

    setEnds([]);
    setCurrentEnd(0);
    setCurrentEndBowls({
      playerA: Array(bowlsPerPlayer).fill('NONE'),
      playerB: Array(bowlsPerPlayer).fill('NONE'),
    });
    setGameState('playing');
  };

  const setBowlResult = (player: 'playerA' | 'playerB', bowlIndex: number, result: BowlResult) => {
    setCurrentEndBowls(prev => ({
      ...prev,
      [player]: prev[player].map((r, i) => i === bowlIndex ? result : r),
    }));
  };

  const completeEnd = () => {
    const playerAHeld = currentEndBowls.playerA.filter(r => r === 'HELD').length;
    const playerBHeld = currentEndBowls.playerB.filter(r => r === 'HELD').length;

    const playerACrossed = currentEndBowls.playerA.filter(r => r === 'CROSSED').length;
    const playerBCrossed = currentEndBowls.playerB.filter(r => r === 'CROSSED').length;
    const playerAShort = currentEndBowls.playerA.filter(r => r === 'SHORT').length;
    const playerBShort = currentEndBowls.playerB.filter(r => r === 'SHORT').length;

    let playerAPoints = 0;
    let playerBPoints = 0;

    if (playerAHeld > playerBHeld) {
      playerAPoints = playerAHeld * 3;
    } else if (playerBHeld > playerAHeld) {
      playerBPoints = playerBHeld * 3;
    }

    playerAPoints -= (playerACrossed + playerAShort);
    playerBPoints -= (playerBCrossed + playerBShort);

    const previousCumulativeA = ends.length > 0 ? ends[ends.length - 1].playerACumulative : 0;
    const previousCumulativeB = ends.length > 0 ? ends[ends.length - 1].playerBCumulative : 0;

    const newEnd: EndResult = {
      playerA: [...currentEndBowls.playerA],
      playerB: [...currentEndBowls.playerB],
      playerAHeld,
      playerBHeld,
      playerAPoints,
      playerBPoints,
      playerACumulative: previousCumulativeA + playerAPoints,
      playerBCumulative: previousCumulativeB + playerBPoints,
      crossed: playerACrossed + playerBCrossed,
      short: playerAShort + playerBShort,
    };

    setEnds(prev => [...prev, newEnd]);

    if (currentEnd + 1 >= numberOfEnds) {
      setGameState('summary');
    } else {
      setCurrentEnd(prev => prev + 1);
      setCurrentEndBowls({
        playerA: Array(bowlsPerPlayer).fill('NONE'),
        playerB: Array(bowlsPerPlayer).fill('NONE'),
      });
    }
  };

  const calculateStats = () => {
    const playerATotalHeld = ends.reduce((sum, end) => sum + end.playerAHeld, 0);
    const playerBTotalHeld = ends.reduce((sum, end) => sum + end.playerBHeld, 0);

    const playerATotalPenalties = ends.reduce((sum, end) => {
      const crossed = end.playerA.filter(r => r === 'CROSSED').length;
      const short = end.playerA.filter(r => r === 'SHORT').length;
      return sum + crossed + short;
    }, 0);

    const playerBTotalPenalties = ends.reduce((sum, end) => {
      const crossed = end.playerB.filter(r => r === 'CROSSED').length;
      const short = end.playerB.filter(r => r === 'SHORT').length;
      return sum + crossed + short;
    }, 0);

    const playerAFinalScore = ends.length > 0 ? ends[ends.length - 1].playerACumulative : 0;
    const playerBFinalScore = ends.length > 0 ? ends[ends.length - 1].playerBCumulative : 0;

    const playerAAverage = ends.length > 0 ? playerAFinalScore / ends.length : 0;
    const playerBAverage = ends.length > 0 ? playerBFinalScore / ends.length : 0;

    const playerAVariance = ends.reduce((sum, end) => sum + Math.pow(end.playerAPoints - playerAAverage, 2), 0) / ends.length;
    const playerBVariance = ends.reduce((sum, end) => sum + Math.pow(end.playerBPoints - playerBAverage, 2), 0) / ends.length;

    const playerAStdDev = Math.sqrt(playerAVariance);
    const playerBStdDev = Math.sqrt(playerBVariance);

    const winner = playerAFinalScore > playerBFinalScore ? playerAName :
                   playerBFinalScore > playerAFinalScore ? playerBName : 'Draw';

    return {
      playerATotalHeld,
      playerBTotalHeld,
      playerATotalPenalties,
      playerBTotalPenalties,
      playerAFinalScore,
      playerBFinalScore,
      playerAAverage,
      playerBAverage,
      playerAStdDev,
      playerBStdDev,
      winner,
    };
  };

  const generateImage = async () => {
    if (!scoreCardRef.current) return null;

    try {
      const canvas = await html2canvas(scoreCardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      return canvas.toDataURL('image/jpeg', 0.95);
    } catch (error) {
      console.error('Error generating image:', error);
      return null;
    }
  };

  const downloadImage = async () => {
    const imageData = await generateImage();
    if (!imageData) {
      alert('Failed to generate image');
      return;
    }

    const link = document.createElement('a');
    link.download = `lead-vs-lead-${sessionDate || 'game'}.jpg`;
    link.href = imageData;
    link.click();
  };

  const saveSession = async () => {
    if (!user) {
      alert('You must be logged in to save sessions');
      return;
    }

    if (!profile?.is_premium) {
      alert('Saving game history is a premium feature');
      return;
    }

    setIsSaving(true);
    try {
      const imageData = await generateImage();
      const stats = calculateStats();

      const { error } = await supabase
        .from('lead_vs_lead_sessions')
        .insert({
          user_id: user.id,
          player_a_name: playerAName,
          player_b_name: playerBName,
          session_date: sessionDate,
          weather: weather,
          green_speed: greenSpeed,
          bowls_per_player: bowlsPerPlayer,
          number_of_ends: numberOfEnds,
          ends_data: ends,
          player_a_final_score: stats.playerAFinalScore,
          player_b_final_score: stats.playerBFinalScore,
          winner: stats.winner,
          player_a_total_held: stats.playerATotalHeld,
          player_b_total_held: stats.playerBTotalHeld,
          player_a_total_penalties: stats.playerATotalPenalties,
          player_b_total_penalties: stats.playerBTotalPenalties,
          image_url: imageData || '',
        });

      if (error) throw error;
      alert('Session saved successfully!');
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save session');
    } finally {
      setIsSaving(false);
    }
  };

  const sendEmail = async () => {
    if (!user) {
      alert('You must be logged in to send emails');
      return;
    }

    if (!profile?.is_premium) {
      alert('Email functionality is a premium feature');
      return;
    }

    if (!emailAddress) {
      alert('Please enter an email address');
      return;
    }

    setIsSendingEmail(true);
    try {
      const imageData = await generateImage();
      const stats = calculateStats();

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email-lead-vs-lead`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailAddress,
          playerAName,
          playerBName,
          sessionDate,
          weather: weather.join(', '),
          greenSpeed,
          stats,
          ends,
          imageData,
        }),
      });

      if (!response.ok) throw new Error('Failed to send email');
      alert('Email sent successfully!');
      setEmailAddress('');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setCurrentEnd(0);
    setEnds([]);
    setPlayerAName('');
    setPlayerBName('');
    setSessionDate('');
    setWeather([]);
    setGreenSpeed('');
    setBowlsPerPlayer(4);
    setNumberOfEnds(10);
  };

  const loadSession = (session: GameSession) => {
    setPlayerAName(session.player_a_name);
    setPlayerBName(session.player_b_name);
    setSessionDate(session.session_date);
    setWeather(session.weather || []);
    setGreenSpeed(session.green_speed);
    setBowlsPerPlayer(session.bowls_per_player);
    setNumberOfEnds(session.number_of_ends);
    setEnds(session.ends_data);
    setGameState('summary');
    setShowHistory(false);
  };

  const stats = gameState === 'summary' ? calculateStats() : null;

  if (showHistory) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowHistory(false)}
            className="flex items-center gap-2 text-[#547A51] hover:text-[#34533A]"
          >
            <ArrowLeft size={20} />
            Back to Drill
          </button>
        </div>

        <h2 className="text-2xl font-bold text-[#34533A] mb-6">Game History</h2>

        {isLoadingHistory ? (
          <div className="text-center py-8">Loading history...</div>
        ) : historySessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No saved games yet</div>
        ) : (
          <div className="grid gap-4">
            {historySessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => loadSession(session)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#34533A]">
                      {session.player_a_name} vs {session.player_b_name}
                    </h3>
                    <p className="text-sm text-gray-600">{session.session_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#547A51]">
                      {session.player_a_final_score} - {session.player_b_final_score}
                    </p>
                    <p className="text-sm text-gray-600">Winner: {session.winner}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>Weather: {session.weather?.join(', ') || 'N/A'}</span>
                  <span>Speed: {session.green_speed}</span>
                  <span>{session.number_of_ends} ends</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (gameState === 'setup') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-[#34533A] mb-6">Lead vs Lead Drill Setup</h1>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Player A Name *
                </label>
                <input
                  type="text"
                  value={playerAName}
                  onChange={(e) => setPlayerAName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#547A51] focus:border-transparent"
                  placeholder="Enter Player A name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Player B Name *
                </label>
                <input
                  type="text"
                  value={playerBName}
                  onChange={(e) => setPlayerBName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#547A51] focus:border-transparent"
                  placeholder="Enter Player B name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#547A51] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Green Speed
                </label>
                <select
                  value={greenSpeed}
                  onChange={(e) => setGreenSpeed(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#547A51] focus:border-transparent"
                >
                  <option value="">Select speed</option>
                  <option value="slow">Slow</option>
                  <option value="medium">Medium</option>
                  <option value="fast">Fast</option>
                  <option value="very-fast">Very Fast</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bowls Per Player
                </label>
                <select
                  value={bowlsPerPlayer}
                  onChange={(e) => setBowlsPerPlayer(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#547A51] focus:border-transparent"
                >
                  <option value={2}>2 Bowls</option>
                  <option value={3}>3 Bowls</option>
                  <option value={4}>4 Bowls</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Ends
                </label>
                <input
                  type="number"
                  value={numberOfEnds}
                  onChange={(e) => setNumberOfEnds(Number(e.target.value))}
                  min={1}
                  max={21}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#547A51] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Weather</label>
              <div className="flex flex-wrap gap-2">
                {['Sunny', 'Cloudy', 'Windy', 'Very Windy', 'Rainy', 'Indoor'].map((condition) => (
                  <button
                    key={condition}
                    onClick={() => toggleWeather(condition)}
                    className={`px-4 py-2 text-sm rounded-full transition-colors ${
                      weather.includes(condition)
                        ? 'bg-[#547A51] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={startGame}
                className="flex-1 bg-[#547A51] text-white px-6 py-3 rounded-lg hover:bg-[#34533A] transition-colors font-semibold"
              >
                Start Game
              </button>

              {user && profile?.is_premium && (
                <button
                  onClick={() => setShowHistory(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <History size={20} />
                  History
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#34533A]">
              End {currentEnd + 1} of {numberOfEnds}
            </h1>
            <div className="text-lg font-semibold text-[#547A51]">
              {playerAName}: {ends.length > 0 ? ends[ends.length - 1].playerACumulative : 0} | {playerBName}: {ends.length > 0 ? ends[ends.length - 1].playerBCumulative : 0}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-[#34533A] mb-4">{playerAName}</h3>
              <div className="space-y-3">
                {Array.from({ length: bowlsPerPlayer }).map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-sm font-medium text-gray-700 w-16">Bowl {i + 1}:</span>
                    <div className="flex gap-2 flex-wrap">
                      {(['HELD', 'CROSSED', 'SHORT', 'NONE'] as BowlResult[]).map((result) => (
                        <button
                          key={result}
                          onClick={() => setBowlResult('playerA', i, result)}
                          className={`px-3 py-1 text-sm rounded transition-colors ${
                            currentEndBowls.playerA[i] === result
                              ? result === 'HELD'
                                ? 'bg-green-600 text-white'
                                : result === 'CROSSED'
                                ? 'bg-red-600 text-white'
                                : result === 'SHORT'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-400 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {result}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#34533A] mb-4">{playerBName}</h3>
              <div className="space-y-3">
                {Array.from({ length: bowlsPerPlayer }).map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-sm font-medium text-gray-700 w-16">Bowl {i + 1}:</span>
                    <div className="flex gap-2 flex-wrap">
                      {(['HELD', 'CROSSED', 'SHORT', 'NONE'] as BowlResult[]).map((result) => (
                        <button
                          key={result}
                          onClick={() => setBowlResult('playerB', i, result)}
                          className={`px-3 py-1 text-sm rounded transition-colors ${
                            currentEndBowls.playerB[i] === result
                              ? result === 'HELD'
                                ? 'bg-green-600 text-white'
                                : result === 'CROSSED'
                                ? 'bg-red-600 text-white'
                                : result === 'SHORT'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-400 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {result}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {ends.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#34533A] mb-4">Scorecard</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#C7D9C2]">
                      <th className="border border-gray-300 px-2 py-2">End</th>
                      <th className="border border-gray-300 px-2 py-2">{playerAName} Pts</th>
                      <th className="border border-gray-300 px-2 py-2">{playerBName} Pts</th>
                      <th className="border border-gray-300 px-2 py-2">Cum {playerAName}</th>
                      <th className="border border-gray-300 px-2 py-2">Cum {playerBName}</th>
                      <th className="border border-gray-300 px-2 py-2">Crossed</th>
                      <th className="border border-gray-300 px-2 py-2">Short</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ends.map((end, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-2 py-2 text-center">{idx + 1}</td>
                        <td className="border border-gray-300 px-2 py-2 text-center">{end.playerAPoints}</td>
                        <td className="border border-gray-300 px-2 py-2 text-center">{end.playerBPoints}</td>
                        <td className="border border-gray-300 px-2 py-2 text-center font-semibold">{end.playerACumulative}</td>
                        <td className="border border-gray-300 px-2 py-2 text-center font-semibold">{end.playerBCumulative}</td>
                        <td className="border border-gray-300 px-2 py-2 text-center">{end.crossed}</td>
                        <td className="border border-gray-300 px-2 py-2 text-center">{end.short}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button
            onClick={completeEnd}
            className="w-full bg-[#547A51] text-white px-6 py-3 rounded-lg hover:bg-[#34533A] transition-colors font-semibold"
          >
            Complete End
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="text-yellow-500" size={48} />
            <h1 className="text-3xl font-bold text-[#34533A]">Game Complete!</h1>
          </div>

          {stats && (
            <div className="text-2xl font-bold text-[#547A51] mb-2">
              {stats.winner === 'Draw' ? (
                'It\'s a Draw!'
              ) : (
                `Winner: ${stats.winner}`
              )}
            </div>
          )}

          <div className="text-xl text-gray-700">
            {playerAName}: {stats?.playerAFinalScore} | {playerBName}: {stats?.playerBFinalScore}
          </div>
        </div>

        <div ref={scoreCardRef} className="bg-white p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#34533A]">Lead vs Lead Drill</h2>
            <p className="text-gray-600">{sessionDate}</p>
            <p className="text-sm text-gray-500">
              {weather.join(', ')} {greenSpeed && `| ${greenSpeed} speed`}
            </p>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#C7D9C2]">
                  <th className="border border-gray-300 px-2 py-2">End</th>
                  <th className="border border-gray-300 px-2 py-2">{playerAName} Pts</th>
                  <th className="border border-gray-300 px-2 py-2">{playerBName} Pts</th>
                  <th className="border border-gray-300 px-2 py-2">Cum {playerAName}</th>
                  <th className="border border-gray-300 px-2 py-2">Cum {playerBName}</th>
                  <th className="border border-gray-300 px-2 py-2">Crossed</th>
                  <th className="border border-gray-300 px-2 py-2">Short</th>
                </tr>
              </thead>
              <tbody>
                {ends.map((end, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-2 text-center">{idx + 1}</td>
                    <td className="border border-gray-300 px-2 py-2 text-center">{end.playerAPoints}</td>
                    <td className="border border-gray-300 px-2 py-2 text-center">{end.playerBPoints}</td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold">{end.playerACumulative}</td>
                    <td className="border border-gray-300 px-2 py-2 text-center font-semibold">{end.playerBCumulative}</td>
                    <td className="border border-gray-300 px-2 py-2 text-center">{end.crossed}</td>
                    <td className="border border-gray-300 px-2 py-2 text-center">{end.short}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg text-[#34533A] mb-3">{playerAName} Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Held Shots:</span>
                    <span className="font-semibold">{stats.playerATotalHeld}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Penalties:</span>
                    <span className="font-semibold">{stats.playerATotalPenalties}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Per End:</span>
                    <span className="font-semibold">{stats.playerAAverage.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Std Deviation:</span>
                    <span className="font-semibold">{stats.playerAStdDev.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg text-[#34533A] mb-3">{playerBName} Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Held Shots:</span>
                    <span className="font-semibold">{stats.playerBTotalHeld}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Penalties:</span>
                    <span className="font-semibold">{stats.playerBTotalPenalties}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Per End:</span>
                    <span className="font-semibold">{stats.playerBAverage.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Std Deviation:</span>
                    <span className="font-semibold">{stats.playerBStdDev.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={downloadImage}
            className="flex items-center gap-2 px-6 py-3 bg-[#547A51] text-white rounded-lg hover:bg-[#34533A] transition-colors"
          >
            <Download size={20} />
            Download Image
          </button>

          {user && profile?.is_premium && (
            <>
              <button
                onClick={saveSession}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Calendar size={20} />
                {isSaving ? 'Saving...' : 'Save Game'}
              </button>

              <div className="flex gap-2 flex-1">
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="Email address"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#547A51] focus:border-transparent"
                />
                <button
                  onClick={sendEmail}
                  disabled={isSendingEmail}
                  className="flex items-center gap-2 px-6 py-3 bg-[#547A51] text-white rounded-lg hover:bg-[#34533A] transition-colors disabled:opacity-50"
                >
                  <Mail size={20} />
                  {isSendingEmail ? 'Sending...' : 'Email'}
                </button>
              </div>
            </>
          )}

          {!profile?.is_premium && (
            <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              <p className="font-semibold mb-1">Premium Feature</p>
              <p>Upgrade to premium to save game history and email results.</p>
            </div>
          )}

          <button
            onClick={resetGame}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <RotateCcw size={20} />
            New Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadVsLeadDrill;
