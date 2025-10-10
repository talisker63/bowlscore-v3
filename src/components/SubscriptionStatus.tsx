import React, { useState, useEffect } from 'react';
import { Crown, Calendar, AlertCircle, XCircle } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getProductByPriceId } from '../stripe-config';

interface SubscriptionStatusProps {
  showManageButton?: boolean;
}

export function SubscriptionStatus({ showManageButton = false }: SubscriptionStatusProps) {
  const { subscription, stripeSubscription, isLoading, isPremium, refetch } = useSubscription();
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planName, setPlanName] = useState('Bowlscore Premium');

  useEffect(() => {
    if (stripeSubscription?.price_id) {
      const product = getProductByPriceId(stripeSubscription.price_id);
      if (product) {
        setPlanName(`Bowlscore ${product.name}`);
      }
    }
  }, [stripeSubscription]);

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You\'ll retain access until the end of your billing period.')) {
      return;
    }

    setCanceling(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-subscription`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel subscription');
      }

      await refetch();
      alert('Your subscription has been cancelled. You\'ll retain access until the end of your billing period.');
    } catch (err: any) {
      console.error('Error canceling subscription:', err);
      setError(err.message || 'Failed to cancel subscription');
    } finally {
      setCanceling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription || !isPremium) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
        <div className="flex items-center">
          <AlertCircle className="w-8 h-8 text-blue-600 mr-3" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">Free Plan</h3>
            <p className="text-sm text-blue-700">Upgrade to access all premium drills</p>
          </div>
          <Link
            to="/pricing"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Upgrade
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isCancelled = subscription?.status === 'canceled' || stripeSubscription?.cancel_at_period_end;

  return (
    <div>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
        <div className="flex items-center">
          <Crown className="w-8 h-8 text-green-600 mr-3" />
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 flex items-center">
              {planName}
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {subscription.status}
              </span>
            </h3>
            {subscription.current_period_end && (
              <p className="text-sm text-green-700 flex items-center mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                {isCancelled ? 'Access until' : 'Renews'} {formatDate(subscription.current_period_end)}
              </p>
            )}
          </div>
          {showManageButton && !isCancelled && (
            <button
              onClick={handleCancelSubscription}
              disabled={canceling}
              className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              {canceling ? 'Canceling...' : 'Cancel Subscription'}
            </button>
          )}
        </div>
        {isCancelled && (
          <div className="mt-3 pt-3 border-t border-green-200">
            <p className="text-sm text-green-700">
              Your subscription has been cancelled. You'll retain premium access until the end of your billing period.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
