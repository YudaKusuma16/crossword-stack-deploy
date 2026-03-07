/**
 * Crossword Generation Algorithm (Completely Rewritten)
 * Focus: Clean, readable puzzles with proper spacing
 */

// Helper to create an empty grid
function createEmptyGrid(size) {
  return Array(size).fill(null).map(() => Array(size).fill(null))
}

// Calculate the "density" of a grid area - higher means more crowded
function calculateGridDensity(grid, row, col, wordLength, direction, size) {
  let density = 0
  const checkRadius = 3 // Check cells within this radius

  for (let i = 0; i < wordLength; i++) {
    const r = direction === 'across' ? row : row + i
    const c = direction === 'across' ? col + i : col

    // Check surrounding cells
    for (let dr = -checkRadius; dr <= checkRadius; dr++) {
      for (let dc = -checkRadius; dc <= checkRadius; dc++) {
        const nr = r + dr
        const nc = c + dc

        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          if (grid[nr][nc] !== null) {
            // Closer cells contribute more to density
            const distance = Math.abs(dr) + Math.abs(dc)
            density += (checkRadius - distance + 1)
          }
        }
      }
    }
  }

  return density
}

// Check if placing a word would violate minimum spacing rules
function checkMinimumSpacing(grid, row, col, wordLength, direction, size) {
  const MIN_GAP_BETWEEN_WORDS = 2 // Minimum empty cells between parallel words

  if (direction === 'across') {
    // Check the entire row for other across words
    const wordStart = col
    const wordEnd = col + wordLength - 1

    // Scan left
    for (let c = wordStart - 1; c >= 0; c--) {
      if (grid[row][c] !== null) {
        // Found something, check if it's part of an across word
        let hasAdjacent = false
        if (c > 0 && grid[row][c - 1] !== null) hasAdjacent = true
        if (c < size - 1 && grid[row][c + 1] !== null && c + 1 < wordStart) hasAdjacent = true

        if (hasAdjacent) {
          const gap = wordStart - c - 1
          if (gap < MIN_GAP_BETWEEN_WORDS) return false
        }
        break
      }
    }

    // Scan right
    for (let c = wordEnd + 1; c < size; c++) {
      if (grid[row][c] !== null) {
        let hasAdjacent = false
        if (c > 0 && grid[row][c - 1] !== null && c - 1 > wordEnd) hasAdjacent = true
        if (c < size - 1 && grid[row][c + 1] !== null) hasAdjacent = true

        if (hasAdjacent) {
          const gap = c - wordEnd - 1
          if (gap < MIN_GAP_BETWEEN_WORDS) return false
        }
        break
      }
    }
  } else {
    // Check the entire column for other down words
    const wordStart = row
    const wordEnd = row + wordLength - 1

    // Scan up
    for (let r = wordStart - 1; r >= 0; r--) {
      if (grid[r][col] !== null) {
        let hasAdjacent = false
        if (r > 0 && grid[r - 1][col] !== null) hasAdjacent = true
        if (r < size - 1 && grid[r + 1][col] !== null && r + 1 < wordStart) hasAdjacent = true

        if (hasAdjacent) {
          const gap = wordStart - r - 1
          if (gap < MIN_GAP_BETWEEN_WORDS) return false
        }
        break
      }
    }

    // Scan down
    for (let r = wordEnd + 1; r < size; r++) {
      if (grid[r][col] !== null) {
        let hasAdjacent = false
        if (r > 0 && grid[r - 1][col] !== null && r - 1 > wordEnd) hasAdjacent = true
        if (r < size - 1 && grid[r + 1][col] !== null) hasAdjacent = true

        if (hasAdjacent) {
          const gap = r - wordEnd - 1
          if (gap < MIN_GAP_BETWEEN_WORDS) return false
        }
        break
      }
    }
  }

  return true
}

