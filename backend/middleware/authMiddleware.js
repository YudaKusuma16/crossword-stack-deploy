import { verifyToken, extractToken } from '../utils/jwt.js'
import { User } from '../models/User.js'

/**
 * Authentication middleware - verifies JWT token and attaches user to request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
export async function authenticate(req, res, next) {
  try {
    // Extract token from Authorization header
    const token = extractToken(req.headers.authorization)

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      })
    }

    // Verify token
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      })
    }

    // Get fresh user data from database
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      })
    }

    // Attach user to request
    req.user = user
    req.userId = user.id

    next()
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    })
  }
}

/**
 * Optional authentication - attaches user if token is valid, but doesn't require it
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
export async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req.headers.authorization)

    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        const user = await User.findById(decoded.userId)
        if (user) {
          req.user = user
          req.userId = user.id
        }
      }
    }

    next()
  } catch (error) {
    // Continue without authentication on error
    next()
  }
}
