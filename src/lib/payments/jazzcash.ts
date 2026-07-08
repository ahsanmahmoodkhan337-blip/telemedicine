/**
 * JazzCash Gateway Mock — Pakistan
 * Mobile wallet + card payments
 */

import type {
  PaymentRequest,
  PaymentResponse,
  CardDetails,
  MobileWalletDetails,
} from './types'

export class JazzCashGateway {
  buildPaymentPayload(request: PaymentRequest): Record<string, string> {
    const ppAmount = (request.amount * 100).toFixed(0)
    return {
      pp_Version: '2.0', pp_TxnType: 'MWALLET', pp_Language: 'EN',
      pp_MerchantID: 'JC_MER_98765', pp_Password: 'jc_secure_pwd_2024',
      pp_TxnRefNo: `JC${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      pp_Amount: ppAmount, pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14),
      pp_BillReference: request.id,
      pp_Description: request.description.substring(0, 30),
      pp_SecureHash: 'jc_hash_simulated',
      ppmpf_1: request.patientId, ppmpf_2: request.practitionerId,
      pp_ReturnURL: 'https://hhustlers.com/payments/jazzcash/return',
    }
  }

  async processCardPayment(
    request: PaymentRequest,
    _card: CardDetails
  ): Promise<PaymentResponse> {
    await this.delay(2000)
    const success = Math.random() > 0.1
    if (!success) {
      return {
        success: false, transactionId: request.id, gatewayReference: null,
        status: 'failed', amount: request.amount, currency: 'PKR',
        gatewayFee: 0, netAmount: 0,
        message: 'Transaction declined by issuer bank',
        timestamp: new Date().toISOString(),
      }
    }
    const fee = request.amount * 0.025 + 5
    return {
      success: true, transactionId: `JC-${request.id}-${Date.now()}`,
      gatewayReference: `JazzCash_${Date.now()}`,
      status: 'completed', amount: request.amount, currency: 'PKR',
      gatewayFee: parseFloat(fee.toFixed(2)),
      netAmount: parseFloat((request.amount - fee).toFixed(2)),
      message: `Payment of ₨${request.amount} completed via JazzCash`,
      timestamp: new Date().toISOString(),
    }
  }

  async initiateWalletPayment(
    request: PaymentRequest,
    _wallet: MobileWalletDetails
  ): Promise<PaymentResponse> {
    await this.delay(1200)
    return {
      success: true, transactionId: `JCW-${request.id}`,
      gatewayReference: `JC_SESSION_${Date.now()}`,
      status: 'pending', amount: request.amount, currency: 'PKR',
      gatewayFee: 0, netAmount: 0,
      message: 'Confirmation sent to JazzCash app. Please approve.',
      otpRequired: true,
      timestamp: new Date().toISOString(),
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}