'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { X, Plus, SkipForward, Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"

interface RestTimerProps {
  initialSeconds?: number
  onComplete?: () => void
  isOpen: boolean
  onClose: () => void
}

export function RestTimer({ initialSeconds = 90, onComplete, isOpen, onClose }: RestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [isActive, setIsActive] = useState(true)

  // Reset timer when opened
  useEffect(() => {
    if (isOpen) {
        setSecondsLeft(initialSeconds)
        setIsActive(true)
    }
  }, [isOpen, initialSeconds])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isOpen && isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1)
      }, 1000)
    } else if (secondsLeft === 0) {
      setIsActive(false)
      if (onComplete) onComplete()
      // Optional: Auto-close or play sound
    }

    return () => clearInterval(interval)
  }, [isOpen, isActive, secondsLeft, onComplete])

  if (!isOpen) return null

  const progress = ((initialSeconds - secondsLeft) / initialSeconds) * 100

  return (
    <div className="fixed bottom-20 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 w-[200px] relative overflow-hidden">
        {/* Progress Background (Visual flair) */}
        <div 
            className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-1000 ease-linear" 
            style={{ width: `${Math.min(progress, 100)}%` }}
        />

        <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Descanso</span>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
            </button>
        </div>

        <div className="flex justify-center items-center my-2">
            <span className="text-4xl font-mono font-bold tracking-tighter">
                {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
            </span>
        </div>

        <div className="flex justify-between gap-2 mt-2">
            <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-full bg-slate-800 hover:bg-slate-700 text-xs"
                onClick={() => setSecondsLeft(prev => prev + 30)}
            >
                +30s
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-full bg-slate-800 hover:bg-slate-700 text-xs"
                onClick={onClose}
            >
                <SkipForward className="h-3 w-3 mr-1" />
                Listo
            </Button>
        </div>
      </div>
    </div>
  )
}
