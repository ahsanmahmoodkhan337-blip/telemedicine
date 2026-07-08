/**
 * Easypaisa Gateway Mock — Pakistan
 * Mobile wallet OTP simulation
 */

import type {
  PaymentRequest,
  PaymentResponse,
  MobileWalletDetails,
} from './types'

const PHONE_DELAY = 2000 // Simulated SMS delivery delay

export class EasypaisaGateway {
  async initiateWalletPayment(
    request: PaymentRequest,
    wallet: MobileWalletDetails
  ): Promise<PaymentResponse> {
    await this.delay(1000)
    const sessionToken = `EP_SESSION_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    return {
      success: true,
      transactionId: `EP-${request.id}`,
      gatewayReference: sessionToken,
      status: 'pending',
      amount: request.amount,
      currency: 'PKR',
      gatewayFee: 0,
      netAmount: 0,
      message: `OTP sent to ${wallet.phoneNumber}. Use code 1234 to confirm.`,
      otpRequired: true,
      timestamp: new Date().toISOString(),
    }
  }

  /** Simulate OTP arrival delay */
  async simulateOtpDelivery(): Promise<void> {
    await this.delay(PHONE_DELAY)
  }

  async confirmWithOTP(
    request: PaymentRequest,
    sessionToken: string,
    otp: string
  ): Promise<PaymentResponse> {
    await this.delay(2000)
    const otpValid = otp === '1234' || Math.random() > 0.2
    if (!otpValid) {
      return {
        success: false, transactionId: request.id,
        gatewayReference: sessionToken, status: 'failed',
        amount: request.amount, currency: 'PKR',
        gatewayFee: 0, netAmount: 0,
        message: 'Invalid OTP. Please try again.',
        timestamp: new Date().toISOString(),
      }
    }
    const fee = request.amount * 0.015
    return {
      success: true, transactionId: `EP-${request.id}-${Date.now()}`,
      gatewayReference: sessionToken, status: 'completed',
      amount: request.amount, currency: 'PKR',
      gatewayFee: parseFloat(fee.toFixed(2)),
      netAmount: parseFloat((request.amount - fee).toFixed(2)),
      message: `Payment of ₨${request.amount} completed via Easypaisa`,
      timestamp: new Date().toISOString(),
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}