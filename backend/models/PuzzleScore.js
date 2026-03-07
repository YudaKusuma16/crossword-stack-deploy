import pool from '../config/database.js'

export class PuzzleScore {
  /**
   * Submit a new score
   * @param {object} scoreData - Score data
   * @returns {Promise<object>} Created score
   */
  static async create(scoreData) {
    const { puzzleId, userId, completionTime, hintsUsed } = scoreData
    const score = completionTime + (hintsUsed * 5)

    const [result] = await pool.execute(
      `INSERT INTO puzzle_scores (puzzle_id, user_id, completion_time, hints_used, score)
       VALUES (?, ?, ?, ?, ?)`,
      [puzzleId, userId, completionTime, hintsUsed, score]
    )

    return await PuzzleScore.findById(result.insertId)
  }

  /**
   * Find score by ID
   * @param {number} id - Score ID
   * @returns {Promise<object|null>} Score object or null
   */
  static async findById(id) {
    const [scores] = await pool.execute(
      `SELECT s.*, u.username
       FROM puzzle_scores s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`,
      [id]
    )

    return scores[0] || null
  }

  /**
   * Get leaderboard for a puzzle (top 3 per user, sorted by score)
   * @param {number} puzzleId - Puzzle ID
   * @returns {Promise<Array>} Array of scores
   */
  static async getLeaderboard(puzzleId) {
    const [scores] = await pool.execute(`
      SELECT s.*, u.username
      FROM puzzle_scores s
      JOIN users u ON s.user_id = u.id
      WHERE s.puzzle_id = ?
      ORDER BY s.score ASC
    `, [puzzleId])

    // Process to get top 3 per user
    const userTopScores = new Map()

    for (const score of scores) {
      const userId = score.user_id
      if (!userTopScores.has(userId)) {
        userTopScores.set(userId, [])
      }
      if (userTopScores.get(userId).length < 3) {
        userTopScores.get(userId).push(score)
      }
    }

    // Flatten and re-sort
    return Array.from(userTopScores.values())
      .flat()
      .sort((a, b) => a.score - b.score)
  }

  /**
   * Get user's scores for a puzzle
   * @param {number} puzzleId - Puzzle ID
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of user's scores
   */
  static async getUserScores(puzzleId, userId) {
    const [scores] = await pool.execute(
      `SELECT * FROM puzzle_scores
       WHERE puzzle_id = ? AND user_id = ?
       ORDER BY score ASC
       LIMIT 3`,
      [puzzleId, userId]
    )
    return scores
  }
}
