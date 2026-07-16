'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Zone class - Represents success and bonus zones on the lock
 */
class Zone {
  startAngle: number
  endAngle: number
  isBonus: boolean
  active: boolean
  glowIntensity: number

  constructor(startAngle: number, endAngle: number, isBonus: boolean = false) {
    this.startAngle = startAngle
    this.endAngle = endAngle
    this.isBonus = isBonus
    this.active = true
    this.glowIntensity = 0
  }

  contains(angle: number): boolean {
    const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
    return normalizedAngle >= this.startAngle && normalizedAngle <= this.endAngle
  }

  getSize(): number {
    return this.endAngle - this.startAngle
  }
}

/**
 * Particle class - For visual effects
 */
class Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number

  constructor(x: number, y: number, color: string) {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 3 + 2
    this.x = x
    this.y = y
    this.vx = Math.cos(angle) * speed
    this.vy = Math.sin(angle) * speed
    this.life = 1
    this.maxLife = Math.random() * 30 + 30
    this.color = color
    this.size = Math.random() * 4 + 2
  }

  update(): boolean {
    this.x += this.vx
    this.y += this.vy
    this.life -= 1 / this.maxLife
    this.vy += 0.1 // gravity
    return this.life > 0
  }
}

/**
 * AudioManager class - Handles all game audio using Web Audio API
 */
class AudioManager {
  private context: AudioContext | null = null
  private masterGain: GainNode | null = null

  init() {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.context = new AudioContextClass()
      this.masterGain = this.context.createGain()
      this.masterGain.connect(this.context.destination)
      this.masterGain.gain.value = 0.3
    } catch (e) {
      console.warn('Web Audio API not supported')
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.context || !this.masterGain) return

    const oscillator = this.context.createOscillator()
    const gain = this.context.createGain()

    oscillator.connect(gain)
    gain.connect(this.masterGain)

    oscillator.frequency.value = frequency
    oscillator.type = type

    gain.gain.setValueAtTime(0.3, this.context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration)

    oscillator.start(this.context.currentTime)
    oscillator.stop(this.context.currentTime + duration)
  }

  click() {
    this.playTone(800, 0.05, 'square')
  }

  success() {
    if (!this.context) return
    const now = this.context.currentTime
    this.playTone(523.25, 0.1, 'sine') // C5
    setTimeout(() => this.playTone(659.25, 0.15, 'sine'), 50) // E5
  }

  bonus() {
    if (!this.context) return
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.12, 'sine'), i * 60)
    })
  }

  fail() {
    this.playTone(200, 0.2, 'sawtooth')
  }

  warning() {
    this.playTone(440, 0.1, 'triangle')
  }
}

/**
 * Main Game class - Controls game logic and state
 */
class Game {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  needle: { angle: number; velocity: number; acceleration: number }
  zones: Zone[]
  particles: Particle[]
  audio: AudioManager
  
  // Game state
  score: number
  timeRemaining: number
  gameState: 'start' | 'playing' | 'paused' | 'gameover'
  combo: number
  bestScore: number
  
  // Input state
  isAccelerating: boolean
  
  // Difficulty parameters
  baseSpeed: number
  maxSpeed: number
  accelerationRate: number
  friction: number
  minZoneSize: number
  maxZones: number
  
  // Visual effects
  shakeIntensity: number
  slowMotion: number
  
  // Callbacks
  onScoreUpdate: (score: number, combo: number, time: number) => void
  onGameOver: (score: number) => void

  constructor(
    canvas: HTMLCanvasElement,
    onScoreUpdate: (score: number, combo: number, time: number) => void,
    onGameOver: (score: number) => void
  ) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.audio = new AudioManager()
    this.audio.init()
    
    this.needle = { angle: 0, velocity: 0, acceleration: 0 }
    this.zones = []
    this.particles = []
    
    this.score = 0
    this.timeRemaining = 60
    this.gameState = 'start'
    this.combo = 0
    this.bestScore = parseInt(localStorage.getItem('lockpick-best-score') || '0')
    
    this.isAccelerating = false
    
    this.baseSpeed = 0.0001 // Slow default rotation speed
    this.maxSpeed = 0.001 // Much slower max speed
    this.accelerationRate = 0.0005
    this.friction = 0.99
    this.minZoneSize = Math.PI / 8
    this.maxZones = 4
    
    this.shakeIntensity = 0
    this.slowMotion = 1
    
    this.onScoreUpdate = onScoreUpdate
    this.onGameOver = onGameOver
    
