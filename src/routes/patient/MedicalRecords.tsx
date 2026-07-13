import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LoadingSkeleton, EmptyState } from '@/components/ui/loading-states'
import {
  Activity,
  CalendarDays,
  Clock,
  Heart,
  Pill,
  FlaskConical,
  FileText,
  User,
  Thermometer,
  Weight,
  ChevronRight,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// ─── Mock Data ───

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
  weight: [
    { date: 'Jan', value: 74 },
    { date: 'Feb', value: 73.5 },
    { date: 'Mar', value: 72.8 },
    { date: 'Apr', value: 72 },
    { date: 'May', value: 71.5 },
    { date: 'Jun', value: 72 },
  ],
}

interface Appointment {
  id: string
  doctor: string
  specialty: string
  date: string
  time: string
  type: string
  status: 'completed' | 'cancelled' | 'no_show' | 'scheduled'
  notes: string
}

const mockAppointments: Appointment[] = [
  { id: 'a1', doctor: 'Dr. Sarah Ahmed', specialty: 'Cardiologist', date: '2026-06-28', time: '10:00 AM', type: 'Follow-up', status: 'completed', notes: 'Blood pressure stable. Continue current medication.' },
  { id: 'a2', doctor: 'Dr. Imran Ali', specialty: 'Physiotherapist', date: '2026-06-25', time: '2:30 PM', type: 'Session', status: 'completed', notes: 'ROM improved by 15 degrees in right shoulder.' },
  { id: 'a3', doctor: 'Dr. Fatima Khan', specialty: 'Nutritionist', date: '2026-06-20', time: '11:00 AM', type: 'Consultation', status: 'completed', notes: 'Diet plan adjusted. Reduce sodium intake.' },
  { id: 'a4', doctor: 'Dr. Sarah Ahmed', specialty: 'Cardiologist', date: '2026-06-15', time: '9:00 AM', type: 'Check-up', status: 'completed', notes: 'ECG normal. Schedule follow-up in 3 months.' },
  { id: 'a5', doctor: 'Dr. Ahmed Raza', specialty: 'Dentist', date: '2026-06-10', time: '4:00 PM', type: 'Cleaning', status: 'cancelled', notes: 'Patient rescheduled.' },
]

interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  doctor: string
  date: string
  status: 'active' | 'completed' | 'discontinued'
}

