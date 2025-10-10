import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-[#F3F7F2] to-[#C7D9C2] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#34533A] leading-tight">
              Lawn Bowls Score Cards and Drills
              <span className="block text-sm font-normal text-gray-500 mt-2">(Alpha-1)</span>
            </h1>
            <p className="text-base text-gray-600">
              Master your game with professional training drills and digital scorekeeping.
              Track your progress, analyze your performance, and take your skills to the next level.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/simple-scorecard"
                className="inline-flex items-center justify-center bg-[#547A51] text-white px-6 py-3 rounded-lg hover:bg-[#34533A] transition-colors group"
              >
                Start Scoring
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="/#drills"
                className="inline-flex items-center justify-center border-2 border-[#547A51] text-[#547A51] px-6 py-3 rounded-lg hover:bg-[#547A51] hover:text-white transition-colors"
              >
                View Drills
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/20250406_144434.jpg"
                alt="Lawn bowls on green"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="bg-[#C7D9C2] p-3 rounded-lg">
                  <svg className="w-8 h-8 text-[#34533A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#34533A]">10+</p>
                  <p className="text-sm text-gray-600">Training Drills</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
