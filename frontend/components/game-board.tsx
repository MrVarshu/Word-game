"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Trophy, Clock, Target, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { gameApi } from "@/lib/api"

interface User {
  id: string
  username: string
  role: "player" | "admin"
}

interface GameBoardProps {
  user: User
  onNavigate: (view: "home" | "game" | "history" | "admin") => void
}

interface GameState {
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
}

interface LetterState {
  letter: string
  status: "correct" | "present" | "absent" | "empty"
}

export function GameBoard({ user, onNavigate }: GameBoardProps) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [currentGuess, setCurrentGuess] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
  })

  // Initialize game
  useEffect(() => {
    loadCurrentGame()
    loadStatsFromHistory()
  }, [])

  const loadCurrentGame = async () => {
    try {
      const gameId = localStorage.getItem("currentGameId")
      if (!gameId) {
        // No current game, redirect to home
        onNavigate("home")
        return
      }

      const result = await gameApi.getGameDetails(gameId)
      if (result.data) {
        setGameState(result.data)
        setMessage(result.data.message || "")
      } else {
        console.error("Failed to load game:", result.error)
        onNavigate("home")
      }
    } catch (error) {
      console.error("Failed to load game:", error)
      onNavigate("home")
    } finally {
      setLoading(false)
    }
  }

  const loadStatsFromHistory = async () => {
    try {
      const result = await gameApi.getGameHistory()
      if (result.data) {
        const games = result.data
        const completedGames = games.filter((g) => g.status !== "IN_PROGRESS")
        const wonGames = games.filter((g) => g.status === "WON")

        // Calculate current streak
        let currentStreak = 0
        for (let i = completedGames.length - 1; i >= 0; i--) {
          if (completedGames[i].status === "WON") {
            currentStreak++
          } else {
            break
          }
        }

        // Calculate max streak
        let maxStreak = 0
        let tempStreak = 0
        for (const game of completedGames) {
          if (game.status === "WON") {
            tempStreak++
            maxStreak = Math.max(maxStreak, tempStreak)
          } else {
            tempStreak = 0
          }
        }

        setStats({
          gamesPlayed: completedGames.length,
          gamesWon: wonGames.length,
          currentStreak,
          maxStreak,
        })
      }
    } catch (error) {
      console.error("Failed to load game history:", error)
    }
  }

  const startNewGame = async () => {
    try {
      const result = await gameApi.startNewGame()
      if (result.data) {
        localStorage.setItem("currentGameId", result.data.id.toString())
        await loadCurrentGame()
        setCurrentGuess("")
        setMessage("")
      } else {
        setMessage(result.error || "Failed to start new game")
      }
    } catch (error) {
      console.error("Failed to start new game:", error)
      setMessage("Failed to start new game")
    }
  }

  const handleKeyPress = (key: string) => {
    if (!gameState || gameState.gameStatus !== "IN_PROGRESS" || submitting) return

    if (key === "ENTER") {
      submitGuess()
    } else if (key === "BACKSPACE") {
      setCurrentGuess(currentGuess.slice(0, -1))
    } else if (key.match(/[A-Z]/) && currentGuess.length < 5) {
      setCurrentGuess(currentGuess + key)
    }
  }

  const submitGuess = async () => {
    if (!gameState || currentGuess.length !== 5 || submitting) {
      if (currentGuess.length !== 5) {
        setMessage("Word must be 5 letters long")
      }
      return
    }

    setSubmitting(true)
    try {
      const result = await gameApi.submitGuess(gameState.id.toString(), currentGuess)
      if (result.data) {
        setMessage(result.data.message)
        // Reload game state to get updated information
        await loadCurrentGame()
        await loadStatsFromHistory()
        setCurrentGuess("")

        // Clear current game if it's completed
        if (result.data.isGameOver) {
          localStorage.removeItem("currentGameId")
        }
      } else {
        setMessage(result.error || "Failed to submit guess")
      }
    } catch (error) {
      console.error("Failed to submit guess:", error)
      setMessage("Failed to submit guess")
    } finally {
      setSubmitting(false)
    }
  }

  const getLetterState = (letter: string, position: number, evaluation: string): LetterState["status"] => {
    try {
      const evalArray = JSON.parse(evaluation)
      const letterEval = evalArray[position]
  if (letterEval?.color === "GREEN") return "correct"
  if (letterEval?.color === "ORANGE") return "present"
  if (letterEval?.color === "GRAY") return "absent"
  return "absent"
    } catch {
      return "absent"
    }
  }

  const renderGuessRow = (guess: { guessWord: string; evaluation: string }, rowIndex: number) => {
    const letters = guess.guessWord.padEnd(5, " ").split("")

    return (
      <div key={rowIndex} className="flex gap-2 justify-center">
        {letters.map((letter, colIndex) => {
          const status = letter === " " ? "empty" : getLetterState(letter, colIndex, guess.evaluation)
          return (
            <div
              key={colIndex}
              className={cn(
                "w-14 h-14 border-2 flex items-center justify-center text-2xl font-bold rounded-lg transition-all duration-300",
                {
                  "bg-green-500 border-green-500 text-white": status === "correct",
                  "bg-orange-400 border-orange-400 text-white": status === "present",
                  "bg-gray-500 border-gray-500 text-white": status === "absent",
                  "bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600": status === "empty",
                },
              )}
            >
              {letter !== " " ? letter : ""}
            </div>
          )
        })}
      </div>
    )
  }

  const renderCurrentGuessRow = () => {
    const letters = currentGuess.padEnd(5, " ").split("")

    return (
      <div className="flex gap-2 justify-center">
        {letters.map((letter, index) => (
          <div
            key={index}
            className={cn(
              "w-14 h-14 border-2 flex items-center justify-center text-2xl font-bold rounded-lg transition-all duration-200",
              letter !== " "
                ? "bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-600"
                : "bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600",
            )}
          >
            {letter !== " " ? letter : ""}
          </div>
        ))}
      </div>
    )
  }

  const renderKeyboard = () => {
    const rows = [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
    ]

    return (
      <div className="space-y-2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 justify-center">
            {row.map((key) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                className={cn("h-12 font-semibold", key === "ENTER" || key === "BACKSPACE" ? "px-4" : "w-10")}
                onClick={() => handleKeyPress(key)}
                disabled={!gameState || gameState.gameStatus !== "IN_PROGRESS" || submitting}
              >
                {key === "BACKSPACE" ? "⌫" : key}
              </Button>
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading game...</p>
        </div>
      </div>
    )
  }

  if (!gameState) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <p className="text-muted-foreground">No active game found.</p>
          <Button onClick={() => onNavigate("home")} className="mt-4">
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => onNavigate("home")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{stats.gamesPlayed}</div>
            <div className="text-sm text-muted-foreground">Played</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold">
              {stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{stats.maxStreak}</div>
            <div className="text-sm text-muted-foreground">Max Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Game Board */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <span>Word Guess Game</span>
            <Badge
              variant={
                gameState.gameStatus === "WON"
                  ? "default"
                  : gameState.gameStatus === "LOST"
                    ? "destructive"
                    : "secondary"
              }
            >
              {gameState.attempts}/5 attempts
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Game Grid */}
          <div className="space-y-2">
            {gameState.guesses.map((guess, index) => renderGuessRow(guess, index))}
            {gameState.gameStatus === "IN_PROGRESS" && gameState.guesses.length < 5 && renderCurrentGuessRow()}
            {/* Empty rows */}
            {Array.from({
              length: 5 - gameState.guesses.length - (gameState.gameStatus === "IN_PROGRESS" ? 1 : 0),
            }).map((_, index) => (
              <div key={`empty-${index}`} className="flex gap-2 justify-center">
                {Array.from({ length: 5 }).map((_, colIndex) => (
                  <div
                    key={colIndex}
                    className="w-14 h-14 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Message */}
          {message && (
            <Alert
              className={
                gameState.gameStatus === "WON"
                  ? "border-green-500"
                  : gameState.gameStatus === "LOST"
                    ? "border-red-500"
                    : ""
              }
            >
              <AlertDescription className="text-center font-medium">{message}</AlertDescription>
            </Alert>
          )}

          {/* Keyboard */}
          {renderKeyboard()}

          {/* New Game Button */}
          {gameState.gameStatus !== "IN_PROGRESS" && (
            <div className="text-center">
              <Button onClick={startNewGame} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                New Game
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
