import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  User,
  GraduationCap,
  Stethoscope,
  CalendarClock,
  FileText,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
} from 'lucide-react'

/* ─── Types ─── */

type PractitionerRole =
  | 'General Physician'
  | 'Specialist Doctor'
  | 'Dentist'
  | 'Physiotherapist'
  | 'Nutritionist'
  | 'Allied Health Expert'

type Gender = 'Male' | 'Female' | 'Non-binary' | 'Prefer not to disclose'

interface Clinic {
  id: string
  name: string
  city: string
  address: string
  floor: string
  fee: string
  slotDuration: string
}

interface TimeBlock {
  id: string
  day: string
  start: string
  end: string
  breakStart: string
  breakEnd: string
  hasBreak: boolean
  locationId: string
}

export interface PractitionerFormData {
  fullName: string
  email: string
  phone: string
  password: string
  gender: Gender | ''
  cnic: string
  role: PractitionerRole | ''
  licensingBody: string
  licenseNumber: string
  highestDegree: string
  experience: string
  subSpecialties: string
  onlineConsult: boolean
  onlineFee: string
  onlineDiscountedFee: string
  onlineDiscountedToggle: boolean
  onlineSlotDuration: string
  clinics: Clinic[]
  schedules: TimeBlock[]
}

const STORAGE_KEY = 'practitioner_registration_data'

const STEPS = [
  { id: 0, label: 'Basic Info', icon: User },
  { id: 1, label: 'Credentials', icon: GraduationCap },
  { id: 2, label: 'Locations', icon: Stethoscope },
  { id: 3, label: 'Schedule', icon: CalendarClock },
  { id: 4, label: 'Documents', icon: FileText },
]

const ROLES: PractitionerRole[] = [
  'General Physician',
  'Specialist Doctor',
  'Dentist',
  'Physiotherapist',
  'Nutritionist',
  'Allied Health Expert',
]

const GENDERS: Gender[] = ['Male', 'Female', 'Non-binary', 'Prefer not to disclose']

const DEGREES: Record<string, string[]> = {
  'General Physician': ['MBBS', 'FCPS', 'MD', 'MS'],
  'Specialist Doctor': ['MBBS', 'FCPS', 'MD', 'MS', 'MRCP', 'FRCS'],
  Dentist: ['BDS', 'FCPS', 'MDS'],
  Physiotherapist: ['DPT', 'PPDPT', 'MSPT'],
  Nutritionist: ['DDNS', 'MSc Nutrition', 'PhD Nutrition'],
  'Allied Health Expert': ['BS', 'MS', 'PhD'],
}

