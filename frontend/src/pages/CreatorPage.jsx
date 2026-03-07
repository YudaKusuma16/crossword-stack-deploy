import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PlusCircle, Save, ArrowRight, Sparkles } from 'lucide-react'
import { useCrosswordGenerator } from '@/hooks/useCrosswordGenerator'
import { WordInputForm } from '@/components/creator/WordInputForm'
import { GridPreview } from '@/components/creator/GridPreview'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Textarea from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Badge from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { mockGetPuzzle } from '@/utils/api'

export default function CreatorPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const { toast } = useToast()

  const {
    words,
    setWords,
    updateWord,
    addWord,
    removeWord,
    generate,
    save,
    reset,
    isGenerating,
    isSaving,
    generatedPuzzle,
    setGeneratedPuzzle,
    error,
    isValid
  } = useCrosswordGenerator()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [savedPuzzle, setSavedPuzzle] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  // Track if puzzle has been loaded to prevent infinite loop
  const hasLoadedRef = useRef(false)

  // Load puzzle data when in edit mode
  useEffect(() => {
    const loadPuzzle = async () => {
      if (!editId || hasLoadedRef.current) return

      hasLoadedRef.current = true
      setIsLoading(true)
      setIsEditMode(true)

      try {
        const data = await mockGetPuzzle(editId)

        // Set title and description
        setTitle(data.title || '')
        setDescription(data.description || '')

        // Set words with clues
        if (data.words && Array.isArray(data.words)) {
          setWords(data.words)
        }

        // Generate preview if grid exists
        if (data.grid && data.wordPositions) {
          setGeneratedPuzzle({
            grid: data.grid,
            wordPositions: data.wordPositions,
            clues: data.clues,
            words: data.words,
            gridSize: data.gridSize || data.grid.length
          })
        } else {
          // Auto-generate if no grid
          const { generateCrossword } = await import('@/utils/crosswordAlgorithm.js')
          const result = generateCrossword(data.words.map(w => w.word))

          setGeneratedPuzzle({
            grid: result.grid,
            wordPositions: result.wordPositions,
            words: data.words,
            gridSize: result.gridSize
          })
        }

        toast({
          title: 'Puzzle Loaded',
          description: 'You can now edit your puzzle',
        })
      } catch (error) {
        console.error('Load puzzle error:', error)
        toast({
          title: 'Error',
          description: 'Failed to load puzzle',
          variant: 'destructive'
        })
        navigate('/my-puzzles')
      } finally {
        setIsLoading(false)
      }
    }

    loadPuzzle()
    // Reset ref when editId changes
    return () => {
      if (editId) hasLoadedRef.current = false
    }
  }, [editId])

  const handleGenerate = async () => {
    const result = await generate()
    if (result) {
      toast({
        title: 'Puzzle Generated!',
        description: `Successfully placed ${result.wordPositions.length} words`,
      })
    }
  }

  const handleSave = async () => {
    if (!generatedPuzzle) {
      toast({
        title: 'No Puzzle',
        description: 'Please generate a puzzle first',
        variant: 'destructive'
      })
      return
    }

    if (!title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a title for your puzzle',
        variant: 'destructive'
      })
      return
    }

    const puzzleData = {
      title: title.trim(),
      description: description.trim(),
      ...generatedPuzzle,
      status: 'published'
    }

    const result = await save(puzzleData, isEditMode ? editId : null)

    if (result) {
      setSavedPuzzle(result)
      setShowSaveDialog(true)
      toast({
        title: isEditMode ? 'Puzzle Updated!' : 'Puzzle Saved!',
        description: isEditMode
          ? 'Your puzzle has been updated successfully'
          : 'Your puzzle has been saved successfully',
      })
    }
  }

  const handlePlayNow = () => {
    if (savedPuzzle) {
      navigate(`/play/${savedPuzzle.id}`)
    } else if (isEditMode && editId) {
      navigate(`/play/${editId}`)
    }
  }

  const handleCreateNew = () => {
    reset()
    setTitle('')
    setDescription('')
    setSavedPuzzle(null)
    setIsEditMode(false)
    navigate('/creator')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground mb-4">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-lg">Loading Puzzle...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">
                {isEditMode ? 'Edit Puzzle' : 'Crossword Creator'}
              </h1>
            </div>
            {isEditMode && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/my-puzzles')}>
                Back to My Puzzles
              </Button>
            )}
          </div>
          <p className="text-muted-foreground">
            {isEditMode
              ? 'Edit your crossword puzzle words and clues'
              : 'Create your own crossword puzzle with words and clues'
            }
          </p>
        </div>

        {savedPuzzle ? (
          <Card className="max-w-2xl mx-auto border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-green-500/10 p-2 rounded-full">
                  <PlusCircle className="h-5 w-5 text-green-500" />
                </div>
                {isEditMode ? 'Puzzle Updated Successfully!' : 'Puzzle Created Successfully!'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Published</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(savedPuzzle.createdAt || Date.now()).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold">{savedPuzzle.title}</h3>
                {savedPuzzle.description && (
                  <p className="text-muted-foreground">{savedPuzzle.description}</p>
                )}
                <div className="text-sm text-muted-foreground">
                  {savedPuzzle.wordPositions?.length || savedPuzzle.words?.length || 0} words placed
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handlePlayNow} className="flex-1">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Play Now
                </Button>
                <Button onClick={handleCreateNew} variant="outline" className="flex-1">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Puzzle
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <WordInputForm
                words={words}
                updateWord={updateWord}
                addWord={addWord}
                removeWord={removeWord}
                generate={handleGenerate}
                isGenerating={isGenerating}
                error={error}
                isValid={isValid}
              />

              {generatedPuzzle && (
                <Card>
                  <CardHeader>
                    <CardTitle>Puzzle Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter puzzle title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter puzzle description (optional)"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving || !generatedPuzzle}
                        className="flex-1"
                      >
                        {isSaving ? (
                          'Saving...'
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            {isEditMode ? 'Update Puzzle' : 'Save Puzzle'}
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleCreateNew}
                        variant="outline"
                      >
                        Start Over
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <GridPreview puzzleData={generatedPuzzle} />
            </div>
          </div>
        )}
      </div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Puzzle Updated!' : 'Puzzle Saved!'}
            </DialogTitle>
            <DialogDescription>
              Your crossword puzzle "{savedPuzzle?.title}" has been {isEditMode ? 'updated' : 'created'} successfully.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Close
            </Button>
            <Button onClick={handlePlayNow}>
              Play Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
