import React from 'react';
import { Target, Award, BarChart3, Users, ClipboardList, TrendingUp, Crosshair, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  const isPremium = subscription?.status === 'active' || subscription?.status === 'trialing';

  const handleScorecardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to use the Digital Scorecard Premium');
      return;
    }
    if (!isPremium && !subscriptionLoading) {
      alert('Digital Scorecard Premium requires an active subscription');
      navigate('/pricing');
      return;
    }
    navigate('/scorecard');
  };
  const drills = [
    {
      id: 'lead-vs-lead',
      title: 'Lead vs Lead',
      icon: Users,
      description: 'Two-player competitive drill with scoring',
      isPremium: false,
      comingSoon: false,
    },
    {
      id: 'seconds-chance',
      title: '2nd\'s Chance',
      icon: RefreshCw,
      description: 'Position practice with alternating hands',
      isPremium: false,
      comingSoon: false,
    },
    {
      id: '40-bowls-draw',
      title: '40 Bowls Draw Drill',
      icon: Crosshair,
      description: 'Comprehensive draw shot practice drill',
      isPremium: true,
      comingSoon: false,
    },
    {
      id: 'draw-shot',
      title: 'Draw Shot',
      icon: Target,
      description: 'Master the fundamental draw shot technique',
      isPremium: false,
      comingSoon: true,
    },
    {
      id: 'running-shot',
      title: 'Running Shot',
      icon: TrendingUp,
      description: 'Perfect your running shot accuracy',
      isPremium: true,
      comingSoon: true,
    },
    {
      id: 'weight-control',
      title: 'Weight Control',
      icon: BarChart3,
      description: 'Develop consistent weight control',
      isPremium: true,
      comingSoon: true,
    },
    {
      id: 'line-control',
      title: 'Line Control',
      icon: Award,
      description: 'Improve your line selection skills',
      isPremium: true,
      comingSoon: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F3F7F2]">
      <Hero />

      <section id="scorecard" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#34533A] mb-4">
              Digital Scorecard Premium
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Keep track of your games with our easy-to-use digital scorecard.
              Save, download, and email your results.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#C7D9C2] to-[#F3F7F2] rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow relative">
              <div className="absolute top-4 right-4 bg-[#547A51] text-white text-xs px-3 py-1 rounded-full">
                Premium
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    <ClipboardList className="w-12 h-12 text-[#547A51]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#34533A]">Score Card</h3>
                    <p className="text-gray-600">Track 2-4 players, 1-25 ends, download or email an image of your scorecard and more.</p>
                  </div>
                </div>
                <button
                  onClick={handleScorecardClick}
                  className="inline-block bg-[#547A51] text-white px-8 py-3 rounded-lg hover:bg-[#34533A] transition-colors font-medium shadow-md hover:shadow-lg cursor-pointer text-center"
                >
                  Open Scorecard
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="drills" className="py-16 bg-[#F3F7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#34533A] mb-4">
              Training Drills
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Elevate your game with professional training drills designed by experts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {drills.map((drill) => {
              const Icon = drill.icon;
              return (
                <Link
                  key={drill.id}
                  to={`/drill/${drill.id}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 group relative overflow-hidden"
                >
                  {drill.comingSoon && (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                      Coming Soon
                    </div>
                  )}
                  {drill.isPremium && !drill.comingSoon && (
                    <div className="absolute top-3 right-3 bg-[#547A51] text-white text-xs px-2 py-1 rounded-full">
                      Premium
                    </div>
                  )}
                  <div className="bg-[#C7D9C2] w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-[#34533A]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#34533A] mb-2">{drill.title}</h3>
                  <p className="text-gray-600 text-sm">{drill.description}</p>
                </Link>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/pricing"
              className="inline-flex items-center text-[#547A51] hover:text-[#34533A] font-medium"
            >
              <Users className="w-5 h-5 mr-2" />
              Unlock all premium drills with a subscription
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
