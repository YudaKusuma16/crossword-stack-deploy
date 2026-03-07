import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Failed to parse stored user data:', error)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }

    setLoading(false)
  }, [])

  // Update localStorage when user or token changes
  useEffect(() => {
    if (token && user) {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
  }, [token, user])

  // Helper function to set auth headers
  const getAuthHeaders = useCallback(() => {
    if (!token) return {}
    return {
      Authorization: `Bearer ${token}`
    }
  }, [token])

  // Login function
  const login = useCallback(async (emailOrUsername, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emailOrUsername, password })
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: data.message || 'Please check your credentials and try again.'
        })
        return { success: false, message: data.message }
      }

      setToken(data.data.token)
      setUser(data.data.user)

      toast({
        title: 'Welcome back!',
        description: `Logged in as ${data.data.user.username}`
      })

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        variant: 'destructive',
        title: 'Login Error',
        description: 'An error occurred while logging in. Please try again.'
      })
      return { success: false, message: 'Network error' }
    }
  }, [toast])

  // Register function
  const register = useCallback(async (email, username, password) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, username, password })
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: data.message || 'Please check your input and try again.'
        })
        return { success: false, message: data.message }
      }

      setToken(data.data.token)
      setUser(data.data.user)

      toast({
        title: 'Account Created!',
        description: 'Welcome to Crossword Stack!'
      })

      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        variant: 'destructive',
        title: 'Registration Error',
        description: 'An error occurred while creating your account. Please try again.'
      })
      return { success: false, message: 'Network error' }
    }
  }, [toast])

  // Logout function
  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')

    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully.'
    })
  }, [toast])

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    if (!token) return

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.data.user)
      } else {
        // Token is invalid, logout
        logout()
      }
    } catch (error) {
      console.error('Refresh user error:', error)
    }
  }, [token, logout])

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    getAuthHeaders
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
