import { Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/utils/cn'

export function Timer({ time, formattedTime, isRunning }) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg transition-colors",
            isRunning ? "bg-accent/20" : "bg-muted/50"
          )}>
            <Clock className={cn(
              "h-5 w-5",
              isRunning ? "text-accent" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Time</div>
            <div className="text-xl font-mono font-bold">
              {formattedTime}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
