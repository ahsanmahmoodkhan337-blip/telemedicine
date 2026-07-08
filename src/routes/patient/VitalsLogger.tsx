import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/ui/loading-states'
import { Activity, Heart, Thermometer, Weight, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { toast } from 'sonner'

type ClinicalStatus = 'danger' | 'borderline' | 'stable'

interface VitalsEntry {
  id: string
  date: string
  bp: string
  weight: number
  glucose: number
  temp: number
}

const mockHistory: VitalsEntry[] = [
  { id: '1', date: '2026-07-08', bp: '121/81', weight: 72, glucose: 98, temp: 36.8 },
  { id: '2', date: '2026-07-07', bp: '118/78', weight: 72.5, glucose: 102, temp: 37.0 },
  { id: '3', date: '2026-07-06', bp: '135/90', weight: 73, glucose: 115, temp: 36.9 },
  { id: '4', date: '2026-07-05', bp: '122/82', weight: 72.8, glucose: 95, temp: 36.7 },
]

function getClinicalStatus(
  value: number,
  ranges: { stable: [number, number]; borderline: [number, number]; danger: [number, number] }
): ClinicalStatus {
  if (value >= ranges.stable[0] && value <= ranges.stable[1]) return 'stable'
  if (value >= ranges.borderline[0] && value <= ranges.borderline[1]) return 'borderline'
  return 'danger'
}

const vitalsFields = [
  {
    id: 'bp_sys',
    label: 'Systolic BP',
    unit: 'mmHg',
    icon: Heart,
    ranges: { stable: [90, 120] as [number, number], borderline: [121, 139] as [number, number], danger: [140, 250] as [number, number] },
  },
  {
    id: 'weight',
    label: 'Weight',
    unit: 'kg',
    icon: Weight,
    ranges: { stable: [40, 100] as [number, number], borderline: [0, 0] as [number, number], danger: [0, 0] as [number, number] },
  },
  {
    id: 'glucose',
    label: 'Blood Glucose',
    unit: 'mg/dL',
    icon: Activity,
    ranges: { stable: [70, 100] as [number, number], borderline: [101, 125] as [number, number], danger: [126, 500] as [number, number] },
  },
  {
    id: 'temp',
    label: 'Temperature',
    unit: '°C',
    icon: Thermometer,
    ranges: { stable: [36.1, 37.2] as [number, number], borderline: [37.3, 38.0] as [number, number], danger: [38.1, 42] as [number, number] },
  },
]

const statusConfig = {
  stable: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', label: 'Normal' },
  borderline: { icon: Info, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30', label: 'Borderline' },
  danger: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30', label: 'High' },
}

export default function VitalsLogger() {
  const [bpSys, setBpSys] = useState('')
  const [bpDia, setBpDia] = useState('')
  const [weight, setWeight] = useState('')
  const [glucose, setGlucose] = useState('')
  const [temp, setTemp] = useState('')
  const [history] = useState<VitalsEntry[]>(mockHistory)
  const [saving, setSaving] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('Vitals logged successfully')
      setBpSys('')
      setBpDia('')
      setWeight('')
      setGlucose('')
      setTemp('')
    }, 600)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Vitals</h1>
        <p className="text-gray-500 mt-1">Log and track your daily health measurements</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Vitals Log Form */}
        <Card>
          <CardHeader>
            <CardTitle>Log New Reading</CardTitle>
            <CardDescription>Enter your vitals for today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Systolic BP (mmHg)</Label>
                  <Input
                    placeholder="120"
                    type="number"
                    value={bpSys}
                    onChange={(e) => setBpSys(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Diastolic BP (mmHg)</Label>
                  <Input
                    placeholder="80"
                    type="number"
                    value={bpDia}
                    onChange={(e) => setBpDia(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input
                  placeholder="72"
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Blood Glucose (mg/dL)</Label>
                <Input
                  placeholder="98"
                  type="number"
                  value={glucose}
                  onChange={(e) => setGlucose(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Temperature (°C)</Label>
                <Input
                  placeholder="36.8"
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Saving...' : 'Log Vitals'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Clinical Ranges Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Clinical Ranges</CardTitle>
            <CardDescription>Color-coded health indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {vitalsFields.map((field) => (
              <div key={field.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800">
                  <field.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{field.label}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge variant="success" className="text-[10px]">
                      Stable: {field.ranges.stable[0]}-{field.ranges.stable[1]} {field.unit}
                    </Badge>
                    {field.ranges.borderline[1] > 0 && (
                      <Badge variant="warning" className="text-[10px]">
                        Borderline: {field.ranges.borderline[0]}-{field.ranges.borderline[1]} {field.unit}
                      </Badge>
                    )}
                    {field.ranges.danger[1] > 0 && (
                      <Badge variant="destructive" className="text-[10px]">
                        High: {field.ranges.danger[0]}+ {field.unit}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Readings</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <EmptyState title="No readings yet" description="Start logging your vitals to see history here." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>BP</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Glucose</TableHead>
                  <TableHead>Temp</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry) => {
                  const glucoseStatus = getClinicalStatus(entry.glucose, vitalsFields[2].ranges)
                  const status = statusConfig[glucoseStatus]
                  const StatusIcon = status.icon
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.date}</TableCell>
                      <TableCell>{entry.bp}</TableCell>
                      <TableCell>{entry.weight} kg</TableCell>
                      <TableCell>{entry.glucose} mg/dL</TableCell>
                      <TableCell>{entry.temp}°C</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}