import React from 'react';
import { Case, Report } from '../types';

interface GameScreenProps {
  activeCase: Case | null;
  reports: Report[];
  isLoading: boolean;
  error: string | null;
}

const GameScreen: React.FC<GameScreenProps> = ({ activeCase, reports, isLoading, error }) => {
  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            Loading...
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            Error: {error}
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* <Header /> */}
      <main className="flex-grow p-4 flex items-center justify-center">
        {!activeCase ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">No Active Case Found</h2>
            <p>There is no active case to investigate at the moment. Please check back later.</p>
          </div>
        ) : (
          <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-2 text-center">{activeCase.title}</h2>
            <p className="mb-6 text-center text-lg">{activeCase.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report) => (
                <div key={report.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                  <h3 className="font-bold border-b border-gray-300 dark:border-gray-600 pb-2 mb-2">Witness Report</h3>
                  <p className="italic">"{report.details}"</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-right">
                    {new Date(report.reportDate).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      {/* Modals will go here */}
      {/* <HowToPlayModal /> */}
      {/* <SettingsModal /> */}
      {/* <StatsModal /> */}
      {/* <ContentWarningModal /> */}
    </div>
  );
};

export default GameScreen; 