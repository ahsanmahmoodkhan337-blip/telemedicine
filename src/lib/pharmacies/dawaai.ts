/**
 * Dawaai Pharmacy Dispatch — Online pharmacy serving all major cities
 */

import type { PrescriptionDispatch, DispatchResponse } from './types'

export class DawaaiController {
  async placeOrder(dispatch: PrescriptionDispatch): Promise<DispatchResponse> {
    const payload = this.buildOrderPayload(dispatch)
    await this.delay(1500)

    const success = Math.random() > 0.08
    if (!success) {
      return {
        success: false, dispatchReference: dispatch.id, pharmacyReference: null,
        status: 'cancelled', estimatedDelivery: '', totalCost: 0, deliveryFee: 0,
        message: 'Dawaai: Delivery not available in your area',
        timestamp: new Date().toISOString(),
      }
    }

    const ref = `DAW-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const itemTotal = dispatch.items.reduce((sum, i) => sum + i.pricePerUnit * i.quantity, 0)
    const deliveryFee = 99

    return {
      success: true, dispatchReference: dispatch.id, pharmacyReference: ref,
      status: 'processing',
      estimatedDelivery: new Date(Date.now() + 36 * 3600000).toISOString(),
      totalCost: itemTotal + deliveryFee, deliveryFee,
      message: `Dawaai order confirmed! Ref: ${ref}. Track in real-time.`,
      trackingUrl: `https://dawaai.pk/track/${ref}`,
      timestamp: new Date().toISOString(),
    }
  }

  async searchProducts(query: string): Promise<{ code: string; name: string; price: number }[]> {
    await this.delay(500)
    return [
      { code: 'AMLO5', name: 'Amlodipine 5mg', price: 85 },
      { code: 'METF500', name: 'Metformin 500mg', price: 120 },
      { code: 'ATRO10', name: 'Atorvastatin 10mg', price: 95 },
    ].filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
  }

  buildOrderPayload(dispatch: PrescriptionDispatch): Record<string, unknown> {
    return {
      api_key: 'dawaai_live_sk_hh789',
      merchant_id: 'HHUSTLERS',
      order: {
        ext_ref: dispatch.id,
        rx_id: dispatch.prescriptionId,
        customer: {
          id: dispatch.patientId, name: dispatch.patientName,
          phone: dispatch.patientPhone, address: dispatch.patientAddress,
          city: dispatch.patientCity,
        },
        doctor: dispatch.doctorName,
        medicines: dispatch.items.map(i => ({
          sku: i.medicationCode, product: i.medicationName,
          dosage: i.dosage, qty: i.quantity, price: i.pricePerUnit,
        })),
        shipping: dispatch.deliveryType,
        payment: dispatch.paymentMethod,
      },
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}