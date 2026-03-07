import React from 'react'
import { Download } from 'lucide-react'

export function PdfExport({ puzzleData, userAnswers = {} }) {
  if (!puzzleData || !puzzleData.grid) return null

  const { grid, wordPositions, clues, title, description } = puzzleData
  const gridRows = grid.length
  const gridCols = grid[0]?.length || 0

  // Get author name from puzzle data (check multiple possible field names)
  const authorName = puzzleData.authorName || puzzleData.author || puzzleData.createdBy || puzzleData.creator || puzzleData.user?.username || puzzleData.user?.name || 'Unknown'

  // Create cell number map
  const cellNumbers = {}
  wordPositions?.forEach(pos => {
    const key = `${pos.row},${pos.col}`
    if (!cellNumbers[key]) {
      cellNumbers[key] = pos.number
    }
  })

  // Calculate dynamic cell size for PDF portrait - larger to fill the page
  // A4 portrait width is ~210mm, with margins we have ~190mm usable
  const availableWidth = 520 // px equivalent (increased for larger cells)
  const cellSize = Math.max(28, Math.min(42, Math.floor(availableWidth / gridCols)))

  // Calculate font sizes based on cell size for proportionality
  const numberFontSize = Math.max(10, Math.floor(cellSize * 0.35))
  const letterFontSize = Math.max(14, Math.floor(cellSize * 0.55))

  return (
    <div className="pdf-content bg-white text-black p-4" style={{ width: '210mm' }}>
      {/* Header */}
      <div className="text-center mb-5 border-b-2 border-black pb-3">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="text-base font-bold text-gray-800 tracking-wide">Crossword Stack</h2>
        </div>
        <h1 className="text-xl font-bold mb-2">{title}</h1>
        {description && (
          <p className="text-sm text-gray-700 mb-1">{description}</p>
        )}
        <p className="text-sm text-gray-600">
          Created by <span className="font-semibold">{authorName}</span> • {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Grid Container */}
      <div className="flex justify-center mb-5">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${gridRows}, ${cellSize}px)`,
            gap: '0',
            boxSizing: 'border-box'
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const key = `${rowIndex},${colIndex}`
              const cellNumber = cellNumbers[key]

              // Black cells: invisible but takes up space to maintain grid structure
              if (cell === null) {
                return (
                  <div
                    key={key}
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      boxSizing: 'border-box',
                      backgroundColor: 'transparent',
                      border: 'none'
                    }}
                  />
                )
              }

              // White cells: visible with border
              return (
                <div
                  key={key}
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    boxSizing: 'border-box',
                    position: 'relative',
                    border: '1px solid black',
                    backgroundColor: 'white'
                  }}
                  className="flex items-center justify-center"
                >
                  {cellNumber && (
                    <span
                      style={{
                        fontSize: `${numberFontSize}px`,
                        lineHeight: '1',
                        position: 'absolute',
                        top: '1px',
                        left: '2px',
                        fontWeight: 'bold'
                      }}
                      className="text-gray-800"
                    >
                      {cellNumber}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: `${letterFontSize}px`,
                      lineHeight: '1',
                      fontWeight: 'bold',
                      color: '#000',
                      textTransform: 'uppercase'
                    }}
                  >
                    {userAnswers[key] || ''}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Clues - Two Columns Compact */}
      <div className="grid grid-cols-2 gap-4" style={{ pageBreakInside: 'avoid' }}>
        {/* Across */}
        <div>
          <h3 className="font-bold mb-3 border-b-2 border-gray-400 pb-1" style={{ fontSize: '14px' }}>
            ACROSS
          </h3>
          <div className="space-y-2" style={{ fontSize: '11px', lineHeight: '1.4' }}>
            {clues?.across?.map((clue) => (
              <div key={`${clue.number}-across-${clue.word}`} className="flex gap-2" style={{ alignItems: 'flex-start' }}>
                <span className="font-bold shrink-0" style={{ minWidth: '22px' }}>{clue.number}.</span>
                <span style={{ flex: 1 }}>{clue.clue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Down */}
        <div>
          <h3 className="font-bold mb-3 border-b-2 border-gray-400 pb-1" style={{ fontSize: '14px' }}>
            DOWN
          </h3>
          <div className="space-y-2" style={{ fontSize: '11px', lineHeight: '1.4' }}>
            {clues?.down?.map((clue) => (
              <div key={`${clue.number}-down-${clue.word}`} className="flex gap-2" style={{ alignItems: 'flex-start' }}>
                <span className="font-bold shrink-0" style={{ minWidth: '22px' }}>{clue.number}.</span>
                <span style={{ flex: 1 }}>{clue.clue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
