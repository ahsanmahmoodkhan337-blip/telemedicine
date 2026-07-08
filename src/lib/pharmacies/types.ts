/**
 * Pharmacy Dispatch Types — Shared types for pharmacy network integrations
 */

export type PharmacyPartner = 'dvago' | 'dawaai' | 'tabiyat'

export type PrescriptionDispatch = {
  id: string
  pharmacyPartner: PharmacyPartner
  prescriptionId: string
  patientId: string
  patientName: string
  patientPhone: string
  patientAddress: string
  patientCity: string
  doctorId: string
  doctorName: string
  items: PrescriptionItem[]
  deliveryType: 'delivery' | 'pickup'
  paymentMethod: 'cod' | 'card' | 'wallet'
  notes?: string
}

export type PrescriptionItem = {
  medicationCode: string
  medicationName: string
  dosage: string
  quantity: number
  unit: string
  instructions: string
  pricePerUnit: number
  isControlled: boolean
}

export type DispatchResponse = {
  success: boolean
  dispatchReference: string
  pharmacyReference: string | null
  status: 'received' | 'processing' | 'picking' | 'packed' | 'dispatched' | 'delivered' | 'cancelled'
  estimatedDelivery: string
  totalCost: number
  deliveryFee: number
  message: string
  trackingUrl?: string
  timestamp: string
}

export type PharmacyProduct = {
  code: string
  name: string
  genericName: string
  strength: string
  form: string
  manufacturer: string
  price: number
  stock: number
  requiresPrescription: boolean
}

export const PHARMACY_NAMES: Record<PharmacyPartner, string> = {
  dvago: 'DVAGO',
  dawaai: 'Dawaai',
  tabiyat: 'Tabiyat',
}