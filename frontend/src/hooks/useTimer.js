import { useState, useEffect, useRef, useCallback } from 'react'

export function useTimer(initialTime = 0) {
  const [time, setTime] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)

  // Start the timer
  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true)
    }
  }, [isRunning])

  // Pause the timer
  const pause = useCallback(() => {
    if (isRunning) {
      setIsRunning(false)
    }
  }, [isRunning])

  // Reset the timer
  const reset = useCallback((newTime = 0) => {
    setIsRunning(false)
    setTime(newTime)
  }, [])

  // Format time as MM:SS
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Format current time
  const formattedTime = formatTime(time)

  // Timer effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 1)
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  return {
    time,
    formattedTime,
    isRunning,
    start,
    pause,
    reset,
    formatTime
  }
}
