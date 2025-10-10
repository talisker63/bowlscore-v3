import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Play, Lock, CheckCircle } from 'lucide-react';
import AuthModal from '../components/AuthModal';
import FortyBowlsDrawDrill from '../components/FortyBowlsDrawDrill';
import LeadVsLeadDrill from '../components/LeadVsLeadDrill';
import SecondsChanceDrill from '../components/SecondsChanceDrill';

const drillsData: Record<string, any> = {
  'draw-shot': {
    title: 'Draw Shot Drill',
    description: 'Master the fundamental draw shot technique with this comprehensive drill.',
    isPremium: false,
    heroImage: '/20250406_144434.jpg',
    instructions: [
      'Place the jack at the center of the green',
      'Position yourself at the mat',
      'Bowl 4 bowls attempting to get as close as possible to the jack',
      'Measure the distance of each bowl from the jack',
      'Record your results and repeat',
    ],
    objectives: [
      'Develop consistent weight control',
      'Improve line accuracy',
      'Build muscle memory for draw shots',
    ],
  },
  'running-shot': {
    title: 'Running Shot Drill',
    description: 'Perfect your running shot accuracy and power control.',
    isPremium: true,
    heroImage: '/20250406_144441.jpg',
    instructions: [
      'Set up target bowls at various distances',
      'Practice running shots with different weights',
      'Focus on maintaining accuracy while increasing speed',
      'Record successful hits out of 10 attempts',
    ],
    objectives: [
      'Master weight variation',
      'Develop power control',
      'Improve shot selection skills',
    ],
  },
  'weight-control': {
    title: 'Weight Control Drill',
    description: 'Develop consistent weight control across different distances.',
    isPremium: true,
    heroImage: '/20250406_144511.jpg',
    instructions: [
      'Mark 3 targets at different distances',
      'Bowl 4 bowls to each target',
      'Focus on smooth, consistent delivery',
      'Score based on proximity to each target',
    ],
    objectives: [
      'Build consistent delivery rhythm',
      'Develop feel for different weights',
      'Improve distance judgment',
    ],
  },
  'line-control': {
    title: 'Line Control Drill',
    description: 'Improve your line selection and execution skills.',
    isPremium: true,
    heroImage: '/20250406_144434.jpg',
    instructions: [
      'Set up markers for narrow, medium, and wide lines',
      'Practice bowling to each line consistently',
      'Focus on shoulder position and follow-through',
      'Record accuracy for each line type',
    ],
    objectives: [
      'Master different line options',
      'Improve line consistency',
      'Develop strategic shot selection',
    ],
  },
  '40-bowls-draw': {
    title: '40 Bowls Draw Drill',
    description: 'Comprehensive draw shot practice with detailed tracking and analysis.',
    isPremium: true,
    heroImage: '/20250406_144434.jpg',
    hasCustomComponent: true,
    instructions: [
      'Complete 10 ends of practice',
      'Each end includes 2 bowls at long jack and 2 at short jack',
      'Alternate between forehand and backhand',
      'Record success/miss details for each bowl',
      'Track your progress over time',
    ],
    objectives: [
      'Develop consistent draw shot technique',
      'Improve accuracy at different jack lengths',
      'Build proficiency with both forehand and backhand',
      'Analyze miss patterns to identify areas for improvement',
    ],
  },
  'lead-vs-lead': {
    title: 'Lead vs Lead',
    description: 'Two-player competitive drill with scoring based on held shots and penalties.',
    isPremium: false,
    heroImage: '/20250406_144441.jpg',
    hasCustomComponent: true,
    instructions: [
      'Set up a game for 2 players with 2-4 bowls per player',
      'Choose the number of ends (default 10)',
      'Mark each bowl as GOOD, CROSSED and/or SHORT using checkboxes',
      'At end completion, select which player won shot and number of shots won',
      'Score 3 points per shot won, minus 1 point for each crossed or short bowl (1 bowl short is ok)',
      'Player who did not win shot scores 0 (minus any penalties)',
      'Track cumulative scores and statistics throughout the game',
    ],
    objectives: [
      'Focus on positional bowls for Lead Players, close and behind the jack',
      'Practice under game-like pressure',
      'Improve consistency and accuracy',
      'Minimize penalties (crossed and short bowls)',
      'Build strategic thinking for shot selection',
    ],
  },
  'seconds-chance': {
    title: '2nd\'s Chance',
    description: 'Position practice drill with alternating hand starts each end.',
    isPremium: true,
    heroImage: '/20250406_144511.jpg',
    hasCustomComponent: true,
    instructions: [
      'Set up a game for 2 players with 2 or 4 bowls per player',
      'Players alternate who starts forehand each end',
      'Bowl 1: Must finish between jack and 2m beyond, within mat length to side, without crossing',
      'Bowls 2-4: Must finish within mat length of jack',
      'First 2 bowls on one hand, next 2 bowls on opposite hand',
      'Score 1 point per successful bowl, no penalties',
      'Track forehand and backhand success rates',
    ],
    objectives: [
      'Develop precise weight control for position play',
      'Build FH / BH bowling skills',
      'Practice finishing bowls in specific zones',
      'Improve consistency on both forehand and backhand',
      'Master position bowling for seconds role',
    ],
  },
};

