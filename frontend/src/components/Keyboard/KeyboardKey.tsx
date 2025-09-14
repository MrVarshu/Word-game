import React from 'react';
import type { KeyboardKeyProps } from '../../types/game.types';

const KeyboardKey: React.FC<KeyboardKeyProps> = ({ 
  letter, 
  evaluation, 
  onClick, 
  isSpecial = false 
}) => {
  const getClassNames = () => {
    let baseClasses = 'keyboard-key';
    
    if (isSpecial) {
      baseClasses += ' px-6'; // Wider for special keys like ENTER, BACKSPACE
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

  const handleClick = () => {
    onClick(letter);
  };

  return (
    <button
      className={getClassNames()}
      onClick={handleClick}
      type="button"
    >
      {letter}
    </button>
  );
};

export default KeyboardKey;