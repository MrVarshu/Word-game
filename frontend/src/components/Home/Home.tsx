import React from 'react';

interface HomeProps {
  onStartNewGame: () => void;
  onViewHistory: () => void;
  isLoading: boolean;
}

const Home: React.FC<HomeProps> = ({ onStartNewGame, onViewHistory, isLoading }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">WORDLE</h1>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center p-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Wordle!</h2>
          <p className="text-lg text-gray-600 mb-8">
            Guess the 5-letter word in 5 attempts or less
          </p>
        </div>

        <div className="flex flex-col gap-6 w-full max-w-sm">
          <button
            onClick={onStartNewGame}
            disabled={isLoading}
            className="w-full py-4 px-6 bg-green-600 text-white text-xl font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Starting...' : 'Start New Game'}
          </button>

          <button
            onClick={onViewHistory}
            className="w-full py-4 px-6 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            View History
          </button>
        </div>

        <div className="mt-12 text-center text-gray-500">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold text-sm">A</div>
              <span className="text-sm">Correct position</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-sm">B</div>
              <span className="text-sm">Wrong position</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-500 rounded flex items-center justify-center text-white font-bold text-sm">C</div>
              <span className="text-sm">Not in word</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;