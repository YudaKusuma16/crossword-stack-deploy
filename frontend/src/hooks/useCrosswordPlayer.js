import { useState, useCallback, useEffect } from 'react'
import {
  validateAnswers,
  getClueCells,
  calculateProgress
} from '@/utils/crosswordAlgorithm'

export function useCrosswordPlayer(puzzleData) {
  const [userAnswers, setUserAnswers] = useState({})
  const [activeCell, setActiveCell] = useState(null)
  const [activeDirection, setActiveDirection] = useState('across')
  const [activeClue, setActiveClue] = useState(null)
  const [validationResult, setValidationResult] = useState(null)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const { grid, wordPositions, clues } = puzzleData || {}

  // Get cell key
  const getCellKey = useCallback((row, col) => `${row},${col}`, [])

  // Handle cell click
  const handleCellClick = useCallback((row, col) => {
    setActiveCell({ row, col })

    // If clicking the same cell, toggle direction
    if (activeCell?.row === row && activeCell?.col === col) {
      setActiveDirection(prev => prev === 'across' ? 'down' : 'across')
    }

    // Find the clue for this cell
    if (wordPositions) {
      const clue = wordPositions.find(p => {
        if (p.direction === activeDirection) {
          return p.row === row && col >= p.col && col < p.col + p.word.length
        } else {
          return p.col === col && row >= p.row && row < p.row + p.word.length
        }
      })

      if (clue) {
        setActiveClue(clue)
      }
    }
  }, [activeCell, activeDirection, wordPositions])

  // Handle input
  const handleInput = useCallback((row, col, letter) => {
    if (!letter || letter.length === 0) {
      setUserAnswers(prev => {
        const newAnswers = { ...prev }
        delete newAnswers[getCellKey(row, col)]
        return newAnswers
      })
      return
    }

    const upperLetter = letter.toUpperCase().slice(-1)
    setUserAnswers(prev => ({
      ...prev,
      [getCellKey(row, col)]: upperLetter
    }))

    // Move to next cell
    let nextRow = row
    let nextCol = col

    if (activeDirection === 'across') {
      nextCol++
    } else {
      nextRow++
    }

    // Check if next cell is valid
    if (grid && grid[nextRow]?.[nextCol] !== null) {
      setActiveCell({ row: nextRow, col: nextCol })
    }
  }, [grid, activeDirection, getCellKey])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event, row, col) => {
    let newRow = row
    let newCol = col

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        newRow = Math.max(0, row - 1)
        break
      case 'ArrowDown':
        event.preventDefault()
        newRow = Math.min((grid?.length || 1) - 1, row + 1)
        break
      case 'ArrowLeft':
        event.preventDefault()
        newCol = Math.max(0, col - 1)
        break
      case 'ArrowRight':
        event.preventDefault()
        newCol = Math.min((grid?.[0]?.length || 1) - 1, col + 1)
        break
      case 'Tab':
        event.preventDefault()
        setActiveDirection(prev => prev === 'across' ? 'down' : 'across')
        return
      case 'Backspace':
        if (!userAnswers[getCellKey(row, col)]) {
          // Move back and delete
          if (activeDirection === 'across') {
            newCol = Math.max(0, col - 1)
          } else {
            newRow = Math.max(0, row - 1)
          }
          setActiveCell({ row: newRow, col: newCol })
          setUserAnswers(prev => {
            const newAnswers = { ...prev }
            delete newAnswers[getCellKey(newRow, newCol)]
            return newAnswers
          })
          event.preventDefault()
          return
        }
        break
      default:
        return
    }

    // Navigate only to valid cells
    if (grid && grid[newRow]?.[newCol] !== null) {
      setActiveCell({ row: newRow, col: newCol })
    }
  }, [grid, activeDirection, userAnswers, getCellKey])

  // Handle clue click
  const handleClueClick = useCallback((clue) => {
    setActiveDirection(clue.direction || 'across')
    setActiveCell({ row: clue.row, col: clue.col })
    setActiveClue(clue)
  }, [])

  // Validate answers
  const validate = useCallback(() => {
    if (!grid) return null

    console.log('=== userAnswers object ===')
    console.log('userAnswers:', userAnswers)
    console.log('keys:', Object.keys(userAnswers))
    console.log('==========================')

    const answersArray = Object.entries(userAnswers).map(([key, letter]) => {
      const [row, col] = key.split(',').map(Number)
      return { row, col, letter }
    })

    console.log('=== answersArray after conversion ===')
    console.log('answersArray:', answersArray)
    console.log('====================================')

    const result = validateAnswers(grid, answersArray)
    setValidationResult(result)

    if (result.isCorrect && result.isComplete) {
      setIsComplete(true)
    }

    return result
  }, [grid, userAnswers])

  // Use hint
  const useHint = useCallback(() => {
    if (!grid || !wordPositions) return null

    // Check hint limit
    if (hintsUsed >= 3) {
      return { limitReached: true }
    }

    // Find empty cells
    const emptyCells = []
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] !== null && !userAnswers[getCellKey(r, c)]) {
          emptyCells.push({ row: r, col: c, letter: grid[r][c] })
        }
      }
    }

    if (emptyCells.length === 0) return null

    // Pick random empty cell
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    setUserAnswers(prev => ({
      ...prev,
      [getCellKey(randomCell.row, randomCell.col)]: randomCell.letter
    }))
    setHintsUsed(prev => prev + 1)

    return randomCell
  }, [grid, wordPositions, userAnswers, getCellKey, hintsUsed])

  // Reset puzzle
  const reset = useCallback(() => {
    setUserAnswers({})
    setActiveCell(null)
    setActiveClue(null)
    setValidationResult(null)
    setHintsUsed(0)
    setIsComplete(false)
  }, [])

  // Get cells for current clue
  const getCurrentClueCells = useCallback(() => {
    if (!activeClue || !wordPositions) return []

    const position = wordPositions.find(p =>
      p.row === activeClue.row && p.col === activeClue.col
    )

    if (!position) return []

    return getClueCells(position, position.word)
  }, [activeClue, wordPositions])

  // Calculate progress
  const progress = useCallback(() => {
    if (!grid) return 0
    const answersArray = Object.entries(userAnswers).map(([key, letter]) => {
      const [row, col] = key.split(',').map(Number)
      return { row, col, letter }
    })
    return calculateProgress(grid, answersArray)
  }, [grid, userAnswers])

  // Check if current word is complete
  const isCurrentWordComplete = useCallback(() => {
    const cells = getCurrentClueCells()
    if (cells.length === 0) return false

    return cells.every(cell => userAnswers[getCellKey(cell.row, cell.col)])
  }, [getCurrentClueCells, userAnswers, getCellKey])

  return {
    userAnswers,
    activeCell,
    activeDirection,
    activeClue,
    validationResult,
    hintsUsed,
    isComplete,
    handleCellClick,
    handleInput,
    handleKeyDown,
    handleClueClick,
    validate,
    useHint,
    reset,
    setActiveDirection,
    getCurrentClueCells,
    progress,
    isCurrentWordComplete
  }
}