const DrillPage: React.FC = () => {
  const { drillId } = useParams<{ drillId: string }>();
  const { user, isPremium } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [drillStarted, setDrillStarted] = useState(false);

  const drill = drillId ? drillsData[drillId] : null;

  if (!drill) {
    return (
      <div className="min-h-screen bg-[#F3F7F2] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#34533A] mb-4">Drill Not Found</h1>
          <a href="/" className="text-[#547A51] hover:text-[#34533A]">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  const canAccess = !drill.isPremium || isPremium;

  const handleStartDrill = () => {
    if (drill.isPremium && !isPremium) {
      window.location.href = '/pricing';
      return;
    }
    setDrillStarted(true);
  };

  return (
    <div className="min-h-screen bg-[#F3F7F2]">
      <div
        className="h-64 md:h-96 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${drill.heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-2">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{drill.title}</h1>
              {drill.isPremium && (
                <span className="bg-[#547A51] text-white px-3 py-1 rounded-full text-sm inline-block">
                  Premium
                </span>
              )}
            </div>
            <p className="text-white text-lg">{drill.description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!canAccess && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8 flex items-start space-x-4">
            <Lock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-900 mb-2">Premium Content</h3>
              <p className="text-yellow-800 mb-4">
                This drill is available to premium subscribers. Upgrade to access all premium drills and features.
              </p>
              <a
                href="/pricing"
                className="inline-block bg-[#547A51] text-white px-6 py-2 rounded-lg hover:bg-[#34533A] transition-colors"
              >
                View Pricing
              </a>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-[#34533A] mb-4">Instructions</h2>
            <ol className="space-y-3">
              {drill.instructions.map((instruction: string, index: number) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#C7D9C2] rounded-full flex items-center justify-center text-[#34533A] text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-[#34533A] mb-4">Objectives</h2>
            <ul className="space-y-3">
              {drill.objectives.map((objective: string, index: number) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-[#547A51] flex-shrink-0" />
                  <span className="text-gray-700">{objective}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <button
                onClick={handleStartDrill}
                disabled={!canAccess}
                className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-colors ${
                  canAccess
                    ? 'bg-[#547A51] text-white hover:bg-[#34533A]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {canAccess ? (
                  <>
                    <Play className="w-5 h-5" />
                    <span>{drillStarted ? 'Drill In Progress' : 'Start Drill'}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Locked</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {drillStarted && canAccess && drill.hasCustomComponent && drillId === '40-bowls-draw' && (
          <div className="mt-8">
            <FortyBowlsDrawDrill />
          </div>
        )}

        {drillStarted && canAccess && drill.hasCustomComponent && drillId === 'lead-vs-lead' && (
          <div className="mt-8">
            <LeadVsLeadDrill />
          </div>
        )}

        {drillStarted && canAccess && drill.hasCustomComponent && drillId === 'seconds-chance' && (
          <div className="mt-8">
            <SecondsChanceDrill />
          </div>
        )}

        {drillStarted && canAccess && !drill.hasCustomComponent && (
          <div className="mt-8 bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-[#34533A] mb-4">Drill Progress</h2>
            <div className="bg-[#F3F7F2] rounded-lg p-6 text-center">
              <p className="text-gray-600 mb-4">
                Track your progress and record your results below
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Attempts</p>
                  <p className="text-3xl font-bold text-[#34533A]">0</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                  <p className="text-3xl font-bold text-[#547A51]">0%</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Best Score</p>
                  <p className="text-3xl font-bold text-[#34533A]">-</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Avg Score</p>
                  <p className="text-3xl font-bold text-[#547A51]">-</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default DrillPage;
