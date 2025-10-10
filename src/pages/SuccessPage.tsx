import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Home, CreditCard } from 'lucide-react';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [countdown, setCountdown] = useState(5);
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionId) {
      // Simulate loading time for better UX
      const timer = setTimeout(() => {
        setLoading(false);
        setSessionData({ sessionId });
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!loading && sessionId && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!loading && sessionId && countdown === 0) {
      navigate('/');
    }
  }, [loading, sessionId, countdown, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Processing your payment...
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your subscription
          </p>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invalid Session
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't find your payment session. Please try again.
          </p>
          <Link
            to="/pricing"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Back to Pricing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-2">
          Thank you for subscribing to Bowlscore Premium!
        </p>
        
        <p className="text-sm text-gray-500 mb-8">
          You now have access to all premium features including advanced drills,
          scorecard history, and detailed analytics.
        </p>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            Redirecting to homepage in <strong>{countdown}</strong> seconds...
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5 inline mr-2" />
            Go to Homepage Now
          </Link>

          <Link
            to="/drills"
            className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Explore Premium Drills
          </Link>
        </div>

        <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800">
            <strong>What's next?</strong><br />
            Check your email for a receipt and start exploring your new premium features!
          </p>
        </div>
      </div>
    </div>
  );
}