import { Puzzle } from '../models/Puzzle.js'

/**
 * Get all puzzles (with optional filters)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export async function getPuzzles(req, res) {
  try {
    const { status, limit } = req.query

    const filters = {}
    if (status) filters.status = status
    if (limit) filters.limit = parseInt(limit)

    // If authenticated, optionally show user's puzzles first
    const puzzles = await Puzzle.findAll(filters)

    res.json({
      success: true,
      data: { puzzles }
    })
  } catch (error) {
    console.error('Get puzzles error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get puzzles'
    })
  }
}

/**
 * Get puzzle by ID
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export async function getPuzzleById(req, res) {
  try {
    const { id } = req.params

    const puzzle = await Puzzle.findById(id)

    if (!puzzle) {
      return res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      })
    }

    res.json({
      success: true,
      data: { puzzle }
    })
  } catch (error) {
    console.error('Get puzzle error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get puzzle'
    })
  }
}

/**
 * Get current user's puzzles
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export async function getMyPuzzles(req, res) {
  try {
    const { status } = req.query

    const filters = { userId: req.userId }
    if (status) filters.status = status

    const puzzles = await Puzzle.findByUserId(req.userId, filters)

    res.json({
      success: true,
      data: { puzzles }
    })
  } catch (error) {
    console.error('Get my puzzles error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get puzzles'
    })
  }
}

/**
 * Create a new puzzle
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export async function createPuzzle(req, res) {
  try {
    const { title, description, words, gridSize, grid, wordPositions, clues, status } = req.body

    // Validate required fields
    if (!title || !words || !Array.isArray(words) || words.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title and at least one word are required'
      })
    }

    const puzzle = await Puzzle.create({
      userId: req.userId,
      title,
      description,
      words,
      gridSize: gridSize || 10,
      grid,
      wordPositions,
      clues,
      status: status || 'draft'
    })

    res.status(201).json({
      success: true,
      message: 'Puzzle created successfully',
      data: { puzzle }
    })
  } catch (error) {
    console.error('Create puzzle error:', error)
    console.error('Error stack:', error.stack)
    console.error('Error message:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to create puzzle',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * Update a puzzle
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export async function updatePuzzle(req, res) {
  try {
    const { id } = req.params
    const updates = req.body

    // Check if puzzle exists and belongs to user
    const existingPuzzle = await Puzzle.findById(id)

    if (!existingPuzzle) {
      return res.status(404).json({
        success: false,
        message: 'Puzzle not found'
      })
    }

    if (existingPuzzle.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this puzzle'
      })
    }

    const puzzle = await Puzzle.update(id, updates)

    res.json({
      success: true,
      message: 'Puzzle updated successfully',
      data: { puzzle }
    })
  } catch (error) {
    console.error('Update puzzle error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update puzzle'
    })
  }
}

/**
 * Delete a puzzle
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export async function deletePuzzle(req, res) {
  try {
    const { id } = req.params

    // Check ownership and delete
    const deleted = await Puzzle.delete(id, req.userId)

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Puzzle not found or you do not have permission to delete it'
      })
    }

    res.json({
      success: true,
      message: 'Puzzle deleted successfully'
    })
  } catch (error) {
    console.error('Delete puzzle error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete puzzle'
    })
  }
}
