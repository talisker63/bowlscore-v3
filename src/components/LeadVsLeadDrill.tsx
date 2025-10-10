import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Download, Mail, Calendar, History, ArrowLeft, Trophy, TrendingUp } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface BowlResult {
  good: boolean;
  crossed: boolean;
  short: boolean;
}

interface EndResult {
  playerA: BowlResult[];
  playerB: BowlResult[];
  playerAGood: number;
  playerBGood: number;
  shotsWon: number;
  shotWinner: 'playerA' | 'playerB' | null;
  playerAPoints: number;
  playerBPoints: number;
  playerACumulative: number;
  playerBCumulative: number;
  playerACrossed: number;
  playerBCrossed: number;
  playerAShort: number;
  playerBShort: number;
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

  const [gameState, setGameState] = useState<'setup' | 'playing' | 'endComplete' | 'summary'>('setup');
  const [currentEnd, setCurrentEnd] = useState(0);

  const [playerAName, setPlayerAName] = useState('');
  const [playerBName, setPlayerBName] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [weather, setWeather] = useState<string[]>([]);
  const [surfaceType, setSurfaceType] = useState('');
  const [bowlsPerPlayer, setBowlsPerPlayer] = useState(4);
  const [numberOfEnds, setNumberOfEnds] = useState(10);

  const [ends, setEnds] = useState<EndResult[]>([]);
  const [currentEndBowls, setCurrentEndBowls] = useState<{
    playerA: BowlResult[];
    playerB: BowlResult[];
  }>({
    playerA: Array(4).fill({ good: false, crossed: false, short: false }),
    playerB: Array(4).fill({ good: false, crossed: false, short: false }),
  });

