import React, { useState, useEffect } from 'react';
import { gameAPI } from '../../services/api';

interface GameHistory {
  id: string;
  targetWord: string;
  guesses: string[];
  status: 'WON' | 'LOST' | 'PLAYING';
  startTime: string;
  endTime?: string;
}

interface HistoryProps {
  onBack: () => void;
}

const History: React.FC<HistoryProps> = ({ onBack }) => {
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      // Note: You'll need to implement this endpoint in the backend
      const response = await gameAPI.getGameHistory();
      setHistory(response);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setError('Failed to load game history');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WON':
        return 'text-green-600';
      case 'LOST':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'WON':
        return 'Won';
      case 'LOST':
        return 'Lost';
      default:
        return 'Playing';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Game History</h1>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          {error ? (
            <div className="text-center py-8">
              <div className="text-red-600 text-lg mb-4">{error}</div>
              <button
                onClick={fetchHistory}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-600 text-lg">No games played yet!</div>
              <button
                onClick={onBack}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Start Your First Game
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((game) => (
                <div key={game.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Target Word: <span className="text-blue-600 uppercase">{game.targetWord}</span>
                      </h3>
                      <p className={`text-sm font-medium ${getStatusColor(game.status)}`}>
                        Status: {getStatusText(game.status)}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>Started: {new Date(game.startTime).toLocaleDateString()}</div>
                      {game.endTime && (
                        <div>Finished: {new Date(game.endTime).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium mb-2">Your Guesses:</h4>
                    <div className="space-y-2">
                      {game.guesses.map((guess, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 w-8">#{index + 1}</span>
                          <div className="flex gap-1">
                            {guess.split('').map((letter, letterIndex) => (
                              <div
                                key={letterIndex}
                                className="w-8 h-8 border border-gray-300 flex items-center justify-center text-sm font-bold uppercase bg-gray-100"
                              >
                                {letter}
                              </div>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 uppercase ml-2">{guess}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-500">
                    Attempts used: {game.guesses.length} of 5
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;