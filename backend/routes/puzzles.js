import express from 'express'
import {
  getPuzzles,
  getPuzzleById,
  getMyPuzzles,
  createPuzzle,
  updatePuzzle,
  deletePuzzle
} from '../controllers/puzzleController.js'
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes (with optional auth for better experience)
router.get('/', optionalAuth, getPuzzles)
router.get('/:id', optionalAuth, getPuzzleById)

// Protected routes
router.get('/user/my', authenticate, getMyPuzzles)
router.post('/', authenticate, createPuzzle)
router.put('/:id', authenticate, updatePuzzle)
router.delete('/:id', authenticate, deletePuzzle)

export default router
