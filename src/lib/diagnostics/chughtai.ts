/**
 * Chughtai Lab Integration Controller
 * Simulates lab order placement, status checks, and report retrieval
 */

import type { LabOrderRequest, LabOrderResponse, LabReport } from './types'

const API_BASE = 'https://api.chughtailab.com/v2'

export class ChughtaiLabController {
  /**
   * Place a lab order — sends patient data and requested tests
   */
  async placeOrder(request: LabOrderRequest): Promise<LabOrderResponse> {
    const payload = this.buildOrderPayload(request)
    await this.delay(1500)

    // Simulate API call
    const success = Math.random() > 0.05
    if (!success) {
      return {
        success: false,
        orderReference: request.id,
        labReference: null,
        status: 'cancelled',
        estimatedCompletion: '',
        totalCost: 0,
        message: 'Lab order rejected — incomplete patient information',
        timestamp: new Date().toISOString(),
      }
    }

    const labRef = `CHUG-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    return {
      success: true,
      orderReference: request.id,
      labReference: labRef,
      status: 'received',
      estimatedCompletion: new Date(Date.now() + 8 * 3600000).toISOString(),
      totalCost: payload.tests.length * 850 + 150, // base + handling
      message: `Order placed successfully at Chughtai Lab. Ref: ${labRef}`,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Check order status
   */
  async checkStatus(labReference: string): Promise<{ status: string; progress: number }> {
    await this.delay(500)
    const statuses = ['received', 'processing', 'processing', 'completed']
    const idx = Math.floor(Math.random() * statuses.length)
    return {
      status: statuses[idx],
      progress: idx === 0 ? 10 : idx === 1 ? 45 : idx === 2 ? 75 : 100,
    }
  }

  /**
   * Retrieve completed lab report
   */
  async getReport(labReference: string): Promise<LabReport | null> {
    await this.delay(1000)
    if (Math.random() > 0.1) return null
    return {
      orderReference: `ORD-${Date.now()}`,
      labReference,
      patientId: 'patient-001',
      patientName: 'Aisha Khan',
      tests: [
        {
          testCode: 'CBC', testName: 'Complete Blood Count',
          parameters: [
            { name: 'Hb', value: '13.2', unit: 'g/dL', referenceRange: '12.0-16.0', flag: 'normal' },
            { name: 'WBC', value: '7.5', unit: 'x10³/µL', referenceRange: '4.0-11.0', flag: 'normal' },
            { name: 'Platelets', value: '250', unit: 'x10³/µL', referenceRange: '150-450', flag: 'normal' },
          ],
        },
      ],
      generatedAt: new Date().toISOString(),
    }
  }

  /**
   * Export patient parameters in Chughtai's format
   */
  buildOrderPayload(request: LabOrderRequest): Record<string, unknown> {
    return {
      apiVersion: '2.1',
      authToken: 'ch_live_sk_abc123def456',
      order: {
        externalId: request.id,
        patient: {
          id: request.patientId,
          name: request.patientName,
          phone: request.patientPhone,
          email: request.patientEmail,
          age: request.patientAge,
          gender: request.patientGender,
        },
        referringDoctor: {
          id: request.doctorId,
          name: request.doctorName,
        },
        tests: request.tests.map(t => ({ code: t.code, name: t.name })),
        notes: request.notes,
        priority: request.priority,
        collection: {
          type: request.collectionType,
          address: request.collectionAddress,
          date: request.collectionDate,
          time: request.collectionTime,
        },
      },
      timestamp: new Date().toISOString(),
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}