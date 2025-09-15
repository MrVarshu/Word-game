import React from 'react';
import GuessRow from './GuessRow';
import { useGame } from '../../contexts/GameContext';

const GameBoard: React.FC = () => {
  const { state } = useGame();
  const { guesses, currentGuess, evaluations, gameStatus } = state;

  // Create 5 rows for the game board
  const rows = Array.from({ length: 5 }, (_, index) => {
    const guess = guesses[index] || '';
    const evaluation = evaluations[index];
    const isCurrentGuess = index === guesses.length && gameStatus === 'PLAYING';

    return (
      <GuessRow
        key={index}
        guess={guess}
        evaluation={evaluation}
        isCurrentGuess={isCurrentGuess}
        currentGuess={isCurrentGuess ? currentGuess : ''}
      />
    );
  });

  return (
    <div className="game-board flex flex-col gap-1 p-4">
      {rows}
      
      {/* Game Status Message */}
      {state.message && (
        <div className={`text-center mt-4 p-2 rounded font-semibold ${
          gameStatus === 'WON' 
            ? 'bg-green-100 text-green-800' 
            : gameStatus === 'LOST' 
            ? 'bg-red-100 text-red-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {state.message}
        </div>
      )}
    </div>
  );
};

export default GameBoard;