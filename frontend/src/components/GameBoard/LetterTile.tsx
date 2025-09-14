import React from 'react';
import type { LetterTileProps } from '../../types/game.types';

const LetterTile: React.FC<LetterTileProps> = ({ 
  letter, 
  evaluation, 
  filled = false 
}) => {
  const getClassNames = () => {
    let baseClasses = 'letter-tile';
    
    if (letter && !evaluation) {
      baseClasses += ' filled';
    }
    
    if (evaluation) {
      switch (evaluation) {
        case 'GREEN':
          baseClasses += ' correct';
          break;
        case 'ORANGE':
          baseClasses += ' present';
          break;
        case 'GREY':
          baseClasses += ' absent';
          break;
      }
    }
    
    return baseClasses;
  };

  return (
    <div className={getClassNames()}>
      {letter}
    </div>
  );
};

export default LetterTile;