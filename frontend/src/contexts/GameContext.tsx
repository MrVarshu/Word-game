import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { GameState, GuessResponse } from '../types/game.types';

// Initial state
const initialState: GameState = {
  currentGame: null,
  guesses: [],
  currentGuess: '',
  evaluations: [],
  gameStatus: 'PLAYING',
  message: undefined,
  isLoading: false,
};

// Action types
type GameAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'START_NEW_GAME'; payload: { gameId: number } }
  | { type: 'UPDATE_CURRENT_GUESS'; payload: string }
  | { type: 'SUBMIT_GUESS_SUCCESS'; payload: GuessResponse }
  | { type: 'SET_GAME_STATUS'; payload: 'PLAYING' | 'WON' | 'LOST' }
  | { type: 'SET_MESSAGE'; payload: string }
  | { type: 'RESET_GAME' }
  | { type: 'ADD_LETTER'; payload: string }
  | { type: 'REMOVE_LETTER' }
  | { type: 'CLEAR_CURRENT_GUESS' };

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'START_NEW_GAME':
      return {
        ...initialState,
        currentGame: { 
          id: action.payload.gameId, 
          userId: 0, 
          wordToGuess: '', 
          guesses: [], 
          gameStatus: 'PLAYING', 
          createdAt: new Date().toISOString() 
        },
      };

    case 'UPDATE_CURRENT_GUESS':
      return { ...state, currentGuess: action.payload };

    case 'ADD_LETTER':
      if (state.currentGuess.length < 5 && state.gameStatus === 'PLAYING') {
        return { ...state, currentGuess: state.currentGuess + action.payload };
      }
      return state;

    case 'REMOVE_LETTER':
      if (state.currentGuess.length > 0) {
        return { ...state, currentGuess: state.currentGuess.slice(0, -1) };
      }
      return state;

    case 'CLEAR_CURRENT_GUESS':
      return { ...state, currentGuess: '' };

    case 'SUBMIT_GUESS_SUCCESS':
      const newGuesses = [...state.guesses, action.payload.guess];
      const newEvaluations = [...state.evaluations, action.payload.evaluatedLetters];
      return {
        ...state,
        guesses: newGuesses,
        currentGuess: '',
        evaluations: newEvaluations,
        gameStatus: action.payload.gameStatus,
        message: action.payload.message,
      };

    case 'SET_GAME_STATUS':
      return { ...state, gameStatus: action.payload };

    case 'SET_MESSAGE':
      return { ...state, message: action.payload };

    case 'RESET_GAME':
      return initialState;

    default:
      return state;
  }
}

// Context
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  addLetter: (letter: string) => void;
  removeLetter: () => void;
  clearCurrentGuess: () => void;
  startNewGame: (gameId: number) => void;
  submitGuessSuccess: (response: GuessResponse) => void;
  setLoading: (loading: boolean) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider
interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const addLetter = (letter: string) => {
    dispatch({ type: 'ADD_LETTER', payload: letter });
  };

  const removeLetter = () => {
    dispatch({ type: 'REMOVE_LETTER' });
  };

  const clearCurrentGuess = () => {
    dispatch({ type: 'CLEAR_CURRENT_GUESS' });
  };

  const startNewGame = (gameId: number) => {
    dispatch({ type: 'START_NEW_GAME', payload: { gameId } });
  };

  const submitGuessSuccess = (response: GuessResponse) => {
    dispatch({ type: 'SUBMIT_GUESS_SUCCESS', payload: response });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  const value: GameContextType = {
    state,
    dispatch,
    addLetter,
    removeLetter,
    clearCurrentGuess,
    startNewGame,
    submitGuessSuccess,
    setLoading,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// Hook
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}