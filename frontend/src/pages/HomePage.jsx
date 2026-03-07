import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlusCircle, Play, Clock, Puzzle, Share2, Trophy } from 'lucide-react'
import Button from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Badge from '@/components/ui/badge'
import { mockGetPuzzles } from '@/utils/api'
import { useToast } from '@/components/ui/use-toast'

export default function HomePage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [puzzles, setPuzzles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPuzzles = async () => {
      try {
        const data = await mockGetPuzzles({ status: 'published' })
        setPuzzles(data)
      } catch (error) {
        console.error('Failed to load puzzles:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPuzzles()
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleShare = (id, title) => {
    const url = `${window.location.origin}/play/${id}`
    navigator.clipboard.writeText(url)
    toast({
      title: 'Link copied',
      description: `Share link for "${title}" has been copied to clipboard`
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 px-4 sm:py-16">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Create & Play <span className="text-accent">Crossword Puzzles</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-4">
              Generate unique crossword puzzles with your own words and clues. Challenge yourself or share with friends.
            </p>
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <Link to="/creator">
                <Button size="lg" className="text-sm sm:text-base">
                  <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="hidden sm:inline">Create Puzzle</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Featured Puzzles</h2>
              <p className="text-muted-foreground text-sm mt-1">Choose a puzzle to play</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading puzzles...</span>
              </div>
            </div>
          ) : puzzles.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full mb-4">
                <Puzzle className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm sm:text-base mb-6">No puzzles available yet</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {puzzles.map((puzzle) => (
                <Card key={puzzle.id} className="group hover:border-accent/50 transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="group-hover:text-accent transition-colors leading-tight text-base sm:text-lg">
                        {puzzle.title}
                      </CardTitle>
                      <Badge variant="accent" className="shrink-0 text-xs">
                        {puzzle.wordPositions?.length || puzzle.words?.length || 0} words
                      </Badge>
                    </div>
                    {puzzle.description && (
                      <CardDescription className="line-clamp-2 text-sm">{puzzle.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden xs:inline">{formatDate(puzzle.created_at)}</span>
                          <span className="xs:hidden">
                            {new Date(puzzle.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Link to={`/play/${puzzle.id}`}>
                          <Button size="sm" className="group-hover:bg-accent group-hover:text-accent-foreground px-2 sm:px-3">
                            <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline ml-1">Play</span>
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShare(puzzle.id, puzzle.title)}
                          className="border-accent/20 hover:border-accent hover:text-accent px-2"
                        >
                          <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/leaderboard/${puzzle.id}`)}
                          className="border-accent/20 hover:border-accent hover:text-accent px-2"
                        >
                          <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
