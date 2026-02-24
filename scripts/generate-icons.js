const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const iconsDir = path.join(__dirname, '../public/icons')

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

function generateIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background - dark navy
  ctx.fillStyle = '#0f172a'
  ctx.beginPath()
  const radius = size * 0.2
  ctx.moveTo(radius, 0)
  ctx.lineTo(size - radius, 0)
  ctx.quadraticCurveTo(size, 0, size, radius)
  ctx.lineTo(size, size - radius)
  ctx.quadraticCurveTo(size, size, size - radius, size)
  ctx.lineTo(radius, size)
  ctx.quadraticCurveTo(0, size, 0, size - radius)
  ctx.lineTo(0, radius)
  ctx.quadraticCurveTo(0, 0, radius, 0)
  ctx.closePath()
  ctx.fill()

  // Purple gradient circle glow
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size * 0.4)
  gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)')
  gradient.addColorStop(1, 'rgba(139, 92, 246, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  // Draw lightning bolt (dumbbell-ish) in purple
  ctx.strokeStyle = '#8B5CF6'
  ctx.lineWidth = size * 0.07
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Bold "T" for Trainer
  const cx = size / 2
  const cy = size / 2
  const unit = size * 0.22

  // Horizontal bar of T
  ctx.beginPath()
  ctx.moveTo(cx - unit, cy - unit * 0.5)
  ctx.lineTo(cx + unit, cy - unit * 0.5)
  ctx.stroke()

  // Vertical bar of T
  ctx.beginPath()
  ctx.moveTo(cx, cy - unit * 0.5)
  ctx.lineTo(cx, cy + unit * 1.1)
  ctx.stroke()

  // Small dumbbell circles at sides of T top
  ctx.fillStyle = '#7c3aed'
  ctx.beginPath()
  ctx.arc(cx - unit, cy - unit * 0.5, size * 0.055, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx + unit, cy - unit * 0.5, size * 0.055, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx, cy + unit * 1.1, size * 0.055, 0, Math.PI * 2)
  ctx.fill()

  const buffer = canvas.toBuffer('image/png')
  const filename = path.join(iconsDir, `icon-${size}x${size}.png`)
  fs.writeFileSync(filename, buffer)
  console.log(`✅ Generated ${filename}`)
}

sizes.forEach(generateIcon)
console.log('🎉 All PWA icons generated!')
