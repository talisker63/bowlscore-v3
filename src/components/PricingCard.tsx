import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { StripeProduct } from '../stripe-config';
import { useAuth } from '../contexts/AuthContext';

interface PricingCardProps {
  product: StripeProduct;
  isPopular?: boolean;
}

export function PricingCard({ product, isPopular = false }: PricingCardProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      alert('Please sign in to subscribe');
      return;
    }

    setIsLoading(true);

    try {
      const priceId = product.name.includes('Annual') ? 'annual' : 'monthly';

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          mode: 'subscription',
          promoCode: promoCode.trim() || undefined,
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert(error instanceof Error ? error.message : 'Failed to start checkout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative rounded-2xl p-8 ${
      isPopular 
        ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 shadow-xl' 
        : 'bg-white border border-gray-200 shadow-lg'
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-6">{product.description}</p>
        
        <div className="mb-8">
          <span className="text-4xl font-bold text-gray-900">
            {product.currencySymbol}{product.price}
          </span>
          {product.mode === 'subscription' && (
            <span className="text-gray-600 ml-2">/{product.interval}</span>
          )}
        </div>

        {showPromoInput && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Promo Code
            </label>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter promo code"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#547A51] focus:border-transparent"
            />
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            isPopular
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-900 hover:bg-gray-800 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            'Get Started'
          )}
        </button>

        {!showPromoInput && (
          <button
            onClick={() => setShowPromoInput(true)}
            type="button"
            className="mt-2 text-sm text-[#547A51] hover:text-[#34533A] font-medium"
          >
            Have a promo code?
          </button>
        )}
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex items-center">
          <Check className="w-5 h-5 text-green-500 mr-3" />
          <span className="text-gray-700">Access to all drills</span>
        </div>
        <div className="flex items-center">
          <Check className="w-5 h-5 text-green-500 mr-3" />
          <span className="text-gray-700">Unlimited scorecards</span>
        </div>
        <div className="flex items-center">
          <Check className="w-5 h-5 text-green-500 mr-3" />
          <span className="text-gray-700">Progress tracking</span>
        </div>
        <div className="flex items-center">
          <Check className="w-5 h-5 text-green-500 mr-3" />
          <span className="text-gray-700">Premium support</span>
        </div>
      </div>
    </div>
  );
}