const LICENSING_BODIES: Record<string, string[]> = {
  'General Physician': ['PMDC'],
  'Specialist Doctor': ['PMDC'],
  Dentist: ['PMDC'],
  Physiotherapist: ['NCAH'],
  Nutritionist: ['PNDS', 'NCAH'],
  'Allied Health Expert': ['PCP'],
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SLOT_DURATIONS = ['10', '15', '20', '30', '45', '60']

/* ─── Helpers ─── */

function formatCNIC(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 13)
  if (d.length <= 5) return d
  if (d.length <= 12) return `${d.slice(0, 5)}-${d.slice(5)}`
  return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}`
}

function formatPhone(value: string): string {
  const d = value.replace(/\D/g, '').replace(/^92/, '')
  if (d.length <= 3) return `+92-${d}`
  if (d.length <= 6) return `+92-${d.slice(0, 3)}-${d.slice(3)}`
  return `+92-${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6, 10)}`
}

function pwStrength(pw: string): { score: number; label: string; color: string } {
  let s = 0
  if (pw.length >= 8) s++
  if (/[a-z]/.test(pw)) s++
  if (/[A-Z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^a-zA-Z0-9]/.test(pw)) s++
  if (s <= 1) return { score: s, label: 'Weak', color: 'bg-red-500' }
  if (s <= 3) return { score: s, label: 'Fair', color: 'bg-amber-500' }
  return { score: s, label: 'Strong', color: 'bg-emerald-500' }
}

function timeOpts(): string[] {
  const t: string[] = []
  for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m += 30) t.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  return t
}
const TIME_OPTIONS = timeOpts()

function emptyClinic(): Clinic {
  return { id: crypto.randomUUID(), name: '', city: '', address: '', floor: '', fee: '', slotDuration: '15' }
}

/* ─── Validation ─── */

function validateStep(step: number, data: PractitionerFormData): Record<string, string> {
  const e: Record<string, string> = {}
  if (step === 0) {
    if (!data.fullName.trim()) e.fullName = 'Required'
    if (!data.email.trim()) e.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Invalid email'
    if (!data.phone.trim()) e.phone = 'Required'
    else if (data.phone.replace(/\D/g, '').length < 10) e.phone = 'Invalid format'
    if (!data.password) e.password = 'Required'
    else if (data.password.length < 8) e.password = 'Min 8 characters'
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])/.test(data.password))
      e.password = 'Needs upper, lower, digit & special char'
    if (!data.gender) e.gender = 'Required'
    if (!data.cnic.trim()) e.cnic = 'Required'
    else if (data.cnic.replace(/\D/g, '').length !== 13) e.cnic = 'Must be 13 digits'
    if (!data.role) e.role = 'Required'
  }
  if (step === 1) {
    if (!data.licensingBody) e.licensingBody = 'Required'
    if (!data.licenseNumber.trim()) e.licenseNumber = 'Required'
    if (!data.highestDegree) e.highestDegree = 'Required'
  }
  if (step === 2) {
    if (!data.onlineConsult && data.clinics.length === 0) e.general = 'Select at least one mode'
    if (data.onlineConsult && !data.onlineFee) e.onlineFee = 'Required'
  }
  return e
}

/* ─── Step Components ─── */

function Step1BasicInfo({ data, update, errors }: { data: PractitionerFormData; update: (p: Partial<PractitionerFormData>) => void; errors: Record<string, string> }) {
  const st = pwStrength(data.password)
  const [showPw, setShowPw] = useState(false)

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input id="fullName" placeholder="Dr. Ahmed Khan" value={data.fullName} onChange={(e) => update({ fullName: e.target.value })} />
          {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Professional Email *</Label>
          <Input id="email" type="email" placeholder="doctor@clinic.com" value={data.email} onChange={(e) => update({ email: e.target.value })} />
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input id="phone" placeholder="+92-3XX-XXXXXXX" value={data.phone} onChange={(e) => update({ phone: formatPhone(e.target.value) })} />
          {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cnic">CNIC *</Label>
          <Input id="cnic" placeholder="XXXXX-XXXXXXX-X" value={data.cnic} onChange={(e) => update({ cnic: formatCNIC(e.target.value) })} />
          {errors.cnic && <p className="text-xs text-red-500">{errors.cnic}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <div className="relative">
            <Input id="password" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={data.password} onChange={(e) => update({ password: e.target.value })} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPw(!showPw)}>
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {data.password && (
            <div className="mt-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= st.score * 1.2 ? st.color : 'bg-gray-200 dark:bg-gray-700'}`} />
                ))}
              </div>
              <p className="mt-0.5 text-xs text-gray-500">Strength: {st.label}</p>
            </div>
          )}
          <p className="text-xs text-gray-400">Requires uppercase, lowercase, digit & special character</p>
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <select id="gender" className="flex h-10 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-slate-900 dark:text-slate-50" value={data.gender} onChange={(e) => update({ gender: e.target.value as Gender })}>
            <option value="">Select gender</option>
            {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Professional Role *</Label>
        <div className="grid gap-2 sm:grid-cols-3">
          {ROLES.map((r) => (
            <button key={r} type="button" onClick={() => update({ role: r })}
              className={`flex items-center justify-center rounded-lg border-2 px-3 py-3 text-sm font-medium transition-colors ${
                data.role === r ? 'border-primary bg-primary-50 text-primary dark:bg-primary-900/20' : 'border-[#D1D5DB] text-[#334155] hover:border-primary/50 dark:border-gray-600 dark:text-slate-300'
              }`}>
              {data.role === r && <Check className="mr-1.5 h-4 w-4" />}{r}
            </button>
          ))}
        </div>
        {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
      </div>
    </div>
  )
}

