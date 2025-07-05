import React from 'react';

interface LandingPageProps {
  onPlayClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onPlayClick }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-6xl font-bold mb-4">Cluify</h1>
      <p className="text-xl mb-8 text-center max-w-md">
        Become a detective, analyze evidence, and solve cases. Can you identify the correct suspect?
      </p>
      <button
        onClick={onPlayClick}
        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
      >
        Play
      </button>
    </div>
  );
};

export default LandingPage; 