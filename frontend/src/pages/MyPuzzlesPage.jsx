import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Trash2, Edit, Play, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { format } from 'date-fns'

export default function MyPuzzlesPage() {
  const { user, getAuthHeaders } = useAuth()
  const [puzzles, setPuzzles] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, puzzleId: null })
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    fetchPuzzles()
  }, [])

  const fetchPuzzles = async () => {
    try {
      const response = await fetch('/api/puzzles/user/my', {
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (response.ok) {
        setPuzzles(data.data.puzzles)
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message || 'Failed to load puzzles'
        })
      }
    } catch (error) {
      console.error('Fetch puzzles error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to connect to server'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const { puzzleId } = deleteDialog

    try {
      const response = await fetch(`/api/puzzles/${puzzleId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (response.ok) {
        setPuzzles(puzzles.filter(p => p.id !== puzzleId))
        toast({
          title: 'Success',
          description: 'Puzzle deleted successfully'
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message || 'Failed to delete puzzle'
        })
      }
    } catch (error) {
      console.error('Delete puzzle error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to connect to server'
      })
    } finally {
      setDeleteDialog({ open: false, puzzleId: null })
    }
  }

  const getStatusBadge = (status) => {
    return status === 'published' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Published
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Draft
      </span>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">My Puzzles</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Create, manage, and share your crossword puzzles
            </p>
          </div>
          <Button onClick={() => navigate('/creator')} className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create New Puzzle</span>
            <span className="sm:hidden">Create Puzzle</span>
          </Button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground">Loading your puzzles...</p>
          </div>
        ) : puzzles.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12 sm:py-16 bg-card border border-border rounded-xl">
            <FileText className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg sm:text-xl font-semibold mb-2">No puzzles yet</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Create your first crossword puzzle to get started
            </p>
          </div>
        ) : (
          /* Puzzles Grid */
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {puzzles.map(puzzle => (
              <div
                key={puzzle.id}
                className="bg-card border border-border rounded-xl p-4 sm:p-6 hover:border-accent transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 truncate">{puzzle.title}</h3>
                    {puzzle.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {puzzle.description}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(puzzle.status)}
                </div>

                <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  <span>{puzzle.words?.length || 0} words</span>
                  <span>•</span>
                  <span className="truncate">
                    {format(new Date(puzzle.created_at), 'MMM d, yyyy')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs sm:text-sm"
                    onClick={() => navigate(`/creator?edit=${puzzle.id}`)}
                  >
                    <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                    <span>Edit</span>
                  </Button>
                  {puzzle.status === 'published' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                      onClick={() => navigate(`/play/${puzzle.id}`)}
                    >
                      <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 sm:h-9 sm:w-9 p-0"
                    onClick={() => setDeleteDialog({ open: true, puzzleId: puzzle.id })}
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, puzzleId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Puzzle</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this puzzle? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteDialog({ open: false, puzzleId: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
