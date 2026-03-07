import pool from '../config/database.js'

export class User {
  /**
   * Create a new user
   * @param {string} email - User email
   * @param {string} username - Username
   * @param {string} passwordHash - Hashed password
   * @returns {Promise<object>} Created user
   */
  static async create(email, username, passwordHash) {
    const [result] = await pool.execute(
      `INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)`,
      [email, username, passwordHash]
    )

    const [users] = await pool.execute(
      `SELECT id, email, username, created_at FROM users WHERE id = ?`,
      [result.insertId]
    )

    return users[0]
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<object|null>} User object or null
   */
  static async findByEmail(email) {
    const [users] = await pool.execute(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    )
    return users[0] || null
  }

  /**
   * Find user by username
   * @param {string} username - Username
   * @returns {Promise<object|null>} User object or null
   */
  static async findByUsername(username) {
    const [users] = await pool.execute(
      `SELECT * FROM users WHERE username = ?`,
      [username]
    )
    return users[0] || null
  }

  /**
   * Find user by email or username
   * @param {string} emailOrUsername - Email or username
   * @returns {Promise<object|null>} User object or null
   */
  static async findByEmailOrUsername(emailOrUsername) {
    const [users] = await pool.execute(
      `SELECT * FROM users WHERE email = ? OR username = ?`,
      [emailOrUsername, emailOrUsername]
    )
    return users[0] || null
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<object|null>} User object or null
   */
  static async findById(id) {
    const [users] = await pool.execute(
      `SELECT id, email, username, created_at FROM users WHERE id = ?`,
      [id]
    )
    return users[0] || null
  }

  /**
   * Update user
   * @param {number} id - User ID
   * @param {object} updates - Fields to update
   * @returns {Promise<object>} Updated user
   */
  static async update(id, updates) {
    const fields = []
    const values = []

    if (updates.email) {
      fields.push('email = ?')
      values.push(updates.email)
    }
    if (updates.username) {
      fields.push('username = ?')
      values.push(updates.username)
    }
    if (updates.passwordHash) {
      fields.push('password_hash = ?')
      values.push(updates.passwordHash)
    }

    if (fields.length === 0) {
      return await User.findById(id)
    }

    values.push(id)

    await pool.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    )

    return await User.findById(id)
  }

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if deleted
   */
  static async delete(id) {
    const [result] = await pool.execute(
      `DELETE FROM users WHERE id = ?`,
      [id]
    )
    return result.affectedRows > 0
  }
}
