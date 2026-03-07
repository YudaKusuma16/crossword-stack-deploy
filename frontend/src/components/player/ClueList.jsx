import { cn } from '@/utils/cn'
import Badge from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle2 } from 'lucide-react'

export function ClueList({
  clues,
  activeDirection,
  activeClue,
  solvedClues,
  onClueClick
}) {
  const acrossClues = clues?.across || []
  const downClues = clues?.down || []

  const ClueItem = ({ clue, isActive, isSolved }) => (
    <div
      className={cn(
        "flex gap-2 p-2 rounded-md cursor-pointer transition-colors text-sm",
        isActive && "bg-primary/10 border border-primary/20",
        !isActive && "hover:bg-accent",
        isSolved && "opacity-60"
      )}
      onClick={() => onClueClick(clue)}
    >
      <Badge
        variant={isActive ? "default" : "outline"}
        className="shrink-0"
      >
        {clue.number}
      </Badge>
      <span className="flex-1">{clue.clue}</span>
      {isSolved && (
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Across
        </h3>
        <div className="space-y-1">
          {acrossClues.map((clue, i) => {
            const isActive = activeClue?.number === clue.number &&
                            activeClue?.direction === 'across' &&
                            activeDirection === 'across'
            const isSolved = solvedClues?.has(`${clue.word}-across`)

            return (
              <ClueItem
                key={`${clue.number}-across-${clue.word}`}
                clue={clue}
                isActive={isActive}
                isSolved={isSolved}
              />
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Down
        </h3>
        <div className="space-y-1">
          {downClues.map((clue, i) => {
            const isActive = activeClue?.number === clue.number &&
                            activeClue?.direction === 'down' &&
                            activeDirection === 'down'
            const isSolved = solvedClues?.has(`${clue.word}-down`)

            return (
              <ClueItem
                key={`${clue.number}-down-${clue.word}`}
                clue={clue}
                isActive={isActive}
                isSolved={isSolved}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
