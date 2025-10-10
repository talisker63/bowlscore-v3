import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Target, Download, Save, Mail, Calendar, History, ArrowLeft } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface BowlResult {
  success: boolean;
  short: boolean;
  long: boolean;
  wide: boolean;
  narrow: boolean;
}

interface EndData {
  longJack: [BowlResult, BowlResult];
  shortJack: [BowlResult, BowlResult];
  isForehanded: boolean;
}

interface DrillSession {
  id: string;
  player_name: string;
  session_date: string;
  surface: string;
  weather: string;
  notes: string;
  ends_data: EndData[];
  total_bowls: number;
  successful_bowls: number;
  success_percentage: number;
  image_url: string;
  stats_data: any;
  created_at: string;
}

const INITIAL_BOWL_RESULT: BowlResult = {
  success: false,
  short: false,
  long: false,
  wide: false,
  narrow: false,
};

const FortyBowlsDrawDrill: React.FC = () => {
  const scoreCardRef = useRef<HTMLDivElement>(null);
  const [playerName, setPlayerName] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [surface, setSurface] = useState('');
  const [weather, setWeather] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historySessions, setHistorySessions] = useState<DrillSession[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [ends, setEnds] = useState<EndData[]>(
    Array.from({ length: 10 }, (_, index) => ({
      longJack: [{ ...INITIAL_BOWL_RESULT }, { ...INITIAL_BOWL_RESULT }],
      shortJack: [{ ...INITIAL_BOWL_RESULT }, { ...INITIAL_BOWL_RESULT }],
      isForehanded: index % 2 === 0,
    }))
  );

  const { user, profile } = useAuth();

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
        .from('drill_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('drill_type', '40-bowls-draw')
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

  const loadSession = (session: DrillSession) => {
    setPlayerName(session.player_name || '');
    setSessionDate(session.session_date || '');
    setSurface(session.surface || '');
    setWeather(session.weather ? session.weather.split(', ') : []);
    setNotes(session.notes || '');
    setEnds(session.ends_data || []);
    setShowHistory(false);
  };

  const toggleBowlAttribute = (
    endIndex: number,
    jackType: 'longJack' | 'shortJack',
    bowlIndex: number,
    attribute: 'success' | 'short' | 'long' | 'wide' | 'narrow'
  ) => {
    const newEnds = [...ends];
    const bowl = newEnds[endIndex][jackType][bowlIndex];

    if (attribute === 'success') {
      bowl.success = !bowl.success;
      if (bowl.success) {
        bowl.short = false;
        bowl.long = false;
        bowl.wide = false;
        bowl.narrow = false;
      }
    } else {
      if (bowl.success) return;
      bowl[attribute] = !bowl[attribute];

      if (attribute === 'short' && bowl.short) {
        bowl.long = false;
      } else if (attribute === 'long' && bowl.long) {
        bowl.short = false;
      }

      if (attribute === 'wide' && bowl.wide) {
        bowl.narrow = false;
      } else if (attribute === 'narrow' && bowl.narrow) {
        bowl.wide = false;
      }
    }

    setEnds(newEnds);
  };

  const resetScoreCard = () => {
    setPlayerName('');
    setSessionDate('');
    setSurface('');
    setWeather([]);
    setNotes('');
    setEnds(
      Array.from({ length: 10 }, (_, index) => ({
        longJack: [{ ...INITIAL_BOWL_RESULT }, { ...INITIAL_BOWL_RESULT }],
        shortJack: [{ ...INITIAL_BOWL_RESULT }, { ...INITIAL_BOWL_RESULT }],
        isForehanded: index % 2 === 0,
      }))
    );
  };

  const calculateStats = () => {
    let totalBowls = 0;
    let successfulBowls = 0;
    const missTypes = { short: 0, long: 0, wide: 0, narrow: 0 };
    const shortJack = { total: 0, successful: 0 };
    const longJack = { total: 0, successful: 0 };
    const forehandShort = { total: 0, successful: 0 };
    const forehandLong = { total: 0, successful: 0 };
    const backhandShort = { total: 0, successful: 0 };
    const backhandLong = { total: 0, successful: 0 };

    ends.forEach((end) => {
      const isForehanded = end.isForehanded;

      end.longJack.forEach((bowl) => {
        totalBowls++;
        longJack.total++;
        if (isForehanded) {
          forehandLong.total++;
        } else {
          backhandLong.total++;
        }

        if (bowl.success) {
          successfulBowls++;
          longJack.successful++;
          if (isForehanded) {
            forehandLong.successful++;
          } else {
            backhandLong.successful++;
          }
        } else {
          if (bowl.short) missTypes.short++;
          if (bowl.long) missTypes.long++;
          if (bowl.wide) missTypes.wide++;
          if (bowl.narrow) missTypes.narrow++;
        }
      });

      end.shortJack.forEach((bowl) => {
        totalBowls++;
        shortJack.total++;
        if (isForehanded) {
          forehandShort.total++;
        } else {
          backhandShort.total++;
        }

        if (bowl.success) {
          successfulBowls++;
          shortJack.successful++;
          if (isForehanded) {
            forehandShort.successful++;
          } else {
            backhandShort.successful++;
          }
        } else {
          if (bowl.short) missTypes.short++;
          if (bowl.long) missTypes.long++;
          if (bowl.wide) missTypes.wide++;
          if (bowl.narrow) missTypes.narrow++;
        }
      });
    });

    const percentage = totalBowls > 0 ? Math.round((successfulBowls / totalBowls) * 100) : 0;

    return {
      totalBowls,
      successfulBowls,
      percentage,
      missTypes,
      shortJack,
      longJack,
      forehandShort,
      forehandLong,
      backhandShort,
      backhandLong,
    };
  };

  const stats = calculateStats();

  const toggleWeather = (condition: string) => {
    setWeather((prev) =>
      prev.includes(condition) ? prev.filter((w) => w !== condition) : [...prev, condition]
    );
  };

  const downloadImage = async () => {
    if (!scoreCardRef.current) return;

    try {
      const canvas = await html2canvas(scoreCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowHeight: scoreCardRef.current.scrollHeight,
        height: scoreCardRef.current.scrollHeight,
      });

      const link = document.createElement('a');
      link.download = `40-bowls-drill-${Date.now()}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image');
    }
  };

  const handleSaveSession = async () => {
    if (!user) {
      alert('You must be logged in to save sessions');
      return;
    }

    setIsSaving(true);

    try {
      if (!scoreCardRef.current) {
        throw new Error('Scorecard not ready');
      }

      const canvas = await html2canvas(scoreCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowHeight: scoreCardRef.current.scrollHeight,
        height: scoreCardRef.current.scrollHeight,
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.95);
      });

      const fileName = `${user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('scorecards')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('scorecards').getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('drill_sessions').insert({
        user_id: user.id,
        drill_type: '40-bowls-draw',
        player_name: playerName,
        session_date: sessionDate || new Date().toISOString().split('T')[0],
        surface,
        weather: weather.join(', '),
        notes,
        ends_data: ends,
        total_bowls: stats.totalBowls,
        successful_bowls: stats.successfulBowls,
        success_percentage: stats.percentage,
        image_url: publicUrl,
        stats_data: {
          shortJack: stats.shortJack,
          longJack: stats.longJack,
          forehandShort: stats.forehandShort,
          forehandLong: stats.forehandLong,
          backhandShort: stats.backhandShort,
          backhandLong: stats.backhandLong,
          missTypes: stats.missTypes,
        },
      });

      if (dbError) throw dbError;

      alert('Session saved successfully!');
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save session');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailAddress || !scoreCardRef.current) return;

    setIsSendingEmail(true);

    try {
      const canvas = await html2canvas(scoreCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowHeight: scoreCardRef.current.scrollHeight,
        height: scoreCardRef.current.scrollHeight,
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.95);
      });

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email-scorecard`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: emailAddress,
            imageData: base64data,
            playerName: playerName || 'Player',
            stats: {
              totalBowls: stats.totalBowls,
              successfulBowls: stats.successfulBowls,
              percentage: stats.percentage,
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send email');
        }

        alert('Email sent successfully!');
        setEmailAddress('');
      };
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (showHistory) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <History className="w-8 h-8 text-[#547A51]" />
              <h1 className="text-3xl font-bold text-[#34533A]">Session History</h1>
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="flex items-center space-x-2 px-4 py-2 bg-[#547A51] hover:bg-[#34533A] text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Drill</span>
            </button>
          </div>

          {isLoadingHistory ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#547A51] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading history...</p>
            </div>
          ) : historySessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No previous sessions found</p>
              <button
                onClick={() => setShowHistory(false)}
                className="px-6 py-2 bg-[#547A51] hover:bg-[#34533A] text-white rounded-lg transition-colors"
              >
                Start New Session
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {historySessions.map((session) => (
                <div key={session.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {session.image_url && (
                    <img
                      src={session.image_url}
                      alt={`Session from ${session.session_date}`}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => loadSession(session)}
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-[#34533A] mb-2">
                      {session.player_name || 'Unnamed Session'}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <p><Calendar className="w-4 h-4 inline mr-1" />{new Date(session.session_date).toLocaleDateString()}</p>
                      <p>Success Rate: <span className="font-bold text-[#547A51]">{session.success_percentage}%</span></p>
                      <p>{session.successful_bowls}/{session.total_bowls} bowls</p>
                    </div>
                    <button
                      onClick={() => loadSession(session)}
                      className="w-full px-4 py-2 bg-[#547A51] hover:bg-[#34533A] text-white rounded-lg transition-colors"
                    >
                      Load Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div ref={scoreCardRef} className="bg-white rounded-lg shadow-lg p-6 pb-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-[#547A51]" />
            <h1 className="text-3xl font-bold text-[#34533A]">40 Bowls Draw Drill</h1>
          </div>
          <button
            onClick={() => setShowHistory(true)}
            disabled={!user}
            className="flex items-center space-x-2 px-4 py-2 bg-[#547A51] hover:bg-[#34533A] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Player Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#547A51] focus:border-transparent text-base"
              placeholder="Enter name"
              style={{ fontFamily: 'Arial, Helvetica, sans-serif', height: '3.5rem', display: 'flex', alignItems: 'center' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#547A51] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Surface</label>
            <select
              value={surface}
              onChange={(e) => setSurface(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#547A51] focus:border-transparent text-base"
              style={{ fontFamily: 'Arial, Helvetica, sans-serif', height: '3.5rem' }}
            >
              <option value="">Select surface</option>
              <option value="grass">Grass</option>
              <option value="synthetic">Synthetic</option>
              <option value="indoor">Indoor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Weather</label>
            <div className="flex flex-wrap gap-2">
              {['Sunny', 'Cloudy', 'Windy', 'Very Windy', 'Rainy', 'Indoor'].map((condition) => (
                <button
                  key={condition}
                  onClick={() => toggleWeather(condition)}
                  className={`px-4 py-3 text-sm rounded-full transition-colors ${
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
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#34533A] mb-4">Score Grid</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#C7D9C2]">
                  <th className="border border-gray-300 px-1 py-3 text-xs w-10">End</th>
                  <th colSpan={2} className="border border-gray-300 px-2 py-3 text-xs">
                    <div>Long</div>
                    <div>Jack</div>
                  </th>
                  <th colSpan={2} className="border border-gray-300 px-2 py-3 text-xs">
                    <div>Short</div>
                    <div>Jack</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ends.map((end, endIndex) => (
                  <tr key={endIndex}>
                    <td className="border border-gray-300 px-1 py-3 text-center w-10">
                      <div className="font-bold text-xs">{endIndex + 1}</div>
                      <div className="text-[10px] text-gray-600">{end.isForehanded ? 'FH' : 'BH'}</div>
                    </td>
                    {end.longJack.map((bowl, bowlIndex) => (
                      <td key={`long-${bowlIndex}`} className="border border-gray-300 p-1.5">
                        <div className="space-y-1.5">
                          <button
                            onClick={() =>
                              toggleBowlAttribute(endIndex, 'longJack', bowlIndex, 'success')
                            }
                            className={`w-full py-2.5 text-sm font-semibold rounded ${
                              bowl.success
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            ✓
                          </button>
                          <div className="grid grid-cols-2 gap-1">
                            {(['short', 'long', 'wide', 'narrow'] as const).map((attr) => (
                              <button
                                key={attr}
                                onClick={() =>
                                  toggleBowlAttribute(endIndex, 'longJack', bowlIndex, attr)
                                }
                                className={`py-2 text-xs font-semibold rounded ${
                                  bowl[attr]
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                                disabled={bowl.success}
                              >
                                {attr[0].toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                    ))}
                    {end.shortJack.map((bowl, bowlIndex) => (
                      <td key={`short-${bowlIndex}`} className="border border-gray-300 p-1.5">
                        <div className="space-y-1.5">
                          <button
                            onClick={() =>
                              toggleBowlAttribute(endIndex, 'shortJack', bowlIndex, 'success')
                            }
                            className={`w-full py-2.5 text-sm font-semibold rounded ${
                              bowl.success
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            ✓
                          </button>
                          <div className="grid grid-cols-2 gap-1">
                            {(['short', 'long', 'wide', 'narrow'] as const).map((attr) => (
                              <button
                                key={attr}
                                onClick={() =>
                                  toggleBowlAttribute(endIndex, 'shortJack', bowlIndex, attr)
                                }
                                className={`py-2 text-xs font-semibold rounded ${
                                  bowl[attr]
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                                disabled={bowl.success}
                              >
                                {attr[0].toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#F3F7F2] rounded-lg p-4">
            <h3 className="text-lg font-bold text-[#34533A] mb-3">Overall Statistics</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Bowls</p>
                <p className="text-2xl font-bold text-[#34533A]">{stats.totalBowls}</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Successful</p>
                <p className="text-2xl font-bold text-green-600">{stats.successfulBowls}</p>
              </div>
              <div className="bg-white rounded-lg p-4 col-span-2">
                <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                <p className="text-3xl font-bold text-[#547A51]">{stats.percentage}%</p>
              </div>
            </div>
          </div>

          <div className="bg-[#F3F7F2] rounded-lg p-4">
            <h3 className="text-lg font-bold text-[#34533A] mb-3">Miss Analysis</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Short</p>
                <p className="text-xl font-bold text-red-600">{stats.missTypes.short}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Long</p>
                <p className="text-xl font-bold text-red-600">{stats.missTypes.long}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Wide</p>
                <p className="text-xl font-bold text-red-600">{stats.missTypes.wide}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Narrow</p>
                <p className="text-xl font-bold text-red-600">{stats.missTypes.narrow}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white min-h-[90px]" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
            {notes || <span className="text-gray-400">No notes added</span>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Edit Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#547A51] focus:border-transparent resize-none"
            placeholder="Add any notes about this session..."
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={downloadImage}
            className="flex items-center space-x-2 px-6 py-3 bg-[#547A51] hover:bg-[#34533A] text-white rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Download Image</span>
          </button>

          <button
            onClick={handleSaveSession}
            disabled={isSaving || !user}
            className="flex items-center space-x-2 px-6 py-3 bg-[#547A51] hover:bg-[#34533A] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Saving...' : 'Save Session'}</span>
          </button>

          <button
            onClick={resetScoreCard}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset</span>
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Scorecard</label>
          <div className="space-y-3">
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#547A51] focus:border-transparent"
              placeholder="Enter email address"
            />
            <button
              onClick={handleSendEmail}
              disabled={isSendingEmail || !emailAddress}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-[#547A51] hover:bg-[#34533A] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="w-5 h-5" />
              <span>{isSendingEmail ? 'Sending...' : 'Send Email'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FortyBowlsDrawDrill;
