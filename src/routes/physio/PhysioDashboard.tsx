import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LoadingSkeleton, EmptyState } from '@/components/ui/loading-states'
import { Dumbbell, Camera, AlertTriangle, Target, ChevronUp, ChevronDown, Activity, User } from 'lucide-react'
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

function ROMGauge({ target, achieved }: { target: number; achieved: number }) {
  const percentage = Math.min((achieved / target) * 100, 100)
  const color = percentage >= 85 ? 'text-emerald-600' : percentage >= 60 ? 'text-amber-600' : 'text-red-600'
  const bgColor = percentage >= 85 ? 'stroke-emerald-500' : percentage >= 60 ? 'stroke-amber-500' : 'stroke-red-500'

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
        <circle
          cx="50" cy="50" r="40" fill="none"
          strokeWidth="8"
          strokeLinecap="round"
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

export default function PhysioDashboard() {
  const [patients] = useState<PatientROM[]>(mockPatientsROM)
  const [selectedPatient, setSelectedPatient] = useState<PatientROM | null>(null)
  const [cameraConnected, setCameraConnected] = useState(false)
  const [tracking, setTracking] = useState(false)
  const [loading] = useState(false)

  if (loading) return <LoadingSkeleton title="Physiotherapy Dashboard" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ROM Tracker</h1>
        <p className="text-gray-500 mt-1">Track and measure range of motion for your patients</p>
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
                onClick={() => setSelectedPatient(patient)}
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
                Target: {selectedPatient.targetDegrees}° | Current: {selectedPatient.achievedDegrees}°
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
                        <p className="text-sm font-medium">Camera Tracking</p>
                        <p className="text-xs text-gray-500">
                          {cameraConnected ? 'Camera connected' : 'Click to calibrate'}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={cameraConnected ? 'outline' : 'default'}
                      onClick={() => {
                        setCameraConnected(!cameraConnected)
                        if (!cameraConnected) {
                          setTimeout(() => {
                            toast.success('Camera calibrated')
                          }, 500)
                        }
                      }}
                    >
                      {cameraConnected ? 'Disconnect' : 'Calibrate'}
                    </Button>
                  </div>
                  {cameraConnected && (
                    <div className="mt-4 aspect-video rounded-lg bg-gray-900 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Camera className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Camera Feed Placeholder</p>
                        <p className="text-xs">Joint angle tracking overlay</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ROM Gauge */}
                <div className="flex items-center justify-center gap-8">
                  <ROMGauge target={selectedPatient.targetDegrees} achieved={selectedPatient.achievedDegrees} />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-accent" />
                      <span className="text-sm">Target: {selectedPatient.targetDegrees}°</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-secondary" />
                      <span className="text-sm">Achieved: {selectedPatient.achievedDegrees}°</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <Button size="sm" variant="outline" disabled={!tracking}>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={tracking ? 'destructive' : 'default'}
                        onClick={() => setTracking(!tracking)}
                      >
                        {tracking ? 'Stop' : 'Start'} Tracking
                      </Button>
                      <Button size="sm" variant="outline" disabled={!tracking}>
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Postural Compensation Alert */}
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

                <Button className="w-full" disabled={!cameraConnected}>
                  Save ROM Measurement
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}