export { DVAGOController } from './dvago'
export { DawaaiController } from './dawaai'
export { TabiyatController } from './tabiyat'
export { PHARMACY_NAMES } from './types'
export type {
  PharmacyPartner, PrescriptionDispatch, PrescriptionItem,
  DispatchResponse, PharmacyProduct,
} from './types'

import { DVAGOController } from './dvago'
import { DawaaiController } from './dawaai'
import { TabiyatController } from './tabiyat'
import type { PharmacyPartner, PrescriptionDispatch, DispatchResponse } from './types'

export class PharmacyDispatchController {
  private dvago: DVAGOController
  private dawaai: DawaaiController
  private tabiyat: TabiyatController

  constructor() {
    this.dvago = new DVAGOController()
    this.dawaai = new DawaaiController()
    this.tabiyat = new TabiyatController()
  }

  async placeOrder(partner: PharmacyPartner, dispatch: PrescriptionDispatch): Promise<DispatchResponse> {
    switch (partner) {
      case 'dvago': return this.dvago.placeOrder(dispatch)
      case 'dawaai': return this.dawaai.placeOrder(dispatch)
      case 'tabiyat': return this.tabiyat.placeOrder(dispatch)
    }
  }
}

export const pharmacyDispatch = new PharmacyDispatchController()