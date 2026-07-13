import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSkeleton } from '@/components/ui/loading-states'
import {
  ChevronLeft,
  User,
  CalendarDays,
  Clock,
  Pill,
  FlaskConical,
  Heart,
  Activity,
  Stethoscope,
  FileText,
  Phone,
  MapPin,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
} from 'lucide-react'
import MedicalRecords from '@/routes/patient/MedicalRecords'

// Mock patient data
interface PatientInfo {
  id: string
  name: string
  age: number
  gender: string
  phone: string
  city: string
  bloodGroup: string
  condition: string
  lastVisit: string
  upcomingAppointment: string
}

const MOCK_PATIENT: PatientInfo = {
  id: 'p1',
  name: 'Ahmed Raza',
  age: 35,
  gender: 'Male',
  phone: '+92-300-1234567',
  city: 'Karachi',
  bloodGroup: 'B+',
  condition: 'Hypertension',
  lastVisit: '2026-06-28',
  upcomingAppointment: '2026-07-10',
}

export default function PatientDetailPage() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [loading] = useState(false)

  if (loading) return <LoadingSkeleton title="Patient Details" />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/doctor/dashboard')} className="h-8 w-8">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{MOCK_PATIENT.name}</h1>
            <p className="text-gray-500 mt-1">Patient ID: {patientId || MOCK_PATIENT.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate('/doctor/prescriptions')}>
            <Pill className="h-4 w-4" /> Write Prescription
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <MessageSquare className="h-4 w-4" /> Message
          </Button>
        </div>
      </div>

      {/* Patient Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-white text-lg">
                {MOCK_PATIENT.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Age / Gender</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{MOCK_PATIENT.age} yrs · {MOCK_PATIENT.gender}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Blood Group</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{MOCK_PATIENT.bloodGroup}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-gray-400" /> {MOCK_PATIENT.phone}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">City</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" /> {MOCK_PATIENT.city}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm">
              <Stethoscope className="h-4 w-4 text-primary" />
              <span className="text-gray-500">Primary Condition:</span>
              <span className="font-medium text-slate-900 dark:text-white">{MOCK_PATIENT.condition}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Last Visit:</span>
              <span className="font-medium">{MOCK_PATIENT.lastVisit}</span>
            </div>
            <Badge variant="success" className="gap-1">
              <CheckCircle className="h-3 w-3" /> Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Medical Records - Reuse the MedicalRecords component */}
      <MedicalRecords isDoctorView={true} patientName={MOCK_PATIENT.name} />
    </div>
  )
}