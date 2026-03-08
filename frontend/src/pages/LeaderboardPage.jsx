import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Trophy, Clock, Lightbulb, Medal, Puzzle } from 'lucide-react'
import Button from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Badge from '@/components/ui/badge'
import { getPuzzle, getLeaderboard } from '@/utils/api'

export default function LeaderboardPage() {
  const { puzzleId } = useParams()
  const [puzzle, setPuzzle] = useState(null)
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch puzzle and leaderboard data in parallel
        const [puzzleData, scoresData] = await Promise.all([
          getPuzzle(puzzleId),
          getLeaderboard(puzzleId)
        ])

        setPuzzle(puzzleData)
        setScores(scoresData)
      } catch (err) {
        console.error('Load error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (puzzleId) {
      loadData()
    }
  }, [puzzleId])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-400" />
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-muted-foreground text-sm">#{index + 1}</span>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground mb-4">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-lg">Loading leaderboard...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Puzzle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
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
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="outline" size="icon" className="border-accent/20 hover:border-accent hover:text-accent">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6 text-accent" />
              Leaderboard
            </h1>
            <p className="text-sm text-muted-foreground">{puzzle?.title}</p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Players</CardTitle>
          </CardHeader>
          <CardContent>
            {scores.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No scores yet. Be the first to complete this puzzle!
              </p>
            ) : (
              <div className="space-y-2">
                {scores.map((score, index) => (
                  <div
                    key={score.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all
                      ${index === 0 ? 'bg-yellow-400/10 border-yellow-400/30' : 'border-border hover:border-accent/30'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 flex justify-center">
                        {getRankIcon(index)}
                      </div>
                      <div>
                        <p className="font-medium">{score.username}</p>
                        <p className="text-xs text-muted-foreground">
                          Score: {formatTime(score.score)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1" title="Completion Time">
                        <Clock className="h-3 w-3" />
                        {formatTime(score.completion_time)}
                      </div>
                      <div className="flex items-center gap-1" title="Hints Used">
                        <Lightbulb className="h-3 w-3" />
                        {score.hints_used}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score Formula Info */}
        <p className="mt-6 ml-3 text-sm text-muted-foreground">
          <strong className="text-foreground">Score :</strong> Time + (5 seconds × hints used)
        </p>
      </div>
    </div>
  )
}
