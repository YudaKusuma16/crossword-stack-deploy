import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { generateToken } from '../utils/jwt.js'

/**
 * Register a new user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export async function register(req, res) {
  try {
    const { email, username, password } = req.body

    // Validate input
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, username, and password'
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      })
    }

    // Validate username length
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Username must be between 3 and 20 characters'
      })
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      })
    }

    // Check if email already exists
    const existingEmail = await User.findByEmail(email)
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      })
    }

    // Check if username already exists
    const existingUsername = await User.findByUsername(username)
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username already taken'
      })
    }

    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user
    const user = await User.create(email, username, passwordHash)

    // Generate token
    const token = generateToken(user.id, user.email, user.username)

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        token
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    })
  }
}

/**
 * Login user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export async function login(req, res) {
  try {
    const { emailOrUsername, password } = req.body

    // Validate input
    if (!emailOrUsername || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/username and password'
      })
    }

    // Find user by email or username
    const user = await User.findByEmailOrUsername(emailOrUsername)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.username)

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        token
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Login failed'
    })
  }
}

/**
 * Get current user info
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export async function getCurrentUser(req, res) {
  try {
    // User is attached by authenticate middleware
    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.created_at
        }
      }
    })
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get user info'
    })
  }
}

/**
 * Logout (client-side token removal)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export function logout(req, res) {
  // For JWT-based auth, logout is handled client-side by removing the token
  // This endpoint exists for consistency and potential future session management
  res.json({
    success: true,
    message: 'Logout successful'
  })
}
