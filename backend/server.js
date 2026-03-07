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
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean)

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
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
      console.log(`CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`)
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
