import { useEffect, useRef, useMemo } from 'react'
import { cn } from '@/utils/cn'

export function CrosswordGrid({
  grid,
  wordPositions,
  userAnswers,
  activeCell,
  activeDirection,
  activeClueCells,
  validationResult,
  onCellClick,
  onInput,
  onKeyDown
}) {
  const gridRef = useRef(null)

  // Calculate dynamic cell size based on grid dimensions
  const cellSize = useMemo(() => {
    const gridRows = grid?.length || 0
    const gridCols = grid[0]?.length || 0
    const maxDimension = Math.max(gridRows, gridCols)

    // Scale down cell size for larger grids - mobile responsive
    if (maxDimension <= 8) return { base: 'w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12', num: 'text-base sm:text-lg md:text-xl', number: 'text-[10px] sm:text-xs' }
    if (maxDimension <= 12) return { base: 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10', num: 'text-sm sm:text-base md:text-lg', number: 'text-[9px] sm:text-[10px] md:text-xs' }
    if (maxDimension <= 15) return { base: 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:w-9 lg:w-10 lg:h-10', num: 'text-sm sm:text-base md:text-lg', number: 'text-[8px] sm:text-[9px] md:text-[10px]' }
    if (maxDimension <= 20) return { base: 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9', num: 'text-xs sm:text-sm md:text-base', number: 'text-[8px] sm:text-[9px]' }
    return { base: 'w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8', num: 'text-xs sm:text-sm', number: 'text-[7px] sm:text-[8px]' }
  }, [grid])

  // Create a cell number map
  const cellNumbers = {}
  wordPositions?.forEach(pos => {
    const key = `${pos.row},${pos.col}`
    if (!cellNumbers[key]) {
      cellNumbers[key] = pos.number
    }
  })

  // Get cell state
  const getCellState = (row, col) => {
    const key = `${row},${col}`

    // Check if active
    if (activeCell?.row === row && activeCell?.col === col) {
      return 'active'
    }

    // Check if in active clue
    if (activeClueCells?.some(c => c.row === row && c.col === col)) {
      return 'highlighted'
    }

    // Check validation result
    if (validationResult) {
      if (validationResult.correctCells?.some(c => c.row === row && c.col === col)) {
        return 'correct'
      }
      if (validationResult.wrongCells?.some(c => c.row === row && c.col === col)) {
        return 'wrong'
      }
    }

    return 'default'
  }

  const getCellClass = (row, col) => {
    const state = getCellState(row, col)
    const baseClass = `${cellSize.base} border-2 flex items-center justify-center ${cellSize.num} font-bold uppercase select-none cursor-pointer transition-all duration-200 shadow-sm`

    const stateClasses = {
      active: 'bg-cell-active border-cell-active text-cell-active-text shadow-md scale-105',
      highlighted: 'bg-cell-highlighted border-accent/50',
      correct: 'bg-cell-correct border-cell-correct text-white',
      wrong: 'bg-cell-wrong border-cell-wrong text-white',
      default: 'bg-cell border-border hover:border-accent/50 hover:shadow-md'
    }

    return cn(baseClass, stateClasses[state])
  }

  const handleCellInput = (e, row, col) => {
    e.preventDefault()
    const letter = e.data
    if (letter && /^[a-zA-Z]$/.test(letter)) {
      onInput(row, col, letter.toUpperCase())
    }
  }

  // Handle keyboard for active cell
  useEffect(() => {
    if (!activeCell || !gridRef.current) return

    const handleKeyDown = (e) => {
      onKeyDown(e, activeCell.row, activeCell.col)
    }

    const handleKeyPress = (e) => {
      if (activeCell && /^[a-zA-Z]$/.test(e.key)) {
        onInput(activeCell.row, activeCell.col, e.key.toUpperCase())
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keypress', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keypress', handleKeyPress)
    }
  }, [activeCell, onInput, onKeyDown])

  if (!grid) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading puzzle...
      </div>
    )
  }

  const gridRows = grid.length
  const gridCols = grid[0]?.length || 0
  const maxDimension = Math.max(gridRows, gridCols)

  return (
    <div className="flex justify-center overflow-auto p-4">
      <div
        ref={gridRef}
        className="grid gap-0 border-4 border-foreground shadow-xl rounded-lg overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`,
          maxWidth: maxDimension > 15 ? '100%' : 'fit-content',
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const key = `${rowIndex},${colIndex}`
            const cellNumber = cellNumbers[key]

            return cell === null ? (
              <div
                key={key}
                className={`${cellSize.base} bg-background border border-border`}
              />
            ) : (
              <div
                key={key}
                className={getCellClass(rowIndex, colIndex)}
                onClick={() => onCellClick(rowIndex, colIndex)}
                onBeforeInput={(e) => handleCellInput(e, rowIndex, colIndex)}
                tabIndex={0}
                role="gridcell"
                aria-label={`Cell ${rowIndex + 1}, ${colIndex + 1}`}
              >
                <div className="relative w-full h-full">
                  {cellNumber && (
                    <span className={`absolute top-0 left-1 ${cellSize.number} text-muted-foreground font-medium leading-tight`}>
                      {cellNumber}
                    </span>
                  )}
                  {userAnswers[key] && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      {userAnswers[key]}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
