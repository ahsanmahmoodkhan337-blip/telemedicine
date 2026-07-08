/**
 * Payment Types
 *
 * Shared type definitions for all local payment gateway integrations
 */

export type PaymentGateway =
  | 'payfast'
  | 'easypaisa'
  | 'jazzcash'
  | 'apg'
  | 'raast'

export type PaymentCurrency = 'PKR' | 'ZAR' | 'USD'

export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'mobile_wallet'
  | 'raast_id'
  | 'bank_transfer'
  | 'net_banking'
  | 'otp_flow'

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled'

export type PaymentRequest = {
  id: string
  gateway: PaymentGateway
  amount: number
  currency: PaymentCurrency
  description: string
  patientId: string
  practitionerId: string
  appointmentId?: string
  metadata?: Record<string, string>
}

export type PaymentResponse = {
  success: boolean
  transactionId: string
  gatewayReference: string | null
  status: PaymentStatus
  amount: number
  currency: PaymentCurrency
  gatewayFee: number
  netAmount: number
  message: string
  timestamp: string
  redirectUrl?: string
  otpRequired?: boolean
}

export type CardDetails = {
  cardNumber: string
  cardHolder: string
  expiryMonth: string
  expiryYear: string
  cvv: string
}

export type MobileWalletDetails = {
  phoneNumber: string
  provider: 'easypaisa' | 'jazzcash'
  otp?: string
}

export type RaastPaymentDetails = {
  raastId: string
  accountTitle: string
  bankName: string
}

export type NetBankingDetails = {
  bankCode: string
  bankName: string
}

export type PayFastConfig = {
  merchantId: string
  merchantKey: string
  returnUrl: string
  cancelUrl: string
  notifyUrl: string
  passPhrase?: string
}

export type EasypaisaConfig = {
  merchantId: string
  apiKey: string
  apiSecret: string
  baseUrl: string
}

export type JazzCashConfig = {
  merchantId: string
  password: string
  integritySalt: string
  returnUrl: string
  baseUrl: string
}

export type APGConfig = {
  merchantId: string
  apiKey: string
  secretKey: string
  baseUrl: string
}

export const CURRENCY_SYMBOLS: Record<PaymentCurrency, string> = {
  PKR: '₨',
  ZAR: 'R',
  USD: '$',
}

export const GATEWAY_NAMES: Record<PaymentGateway, string> = {
  payfast: 'PayFast',
  easypaisa: 'Easypaisa',
  jazzcash: 'JazzCash',
  apg: 'Alfa Payment Gateway',
  raast: 'Raast',
}

export const GATEWAY_CURRENCIES: Record<PaymentGateway, PaymentCurrency[]> = {
  payfast: ['ZAR', 'USD'],
  easypaisa: ['PKR'],
  jazzcash: ['PKR'],
  apg: ['PKR', 'USD'],
  raast: ['PKR'],
}

export const GATEWAY_METHODS: Record<PaymentGateway, PaymentMethod[]> = {
  payfast: ['credit_card', 'debit_card', 'net_banking', 'bank_transfer'],
  easypaisa: ['mobile_wallet', 'otp_flow'],
  jazzcash: ['mobile_wallet', 'otp_flow', 'credit_card', 'debit_card'],
  apg: ['credit_card', 'debit_card', 'mobile_wallet', 'raast_id'],
  raast: ['raast_id'],
}

// South African banks for PayFast Direct Net Banking
export const SA_BANKS = [
  { code: 'ABS', name: 'Absa Bank' },
  { code: 'FNB', name: 'First National Bank' },
  { code: 'NED', name: 'Nedbank' },
  { code: 'SBK', name: 'Standard Bank' },
  { code: 'CAP', name: 'Capitec Bank' },
  { code: 'INV', name: 'Investec Bank' },
  { code: 'AFR', name: 'African Bank' },
]

// Currency conversion rates (base: 1 USD)
export const FX_RATES: Record<string, number> = {
  'USD_PKR': 278.50,
  'USD_ZAR': 18.20,
  'ZAR_PKR': 15.30,
  'PKR_USD': 0.00359,
  'ZAR_USD': 0.0549,
  'PKR_ZAR': 0.0654,
}