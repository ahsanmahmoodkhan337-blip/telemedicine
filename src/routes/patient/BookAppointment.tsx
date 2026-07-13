import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  CalendarDays,
  Clock,
  Video,
  MapPin,
  Star,
  DollarSign,
  Stethoscope,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'

/* ─── Types ─── */

export interface BookedAppointment {
  id: string
  doctorId: string
  doctorName: string
  specialty: string
  city: string
  fee: number
  date: string
  time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  bookedAt: string
  patientName: string
}

interface Provider {
  id: string
  name: string
  specialty: string
  city: string
  fee: number
  rating: number
  language: string[]
  verified: boolean
}

const STORAGE_KEY = 'appointments_booked'

/* ─── Mock data ─── */

const MOCK_PROVIDERS: Provider[] = [
  { id: '1', name: 'Dr. Sarah Ahmed', specialty: 'Cardiologist', city: 'Karachi', fee: 1500, rating: 4.8, language: ['English', 'Urdu'], verified: true },
  { id: '2', name: 'Dr. Imran Ali', specialty: 'Physiotherapist', city: 'Lahore', fee: 1200, rating: 4.6, language: ['Urdu', 'Punjabi'], verified: true },
  { id: '3', name: 'Dr. Fatima Khan', specialty: 'Nutritionist', city: 'Islamabad', fee: 1000, rating: 4.9, language: ['English', 'Urdu'], verified: true },
  { id: '4', name: 'Dr. Usman Malik', specialty: 'General Physician', city: 'Karachi', fee: 800, rating: 4.5, language: ['English', 'Urdu', 'Sindhi'], verified: true },
  { id: '5', name: 'Dr. Ayesha Rizvi', specialty: 'Dermatologist', city: 'Lahore', fee: 2000, rating: 4.7, language: ['English', 'Urdu'], verified: false },
  { id: '6', name: 'Dr. Hassan Shah', specialty: 'Cardiologist', city: 'Lahore', fee: 1800, rating: 4.3, language: ['Urdu', 'Punjabi'], verified: true },
]

/* Generate time slots for a given date */
function generateTimeSlots(dateStr: string): string[] {
  const booked = getAppointments().filter((a) => a.date === dateStr).map((a) => a.time)
  const slots: string[] = []
  for (let h = 9; h < 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      const time = `${h > 12 ? h - 12 : h}:${m === 0 ? '00' : '30'} ${h >= 12 ? 'PM' : 'AM'}`
      if (!booked.includes(time)) slots.push(time)
    }
  }
  return slots
}

/* Generate next 7 days */
function getNext7Days(): { dateStr: string; label: string }[] {
  const days: { dateStr: string; label: string }[] = []
  const now = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    days.push({ dateStr, label })
  }
  return days
}

