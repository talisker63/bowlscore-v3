import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useStripe } from '../hooks/useStripe';
import { useSubscription } from '../hooks/useSubscription';
import DiscountRequestModal from '../components/DiscountRequestModal';

export default function PricingPage() {
  const { products, createCheckoutSession, loading, error } = useStripe();
  const { subscription, isActive } = useSubscription();
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);

  const handlePurchase = (product: any) => {
    createCheckoutSession(product, promoCode || undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get full access to all Premium Drills and the Premium Scorecard with advanced features
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {isActive && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            You currently have an active subscription: {subscription?.productName}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {products.map((product) => {
            const isCurrentPlan = subscription?.priceId === product.priceId;
            
            return (
              <div
                key={product.id}
                className={`bg-white rounded-2xl shadow-lg p-8 relative ${
                  product.name.includes('Annual') ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {product.name.includes('Annual') && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Best Value
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {product.currencySymbol}{product.price}
                    </span>
                    <span className="text-gray-600 ml-2">
                      /{product.name.includes('Annual') ? 'year' : 'month'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">All Premium Drills</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Premium Scorecard</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Save Session History</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Email Session Details</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Advanced Analytics</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(product)}
                  disabled={loading || isCurrentPlan}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : product.name.includes('Annual')
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : (
                    'Get Started'
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All plans include a 7-day free trial. Cancel anytime.
          </p>

          <div className="mb-4">
            {!showPromoInput ? (
              <button
                onClick={() => setShowPromoInput(true)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
              >
                Have a promo code?
              </button>
            ) : (
              <div className="max-w-sm mx-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => {
                      setShowPromoInput(false);
                      setPromoCode('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
                {promoCode && (
                  <p className="text-sm text-green-600 mt-2">
                    Code will be applied at checkout
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowDiscountModal(true)}
            className="text-[#547A51] hover:text-[#34533A] font-medium text-sm underline"
          >
            Need financial assistance? Request a 100% discount
          </button>
        </div>
      </div>

      <DiscountRequestModal
        isOpen={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
      />
    </div>
  );
}