import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Subscription {
  id: string;
  user_id: string;
  provider: string;
  provider_customer_id: string | null;
  provider_sub_id: string | null;
  status: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

interface StripeSubscription {
  cancel_at_period_end: boolean;
  current_period_end: number;
  price_id: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [stripeSubscription, setStripeSubscription] = useState<StripeSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setStripeSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subError) {
        throw subError;
      }

      setSubscription(data);

      if (data?.provider_customer_id) {
        const { data: stripeData } = await supabase
          .from('stripe_subscriptions')
          .select('cancel_at_period_end, current_period_end, price_id')
          .eq('customer_id', data.provider_customer_id)
          .maybeSingle();

        setStripeSubscription(stripeData);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const isPremium = subscription?.status === 'active' || subscription?.status === 'trialing';

  return {
    subscription,
    stripeSubscription,
    isLoading,
    isPremium,
    error,
    refetch: fetchSubscription,
  };
}
