export type UserRole = 'patient' | 'doctor' | 'pharmacist' | 'physiotherapist' | 'nutritionist' | 'admin'

export type AppointmentStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled'

export type PrescriptionStatus = 'pending' | 'dispensed' | 'cancelled'

export interface Profile {
  id: string
  user_id: string
  role: UserRole
  full_name: string
  avatar_url: string | null
  specialty: string | null
  city: string | null
  fee: number | null
  language: string[]
  rating: number | null
  verified: boolean
  created_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  provider_id: string
  provider_role: UserRole
  scheduled_at: string
  status: AppointmentStatus
  notes: string | null
  patient: Profile | null
  provider: Profile | null
}

export interface VitalsLog {
  id: string
  patient_id: string
  blood_pressure_sys: number | null
  blood_pressure_dia: number | null
  weight: number | null
  glucose: number | null
  temperature: number | null
  recorded_at: string
}

export interface SOAPNote {
  id: string
  appointment_id: string
  subjective: string
  objective: string
  assessment: string
  plan: string
  icd_codes: string[]
  signed: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface Prescription {
  id: string
  appointment_id: string
  doctor_id: string
  patient_id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  status: PrescriptionStatus
  pharmacist_id: string | null
  dispensed_at: string | null
  created_at: string
}

export interface NutritionPlan {
  id: string
  patient_id: string
  nutritionist_id: string
  daily_calories: number
  macros: {
    protein: number
    carbs: number
    fat: number
  }
  restrictions: string[]
  meal_plan: Record<string, any>
  created_at: string
}

export interface RomMeasurement {
  id: string
  patient_id: string
  physio_id: string
  joint: string
  target_degrees: number
  achieved_degrees: number
  compensation_detected: boolean
  recorded_at: string
}