import express from 'express'
import { submitScore, getLeaderboard, getUserScores } from '../controllers/scoreController.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = express.Router()

// Submit score (requires auth)
router.post('/', authenticate, submitScore)

// Get leaderboard for a puzzle (public)
router.get('/puzzle/:puzzleId', getLeaderboard)

// Get current user's scores for a puzzle (requires auth)
router.get('/puzzle/:puzzleId/user', authenticate, getUserScores)

export default router
