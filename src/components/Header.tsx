import React, { useState } from 'react';
import { Menu, X, User, LogOut, Home, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import AuthModal from './AuthModal';

const Header: React.FC = () => {
  const { user, profile, signOut, isPremium } = useAuth();
  const { isPremium: subscriptionIsPremium } = useSubscription();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/" className="text-xl font-bold text-[#34533A]">
                Lawn Bowls Training
              </a>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <a href="/" className="text-[#547A51] hover:text-[#34533A] transition-colors">
                Home
              </a>
              <a href="/#drills" className="text-[#547A51] hover:text-[#34533A] transition-colors">
                Drills
              </a>
              <a href="/scorecard" className="text-[#547A51] hover:text-[#34533A] transition-colors">
                Scorecard
              </a>
              <a href="/pricing" className="text-[#547A51] hover:text-[#34533A] transition-colors">
                Pricing
              </a>

              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="w-4 h-4 text-[#547A51]" />
                    <span className="text-[#34533A]">{profile?.name || profile?.email}</span>
                    {isPremium && (
                      <span className="bg-[#547A51] text-white text-xs px-2 py-1 rounded">
                        Premium
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      signOut();
                    }}
                    className="text-[#547A51] hover:text-[#34533A] transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-[#547A51] text-white px-4 py-2 rounded-lg hover:bg-[#34533A] transition-colors"
                >
                  Login
                </button>
              )}
            </div>

            <button
              className="md:hidden text-[#547A51]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3">
              <a
                href="/"
                className="block text-[#547A51] hover:text-[#34533A] transition-colors"
              >
                Home
              </a>
              <a
                href="/#drills"
                className="block text-[#547A51] hover:text-[#34533A] transition-colors"
              >
                Drills
              </a>
              <a
                href="/scorecard"
                className="block text-[#547A51] hover:text-[#34533A] transition-colors"
              >
                Scorecard
              </a>
              <a
                href="/pricing"
                className="block text-[#547A51] hover:text-[#34533A] transition-colors"
              >
                Pricing
              </a>

              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="w-4 h-4 text-[#547A51]" />
                    <span className="text-[#34533A]">{profile?.name || profile?.email}</span>
                    {isPremium && (
                      <span className="bg-[#547A51] text-white text-xs px-2 py-1 rounded">
                        Premium
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      signOut();
                    }}
                    className="flex items-center space-x-2 text-[#547A51] hover:text-[#34533A] transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full bg-[#547A51] text-white px-4 py-2 rounded-lg hover:bg-[#34533A] transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          )}
        </nav>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default Header;