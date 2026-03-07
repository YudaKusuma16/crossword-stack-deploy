import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lightbulb, CheckCircle, Trophy, Share2, Home, XCircle, Download } from 'lucide-react'
import { useCrosswordPlayer } from '@/hooks/useCrosswordPlayer'
import { useTimer } from '@/hooks/useTimer'
import { CrosswordGrid } from '@/components/player/CrosswordGrid'
import { ClueList } from '@/components/player/ClueList'
import { Timer } from '@/components/player/Timer'
import { ProgressBar } from '@/components/player/ProgressBar'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { mockGetPuzzle, submitScore } from '@/utils/api'
import { useToast } from '@/components/ui/use-toast'
import { getClueCells } from '@/utils/crosswordAlgorithm'
import { PdfExport } from '@/components/player/PdfExport'
import { generatePdf, getPdfFilename, getOrientation, configurePdfOptions } from '@/utils/pdfUtils'

export default function PlayerPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [puzzleData, setPuzzleData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [solvedClues, setSolvedClues] = useState(new Set())
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const pdfContentRef = useRef(null)

  // Track if puzzle has been loaded to prevent infinite loop
  const hasLoadedRef = useRef(false)

  const {
    time,
    formattedTime,
    isRunning: timerRunning,
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer
  } = useTimer()

  const {
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
    reset: resetPlayer,
    setActiveDirection,
    getCurrentClueCells,
    progress
  } = useCrosswordPlayer(puzzleData)

  // Load puzzle data
  useEffect(() => {
    const loadPuzzle = async () => {
      if (!id || hasLoadedRef.current) return

      hasLoadedRef.current = true

      try {
        const data = await mockGetPuzzle(id)
        setPuzzleData(data)
      } catch (error) {
        console.error('Load puzzle error:', error)
        toast({
          title: 'Error',
          description: 'Failed to load puzzle',
          variant: 'destructive'
        })
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    loadPuzzle()

    // Reset ref when id changes
    return () => {
      if (id) hasLoadedRef.current = false
    }
  }, [id])

  // Start timer immediately when puzzle is loaded
  useEffect(() => {
    if (puzzleData && !timerRunning && time === 0) {
      startTimer()
    }
  }, [puzzleData, timerRunning, time, startTimer])

  // Check for solved clues
  useEffect(() => {
    if (!puzzleData?.wordPositions || !userAnswers) return

    const newSolvedClues = new Set()

    puzzleData.wordPositions.forEach(position => {
      const cells = getClueCells(position, position.word)
      const isComplete = cells.every(cell =>
        userAnswers[`${cell.row},${cell.col}`]?.toUpperCase() === position.word[cells.indexOf(cell)]
      )

      if (isComplete) {
        newSolvedClues.add(`${position.word}-${position.direction}`)
      }
    })

    setSolvedClues(newSolvedClues)
  }, [puzzleData, userAnswers])

  // Submit score to backend when puzzle is completed
  const submitScoreToBackend = async () => {
    if (!puzzleData) return

    try {
      await submitScore(puzzleData.id, time, hintsUsed)
    } catch (error) {
      // Silently fail - score submission is not critical to user experience
      console.error('Failed to submit score:', error)
    }
  }

  // Show success modal on completion
  useEffect(() => {
    if (isComplete) {
      pauseTimer()
      submitScoreToBackend()
      setShowSuccessModal(true)
    }
  }, [isComplete, pauseTimer])

  // Handle validate
  const handleValidate = () => {
    const result = validate()

    if (result?.isCorrect && result?.isComplete) {
      setShowSuccessModal(true)
      pauseTimer()
    } else if (result) {
      // Show validation feedback for incorrect/incomplete answers
      setShowValidationModal(true)
    }
  }

  // Handle hint
  const handleHint = () => {
    const cell = useHint()

    if (cell?.limitReached) {
      toast({
        title: 'No Hints Remaining',
        description: 'You have used all 3 available hints',
        variant: 'destructive'
      })
      return
    }

    if (cell) {
      const hintsRemaining = 3 - hintsUsed - 1
      toast({
        title: 'Hint Used',
        description: `Revealed letter at row ${cell.row + 1}, column ${cell.col + 1}. ${hintsRemaining} hint${hintsRemaining === 1 ? '' : 's'} remaining.`,
      })
    } else {
      toast({
        title: 'No Hints Available',
        description: 'All cells are already filled',
        variant: 'destructive'
      })
    }
  }

  // Handle share
  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast({
      title: 'Link copied',
      description: 'Share link has been copied to clipboard'
    })
  }

  // Handle download PDF
  const handleDownloadPdf = async () => {
    if (!puzzleData || !pdfContentRef.current) return

    setIsGeneratingPdf(true)
    try {
      const filename = getPdfFilename(puzzleData.title)
      const orientation = getOrientation(puzzleData.gridSize)
      const options = configurePdfOptions(filename, orientation)

      const result = await generatePdf(pdfContentRef.current, filename, options)

      if (result.success) {
        toast({
          title: 'PDF Downloaded',
          description: 'Your crossword puzzle has been saved as PDF'
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('PDF generation error:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive'
      })
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // Handle new game
  const handleNewGame = () => {
    resetPlayer()
    resetTimer()
    setShowSuccessModal(false)
    setShowValidationModal(false)
    setSolvedClues(new Set())
  }

  // Get current clue cells
  const activeClueCells = useMemo(() => {
    if (!activeClue || !puzzleData?.wordPositions) return []

    const position = puzzleData.wordPositions.find(p =>
      p.row === activeClue.row && p.col === activeClue.col
    )

    if (!position) return []

    return getClueCells(position, position.word)
  }, [activeClue, puzzleData])

  // Calculate filled and total cells
  const { filledCount, totalCount } = useMemo(() => {
    if (!puzzleData?.grid) return { filledCount: 0, totalCount: 0 }

    let total = 0
    let filled = 0

    for (let r = 0; r < puzzleData.grid.length; r++) {
      for (let c = 0; c < puzzleData.grid[r].length; c++) {
        if (puzzleData.grid[r][c] !== null) {
          total++
          if (userAnswers[`${r},${c}`]) {
            filled++
          }
        }
      }
    }

    return { filledCount: filled, totalCount: total }
  }, [puzzleData, userAnswers])

  // Merge clues for display - use existing clues from puzzleData if available
  const displayClues = useMemo(() => {
    if (!puzzleData) return { across: [], down: [] }

    // If clues are already generated in puzzleData, use them directly
    if (puzzleData.clues && puzzleData.clues.across && puzzleData.clues.down) {
      return {
        across: puzzleData.clues.across.map(c => ({
          ...c,
          direction: 'across'
        })),
        down: puzzleData.clues.down.map(c => ({
          ...c,
          direction: 'down'
        }))
      }
    }

    // Fallback: generate clues from wordPositions (shouldn't happen normally)
    const cleanWord = (word) => word?.toUpperCase().trim().replace(/[^A-Z]/g, '') || ''

    const wordClueMap = new Map(
      puzzleData.words?.map(w => [cleanWord(w.word), w.clue]) || []
    )

    return {
      across: puzzleData.wordPositions
        ?.filter(p => p.direction === 'across')
        .map(p => ({
          number: p.number,
          clue: wordClueMap.get(p.word) || '',
          word: p.word,
          row: p.row,
          col: p.col,
          direction: 'across'
        })) || [],
      down: puzzleData.wordPositions
        ?.filter(p => p.direction === 'down')
        .map(p => ({
          number: p.number,
          clue: wordClueMap.get(p.word) || '',
          word: p.word,
          row: p.row,
          col: p.col,
          direction: 'down'
        })) || []
    }
  }, [puzzleData])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground mb-4">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-lg">Loading Puzzle...</span>
          </div>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    )
  }

  if (!puzzleData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Puzzle not found</p>
            <Link to="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link to="/">
              <Button variant="outline" size="icon" className="border-accent/20 hover:border-accent hover:text-accent shrink-0 h-9 w-9 sm:h-10 sm:w-10">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">{puzzleData.title}</h1>
              {puzzleData.description && (
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{puzzleData.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDownloadPdf}
              className="border-accent/20 hover:border-accent hover:text-accent h-9 w-9 sm:h-10 sm:w-10"
              disabled={isGeneratingPdf}
              title="Download as PDF"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleShare} className="border-accent/20 hover:border-accent hover:text-accent h-9 w-9 sm:h-10 sm:w-10">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Game Area */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4 min-w-0">
              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Timer
                  time={time}
                  formattedTime={formattedTime}
                  isRunning={timerRunning}
                />
                <ProgressBar
                  progress={progress()}
                  filledCount={filledCount}
                  totalCount={totalCount}
                />
              </div>

              {/* Crossword Grid */}
              <Card className="border-border/50">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center justify-between gap-2 text-base sm:text-lg">
                    <span className="truncate">Crossword Puzzle</span>
                    {hintsUsed >= 3 ? (
                      <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/30 text-[10px] sm:text-xs">
                        <Lightbulb className="h-3 w-3 mr-0.5 sm:mr-1" />
                        <span className="hidden xs:inline">No hints left</span>
                        <span className="xs:hidden">No hints</span>
                      </Badge>
                    ) : hintsUsed > 0 ? (
                      <Badge variant="accent" className="text-[10px] sm:text-xs">
                        <Lightbulb className="h-3 w-3 mr-0.5 sm:mr-1" />
                        <span className="hidden xs:inline">{3 - hintsUsed} hint{3 - hintsUsed === 1 ? '' : 's'} left</span>
                        <span className="xs:hidden">{3 - hintsUsed}</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-accent/20 text-muted-foreground text-[10px] sm:text-xs">
                        <Lightbulb className="h-3 w-3 mr-0.5 sm:mr-1" />
                        <span className="hidden xs:inline">3 hints</span>
                        <span className="xs:hidden">3</span>
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 sm:pt-6">
                  <div className="flex justify-center">
                    <CrosswordGrid
                      grid={puzzleData.grid}
                      wordPositions={puzzleData.wordPositions}
                      userAnswers={userAnswers}
                      activeCell={activeCell}
                      activeDirection={activeDirection}
                      activeClueCells={activeClueCells}
                      validationResult={validationResult}
                      onCellClick={handleCellClick}
                      onInput={handleInput}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2.5">
                <Button
                  variant="outline"
                  onClick={handleHint}
                  disabled={hintsUsed >= 3}
                  className="flex-1 min-w-[85px] xs:min-w-[100px] sm:min-w-[120px] text-[10px] xs:text-xs sm:text-sm h-8 xs:h-9 sm:h-10 border-accent/20 hover:border-accent hover:text-accent px-2 xs:px-3 sm:px-4"
                  title="Use Hint"
                >
                  <Lightbulb className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden xs:inline">Hint</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveDirection(activeDirection === 'across' ? 'down' : 'across')}
                  className="flex-1 min-w-[85px] xs:min-w-[100px] sm:min-w-[120px] text-[10px] xs:text-xs sm:text-sm h-8 xs:h-9 sm:h-10 border-accent/20 hover:border-accent hover:text-accent px-2 xs:px-3 sm:px-4"
                  title="Toggle Direction"
                >
                  {activeDirection === 'across' ? '→' : '↓'}
                  <span className="hidden sm:inline ml-1">Toggle</span>
                </Button>
                <Button
                  onClick={handleValidate}
                  className="flex-1 min-w-[85px] xs:min-w-[100px] sm:min-w-[120px] text-[10px] xs:text-xs sm:text-sm h-8 xs:h-9 sm:h-10 px-2 xs:px-3 sm:px-4"
                  disabled={filledCount === 0}
                  title="Check Answers"
                >
                  <span>Check</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNewGame}
                  className="flex-1 min-w-[60px] xs:min-w-[80px] sm:min-w-[120px] text-[10px] xs:text-xs sm:text-sm h-8 xs:h-9 sm:h-10 border-accent/20 hover:border-accent hover:text-accent px-2 xs:px-3 sm:px-4"
                  title="Reset Puzzle"
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Clues Sidebar */}
            <div className="lg:col-span-1 min-w-0 order-first lg:order-last">
              <Card className="border-border/50 sticky top-20 sm:top-24">
                <CardHeader className="pb-2 xs:pb-3 px-3 xs:px-6">
                  <CardTitle className="text-sm xs:text-base sm:text-lg">Clues</CardTitle>
                </CardHeader>
                <CardContent className="px-3 xs:px-6">
                  <div className="space-y-3 xs:space-y-4 sm:space-y-6">
                    {/* Across Clues */}
                    <div>
                      <h4 className="font-semibold text-xs xs:text-sm mb-2 xs:mb-3 flex items-center gap-1.5 xs:gap-2 text-yellow-400">
                        Across
                      </h4>
                      <div className="space-y-1 xs:space-y-1.5 sm:space-y-2 max-h-[20vh] xs:max-h-[25vh] sm:max-h-[40vh] overflow-y-auto pr-1 xs:pr-2 custom-scrollbar">
                        {displayClues.across.map((clue) => (
                          <div
                            key={`${clue.number}-across-${clue.word}`}
                            className={`flex gap-1 xs:gap-1.5 sm:gap-2 p-1.5 xs:p-2 rounded-lg cursor-pointer transition-all text-[10px] xs:text-xs sm:text-sm ${activeClue?.number === clue.number && activeDirection === 'across'
                              ? "bg-accent/20 border border-accent/40 shadow-sm"
                              : "hover:bg-muted/50 border border-transparent"
                              } ${solvedClues.has(`${clue.word}-across`) ? "opacity-50" : ""}`}
                            onClick={() => handleClueClick(clue)}
                          >
                            <Badge variant={activeClue?.number === clue.number && activeDirection === 'across' ? "default" : "outline"} className="shrink-0 text-[9px] xs:text-[10px] sm:text-xs px-1.5 py-0">
                              {clue.number}
                            </Badge>
                            <span className="flex-1 break-words leading-tight">{clue.clue}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Down Clues */}
                    <div>
                      <h4 className="font-semibold text-xs xs:text-sm mb-2 xs:mb-3 flex items-center gap-1.5 xs:gap-2 text-yellow-400">
                        Down
                      </h4>
                      <div className="space-y-1 xs:space-y-1.5 sm:space-y-2 max-h-[20vh] xs:max-h-[25vh] sm:max-h-[40vh] overflow-y-auto pr-1 xs:pr-2 custom-scrollbar">
                        {displayClues.down.map((clue) => (
                          <div
                            key={`${clue.number}-down-${clue.word}`}
                            className={`flex gap-1 xs:gap-1.5 sm:gap-2 p-1.5 xs:p-2 rounded-lg cursor-pointer transition-all text-[10px] xs:text-xs sm:text-sm ${activeClue?.number === clue.number && activeDirection === 'down'
                              ? "bg-accent/20 border border-accent/40 shadow-sm"
                              : "hover:bg-muted/50 border border-transparent"
                              } ${solvedClues.has(`${clue.word}-down`) ? "opacity-50" : ""}`}
                            onClick={() => handleClueClick(clue)}
                          >
                            <Badge variant={activeClue?.number === clue.number && activeDirection === 'down' ? "default" : "outline"} className="shrink-0 text-[9px] xs:text-[10px] sm:text-xs px-1.5 py-0">
                              {clue.number}
                            </Badge>
                            <span className="flex-1 break-words leading-tight">{clue.clue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="sm:max-w-md border-accent/20">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="bg-accent/10 p-2 rounded-full">
                  <Trophy className="h-6 w-6 text-accent" />
                </div>
                Congratulations!
              </DialogTitle>
              <DialogDescription>
                You've completed the crossword puzzle "{puzzleData.title}"!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-xl border border-border">
                  <div className="text-2xl font-bold text-accent">{formattedTime}</div>
                  <div className="text-sm text-muted-foreground">Time</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-xl border border-border">
                  <div className="text-2xl font-bold text-accent">{hintsUsed}</div>
                  <div className="text-sm text-muted-foreground">Hints Used</div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleNewGame} className="flex-1 border-accent/20 hover:border-accent hover:text-accent">
                Play Again
              </Button>
              <Link to="/" className="flex-1">
                <Button className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Validation Result Modal */}
        <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
          <DialogContent className="sm:max-w-md border-destructive/20">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="bg-destructive/10 p-2 rounded-full">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                Not Quite There Yet!
              </DialogTitle>
              <DialogDescription>
                {validationResult?.isComplete ? "You've filled all the cells, but some answers are incorrect." : "Keep going! You still have empty cells to fill."}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        {/* Hidden PDF content for export */}
        <div className="hidden">
          <div ref={pdfContentRef}>
            <PdfExport
              puzzleData={puzzleData}
              userAnswers={userAnswers}
            />
          </div>
        </div>
      </div>
      )
}

