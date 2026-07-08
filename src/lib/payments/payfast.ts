/**
 * PayFast Gateway Mock — South Africa
 * Supports: credit/debit cards, Direct Net Banking, bank transfer, Raast
 */

import type {
  PaymentRequest,
  PaymentResponse,
  PayFastConfig,
  CardDetails,
  NetBankingDetails,
} from './types'

const DEFAULT_CONFIG: PayFastConfig = {
  merchantId: '10000100',
  merchantKey: '46f0cd694581a',
  returnUrl: 'https://hhustlers.com/payments/success',
  cancelUrl: 'https://hhustlers.com/payments/cancel',
  notifyUrl: 'https://api.hhustlers.com/payments/payfast/notify',
  passPhrase: 'hhustlers_secure_pass',
}

export class PayFastGateway {
  private config: PayFastConfig

  constructor(config?: Partial<PayFastConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  buildPaymentPayload(request: PaymentRequest): Record<string, string> {
    const payload: Record<string, string> = {
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      return_url: this.config.returnUrl,
      cancel_url: this.config.cancelUrl,
      notify_url: this.config.notifyUrl,
      m_payment_id: request.id,
      amount: request.amount.toFixed(2),
      item_name: request.description.substring(0, 100),
      custom_str1: request.patientId,
      custom_str2: request.practitionerId,
      email_confirmation: '1',
    }

    const sigStr = Object.entries(payload)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')
    payload.signature = `sig_${Buffer.from(sigStr).toString('base64').substring(0, 32)}`
    return payload
  }

  /** Card payment */
  async processCardPayment(
    request: PaymentRequest,
    _card: CardDetails
  ): Promise<PaymentResponse> {
    await this.delay(1500)
    const success = Math.random() > 0.15
    if (!success) {
      return {
        success: false, transactionId: request.id, gatewayReference: null,
        status: 'failed', amount: request.amount, currency: request.currency,
        gatewayFee: 0, netAmount: 0,
        message: 'Card declined — insufficient funds',
        timestamp: new Date().toISOString(),
      }
    }
    const fee = request.amount * 0.029 + 2.0
    return {
      success: true, transactionId: `PF-${request.id}-${Date.now()}`,
      gatewayReference: `PF${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      status: 'completed', amount: request.amount, currency: request.currency,
      gatewayFee: parseFloat(fee.toFixed(2)), netAmount: parseFloat((request.amount - fee).toFixed(2)),
      message: `Payment of R${request.amount} successful via PayFast`,
      timestamp: new Date().toISOString(),
    }
  }

  /** Direct Net Banking — PayFast redirects user to their bank's login page */
  async processNetBanking(
    request: PaymentRequest,
    bank: NetBankingDetails
  ): Promise<PaymentResponse> {
    await this.delay(800)
    const success = Math.random() > 0.1
    if (!success) {
      return {
        success: false, transactionId: request.id, gatewayReference: null,
        status: 'failed', amount: request.amount, currency: request.currency,
        gatewayFee: 0, netAmount: 0,
        message: `${bank.bankName} authentication failed`,
        timestamp: new Date().toISOString(),
      }
    }
    const fee = 3.50 // Fixed fee for net banking
    return {
      success: true, transactionId: `PF-NB-${request.id}`,
      gatewayReference: `NB${Date.now()}`,
      status: 'completed', amount: request.amount, currency: request.currency,
      gatewayFee: fee, netAmount: parseFloat((request.amount - fee).toFixed(2)),
      message: `Payment via ${bank.bankName} Net Banking successful`,
      redirectUrl: `https://www.payfast.co.za/process/netbanking/${bank.bankCode}`,
      timestamp: new Date().toISOString(),
    }
  }

  /** Bank transfer / EFT */
  async processBankTransfer(request: PaymentRequest): Promise<PaymentResponse> {
    await this.delay(800)
    return {
      success: true, transactionId: `PF-EFT-${request.id}`,
      gatewayReference: `EFT${Date.now()}`,
      status: 'processing', amount: request.amount, currency: request.currency,
      gatewayFee: 0, netAmount: request.amount,
      message: 'Bank transfer initiated. Complete via your banking app.',
      redirectUrl: 'https://www.payfast.co.za/process/eft',
      timestamp: new Date().toISOString(),
    }
  }

  verifyItnSignature(payload: Record<string, string>): boolean {
    return payload.signature === `sig_${Buffer.from(
      Object.entries(payload).filter(([k]) => k !== 'signature')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
    ).toString('base64').substring(0, 32)}`
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  getConfig(): PayFastConfig {
    return { ...this.config }
  }
}