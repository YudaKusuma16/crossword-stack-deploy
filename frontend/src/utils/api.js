// API layer for Crossword Stack

// API Base URL - set VITE_API_URL in Vercel Dashboard (Settings → Environment Variables)
// Local dev fallback: /api (requires vite proxy or local backend on port 3001)
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.error('[api.js] VITE_API_URL is not set. Set it in Vercel Dashboard → Environment Variables.')
}

// Ensure BASE_URL ends with /api for consistency
const API_BASE_URL = BASE_URL.replace(/\/+$/, '')

// Simulate API delay for backward compatibility with existing code
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('auth_token')
  const headers = {
    'Content-Type': 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

// ==================== AUTH API ====================

/**
 * Login user
 * @param {string} emailOrUsername - Email or username
 * @param {string} password - Password
 * @returns {Promise<object>} Login response
 */
export async function login(emailOrUsername, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrUsername, password })
  })
  return await response.json()
}

/**
 * Register new user
 * @param {string} email - User email
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise<object>} Registration response
 */
export async function register(email, username, password) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password })
  })
  return await response.json()
}

/**
 * Logout user (client-side token removal)
 * @returns {Promise<object>} Logout response
 */
export async function logout() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: getAuthHeaders()
  })
  // Clear local storage regardless of response
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
  return await response.json()
}

/**
 * Get current user info
 * @returns {Promise<object>} User data response
 */
export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders()
  })
  return await response.json()
}

// ==================== PUZZLE API ====================

/**
 * Generate puzzle from words (client-side algorithm)
 * @param {Array} words - Array of {word, clue} objects
 * @returns {Promise<object>} Generated puzzle data
 */
export async function generatePuzzle(words) {
  await delay(800)

  // Import the algorithm function
  const { generateCrossword } = await import('./crosswordAlgorithm.js')

  // Create a cleaned word map BEFORE generating to preserve clue mapping
  // Use the same cleaning logic as the algorithm: uppercase, trim, remove non-A-Z
  const cleanWord = (word) => word.toUpperCase().trim().replace(/[^A-Z]/g, '')

  // Map cleaned words to their original clues and original form
  const wordClueMap = new Map(
    words.map(w => [cleanWord(w.word), w.clue])
  )

  // Also map cleaned words to original form for display
  const originalWordMap = new Map(
    words.map(w => [cleanWord(w.word), w.word])
  )

  const result = generateCrossword(words.map(w => w.word))

  return {
    grid: result.grid,
    wordPositions: result.wordPositions,
    words: words,
    gridSize: result.gridSize,
    placedWords: result.placedWords || [],
    unplacedWords: result.unplacedWords || [],
    clues: {
      across: result.wordPositions
        .filter(p => p.direction === 'across')
        .map((p) => ({
          number: p.number,
          clue: wordClueMap.get(p.word) || '',
          word: originalWordMap.get(p.word) || p.word, // Use original word for display
          row: p.row,
          col: p.col
        })),
      down: result.wordPositions
        .filter(p => p.direction === 'down')
        .map((p) => ({
          number: p.number,
          clue: wordClueMap.get(p.word) || '',
          word: originalWordMap.get(p.word) || p.word, // Use original word for display
          row: p.row,
          col: p.col
        }))
    }
  }
}

/**
 * Save puzzle to database
 * @param {object} puzzleData - Puzzle data to save
 * @returns {Promise<object>} Saved puzzle
 */
export async function savePuzzle(puzzleData) {
  await delay(500)

  const response = await fetch(`${API_BASE_URL}/puzzles`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(puzzleData)
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to save puzzle')
  }

  return data.data.puzzle
}

/**
 * Update puzzle
 * @param {number|string} id - Puzzle ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated puzzle
 */
export async function updatePuzzle(id, updates) {
  await delay(300)

  const response = await fetch(`${API_BASE_URL}/puzzles/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update puzzle')
  }

  return data.data.puzzle
}

/**
 * Delete puzzle
 * @param {number|string} id - Puzzle ID
 * @returns {Promise<object>} Delete response
 */
export async function deletePuzzle(id) {
  await delay(300)

  const response = await fetch(`${API_BASE_URL}/puzzles/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete puzzle')
  }

  return { success: true }
}

/**
 * Get puzzle by ID
 * @param {number|string} id - Puzzle ID
 * @returns {Promise<object>} Puzzle data
 */
