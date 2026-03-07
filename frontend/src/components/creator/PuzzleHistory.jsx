import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy, Trash2, Eye, History } from 'lucide-react'
import { mockGetPuzzles, mockDeletePuzzle } from '@/utils/api'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function PuzzleHistory({ currentPuzzle, onEdit }) {
  const [puzzles, setPuzzles] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    loadPuzzles()
  }, [currentPuzzle])

  const loadPuzzles = async () => {
    setLoading(true)
    try {
      const data = await mockGetPuzzles()
      setPuzzles(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load puzzles',
        variant: 'destructive'
      })
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    try {
      await mockDeletePuzzle(id)
      setPuzzles(puzzles.filter(p => p.id !== id))
      setDeleteDialog(null)
      toast({
        title: 'Success',
        description: 'Puzzle deleted successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete puzzle',
        variant: 'destructive'
      })
    }
  }

  const handleShare = (id) => {
    const url = `${window.location.origin}/play/${id}`
    navigator.clipboard.writeText(url)
    toast({
      title: 'Link copied',
      description: 'Share link has been copied to clipboard'
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <>
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-accent" />
            Puzzle History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="inline-flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span>Loading puzzles...</span>
              </div>
            </div>
          ) : puzzles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No puzzles created yet</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Words</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {puzzles.map((puzzle) => (
                    <TableRow key={puzzle.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">{puzzle.title}</TableCell>
                      <TableCell>
                        <Badge variant={puzzle.status === 'published' ? 'default' : 'secondary'}>
                          {puzzle.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{puzzle.words?.length || 0}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(puzzle.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleShare(puzzle.id)}
                            title="Copy share link"
                            className="hover:text-accent"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Link to={`/play/${puzzle.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Play puzzle"
                              className="hover:text-accent"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteDialog(puzzle.id)}
                            title="Delete puzzle"
                            className="hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent className="border-destructive/20">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Puzzle</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this puzzle? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)} className="border-accent/20 hover:border-accent hover:text-accent">
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteDialog)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
