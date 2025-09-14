import React, { useEffect, useCallback } from 'react';
import KeyboardKey from './KeyboardKey';
import { useGame } from '../../contexts/GameContext';

const VirtualKeyboard: React.FC = () => {
  const { state, addLetter, removeLetter } = useGame();
  
  // QWERTY layout
  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  // Get evaluation for each letter based on game state
  const getLetterEvaluation = (letter: string): 'GREEN' | 'ORANGE' | 'GREY' | undefined => {
    if (!state.evaluations.length) return undefined;
    
    let bestEvaluation: 'GREEN' | 'ORANGE' | 'GREY' | undefined = undefined;
    
    // Check all evaluations to find the best color for this letter
    state.evaluations.forEach(evaluation => {
      evaluation.forEach(letterEval => {
        if (letterEval.letter === letter) {
          // GREEN takes priority over ORANGE, ORANGE over GREY
          if (letterEval.color === 'GREEN') {
            bestEvaluation = 'GREEN';
          } else if (letterEval.color === 'ORANGE' && bestEvaluation !== 'GREEN') {
            bestEvaluation = 'ORANGE';
          } else if (letterEval.color === 'GREY' && !bestEvaluation) {
            bestEvaluation = 'GREY';
          }
        }
      });
    });
    
    return bestEvaluation;
  };

  // Handle key clicks
  const handleKeyClick = useCallback((key: string) => {
    if (state.gameStatus !== 'PLAYING') return;
    
    if (key === 'ENTER') {
      // Handle submit guess logic here (will be implemented with API integration)
      if (state.currentGuess.length === 5) {
        console.log('Submit guess:', state.currentGuess);
        // This will be connected to the API later
      }
    } else if (key === 'BACKSPACE') {
      removeLetter();
    } else if (key.length === 1 && /[A-Z]/.test(key)) {
      addLetter(key);
    }
  }, [state.gameStatus, state.currentGuess, addLetter, removeLetter]);

  // Handle physical keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      
      if (key === 'ENTER') {
        handleKeyClick('ENTER');
      } else if (key === 'BACKSPACE') {
        handleKeyClick('BACKSPACE');
      } else if (/[A-Z]/.test(key) && key.length === 1) {
        handleKeyClick(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyClick]);

  return (
    <div className="virtual-keyboard mt-8 max-w-lg mx-auto">
      {keyboardRows.map((row, rowIndex) => (
        <div 
          key={rowIndex} 
          className="flex justify-center gap-1 mb-2"
        >
          {row.map((key) => (
            <KeyboardKey
              key={key}
              letter={key}
              evaluation={key.length === 1 ? getLetterEvaluation(key) : undefined}
              onClick={handleKeyClick}
              isSpecial={key.length > 1}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default VirtualKeyboard;