import { PuzzleScore } from '../models/PuzzleScore.js'

/**
 * Submit a new score
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export async function submitScore(req, res) {
  try {
    const { puzzleId, completionTime, hintsUsed } = req.body

    // Validate required fields
    if (!puzzleId || completionTime === undefined || hintsUsed === undefined) {
      return res.status(400).json({
        success: false,
        message: 'puzzleId, completionTime, and hintsUsed are required'
      })
    }

    // Validate values
    if (completionTime < 0 || hintsUsed < 0) {
      return res.status(400).json({
        success: false,
        message: 'completionTime and hintsUsed must be non-negative'
      })
    }

    const score = await PuzzleScore.create({
      puzzleId,
      userId: req.userId,
      completionTime,
      hintsUsed
    })

    res.status(201).json({
      success: true,
      message: 'Score submitted successfully',
      data: { score }
    })
  } catch (error) {
    console.error('Submit score error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit score'
    })
  }
}

/**
 * Get leaderboard for a puzzle
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export async function getLeaderboard(req, res) {
  try {
    const { puzzleId } = req.params

    if (!puzzleId) {
      return res.status(400).json({
        success: false,
        message: 'puzzleId is required'
      })
    }

    const scores = await PuzzleScore.getLeaderboard(puzzleId)

    res.json({
      success: true,
      data: { scores }
    })
  } catch (error) {
    console.error('Get leaderboard error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard'
    })
  }
}

/**
 * Get current user's scores for a puzzle
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export async function getUserScores(req, res) {
  try {
    const { puzzleId } = req.params

    if (!puzzleId) {
      return res.status(400).json({
        success: false,
        message: 'puzzleId is required'
      })
    }

    const scores = await PuzzleScore.getUserScores(puzzleId, req.userId)

    res.json({
      success: true,
      data: { scores }
    })
  } catch (error) {
    console.error('Get user scores error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get user scores'
    })
  }
}
