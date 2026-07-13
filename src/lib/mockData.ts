// ============================================================
// Shared Mock Data Store for Telemedicine Platform
// All components import from here instead of defining local data
// ============================================================

export interface Patient {
  id: string
  name: string
  age: number
  lastVisit: string
  condition: string
}

export interface PrescriptionMedication {
  name: string
  dosage: string
  frequency: string
  duration: string
  route: string
  quantity: number
  instructions: string
}

export interface Prescription {
  id: string
  patientId: string
  patientName: string
  doctorName: string
  doctorId: string
  medications: PrescriptionMedication[]
  date: string
  status: 'pending' | 'dispensed' | 'cancelled'
  notes: string
  interactions: string[]
}

// ─── Mock Patients ───

const mockPatients: Patient[] = [
  { id: 'p1', name: 'Ahmed Raza', age: 35, lastVisit: '2026-06-28', condition: 'Hypertension' },
  { id: 'p2', name: 'Sana Tariq', age: 28, lastVisit: '2026-07-01', condition: 'Diabetes Type 2' },
  { id: 'p3', name: 'Bilal Khan', age: 45, lastVisit: '2026-06-15', condition: 'Lower Back Pain' },
  { id: 'p4', name: 'Zainab Ali', age: 52, lastVisit: '2026-07-05', condition: 'Arthritis' },
  { id: 'p5', name: 'Fatima Noor', age: 30, lastVisit: '2026-07-02', condition: 'Migraine' },
  { id: 'p6', name: 'Omar Farooq', age: 60, lastVisit: '2026-07-03', condition: 'Diabetes Type 2' },
  { id: 'p7', name: 'Ayesha Siddiqui', age: 25, lastVisit: '2026-06-20', condition: 'Asthma' },
  { id: 'p8', name: 'Hassan Ali', age: 40, lastVisit: '2026-07-06', condition: 'Hypertension' },
]

// ─── Drug Interaction Database ───

interface DrugInteraction {
  drug1: string
  drug2: string
  severity: 'major' | 'moderate' | 'minor'
  description: string
}

const drugInteractions: DrugInteraction[] = [
  { drug1: 'Amlodipine', drug2: 'Metformin', severity: 'moderate', description: 'May increase risk of hypotension. Monitor blood pressure closely.' },
  { drug1: 'Amlodipine', drug2: 'Simvastatin', severity: 'moderate', description: 'Increased statin exposure. Limit simvastatin to 20mg daily.' },
  { drug1: 'Metformin', drug2: 'Losartan', severity: 'minor', description: 'May enhance hypoglycemic effect. Monitor blood glucose.' },
  { drug1: 'Warfarin', drug2: 'Ibuprofen', severity: 'major', description: 'Increased risk of bleeding. Avoid concurrent use if possible.' },
  { drug1: 'Warfarin', drug2: 'Aspirin', severity: 'major', description: 'Increased bleeding risk. Monitor INR closely.' },
  { drug1: 'Losartan', drug2: 'Ibuprofen', severity: 'moderate', description: 'Reduced antihypertensive effect. Monitor blood pressure.' },
  { drug1: 'Simvastatin', drug2: 'Amlodipine', severity: 'moderate', description: 'Increased statin levels. Limit simvastatin dose.' },
  { drug1: 'Metformin', drug2: 'Furosemide', severity: 'moderate', description: 'May increase metformin levels. Monitor renal function.' },
  { drug1: 'Aspirin', drug2: 'Ibuprofen', severity: 'moderate', description: 'Increased GI bleeding risk. Consider gastroprotection.' },
  { drug1: 'Omeprazole', drug2: 'Clopidogrel', severity: 'moderate', description: 'Reduced clopidogrel efficacy. Consider pantoprazole instead.' },
]

// Normalize drug name for lookup
function normalizeDrug(name: string): string {
  return name.toLowerCase().trim().split(' ')[0]
}

// Check drug interactions between a new medication and existing medications
export function checkInteractions(
  newMedicationName: string,
  existingMedications: PrescriptionMedication[],
): string[] {
  const newDrug = normalizeDrug(newMedicationName)
  const warnings: string[] = []

  for (const existing of existingMedications) {
    const existingDrug = normalizeDrug(existing.name)
    if (newDrug === existingDrug) continue

    const interaction = drugInteractions.find(
      (di) =>
        (normalizeDrug(di.drug1) === newDrug && normalizeDrug(di.drug2) === existingDrug) ||
        (normalizeDrug(di.drug1) === existingDrug && normalizeDrug(di.drug2) === newDrug),
    )

    if (interaction) {
      warnings.push(`${existing.name}: ${interaction.description} (${interaction.severity})`)
    }
  }

  return warnings
}

// ─── Prescriptions Store ───

