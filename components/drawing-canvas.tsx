"use client"

import type React from "react"
import { useRef, useState, useEffect, useCallback } from "react"
import { useGame, type DrawStroke } from "@/components/game-context"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Pencil, Eraser, Trash2, PaintBucket, Undo2, Eye, Sparkles, Palette } from "lucide-react"
import { useThemeColorPalette } from "@/components/theme-color-palette"

interface DrawingCanvasProps {
  isDrawing: boolean
  currentWord: string
}

export function DrawingCanvas({ isDrawing, currentWord }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(8)
  const [tool, setTool] = useState<"brush" | "eraser" | "fill">("brush")
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const currentStroke = useRef<{ x: number; y: number }[]>([])
  const [canvasHistory, setCanvasHistory] = useState<ImageData[]>([])

  const { gameState, addCanvasStroke, clearCanvas } = useGame()

  const COLOR_PALETTE = useThemeColorPalette()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d", { willReadFrequently: true })
    if (!context) return

    const resizeCanvas = () => {
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      canvas.width = 800
      canvas.height = 600
      canvas.style.width = `${Math.min(800, rect.width - 24)}px`
      canvas.style.height = `${Math.min(600, (rect.width - 24) * 0.75)}px`

      context.fillStyle = "#FFFFFF"
      context.fillRect(0, 0, canvas.width, canvas.height)
      redrawStrokes(context)
    }

    resizeCanvas()
    setCtx(context)

    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [])

  const redrawStrokes = useCallback(
    (context: CanvasRenderingContext2D) => {
      const canvas = canvasRef.current
      if (!canvas) return

      context.fillStyle = "#FFFFFF"
      context.fillRect(0, 0, canvas.width, canvas.height)

      gameState.canvasStrokes.forEach((stroke) => {
        if (stroke.points.length < 2) return

        context.beginPath()
        context.strokeStyle = stroke.tool === "eraser" ? "#FFFFFF" : stroke.color
        context.lineWidth = stroke.size
        context.lineCap = "round"
        context.lineJoin = "round"

        context.moveTo(stroke.points[0].x, stroke.points[0].y)
        for (let i = 1; i < stroke.points.length; i++) {
          context.lineTo(stroke.points[i].x, stroke.points[i].y)
        }
        context.stroke()
      })
    },
    [gameState.canvasStrokes],
  )

  useEffect(() => {
    if (ctx) redrawStrokes(ctx)
  }, [ctx, redrawStrokes])

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ("touches" in e) {
      const touch = e.touches[0]
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY }
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  const saveState = () => {
    if (!ctx || !canvasRef.current) return
    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)
    setCanvasHistory((prev) => [...prev.slice(-10), imageData])
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctx) return
    e.preventDefault()

    saveState()
    const coords = getCanvasCoords(e)

    if (tool === "fill") {
      floodFill(Math.floor(coords.x), Math.floor(coords.y))
      return
    }

    setIsMouseDown(true)
    lastPos.current = coords
    currentStroke.current = [coords]

    ctx.beginPath()
    ctx.moveTo(coords.x, coords.y)
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.lineWidth = brushSize
    ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : color
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isMouseDown || !isDrawing || !ctx || !lastPos.current) return
    e.preventDefault()

    const coords = getCanvasCoords(e)

    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(coords.x, coords.y)
    ctx.stroke()

    lastPos.current = coords
    currentStroke.current.push(coords)
  }

  const stopDrawing = () => {
    if (isMouseDown && currentStroke.current.length > 0) {
      const stroke: DrawStroke = {
        points: [...currentStroke.current],
        color: color,
        size: brushSize,
        tool: tool === "eraser" ? "eraser" : "brush",
      }
      addCanvasStroke(stroke)
    }

    setIsMouseDown(false)
    lastPos.current = null
    currentStroke.current = []
  }

  const handleUndo = () => {
    if (!ctx || !canvasRef.current || canvasHistory.length === 0) return
    const lastState = canvasHistory[canvasHistory.length - 1]
    ctx.putImageData(lastState, 0, 0)
    setCanvasHistory((prev) => prev.slice(0, -1))
  }

  const floodFill = (startX: number, startY: number) => {
    if (!ctx || !canvasRef.current) return

    const canvas = canvasRef.current
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    const targetColor = getPixelColor(data, startX, startY, canvas.width)
    const fillColor = hexToRgb(color)

    if (!fillColor || colorsMatch(targetColor, fillColor)) return

    const stack: [number, number][] = [[startX, startY]]
    const visited = new Set<string>()

    while (stack.length > 0) {
      const [x, y] = stack.pop()!
      const key = `${x},${y}`

      if (visited.has(key)) continue
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue

      const currentColor = getPixelColor(data, x, y, canvas.width)
      if (!colorsMatch(currentColor, targetColor)) continue

      visited.add(key)
      setPixelColor(data, x, y, canvas.width, fillColor)

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const getPixelColor = (data: Uint8ClampedArray, x: number, y: number, width: number) => {
    const index = (y * width + x) * 4
    return { r: data[index], g: data[index + 1], b: data[index + 2] }
  }

  const setPixelColor = (
    data: Uint8ClampedArray,
    x: number,
    y: number,
    width: number,
    color: { r: number; g: number; b: number },
  ) => {
    const index = (y * width + x) * 4
    data[index] = color.r
    data[index + 1] = color.g
    data[index + 2] = color.b
    data[index + 3] = 255
  }

  const colorsMatch = (c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }) => {
    const threshold = 30
    return Math.abs(c1.r - c2.r) < threshold && Math.abs(c1.g - c2.g) < threshold && Math.abs(c1.b - c2.b) < threshold
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null
  }

  const handleClearCanvas = () => {
    if (!ctx || !canvasRef.current) return
    saveState()
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    clearCanvas()
  }

  return (
    <div ref={containerRef} className="glass-strong rounded-xl overflow-hidden h-full flex flex-col">
      {/* Word to draw */}
      {isDrawing && (
        <div className="p-4 bg-gradient-to-r from-primary/10 via-purple-500/5 to-secondary/10 border-b border-white/5 text-center">
          <p className="text-xs text-white/50 mb-1">Tu dois dessiner :</p>
          <p className="text-2xl font-bold text-white flex items-center justify-center gap-3">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              {currentWord}
            </span>
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          </p>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-800/20 to-slate-900/20 p-3">
        <canvas
          ref={canvasRef}
          className="bg-white rounded-xl shadow-2xl cursor-crosshair touch-none border-4 border-white/10"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ touchAction: "none" }}
        />
      </div>

      {/* Tools */}
      {isDrawing && (
        <div className="p-3 border-t border-white/5 space-y-3">
          <div className="flex flex-wrap gap-1 justify-center">
            {COLOR_PALETTE.map((c, index) => (
              <button
                key={`${c}-${index}`}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-lg transition-all hover:scale-110 ${
                  color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#0a0a1a] scale-110" : ""
                }`}
                style={{
                  backgroundColor: c,
                  boxShadow: color === c ? `0 0 15px ${c}80` : undefined,
                }}
              />
            ))}
          </div>

          {/* Tool buttons */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 glass rounded-xl p-1">
              <Button
                variant={tool === "brush" ? "default" : "ghost"}
                size="icon"
                onClick={() => setTool("brush")}
                className={`h-9 w-9 ${tool === "brush" ? "bg-gradient-to-r from-primary to-purple-500 shadow-lg shadow-primary/30" : "text-white/60 hover:text-white hover:bg-white/10"}`}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant={tool === "eraser" ? "default" : "ghost"}
                size="icon"
                onClick={() => setTool("eraser")}
                className={`h-9 w-9 ${tool === "eraser" ? "bg-gradient-to-r from-primary to-purple-500 shadow-lg shadow-primary/30" : "text-white/60 hover:text-white hover:bg-white/10"}`}
              >
                <Eraser className="w-4 h-4" />
              </Button>
              <Button
                variant={tool === "fill" ? "default" : "ghost"}
                size="icon"
                onClick={() => setTool("fill")}
                className={`h-9 w-9 ${tool === "fill" ? "bg-gradient-to-r from-primary to-purple-500 shadow-lg shadow-primary/30" : "text-white/60 hover:text-white hover:bg-white/10"}`}
              >
                <PaintBucket className="w-4 h-4" />
              </Button>
            </div>

            {/* Brush size */}
            <div className="flex items-center gap-2 glass rounded-xl px-3 py-2">
              <Palette className="w-4 h-4 text-white/40" />
              <Slider
                value={[brushSize]}
                onValueChange={([v]) => setBrushSize(v)}
                min={2}
                max={30}
                step={1}
                className="w-24"
              />
              <span className="text-xs font-mono text-white/60 w-6 text-right">{brushSize}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 glass rounded-xl p-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUndo}
                disabled={canvasHistory.length === 0}
                className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearCanvas}
                className="h-9 w-9 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Viewer message */}
      {!isDrawing && gameState.phase === "drawing" && (
        <div className="p-4 border-t border-white/5 bg-gradient-to-r from-cyan-500/5 to-teal-500/5 text-center">
          <div className="flex items-center justify-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <p className="text-sm text-white/60">Devine le mot dans le chat !</p>
          </div>
        </div>
      )}
    </div>
  )
}
