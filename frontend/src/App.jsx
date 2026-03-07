import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CreatorPage from './pages/CreatorPage'
import PlayerPage from './pages/PlayerPage'
import MyPuzzlesPage from './pages/MyPuzzlesPage'
import LeaderboardPage from './pages/LeaderboardPage'
import { Header } from './components/layout/Header'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/play/:id" element={<PlayerPage />} />
              <Route path="/leaderboard/:puzzleId" element={<LeaderboardPage />} />
              <Route
                path="/creator"
                element={
                  <ProtectedRoute>
                    <CreatorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-puzzles"
                element={
                  <ProtectedRoute>
                    <MyPuzzlesPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
        <Toaster />
      </Router>
    </AuthProvider>
  )
}

export default App
