/**
 * Tabiyat Pharmacy Dispatch — Digital pharmacy focusing on home delivery
 */

import type { PrescriptionDispatch, DispatchResponse } from './types'

export class TabiyatController {
  async placeOrder(dispatch: PrescriptionDispatch): Promise<DispatchResponse> {
    const payload = this.buildOrderPayload(dispatch)
    await this.delay(1000)

    const success = Math.random() > 0.03
    if (!success) {
      return {
        success: false, dispatchReference: dispatch.id, pharmacyReference: null,
        status: 'cancelled', estimatedDelivery: '', totalCost: 0, deliveryFee: 0,
        message: 'Tabiyat: Prescription requires verification',
        timestamp: new Date().toISOString(),
      }
    }

    const ref = `TAB-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const itemTotal = dispatch.items.reduce((sum, i) => sum + i.pricePerUnit * i.quantity, 0)
    const deliveryFee = 0 // Free delivery

    return {
      success: true, dispatchReference: dispatch.id, pharmacyReference: ref,
      status: 'processing',
      estimatedDelivery: new Date(Date.now() + 12 * 3600000).toISOString(),
      totalCost: itemTotal + deliveryFee, deliveryFee,
      message: `Tabiyat will deliver within 12 hours! Ref: ${ref}`,
      trackingUrl: `https://tabiyat.pk/order/${ref}`,
      timestamp: new Date().toISOString(),
    }
  }

  async getDeliveryTime(city: string): Promise<{ min: number; max: number; fee: number }> {
    await this.delay(300)
    const cities: Record<string, { min: number; max: number }> = {
      'Karachi': { min: 2, max: 6 },
      'Lahore': { min: 3, max: 8 },
      'Islamabad': { min: 4, max: 10 },
      'default': { min: 6, max: 24 },
    }
    const times = cities[city] || cities.default
    return { ...times, fee: 0 }
  }

  buildOrderPayload(dispatch: PrescriptionDispatch): Record<string, unknown> {
    return {
      api_key: 'tabiyat_live_hh_2024',
      source: 'HHUSTLERS_PLATFORM',
      prescription: {
        ref_id: dispatch.id,
        rx_id: dispatch.prescriptionId,
        patient: {
          id: dispatch.patientId, name: dispatch.patientName,
          mobile: dispatch.patientPhone, address: dispatch.patientAddress,
        },
        doctor_name: dispatch.doctorName,
        medicines: dispatch.items.map(i => ({
          id: i.medicationCode, name: i.medicationName,
          strength: i.dosage, qty: i.quantity, price: i.pricePerUnit,
        })),
        delivery_type: dispatch.deliveryType,
        payment_mode: dispatch.paymentMethod,
      },
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}