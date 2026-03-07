import { useState, useCallback } from 'react'
import { mockGeneratePuzzle, mockSavePuzzle } from '@/utils/api'

export function useCrosswordGenerator() {
  const [words, setWords] = useState([
    { word: '', clue: '' },
    { word: '', clue: '' },
    { word: '', clue: '' },
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedPuzzle, setGeneratedPuzzle] = useState(null)
  const [error, setError] = useState(null)

  // Update a specific word/clue pair
  const updateWord = useCallback((index, field, value) => {
    setWords(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ))
  }, [])

  // Add a new word/clue pair
  const addWord = useCallback(() => {
    if (words.length >= 20) {
      setError('Maximum 20 words allowed')
      return
    }
    setWords(prev => [...prev, { word: '', clue: '' }])
    setError(null)
  }, [words.length])

  // Remove a word/clue pair
  const removeWord = useCallback((index) => {
    if (words.length <= 3) {
      setError('Minimum 3 words required')
      return
    }
    setWords(prev => prev.filter((_, i) => i !== index))
    setError(null)
  }, [words.length])

  // Generate the crossword puzzle
  const generate = useCallback(async () => {
    // Validation
    const validWords = words.filter(w => w.word.trim().length >= 2)

    if (validWords.length < 3) {
      setError('At least 3 words with minimum 2 characters are required')
      return null
    }

    if (validWords.length > 20) {
      setError('Maximum 20 words allowed')
      return null
    }

    // Check for duplicate words
    const wordList = validWords.map(w => w.word.toLowerCase().trim())
    const duplicates = wordList.filter((item, index) => wordList.indexOf(item) !== index)
    if (duplicates.length > 0) {
      setError(`Duplicate words found: ${duplicates.join(', ')}`)
      return null
    }

    setIsGenerating(true)
    setError(null)

    try {
      const result = await mockGeneratePuzzle(validWords)

      if (result.wordPositions.length === 0) {
        setError('Could not generate a valid crossword. Try using different words or shorter words.')
        setIsGenerating(false)
        return null
      }

      setGeneratedPuzzle(result)
      setIsGenerating(false)
      return result
    } catch (err) {
      setError(err.message || 'Failed to generate puzzle')
      setIsGenerating(false)
      return null
    }
  }, [words])

  // Save the puzzle
  const save = useCallback(async (puzzleData, editId = null) => {
    setIsSaving(true)
    setError(null)

    try {
      let result
      if (editId) {
        // Update existing puzzle
        const { updatePuzzle } = await import('@/utils/api')
        result = await updatePuzzle(editId, puzzleData)
      } else {
        // Create new puzzle
        result = await mockSavePuzzle(puzzleData)
      }
      setIsSaving(false)
      return result
    } catch (err) {
      setError(err.message || 'Failed to save puzzle')
      setIsSaving(false)
      return null
    }
  }, [])

  // Reset the generator
  const reset = useCallback(() => {
    setWords([
      { word: '', clue: '' },
      { word: '', clue: '' },
      { word: '', clue: '' },
    ])
    setGeneratedPuzzle(null)
    setError(null)
  }, [])

  return {
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
    isValid: words.filter(w => w.word.trim().length >= 2).length >= 3
  }
}
