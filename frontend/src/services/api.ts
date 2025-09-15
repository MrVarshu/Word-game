import axios from 'axios';
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  StartGameResponse, 
  GuessRequest, 
  GuessResponse,
  DailyReport,
  UserReport
} from '../types/game.types';

// Base API configuration
const API_BASE_URL = 'http://localhost:8088/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔑 API Request:', config.url, 'Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Added Authorization header');
    } else {
      console.log('❌ No token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect here, let the React app handle it
      console.log('🔒 401 error: clearing auth data');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  setAuthData: (authResponse: AuthResponse) => {
    localStorage.setItem('token', authResponse.token);
    // Since backend only returns token, we store minimal user info
    localStorage.setItem('user', JSON.stringify({
      authenticated: true
    }));
  }
};

// Game API
export const gameAPI = {
  startNewGame: async (): Promise<StartGameResponse> => {
    const response = await api.post('/games/start');
    return response.data;
  },

  submitGuess: async (guessData: GuessRequest): Promise<GuessResponse> => {
    const response = await api.post(`/games/${guessData.gameId}/guess?guessWord=${guessData.guessWord}`);
    return response.data;
  },

  getCurrentGame: async (): Promise<any> => {
    const response = await api.get('/games/current');
    return response.data;
  },

  getGameHistory: async (): Promise<any[]> => {
    const response = await api.get('/games/history');
    return response.data;
  }
};

// Admin API
export const adminAPI = {
  getDailyReport: async (date?: string): Promise<DailyReport> => {
    const dateParam = date || new Date().toISOString().split('T')[0].replace(/-/g, '');
    const response = await api.get(`/admin/report/daily?date=${dateParam}`);
    return response.data;
  },

  getUserReport: async (userId: number, date?: string): Promise<UserReport> => {
    const dateParam = date || new Date().toISOString().split('T')[0].replace(/-/g, '');
    const response = await api.get(`/admin/report/user/${userId}?date=${dateParam}`);
    return response.data;
  }
};

export default api;