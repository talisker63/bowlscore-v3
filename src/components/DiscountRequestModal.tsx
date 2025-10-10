import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DiscountRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DiscountRequestModal: React.FC<DiscountRequestModalProps> = ({ isOpen, onClose }) => {
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/discount-request`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id,
            name,
            email,
            reason,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setName('');
        setEmail('');
        setReason('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-[#34533A] mb-4">Request 100% Discount</h2>

        <p className="text-gray-600 mb-6">
          We believe everyone should have access to quality training. If the subscription cost is a barrier,
          please tell us about your situation. All requests are reviewed personally by Andrew Sleight.
        </p>

        {success ? (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg">
            <p className="font-medium">Request submitted successfully!</p>
            <p className="text-sm mt-1">
              You'll receive an email notification once your request has been reviewed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#34533A] mb-1">
                Your Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#547A51] focus:border-transparent"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#34533A] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#547A51] focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#34533A] mb-1">
                Please tell us why you need assistance *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#547A51] focus:border-transparent"
                placeholder="Tell us about your situation..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Be honest and specific. We review each request carefully.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#547A51] text-white py-3 rounded-lg hover:bg-[#34533A] transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default DiscountRequestModal;