  const [shotsWon, setShotsWon] = useState(1);
  const [shotWinner, setShotWinner] = useState<'playerA' | 'playerB' | null>(null);

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
      playerA: Array(bowlsPerPlayer).fill(null).map(() => ({ good: false, crossed: false, short: false })),
      playerB: Array(bowlsPerPlayer).fill(null).map(() => ({ good: false, crossed: false, short: false })),
    });
    setGameState('playing');
  };

  const toggleBowlGood = (player: 'playerA' | 'playerB', bowlIndex: number) => {
    setCurrentEndBowls(prev => ({
      ...prev,
      [player]: prev[player].map((r, i) => i === bowlIndex ? { ...r, good: !r.good } : r),
    }));
  };

  const toggleBowlCrossed = (player: 'playerA' | 'playerB', bowlIndex: number) => {
    setCurrentEndBowls(prev => ({
      ...prev,
      [player]: prev[player].map((r, i) => i === bowlIndex ? { ...r, crossed: !r.crossed, good: r.crossed ? r.good : false } : r),
    }));
  };

  const toggleBowlShort = (player: 'playerA' | 'playerB', bowlIndex: number) => {
    setCurrentEndBowls(prev => ({
      ...prev,
      [player]: prev[player].map((r, i) => i === bowlIndex ? { ...r, short: !r.short, good: r.short ? r.good : false } : r),
    }));
  };

  const moveToEndComplete = () => {
    setShotsWon(1);
    setShotWinner(null);
    setGameState('endComplete');
  };

  const finalizeEnd = () => {
    if (shotWinner === null) {
      alert('Please select which player won shot');
      return;
    }

    const playerAGood = currentEndBowls.playerA.filter(r => r.good).length;
    const playerBGood = currentEndBowls.playerB.filter(r => r.good).length;

    const playerACrossed = currentEndBowls.playerA.filter(r => r.crossed).length;
    const playerBCrossed = currentEndBowls.playerB.filter(r => r.crossed).length;
    const playerAShort = currentEndBowls.playerA.filter(r => r.short).length;
    const playerBShort = currentEndBowls.playerB.filter(r => r.short).length;

    let playerAPoints = 0;
    let playerBPoints = 0;

    if (shotWinner === 'playerA') {
      playerAPoints = shotsWon * 3;
    } else if (shotWinner === 'playerB') {
      playerBPoints = shotsWon * 3;
    }

    playerAPoints -= (playerACrossed + playerAShort);
    playerBPoints -= (playerBCrossed + playerBShort);

    const previousCumulativeA = ends.length > 0 ? ends[ends.length - 1].playerACumulative : 0;
    const previousCumulativeB = ends.length > 0 ? ends[ends.length - 1].playerBCumulative : 0;

    const newEnd: EndResult = {
      playerA: currentEndBowls.playerA.map(r => ({ ...r })),
      playerB: currentEndBowls.playerB.map(r => ({ ...r })),
      playerAGood,
      playerBGood,
      shotsWon,
      shotWinner,
      playerAPoints,
      playerBPoints,
      playerACumulative: previousCumulativeA + playerAPoints,
      playerBCumulative: previousCumulativeB + playerBPoints,
      playerACrossed,
      playerBCrossed,
      playerAShort,
      playerBShort,
    };

    setEnds(prev => [...prev, newEnd]);

    if (currentEnd + 1 >= numberOfEnds) {
      setGameState('summary');
    } else {
      setCurrentEnd(prev => prev + 1);
      setCurrentEndBowls({
        playerA: Array(bowlsPerPlayer).fill(null).map(() => ({ good: false, crossed: false, short: false })),
        playerB: Array(bowlsPerPlayer).fill(null).map(() => ({ good: false, crossed: false, short: false })),
      });
      setGameState('playing');
    }
  };

  const calculateStats = () => {
    const playerATotalHeld = ends.reduce((sum, end) => sum + end.playerAGood, 0);
    const playerBTotalHeld = ends.reduce((sum, end) => sum + end.playerBGood, 0);

    const playerATotalCrossed = ends.reduce((sum, end) => sum + end.playerACrossed, 0);
    const playerBTotalCrossed = ends.reduce((sum, end) => sum + end.playerBCrossed, 0);
    const playerATotalShort = ends.reduce((sum, end) => sum + end.playerAShort, 0);
    const playerBTotalShort = ends.reduce((sum, end) => sum + end.playerBShort, 0);

    const playerATotalPenalties = playerATotalCrossed + playerATotalShort;
    const playerBTotalPenalties = playerBTotalCrossed + playerBTotalShort;

    const playerAFinalScore = ends.length > 0 ? ends[ends.length - 1].playerACumulative : 0;
    const playerBFinalScore = ends.length > 0 ? ends[ends.length - 1].playerBCumulative : 0;

    const winner = playerAFinalScore > playerBFinalScore ? playerAName :
                   playerBFinalScore > playerAFinalScore ? playerBName : 'Draw';

    return {
      playerATotalHeld,
      playerBTotalHeld,
      playerATotalCrossed,
      playerBTotalCrossed,
      playerATotalShort,
      playerBTotalShort,
      playerATotalPenalties,
      playerBTotalPenalties,
      playerAFinalScore,
      playerBFinalScore,
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
          green_speed: surfaceType,
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
          greenSpeed: surfaceType,
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
    setSurfaceType('');
    setBowlsPerPlayer(4);
    setNumberOfEnds(10);
  };

  const loadSession = (session: GameSession) => {
    setPlayerAName(session.player_a_name);
    setPlayerBName(session.player_b_name);
    setSessionDate(session.session_date);
    setWeather(session.weather || []);
    setSurfaceType(session.green_speed);
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
                  <span>Surface: {session.green_speed}</span>
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
                  Surface Type
                </label>
                <select
                  value={surfaceType}
                  onChange={(e) => setSurfaceType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#547A51] focus:border-transparent"
                >
                  <option value="">Select surface</option>
                  <option value="grass">Grass</option>
                  <option value="synthetic">Synthetic</option>
                  <option value="weave">Weave</option>
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#34533A] mb-4">
              End {currentEnd + 1} of {numberOfEnds}
            </h1>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">{playerAName}</div>
                <div className="text-2xl font-bold text-[#547A51]">
                  {ends.length > 0 ? ends[ends.length - 1].playerACumulative : 0}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">{playerBName}</div>
                <div className="text-2xl font-bold text-[#547A51]">
                  {ends.length > 0 ? ends[ends.length - 1].playerBCumulative : 0}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-[#34533A] mb-4">{playerAName}</h3>
              <div className="space-y-3">
                {Array.from({ length: bowlsPerPlayer }).map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-700 w-16">Bowl {i + 1}</span>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentEndBowls.playerA[i].good}
                          onChange={() => toggleBowlGood('playerA', i)}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-xs font-medium text-gray-700">Good</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentEndBowls.playerA[i].crossed}
                          onChange={() => toggleBowlCrossed('playerA', i)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-xs text-gray-700">X</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentEndBowls.playerA[i].short}
                          onChange={() => toggleBowlShort('playerA', i)}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-xs text-gray-700">S</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#34533A] mb-4">{playerBName}</h3>
              <div className="space-y-3">
                {Array.from({ length: bowlsPerPlayer }).map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-700 w-16">Bowl {i + 1}</span>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentEndBowls.playerB[i].good}
                          onChange={() => toggleBowlGood('playerB', i)}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-xs font-medium text-gray-700">Good</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentEndBowls.playerB[i].crossed}
                          onChange={() => toggleBowlCrossed('playerB', i)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-xs text-gray-700">X</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentEndBowls.playerB[i].short}
                          onChange={() => toggleBowlShort('playerB', i)}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-xs text-gray-700">S</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {ends.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#34533A] mb-4">Scorecard</h3>
              <div className="space-y-4">
                {ends.map((end, idx) => (
                  <div key={idx} className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                      <div className="text-lg font-bold text-[#34533A]">End {idx + 1}</div>
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">{end.shotWinner === 'playerA' ? playerAName : playerBName}</span> won {end.shotsWon} shot{end.shotsWon > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">{playerAName}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600">{end.playerAPoints} pts</span>
                          <span className="text-lg font-bold text-[#547A51]">{end.playerACumulative}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">{playerBName}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600">{end.playerBPoints} pts</span>
                          <span className="text-lg font-bold text-[#547A51]">{end.playerBCumulative}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={moveToEndComplete}
              className="w-full bg-[#547A51] text-white px-6 py-3 rounded-lg hover:bg-[#34533A] transition-colors font-semibold"
            >
              Complete End
            </button>
            <button
              onClick={() => setGameState('summary')}
              className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Complete Drill Early
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'endComplete') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-[#34533A] mb-6 text-center">
            End {currentEnd + 1} Complete
          </h1>

          <div className="bg-[#F3F7F2] rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-[#34533A] mb-4">Who won shot?</h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setShotWinner('playerA')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  shotWinner === 'playerA'
                    ? 'border-[#547A51] bg-[#C7D9C2] font-semibold'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-xl font-bold text-[#34533A]">{playerAName}</div>
              </button>

              <button
                onClick={() => setShotWinner('playerB')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  shotWinner === 'playerB'
                    ? 'border-[#547A51] bg-[#C7D9C2] font-semibold'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-xl font-bold text-[#34533A]">{playerBName}</div>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of shots won
              </label>
              <input
                type="number"
                min={1}
                max={bowlsPerPlayer}
                value={shotsWon}
                onChange={(e) => setShotsWon(Math.max(1, Math.min(bowlsPerPlayer, Number(e.target.value))))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#547A51] focus:border-transparent"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">End Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-800 font-medium">{playerAName}</p>
                <p className="text-blue-600">Good: {currentEndBowls.playerA.filter(r => r.good).length}</p>
                <p className="text-blue-600">Crossed: {currentEndBowls.playerA.filter(r => r.crossed).length}</p>
                <p className="text-blue-600">Short: {currentEndBowls.playerA.filter(r => r.short).length}</p>
              </div>
              <div>
                <p className="text-blue-800 font-medium">{playerBName}</p>
                <p className="text-blue-600">Good: {currentEndBowls.playerB.filter(r => r.good).length}</p>
                <p className="text-blue-600">Crossed: {currentEndBowls.playerB.filter(r => r.crossed).length}</p>
                <p className="text-blue-600">Short: {currentEndBowls.playerB.filter(r => r.short).length}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setGameState('playing')}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Back to Edit
            </button>
            <button
              onClick={finalizeEnd}
              className="flex-1 px-6 py-3 bg-[#547A51] text-white rounded-lg hover:bg-[#34533A] transition-colors font-semibold"
            >
              Finalize End
            </button>
          </div>
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
              {weather.join(', ')} {surfaceType && `| ${surfaceType}`}
            </p>
          </div>

          <div className="mb-6">
            <div className="space-y-4">
              {ends.map((end, idx) => (
                <div key={idx} className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                    <div className="text-lg font-bold text-[#34533A]">End {idx + 1}</div>
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">{end.shotWinner === 'playerA' ? playerAName : playerBName}</span> won {end.shotsWon} shot{end.shotsWon > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{playerAName}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">{end.playerAPoints} pts</span>
                        <span className="text-lg font-bold text-[#547A51]">{end.playerACumulative}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{playerBName}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">{end.playerBPoints} pts</span>
                        <span className="text-lg font-bold text-[#547A51]">{end.playerBCumulative}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                    <span className="text-gray-600">Penalties:</span>
                    <span className="font-semibold">{stats.playerATotalPenalties} ({stats.playerATotalCrossed} crossed, {stats.playerATotalShort} short)</span>
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
                    <span className="text-gray-600">Penalties:</span>
                    <span className="font-semibold">{stats.playerBTotalPenalties} ({stats.playerBTotalCrossed} crossed, {stats.playerBTotalShort} short)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          {user && profile?.is_premium && (
            <>
              <button
                onClick={downloadImage}
                className="flex items-center gap-2 px-6 py-3 bg-[#547A51] text-white rounded-lg hover:bg-[#34533A] transition-colors"
              >
                <Download size={20} />
                Download Image
              </button>

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