const mockPrescriptions: Prescription[] = [
  { id: 'RX-001', medication: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', doctor: 'Dr. Sarah Ahmed', date: '2026-06-28', status: 'active' },
  { id: 'RX-002', medication: 'Metformin 500mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '60 days', doctor: 'Dr. Imran Ali', date: '2026-06-20', status: 'active' },
  { id: 'RX-003', medication: 'Ibuprofen 400mg', dosage: '1 tablet', frequency: 'As needed', duration: '10 days', doctor: 'Dr. Fatima Khan', date: '2026-06-15', status: 'completed' },
  { id: 'RX-004', medication: 'Omeprazole 20mg', dosage: '1 capsule', frequency: 'Once daily', duration: '14 days', doctor: 'Dr. Sarah Ahmed', date: '2026-06-01', status: 'completed' },
  { id: 'RX-005', medication: 'Simvastatin 20mg', dosage: '1 tablet', frequency: 'Every night', duration: '90 days', doctor: 'Dr. Sarah Ahmed', date: '2026-05-15', status: 'discontinued' },
]

interface LabReport {
  id: string
  testName: string
  labName: string
  date: string
  status: 'completed' | 'pending' | 'cancelled'
  results?: { name: string; value: string; range: string; flag: 'normal' | 'high' | 'low' }[]
}

const mockLabReports: LabReport[] = [
  {
    id: 'L-001', testName: 'Complete Blood Count (CBC)', labName: 'Chughtai Lab', date: '2026-06-28', status: 'completed',
    results: [
      { name: 'WBC', value: '7.2', range: '4.0-11.0', flag: 'normal' },
      { name: 'RBC', value: '5.1', range: '4.5-5.5', flag: 'normal' },
      { name: 'Hemoglobin', value: '14.2', range: '13.0-17.0', flag: 'normal' },
      { name: 'Platelets', value: '250', range: '150-400', flag: 'normal' },
    ],
  },
  {
    id: 'L-002', testName: 'Lipid Profile', labName: 'Zeenat Lab', date: '2026-06-28', status: 'completed',
    results: [
      { name: 'Total Cholesterol', value: '210', range: '<200', flag: 'high' },
      { name: 'LDL', value: '140', range: '<130', flag: 'high' },
      { name: 'HDL', value: '45', range: '>40', flag: 'normal' },
      { name: 'Triglycerides', value: '150', range: '<150', flag: 'normal' },
    ],
  },
  {
    id: 'L-003', testName: 'HbA1c', labName: 'Chughtai Lab', date: '2026-06-20', status: 'completed',
    results: [
      { name: 'HbA1c', value: '6.8', range: '<5.7', flag: 'high' },
    ],
  },
  {
    id: 'L-004', testName: 'Vitamin D', labName: 'Zeenat Lab', date: '2026-06-15', status: 'pending',
  },
]

// ─── Vitals Chart Component ───

function VitalsChart({ data, dataKey, color, label }: { data: any[]; dataKey: string; color: string; label: string }) {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Main Component ───

interface MedicalRecordsProps {
  isDoctorView?: boolean
  patientName?: string
}

export default function MedicalRecords({ isDoctorView = false, patientName = 'Ahmed Raza' }: MedicalRecordsProps) {
  const [loading] = useState(false)

  if (loading) return <LoadingSkeleton title="Medical Records" />

  const activePrescriptions = mockPrescriptions.filter(p => p.status === 'active')
  const completedAppointments = mockAppointments.filter(a => a.status === 'completed')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isDoctorView ? `Medical Records — ${patientName}` : 'My Medical Records'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isDoctorView ? `Viewing records for ${patientName}` : 'View your complete medical history'}
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview" className="gap-1.5"><Activity className="h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="appointments" className="gap-1.5"><CalendarDays className="h-4 w-4" /> Appointments</TabsTrigger>
          <TabsTrigger value="prescriptions" className="gap-1.5"><Pill className="h-4 w-4" /> Prescriptions</TabsTrigger>
          <TabsTrigger value="lab-reports" className="gap-1.5"><FlaskConical className="h-4 w-4" /> Lab Reports</TabsTrigger>
          <TabsTrigger value="vitals" className="gap-1.5"><Heart className="h-4 w-4" /> Vitals History</TabsTrigger>
        </TabsList>

        {/* ─── Overview Tab ─── */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <CalendarDays className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{completedAppointments.length}</p>
                <p className="text-xs text-gray-500">Total Visits</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Pill className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{activePrescriptions.length}</p>
                <p className="text-xs text-gray-500">Active Prescriptions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <FlaskConical className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{mockLabReports.length}</p>
                <p className="text-xs text-gray-500">Lab Reports</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">121/81</p>
                <p className="text-xs text-gray-500">Latest BP</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Appointments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockAppointments.slice(0, 3).map((apt) => (
                  <div key={apt.id} className="flex items-start gap-3 rounded-lg border border-gray-100 dark:border-gray-700 p-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {apt.doctor.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{apt.doctor}</p>
                      <p className="text-xs text-gray-500">{apt.specialty} · {apt.type}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <CalendarDays className="h-3 w-3" />
                        <span>{apt.date}</span>
                        <Clock className="h-3 w-3 ml-1" />
                        <span>{apt.time}</span>
                      </div>
                    </div>
                    <Badge variant={apt.status === 'completed' ? 'success' : apt.status === 'cancelled' ? 'destructive' : 'default'}>
                      {apt.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Active Prescriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active Prescriptions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {activePrescriptions.length === 0 ? (
                  <EmptyState title="No active prescriptions" description="" />
                ) : (
                  activePrescriptions.map((rx) => (
                    <div key={rx.id} className="flex items-center gap-3 rounded-lg border border-gray-100 dark:border-gray-700 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <Pill className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{rx.medication}</p>
                        <p className="text-xs text-gray-500">{rx.dosage} · {rx.frequency} · {rx.duration}</p>
                        <p className="text-xs text-gray-400">Prescribed by {rx.doctor}</p>
                      </div>
                      <Badge variant="success" className="bg-emerald-100 text-emerald-700">Active</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Appointments Tab ─── */}
        <TabsContent value="appointments" className="space-y-4">
          {mockAppointments.length === 0 ? (
            <EmptyState title="No appointments" description="No appointment history found." icon={<CalendarDays className="h-12 w-12" />} />
          ) : (
            mockAppointments.map((apt) => (
              <Card key={apt.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {apt.doctor.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{apt.doctor}</p>
                          <p className="text-xs text-gray-500">{apt.specialty} · {apt.type}</p>
                        </div>
                        <Badge variant={apt.status === 'completed' ? 'success' : apt.status === 'cancelled' ? 'destructive' : 'warning'}>
                          {apt.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {apt.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {apt.time}</span>
                      </div>
                      {apt.notes && (
                        <div className="mt-2 rounded-lg bg-gray-50 dark:bg-slate-800/50 p-2.5">
                          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                            <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                            {apt.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ─── Prescriptions Tab ─── */}
        <TabsContent value="prescriptions" className="space-y-4">
          {mockPrescriptions.length === 0 ? (
            <EmptyState title="No prescriptions" description="No prescription history found." icon={<Pill className="h-12 w-12" />} />
          ) : (
            mockPrescriptions.map((rx) => (
              <Card key={rx.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      rx.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                      rx.status === 'completed' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <Pill className={`h-5 w-5 ${
                        rx.status === 'active' ? 'text-emerald-600' :
                        rx.status === 'completed' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{rx.medication}</p>
                          <p className="text-xs text-gray-500">{rx.dosage} · {rx.frequency} · {rx.duration}</p>
                        </div>
                        <Badge variant={rx.status === 'active' ? 'success' : rx.status === 'completed' ? 'default' : 'secondary'}>
                          {rx.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {rx.doctor}</span>
                        <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {rx.date}</span>
                        <span className="font-mono text-xs text-gray-300">{rx.id}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ─── Lab Reports Tab ─── */}
        <TabsContent value="lab-reports" className="space-y-4">
          {mockLabReports.length === 0 ? (
            <EmptyState title="No lab reports" description="No lab reports found." icon={<FlaskConical className="h-12 w-12" />} />
          ) : (
            mockLabReports.map((lab) => (
              <Card key={lab.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FlaskConical className="h-4 w-4 text-primary" />
                        {lab.testName}
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-0.5">{lab.labName} · {lab.date}</p>
                    </div>
                    <Badge variant={lab.status === 'completed' ? 'success' : 'warning'}>
                      {lab.status}
                    </Badge>
                  </div>
                </CardHeader>
                {lab.results && lab.status === 'completed' && (
                  <CardContent>
                    <div className="rounded-lg border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                      {lab.results.map((r, idx) => (
                        <div key={idx} className="flex items-center justify-between px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-900 dark:text-white">{r.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{r.value}</span>
                            <span className="text-xs text-gray-400">{r.range}</span>
                            {r.flag === 'high' && <Badge variant="destructive" className="text-[10px] h-5">High</Badge>}
                            {r.flag === 'low' && <Badge variant="warning" className="text-[10px] h-5">Low</Badge>}
                            {r.flag === 'normal' && <Badge variant="success" className="text-[10px] h-5 bg-emerald-100 text-emerald-700">Normal</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
                {lab.status === 'pending' && (
                  <CardContent>
                    <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/10 p-3">
                      <Clock className="h-4 w-4 text-amber-500" />
                      <p className="text-sm text-amber-700 dark:text-amber-400">Results pending — check back later</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        {/* ─── Vitals History Tab ─── */}
        <TabsContent value="vitals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Blood Pressure (7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <VitalsChart data={mockVitals.bloodPressure} dataKey="sys" color="#059669" label="Systolic" />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Glucose Levels (7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <VitalsChart data={mockVitals.glucose} dataKey="value" color="#6366f1" label="Glucose" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Weight Trend (6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <VitalsChart data={mockVitals.weight} dataKey="value" color="#f59e0b" label="Weight" />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900 dark:text-white">121/81</p>
                <p className="text-xs text-gray-500">Latest BP</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Activity className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900 dark:text-white">98 mg/dL</p>
                <p className="text-xs text-gray-500">Latest Glucose</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Weight className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900 dark:text-white">72 kg</p>
                <p className="text-xs text-gray-500">Latest Weight</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Thermometer className="h-5 w-5 text-red-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900 dark:text-white">36.8°C</p>
                <p className="text-xs text-gray-500">Latest Temp</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}