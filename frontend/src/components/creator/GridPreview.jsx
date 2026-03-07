import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Badge from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'

export function GridPreview({ puzzleData }) {
  if (!puzzleData || !puzzleData.grid) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Generate a puzzle to see the preview</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { grid, wordPositions, clues, unplacedWords, placedWords } = puzzleData
  const gridRows = grid.length
  const gridCols = grid[0]?.length || 0
  const placedCount = wordPositions?.length || 0
  const totalWords = placedWords?.length || 0
  const maxDimension = Math.max(gridRows, gridCols)

  // Calculate dynamic cell size based on grid dimensions (smaller for larger grids)
  const cellSize = useMemo(() => {
    if (maxDimension <= 8) return 36
    if (maxDimension <= 12) return 32
    if (maxDimension <= 15) return 28
    if (maxDimension <= 20) return 24
    return 20
  }, [maxDimension])

  const fontSize = useMemo(() => {
    if (maxDimension <= 8) return 'text-sm'
    if (maxDimension <= 12) return 'text-xs'
    if (maxDimension <= 15) return 'text-[11px]'
    return 'text-[10px]'
  }, [maxDimension])

  const numberSize = useMemo(() => {
    if (maxDimension <= 8) return 'text-[10px]'
    if (maxDimension <= 12) return 'text-[9px]'
    return 'text-[8px]'
  }, [maxDimension])

  // Create a cell number map
  const cellNumbers = {}
  wordPositions?.forEach(pos => {
    const key = `${pos.row},${pos.col}`
    if (!cellNumbers[key]) {
      cellNumbers[key] = pos.number
    }
  })

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {placedCount} of {totalWords} words placed
          </span>
          {placedCount < totalWords && (
            <span className="text-destructive font-medium">
              {totalWords - placedCount} word{(totalWords - placedCount) > 1 ? 's' : ''} couldn't be placed
            </span>
          )}
        </div>

        {/* Unplaced words warning */}
        {unplacedWords && unplacedWords.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Words not placed:</p>
                <p className="text-xs text-destructive/80 mt-1">
                  These words couldn't fit in the grid: {unplacedWords.join(', ')}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Try using different words or shorter words with common letters.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Grid Preview - with improved overflow handling */}
        <div className="flex justify-center overflow-auto p-4 bg-muted/30 rounded-lg custom-scrollbar">
          <div
            className="grid gap-0 border-2 border-foreground shadow-lg bg-background"
            style={{
              gridTemplateColumns: `repeat(${gridCols}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${gridRows}, ${cellSize}px)`,
            }}
          >
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const key = `${rowIndex},${colIndex}`
                const cellNumber = cellNumbers[key]

                return cell === null ? (
                  <div
                    key={key}
                    style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                    className="bg-muted border border-border/50"
                  />
                ) : (
                  <div
                    key={key}
                    style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                    className="border border-border bg-accent flex items-center justify-center relative shadow-sm"
                  >
                    {cellNumber && (
                      <span className={`absolute top-0 left-0.5 ${numberSize} text-accent-foreground/70 font-medium leading-tight`}>
                        {cellNumber}
                      </span>
                    )}
                    <span className={`${fontSize} font-bold text-accent-foreground`}>
                      {cell}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Clues List - with improved layout and unique keys */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          <div>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              Across ({clues?.across?.length || 0})
            </h4>
            <div className="space-y-2 text-sm">
              {clues?.across?.map((clue) => (
                <div
                  key={`${clue.number}-across-${clue.word}`}
                  className="flex gap-2 items-start p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <Badge variant="accent" className="shrink-0">
                    {clue.number}
                  </Badge>
                  <span className="flex-1 break-words">
                    {clue.clue || <span className="text-muted-foreground italic">No clue provided</span>}
                  </span>
                  <span className="text-muted-foreground text-xs shrink-0">({clue.word?.length || 0} letters)</span>
                </div>
              ))}
              {(!clues?.across || clues.across.length === 0) && (
                <p className="text-muted-foreground text-sm italic">No across clues</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              Down ({clues?.down?.length || 0})
            </h4>
            <div className="space-y-2 text-sm">
              {clues?.down?.map((clue) => (
                <div
                  key={`${clue.number}-down-${clue.word}`}
                  className="flex gap-2 items-start p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <Badge variant="accent" className="shrink-0">
                    {clue.number}
                  </Badge>
                  <span className="flex-1 break-words">
                    {clue.clue || <span className="text-muted-foreground italic">No clue provided</span>}
                  </span>
                  <span className="text-muted-foreground text-xs shrink-0">({clue.word?.length || 0} letters)</span>
                </div>
              ))}
              {(!clues?.down || clues.down.length === 0) && (
                <p className="text-muted-foreground text-sm italic">No down clues</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
