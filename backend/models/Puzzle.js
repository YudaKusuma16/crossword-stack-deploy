import pool from '../config/database.js'

export class Puzzle {
  /**
   * Create a new puzzle
   * @param {object} puzzleData - Puzzle data
   * @returns {Promise<object>} Created puzzle
   */
  static async create(puzzleData) {
    const {
      userId,
      title,
      description,
      words,
      gridSize,
      grid,
      wordPositions,
      clues,
      status = 'draft'
    } = puzzleData

    const [result] = await pool.execute(
      `INSERT INTO puzzles (user_id, title, description, words, grid_size, grid, word_positions, clues, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title,
        description,
        JSON.stringify(words),
        gridSize,
        grid ? JSON.stringify(grid) : null,
        wordPositions ? JSON.stringify(wordPositions) : null,
        clues ? JSON.stringify(clues) : null,
        status
      ]
    )

    return await Puzzle.findById(result.insertId)
  }

  /**
   * Find puzzle by ID
   * @param {number} id - Puzzle ID
   * @returns {Promise<object|null>} Puzzle object or null
   */
  static async findById(id) {
    const [puzzles] = await pool.execute(
      `SELECT p.*, u.username as author_name
       FROM puzzles p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [id]
    )

    if (!puzzles[0]) return null

    return Puzzle.parseJSONFields(puzzles[0])
  }

  /**
   * Find all puzzles with optional filters
   * @param {object} filters - Filter options
   * @returns {Promise<Array>} Array of puzzles
   */
  static async findAll(filters = {}) {
    let query = `SELECT p.*, u.username as author_name
                  FROM puzzles p
                  LEFT JOIN users u ON p.user_id = u.id
                  WHERE 1=1`
    const params = []

    if (filters.userId) {
      query += ` AND p.user_id = ?`
      params.push(filters.userId)
    }

    if (filters.status) {
      query += ` AND p.status = ?`
      params.push(filters.status)
    }

    query += ` ORDER BY p.created_at DESC`

    if (filters.limit) {
      query += ` LIMIT ?`
      params.push(filters.limit)
    }

    const [puzzles] = await pool.execute(query, params)

    return puzzles.map(p => Puzzle.parseJSONFields(p))
  }

  /**
   * Find puzzles by user ID
   * @param {number} userId - User ID
   * @param {object} filters - Additional filters
   * @returns {Promise<Array>} Array of user's puzzles
   */
  static async findByUserId(userId, filters = {}) {
    return await Puzzle.findAll({ ...filters, userId })
  }

  /**
   * Update puzzle
   * @param {number} id - Puzzle ID
   * @param {object} updates - Fields to update
   * @returns {Promise<object>} Updated puzzle
   */
  static async update(id, updates) {
    const fields = []
    const values = []

    if (updates.title !== undefined) {
      fields.push('title = ?')
      values.push(updates.title)
    }
    if (updates.description !== undefined) {
      fields.push('description = ?')
      values.push(updates.description)
    }
    if (updates.words !== undefined) {
      fields.push('words = ?')
      values.push(JSON.stringify(updates.words))
    }
    if (updates.gridSize !== undefined) {
      fields.push('grid_size = ?')
      values.push(updates.gridSize)
    }
    if (updates.grid !== undefined) {
      fields.push('grid = ?')
      values.push(updates.grid ? JSON.stringify(updates.grid) : null)
    }
    if (updates.wordPositions !== undefined) {
      fields.push('word_positions = ?')
      values.push(updates.wordPositions ? JSON.stringify(updates.wordPositions) : null)
    }
    if (updates.clues !== undefined) {
      fields.push('clues = ?')
      values.push(updates.clues ? JSON.stringify(updates.clues) : null)
    }
    if (updates.status !== undefined) {
      fields.push('status = ?')
      values.push(updates.status)
    }

    if (fields.length === 0) {
      return await Puzzle.findById(id)
    }

    values.push(id)

    await pool.execute(
      `UPDATE puzzles SET ${fields.join(', ')} WHERE id = ?`,
      values
    )

    return await Puzzle.findById(id)
  }

  /**
   * Delete puzzle
   * @param {number} id - Puzzle ID
   * @param {number} userId - User ID (for ownership verification)
   * @returns {Promise<boolean>} True if deleted
   */
  static async delete(id, userId) {
    const [result] = await pool.execute(
      `DELETE FROM puzzles WHERE id = ? AND user_id = ?`,
      [id, userId]
    )
    return result.affectedRows > 0
  }

  /**
   * Check if puzzle belongs to user
   * @param {number} id - Puzzle ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if user owns puzzle
   */
  static async belongsToUser(id, userId) {
    const [puzzles] = await pool.execute(
      `SELECT id FROM puzzles WHERE id = ? AND user_id = ?`,
      [id, userId]
    )
    return puzzles.length > 0
  }

  /**
   * Parse JSON fields from database
   * Note: MySQL2 automatically parses JSON fields to objects, so we only need to parse if they're strings
   * @param {object} puzzle - Puzzle from database
   * @returns {object} Puzzle with parsed JSON fields and author info
   */
  static parseJSONFields(puzzle) {
    return {
      ...puzzle,
      authorName: puzzle.author_name || null,
      words: puzzle.words ? (typeof puzzle.words === 'string' ? JSON.parse(puzzle.words) : puzzle.words) : [],
      grid: puzzle.grid ? (typeof puzzle.grid === 'string' ? JSON.parse(puzzle.grid) : puzzle.grid) : null,
      wordPositions: puzzle.word_positions ? (typeof puzzle.word_positions === 'string' ? JSON.parse(puzzle.word_positions) : puzzle.word_positions) : null,
      clues: puzzle.clues ? (typeof puzzle.clues === 'string' ? JSON.parse(puzzle.clues) : puzzle.clues) : null
    }
  }
}
