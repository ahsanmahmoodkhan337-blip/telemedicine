import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LoadingSkeleton } from '@/components/ui/loading-states'
import { CalendarDays, Clock, Video, User, Activity, Heart, Weight, Thermometer, Droplets } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getAppointments, AppointmentCard } from '@/components/booking/BookAppointmentDialog'

const mockVitals = {
  bloodPressure: [
    { date: 'Mon', sys: 120, dia: 80 },
    { date: 'Tue', sys: 118, dia: 78 },
    { date: 'Wed', sys: 122, dia: 82 },
    { date: 'Thu', sys: 125, dia: 85 },
    { date: 'Fri', sys: 119, dia: 79 },
    { date: 'Sat', sys: 121, dia: 81 },
    { date: 'Sun', sys: 117, dia: 77 },
  ],
  glucose: [
    { date: 'Mon', value: 95 },
    { date: 'Tue', value: 102 },
    { date: 'Wed', value: 98 },
    { date: 'Thu', value: 108 },
    { date: 'Fri', value: 96 },
    { date: 'Sat', value: 100 },
    { date: 'Sun', value: 94 },
  ],
}

const mockAppointments = [
  { id: '1', doctor: 'Dr. Sarah Ahmed', specialty: 'Cardiologist', date: '2026-07-10', time: '10:00 AM', status: 'scheduled' as const },
  { id: '2', doctor: 'Dr. Imran Ali', specialty: 'Physiotherapist', date: '2026-07-12', time: '2:30 PM', status: 'scheduled' as const },
  { id: '3', doctor: 'Dr. Fatima Khan', specialty: 'Nutritionist', date: '2026-07-08', time: '11:00 AM', status: 'completed' as const },
]

const vitalsSummary = [
  { icon: Heart, label: 'BP', value: '121/81', status: 'stable' as const, color: 'clinical-stable' },
  { icon: Activity, label: 'Glucose', value: '98 mg/dL', status: 'stable' as const, color: 'clinical-stable' },
  { icon: Weight, label: 'Weight', value: '72 kg', status: 'stable' as const, color: 'clinical-stable' },
  { icon: Thermometer, label: 'Temp', value: '36.8°C', status: 'stable' as const, color: 'clinical-stable' },
]

function VitalsChart({ data, dataKey, color, unit }: { data: any[]; dataKey: string; color: string; unit?: string }) {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
          />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function PatientDashboard() {
  const [loading] = useState(false)

  if (loading) return <LoadingSkeleton title="Patient Dashboard" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Patient Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, Ahmed! Here's your health summary.</p>
      </div>

      {/* Vitals Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {vitalsSummary.map((v) => (
          <Card key={v.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${v.color} bg-opacity-10`}>
                <v.icon className={`h-6 w-6 ${v.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{v.label}</p>
                <p className={`text-xl font-bold ${v.color}`}>{v.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts + Appointments */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* BP Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Blood Pressure (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <VitalsChart data={mockVitals.bloodPressure} dataKey="sys" color="#059669" />
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...mockAppointments, ...getAppointments()].slice(0, 5).map((apt) => (
              'doctorName' in apt ? (
                <AppointmentCard key={apt.id} apt={apt} />
              ) : (
                <div key={apt.id} className="flex items-start gap-3 rounded-lg border border-gray-100 dark:border-gray-700 p-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-accent-100 text-accent text-xs">
                      {apt.doctor.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{apt.doctor}</p>
                    <p className="text-xs text-gray-500">{apt.specialty}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <CalendarDays className="h-3 w-3" />
                      <span>{apt.date}</span>
                      <Clock className="h-3 w-3 ml-1" />
                      <span>{apt.time}</span>
                    </div>
                  </div>
                  <Badge variant={apt.status === 'completed' ? 'success' : 'default'}>
                    {apt.status}
                  </Badge>
                </div>
              )
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Glucose Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Glucose Levels (7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <VitalsChart data={mockVitals.glucose} dataKey="value" color="#6366f1" />
        </CardContent>
      </Card>
    </div>
  )
}