export async function getPuzzle(id) {
  await delay(200)

  const response = await fetch(`${API_BASE_URL}/puzzles/${id}`, {
    headers: getAuthHeaders()
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get puzzle')
  }

  const puzzle = data.data.puzzle

  // Generate the puzzle data if not already present
  if (!puzzle.grid || !puzzle.wordPositions) {
    const { generateCrossword } = await import('./crosswordAlgorithm.js')

    // Use the same cleaning logic as the algorithm
    const cleanWord = (word) => word.toUpperCase().trim().replace(/[^A-Z]/g, '')

    // Map cleaned words to their original clues
    const wordClueMap = new Map(
      puzzle.words.map(w => [cleanWord(w.word), w.clue])
    )

    // Also map cleaned words to original form for display
    const originalWordMap = new Map(
      puzzle.words.map(w => [cleanWord(w.word), w.word])
    )

    const result = generateCrossword(puzzle.words.map(w => w.word))

    return {
      ...puzzle,
      grid: result.grid,
      wordPositions: result.wordPositions,
      gridSize: result.gridSize,
      clues: {
        across: result.wordPositions
          .filter(p => p.direction === 'across')
          .map((p) => ({
            number: p.number,
            clue: wordClueMap.get(p.word) || '',
            word: originalWordMap.get(p.word) || p.word,
            row: p.row,
            col: p.col
          })),
        down: result.wordPositions
          .filter(p => p.direction === 'down')
          .map((p) => ({
            number: p.number,
            clue: wordClueMap.get(p.word) || '',
            word: originalWordMap.get(p.word) || p.word,
            row: p.row,
            col: p.col
          }))
      }
    }
  }

  return puzzle
}

/**
 * Get all puzzles with optional filters
 * @param {object} filters - Filter options (status, limit)
 * @returns {Promise<Array>} Array of puzzles
 */
export async function getPuzzles(filters = {}) {
  await delay(300)

  const params = new URLSearchParams()
  if (filters.status) params.append('status', filters.status)
  if (filters.limit) params.append('limit', filters.limit)

  const response = await fetch(`${API_BASE_URL}/puzzles?${params.toString()}`, {
    headers: getAuthHeaders()
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get puzzles')
  }

  return data.data.puzzles
}

/**
 * Get current user's puzzles
 * @param {object} filters - Filter options (status)
 * @returns {Promise<Array>} Array of user's puzzles
 */
export async function getMyPuzzles(filters = {}) {
  await delay(300)

  const params = new URLSearchParams()
  if (filters.status) params.append('status', filters.status)

  const response = await fetch(`${API_BASE_URL}/puzzles/user/my?${params.toString()}`, {
    headers: getAuthHeaders()
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get puzzles')
  }

  return data.data.puzzles
}

// ==================== LEGACY MOCK FUNCTIONS ====================
// These are kept for backward compatibility but now use real API

export const mockGeneratePuzzle = generatePuzzle
export const mockSavePuzzle = savePuzzle
export const mockUpdatePuzzle = updatePuzzle
export const mockDeletePuzzle = deletePuzzle
export const mockGetPuzzle = getPuzzle
export const mockGetPuzzles = getPuzzles

// ==================== SCORE API ====================

/**
 * Submit a score for a completed puzzle
 * @param {number} puzzleId - Puzzle ID
 * @param {number} completionTime - Time in seconds
 * @param {number} hintsUsed - Number of hints used
 * @returns {Promise<object>} Score submission response
 */
export async function submitScore(puzzleId, completionTime, hintsUsed) {
  const response = await fetch(`${API_BASE_URL}/scores`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      puzzleId,
      completionTime,
      hintsUsed
    })
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit score')
  }

  return data.data.score
}

/**
 * Get leaderboard for a puzzle
 * @param {number|string} puzzleId - Puzzle ID
 * @returns {Promise<Array>} Array of scores
 */
export async function getLeaderboard(puzzleId) {
  const response = await fetch(`${API_BASE_URL}/scores/puzzle/${puzzleId}`, {
    headers: getAuthHeaders()
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get leaderboard')
  }

  return data.data.scores || []
}

/**
 * Get current user's scores for a puzzle
 * @param {number|string} puzzleId - Puzzle ID
 * @returns {Promise<Array>} Array of user's scores
 */
export async function getUserScores(puzzleId) {
  const response = await fetch(`${API_BASE_URL}/scores/puzzle/${puzzleId}/user`, {
    headers: getAuthHeaders()
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get user scores')
  }

  return data.data.scores || []
}
