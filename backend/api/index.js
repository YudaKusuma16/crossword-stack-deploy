// Vercel serverless function handler for Express
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { testConnection, initializeDatabase } from '../config/database.js'
import authRoutes from '../routes/auth.js'
import puzzleRoutes from '../routes/puzzles.js'
import scoreRoutes from '../routes/scores.js'

dotenv.config()

const app = express()
let dbInitialized = false
let isInitializing = false

async function ensureDatabase() {
  if (dbInitialized) return true

  if (isInitializing) {
    await new Promise(resolve => setTimeout(resolve, 100))
    return dbInitialized
  }

  isInitializing = true
  try {
    console.log('Initializing database...')
    await initializeDatabase()
    dbInitialized = true
    console.log('Database initialized successfully')
    return true
  } catch (error) {
    console.error('Database initialization failed:', error.message)
    isInitializing = false
    return false
  }
}

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean)

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Debug logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// IMPORTANT: Define routes BEFORE 404 handler

// Root endpoint - handle multiple possible paths
const rootHandler = (req, res) => {
  res.json({
    message: 'Crossword Stack API is running',
    version: '1.0.0',
    status: 'healthy',
    endpoints: {
      health: '/health',
      api: '/api/*',
      auth: '/api/auth/*',
      puzzles: '/api/puzzles/*',
      scores: '/api/scores/*'
    }
  })
}

app.get('/', rootHandler)
app.get('/api', rootHandler)
app.get('/api/index', rootHandler)

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbReady = await ensureDatabase()
    let dbStatus = 'not_configured'

    if (dbReady) {
      const connected = await testConnection()
      dbStatus = connected ? 'connected' : 'disconnected'
    }

    res.json({
      status: 'healthy',
      database: dbStatus,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    })
  }
})

// API routes with database initialization
app.use('/api', async (req, res, next) => {
  // Skip for /api, /api/index (handled above)
  if (req.path === '/api' || req.path === '/api/index') {
    return next()
  }

  try {
    const dbReady = await ensureDatabase()
    if (!dbReady) {
      return res.status(503).json({
        success: false,
        message: 'Database service unavailable'
      })
    }
    next()
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/puzzles', puzzleRoutes)
app.use('/api/scores', scoreRoutes)

// 404 handler - MUST be last
app.use((req, res) => {
  console.log(`404 - Path: ${req.path}, URL: ${req.url}`)
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  })
})

// Error handler - MUST be after 404
app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// Export for Vercel
export default app