    this.setupInput()
  }

  setupInput() {
    // Mouse controls
    this.canvas.addEventListener('mousedown', (e) => {
      if (this.gameState === 'start') {
        if (e.button === 2) { // Right click on start screen
          this.isAccelerating = true
        } else if (e.button === 0) { // Left click starts game
          this.startGame()
        }
      } else if (this.gameState === 'playing') {
        if (e.button === 2) { // Right click
          this.isAccelerating = true
        } else if (e.button === 0) { // Left click
          this.attemptPick()
        }
      }
    })

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button === 2) {
        this.isAccelerating = false
      }
    })

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault())

    // Touch controls for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault()
      const touches = e.touches
      
      if (this.gameState === 'start') {
        if (touches.length === 2) {
          this.isAccelerating = true
        } else if (touches.length === 1) {
          this.startGame()
        }
      } else if (this.gameState === 'playing') {
        if (touches.length === 1) {
          this.attemptPick()
        } else if (touches.length === 2) {
          this.isAccelerating = true
        }
      }
    })

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault()
      if (e.touches.length < 2) {
        this.isAccelerating = false
      }
    })
  }

  startGame() {
    this.gameState = 'playing'
    this.score = 0
    this.timeRemaining = 60
    this.combo = 0
    this.needle.angle = 0
    this.needle.velocity = this.baseSpeed // Start with base rotation
    this.baseSpeed = 0.003
    this.maxSpeed = 0.03
    this.minZoneSize = Math.PI / 8
    this.generateZones()
    this.onScoreUpdate(this.score, this.combo, this.timeRemaining)
  }

  generateZones() {
    this.zones = []
    const numZones = Math.min(2 + Math.floor(this.score / 200), this.maxZones)
    const includeBonus = Math.random() > 0.7 && this.score > 100
    
    for (let i = 0; i < numZones; i++) {
      const zoneSize = Math.max(
        this.minZoneSize * (1 - this.score / 2000),
        Math.PI / 20
      )
      const startAngle = Math.random() * (Math.PI * 2 - zoneSize)
      const isBonus = includeBonus && i === 0
      this.zones.push(new Zone(startAngle, startAngle + zoneSize, isBonus))
    }
  }

  attemptPick() {
    this.audio.click()
    
    const hitZone = this.zones.find(zone => 
      zone.active && zone.contains(this.needle.angle)
    )

    if (hitZone) {
      hitZone.active = false
      
      // Reverse rotation direction on successful hit
      this.baseSpeed = -this.baseSpeed
      this.needle.velocity = -this.needle.velocity
      
      if (hitZone.isBonus) {
        // Bonus zone hit
        this.timeRemaining += 5
        const bonusPoints = 100 * (this.combo + 1)
        this.score += bonusPoints
        this.combo++
        this.audio.bonus()
        this.slowMotion = 0.3
        this.spawnParticles(30, '#3b82f6')
        setTimeout(() => { this.slowMotion = 1 }, 300)
      } else {
        // Regular zone hit
        const points = 50 * (this.combo + 1)
        this.score += points
        this.combo++
        this.audio.success()
        this.spawnParticles(15, '#fbbf24')
      }
      
      // Increase difficulty - much slower progression (keep the absolute value increasing)
      const speedDirection = this.baseSpeed > 0 ? 1 : -1
      this.baseSpeed = (Math.abs(this.baseSpeed) + 0.0003) * speedDirection
      this.maxSpeed += 0.001
      this.minZoneSize *= 0.99
      
      // Check if all zones cleared
      if (this.zones.every(z => !z.active)) {
        this.generateZones()
      }
      
      this.onScoreUpdate(this.score, this.combo, this.timeRemaining)
    } else {
      // Miss
      this.combo = 0
      this.timeRemaining -= 2
      this.shakeIntensity = 10
      this.audio.fail()
      this.onScoreUpdate(this.score, this.combo, this.timeRemaining)
      
      if (this.timeRemaining <= 0) {
        this.endGame()
      }
    }
  }

  spawnParticles(count: number, color: string) {
    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2
    const radius = Math.min(this.canvas.width, this.canvas.height) * 0.3
    const particleX = centerX + Math.cos(this.needle.angle) * radius
    const particleY = centerY + Math.sin(this.needle.angle) * radius
    
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(particleX, particleY, color))
    }
  }

  endGame() {
    this.gameState = 'gameover'
    if (this.score > this.bestScore) {
      this.bestScore = this.score
      localStorage.setItem('lockpick-best-score', this.score.toString())
    }
    this.onGameOver(this.score)
  }

  update(deltaTime: number) {
    const dt = deltaTime * this.slowMotion

    // Update needle physics - always rotates, holding right-click doubles speed
    const targetSpeed = this.isAccelerating ? this.baseSpeed * 2 : this.baseSpeed
    
    // Smoothly transition to target speed
    if (Math.abs(this.needle.velocity - targetSpeed) > 0.0001) {
      const diff = targetSpeed - this.needle.velocity
      this.needle.velocity += diff * 0.1 * (dt / 16)
    } else {
      this.needle.velocity = targetSpeed
    }
    
    this.needle.angle += this.needle.velocity * dt

    // Only update game logic when playing
    if (this.gameState !== 'playing') return
    
    // Update particles
    this.particles = this.particles.filter(p => p.update())
    
    // Update shake
    this.shakeIntensity *= 0.9
    
    // Update zone glow
    this.zones.forEach(zone => {
      zone.glowIntensity = Math.sin(Date.now() / 200) * 0.3 + 0.7
    })
    
    // Update timer (only in real time)
    this.timeRemaining -= deltaTime / 1000
    
    if (this.timeRemaining <= 0) {
      this.endGame()
    } else if (this.timeRemaining <= 10 && Math.floor(this.timeRemaining * 2) % 2 === 0) {
      this.audio.warning()
    }
    
    this.onScoreUpdate(this.score, this.combo, this.timeRemaining)
  }

  draw() {
    const ctx = this.ctx
    const width = this.canvas.width
    const height = this.canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) * 0.3
    
    // Apply shake
    ctx.save()
    if (this.shakeIntensity > 0) {
      ctx.translate(
        (Math.random() - 0.5) * this.shakeIntensity,
        (Math.random() - 0.5) * this.shakeIntensity
      )
    }
    
    // Clear canvas with dark background
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, width, height)
    
    // Draw outer glow
    const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius * 1.5)
    gradient.addColorStop(0, 'rgba(251, 191, 36, 0.1)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    // Draw lock body
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fillStyle = '#1e293b'
    ctx.fill()
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 4
    ctx.stroke()
    
    // Draw inner circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.85, 0, Math.PI * 2)
    ctx.fillStyle = '#0f172a'
    ctx.fill()
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 2
    ctx.stroke()
    
    // Draw zones
    this.zones.forEach(zone => {
      if (!zone.active) return
      
      ctx.save()
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 0.85, zone.startAngle, zone.endAngle)
      ctx.arc(centerX, centerY, radius * 0.7, zone.endAngle, zone.startAngle, true)
      ctx.closePath()
      
      if (zone.isBonus) {
        // Bonus zone - blue with glow
        ctx.fillStyle = `rgba(59, 130, 246, ${0.6 * zone.glowIntensity})`
        ctx.fill()
        ctx.strokeStyle = `rgba(96, 165, 250, ${zone.glowIntensity})`
        ctx.lineWidth = 3
        ctx.stroke()
        
        // Extra glow
        ctx.shadowBlur = 20
        ctx.shadowColor = '#3b82f6'
        ctx.stroke()
      } else {
        // Success zone - gold with glow
        ctx.fillStyle = `rgba(251, 191, 36, ${0.5 * zone.glowIntensity})`
        ctx.fill()
        ctx.strokeStyle = `rgba(251, 191, 36, ${zone.glowIntensity})`
        ctx.lineWidth = 3
        ctx.stroke()
        
        // Extra glow
        ctx.shadowBlur = 15
        ctx.shadowColor = '#fbbf24'
        ctx.stroke()
      }
      
      ctx.restore()
    })
    
    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.15, 0, Math.PI * 2)
    ctx.fillStyle = '#334155'
    ctx.fill()
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 2
    ctx.stroke()
    
    // Draw needle
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(this.needle.angle)
    
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(radius * 0.75, 0)
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.stroke()
    
    // Needle tip glow
    ctx.beginPath()
    ctx.arc(radius * 0.75, 0, 6, 0, Math.PI * 2)
    ctx.fillStyle = '#dc2626'
    ctx.fill()
    ctx.shadowBlur = 10
    ctx.shadowColor = '#ef4444'
    ctx.fill()
    
    ctx.restore()
    
    // Draw particles
    this.particles.forEach(p => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.globalAlpha = p.life
      ctx.fill()
      ctx.globalAlpha = 1
    })
    
    // Draw start/gameover screen
    if (this.gameState === 'start') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(0, 0, width, height)
      
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 48px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('LOCKPICK', centerX, centerY - 60)
      
      ctx.fillStyle = '#94a3b8'
      ctx.font = '18px sans-serif'
      ctx.fillText('Needle rotates automatically', centerX, centerY - 10)
      ctx.fillText('Hold Right Click: Double Speed', centerX, centerY + 20)
      ctx.fillText('Left Click: Pick Lock', centerX, centerY + 50)
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 22px sans-serif'
      ctx.fillText('Left Click to Start', centerX, centerY + 90)
      
      if (this.bestScore > 0) {
        ctx.fillStyle = '#fbbf24'
        ctx.font = 'bold 24px sans-serif'
        ctx.fillText(`Best: ${this.bestScore}`, centerX, centerY + 120)
      }
    }
    
    ctx.restore()
  }
}

