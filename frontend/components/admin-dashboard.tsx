"use client";

import { useState } from "react";
import { adminApi } from "../lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Calendar,
  Users,
  Trophy,
  BarChart3,
  Search,
  TrendingUp,
  User,
} from "lucide-react";

interface UserActivity {
  date: string;
  numberOfWordsTried: number;
  numberOfCorrectGuesses: number;
}
interface DailyReport {
  date: number;
  wins: number;
  uniquePlayers: number;
}
interface UserDailyReport {
  date: number;
  gamesPlayed: number;
  wins: number;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"daily" | "user">("user");
  const [userReportType, setUserReportType] = useState<"activity" | "daily">(
    "activity"
  );
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedUserActivity, setSelectedUserActivity] = useState("");
  const [selectedUserDaily, setSelectedUserDaily] = useState("");
  const [userActivityData, setUserActivityData] = useState<UserActivity[]>([]);
  const [userReportData, setUserReportData] =
    useState<UserDailyReport | null>(null);
  const [dailyReportData, setDailyReportData] = useState<DailyReport | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [userActivityError, setUserActivityError] = useState("");
  const [userDailyError, setUserDailyError] = useState("");

  const handleGenerateActivityReport = async () => {
    setUserActivityError("");
    setUserActivityData([]);
    if (!selectedUserActivity.trim()) {
      setUserActivityError("Please enter a user ID or username.");
      return;
    }
    setIsLoading(true);
    try {
      let params;
      if (/^\d+$/.test(selectedUserActivity.trim())) {
        params = { userId: selectedUserActivity.trim() };
      } else {
        params = { username: selectedUserActivity.trim() };
      }
      const response = await adminApi.getUserActivity(params);
      if (response.error) {
        setUserActivityError(response.error);
      } else {
        setUserActivityData(response.data || []);
      }
    } catch {
      setUserActivityError("Failed to fetch user activity.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDailyUserReport = async () => {
    setUserDailyError("");
    setUserReportData(null);
    if (!selectedUserDaily.trim()) {
      setUserDailyError("Please enter a user ID.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await adminApi.getUserReport(selectedUserDaily, selectedDate);
      if (response.error) {
        setUserDailyError(response.error);
      } else {
        setUserReportData(response.data || null);
      }
    } catch {
      setUserDailyError("Failed to fetch daily user report.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDailyReport = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getDailyReport(selectedDate);
      setDailyReportData(response.data || null);
    } catch {
      setDailyReportData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const totalWordsTried = userActivityData.reduce(
    (sum, d) => sum + d.numberOfWordsTried,
    0
  );
  const totalCorrectGuesses = userActivityData.reduce(
    (sum, d) => sum + d.numberOfCorrectGuesses,
    0
  );
  const overallSuccessRate =
    totalWordsTried > 0
      ? ((totalCorrectGuesses / totalWordsTried) * 100).toFixed(1)
      : "0";

  return (
    /* inside return(...) replace everything starting at <div className="space-y-6"> */

    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Monitor game statistics and user performance
          </p>
        </div>
        <span className="bg-gray-200 text-gray-700 px-4 py-1 rounded-full text-sm">
          Live Dashboard
        </span>
      </div>

      {/* Tabs: Daily / User */}
      <div className="bg-white shadow rounded-xl">
        <div className="border-b">
          <nav className="flex space-x-6 px-6">
            <button
              onClick={() => setActiveTab("daily")}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "daily"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              📅 Daily Reports
            </button>
            <button
              onClick={() => setActiveTab("user")}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
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
          {/* --- DAILY REPORT --- */}
          {activeTab === "daily" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                📅 Daily Report
              </h2>
              <div className="flex gap-4 items-center">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border rounded-lg px-3 py-2"
                />
                <button
                  onClick={handleGenerateDailyReport}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  {isLoading ? "Loading..." : "Generate Report"}
                </button>
              </div>

              {dailyReportData && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600">Unique Players</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {dailyReportData.uniquePlayers}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600">Wins</p>
                    <p className="text-2xl font-bold text-green-600">
                      {dailyReportData.wins}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600">Win Rate</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {dailyReportData.uniquePlayers > 0
                        ? (
                            (dailyReportData.wins /
                              dailyReportData.uniquePlayers) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- USER REPORT --- */}
          {activeTab === "user" && (
            <div className="space-y-6">
              {/* sub tabs */}
              <div className="border-b">
                <nav className="flex space-x-6">
                  <button
                    onClick={() => setUserReportType("activity")}
                    className={`py-3 text-sm border-b-2 transition ${
                      userReportType === "activity"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    📊 User Activity (All Dates)
                  </button>
                  <button
                    onClick={() => setUserReportType("daily")}
                    className={`py-3 text-sm border-b-2 transition ${
                      userReportType === "daily"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    📅 Daily User Report
                  </button>
                </nav>
              </div>

              {/* ACTIVITY */}
              {userReportType === "activity" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex gap-2">
                    📊 User Activity Report
                  </h3>
                  <p className="text-gray-600 text-sm">
                    View detailed user activity breakdown by date with words tried
                    and success rates
                  </p>

                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Username or User ID"
                      value={selectedUserActivity}
                      onChange={(e) => setSelectedUserActivity(e.target.value)}
                      className="border rounded-lg px-3 py-2 flex-1"
                    />
                    <button
                      onClick={handleGenerateActivityReport}
                      disabled={isLoading || !selectedUserActivity.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      {isLoading ? "Loading..." : "Generate Activity Report"}
                    </button>
                  </div>
                  {userActivityError && (
                    <p className="text-sm text-red-600">{userActivityError}</p>
                  )}

                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-xl text-center">
                      <p className="text-sm">Total Days</p>
                      <p className="text-xl font-bold">
                        {userActivityData.length}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl text-center">
                      <p className="text-sm">Total Words Tried</p>
                      <p className="text-xl font-bold">{totalWordsTried}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl text-center">
                      <p className="text-sm">Total Correct</p>
                      <p className="text-xl font-bold">{totalCorrectGuesses}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl text-center">
                      <p className="text-sm">Success Rate</p>
                      <p className="text-xl font-bold">{overallSuccessRate}%</p>
                    </div>
                  </div>

                  <table className="w-full text-sm border mt-4">
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
                            ? (
                                (d.numberOfCorrectGuesses /
                                  d.numberOfWordsTried) *
                                100
                              ).toFixed(1)
                            : "0";
                        return (
                          <tr key={i} className="border-t">
                            <td className="p-2">{d.date}</td>
                            <td className="p-2">{d.numberOfWordsTried}</td>
                            <td className="p-2">{d.numberOfCorrectGuesses}</td>
                            <td className="p-2">{r}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* DAILY USER */}
              {userReportType === "daily" && (
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Enter a user ID for daily user report.
                  </p>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="User ID"
                      value={selectedUserDaily}
                      onChange={(e) => setSelectedUserDaily(e.target.value)}
                      className="border rounded-lg px-3 py-2 flex-1"
                    />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="border rounded-lg px-3 py-2"
                    />
                    <button
                      onClick={handleGenerateDailyUserReport}
                      disabled={isLoading || !selectedUserDaily.trim()}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg"
                    >
                      {isLoading ? "Loading..." : "Get Daily"}
                    </button>
                  </div>
                  {userDailyError && (
                    <p className="text-sm text-red-600">{userDailyError}</p>
                  )}

                  {userReportData && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <p>Games Played: {userReportData.gamesPlayed}</p>
                      <p>Wins: {userReportData.wins}</p>
                      <p>
                        Win Rate:{" "}
                        {userReportData.gamesPlayed > 0
                          ? (
                              (userReportData.wins /
                                userReportData.gamesPlayed) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
