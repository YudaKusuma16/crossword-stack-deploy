import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { testConnection, initializeDatabase } from './config/database.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.js'
import puzzleRoutes from './routes/puzzles.js'
import scoreRoutes from './routes/scores.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Initialize database on cold start (lazy initialization for Vercel)
let dbInitialized = false

async function ensureDatabase() {
  if (!dbInitialized) {
    try {
      await initializeDatabase()
      dbInitialized = true
      console.log('Database initialized successfully')
    } catch (error) {
      console.error('Database initialization failed:', error)
    }
  }
}

// Configure CORS for multiple origins
// CORS_ORIGIN supports comma-separated list: "https://a.vercel.app,https://b.vercel.app"
const allowedOrigins = [
  ...(process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
    : []),
  'http://localhost:5173',
  'http://localhost:3000'
]

const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Render health checks, etc.)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true)
    } else {
      console.warn(`CORS blocked origin: "${origin}". Allowed: ${JSON.stringify(allowedOrigins)}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

// Middleware
app.use(cors(corsOptions))
// Explicitly handle OPTIONS preflight for all routes
app.options('*', cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Root endpoint - API information
app.get('/', (req, res) => {
  res.json({
    name: 'Crossword Stack API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me'
      },
      puzzles: {
        list: 'GET /api/puzzles',
        myPuzzles: 'GET /api/puzzles/user/my',
        getPuzzle: 'GET /api/puzzles/:id',
        create: 'POST /api/puzzles',
        update: 'PUT /api/puzzles/:id',
        delete: 'DELETE /api/puzzles/:id'
      },
      scores: {
        submit: 'POST /api/scores',
        leaderboard: 'GET /api/scores/puzzle/:puzzleId',
        userScores: 'GET /api/scores/puzzle/:puzzleId/user'
      }
    },
    documentation: '/health for status check'
  })
})

// Health check endpoint with database initialization
app.get('/health', async (req, res) => {
  await ensureDatabase()

  const connected = await testConnection()
  res.json({
    status: connected ? 'ok' : 'error',
    database: connected ? 'connected' : 'disconnected',
    message: connected ? 'Server is running' : 'Database connection failed',
    timestamp: new Date().toISOString()
  })
})

// Initialize database for API routes
app.use('/api', async (req, res, next) => {
  await ensureDatabase()
  next()
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/puzzles', puzzleRoutes)
app.use('/api/scores', scoreRoutes)

// 404 handler
app.use(notFound)

// Error handler
app.use(errorHandler)

// Start server for both local development and production (Render, etc.)
async function startServer() {
  try {
    await ensureDatabase()
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`CORS allowed origins: ${JSON.stringify(allowedOrigins)}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Auto-start server unless running in Vercel serverless environment
// Vercel sets a specific environment variable for serverless functions
if (!process.env.VERCEL || process.env.NODE_ENV !== 'production') {
  startServer()
}

export default app
