import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

const Footer: React.FC = () => {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-[#34533A] text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={() => setFeedbackModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-[#547A51] hover:bg-[#C7D9C2] hover:text-[#34533A] text-white px-6 py-2 rounded-lg transition-colors font-medium"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Send Feedback or Suggest a Drill</span>
            </button>
            <p className="text-sm">© Copyright Andrew Sleight 2025</p>
          </div>
        </div>
      </footer>

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
      />
    </>
  );
};

export default Footer;
