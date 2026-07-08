import { useState, useRef, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LoadingSkeleton, EmptyState } from '@/components/ui/loading-states'
import {
  Dumbbell, Camera, AlertTriangle, Target, ChevronUp, ChevronDown,
  Activity, User, RotateCcw, Crosshair, CheckCircle2, MousePointerClick,
  GripHorizontal, Ruler
} from 'lucide-react'
import { toast } from 'sonner'

interface PatientROM {
  id: string
  name: string
  joint: string
  targetDegrees: number
  achievedDegrees: number
  compensationDetected: boolean
}

const mockPatientsROM: PatientROM[] = [
  { id: '1', name: 'Ahmed Raza', joint: 'Right Shoulder Flexion', targetDegrees: 180, achievedDegrees: 155, compensationDetected: false },
  { id: '2', name: 'Sana Tariq', joint: 'Left Knee Extension', targetDegrees: 0, achievedDegrees: 12, compensationDetected: true },
  { id: '3', name: 'Bilal Khan', joint: 'Cervical Rotation', targetDegrees: 80, achievedDegrees: 65, compensationDetected: false },
]

type CanvasPoint = { x: number; y: number } | null

// ─── Angle calculation from 3 points ───────────────────────────────────────
function calculateAngle(p1: CanvasPoint, center: CanvasPoint, p2: CanvasPoint): number {
  if (!p1 || !center || !p2) return 0
  const v1 = { x: p1.x - center.x, y: p1.y - center.y }
  const v2 = { x: p2.x - center.x, y: p2.y - center.y }
  const dot = v1.x * v2.x + v1.y * v2.y
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y)
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y)
  if (mag1 === 0 || mag2 === 0) return 0
  const cos = Math.max(-1, Math.min(1, dot / (mag1 * mag2)))
  return Math.round(Math.acos(cos) * (180 / Math.PI))
}

