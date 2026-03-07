/**
 * Centralized error handling middleware
 * @param {Error} err - Error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err)

  // Default error
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal server error'

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401
    message = 'Unauthorized'
  } else if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409
    message = 'Duplicate entry'
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

/**
 * Not found handler for undefined routes
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
}
