/**
 * Alfa Payment Gateway (APG) — Multi-currency
 * Supports: cards, Raast ID, mobile wallets with currency conversion
 */

import type {
  PaymentRequest,
  PaymentResponse,
  CardDetails,
  RaastPaymentDetails,
  PaymentCurrency,
} from './types'
import { currencyConverter } from './currency'

export class APGGateway {
  async processCardPayment(
    request: PaymentRequest,
    _card: CardDetails
  ): Promise<PaymentResponse> {
    await this.delay(1800)
    const success = Math.random() > 0.12
    if (!success) {
      return {
        success: false, transactionId: request.id, gatewayReference: null,
        status: 'failed', amount: request.amount, currency: request.currency,
        gatewayFee: 0, netAmount: 0,
        message: 'Card authentication failed (3DS)',
        timestamp: new Date().toISOString(),
      }
    }
    const fee = request.amount * 0.032
    return {
      success: true, transactionId: `APG-${request.id}-${Date.now()}`,
      gatewayReference: `APG_${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
      status: 'completed', amount: request.amount, currency: request.currency,
      gatewayFee: parseFloat(fee.toFixed(2)),
      netAmount: parseFloat((request.amount - fee).toFixed(2)),
      message: `Payment of ${currencyConverter.format(request.amount, request.currency)} completed via APG`,
      timestamp: new Date().toISOString(),
    }
  }

  async processRaastPayment(
    request: PaymentRequest,
    raast: RaastPaymentDetails
  ): Promise<PaymentResponse> {
    await this.delay(1000)
    const idValid = /^\d{6,10}$/.test(raast.raastId)
    if (!idValid) {
      return {
        success: false, transactionId: request.id, gatewayReference: null,
        status: 'failed', amount: request.amount, currency: 'PKR',
        gatewayFee: 0, netAmount: 0,
        message: 'Invalid Raast ID format. Must be 6-10 digits.',
        timestamp: new Date().toISOString(),
      }
    }
    await this.delay(1500)
    const success = Math.random() > 0.05
    if (!success) {
      return {
        success: false, transactionId: request.id, gatewayReference: null,
        status: 'failed', amount: request.amount, currency: 'PKR',
        gatewayFee: 0, netAmount: 0,
        message: 'Raast transfer failed. Verify account details.',
        timestamp: new Date().toISOString(),
      }
    }
    const fee = 5.0
    return {
      success: true, transactionId: `RAST-${request.id}-${Date.now()}`,
      gatewayReference: `RAST_${Date.now()}`,
      status: 'completed', amount: request.amount, currency: 'PKR',
      gatewayFee: fee, netAmount: parseFloat((request.amount - fee).toFixed(2)),
      message: `₨${request.amount} transferred via Raast to ${raast.accountTitle}`,
      timestamp: new Date().toISOString(),
    }
  }

  /** Convert amount to another currency for APG processing */
  convertCurrency(
    amount: number,
    from: PaymentCurrency,
    to: PaymentCurrency
  ): { originalAmount: number; convertedAmount: number; rate: number } {
    const { converted, rate } = currencyConverter.convert(amount, from, to)
    return { originalAmount: amount, convertedAmount: converted, rate }
  }

  buildApiRequestPayload(
    request: PaymentRequest,
    method: 'card' | 'raast' | 'wallet'
  ): Record<string, unknown> {
    return {
      apiKey: 'apg_live_sk_x9k2m7n4',
      merchantId: 'APG_MER_554433',
      transactionId: request.id,
      amount: request.amount,
      currency: request.currency,
      description: request.description,
      paymentMethod: method,
      customerId: request.patientId,
      timestamp: new Date().toISOString(),
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}