let prescriptions: Prescription[] = [
  {
    id: 'RX-001',
    patientId: 'p1',
    patientName: 'Ahmed Raza',
    doctorName: 'Dr. Sarah Ahmed',
    doctorId: 'doc1',
    medications: [
      { name: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', route: 'Oral', quantity: 30, instructions: 'Take in the morning' },
    ],
    date: '2026-07-08',
    status: 'pending',
    notes: '',
    interactions: [],
  },
  {
    id: 'RX-002',
    patientId: 'p2',
    patientName: 'Sana Tariq',
    doctorName: 'Dr. Imran Ali',
    doctorId: 'doc2',
    medications: [
      { name: 'Metformin 500mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '60 days', route: 'Oral', quantity: 120, instructions: 'Take after meals' },
    ],
    date: '2026-07-07',
    status: 'dispensed',
    notes: '',
    interactions: [],
  },
  {
    id: 'RX-003',
    patientId: 'p3',
    patientName: 'Bilal Khan',
    doctorName: 'Dr. Fatima Khan',
    doctorId: 'doc3',
    medications: [
      { name: 'Ibuprofen 400mg', dosage: '1 tablet', frequency: 'As needed', duration: '10 days', route: 'Oral', quantity: 20, instructions: 'Take with food' },
    ],
    date: '2026-07-06',
    status: 'dispensed',
    notes: '',
    interactions: [],
  },
]

let nextRxId = 4

// ─── Public API ───

export function getPatients(): Patient[] {
  return [...mockPatients]
}

export function getPatientById(id: string): Patient | undefined {
  return mockPatients.find((p) => p.id === id)
}

export function searchPatients(query: string): Patient[] {
  const q = query.toLowerCase()
  return mockPatients.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.condition.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q),
  )
}

export function getPrescriptions(): Prescription[] {
  return [...prescriptions]
}

export function getPrescriptionsByPatient(patientId: string): Prescription[] {
  return prescriptions.filter((p) => p.patientId === patientId)
}

export function getPrescriptionsByDoctor(doctorId: string): Prescription[] {
  return prescriptions.filter((p) => p.doctorId === doctorId)
}

export function getPendingPrescriptions(): Prescription[] {
  return prescriptions.filter((p) => p.status === 'pending')
}

export function addPrescription(rx: Omit<Prescription, 'id' | 'date'>): Prescription {
  const newRx: Prescription = {
    ...rx,
    id: `RX-${String(nextRxId).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
  }
  prescriptions = [...prescriptions, newRx]
  nextRxId++
  return newRx
}

export function updatePrescriptionStatus(
  id: string,
  status: 'pending' | 'dispensed' | 'cancelled',
): Prescription | undefined {
  const idx = prescriptions.findIndex((p) => p.id === id)
  if (idx === -1) return undefined
  prescriptions[idx] = { ...prescriptions[idx], status }
  return prescriptions[idx]
}

// ─── Common Medications Database ───

export const COMMON_MEDICATIONS = [
  { name: 'Amlodipine 5mg', category: 'Cardiovascular' },
  { name: 'Amlodipine 10mg', category: 'Cardiovascular' },
  { name: 'Metformin 500mg', category: 'Diabetes' },
  { name: 'Metformin 850mg', category: 'Diabetes' },
  { name: 'Losartan 50mg', category: 'Cardiovascular' },
  { name: 'Losartan 100mg', category: 'Cardiovascular' },
  { name: 'Simvastatin 20mg', category: 'Cardiovascular' },
  { name: 'Simvastatin 40mg', category: 'Cardiovascular' },
  { name: 'Omeprazole 20mg', category: 'Gastrointestinal' },
  { name: 'Ibuprofen 400mg', category: 'Pain Relief' },
  { name: 'Ibuprofen 600mg', category: 'Pain Relief' },
  { name: 'Paracetamol 500mg', category: 'Pain Relief' },
  { name: 'Paracetamol 1g', category: 'Pain Relief' },
  { name: 'Aspirin 75mg', category: 'Cardiovascular' },
  { name: 'Aspirin 150mg', category: 'Cardiovascular' },
  { name: 'Warfarin 5mg', category: 'Anticoagulant' },
  { name: 'Furosemide 40mg', category: 'Diuretic' },
  { name: 'Clopidogrel 75mg', category: 'Cardiovascular' },
  { name: 'Atorvastatin 10mg', category: 'Cardiovascular' },
  { name: 'Atorvastatin 20mg', category: 'Cardiovascular' },
]

export const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every morning',
  'Every night',
  'As needed',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
]

export const ROUTE_OPTIONS = [
  'Oral',
  'Topical',
  'Intravenous',
  'Intramuscular',
  'Subcutaneous',
  'Inhalation',
  'Sublingual',
  'Rectal',
  'Ophthalmic',
  'Otic',
]

export const DURATION_OPTIONS = [
  '3 days',
  '5 days',
  '7 days',
  '10 days',
  '14 days',
  '21 days',
  '30 days',
  '45 days',
  '60 days',
  '90 days',
]
