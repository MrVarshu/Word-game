"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { GameBoard } from "@/components/game-board"
import { AdminDashboard } from "@/components/admin-dashboard"
import { HomePage } from "@/components/home-page"
import { GameHistory } from "@/components/game-history"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, UserIcon, Shield } from "lucide-react"

interface AppUser {
  id: string
  username: string
  role: "player" | "admin"
}

type ViewType = "home" | "game" | "history" | "admin"

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [currentView, setCurrentView] = useState<ViewType>("home")

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem("wordGameUser")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogin = (userData: AppUser) => {
    // Normalize role to lowercase for consistency and cast to correct type
    const normalizedRole = userData.role.toLowerCase() as "player" | "admin";
    const normalizedUser: AppUser = { ...userData, role: normalizedRole };
    setUser(normalizedUser);
    localStorage.setItem("wordGameUser", JSON.stringify(normalizedUser));
    setCurrentView(normalizedUser.role === "admin" ? "admin" : "home");
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("wordGameUser")
    setCurrentView("home")
  }

  const handleNavigation = (view: ViewType) => {
    setCurrentView(view)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                WordGuess
              </CardTitle>
              <p className="text-muted-foreground mt-2">Test your vocabulary skills with our daily word challenge</p>
            </CardHeader>
            <CardContent>
              <LoginForm onLogin={handleLogin} />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleNavigation("home")}
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
              >
                WordGuess
              </button>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <UserIcon className="w-4 h-4" />
                <span>{user.username}</span>
                {user.role === "admin" && <Shield className="w-4 h-4 text-amber-500" />}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user.role === "admin" && (
                <div className="flex space-x-2">
                  <Button
                    variant={currentView === "home" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNavigation("home")}
                  >
                    Home
                  </Button>
                  <Button
                    variant={currentView === "admin" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNavigation("admin")}
                  >
                    Admin
                  </Button>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "home" && <HomePage user={user} onNavigate={handleNavigation} />}
        {currentView === "game" && <GameBoard user={user} onNavigate={handleNavigation} />}
        {currentView === "history" && <GameHistory user={user} onNavigate={handleNavigation} />}
        {currentView === "admin" && <AdminDashboard />}
      </main>
    </div>
  )
}