// ─── SVG Arc path helper ────────────────────────────────────────────────────
function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = {
    x: cx + r * Math.cos((startAngle * Math.PI) / 180),
    y: cy + r * Math.sin((startAngle * Math.PI) / 180),
  }
  const end = {
    x: cx + r * Math.cos((endAngle * Math.PI) / 180),
    y: cy + r * Math.sin((endAngle * Math.PI) / 180),
  }
  const large = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`
}

// ─── ROM Gauge ──────────────────────────────────────────────────────────────
function ROMGauge({ target, achieved }: { target: number; achieved: number }) {
  const percentage = target > 0 ? Math.min((achieved / target) * 100, 100) : 0
  const color = percentage >= 85 ? 'text-emerald-600' : percentage >= 60 ? 'text-amber-600' : 'text-red-600'
  const bgColor = percentage >= 85 ? 'stroke-emerald-500' : percentage >= 60 ? 'stroke-amber-500' : 'stroke-red-500'

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
        <circle
          cx="50" cy="50" r="40" fill="none"
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 40}`}
          strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
          className={bgColor}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-xl font-bold ${color}`}>{achieved}°</span>
        <span className="text-xs text-gray-400">/ {target}°</span>
      </div>
    </div>
  )
}

// ─── Joint Angle Canvas Overlay ─────────────────────────────────────────────
function JointAngleCanvas({
  onAngleCalculated,
  tracking,
  canvasWidth = 400,
  canvasHeight = 320,
}: {
  onAngleCalculated: (angle: number) => void
  tracking: boolean
  canvasWidth?: number
  canvasHeight?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [points, setPoints] = useState<(CanvasPoint)[]>([null, null, null])
  const [calculatedAngle, setCalculatedAngle] = useState(0)
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  const jointLabels = ['Joint Center', 'Proximal Ref', 'Distal Ref']
  const jointColors = ['#059669', '#6366f1', '#dc2626']

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const cx = w / 2
    const cy = h / 2

    // Clear
    ctx.clearRect(0, 0, w, h)

    // Background grid
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    for (let x = 0; x <= w; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
    }
    for (let y = 0; y <= h; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }

    // Draw body outline placeholder
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    // Simple body outline (head circle + torso)
    ctx.beginPath(); ctx.arc(cx, 40, 20, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx - 15, 60); ctx.lineTo(cx - 20, 140); ctx.lineTo(cx - 40, 180); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx + 15, 60); ctx.lineTo(cx + 20, 140); ctx.lineTo(cx + 40, 180); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, 60); ctx.lineTo(cx, 160); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, 160); ctx.lineTo(cx - 30, 200); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, 160); ctx.lineTo(cx + 30, 200); ctx.stroke()
    ctx.setLineDash([])

    // Draw lines between points
    const [p1, center, p2] = points
    if (center && p1) {
      ctx.beginPath(); ctx.moveTo(center.x, center.y); ctx.lineTo(p1.x, p1.y)
      ctx.strokeStyle = jointColors[1]; ctx.lineWidth = 3; ctx.stroke()
    }
    if (center && p2) {
      ctx.beginPath(); ctx.moveTo(center.x, center.y); ctx.lineTo(p2.x, p2.y)
      ctx.strokeStyle = jointColors[2]; ctx.lineWidth = 3; ctx.stroke()
    }

    // Draw angle arc
    if (p1 && center && p2) {
      const angle1 = Math.atan2(p1.y - center.y, p1.x - center.x) * (180 / Math.PI)
      const angle2 = Math.atan2(p2.y - center.y, p2.x - center.x) * (180 / Math.PI)
      const startAngle = Math.min(angle1, angle2)
      const endAngle = Math.max(angle1, angle2)
      const arcR = 40

      ctx.beginPath()
      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180
      ctx.arc(center.x, center.y, arcR, startRad, endRad)
      ctx.strokeStyle = '#059669'
      ctx.lineWidth = 3
      ctx.stroke()

      // Angle label
      const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180)
      const labelR = 55
      ctx.fillStyle = '#059669'
      ctx.font = 'bold 14px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${calculatedAngle}°`, center.x + labelR * Math.cos(midAngle), center.y + labelR * Math.sin(midAngle))
    }

    // Draw points
    points.forEach((pt, i) => {
      if (!pt) return
      ctx.beginPath()
      ctx.arc(pt.x, pt.y, i === 0 ? 8 : 6, 0, Math.PI * 2)
      ctx.fillStyle = jointColors[i]
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Label
      ctx.fillStyle = jointColors[i]
      ctx.font = '11px Inter, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(jointLabels[i], pt.x + 12, pt.y + 4)
    })
  }, [points, calculatedAngle, jointLabels, jointColors])

  useEffect(() => {
    draw()
  }, [draw])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!tracking) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    // Find which point to set — first null, or prompt to clear
    const nullIdx = points.findIndex(p => p === null)
    if (nullIdx >= 0) {
      const newPoints = [...points]
      newPoints[nullIdx] = { x: x * scaleX, y: y * scaleY }
      setPoints(newPoints)

      // If all 3 points set, calculate angle
      if (nullIdx === 2 || (newPoints[0] && newPoints[1] && newPoints[2])) {
        const angle = calculateAngle(newPoints[0], newPoints[1], newPoints[2])
        setCalculatedAngle(angle)
        onAngleCalculated(angle)
      }
    }
  }

  const handleClearPoints = () => {
    setPoints([null, null, null])
    setCalculatedAngle(0)
    onAngleCalculated(0)
  }

  const pointCount = points.filter(p => p !== null).length

  return (
    <div className="space-y-3">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onClick={handleCanvasClick}
          className={`w-full rounded-lg border-2 ${
            tracking
              ? 'border-accent cursor-crosshair'
              : 'border-gray-200 dark:border-gray-700 cursor-default'
          } bg-white dark:bg-slate-900`}
        />
        {!tracking && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 dark:bg-black/60 rounded-lg">
            <div className="text-center text-white">
              <MousePointerClick className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Start Tracking to Enable</p>
              <p className="text-xs opacity-70">Click on the canvas to place joint markers</p>
            </div>
          </div>
        )}
      </div>

      {/* Point status */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          {jointLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: points[i] ? jointColors[i] : '#d1d5db' }}
              />
              <span className={points[i] ? 'text-slate-900 dark:text-white' : 'text-gray-400'}>
                {label} {points[i] ? '✓' : ''}
              </span>
            </div>
          ))}
        </div>
        <Button size="sm" variant="ghost" onClick={handleClearPoints} disabled={pointCount === 0}>
          <RotateCcw className="h-3.5 w-3.5 mr-1" /> Clear
        </Button>
      </div>

      {pointCount === 3 && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-2">
          <Ruler className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Joint Angle: {calculatedAngle}°
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function PhysioDashboard() {
  const [patients] = useState<PatientROM[]>(mockPatientsROM)
  const [selectedPatient, setSelectedPatient] = useState<PatientROM | null>(null)
  const [cameraConnected, setCameraConnected] = useState(false)
  const [tracking, setTracking] = useState(false)
  const [loading] = useState(false)
  const [currentAngle, setCurrentAngle] = useState(0)
  const [savedReadings, setSavedReadings] = useState<{ joint: string; angle: number; time: string }[]>([])

  if (loading) return <LoadingSkeleton title="Physiotherapy Dashboard" />

  const handleAngleCalculated = (angle: number) => {
    setCurrentAngle(angle)
  }

  const handleSaveReading = () => {
    if (!selectedPatient) return
    const reading = {
      joint: selectedPatient.joint,
      angle: currentAngle,
      time: new Date().toLocaleTimeString(),
    }
    setSavedReadings(prev => [reading, ...prev])
    toast.success(`ROM measurement saved: ${currentAngle}°`)
  }

  const handleAdjustAngle = (delta: number) => {
    const newAngle = Math.max(0, Math.min(360, currentAngle + delta))
    setCurrentAngle(newAngle)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ROM Tracker</h1>
        <p className="text-gray-500 mt-1">Track and measure range of motion using interactive canvas</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Patients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {patients.map((patient) => (
              <button
                key={patient.id}
                className={`w-full text-left rounded-lg p-3 border transition-colors ${
                  selectedPatient?.id === patient.id
                    ? 'border-accent bg-accent-50 dark:bg-accent-950/30'
                    : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
                onClick={() => { setSelectedPatient(patient); setCurrentAngle(patient.achievedDegrees) }}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-secondary text-white text-xs">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{patient.name}</p>
                    <p className="text-xs text-gray-500">{patient.joint}</p>
                  </div>
                  {patient.compensationDetected && (
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* ROM Measurement */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              {selectedPatient ? `ROM: ${selectedPatient.joint}` : 'Select a Patient'}
            </CardTitle>
            {selectedPatient && (
              <CardDescription>
                Target: {selectedPatient.targetDegrees}° | Current: {currentAngle}°
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {!selectedPatient ? (
              <EmptyState title="No patient selected" description="Select a patient from the list to begin ROM tracking." icon={<Dumbbell className="h-12 w-12" />} />
            ) : (
              <div className="space-y-6">
                {/* Camera Calibration */}
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Camera className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Interactive Canvas Tracking</p>
                        <p className="text-xs text-gray-500">
                          {tracking ? 'Click on the canvas to place 3 joint markers' : 'Start tracking to enable the canvas'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={cameraConnected ? 'outline' : 'default'}
                        onClick={() => {
                          setCameraConnected(!cameraConnected)
                          if (!cameraConnected) {
                            setTimeout(() => toast.success('Camera calibrated'), 500)
                          }
                        }}
                      >
                        {cameraConnected ? 'Disconnect' : 'Calibrate'}
                      </Button>
                      <Button
                        size="sm"
                        variant={tracking ? 'destructive' : 'secondary'}
                        onClick={() => {
                          setTracking(!tracking)
                          if (!tracking) toast.success('Canvas tracking started — place markers')
                        }}
                      >
                        {tracking ? 'Stop' : 'Start'} Tracking
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <JointAngleCanvas onAngleCalculated={handleAngleCalculated} tracking={tracking} />
                  </div>
                </div>

                {/* ROM Gauge + Controls */}
                <div className="flex items-center justify-center gap-8">
                  <ROMGauge target={selectedPatient.targetDegrees} achieved={currentAngle} />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-accent" />
                      <span className="text-sm">Target: {selectedPatient.targetDegrees}°</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-secondary" />
                      <span className="text-sm">Measured: {currentAngle}°</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <Button size="sm" variant="outline" onClick={() => handleAdjustAngle(-5)}>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium w-12 text-center">{currentAngle}°</span>
                      <Button size="sm" variant="outline" onClick={() => handleAdjustAngle(5)}>
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Compensation Alert */}
                {selectedPatient.compensationDetected && (
                  <div className="flex items-start gap-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Postural Compensation Detected</p>
                      <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                        The patient is compensating with shoulder elevation. Cue for scapular retraction and reassess.
                      </p>
                    </div>
                  </div>
                )}
                {!selectedPatient.compensationDetected && (
                  <div className="flex items-start gap-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4">
                    <Activity className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">No Compensation Detected</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                        Movement pattern is clean. No postural compensations observed.
                      </p>
                    </div>
                  </div>
                )}

                <Button className="w-full" onClick={handleSaveReading} disabled={currentAngle === 0}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Save ROM Measurement ({currentAngle}°)
                </Button>

                {/* Saved Readings History */}
                {savedReadings.length > 0 && (
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                    <p className="text-sm font-medium mb-2">Recent Measurements</p>
                    <div className="space-y-1.5">
                      {savedReadings.slice(0, 5).map((r, i) => (
                        <div key={i} className="flex items-center justify-between text-xs text-gray-500">
                          <span>{r.joint}</span>
                          <span className="font-medium text-slate-900 dark:text-white">{r.angle}°</span>
                          <span>{r.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}