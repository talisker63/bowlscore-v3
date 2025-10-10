import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { STRIPE_PRODUCTS, type StripeProduct } from '../stripe-config';

export const useStripe = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (product: StripeProduct, promoCode?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to purchase');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to purchase');
      }

      const body: any = {
        priceId: product.priceId,
        mode: product.mode,
        successUrl: `https://bowlscore.com.au/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `https://bowlscore.com.au/pricing`,
      };

      if (promoCode) {
        body.promoCode = promoCode;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    products: STRIPE_PRODUCTS,
    createCheckoutSession,
    loading,
    error,
  };
};