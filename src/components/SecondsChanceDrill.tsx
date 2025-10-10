import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Download, Mail, Calendar, History, ArrowLeft, Trophy } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface BowlResult {
  success: boolean;
  hand: 'forehand' | 'backhand';
}

interface EndResult {
  playerA: BowlResult[];
  playerB: BowlResult[];
  playerASuccessful: number;
  playerBSuccessful: number;
  playerAPoints: number;
  playerBPoints: number;
  playerACumulative: number;
  playerBCumulative: number;
  playerAStartedForehand: boolean;
}

interface GameSession {
  id: string;
  player_a_name: string;
  player_b_name: string;
  session_date: string;
  weather: string[];
  surface_type: string;
  bowls_per_player: number;
  number_of_ends: number;
  ends_data: EndResult[];
  player_a_final_score: number;
  player_b_final_score: number;
  winner: string;
  player_a_total_successful: number;
  player_b_total_successful: number;
  player_a_forehand_success: number;
  player_a_backhand_success: number;
  player_b_forehand_success: number;
  player_b_backhand_success: number;
  image_url: string;
  created_at: string;
}

const SecondsChanceDrill: React.FC = () => {
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
    playerA: Array(4).fill(null).map((_, i) => ({ success: false, hand: i < 2 ? 'forehand' : 'backhand' })),
    playerB: Array(4).fill(null).map((_, i) => ({ success: false, hand: i < 2 ? 'backhand' : 'forehand' })),
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
        .from('seconds_chance_sessions')
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

  const getHandsForEnd = (endNumber: number, bowlIndex: number, player: 'A' | 'B') => {
    const isOddEnd = endNumber % 2 === 1;
    const isFirstHalf = bowlIndex < 2;

    if (player === 'A') {
      if (isOddEnd) {
        return isFirstHalf ? 'forehand' : 'backhand';
      } else {
        return isFirstHalf ? 'backhand' : 'forehand';
      }
    } else {
      if (isOddEnd) {
        return isFirstHalf ? 'backhand' : 'forehand';
      } else {
        return isFirstHalf ? 'forehand' : 'backhand';
      }
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
    initializeEndBowls(0);
    setGameState('playing');
  };

  const initializeEndBowls = (endNumber: number) => {
    const endIndex = endNumber + 1;
    setCurrentEndBowls({
      playerA: Array(bowlsPerPlayer).fill(null).map((_, i) => ({
        success: false,
        hand: getHandsForEnd(endIndex, i, 'A') as 'forehand' | 'backhand',
      })),
      playerB: Array(bowlsPerPlayer).fill(null).map((_, i) => ({
        success: false,
        hand: getHandsForEnd(endIndex, i, 'B') as 'forehand' | 'backhand',
      })),
    });
  };

  const toggleBowlSuccess = (player: 'playerA' | 'playerB', bowlIndex: number) => {
    setCurrentEndBowls(prev => ({
      ...prev,
      [player]: prev[player].map((r, i) => i === bowlIndex ? { ...r, success: !r.success } : r),
    }));
  };

  const moveToEndComplete = () => {
    setGameState('endComplete');
  };

  const finalizeEnd = () => {
    const playerASuccessful = currentEndBowls.playerA.filter(r => r.success).length;
    const playerBSuccessful = currentEndBowls.playerB.filter(r => r.success).length;

    const playerAPoints = playerASuccessful;
    const playerBPoints = playerBSuccessful;

    const previousCumulativeA = ends.length > 0 ? ends[ends.length - 1].playerACumulative : 0;
    const previousCumulativeB = ends.length > 0 ? ends[ends.length - 1].playerBCumulative : 0;

    const endIndex = currentEnd + 1;
    const isOddEnd = endIndex % 2 === 1;

    const newEnd: EndResult = {
      playerA: currentEndBowls.playerA.map(r => ({ ...r })),
      playerB: currentEndBowls.playerB.map(r => ({ ...r })),
      playerASuccessful,
      playerBSuccessful,
      playerAPoints,
      playerBPoints,
      playerACumulative: previousCumulativeA + playerAPoints,
      playerBCumulative: previousCumulativeB + playerBPoints,
      playerAStartedForehand: isOddEnd,
    };

    setEnds(prev => [...prev, newEnd]);

    if (currentEnd + 1 >= numberOfEnds) {
      setGameState('summary');
    } else {
      setCurrentEnd(prev => prev + 1);
      initializeEndBowls(currentEnd + 1);
      setGameState('playing');
    }
  };

  const calculateStats = () => {
    const playerATotalSuccessful = ends.reduce((sum, end) => sum + end.playerASuccessful, 0);
    const playerBTotalSuccessful = ends.reduce((sum, end) => sum + end.playerBSuccessful, 0);

    let playerAForehHandSuccess = 0;
    let playerABackhandSuccess = 0;
    let playerBForehHandSuccess = 0;
    let playerBBackhandSuccess = 0;

    ends.forEach(end => {
      end.playerA.forEach(bowl => {
        if (bowl.success) {
          if (bowl.hand === 'forehand') playerAForehHandSuccess++;
          else playerABackhandSuccess++;
        }
      });
      end.playerB.forEach(bowl => {
        if (bowl.success) {
          if (bowl.hand === 'forehand') playerBForehHandSuccess++;
          else playerBBackhandSuccess++;
        }
      });
    });

    const totalBowls = ends.length * bowlsPerPlayer;
    const playerASuccessRate = totalBowls > 0 ? (playerATotalSuccessful / totalBowls) * 100 : 0;
    const playerBSuccessRate = totalBowls > 0 ? (playerBTotalSuccessful / totalBowls) * 100 : 0;

    const playerAFinalScore = ends.length > 0 ? ends[ends.length - 1].playerACumulative : 0;
    const playerBFinalScore = ends.length > 0 ? ends[ends.length - 1].playerBCumulative : 0;

    const winner = playerAFinalScore > playerBFinalScore ? playerAName :
                   playerBFinalScore > playerAFinalScore ? playerBName : 'Draw';

    return {
      playerATotalSuccessful,
      playerBTotalSuccessful,
      playerAForehHandSuccess,
      playerABackhandSuccess,
      playerBForehHandSuccess,
      playerBBackhandSuccess,
      playerASuccessRate,
      playerBSuccessRate,
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
    link.download = `seconds-chance-${sessionDate || 'game'}.jpg`;
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
        .from('seconds_chance_sessions')
        .insert({
          user_id: user.id,
          player_a_name: playerAName,
          player_b_name: playerBName,
          session_date: sessionDate,
          weather: weather,
          surface_type: surfaceType,
          bowls_per_player: bowlsPerPlayer,
          number_of_ends: numberOfEnds,
          ends_data: ends,
          player_a_final_score: stats.playerAFinalScore,
          player_b_final_score: stats.playerBFinalScore,
          winner: stats.winner,
          player_a_total_successful: stats.playerATotalSuccessful,
          player_b_total_successful: stats.playerBTotalSuccessful,
          player_a_forehand_success: stats.playerAForehHandSuccess,
          player_a_backhand_success: stats.playerABackhandSuccess,
          player_b_forehand_success: stats.playerBForehHandSuccess,
          player_b_backhand_success: stats.playerBBackhandSuccess,
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

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email-seconds-chance`, {
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
          surfaceType,
          stats,
          ends,
          bowlsPerPlayer,
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

  const resetResults = () => {
    setCurrentEnd(0);
    setEnds([]);
    initializeEndBowls(0);
    setGameState('setup');
  };

  const resetAll = () => {
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
    setEmailAddress('');
  };

  const loadSession = (session: GameSession) => {
    setPlayerAName(session.player_a_name);
    setPlayerBName(session.player_b_name);
    setSessionDate(session.session_date);
    setWeather(session.weather || []);
    setSurfaceType(session.surface_type);
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
                  <span>Surface: {session.surface_type}</span>
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
          <h1 className="text-3xl font-bold text-[#34533A] mb-6">2nd's Chance Drill Setup</h1>

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
    const endIndex = currentEnd + 1;
    const isOddEnd = endIndex % 2 === 1;
    const playerAStartsForehand = isOddEnd;

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#34533A] mb-4">
              End {endIndex} of {numberOfEnds}
            </h1>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">{playerAStartsForehand ? playerAName : playerBName}</span> starts with forehand this end
              </p>
            </div>
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
                {Array.from({ length: bowlsPerPlayer }).map((_, i) => {
                  const bowl = currentEndBowls.playerA[i];
                  let criteria = '';
                  if (i === 0 || i === 2) {
                    criteria = 'Between jack and 2m beyond, within mat length to side, no crossing';
                  } else {
                    criteria = 'Within mat length of jack';
                  }
                  return (
                    <div key={i} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-700">Bowl {i + 1}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          bowl.hand === 'forehand'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {bowl.hand === 'forehand' ? 'FH' : 'BH'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{criteria}</p>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bowl.success}
                          onChange={() => toggleBowlSuccess('playerA', i)}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Successful</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#34533A] mb-4">{playerBName}</h3>
              <div className="space-y-3">
                {Array.from({ length: bowlsPerPlayer }).map((_, i) => {
                  const bowl = currentEndBowls.playerB[i];
                  let criteria = '';
                  if (i === 0 || i === 2) {
                    criteria = 'Between jack and 2m beyond, within mat length to side, no crossing';
                  } else {
                    criteria = 'Within mat length of jack';
                  }
                  return (
                    <div key={i} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-700">Bowl {i + 1}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          bowl.hand === 'forehand'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {bowl.hand === 'forehand' ? 'FH' : 'BH'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{criteria}</p>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bowl.success}
                          onChange={() => toggleBowlSuccess('playerB', i)}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Successful</span>
                      </label>
                    </div>
                  );
                })}
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
                      <div className="text-xs text-gray-500">
                        {end.playerAStartedForehand ? playerAName : playerBName} started FH
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
    const endIndex = currentEnd + 1;
    const isOddEnd = endIndex % 2 === 1;
    const nextEndIndex = endIndex + 1;
    const nextEndIsOdd = nextEndIndex % 2 === 1;

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-[#34533A] mb-6 text-center">
            End {endIndex} Complete
          </h1>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">End Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-800 font-medium">{playerAName}</p>
                <p className="text-blue-600">Started: {isOddEnd ? 'Forehand' : 'Backhand'}</p>
                <p className="text-blue-600">Successful: {currentEndBowls.playerA.filter(r => r.success).length}</p>
                <p className="text-blue-600">Points: {currentEndBowls.playerA.filter(r => r.success).length}</p>
              </div>
              <div>
                <p className="text-blue-800 font-medium">{playerBName}</p>
                <p className="text-blue-600">Started: {isOddEnd ? 'Backhand' : 'Forehand'}</p>
                <p className="text-blue-600">Successful: {currentEndBowls.playerB.filter(r => r.success).length}</p>
                <p className="text-blue-600">Points: {currentEndBowls.playerB.filter(r => r.success).length}</p>
              </div>
            </div>
          </div>

          {currentEnd + 1 < numberOfEnds && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-900 mb-2">Next End Preview</h4>
              <p className="text-sm text-green-700">
                End {nextEndIndex}: <span className="font-semibold">{nextEndIsOdd ? playerAName : playerBName}</span> will start with forehand
              </p>
            </div>
          )}

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
            <h1 className="text-3xl font-bold text-[#34533A]">Drill Complete!</h1>
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
            <h2 className="text-2xl font-bold text-[#34533A]">2nd's Chance Drill</h2>
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
                    <div className="text-xs text-gray-500">
                      {end.playerAStartedForehand ? playerAName : playerBName} started FH
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
                    <span className="text-gray-600">Total Successful:</span>
                    <span className="font-semibold">{stats.playerATotalSuccessful}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success Rate:</span>
                    <span className="font-semibold">{stats.playerASuccessRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Forehand Success:</span>
                    <span className="font-semibold">{stats.playerAForehHandSuccess}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Backhand Success:</span>
                    <span className="font-semibold">{stats.playerABackhandSuccess}</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg text-[#34533A] mb-3">{playerBName} Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Successful:</span>
                    <span className="font-semibold">{stats.playerBTotalSuccessful}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success Rate:</span>
                    <span className="font-semibold">{stats.playerBSuccessRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Forehand Success:</span>
                    <span className="font-semibold">{stats.playerBForehHandSuccess}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Backhand Success:</span>
                    <span className="font-semibold">{stats.playerBBackhandSuccess}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={downloadImage}
              disabled={!profile?.is_premium}
              className="flex items-center gap-2 px-6 py-3 bg-[#547A51] text-white rounded-lg hover:bg-[#34533A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              <Download size={20} />
              Download Image
            </button>

            <button
              onClick={saveSession}
              disabled={isSaving || !profile?.is_premium}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              <Calendar size={20} />
              {isSaving ? 'Saving...' : 'Save Game'}
            </button>
          </div>

          <div className="space-y-3">
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="Email address"
              disabled={!profile?.is_premium}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#547A51] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={sendEmail}
              disabled={isSendingEmail || !profile?.is_premium}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#547A51] text-white rounded-lg hover:bg-[#34533A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              <Mail size={20} />
              {isSendingEmail ? 'Sending...' : 'Email'}
            </button>
          </div>

          {!profile?.is_premium && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              <p className="font-semibold mb-1">Premium Feature</p>
              <p>Upgrade to premium to download, save game history, and email results.</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={resetResults}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw size={20} />
              Reset Results
            </button>
            <button
              onClick={resetAll}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RotateCcw size={20} />
              Reset All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecondsChanceDrill;