// Comprehensive check if a word can be placed
function canPlaceWord(grid, word, row, col, direction, placedWords, size) {
  const wordLength = word.length

  // Basic bounds check
  if (direction === 'across') {
    if (col + wordLength > size) return { canPlace: false, reason: 'out_of_bounds' }
    if (col > 0 && grid[row][col - 1] !== null) return { canPlace: false, reason: 'blocked_before' }
    if (col + wordLength < size && grid[row][col + wordLength] !== null) return { canPlace: false, reason: 'blocked_after' }
  } else {
    if (row + wordLength > size) return { canPlace: false, reason: 'out_of_bounds' }
    if (row > 0 && grid[row - 1][col] !== null) return { canPlace: false, reason: 'blocked_before' }
    if (row + wordLength < size && grid[row + wordLength][col] !== null) return { canPlace: false, reason: 'blocked_after' }
  }

  // Check minimum spacing between parallel words
  if (!checkMinimumSpacing(grid, row, col, wordLength, direction, size)) {
    return { canPlace: false, reason: 'too_close_to_parallel' }
  }

  let intersections = 0
  let adjacentToPerpendicular = 0
  const intersectionPoints = []

  for (let i = 0; i < wordLength; i++) {
    const r = direction === 'across' ? row : row + i
    const c = direction === 'across' ? col + i : col

    if (grid[r][c] !== null) {
      // Cell is already occupied
      if (grid[r][c] !== word[i]) {
        return { canPlace: false, reason: 'letter_conflict' }
      }
      intersections++
      intersectionPoints.push({ row: r, col: c, index: i })
    } else {
      // This is an empty cell - check what's around it
      if (direction === 'across') {
        // Check above and below
        const hasAbove = r > 0 && grid[r - 1][c] !== null
        const hasBelow = r < size - 1 && grid[r + 1][c] !== null

        if (hasAbove || hasBelow) {
          const isIntersection = intersectionPoints.some(ip => ip.row === r && ip.col === c)
          if (!isIntersection) {
            // Would create a 2+ letter perpendicular word
            adjacentToPerpendicular++

            // Verify this doesn't create invalid 2-letter words
            if (hasAbove && hasBelow) {
              return { canPlace: false, reason: 'creates_invalid_word' }
            }
          }
        }
      } else {
        // Check left and right
        const hasLeft = c > 0 && grid[r][c - 1] !== null
        const hasRight = c < size - 1 && grid[r][c + 1] !== null

        if (hasLeft || hasRight) {
          const isIntersection = intersectionPoints.some(ip => ip.row === r && ip.col === c)
          if (!isIntersection) {
            adjacentToPerpendicular++

            if (hasLeft && hasRight) {
              return { canPlace: false, reason: 'creates_invalid_word' }
            }
          }
        }
      }
    }
  }

  // First word can have 0 intersections, others need at least 1
  if (placedWords.length > 0 && intersections === 0) {
    return { canPlace: false, reason: 'no_intersection' }
  }

  // Prefer single intersections, avoid multiple intersections on same word
  if (intersections > 1 && adjacentToPerpendicular > 0) {
    // Too complex - might create confusion
    return { canPlace: false, reason: 'too_complex' }
  }

  return {
    canPlace: true,
    intersections,
    adjacentToPerpendicular,
    intersectionPoints
  }
}

// Calculate a comprehensive score for word placement
function scorePlacement(grid, word, row, col, direction, placedWords, size) {
  const wordLength = word.length
  const check = canPlaceWord(grid, word, row, col, direction, placedWords, size)

  if (!check.canPlace) {
    return -Infinity
  }

  let score = 0

  // Base score for valid placement
  score += 1000

  // Strong bonus for having intersections (but not too many)
  if (check.intersections === 1) {
    score += 500 // Ideal: single intersection
  } else if (check.intersections === 2) {
    score += 300 // Still good
  } else if (check.intersections >= 3) {
    score -= 200 // Too many intersections = confusing
  }

  // Small bonus for being near center
  const center = Math.floor(size / 2)
  const distanceFromCenter = Math.abs(row - center) + Math.abs(col - center)
  score -= distanceFromCenter * 5

  // Penalize high density areas (we want spread out puzzles)
  const density = calculateGridDensity(grid, row, col, wordLength, direction, size)
  score -= density * 50

  // Prefer positions that extend the puzzle outward, not inward
  // This helps keep the puzzle compact but not crowded
  const extendsOutward = direction === 'across'
    ? Math.max(row, size - row - 1)
    : Math.max(col, size - col - 1)
  score += extendsOutward * 2

  // Bonus for intersecting with words that have few intersections
  // This helps balance the puzzle
  for (const ip of check.intersectionPoints) {
    for (const placed of placedWords) {
      if (placed.direction === 'across') {
        if (ip.row === placed.row && ip.col >= placed.col && ip.col < placed.col + placed.word.length) {
          score += (10 - placed.intersectionCount) * 20
          break
        }
      } else {
        if (ip.col === placed.col && ip.row >= placed.row && ip.row < placed.row + placed.word.length) {
          score += (10 - placed.intersectionCount) * 20
          break
        }
      }
    }
  }

  return score
}

// Place a word on the grid
function placeWord(grid, word, row, col, direction) {
  for (let i = 0; i < word.length; i++) {
    const r = direction === 'across' ? row : row + i
    const c = direction === 'across' ? col + i : col
    grid[r][c] = word[i]
  }
}

