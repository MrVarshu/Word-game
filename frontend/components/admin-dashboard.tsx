"use client"

import { useState } from "react"
import { adminApi } from "../lib/api"

interface UserActivity {
  date: string
  numberOfWordsTried: number
  numberOfCorrectGuesses: number
}
interface DailyReport {
  date: number
  wins: number
  uniquePlayers: number
}
interface UserDailyReport {
  date: number
  gamesPlayed: number
  wins: number
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"daily" | "user">("user")
  const [userReportType, setUserReportType] = useState<"activity" | "daily">("activity")
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedUser, setSelectedUser] = useState("")
  const [userActivityData, setUserActivityData] = useState<UserActivity[]>([])
  const [userReportData, setUserReportData] = useState<UserDailyReport | null>(null)
  const [dailyReportData, setDailyReportData] = useState<DailyReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userActivityError, setUserActivityError] = useState("")
  const [userDailyError, setUserDailyError] = useState("")

  const handleGenerateActivityReport = async () => {
    setUserActivityError("");
    setUserActivityData([]);
    if (!selectedUser.trim()) {
      setUserActivityError("Please enter a user ID or username.");
      return;
    }
    setIsLoading(true)
    try {
      let params;
      if (/^\d+$/.test(selectedUser.trim())) {
        params = { userId: selectedUser.trim() };
      } else {
        params = { username: selectedUser.trim() };
      }
      const response = await adminApi.getUserActivity(params)
      if (response.error) {
        setUserActivityError(response.error);
        setUserActivityData([]);
      } else {
        setUserActivityData(response.data || [])
      }
    } catch (e) {
      setUserActivityError("Failed to fetch user activity.");
      setUserActivityData([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateDailyUserReport = async () => {
    setUserDailyError("");
    setUserReportData(null);
    if (!selectedUser.trim()) {
      setUserDailyError("Please enter a user ID.");
      return;
    }
    setIsLoading(true)
    try {
      const response = await adminApi.getUserReport(selectedUser, selectedDate)
      if (response.error) {
        setUserDailyError(response.error);
        setUserReportData(null);
      } else {
        setUserReportData(response.data || null)
      }
    } catch (e) {
      setUserDailyError("Failed to fetch daily user report.");
      setUserReportData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateDailyReport = async () => {
    setIsLoading(true)
    try {
      const response = await adminApi.getDailyReport(selectedDate)
      setDailyReportData(response.data || null)
    } catch (e) {
      console.error(e)
      setDailyReportData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const totalWordsTried = userActivityData.reduce((sum, d) => sum + d.numberOfWordsTried, 0)
  const totalCorrectGuesses = userActivityData.reduce((sum, d) => sum + d.numberOfCorrectGuesses, 0)
  const overallSuccessRate =
    totalWordsTried > 0 ? ((totalCorrectGuesses / totalWordsTried) * 100).toFixed(1) : "0"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor game statistics and user performance</p>
        </div>
        <div className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">Live Dashboard</div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("daily")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "daily"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              📅 Daily Reports
            </button>
            <button
              onClick={() => setActiveTab("user")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "user"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              👤 User Reports
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "daily" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">📅 Daily Report</h2>
              <div className="flex items-center gap-4 mb-6">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <button
                  onClick={handleGenerateDailyReport}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {isLoading ? "Loading..." : "Generate Report"}
                </button>
              </div>

              {dailyReportData && (
                <div className="bg-white border rounded p-4">
                  <p>Unique Players: {dailyReportData.uniquePlayers}</p>
                  <p>Wins: {dailyReportData.wins}</p>
                  <p>
                    Win Rate:{" "}
                    {dailyReportData.uniquePlayers > 0
                      ? ((dailyReportData.wins / dailyReportData.uniquePlayers) * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "user" && (
            <div className="space-y-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setUserReportType("activity")}
                    className={`py-3 px-1 border-b-2 text-sm ${
                      userReportType === "activity"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500"
                    }`}
                  >
                    📊 User Activity
                  </button>
                  <button
                    onClick={() => setUserReportType("daily")}
                    className={`py-3 px-1 border-b-2 text-sm ${
                      userReportType === "daily"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500"
                    }`}
                  >
                    📅 Daily User Report
                  </button>
                </nav>
              </div>

              {userReportType === "activity" && (
                <>
                  <div className="flex flex-col gap-2 mb-4">
                    <span className="text-sm text-gray-600">Enter a user ID or username for user activity report.</span>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="border rounded px-3 py-2 flex-1"
                        placeholder="User ID or Username"
                      />
                      <button
                        onClick={handleGenerateActivityReport}
                        disabled={isLoading || !selectedUser.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                      >
                        {isLoading ? "Loading..." : "Get Activity"}
                      </button>
                    </div>
                    {userActivityError && <div className="text-red-600 text-sm mt-1">{userActivityError}</div>}
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>Total Days: {userActivityData.length}</div>
                    <div>Total Words: {totalWordsTried}</div>
                    <div>Correct: {totalCorrectGuesses}</div>
                    <div>Success: {overallSuccessRate}%</div>
                  </div>

                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Words Tried</th>
                        <th className="p-2 text-left">Correct</th>
                        <th className="p-2 text-left">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userActivityData.map((d, i) => {
                        const r =
                          d.numberOfWordsTried > 0
                            ? ((d.numberOfCorrectGuesses / d.numberOfWordsTried) * 100).toFixed(1)
                            : "0"
                        return (
                          <tr key={i} className="border-t">
                            <td className="p-2">{d.date}</td>
                            <td className="p-2">{d.numberOfWordsTried}</td>
                            <td className="p-2">{d.numberOfCorrectGuesses}</td>
                            <td className="p-2">{r}%</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </>
              )}

              {userReportType === "daily" && (
                <>
                  <div className="flex flex-col gap-2 mb-4">
                    <span className="text-sm text-gray-600">Enter a user ID for daily user report.</span>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="border rounded px-3 py-2 flex-1"
                        placeholder="User ID"
                      />
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border rounded px-3 py-2"
                      />
                      <button
                        onClick={handleGenerateDailyUserReport}
                        disabled={isLoading || !selectedUser.trim()}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                      >
                        {isLoading ? "Loading..." : "Get Daily"}
                      </button>
                    </div>
                    {userDailyError && <div className="text-red-600 text-sm mt-1">{userDailyError}</div>}
                  </div>

                  {userReportData && (
                    <div className="bg-green-50 p-4 rounded">
                      <p>Games Played: {userReportData.gamesPlayed}</p>
                      <p>Wins: {userReportData.wins}</p>
                      <p>
                        Win Rate:{" "}
                        {userReportData.gamesPlayed > 0
                          ? ((userReportData.wins / userReportData.gamesPlayed) * 100).toFixed(1)
                          : 0}
                        %
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
