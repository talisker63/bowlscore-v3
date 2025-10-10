import React from 'react';
import { Target, TrendingUp, Calendar, Plus, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SubscriptionStatus } from '../components/SubscriptionStatus';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800">Welcome back!</h1>
          <p className="text-gray-600 mt-2">Track your progress and manage your training</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Crown className="w-6 h-6 mr-2 text-yellow-500" />
                Subscription
              </h2>
              <SubscriptionStatus />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-6 h-6 mr-2 text-green-600" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/scorecard"
                  className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
                >
                  <Plus className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">New Scorecard</h3>
                    <p className="text-sm text-gray-600">Track a game</p>
                  </div>
                </Link>

                <Link
                  to="/drill/draw-shot"
                  className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                >
                  <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Training Drills</h3>
                    <p className="text-sm text-gray-600">Practice your skills</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-purple-600" />
                Recent Activity
              </h2>
              <p className="text-gray-600 text-sm">No recent activity yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
