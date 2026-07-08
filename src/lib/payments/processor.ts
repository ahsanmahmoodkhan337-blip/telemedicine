/**
 * Payment Processor — unified interface for all gateways
 */

import type {
  PaymentGateway,
  PaymentRequest,
  PaymentResponse,
  CardDetails,
  MobileWalletDetails,
  RaastPaymentDetails,
  NetBankingDetails,
} from './types'
import { PayFastGateway } from './payfast'
import { EasypaisaGateway } from './easypaisa'
import { JazzCashGateway } from './jazzcash'
import { APGGateway } from './apg'

export class PaymentProcessor {
  private payfast: PayFastGateway
  private easypaisa: EasypaisaGateway
  private jazzcash: JazzCashGateway
  private apg: APGGateway

  constructor() {
    this.payfast = new PayFastGateway()
    this.easypaisa = new EasypaisaGateway()
    this.jazzcash = new JazzCashGateway()
    this.apg = new APGGateway()
  }

  async processCardPayment(
    gateway: PaymentGateway, request: PaymentRequest, card: CardDetails
  ): Promise<PaymentResponse> {
    switch (gateway) {
      case 'payfast': return this.payfast.processCardPayment(request, card)
      case 'jazzcash': return this.jazzcash.processCardPayment(request, card)
      case 'apg': return this.apg.processCardPayment(request, card)
      default: throw new Error(`Card payments not supported by ${gateway}`)
    }
  }

  async processNetBanking(
    request: PaymentRequest, bank: NetBankingDetails
  ): Promise<PaymentResponse> {
    return this.payfast.processNetBanking(request, bank)
  }

  async initiateWalletPayment(
    gateway: PaymentGateway, request: PaymentRequest, wallet: MobileWalletDetails
  ): Promise<PaymentResponse> {
    switch (gateway) {
      case 'easypaisa': return this.easypaisa.initiateWalletPayment(request, wallet)
      case 'jazzcash': return this.jazzcash.initiateWalletPayment(request, wallet)
      default: throw new Error(`Wallet not supported by ${gateway}`)
    }
  }

  async confirmWalletOTP(
    _gateway: PaymentGateway, request: PaymentRequest, sessionToken: string, otp: string
  ): Promise<PaymentResponse> {
    return this.easypaisa.confirmWithOTP(request, sessionToken, otp)
  }

  async processRaastPayment(
    request: PaymentRequest, raast: RaastPaymentDetails
  ): Promise<PaymentResponse> {
    return this.apg.processRaastPayment(request, raast)
  }

  async processBankTransfer(request: PaymentRequest): Promise<PaymentResponse> {
    return this.payfast.processBankTransfer(request)
  }

  calculateFee(gateway: PaymentGateway, amount: number): number {
    switch (gateway) {
      case 'payfast': return parseFloat((amount * 0.029 + 2.0).toFixed(2))
      case 'easypaisa': return parseFloat((amount * 0.015).toFixed(2))
      case 'jazzcash': return parseFloat((amount * 0.025 + 5).toFixed(2))
      case 'apg': return parseFloat((amount * 0.032).toFixed(2))
      case 'raast': return 5.0
    }
  }
}

export const paymentProcessor = new PaymentProcessor()