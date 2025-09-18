"use client"

import { useState, useEffect } from "react"
import { gameApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trophy, X, Calendar, Target } from "lucide-react"

interface User {
  id: string
  username: string
  role: "player" | "admin"
}

interface GameHistoryProps {
  user: User
  onNavigate: (view: "home" | "game" | "history" | "admin") => void
}

interface GameRecord {
  id: string
  targetWord: string
  guesses: string[]
  status: "WON" | "LOST" | "IN_PROGRESS"
  startTime: string
  endTime: string
}

export function GameHistory({ user, onNavigate }: GameHistoryProps) {
  const [gameHistory, setGameHistory] = useState<GameRecord[]>([])
  const [filteredHistory, setFilteredHistory] = useState<GameRecord[]>([])

  useEffect(() => {
    const fetchHistory = async () => {
      const result = await gameApi.getGameHistory();
      if (result.data) {
        // Sort by endTime, most recent first
        const sorted = [...result.data].sort(
          (a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
        );
        setGameHistory(sorted);
        setFilteredHistory(sorted);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const getLetterState = (letter: string, position: number, word: string, guess: string): string => {
    if (guess[position] === letter && word[position] === letter) return "correct";
    if (word.includes(letter)) return "present";
    return "absent";
  }

  const renderGameGuesses = (game: GameRecord) => {
    return (
      <div className="space-y-1">
        {game.guesses.map((guess, guessIndex) => (
          <div key={guessIndex} className="flex gap-1">
            {guess.split("").map((letter, letterIndex) => {
              const status = getLetterState(letter, letterIndex, game.targetWord, guess);
              return (
                <div
                  key={letterIndex}
                  className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded ${
                    status === "correct"
                      ? "bg-green-500 text-white"
                      : status === "present"
                        ? "bg-orange-400 text-white"
                        : "bg-gray-400 text-white"
                  }`}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  const filterWins = () => {
    setFilteredHistory(gameHistory.filter((game) => game.status === "WON"));
  };

  const filterLosses = () => {
    setFilteredHistory(gameHistory.filter((game) => game.status === "LOST"));
  };

  const showAll = () => {
    setFilteredHistory(gameHistory)
  }

  const totalWins = gameHistory.filter((game) => game.status === "WON").length;
  const totalLosses = gameHistory.filter((game) => game.status === "LOST").length;
  const winRate = gameHistory.length > 0 ? Math.round((totalWins / gameHistory.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => onNavigate("home")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Game History</h1>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{gameHistory.length}</div>
            <div className="text-sm text-muted-foreground">Total Games</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{totalWins}</div>
            <div className="text-sm text-muted-foreground">Wins</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <X className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-2xl font-bold">{totalLosses}</div>
            <div className="text-sm text-muted-foreground">Losses</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{winRate}%</div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button variant={filteredHistory.length === gameHistory.length ? "default" : "outline"} onClick={showAll}>
          All Games ({gameHistory.length})
        </Button>
        <Button
          variant={filteredHistory.length === totalWins && totalWins > 0 ? "default" : "outline"}
          onClick={filterWins}
        >
          Wins ({totalWins})
        </Button>
        <Button
          variant={filteredHistory.length === totalLosses && totalLosses > 0 ? "default" : "outline"}
          onClick={filterLosses}
        >
          Losses ({totalLosses})
        </Button>
      </div>

      {/* Game History List */}
      {filteredHistory.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No games found</h3>
            <p className="text-muted-foreground">
              {gameHistory.length === 0
                ? "You haven't played any games yet. Start your first game to see your history here!"
                : "No games match the current filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredHistory.map((game) => (
            <Card key={game.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={game.status === "WON" ? "default" : "destructive"}>{game.status === "WON" ? "Won" : "Lost"}</Badge>
                      <span className="font-mono text-lg font-bold">{game.targetWord}</span>
                      <span className="text-sm text-muted-foreground">{game.guesses.length}/5 attempts</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {formatDate(game.endTime)}
                    </div>
                  </div>

                  <div className="flex-shrink-0">{renderGameGuesses(game)}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
