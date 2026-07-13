import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { LoadingSkeleton, EmptyState } from '@/components/ui/loading-states'
import { CalendarDays, Clock, Video, Search, User, Stethoscope } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getAppointments } from '@/routes/patient/BookAppointment'

interface Patient {
  id: string
  name: string
  age: number
  lastVisit: string
  condition: string
}

interface Appointment {
  id: string
  patientName: string
  patientAge: number
  time: string
  date: string
  type: string
  status: 'scheduled' | 'in-progress' | 'completed'
}

const mockAppointments: Appointment[] = [
  { id: '1', patientName: 'Ahmed Raza', patientAge: 35, time: '10:00 AM', date: '2026-07-10', type: 'Follow-up', status: 'scheduled' },
  { id: '2', patientName: 'Sana Tariq', patientAge: 28, time: '11:30 AM', date: '2026-07-10', type: 'New Patient', status: 'scheduled' },
  { id: '3', patientName: 'Bilal Khan', patientAge: 45, time: '2:00 PM', date: '2026-07-10', type: 'Consultation', status: 'scheduled' },
]

const mockPatients: Patient[] = [
  { id: '1', name: 'Ahmed Raza', age: 35, lastVisit: '2026-06-28', condition: 'Hypertension' },
  { id: '2', name: 'Sana Tariq', age: 28, lastVisit: '2026-07-01', condition: 'Diabetes Type 2' },
  { id: '3', name: 'Bilal Khan', age: 45, lastVisit: '2026-06-15', condition: 'Lower Back Pain' },
  { id: '4', name: 'Zainab Ali', age: 52, lastVisit: '2026-07-05', condition: 'Arthritis' },
]

export default function DoctorDashboard() {
  const [search, setSearch] = useState('')
  const [loading] = useState(false)
  const navigate = useNavigate()

  if (loading) return <LoadingSkeleton title="Doctor Dashboard" />

  const filteredPatients = mockPatients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Doctor Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome, Dr. Ahmed Khan</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-accent">{mockAppointments.length + getAppointments().length}</p>
            <p className="text-sm text-gray-500">Today's Appointments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-secondary">{mockPatients.length}</p>
            <p className="text-sm text-gray-500">Total Patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">3</p>
            <p className="text-sm text-gray-500">Pending Prescriptions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...mockAppointments, ...getAppointments().map(a => ({
              id: a.id,
              patientName: a.patientName || 'Patient',
              patientAge: 35,
              time: a.time,
              date: a.date,
              type: 'Booked',
              status: 'scheduled' as const
            }))].map((apt) => (
              <div key={apt.id} className="flex items-center gap-3 rounded-lg border border-gray-100 dark:border-gray-700 p-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-accent text-white">
                    {apt.patientName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white">{apt.patientName}</p>
                  <p className="text-xs text-gray-500">{apt.patientAge} yrs · {apt.type}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{apt.time}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={apt.status === 'completed' ? 'success' : apt.status === 'in-progress' ? 'warning' : 'default'}>
                    {apt.status}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/doctor/appointments/${apt.id}`)}>
                    <Video className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Patients</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search patients..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {filteredPatients.length === 0 ? (
              <EmptyState title="No patients found" description="" />
            ) : (
              filteredPatients.map((patient) => (
                <div key={patient.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-secondary text-white text-xs">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{patient.name}</p>
                    <p className="text-xs text-gray-400">{patient.age} yrs · {patient.condition}</p>
                  </div>
                  <span className="text-xs text-gray-400">Last: {patient.lastVisit}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}