const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8088"

interface ApiResponse<T> {
  data?: T
  error?: string
}

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

export const setAuthToken = (token: string): void => {
  localStorage.setItem("authToken", token)
}

export const removeAuthToken = (): void => {
  localStorage.removeItem("authToken")
}

const apiRequest = async <T>(endpoint: string, options: RequestInit = {})
: Promise<ApiResponse<T>> => {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token && !endpoint.startsWith("/api/auth/")) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "An error occurred" };
    }

    return { data };
  } catch (error) {
    return { error: "Network error occurred" };
  }
}

export const authApi = {
  register: async (username: string, password: string) => {
    return apiRequest<string>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
  },

  login: async (username: string, password: string) => {
    return apiRequest<{ token: string; role: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
  },
}

export const gameApi = {
  startNewGame: async () => {
    return apiRequest<any>("/api/games/start", {
      method: "POST",
    })
  },

  submitGuess: async (gameId: string, guess: string) => {
    return apiRequest<{
      id: number
      guessWord: string
      guessNumber: number
      evaluation: string
      createdAt: string
      gameStatus: "IN_PROGRESS" | "WON" | "LOST"
      message: string
      isGameOver: boolean
      attemptsLeft: number
    }>(`/api/games/${gameId}/guess`, {
      method: "POST",
      body: JSON.stringify({ guess }),
    })
  },

  getGameGuesses: async (gameId: string) => {
    return apiRequest<
      Array<{
        id: number
        guessWord: string
        guessNumber: number
        evaluation: string
        createdAt: string
      }>
    >(`/api/games/${gameId}/guesses`)
  },

  getGameHistory: async () => {
    return apiRequest<
      Array<{
        id: string
        targetWord: string
        guesses: string[]
        status: "WON" | "LOST" | "IN_PROGRESS"
        startTime: string
        endTime: string
      }>
    >("/api/games/history")
  },

  getGameStatus: async () => {
    return apiRequest<{
      dailyLimitReached: boolean
      hasIncompleteGame: boolean
      incompleteGameId?: number
    }>("/api/games/status")
  },

  getGameDetails: async (gameId: string) => {
    return apiRequest<{
      id: number
      wordToGuess: string
      gameStatus: "IN_PROGRESS" | "WON" | "LOST"
      attempts: number
      guesses: Array<{
        guessWord: string
        evaluation: string
        guessNumber: number
      }>
      message: string
    }>(`/api/games/${gameId}`)
  },
}

export const adminApi = {
  getDailyReport: async (date: string) => {
    return apiRequest<{
      date: number
      wins: number
      uniquePlayers: number
    }>(`/api/admin/report/day?date=${date}`)
  },

  getUserReport: async (userId: string, date: string) => {
    return apiRequest<{
      userId: string | number;
      username: string;
      date: number;
      gamesPlayed: number;
      wins: number;
    }>(`/api/admin/report/user/${userId}?date=${date}`);
  },

  // New: Get user activity summary by userId or username
  getUserActivity: async (params: { userId?: string; username?: string }) => {
    const query = params.userId
      ? `userId=${encodeURIComponent(params.userId)}`
      : params.username
        ? `username=${encodeURIComponent(params.username)}`
        : '';
    return apiRequest<{
      userId: string | number;
      username: string;
      activity: Array<{
        date: string;
        numberOfWordsTried: number;
        numberOfCorrectGuesses: number;
      }>;
    }>(`/api/admin/user/activity?${query}`);
  },
}
