"use client"

// Convert days since 1970-01-01 to a readable date string
function formatEpochDays(days: number) {
  const ms = days * 24 * 60 * 60 * 1000;
  const date = new Date(ms);
  return date.toLocaleDateString();
}

import { useState, useEffect } from "react"
import { adminApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Trophy, TrendingUp, Calendar, Download, Search } from "lucide-react"

interface GameRecord {
  id: string
  userId: string
  username: string
  word: string
  won: boolean
  attempts: number
  guesses: string[]
  timestamp: string
}

interface UserStats {
  userId: string
  username: string
  gamesPlayed: number
  gamesWon: number
  winRate: number
  averageAttempts: number
  currentStreak: number
  maxStreak: number
}

export function AdminDashboard() {
  const [dailyReport, setDailyReport] = useState<{ date: number; wins: number; uniquePlayers: number } | null>(null)
  const [userReport, setUserReport] = useState<{ date: number; gamesPlayed: number } | null>(null)
  const [searchUserId, setSearchUserId] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (dateFilter) {
      fetchDailyReport(dateFilter)
    }
  }, [dateFilter])

  const fetchDailyReport = async (date: string) => {
    setLoading(true)
    setError("")
    try {
      const result = await adminApi.getDailyReport(date)
      if (result.data) {
        setDailyReport(result.data)
      } else if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError("Failed to fetch daily report")
    } finally {
      setLoading(false)
    }
  }

  const fetchUserReport = async () => {
    if (!searchUserId || !dateFilter) return
    setLoading(true)
    setError("")
    try {
      const result = await adminApi.getUserReport(searchUserId, dateFilter)
      if (result.data) {
        setUserReport(result.data)
      } else if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError("Failed to fetch user report")
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-3xl font-bold">{dateFilter || "Select a date"}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Wins</p>
                <p className="text-3xl font-bold">{dailyReport ? dailyReport.wins : "-"}</p>
              </div>
              <Trophy className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Players</p>
                <p className="text-3xl font-bold">{dailyReport ? dailyReport.uniquePlayers : "-"}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 my-4">
        <div>
          <Label htmlFor="date">Date Filter</Label>
          <Input id="date" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="userId">User ID</Label>
          <Input id="userId" type="text" placeholder="Enter User ID" value={searchUserId} onChange={(e) => setSearchUserId(e.target.value)} />
        </div>
        <Button onClick={fetchUserReport} disabled={!searchUserId || !dateFilter || loading} className="self-end">Get User Report</Button>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      {dailyReport && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Daily Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div>Date: {formatEpochDays(dailyReport.date)}</div>
            <div>Wins: {dailyReport.wins}</div>
            <div>Unique Players: {dailyReport.uniquePlayers}</div>
          </CardContent>
        </Card>
      )}

      {userReport && (
        <Card>
          <CardHeader>
            <CardTitle>User Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div>Date: {formatEpochDays(userReport.date)}</div>
            <div>Games Played: {userReport.gamesPlayed}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
