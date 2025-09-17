"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Play, History, Trophy, Target, Clock } from "lucide-react"
import { gameApi } from "@/lib/api"

interface User {
  id: string
  username: string
  role: "player" | "admin"
}

interface HomePageProps {
  user: User
  onNavigate: (view: "home" | "game" | "history" | "admin") => void
}

export function HomePage({ user, onNavigate }: HomePageProps) {
  const [showContinueDialog, setShowContinueDialog] = useState(false)
  const [hasIncompleteGame, setHasIncompleteGame] = useState(false)
  const [incompleteGameId, setIncompleteGameId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
  })

  useEffect(() => {
    loadGameStatus()
    loadStatsFromHistory()
  }, [])

  const loadGameStatus = async () => {
    try {
      const result = await gameApi.getGameStatus()
      if (result.data) {
        setHasIncompleteGame(result.data.hasIncompleteGame)
        setIncompleteGameId(result.data.incompleteGameId || null)
      }
    } catch (error) {
      console.error("Failed to load game status:", error)
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

  const handleStartNewGame = () => {
    if (hasIncompleteGame) {
      setShowContinueDialog(true)
    } else {
      startNewGame()
    }
  }

  const startNewGame = async () => {
    try {
      const result = await gameApi.startNewGame()
      if (result.data) {
        // Store the current game ID for the game board
        localStorage.setItem("currentGameId", result.data.id.toString())
        setHasIncompleteGame(false)
        setIncompleteGameId(null)
        setShowContinueDialog(false)
        onNavigate("game")
      } else if (result.error) {
        alert(result.error) // In production, use proper error handling
      }
    } catch (error) {
      console.error("Failed to start new game:", error)
      alert("Failed to start new game. Please try again.")
    }
  }

  const continueGame = () => {
    if (incompleteGameId) {
      localStorage.setItem("currentGameId", incompleteGameId.toString())
    }
    setShowContinueDialog(false)
    onNavigate("game")
  }

  const handleHistory = () => {
    onNavigate("history")
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Welcome back, {user.username}!</h1>
        <p className="text-lg text-muted-foreground">{user.role === "admin" ? "You are logged in as an admin." : "Ready to challenge your vocabulary skills?"}</p>
      </div>

      {user.role === "player" && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.gamesPlayed}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Games Played</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <Trophy className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0}%
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">Win Rate</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">{stats.currentStreak}</div>
                <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">Current Streak</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <Trophy className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">{stats.maxStreak}</div>
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Best Streak</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="w-full sm:w-auto px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={handleStartNewGame}
            >
              <Play className="w-6 h-6 mr-3" />
              {hasIncompleteGame ? "Continue/New Game" : "Start New Game"}
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto px-8 py-6 text-lg font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 bg-transparent"
              onClick={handleHistory}
            >
              <History className="w-6 h-6 mr-3" />
              Game History
            </Button>
          </div>

          {/* Incomplete Game Notice */}
          {hasIncompleteGame && (
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  You have an incomplete game!
                </h3>
                <p className="text-amber-700 dark:text-amber-300">
                  You can continue your previous game or start a new one.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Continue Game Dialog */}
          <Dialog open={showContinueDialog} onOpenChange={setShowContinueDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Continue Previous Game?</DialogTitle>
                <DialogDescription>
                  You have an incomplete game in progress. Would you like to continue where you left off or start a new
                  game?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={continueGame}>
                  Continue Previous Game
                </Button>
                <Button onClick={startNewGame}>Start New Game</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {user.role === "admin" && (
        <div className="flex flex-col items-center gap-8">
          <Button
            size="lg"
            className="w-full sm:w-auto px-8 py-6 text-lg font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => onNavigate("admin")}
          >
            Go to Admin Dashboard
          </Button>
        </div>
      )}
    </div>
  )
}
