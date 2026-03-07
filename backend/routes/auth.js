import express from 'express'
import { register, login, logout, getCurrentUser } from '../controllers/authController.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes
router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)

// Protected routes
router.get('/me', authenticate, getCurrentUser)

export default router
