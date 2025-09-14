// Game Types
export interface Game {
  id: number;
  userId: number;
  wordToGuess: string;
  guesses: string[];
  gameStatus: 'PLAYING' | 'WON' | 'LOST';
  createdAt: string;
}

// Letter Evaluation
export interface EvaluatedLetter {
  letter: string;
  color: 'GREEN' | 'ORANGE' | 'GREY';
}

// API Request/Response Types
export interface GuessRequest {
  gameId: number;
  guessWord: string;
}

export interface GuessResponse {
  gameId: number;
  guess: string;
  evaluatedLetters: EvaluatedLetter[];
  gameStatus: 'PLAYING' | 'WON' | 'LOST';
  message?: string;
}

export interface StartGameResponse {
  gameId: number;
  message: string;
}

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

// Game State
export interface GameState {
  currentGame: Game | null;
  guesses: string[];
  currentGuess: string;
  evaluations: EvaluatedLetter[][];
  gameStatus: 'PLAYING' | 'WON' | 'LOST';
  message?: string;
  isLoading: boolean;
}

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

// Admin Report Types
export interface DailyReport {
  date: number;
  uniquePlayers: number;
  wins: number;
}

export interface UserReport {
  date: number;
  gamesPlayed: number;
}

// Component Props
export interface LetterTileProps {
  letter: string;
  evaluation?: 'GREEN' | 'ORANGE' | 'GREY';
  filled?: boolean;
}

export interface KeyboardKeyProps {
  letter: string;
  evaluation?: 'GREEN' | 'ORANGE' | 'GREY';
  onClick: (letter: string) => void;
  isSpecial?: boolean;
}

export interface GameBoardProps {
  guesses: string[];
  currentGuess: string;
  evaluations: EvaluatedLetter[][];
  maxGuesses?: number;
}