function Step2Credentials({ data, update, errors }: { data: PractitionerFormData; update: (p: Partial<PractitionerFormData>) => void; errors: Record<string, string> }) {
  const bodies = data.role ? LICENSING_BODIES[data.role] || [] : []
  const degrees = data.role ? DEGREES[data.role] || [] : []

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="licensingBody">Licensing Body *</Label>
          <select id="licensingBody" className="flex h-10 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-slate-900 dark:text-slate-50" value={data.licensingBody} onChange={(e) => update({ licensingBody: e.target.value })}>
            <option value="">Select body</option>
            {bodies.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          {errors.licensingBody && <p className="text-xs text-red-500">{errors.licensingBody}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="licenseNumber">License Registration Number *</Label>
          <Input id="licenseNumber" placeholder="e.g. PMC-12345" value={data.licenseNumber} onChange={(e) => update({ licenseNumber: e.target.value })} />
          {errors.licenseNumber && <p className="text-xs text-red-500">{errors.licenseNumber}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="highestDegree">Highest Degree *</Label>
          <select id="highestDegree" className="flex h-10 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-slate-900 dark:text-slate-50" value={data.highestDegree} onChange={(e) => update({ highestDegree: e.target.value })}>
            <option value="">Select degree</option>
            {degrees.map((d) => <option key={d} value={d}>{d}</option>)}
            <option value="Other">Other</option>
          </select>
          {errors.highestDegree && <p className="text-xs text-red-500">{errors.highestDegree}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="experience">Years of Experience (0-50)</Label>
          <Input id="experience" type="number" min={0} max={50} placeholder="e.g. 10" value={data.experience} onChange={(e) => update({ experience: e.target.value })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subSpecialties">Sub-specialty Tags</Label>
        <Input id="subSpecialties" placeholder="e.g. Cardiology, Pediatrics (comma separated)" value={data.subSpecialties} onChange={(e) => update({ subSpecialties: e.target.value })} />
        {data.subSpecialties && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {data.subSpecialties.split(',').map((s, i) => s.trim() && <Badge key={i} variant="secondary" className="text-xs">{s.trim()}</Badge>)}
          </div>
        )}
      </div>
    </div>
  )
}

function Step3Locations({ data, update, errors }: { data: PractitionerFormData; update: (p: Partial<PractitionerFormData>) => void; errors: Record<string, string> }) {
  const addClinic = () => update({ clinics: [...data.clinics, emptyClinic()] })
  const rmClinic = (id: string) => update({ clinics: data.clinics.filter((c) => c.id !== id) })
  const updClinic = (id: string, patch: Partial<Clinic>) => update({ clinics: data.clinics.map((c) => (c.id === id ? { ...c, ...patch } : c)) })

  return (
    <div className="space-y-5">
      <label className="flex items-center gap-3 rounded-lg border border-[#D1D5DB] p-4 cursor-pointer hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-slate-800/50">
        <input type="checkbox" checked={data.onlineConsult} onChange={() => update({ onlineConsult: !data.onlineConsult })} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
        <div>
          <p className="font-medium text-[#1e293b] dark:text-white">Online Video Consultations</p>
          <p className="text-xs text-gray-500">Consult patients via video calls</p>
        </div>
      </label>

      {data.onlineConsult && (
        <Card className="border-primary/30 bg-primary-50/30 dark:bg-primary-900/10">
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Consultation Fee (PKR) *</Label>
                <Input type="number" placeholder="e.g. 1500" value={data.onlineFee} onChange={(e) => update({ onlineFee: e.target.value })} />
                {errors.onlineFee && <p className="text-xs text-red-500">{errors.onlineFee}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Slot Duration *</Label>
                <select className="flex h-10 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-slate-900 dark:text-slate-50" value={data.onlineSlotDuration} onChange={(e) => update({ onlineSlotDuration: e.target.value })}>
                  {SLOT_DURATIONS.map((d) => <option key={d} value={d}>{d} min</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={data.onlineDiscountedToggle} onChange={(e) => update({ onlineDiscountedToggle: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-primary" />
                  <Label className="text-xs">Discounted Fee</Label>
                </div>
                {data.onlineDiscountedToggle && (
                  <Input type="number" placeholder="Discounted amount" value={data.onlineDiscountedFee} onChange={(e) => update({ onlineDiscountedFee: e.target.value })} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <label className="flex items-center gap-3 rounded-lg border border-[#D1D5DB] p-4 cursor-pointer hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-slate-800/50">
        <input type="checkbox" checked={data.clinics.length > 0} onChange={(e) => update({ clinics: e.target.checked ? [emptyClinic()] : [] })} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
        <div>
          <p className="font-medium text-[#1e293b] dark:text-white">Physical Clinic Visits</p>
          <p className="text-xs text-gray-500">See patients at clinic locations</p>
        </div>
      </label>

      {data.clinics.length > 0 && (
        <div className="space-y-3">
          {data.clinics.map((c, idx) => (
            <Card key={c.id} className="border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#1e293b] dark:text-white flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" /> Clinic #{idx + 1}
                  </p>
                  {data.clinics.length > 1 && (
                    <button type="button" onClick={() => rmClinic(c.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Clinic Name" value={c.name} onChange={(e) => updClinic(c.id, { name: e.target.value })} />
                  <Input placeholder="City" value={c.city} onChange={(e) => updClinic(c.id, { city: e.target.value })} />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input placeholder="Address" value={c.address} onChange={(e) => updClinic(c.id, { address: e.target.value })} />
                  <Input placeholder="Floor / Room" value={c.floor} onChange={(e) => updClinic(c.id, { floor: e.target.value })} />
                  <Input type="number" placeholder="Fee (PKR)" value={c.fee} onChange={(e) => updClinic(c.id, { fee: e.target.value })} />
                </div>
              </CardContent>
            </Card>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addClinic}><Plus className="h-4 w-4" /> Add Another Clinic</Button>
        </div>
      )}
    </div>
  )
}

function Step4Schedule({ data, update }: { data: PractitionerFormData; update: (p: Partial<PractitionerFormData>) => void }) {
  const locations: { id: string; label: string }[] = []
  if (data.onlineConsult) locations.push({ id: 'online', label: 'Online Video' })
  data.clinics.forEach((c) => { if (c.name) locations.push({ id: c.id, label: c.name }) })

  const addBlock = (day: string) => {
    update({
      schedules: [
        ...data.schedules,
        { id: crypto.randomUUID(), day, start: '09:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00', hasBreak: false, locationId: locations[0]?.id || 'online' },
      ],
    })
  }
  const rmBlock = (id: string) => update({ schedules: data.schedules.filter((s) => s.id !== id) })
  const updBlock = (id: string, patch: Partial<TimeBlock>) => update({ schedules: data.schedules.map((s) => (s.id === id ? { ...s, ...patch } : s)) })

  return (
    <div className="space-y-4">
      {locations.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">Please set up at least one consultation mode in the previous step.</p>
      ) : (
        DAYS.map((day) => {
          const blocks = data.schedules.filter((s) => s.day === day)
          return (
            <Card key={day} className="border-[#D1D5DB] dark:border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-[#1e293b] dark:text-white text-sm">{day}</p>
                  <Button type="button" variant="ghost" size="sm" className="gap-1 h-7 text-xs" onClick={() => addBlock(day)}>
                    <Plus className="h-3.5 w-3.5" /> Add Shift
                  </Button>
                </div>
                {blocks.length === 0 && <p className="text-xs text-gray-400 italic">No shifts scheduled</p>}
                <div className="space-y-2">
                  {blocks.map((block) => (
                    <div key={block.id} className="flex flex-wrap items-end gap-2 rounded-lg bg-gray-50 p-3 dark:bg-slate-800/50">
                      <div className="space-y-1 min-w-[120px]">
                        <Label className="text-xs">Location</Label>
                        <select className="flex h-8 w-full rounded-md border border-[#D1D5DB] bg-white px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-slate-900" value={block.locationId} onChange={(e) => updBlock(block.id, { locationId: e.target.value })}>
                          {locations.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Start</Label>
                        <select className="flex h-8 w-[90px] rounded-md border border-[#D1D5DB] bg-white px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-slate-900" value={block.start} onChange={(e) => updBlock(block.id, { start: e.target.value })}>
                          {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">End</Label>
                        <select className="flex h-8 w-[90px] rounded-md border border-[#D1D5DB] bg-white px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-slate-900" value={block.end} onChange={(e) => updBlock(block.id, { end: e.target.value })}>
                          {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-xs cursor-pointer">
                          <input type="checkbox" checked={block.hasBreak} onChange={(e) => updBlock(block.id, { hasBreak: e.target.checked })} className="h-3 w-3 rounded border-gray-300 text-primary" /> Break
                        </label>
                      </div>
                      {block.hasBreak && (
                        <>
                          <div className="space-y-1">
                            <Label className="text-xs">Break Start</Label>
                            <select className="flex h-8 w-[85px] rounded-md border border-[#D1D5DB] bg-white px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-slate-900" value={block.breakStart} onChange={(e) => updBlock(block.id, { breakStart: e.target.value })}>
                              {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Break End</Label>
                            <select className="flex h-8 w-[85px] rounded-md border border-[#D1D5DB] bg-white px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-slate-900" value={block.breakEnd} onChange={(e) => updBlock(block.id, { breakEnd: e.target.value })}>
                              {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                        </>
                      )}
                      <button type="button" onClick={() => rmBlock(block.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}

/* ─── Main Page ─── */

export default function PractitionerSignUpPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<PractitionerFormData>({
    fullName: '', email: '', phone: '', password: '', gender: '', cnic: '', role: '',
    licensingBody: '', licenseNumber: '', highestDegree: '', experience: '', subSpecialties: '',
    onlineConsult: false, onlineFee: '', onlineDiscountedFee: '', onlineDiscountedToggle: false, onlineSlotDuration: '15',
    clinics: [], schedules: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setData(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }, [data])

  const update = useCallback((patch: Partial<PractitionerFormData>) => setData((prev) => ({ ...prev, ...patch })), [])

  const handleNext = () => {
    const errs = validateStep(step, data)
    setErrors(errs)
    if (Object.keys(errs).length === 0) setStep((s) => Math.min(s + 1, 4))
  }

  const handleBack = () => { setErrors({}); setStep((s) => Math.max(s - 1, 0)) }

  const handleSubmit = () => {
    setLoading(true)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    toast.success('Registration data saved!')
    setTimeout(() => { setLoading(false); navigate('/auth/sign-in') }, 600)
  }

  const renderStep = () => {
    switch (step) {
      case 0: return <Step1BasicInfo data={data} update={update} errors={errors} />
      case 1: return <Step2Credentials data={data} update={update} errors={errors} />
      case 2: return <Step3Locations data={data} update={update} errors={errors} />
      case 3: return <Step4Schedule data={data} update={update} />
      case 4: return (
        <div className="py-8 text-center text-gray-500">
          <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="font-medium text-[#1e293b] dark:text-white mb-2">Documents & Payout</p>
          <p className="text-sm">This step is handled by the system. Click Submit to save your progress.</p>
        </div>
      )
      default: return null
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = i === step
            const isDone = i < step
            return (
              <div key={s.id} className="flex flex-col items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                  isDone ? 'bg-primary border-primary text-white' : isActive ? 'border-primary text-primary bg-primary-50' : 'border-[#D1D5DB] text-gray-400 dark:border-gray-600'
                }`}>
                  {isDone ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <p className={`mt-1.5 text-[10px] font-medium ${isActive ? 'text-primary' : 'text-gray-400'}`}>{s.label}</p>
              </div>
            )
          })}
        </div>
        <div className="relative mt-3">
          <div className="absolute top-0 left-0 h-1 bg-[#D1D5DB] dark:bg-gray-700 w-full rounded-full" />
          <div className="absolute top-0 left-0 h-1 bg-primary rounded-full transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-[#1e293b] dark:text-white flex items-center gap-2">
            {(() => { const Icon = STEPS[step].icon; return <Icon className="h-5 w-5 text-primary" /> })()}
            {STEPS[step].label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {errors.general && <p className="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg p-3">{errors.general}</p>}
          {renderStep()}

          <div className="mt-8 flex items-center justify-between border-t border-[#D1D5DB] pt-5 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={handleBack} disabled={step === 0} className="gap-1.5">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>

            {step < 4 ? (
              <Button type="button" onClick={handleNext} className="gap-1.5">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={loading} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                {loading ? 'Saving...' : <><Check className="h-4 w-4" /> Submit Registration</>}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}