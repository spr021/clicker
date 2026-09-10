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

  initialSize: number
  age: number
  maxAge: number

  constructor(startAngle: number, endAngle: number, isBonus: boolean = false) {
    this.startAngle = startAngle
    this.endAngle = endAngle
    this.isBonus = isBonus
    this.active = true
    this.glowIntensity = 0
    this.initialSize = endAngle - startAngle
    this.age = 0
    this.maxAge = 5000
  }

  contains(angle: number): boolean {
    const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
    return normalizedAngle >= this.startAngle && normalizedAngle <= this.endAngle
  }

  getSize(): number {
    return this.endAngle - this.startAngle
  }

  getLifeRatio(): number {
    return Math.max(0, Math.min(1, 1 - this.age / this.maxAge))
  }

  update(deltaTime: number): boolean {
    this.age += deltaTime
    const lifeRatio = 1 - (this.age / this.maxAge)
    
    if (lifeRatio <= 0) {
      this.active = false
      return false
    }
    
    const currentSize = this.initialSize * Math.max(0.3, lifeRatio)
    const midAngle = (this.startAngle + this.endAngle) / 2
    this.startAngle = midAngle - currentSize / 2
    this.endAngle = midAngle + currentSize / 2
    
    return true
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
 * Presentation palette - Resolved from theme tokens so the instrument
 * follows the application theme instead of using fixed game colors.
 */
type GamePalette = {
  backdrop: string
  panel: string
  edge: string
  tick: string
  target: string
  bonus: string
  needle: string
  danger: string
  text: string
  muted: string
}

function themeColor(name: string, fallback: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

function withAlpha(color: string, alpha: number): string {
  const normalized = color.trim()
  const rgbaMatch = normalized.match(/^rgba?\(([^)]+)\)$/)
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(',').map((part) => part.trim())
    if (parts.length === 3 || parts.length === 4) {
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`
    }
    return normalized
  }

  const hexMatch = normalized.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
  if (!hexMatch) return normalized

  let hex = hexMatch[1]
  if (hex.length === 3) {
    hex = hex.split('').map((part) => part + part).join('')
  }

  const red = parseInt(hex.slice(0, 2), 16)
  const green = parseInt(hex.slice(2, 4), 16)
  const blue = parseInt(hex.slice(4, 6), 16)
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function getGamePalette(): GamePalette {
  return {
    backdrop: themeColor('--game-backdrop', '#08090b'),
    panel: themeColor('--game-panel', '#12161b'),
    edge: themeColor('--game-edge', '#2b3440'),
    tick: themeColor('--game-tick', '#5b6a7a'),
    target: themeColor('--game-target', '#d3ab55'),
    bonus: themeColor('--game-bonus', '#7fb4c7'),
    needle: themeColor('--game-needle', '#e8edf2'),
    danger: themeColor('--game-danger', '#d3655f'),
    text: themeColor('--foreground', '#ededed'),
    muted: themeColor('--muted', '#9aa3ad'),
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
  palette: GamePalette
  typeface: string
  trail: number[]

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
    
    this.baseSpeed = 0.002 // Easy default rotation speed
    this.maxSpeed = 0.015 // Challenging max speed
    this.accelerationRate = 0.0005
    this.friction = 0.99
    this.minZoneSize = Math.PI / 4 // Larger zones (90 degrees)
    this.maxZones = 5
    
    this.shakeIntensity = 0
    this.slowMotion = 1
    this.palette = getGamePalette()
    this.typeface = getComputedStyle(document.body).fontFamily
    this.trail = []

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
    this.trail = []
    this.baseSpeed = 0.003
    this.maxSpeed = 0.03
    this.minZoneSize = Math.PI / 8
    this.generateZones()
    this.onScoreUpdate(this.score, this.combo, this.timeRemaining)
  }

  lastZoneSpawn: number = 0
  zoneSpawnInterval: number = 1500

  generateZones() {
    this.zones = []
    const numZones = 3
    
    for (let i = 0; i < numZones; i++) {
      this.spawnZone()
    }
    
    this.lastZoneSpawn = Date.now()
  }

  spawnZone() {
    if (this.zones.filter(z => z.active).length >= this.maxZones) return
    
    const zoneSize = Math.max(
      this.minZoneSize * (1 - this.score / 3000),
      Math.PI / 6
    )
    const startAngle = Math.random() * (Math.PI * 2 - zoneSize)
    const isBonus = Math.random() > 0.65
    this.zones.push(new Zone(startAngle, startAngle + zoneSize, isBonus))
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
        this.spawnParticles(30, this.palette.bonus)
        setTimeout(() => { this.slowMotion = 1 }, 300)
      } else {
        // Regular zone hit
        const points = 50 * (this.combo + 1)
        this.score += points
        this.combo++
        this.audio.success()
        this.spawnParticles(15, this.palette.target)
      }
      
      // Increase difficulty - slower progression
      const speedDirection = this.baseSpeed > 0 ? 1 : -1
      this.baseSpeed = (Math.abs(this.baseSpeed) + 0.0002) * speedDirection
      this.maxSpeed = Math.min(this.maxSpeed + 0.0008, 0.025)
      this.minZoneSize *= 0.985
      
      this.onScoreUpdate(this.score, this.combo, this.timeRemaining)
    } else {
      // Miss - reset speed to base while preserving rotation direction
      const direction = this.baseSpeed >= 0 ? 1 : -1
      this.combo = 0
      this.baseSpeed = 0.0008 * direction
      this.needle.velocity = 0.0008 * direction
      this.timeRemaining -= 1
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
    
    // Smoothly transition to target speed with exponential easing for fluid motion
    const easing = 0.15 * (dt / 16)
    this.needle.velocity += (targetSpeed - this.needle.velocity) * easing
    
    this.needle.angle += this.needle.velocity * dt
    const normalizedTrailAngle = ((this.needle.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    this.trail.push(normalizedTrailAngle)
    if (this.trail.length > 22) {
      this.trail.shift()
    }

    // Only update game logic when playing
    if (this.gameState !== 'playing') return
    
    // Update particles
    this.particles = this.particles.filter(p => p.update())
    
    // Update shake
    this.shakeIntensity *= 0.9
    
    // Update zones - shrink over time and spawn new ones
    this.zones.forEach(zone => {
      zone.glowIntensity = Math.sin(Date.now() / 200) * 0.3 + 0.7
      if (zone.active) {
        zone.update(deltaTime)
      }
    })
    
    // Remove inactive zones
    this.zones = this.zones.filter(z => z.active)
    
    // Spawn new zones continuously
    const now = Date.now()
    if (now - this.lastZoneSpawn > this.zoneSpawnInterval) {
      this.spawnZone()
      this.lastZoneSpawn = now
    }
    
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
    const palette = this.palette
    const width = this.canvas.width
    const height = this.canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const dial = Math.min(width, height) * 0.34
    const bezel = dial * 1.16
    const ui = Math.max(0.72, Math.min(1.25, width / 620))

    // Apply restrained shake feedback
    ctx.save()
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    if (this.shakeIntensity > 0.25) {
      ctx.translate(
        (Math.random() - 0.5) * this.shakeIntensity * 0.25,
        (Math.random() - 0.5) * this.shakeIntensity * 0.25
      )
    }

    // Quiet studio backdrop
    ctx.fillStyle = palette.backdrop
    ctx.fillRect(0, 0, width, height)

    const ambient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, dial * 2.7)
    ambient.addColorStop(0, withAlpha(palette.panel, 0.92))
    ambient.addColorStop(0.62, withAlpha(palette.panel, 0.32))
    ambient.addColorStop(1, withAlpha(palette.backdrop, 1))
    ctx.fillStyle = ambient
    ctx.fillRect(0, 0, width, height)

    const vignette = ctx.createRadialGradient(centerX, centerY, dial * 0.8, centerX, centerY, dial * 2.7)
    vignette.addColorStop(0, withAlpha(palette.edge, 0))
    vignette.addColorStop(0.68, withAlpha(palette.edge, 0))
    vignette.addColorStop(1, withAlpha(palette.edge, 0.26))
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, width, height)

    // Fine machined rings
    for (let ring = 0; ring < 4; ring++) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, dial * (1.28 + ring * 0.045), 0, Math.PI * 2)
      ctx.strokeStyle = withAlpha(palette.edge, 0.16)
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Brushed metal bezel
    const metal = ctx.createLinearGradient(centerX - bezel, centerY - bezel, centerX + bezel, centerY + bezel)
    metal.addColorStop(0, palette.panel)
    metal.addColorStop(0.45, palette.edge)
    metal.addColorStop(0.55, palette.edge)
    metal.addColorStop(1, palette.panel)
    ctx.beginPath()
    ctx.arc(centerX, centerY, bezel, 0, Math.PI * 2)
    ctx.strokeStyle = metal
    ctx.lineWidth = dial * 0.16
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(centerX, centerY, bezel + dial * 0.08, 0, Math.PI * 2)
    ctx.strokeStyle = withAlpha(palette.edge, 0.8)
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(centerX, centerY, bezel - dial * 0.08, 0, Math.PI * 2)
    ctx.strokeStyle = withAlpha(palette.text, 0.18)
    ctx.lineWidth = 1
    ctx.stroke()

    // Controlled specular highlight
    ctx.beginPath()
    ctx.arc(centerX, centerY, bezel, Math.PI * 1.08, Math.PI * 1.42)
    ctx.strokeStyle = withAlpha(palette.text, 0.22)
    ctx.lineWidth = 2
    ctx.stroke()

    // Bezel fasteners
    const screwRadius = dial * 0.038
    for (let screw = 0; screw < 4; screw++) {
      const screwAngle = Math.PI / 4 + screw * (Math.PI / 2)
      const screwX = centerX + Math.cos(screwAngle) * bezel
      const screwY = centerY + Math.sin(screwAngle) * bezel

      ctx.beginPath()
      ctx.arc(screwX, screwY, screwRadius, 0, Math.PI * 2)
      ctx.fillStyle = palette.panel
      ctx.fill()
      ctx.strokeStyle = withAlpha(palette.edge, 0.9)
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.save()
      ctx.translate(screwX, screwY)
      ctx.rotate(screwAngle + Math.PI / 4)
      ctx.fillStyle = withAlpha(palette.muted, 0.9)
      ctx.fillRect(-screwRadius * 0.55, -1, screwRadius * 1.1, 2)
      ctx.restore()
    }

    // Instrument face
    const face = ctx.createRadialGradient(centerX - dial * 0.25, centerY - dial * 0.3, dial * 0.1, centerX, centerY, dial)
    face.addColorStop(0, palette.panel)
    face.addColorStop(1, palette.backdrop)
    ctx.beginPath()
    ctx.arc(centerX, centerY, dial, 0, Math.PI * 2)
    ctx.fillStyle = face
    ctx.fill()
    ctx.strokeStyle = withAlpha(palette.edge, 0.9)
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(centerX, centerY, dial * 0.97, 0, Math.PI * 2)
    ctx.strokeStyle = withAlpha(palette.edge, 0.55)
    ctx.lineWidth = 1
    ctx.stroke()

    // Precision tick ring
    for (let tick = 0; tick < 72; tick++) {
      const major = tick % 6 === 0
      const tickAngle = (tick / 72) * Math.PI * 2
      const innerTick = dial * (major ? 0.845 : 0.875)
      const outerTick = dial * 0.905

      ctx.beginPath()
      ctx.moveTo(centerX + Math.cos(tickAngle) * innerTick, centerY + Math.sin(tickAngle) * innerTick)
      ctx.lineTo(centerX + Math.cos(tickAngle) * outerTick, centerY + Math.sin(tickAngle) * outerTick)
      ctx.strokeStyle = withAlpha(palette.tick, major ? 0.8 : 0.42)
      ctx.lineWidth = major ? 2 : 1
      ctx.stroke()
    }
    
    // Calibrated target sectors
    const innerSector = dial * 0.64
    const outerSector = dial * 0.8
    this.zones.forEach(zone => {
      if (!zone.active) return

      const life = zone.getLifeRatio()
      const pulse = 0.74 + 0.26 * Math.sin(Date.now() / 420)
      const sectorColor = zone.isBonus ? palette.bonus : palette.target
      const edgeAlpha = (0.24 + 0.58 * life) * pulse
      const fillAlpha = 0.08 + 0.16 * life

      ctx.save()
      ctx.beginPath()
      ctx.arc(centerX, centerY, outerSector, zone.startAngle, zone.endAngle)
      ctx.arc(centerX, centerY, innerSector, zone.endAngle, zone.startAngle, true)
      ctx.closePath()
      ctx.fillStyle = withAlpha(sectorColor, fillAlpha)
      ctx.fill()
      ctx.strokeStyle = withAlpha(sectorColor, edgeAlpha)
      ctx.lineWidth = Math.max(1.25, dial * 0.012)
      ctx.stroke()

      // Remaining-life hairline
      ctx.beginPath()
      ctx.arc(centerX, centerY, outerSector + dial * 0.022, zone.startAngle, zone.endAngle)
      ctx.strokeStyle = withAlpha(palette.muted, 0.18 + 0.22 * life)
      ctx.lineWidth = 1
      ctx.stroke()

      if (zone.isBonus) {
        const midpoint = (zone.startAngle + zone.endAngle) / 2
        const markerRadius = outerSector + dial * 0.055
        const markerSize = dial * 0.018
        const markerX = centerX + Math.cos(midpoint) * markerRadius
        const markerY = centerY + Math.sin(midpoint) * markerRadius

        ctx.beginPath()
        ctx.arc(centerX, centerY, innerSector + dial * 0.025, zone.startAngle, zone.endAngle)
        ctx.strokeStyle = withAlpha(sectorColor, 0.35 + 0.35 * life)
        ctx.lineWidth = 1
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(markerX, markerY - markerSize)
        ctx.lineTo(markerX + markerSize, markerY)
        ctx.lineTo(markerX, markerY + markerSize)
        ctx.lineTo(markerX - markerSize, markerY)
        ctx.closePath()
        ctx.fillStyle = withAlpha(sectorColor, 0.35 + 0.55 * life)
        ctx.fill()
      } else {
        for (const endpoint of [zone.startAngle, zone.endAngle]) {
          ctx.beginPath()
          ctx.moveTo(centerX + Math.cos(endpoint) * innerSector, centerY + Math.sin(endpoint) * innerSector)
          ctx.lineTo(centerX + Math.cos(endpoint) * (innerSector + dial * 0.025), centerY + Math.sin(endpoint) * (innerSector + dial * 0.025))
          ctx.strokeStyle = withAlpha(sectorColor, edgeAlpha)
          ctx.lineWidth = 2
          ctx.stroke()
        }
      }

      ctx.restore()
    })
    
    // Needle motion trail
    if (this.trail.length > 1) {
      for (let index = 0; index < this.trail.length; index++) {
        const trailAlpha = (index / this.trail.length) * 0.16
        const trailRadius = dial * 0.76
        const trailX = centerX + Math.cos(this.trail[index]) * trailRadius
        const trailY = centerY + Math.sin(this.trail[index]) * trailRadius

        ctx.beginPath()
        ctx.arc(trailX, trailY, Math.max(1, dial * 0.008), 0, Math.PI * 2)
        ctx.fillStyle = withAlpha(palette.needle, trailAlpha)
        ctx.fill()
      }
    }

    // Precision probe
    ctx.save()
    ctx.shadowColor = withAlpha(palette.edge, 0.5)
    ctx.shadowBlur = dial * 0.04
    ctx.shadowOffsetY = dial * 0.01
    ctx.translate(centerX, centerY)
    ctx.rotate(this.needle.angle)

    const shaftGradient = ctx.createLinearGradient(0, -dial * 0.02, 0, dial * 0.02)
    shaftGradient.addColorStop(0, palette.edge)
    shaftGradient.addColorStop(0.5, palette.needle)
    shaftGradient.addColorStop(1, palette.edge)
    ctx.beginPath()
    ctx.moveTo(-dial * 0.18, -dial * 0.018)
    ctx.lineTo(dial * 0.78, -dial * 0.006)
    ctx.lineTo(dial * 0.78, dial * 0.006)
    ctx.lineTo(-dial * 0.18, dial * 0.018)
    ctx.closePath()
    ctx.fillStyle = shaftGradient
    ctx.fill()

    ctx.fillStyle = withAlpha(palette.target, 0.92)
    ctx.fillRect(-dial * 0.2, -dial * 0.035, dial * 0.1, dial * 0.07)
    ctx.strokeStyle = withAlpha(palette.edge, 0.8)
    ctx.lineWidth = 1
    ctx.strokeRect(-dial * 0.2, -dial * 0.035, dial * 0.1, dial * 0.07)

    ctx.beginPath()
    ctx.moveTo(dial * 0.78, 0)
    ctx.lineTo(dial * 0.88, 0)
    ctx.strokeStyle = palette.danger
    ctx.lineWidth = Math.max(2, dial * 0.014)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(dial * 0.88, 0, Math.max(1.5, dial * 0.012), 0, Math.PI * 2)
    ctx.fillStyle = palette.danger
    ctx.fill()

    ctx.restore()

    // Machined hub
    ctx.beginPath()
    ctx.arc(centerX, centerY, dial * 0.15, 0, Math.PI * 2)
    ctx.fillStyle = palette.panel
    ctx.fill()
    ctx.strokeStyle = withAlpha(palette.edge, 0.9)
    ctx.lineWidth = 2
    ctx.stroke()

    const hub = ctx.createLinearGradient(centerX - dial * 0.1, centerY - dial * 0.1, centerX + dial * 0.1, centerY + dial * 0.1)
    hub.addColorStop(0, palette.panel)
    hub.addColorStop(1, palette.edge)
    ctx.beginPath()
    ctx.arc(centerX, centerY, dial * 0.105, 0, Math.PI * 2)
    ctx.fillStyle = hub
    ctx.fill()

    ctx.beginPath()
    ctx.arc(centerX, centerY, dial * 0.105, Math.PI * 1.1, Math.PI * 1.45)
    ctx.strokeStyle = withAlpha(palette.text, 0.28)
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(centerX, centerY, Math.max(1.5, dial * 0.018), 0, Math.PI * 2)
    ctx.fillStyle = palette.target
    ctx.fill()
    
    // Refined metallic sparks
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    this.particles.forEach(p => {
      const sparkAlpha = Math.max(0, p.life) * 0.72
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2)
      ctx.strokeStyle = withAlpha(p.color, sparkAlpha)
      ctx.lineWidth = Math.max(1, p.size * 0.32)
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(p.x, p.y, Math.max(0.5, p.size * 0.28 * p.life), 0, Math.PI * 2)
      ctx.fillStyle = withAlpha(p.color, sparkAlpha)
      ctx.fill()
    })
    ctx.restore()

    // Instrument start panel
    if (this.gameState === 'start') {
      const panelWidth = width * 0.74
      const panelHeight = height * 0.58
      const panelX = centerX - panelWidth / 2
      const panelY = centerY - panelHeight / 2
      const corner = 14 * ui

      ctx.fillStyle = withAlpha(palette.backdrop, 0.74)
      ctx.fillRect(0, 0, width, height)

      ctx.beginPath()
      ctx.moveTo(panelX + corner, panelY)
      ctx.lineTo(panelX + panelWidth - corner, panelY)
      ctx.arcTo(panelX + panelWidth, panelY, panelX + panelWidth, panelY + corner, corner)
      ctx.lineTo(panelX + panelWidth, panelY + panelHeight - corner)
      ctx.arcTo(panelX + panelWidth, panelY + panelHeight, panelX + panelWidth - corner, panelY + panelHeight, corner)
      ctx.lineTo(panelX + corner, panelY + panelHeight)
      ctx.arcTo(panelX, panelY + panelHeight, panelX, panelY + panelHeight - corner, corner)
      ctx.lineTo(panelX, panelY + corner)
      ctx.arcTo(panelX, panelY, panelX + corner, panelY, corner)
      ctx.closePath()
      ctx.fillStyle = withAlpha(palette.panel, 0.96)
      ctx.fill()
      ctx.strokeStyle = withAlpha(palette.edge, 0.85)
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = palette.text
      ctx.font = `600 ${30 * ui}px ${this.typeface}`
      ctx.fillText('PRECISION LOCKPICK', centerX, panelY + panelHeight * 0.24)

      ctx.fillStyle = palette.muted
      ctx.font = `500 ${12 * ui}px ${this.typeface}`
      ctx.fillText('CALIBRATED DIAL INSTRUMENT', centerX, panelY + panelHeight * 0.34)

      ctx.strokeStyle = withAlpha(palette.target, 0.75)
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(centerX - panelWidth * 0.18, panelY + panelHeight * 0.41)
      ctx.lineTo(centerX + panelWidth * 0.18, panelY + panelHeight * 0.41)
      ctx.stroke()

      ctx.fillStyle = palette.text
      ctx.font = `500 ${13.5 * ui}px ${this.typeface}`
      ctx.fillText('Needle rotates automatically', centerX, panelY + panelHeight * 0.51)
      ctx.fillText('Hold right click to accelerate', centerX, panelY + panelHeight * 0.60)
      ctx.fillText('Left click inside a marked sector', centerX, panelY + panelHeight * 0.69)

      ctx.fillStyle = palette.target
      ctx.font = `600 ${14 * ui}px ${this.typeface}`
      ctx.fillText('Select the dial to begin', centerX, panelY + panelHeight * 0.81)

      if (this.bestScore > 0) {
        ctx.fillStyle = palette.muted
        ctx.font = `500 ${12 * ui}px ${this.typeface}`
        ctx.fillText(`BEST ${this.bestScore}`, centerX, panelY + panelHeight * 0.90)
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
      {/* Instrument HUD */}
      <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-4 text-center shadow-sm">
          <div className="text-3xl font-semibold tabular-nums text-foreground">{score}</div>
          <div className="mt-1 text-xs font-medium tracking-[0.18em] text-muted uppercase">Score</div>
        </div>
        <div className={`rounded-xl border bg-surface p-4 text-center shadow-sm transition-colors ${
          timeRemaining <= 10 ? 'border-accent/70' : 'border-border'
        }`}>
          <div className="text-3xl font-semibold tabular-nums text-foreground">{Math.ceil(timeRemaining)}</div>
          <div className="mt-1 text-xs font-medium tracking-[0.18em] text-muted uppercase">Time</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 text-center shadow-sm">
          <div className="text-3xl font-semibold tabular-nums text-foreground">×{combo}</div>
          <div className="mt-1 text-xs font-medium tracking-[0.18em] text-muted uppercase">Combo</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 text-center shadow-sm">
          <div className="text-3xl font-semibold tabular-nums text-foreground">
            {Math.abs(speed)}
          </div>
          <div className="mt-1 text-xs font-medium tracking-[0.18em] text-muted uppercase">Tempo</div>
        </div>
      </div>

      {/* Instrument console */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="rounded-2xl border border-border bg-surface shadow-xl"
          style={{ touchAction: 'none' }}
        />

        {/* Session summary */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/80 backdrop-blur-sm">
            <div className="w-[min(90%,26rem)] space-y-6 rounded-2xl border border-border bg-surface p-8 text-center shadow-xl">
              <div className="space-y-1">
                <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">Session complete</p>
                <h2 className="text-3xl font-semibold text-foreground">Results</h2>
              </div>
              <div className="space-y-2">
                <p className="text-6xl font-semibold tabular-nums text-foreground">{finalScore}</p>
                <p className="text-sm text-muted">Final score</p>
                {userId ? (
                  isSavingScore ? (
                    <p className="text-sm text-muted">Saving score…</p>
                  ) : (
                    <p className="text-sm text-muted">Score saved to leaderboard</p>
                  )
                ) : (
                  <p className="text-sm text-muted">
                    <a href="/login" className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">Log in</a> to save your score
                  </p>
                )}
              </div>
              <button
                onClick={restart}
                className="w-full rounded-xl bg-foreground px-8 py-3 text-base font-semibold text-background shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Start new session
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Operating guide */}
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h3 className="text-lg font-semibold text-foreground">Operating guide</h3>
          <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Precision instrument</p>
        </div>
        <ul className="grid gap-3 text-sm text-muted sm:grid-cols-2">
          <li><strong className="font-semibold text-foreground">Rotation:</strong> The probe advances automatically.</li>
          <li><strong className="font-semibold text-foreground">Accelerate:</strong> Hold right click or two fingers.</li>
          <li><strong className="font-semibold text-foreground">Attempt:</strong> Left click inside a marked sector.</li>
          <li><strong className="font-semibold text-foreground">Bonus sectors:</strong> Award additional time and points.</li>
          <li><strong className="font-semibold text-foreground">Combo:</strong> Consecutive successes increase scoring.</li>
          <li><strong className="font-semibold text-foreground">Tempo:</strong> Successful attempts gradually raise speed.</li>
        </ul>
      </div>
    </div>
  )
}
