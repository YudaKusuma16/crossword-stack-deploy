import Progress from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'

export function ProgressBar({ progress, filledCount, totalCount }) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground uppercase tracking-wide">Progress</span>
            <span className="font-medium">
              {filledCount} / {totalCount} cells
            </span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="text-center">
            <span className="text-2xl font-bold text-accent">{progress}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
