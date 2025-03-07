"use client"

import { useEffect, useRef } from "react"

export default function VoiceWaveAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 300
    canvas.height = 80

    let animationFrameId: number
    const bars: number[] = []
    const barCount = 30
    const barWidth = 6
    const barGap = 4

    // Initialize bars with random heights
    for (let i = 0; i < barCount; i++) {
      bars.push(Math.random() * 50 + 5)
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update bar heights
      for (let i = 0; i < barCount; i++) {
        const targetHeight = Math.random() * 50 + 5
        bars[i] = bars[i] + (targetHeight - bars[i]) * 0.1

        // Draw bar
        ctx.fillStyle = "#3b82f6"
        const x = i * (barWidth + barGap) + (canvas.width - barCount * (barWidth + barGap)) / 2
        const y = canvas.height / 2 - bars[i] / 2
        ctx.fillRect(x, y, barWidth, bars[i])
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="w-full max-w-xs h-20" aria-label="语音波形动画" />
}

