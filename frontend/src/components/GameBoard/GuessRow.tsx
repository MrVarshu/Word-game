import React from 'react';
import LetterTile from './LetterTile';
import type { EvaluatedLetter } from '../../types/game.types';

interface GuessRowProps {
  guess: string;
  evaluation?: EvaluatedLetter[];
  isCurrentGuess?: boolean;
  currentGuess?: string;
}

const GuessRow: React.FC<GuessRowProps> = ({ 
  guess, 
  evaluation, 
  isCurrentGuess = false, 
  currentGuess = '' 
}) => {
  // Create array of 5 tiles
  const tiles = Array.from({ length: 5 }, (_, index) => {
    let letter = '';
    let tileEvaluation: 'GREEN' | 'ORANGE' | 'GREY' | undefined;

    if (isCurrentGuess) {
      // Show current guess being typed
      letter = currentGuess[index] || '';
    } else if (guess) {
      // Show completed guess
      letter = guess[index] || '';
      if (evaluation && evaluation[index]) {
        tileEvaluation = evaluation[index].color;
      }
    }

    return (
      <LetterTile
        key={index}
        letter={letter}
        evaluation={tileEvaluation}
        filled={!!letter}
      />
    );
  });

  return (
    <div className="flex gap-1 justify-center">
      {tiles}
    </div>
  );
};

export default GuessRow;