// Find all possible positions with their scores
function findAllPositions(grid, word, placedWords, size) {
  const positions = []

  if (placedWords.length === 0) {
    // First word - place in center
    const center = Math.floor(size / 2)
    const centerCol = Math.floor((size - word.length) / 2)
    positions.push({
      row: center,
      col: centerCol,
      direction: 'across',
      score: 10000
    })
    return positions
  }

  // Find intersection points with existing words
  for (const placed of placedWords) {
    for (let i = 0; i < word.length; i++) {
      for (let j = 0; j < placed.word.length; j++) {
        if (word[i] === placed.word[j]) {
          // Found matching letter
          const direction = placed.direction === 'across' ? 'down' : 'across'

          let row, col
          if (direction === 'across') {
            row = placed.row + j
            col = placed.col - i
          } else {
            row = placed.row - i
            col = placed.col + j
          }

          // Check bounds
          if (row < 0 || col < 0) continue
          if (direction === 'across' && col + word.length > size) continue
          if (direction === 'down' && row + word.length > size) continue

          const score = scorePlacement(grid, word, row, col, direction, placedWords, size)
          if (score > 0) {
            positions.push({
              row,
              col,
              direction,
              score
            })
          }
        }
      }
    }
  }

  // Sort by score (highest first)
  positions.sort((a, b) => b.score - a.score)

  return positions
}

// Count intersections for a word in the grid
function countWordIntersections(grid, word, row, col, direction) {
  let count = 0
  for (let i = 0; i < word.length; i++) {
    const r = direction === 'across' ? row : row + i
    const c = direction === 'across' ? col + i : col

    // Check perpendicular cells
    if (direction === 'across') {
      if ((r > 0 && grid[r - 1][c] !== null) || (r < grid.length - 1 && grid[r + 1][c] !== null)) {
        count++
      }
    } else {
      if ((c > 0 && grid[r][c - 1] !== null) || (c < grid[0].length - 1 && grid[r][c + 1] !== null)) {
        count++
      }
    }
  }
  return count
}

// Trim grid to remove empty rows/columns
function trimGrid(grid) {
  const size = grid.length

  let minRow = size, maxRow = 0, minCol = size, maxCol = 0

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== null) {
        minRow = Math.min(minRow, r)
        maxRow = Math.max(maxRow, r)
        minCol = Math.min(minCol, c)
        maxCol = Math.max(maxCol, c)
      }
    }
  }

  minRow = Math.max(0, minRow - 1)
  minCol = Math.max(0, minCol - 1)
  maxRow = Math.min(size - 1, maxRow + 1)
  maxCol = Math.min(size - 1, maxCol + 1)

  const rows = maxRow - minRow + 1
  const cols = maxCol - minCol + 1

  const trimmedGrid = Array(rows).fill(null).map(() =>
    Array(cols).fill(null)
  )

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      trimmedGrid[r - minRow][c - minCol] = grid[r][c]
    }
  }

  return { grid: trimmedGrid, offset: { row: minRow, col: minCol } }
}