type LockpickGameProps = {
  userId?: string
}

export default function LockpickGame({ userId }: LockpickGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<Game | null>(null)
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(60)
  const [speed, setSpeed] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [isSavingScore, setIsSavingScore] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    const updateSize = () => {
      const size = Math.min(window.innerWidth - 40, 600)
      canvas.width = size
      canvas.height = size
    }
    updateSize()
    window.addEventListener('resize', updateSize)

    // Initialize game
    const game = new Game(
      canvas,
      (score, combo, time) => {
        setScore(score)
        setCombo(combo)
        setTimeRemaining(Math.max(0, time))
        setSpeed(Math.floor(game.needle.velocity * 1000))
      },
      async (score) => {
        setFinalScore(score)
        setGameOver(true)
        
        // Save score to database only if user is logged in
        if (userId) {
          setIsSavingScore(true)
          try {
            const { saveHighScore } = await import('@/app/actions/scores')
            await saveHighScore(score)
          } catch (error) {
            console.error('Failed to save score:', error)
          } finally {
            setIsSavingScore(false)
          }
        }
      }
    )
    gameRef.current = game

    // Game loop
    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const deltaTime = Math.min(timestamp - lastTimeRef.current, 100)
      lastTimeRef.current = timestamp

      game.update(deltaTime)
      game.draw()

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    animationRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  const restart = () => {
    setGameOver(false)
    if (gameRef.current) {
      gameRef.current.startGame()
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* HUD */}
      <div className="grid w-full max-w-2xl grid-cols-4 gap-4">
        <div className="rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 text-center shadow-lg">
          <div className="text-3xl font-bold text-white">{score}</div>
          <div className="text-sm text-yellow-100">Score</div>
        </div>
        <div className={`rounded-lg p-4 text-center shadow-lg transition-all ${
          timeRemaining <= 10 
            ? 'animate-pulse bg-gradient-to-br from-red-500 to-red-600' 
            : 'bg-gradient-to-br from-blue-500 to-blue-600'
        }`}>
          <div className="text-3xl font-bold text-white">{Math.ceil(timeRemaining)}</div>
          <div className="text-sm text-blue-100">Time</div>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-4 text-center shadow-lg">
          <div className="text-3xl font-bold text-white">x{combo}</div>
          <div className="text-sm text-purple-100">Combo</div>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-4 text-center shadow-lg">
          <div className="text-3xl font-bold text-white">
            {speed}
          </div>
          <div className="text-sm text-green-100">Speed</div>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="rounded-2xl shadow-2xl ring-4 ring-slate-700"
          style={{ touchAction: 'none' }}
        />
        
        {/* Game Over Modal */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/80 backdrop-blur-sm">
            <div className="space-y-6 rounded-xl bg-slate-800 p-8 text-center">
              <h2 className="text-4xl font-bold text-yellow-400">Game Over!</h2>
              <div className="space-y-2">
                <p className="text-6xl font-bold text-white">{finalScore}</p>
                <p className="text-xl text-slate-300">Final Score</p>
                {userId ? (
                  isSavingScore ? (
                    <p className="text-sm text-blue-400">Saving score...</p>
                  ) : (
                    <p className="text-sm text-green-400">Score saved to leaderboard!</p>
                  )
                ) : (
                  <p className="text-sm text-yellow-400">
                    🔒 <a href="/login" className="underline hover:text-yellow-300">Login</a> to save your score to the leaderboard
                  </p>
                )}
              </div>
              <button
                onClick={restart}
                className="rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 px-8 py-3 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="w-full max-w-2xl rounded-lg bg-slate-800 p-6 text-slate-300 shadow-lg">
        <h3 className="mb-3 text-xl font-bold text-white">How to Play</h3>
        <ul className="space-y-2 text-sm">
          <li>🔄 <strong>Auto Rotation:</strong> Needle rotates slowly by default</li>
          <li>🖱️ <strong>Right Click/2 Fingers:</strong> Double the rotation speed</li>
          <li>🎯 <strong>Left Click/Tap:</strong> Attempt to pick the lock</li>
          <li>🟡 <strong>Gold Zones:</strong> Success zones - hit them for points</li>
          <li>🔵 <strong>Blue Zones:</strong> Bonus zones - extra time and points!</li>
          <li>💥 <strong>Combo:</strong> Chain successful hits for multipliers</li>
          <li>⚡ <strong>Difficulty:</strong> Speed increases gradually with score</li>
        </ul>
      </div>
    </div>
  )
}
