/**
 * DVAGO Pharmacy Dispatch — Pakistan's largest pharmacy chain
 * Simulates order placement, inventory check, and dispatch tracking
 */

import type { PrescriptionDispatch, DispatchResponse } from './types'

export class DVAGOController {
  async placeOrder(dispatch: PrescriptionDispatch): Promise<DispatchResponse> {
    const payload = this.buildOrderPayload(dispatch)
    await this.delay(1200)

    const success = Math.random() > 0.05
    if (!success) {
      return {
        success: false, dispatchReference: dispatch.id, pharmacyReference: null,
        status: 'cancelled', estimatedDelivery: '', totalCost: 0, deliveryFee: 0,
        message: 'DVAGO: One or more items out of stock',
        timestamp: new Date().toISOString(),
      }
    }

    const ref = `DVAGO-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const itemTotal = dispatch.items.reduce((sum, i) => sum + i.pricePerUnit * i.quantity, 0)
    const deliveryFee = itemTotal > 2000 ? 0 : 149

    return {
      success: true, dispatchReference: dispatch.id, pharmacyReference: ref,
      status: 'received',
      estimatedDelivery: new Date(Date.now() + 24 * 3600000).toISOString(),
      totalCost: itemTotal + deliveryFee, deliveryFee,
      message: `DVAGO order placed. Ref: ${ref}. Est. delivery: tomorrow`,
      trackingUrl: `https://track.dvago.com.pk/${ref}`,
      timestamp: new Date().toISOString(),
    }
  }

  async checkStock(medicationCode: string): Promise<{ available: boolean; price: number; stock: number }> {
    await this.delay(300)
    return {
      available: Math.random() > 0.15,
      price: Math.floor(Math.random() * 500) + 50,
      stock: Math.floor(Math.random() * 100),
    }
  }

  buildOrderPayload(dispatch: PrescriptionDispatch): Record<string, unknown> {
    return {
      api_key: 'dvago_live_key_hhustlers',
      partner_id: 'HH2024',
      order: {
        reference: dispatch.id,
        prescription_id: dispatch.prescriptionId,
        patient: {
          id: dispatch.patientId, name: dispatch.patientName,
          phone: dispatch.patientPhone, address: dispatch.patientAddress,
          city: dispatch.patientCity,
        },
        doctor: { id: dispatch.doctorId, name: dispatch.doctorName },
        items: dispatch.items.map(i => ({
          code: i.medicationCode, name: i.medicationName,
          dosage: i.dosage, qty: i.quantity, unit: i.unit,
          instructions: i.instructions, controlled: i.isControlled,
        })),
        delivery: dispatch.deliveryType,
        payment: dispatch.paymentMethod,
        notes: dispatch.notes,
      },
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}