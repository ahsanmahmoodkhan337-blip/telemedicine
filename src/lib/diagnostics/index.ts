export { ChughtaiLabController } from './chughtai'
export { ZeenatLabController } from './zeenat'
export { TEST_PANELS, LAB_NAMES } from './types'
export type {
  LabPartner, TestPanel, LabOrderRequest, LabOrderResponse,
  LabReport, LabTestResult, PatientLabParameters,
} from './types'

import { ChughtaiLabController } from './chughtai'
import { ZeenatLabController } from './zeenat'
import type { LabPartner, LabOrderRequest, LabOrderResponse } from './types'

export class DiagnosticsController {
  private chughtai: ChughtaiLabController
  private zeenat: ZeenatLabController

  constructor() {
    this.chughtai = new ChughtaiLabController()
    this.zeenat = new ZeenatLabController()
  }

  async placeOrder(lab: LabPartner, request: LabOrderRequest): Promise<LabOrderResponse> {
    switch (lab) {
      case 'chughtai': return this.chughtai.placeOrder(request)
      case 'zeenat': return this.zeenat.placeOrder(request)
    }
  }
}

export const diagnosticsController = new DiagnosticsController()