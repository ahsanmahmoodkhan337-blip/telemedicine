/**
 * Zeenat Lab Integration Controller
 * Simulates lab order placement and report delivery
 */

import type { LabOrderRequest, LabOrderResponse, LabReport } from './types'

export class ZeenatLabController {
  async placeOrder(request: LabOrderRequest): Promise<LabOrderResponse> {
    const payload = this.buildOrderPayload(request)
    await this.delay(2000)

    const success = Math.random() > 0.08
    if (!success) {
      return {
        success: false, orderReference: request.id, labReference: null,
        status: 'cancelled', estimatedCompletion: '', totalCost: 0,
        message: 'Zeenat Lab: Invalid test panel code(s)',
        timestamp: new Date().toISOString(),
      }
    }

    const labRef = `ZEEN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    return {
      success: true, orderReference: request.id, labReference: labRef,
      status: 'received',
      estimatedCompletion: new Date(Date.now() + 10 * 3600000).toISOString(),
      totalCost: payload.order.tests.length * 780 + 100,
      message: `Order submitted to Zeenat Lab. Ref: ${labRef}`,
      timestamp: new Date().toISOString(),
    }
  }

  async checkStatus(labReference: string): Promise<{ status: string; progress: number }> {
    await this.delay(500)
    return {
      status: 'completed',
      progress: 100,
    }
  }

  async getReport(labReference: string): Promise<LabReport | null> {
    await this.delay(1200)
    return {
      orderReference: `ZORD-${Date.now()}`,
      labReference,
      patientId: 'patient-001', patientName: 'Aisha Khan',
      tests: [
        {
          testCode: 'VITD', testName: 'Vitamin D',
          parameters: [
            { name: '25-OH Vitamin D', value: '28', unit: 'ng/mL', referenceRange: '30-100', flag: 'low' },
          ],
        },
      ],
      generatedAt: new Date().toISOString(),
    }
  }

  buildOrderPayload(request: LabOrderRequest): Record<string, unknown> {
    return {
      api_key: 'zeenat_live_sk_987654',
      partner_id: 'HHUSTLERS001',
      data: {
        order_id: request.id,
        patient_info: {
          pid: request.patientId,
          name: request.patientName,
          mobile: request.patientPhone,
          age_yr: request.patientAge,
          sex: request.patientGender,
        },
        physician: {
          id: request.doctorId,
          name: request.doctorName,
        },
        test_codes: request.tests.map(t => t.code),
        collection_type: request.collectionType === 'home' ? 'HOME' : 'CENTER',
        scheduled_date: request.collectionDate,
        scheduled_time: request.collectionTime,
        notes: request.notes,
      },
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}