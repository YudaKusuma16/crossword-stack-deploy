import { Plus, Trash2, Loader2, Sparkles } from 'lucide-react'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Badge from '@/components/ui/badge'

export function WordInputForm({
  words,
  updateWord,
  addWord,
  removeWord,
  generate,
  isGenerating,
  error,
  isValid
}) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Words & Clues</CardTitle>
            <CardDescription className="mt-1">
              Add words and their clues
            </CardDescription>
          </div>
          <Badge variant="accent" className="text-sm">
            {words.length} / 15
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {words.map((item, index) => (
            <div key={index} className="group relative p-4 rounded-lg border border-border bg-card/50 hover:border-accent/30 transition-all">
              <div className="flex gap-3 items-start">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Label htmlFor={`word-${index}`} className="w-12 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
                      Word {index + 1}
                    </Label>
                    <Input
                      id={`word-${index}`}
                      type="text"
                      value={item.word}
                      onChange={(e) => updateWord(index, 'word', e.target.value)}
                      placeholder="Enter word"
                      className="uppercase font-medium"
                      maxLength={20}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Label htmlFor={`clue-${index}`} className="w-12 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
                      Clue
                    </Label>
                    <Input
                      id={`clue-${index}`}
                      type="text"
                      value={item.clue}
                      onChange={(e) => updateWord(index, 'clue', e.target.value)}
                      placeholder="Enter clue for this word"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeWord(index)}
                  disabled={words.length <= 3}
                  className="mt-6 hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addWord}
          disabled={words.length >= 20}
          className="w-full border-dashed border-2 border-accent/30 hover:border-accent hover:bg-accent/5"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Word
        </Button>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
            {error}
          </div>
        )}

        <Button
          type="button"
          onClick={generate}
          disabled={!isValid || isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Crossword
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
