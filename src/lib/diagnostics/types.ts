/**
 * Diagnostics Types — Shared types for lab integrations
 */

export type LabPartner = 'chughtai' | 'zeenat'

export type TestPanel = {
  code: string
  name: string
  category: string
  price: number
  turnaroundHours: number
  requiresFasting: boolean
  parameters: string[]
}

export type LabOrderRequest = {
  id: string
  labPartner: LabPartner
  patientId: string
  patientName: string
  patientPhone: string
  patientEmail?: string
  patientAge: number
  patientGender: string
  doctorId: string
  doctorName: string
  tests: { code: string; name: string }[]
  notes?: string
  priority: 'routine' | 'urgent' | 'stat'
  collectionType: 'home' | 'center'
  collectionAddress?: string
  collectionDate: string
  collectionTime: string
}

export type LabOrderResponse = {
  success: boolean
  orderReference: string
  labReference: string | null
  status: 'received' | 'processing' | 'completed' | 'cancelled'
  estimatedCompletion: string
  totalCost: number
  message: string
  reportUrl?: string
  timestamp: string
}

export type LabReport = {
  orderReference: string
  labReference: string
  patientId: string
  patientName: string
  tests: LabTestResult[]
  generatedAt: string
  notes?: string
}

export type LabTestResult = {
  testCode: string
  testName: string
  parameters: {
    name: string
    value: string
    unit: string
    referenceRange: string
    flag: 'normal' | 'high' | 'low' | 'critical'
  }[]
}

export type PatientLabParameters = {
  patientId: string
  patientName: string
  age: number
  gender: string
  vitals: {
    bloodPressure: string
    heartRate: number
    temperature: number
    oxygenSaturation: number
    bloodGlucose?: number
  }
  recentTests: {
    testName: string
    date: string
    result: string
    flag: 'normal' | 'abnormal'
  }[]
}

export const TEST_PANELS: Record<string, TestPanel[]> = {
  chughtai: [
    { code: 'CBC', name: 'Complete Blood Count', category: 'Hematology', price: 850, turnaroundHours: 6, requiresFasting: false, parameters: ['Hb', 'WBC', 'RBC', 'Platelets', 'HCT', 'MCV', 'MCH', 'MCHC', 'RDW', 'Neutrophils', 'Lymphocytes', 'Monocytes', 'Eosinophils', 'Basophils'] },
    { code: 'LFT', name: 'Liver Function Test', category: 'Biochemistry', price: 1200, turnaroundHours: 8, requiresFasting: true, parameters: ['ALT', 'AST', 'ALP', 'GGT', 'Total Bilirubin', 'Direct Bilirubin', 'Total Protein', 'Albumin', 'Globulin'] },
    { code: 'RFT', name: 'Renal Function Test', category: 'Biochemistry', price: 950, turnaroundHours: 8, requiresFasting: true, parameters: ['Urea', 'Creatinine', 'Uric Acid', 'Sodium', 'Potassium', 'Chloride', 'Bicarbonate'] },
    { code: 'LIPID', name: 'Lipid Profile', category: 'Biochemistry', price: 1100, turnaroundHours: 10, requiresFasting: true, parameters: ['Total Cholesterol', 'HDL', 'LDL', 'VLDL', 'Triglycerides', 'TC/HDL Ratio'] },
    { code: 'HbA1c', name: 'Glycated Hemoglobin', category: 'Diabetes', price: 1500, turnaroundHours: 4, requiresFasting: false, parameters: ['HbA1c %', 'eAG'] },
    { code: 'TSH', name: 'Thyroid Stimulating Hormone', category: 'Endocrinology', price: 1300, turnaroundHours: 8, requiresFasting: false, parameters: ['TSH', 'FT3', 'FT4'] },
  ],
  zeenat: [
    { code: 'CBC', name: 'Complete Blood Count', category: 'Hematology', price: 780, turnaroundHours: 5, requiresFasting: false, parameters: ['Hb', 'WBC', 'RBC', 'Platelets', 'HCT', 'MCV', 'MCH', 'MCHC', 'RDW', 'Neutrophils', 'Lymphocytes', 'Monocytes', 'Eosinophils', 'Basophils'] },
    { code: 'LFT', name: 'Liver Function Test', category: 'Biochemistry', price: 1100, turnaroundHours: 7, requiresFasting: true, parameters: ['ALT', 'AST', 'ALP', 'GGT', 'Total Bilirubin', 'Direct Bilirubin', 'Total Protein', 'Albumin', 'Globulin'] },
    { code: 'RFT', name: 'Renal Function Test', category: 'Biochemistry', price: 880, turnaroundHours: 7, requiresFasting: true, parameters: ['Urea', 'Creatinine', 'Uric Acid', 'Sodium', 'Potassium', 'Chloride', 'Bicarbonate'] },
    { code: 'VITD', name: 'Vitamin D', category: 'Endocrinology', price: 2200, turnaroundHours: 12, requiresFasting: false, parameters: ['25-OH Vitamin D'] },
    { code: 'VITB12', name: 'Vitamin B12', category: 'Hematology', price: 1800, turnaroundHours: 10, requiresFasting: true, parameters: ['Vitamin B12'] },
  ],
}

export const LAB_NAMES: Record<LabPartner, string> = {
  chughtai: 'Chughtai Lab',
  zeenat: 'Zeenat Lab',
}