// Main generation function with retry logic
function generateWithRetry(words, maxRetries = 10) {
  let bestResult = null
  let bestScore = -Infinity

  for (let retry = 0; retry < maxRetries; retry++) {
    const size = Math.max(30, words[0].length * 3)
    let grid = createEmptyGrid(size)
    const placedWords = []
    const unplacedWords = []
    let totalScore = 0

    // Shuffle word order (except keep longest first for stability)
    const wordList = [...words]
    if (retry > 0) {
      const first = wordList[0]
      const rest = wordList.slice(1)
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[rest[i], rest[j]] = [rest[j], rest[i]]
      }
      wordList[0] = first
      for (let i = 0; i < rest.length; i++) {
        wordList[i + 1] = rest[i]
      }
    }

    for (const word of wordList) {
      const positions = findAllPositions(grid, word, placedWords, size)

      if (positions.length > 0) {
        // Try top positions
        let placed = false
        const maxToTry = Math.min(3, positions.length)

        for (let i = 0; i < maxToTry; i++) {
          const pos = positions[i]

          // Create test grid
          const testGrid = grid.map(row => [...row])

          placeWord(testGrid, word, pos.row, pos.col, pos.direction)

          const testPlaced = [...placedWords, {
            word,
            row: pos.row,
            col: pos.col,
            direction: pos.direction
          }]

          // Check if this creates a better overall structure
          const density = calculateGridDensity(testGrid, pos.row, pos.col, word.length, pos.direction, size)

          if (density < 50) { // Only accept if density is reasonable
            grid = testGrid
            placedWords.push({
              word,
              row: pos.row,
              col: pos.col,
              direction: pos.direction,
              intersectionCount: countWordIntersections(testGrid, word, pos.row, pos.col, pos.direction)
            })
            totalScore += pos.score
            placed = true
            break
          }
        }

        if (!placed && positions.length > 0) {
          // Fallback to best position
          const pos = positions[0]
          placeWord(grid, word, pos.row, pos.col, pos.direction)
          placedWords.push({
            word,
            row: pos.row,
            col: pos.col,
            direction: pos.direction,
            intersectionCount: countWordIntersections(grid, word, pos.row, pos.col, pos.direction)
          })
          totalScore += pos.score
        }
      } else {
        unplacedWords.push(word)
      }
    }

    // Calculate final score
    const placementScore = (placedWords.length * 1000) - unplacedWords.length * 500
    const densityScore = -calculateGridDensity(grid, Math.floor(size/2), Math.floor(size/2), 1, 'across', size)
    const finalScore = totalScore + placementScore + densityScore

    if (finalScore > bestScore && placedWords.length >= Math.min(words.length, 10)) {
      bestScore = finalScore

      const { grid: trimmedGrid, offset } = trimGrid(grid)

      const wordPositions = placedWords.map(w => ({
        ...w,
        row: w.row - offset.row,
        col: w.col - offset.col
      }))

      bestResult = {
        grid: trimmedGrid,
        wordPositions: assignClueNumbers(trimmedGrid, wordPositions),
        gridSize: trimmedGrid.length,
        placedWords: placedWords.map(w => w.word),
        unplacedWords
      }

      // Perfect result - all words placed
      if (unplacedWords.length === 0) {
        break
      }
    }
  }

  return bestResult
}

// Assign clue numbers
function assignClueNumbers(grid, wordPositions) {
  const numberMap = new Map()
  let currentNumber = 1

  const sorted = [...wordPositions].sort((a, b) => a.row - b.row || a.col - b.col)

  for (const pos of sorted) {
    const key = `${pos.row},${pos.col}`
    if (!numberMap.has(key)) {
      numberMap.set(key, currentNumber++)
    }
    pos.number = numberMap.get(key)
  }

  return sorted
}

/**
 * Main function to generate a crossword puzzle
 */
export function generateCrossword(words) {
  if (!words || words.length === 0) {
    return { grid: [[]], wordPositions: [], gridSize: 0, placedWords: [] }
  }

  // Clean and deduplicate words
  const validWords = words
    .map(w => w.toUpperCase().trim().replace(/[^A-Z]/g, ''))
    .filter(w => w.length >= 2 && w.length <= 20)
    .filter((w, i, arr) => arr.indexOf(w) === i)

  if (validWords.length === 0) {
    return { grid: [[]], wordPositions: [], gridSize: 0, placedWords: [] }
  }

  // Sort by length (longest first) for better structure
  const sortedWords = [...validWords].sort((a, b) => b.length - a.length)

  // Limit to maximum 15 words for best results
  const wordsToUse = sortedWords.slice(0, 15)

  const result = generateWithRetry(wordsToUse, 15)

  if (!result) {
    return { grid: [[]], wordPositions: [], gridSize: 0, placedWords: [] }
  }

  return result
}

// Export other functions
export function validateAnswers(grid, userAnswers) {
  const result = {
    isComplete: true,
    isCorrect: true,
    correctCells: [],
    wrongCells: [],
    emptyCells: []
  }

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] !== null) {
        const userAnswer = userAnswers.find(a => a.row === r && a.col === c)

        if (!userAnswer || !userAnswer.letter) {
          result.emptyCells.push({ row: r, col: c })
          result.isComplete = false
        } else if (userAnswer.letter.toUpperCase() !== grid[r][c]) {
          result.wrongCells.push({ row: r, col: c })
          result.isCorrect = false
        } else {
          result.correctCells.push({ row: r, col: c })
        }
      }
    }
  }

  return result
}

export function getClueCells(clue, word) {
  const cells = []
  for (let i = 0; i < word.length; i++) {
    cells.push({
      row: clue.direction === 'across' ? clue.row : clue.row + i,
      col: clue.direction === 'across' ? clue.col + i : clue.col
    })
  }
  return cells
}

export function calculateProgress(grid, userAnswers) {
  let totalCells = 0
  let filledCells = 0

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] !== null) {
        totalCells++
        const answer = userAnswers.find(a => a.row === r && a.col === c)
        if (answer && answer.letter) {
          filledCells++
        }
      }
    }
  }

  return totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0
}
