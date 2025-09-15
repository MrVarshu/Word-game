import React, { useState, useEffect } from 'react';
import { GameProvider } from './contexts/GameContext';
import GameBoard from './components/GameBoard/GameBoard';
import VirtualKeyboard from './components/Keyboard/VirtualKeyboard';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Home from './components/Home/Home';
import History from './components/History/History';
import { authAPI, gameAPI } from './services/api';
import { useGame } from './contexts/GameContext';

// Game component that uses the game context
const GameArea: React.FC<{ onBackToHome: () => void }> = ({ onBackToHome }) => {
  const { state, startNewGame, submitGuessSuccess, setLoading } = useGame();

  // Auto-start a new game when GameArea loads
  useEffect(() => {
    if (!state.currentGame) {
      handleStartNewGame();
    }
  }, []);

  const handleStartNewGame = async () => {
    try {
      setLoading(true);
      const response = await gameAPI.startNewGame();
      startNewGame(response.id); // Use 'id' instead of 'gameId'
    } catch (error) {
      console.error('Failed to start new game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitGuess = async () => {
    if (state.currentGuess.length !== 5 || !state.currentGame) return;

    try {
      setLoading(true);
      const response = await gameAPI.submitGuess({
        gameId: state.currentGame.id,
        guessWord: state.currentGuess
      });
      submitGuessSuccess(response);
    } catch (error) {
      console.error('Failed to submit guess:', error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger guess submission when Enter is pressed and guess is complete
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && state.currentGuess.length === 5 && state.gameStatus === 'PLAYING') {
        handleSubmitGuess();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.currentGuess, state.gameStatus, state.currentGame]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">WORDLE</h1>
            <div className="flex gap-4">
              <button
                onClick={onBackToHome}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Home
              </button>
              {!state.currentGame && (
                <button
                  onClick={handleStartNewGame}
                  disabled={state.isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {state.isLoading ? 'Starting...' : 'New Game'}
                </button>
              )}
              {(state.gameStatus === 'WON' || state.gameStatus === 'LOST') && (
                <button
                  onClick={handleStartNewGame}
                  disabled={state.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {state.isLoading ? 'Starting...' : 'Play Again'}
                </button>
              )}
              <button
                onClick={() => {
                  authAPI.logout();
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-lg">
          <GameBoard />
          <VirtualKeyboard />
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'game' | 'history'>('home');

  useEffect(() => {
    const token = authAPI.getToken();
    console.log('🔍 Checking auth state. Token exists:', !!token);
    if (token) {
      console.log('✅ User is authenticated');
      setIsAuthenticated(true);
    } else {
      console.log('❌ User is not authenticated');
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    console.log('🎉 Login success called');
    setIsAuthenticated(true);
    setCurrentView('home'); // Go to home after login
  };

  const handleRegisterSuccess = () => {
    console.log('🎉 Register success called');
    setIsAuthenticated(true);
    setCurrentView('home'); // Go to home after register
  };

  const handleStartNewGame = async () => {
    setCurrentView('game');
  };

  const handleViewHistory = () => {
    setCurrentView('history');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {showRegister ? (
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setShowRegister(false)}
          />
        ) : (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )}
      </div>
    );
  }

  // Render different views based on currentView state
  if (currentView === 'home') {
    return (
      <Home 
        onStartNewGame={handleStartNewGame}
        onViewHistory={handleViewHistory}
        isLoading={false}
      />
    );
  }

  if (currentView === 'history') {
    return (
      <History onBack={handleBackToHome} />
    );
  }

  // Game view
  return (
    <GameProvider>
      <GameArea onBackToHome={handleBackToHome} />
    </GameProvider>
  );
};

export default App;
