/**
 * Integrations — Unified barrel for diagnostics + pharmacy network integrations
 *
 * Diagnostics Labs: Chughtai Lab, Zeenat Lab
 * Pharmacy Dispatch: DVAGO, Dawaai, Tabiyat
 */

export { ChughtaiLabController, ZeenatLabController, DiagnosticsController, diagnosticsController } from '../diagnostics'
export { TEST_PANELS, LAB_NAMES } from '../diagnostics/types'
export type { LabPartner, TestPanel, LabOrderRequest, LabOrderResponse, LabReport, LabTestResult, PatientLabParameters } from '../diagnostics/types'

export { DVAGOController, DawaaiController, TabiyatController, PharmacyDispatchController, pharmacyDispatch } from '../pharmacies'
export { PHARMACY_NAMES } from '../pharmacies/types'
export type { PharmacyPartner, PrescriptionDispatch, PrescriptionItem, DispatchResponse, PharmacyProduct } from '../pharmacies/types'