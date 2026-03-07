import * as React from "react"

import { cn } from "@/utils/cn"

const Progress = React.forwardRef(({ className, value, max = 100, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-muted",
      className
    )}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-accent transition-all duration-500 ease-out shadow-lg"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
))
Progress.displayName = "Progress"

export default Progress