/* Storage helpers */
export function getAppointments(): BookedAppointment[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

export function saveAppointment(apt: BookedAppointment): void {
  const all = getAppointments()
  all.push(apt)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

/* ─── Booking Dialog ─── */

interface BookingDialogProps {
  provider: Provider | null
  open: boolean
  onClose: () => void
}

function BookingDialog({ provider, open, onClose }: BookingDialogProps) {
  const [step, setStep] = useState<'select' | 'confirm' | 'done'>('select')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const days = getNext7Days()

  useEffect(() => {
    if (open) {
      setStep('select')
      setSelectedDate(days[0]?.dateStr || '')
      setSelectedTime('')
    }
  }, [open])

  if (!provider) return null

  const slots = generateTimeSlots(selectedDate)

  const handleConfirm = () => {
    const apt: BookedAppointment = {
      id: `apt-${Date.now()}`,
      doctorId: provider.id,
      doctorName: provider.name,
      specialty: provider.specialty,
      city: provider.city,
      fee: provider.fee,
      date: selectedDate,
      time: selectedTime,
      status: 'scheduled',
      bookedAt: new Date().toISOString(),
      patientName: 'Ahmed Raza',
    }
    saveAppointment(apt)
    setStep('done')
    toast.success(`Appointment booked with ${provider.name}`)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        {step === 'done' ? (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20 mb-4">
                <Check className="h-8 w-8 text-emerald-500" />
              </div>
              <DialogTitle className="text-xl">Appointment Booked!</DialogTitle>
              <DialogDescription>
                Your appointment with <strong>{provider.name}</strong> has been confirmed.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg bg-gray-50 dark:bg-slate-800/50 p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Doctor</span><span className="font-medium">{provider.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{selectedDate}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-medium">{selectedTime}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Fee</span><span className="font-medium">Rs. {provider.fee.toLocaleString()}</span></div>
            </div>
            <DialogFooter>
              <Button onClick={onClose} className="w-full">Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {step === 'confirm' && (
                  <button onClick={() => setStep('select')} className="p-0.5 hover:text-primary">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                <CalendarDays className="h-5 w-5 text-primary" />
                Book Appointment
              </DialogTitle>
              <DialogDescription>
                <span className="font-medium">{provider.name}</span> — {provider.specialty}
              </DialogDescription>
            </DialogHeader>

            {step === 'select' && (
              <div className="space-y-4">
                {/* Date selector */}
                <div>
                  <p className="text-sm font-medium text-[#1e293b] dark:text-white mb-2">Select Date</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {days.map((d) => (
                      <button
                        key={d.dateStr}
                        onClick={() => { setSelectedDate(d.dateStr); setSelectedTime('') }}
                        className={`flex-shrink-0 rounded-lg border-2 px-4 py-2 text-center text-sm transition-colors ${
                          selectedDate === d.dateStr
                            ? 'border-primary bg-primary-50 text-primary dark:bg-primary-900/20'
                            : 'border-[#D1D5DB] text-[#334155] hover:border-primary/50 dark:border-gray-600 dark:text-slate-300'
                        }`}
                      >
                        <p className="font-medium">{d.label.split(' ')[0]}</p>
                        {d.label.includes(',') && <p className="text-[10px]">{d.label.split(', ').slice(1).join(' ')}</p>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time slots */}
                <div>
                  <p className="text-sm font-medium text-[#1e293b] dark:text-white mb-2">Available Time</p>
                  {slots.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-4 text-center">No slots available for this date</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                      {slots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                            selectedTime === time
                              ? 'border-primary bg-primary text-white'
                              : 'border-[#D1D5DB] text-[#334155] hover:border-primary/50 dark:border-gray-600 dark:text-slate-300'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-slate-800/50 p-3 text-sm">
                  <span className="text-gray-500">Consultation Fee</span>
                  <span className="font-semibold text-[#1e293b] dark:text-white">Rs. {provider.fee.toLocaleString()}</span>
                </div>

                <Button className="w-full" disabled={!selectedDate || !selectedTime} onClick={() => setStep('confirm')}>
                  Continue <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}

            {step === 'confirm' && (
              <div className="space-y-4">
                <div className="space-y-3 rounded-lg bg-gray-50 dark:bg-slate-800/50 p-4">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Doctor</span><span className="font-medium">{provider.name}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Specialty</span><span>{provider.specialty}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Location</span><span>{provider.city}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span className="font-medium">{selectedDate}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Time</span><span className="font-medium">{selectedTime}</span></div>
                  <div className="flex justify-between text-sm border-t border-[#D1D5DB] dark:border-gray-600 pt-2 mt-2">
                    <span className="font-medium">Fee</span>
                    <span className="font-bold text-primary">Rs. {provider.fee.toLocaleString()}</span>
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setStep('select')}>Change</Button>
                  <Button onClick={handleConfirm} className="gap-1.5">
                    <Check className="h-4 w-4" /> Confirm Booking
                  </Button>
                </DialogFooter>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ─── Book Appointment Page (Route) ─── */

export default function BookAppointmentPage() {
  const navigate = useNavigate()
  // Get doctorId from URL — for now use first mock provider
  const provider = MOCK_PROVIDERS[0]

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <button onClick={() => navigate('/patient/search')} className="flex items-center gap-1 text-sm text-primary hover:underline mb-4">
          <ChevronLeft className="h-4 w-4" /> Back to Search
        </button>
        <h1 className="text-2xl font-bold text-[#1e293b] dark:text-white">Book Appointment</h1>
      </div>

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary text-lg font-bold dark:bg-primary-900/20">
            {provider.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="font-semibold text-[#1e293b] dark:text-white">{provider.name}</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5" /> {provider.specialty}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {provider.city}</span>
              <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400" /> {provider.rating}</span>
              <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> Rs. {provider.fee.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reuse the dialog's slot picker inline */}
      <BookingDialogInline provider={provider} onBooked={() => navigate('/patient/dashboard')} />
    </div>
  )
}

/* ─── Inline version (for route page) ─── */

function BookingDialogInline({ provider, onBooked }: { provider: Provider; onBooked: () => void }) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const days = getNext7Days()

  useEffect(() => { setSelectedDate(days[0]?.dateStr || '') }, [])

  const slots = generateTimeSlots(selectedDate)

  const handleConfirm = () => {
    const apt: BookedAppointment = {
      id: `apt-${Date.now()}`,
      doctorId: provider.id,
      doctorName: provider.name,
      specialty: provider.specialty,
      city: provider.city,
      fee: provider.fee,
      date: selectedDate,
      time: selectedTime,
      status: 'scheduled',
      bookedAt: new Date().toISOString(),
      patientName: 'Ahmed Raza',
    }
    saveAppointment(apt)
    setConfirmed(true)
    setTimeout(onBooked, 1500)
  }

  if (confirmed) {
    return (
      <Card className="text-center py-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20 mb-4">
          <Check className="h-8 w-8 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-[#1e293b] dark:text-white">Appointment Booked!</h2>
        <p className="text-sm text-gray-500 mt-2">Redirecting to your dashboard...</p>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Select Date & Time
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => (
            <button
              key={d.dateStr}
              onClick={() => { setSelectedDate(d.dateStr); setSelectedTime('') }}
              className={`flex-shrink-0 rounded-lg border-2 px-4 py-2 text-center text-sm transition-colors ${
                selectedDate === d.dateStr
                  ? 'border-primary bg-primary-50 text-primary dark:bg-primary-900/20'
                  : 'border-[#D1D5DB] text-[#334155] hover:border-primary/50 dark:border-gray-600 dark:text-slate-300'
              }`}
            >
              <p className="font-medium">{d.label.split(' ')[0]}</p>
              {d.label.includes(',') && <p className="text-[10px]">{d.label.split(', ').slice(1).join(' ')}</p>}
            </button>
          ))}
        </div>

        {slots.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-4 text-center">No slots available for this date</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  selectedTime === time
                    ? 'border-primary bg-primary text-white'
                    : 'border-[#D1D5DB] text-[#334155] hover:border-primary/50 dark:border-gray-600 dark:text-slate-300'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-slate-800/50 p-3 text-sm">
          <span className="text-gray-500">Consultation Fee</span>
          <span className="font-semibold text-[#1e293b] dark:text-white">Rs. {provider.fee.toLocaleString()}</span>
        </div>

        <Button className="w-full gap-1.5" disabled={!selectedDate || !selectedTime} onClick={handleConfirm}>
          <Check className="h-4 w-4" /> Confirm Booking
        </Button>
      </CardContent>
    </Card>
  )
}

/* ─── Booking Button (for PatientSearch) ─── */

export function BookAppointmentButton({ doctorId, onBook }: { doctorId: string; onBook: () => void }) {
  const provider = MOCK_PROVIDERS.find((p) => p.id === doctorId) || MOCK_PROVIDERS[0]
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button className="mt-3 w-full" size="sm" onClick={() => setOpen(true)}>
        <CalendarDays className="h-4 w-4 mr-1" /> Book Appointment
      </Button>
      <BookingDialog provider={provider} open={open} onClose={() => { setOpen(false); onBook() }} />
    </>
  )
}

/* ─── Appointment Card (for PatientDashboard and DoctorDashboard) ─── */

export function AppointmentCard({ apt }: { apt: BookedAppointment }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-100 dark:border-gray-700 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary text-xs font-bold dark:bg-primary-900/20 flex-shrink-0">
        {apt.doctorName.split(' ').map(n => n[0]).join('')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1e293b] dark:text-white truncate">{apt.doctorName}</p>
        <p className="text-xs text-gray-500">{apt.specialty}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <CalendarDays className="h-3 w-3" />
          <span>{apt.date}</span>
          <Clock className="h-3 w-3 ml-1" />
          <span>{apt.time}</span>
        </div>
      </div>
      <Badge variant="default" className="text-[10px]">{apt.status}</Badge>
    </div>
  )
}