/**
 * CheckoutPaymentFlow
 *
 * Reusable payment checkout component that can be embedded
 * in Doctor SOAP editor and Pharmacist flows.
 *
 * Supports:
 * - PayFast (ZAR): cards, net banking, bank transfer
 * - Easypaisa (PKR): mobile wallet OTP
 * - JazzCash (PKR): cards, mobile wallet
 * - APG (PKR/USD): cards, Raast ID
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  CreditCard, Smartphone, Building2, Wallet, Loader2, CheckCircle, XCircle, Banknote,
} from 'lucide-react'
import { toast } from 'sonner'
import { paymentProcessor } from '@/lib/payments/processor'
import { currencyConverter } from '@/lib/payments/currency'
import { MobileWalletOTPDialog } from '@/components/ui/otp-dialog'
import {
  GATEWAY_NAMES, GATEWAY_METHODS, CURRENCY_SYMBOLS, SA_BANKS,
} from '@/lib/payments/types'
import type {
  PaymentGateway, PaymentMethod, PaymentCurrency, PaymentRequest, PaymentResponse,
} from '@/lib/payments/types'

const gatewayList: PaymentGateway[] = ['payfast', 'easypaisa', 'jazzcash', 'apg']

const methodIcons: Record<string, React.ReactNode> = {
  credit_card: <CreditCard className="h-4 w-4" />,
  debit_card: <CreditCard className="h-4 w-4" />,
  mobile_wallet: <Smartphone className="h-4 w-4" />,
  raast_id: <Wallet className="h-4 w-4" />,
  bank_transfer: <Building2 className="h-4 w-4" />,
  net_banking: <Building2 className="h-4 w-4" />,
  otp_flow: <Smartphone className="h-4 w-4" />,
}

function AmountInput({ symbol, value, onChange, label }: {
  symbol: string; value: string; onChange: (v: string) => void; label: string
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-1">
        <span className="text-sm font-bold text-primary-500">{symbol}</span>
        <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0.00" className="h-8" />
      </div>
    </div>
  )
}

function getDefaultCurrency(g: PaymentGateway): PaymentCurrency {
  switch (g) {
    case 'payfast': return 'ZAR'
    case 'easypaisa': case 'jazzcash': return 'PKR'
    case 'apg': return 'PKR'
    default: return 'PKR'
  }
}

type CheckoutPaymentFlowProps = {
  patientId: string
  practitionerId: string
  appointmentId?: string
  /** Optional: show currency conversion card */
  showConversion?: boolean
  /** Optional: default amount to show */
  defaultAmount?: string
  /** Called when payment completes successfully */
  onPaymentComplete?: (response: PaymentResponse) => void
}

export function CheckoutPaymentFlow({
  patientId,
  practitionerId,
  appointmentId,
  showConversion = true,
  defaultAmount = '1500',
  onPaymentComplete,
}: CheckoutPaymentFlowProps) {
  const [gateway, setGateway] = useState<PaymentGateway>('payfast')
  const [amount, setAmount] = useState(defaultAmount)
  const [currency, setCurrency] = useState<PaymentCurrency>(getDefaultCurrency('payfast'))
  const [processing, setProcessing] = useState(false)
  const [response, setResponse] = useState<PaymentResponse | null>(null)
  const [selectedBank, setSelectedBank] = useState('')
  const [showOtpDialog, setShowOtpDialog] = useState(false)
  const [activeMethod, setActiveMethod] = useState<PaymentMethod | null>(null)
  const [convertTo, setConvertTo] = useState<PaymentCurrency>('USD')

  const symbol = CURRENCY_SYMBOLS[currency]
  const availableMethods = GATEWAY_METHODS[gateway]

  const handleGatewayChange = (g: string) => {
    const gw = g as PaymentGateway
    setGateway(gw)
    setCurrency(getDefaultCurrency(gw))
    setResponse(null)
  }

  const handlePay = async (method: PaymentMethod) => {
    setActiveMethod(method)
    setProcessing(true)
    setResponse(null)

    const request: PaymentRequest = {
      id: `CHK-${Date.now()}`,
      gateway,
      amount: parseFloat(amount),
      currency,
      description: `Consultation payment via ${GATEWAY_NAMES[gateway]}`,
      patientId,
      practitionerId,
      appointmentId,
      metadata: { patientName: 'Patient' },
    }

    try {
      let result: PaymentResponse

      switch (method) {
        case 'credit_card':
        case 'debit_card':
          result = await paymentProcessor.processCardPayment(gateway, request, {
            cardNumber: '4111 1111 1111 1111', cardHolder: 'Patient',
            expiryMonth: '12', expiryYear: '2026', cvv: '123',
          })
          break
        case 'net_banking':
          if (!selectedBank) { toast.error('Please select a bank'); setProcessing(false); return }
          result = await paymentProcessor.processNetBanking(request, {
            bankCode: selectedBank,
            bankName: SA_BANKS.find(b => b.code === selectedBank)?.name ?? selectedBank,
          })
          break
        case 'mobile_wallet':
          setShowOtpDialog(true)
          setProcessing(false)
          return
        case 'raast_id':
          result = await paymentProcessor.processRaastPayment(request, {
            raastId: '0312345678', accountTitle: 'Patient', bankName: 'Bank Alfalah',
          })
          break
        case 'bank_transfer':
          result = await paymentProcessor.processBankTransfer(request)
          break
        default:
          throw new Error(`Method ${method} not available`)
      }

      setResponse(result)
      if (result.success) onPaymentComplete?.(result)
    } catch (err) {
      setResponse({
        success: false, transactionId: request.id, gatewayReference: null,
        status: 'failed', amount: request.amount, currency,
        gatewayFee: 0, netAmount: 0,
        message: err instanceof Error ? err.message : 'Payment error',
        timestamp: new Date().toISOString(),
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleOtpConfirm = async (phone: string, otp: string) => {
    const request: PaymentRequest = {
      id: `OTP-${Date.now()}`,
      gateway: 'easypaisa',
      amount: parseFloat(amount), currency: 'PKR',
      description: 'Consultation via Easypaisa',
      patientId, practitionerId,
    }
    const initResult = await paymentProcessor.initiateWalletPayment('easypaisa', request, {
      phoneNumber: phone, provider: 'easypaisa',
    })
    if (!initResult.gatewayReference) throw new Error('No session')

    const result = await paymentProcessor.confirmWalletOTP(
      'easypaisa', request, initResult.gatewayReference, otp
    )
    setResponse(result)
    if (result.success) onPaymentComplete?.(result)
    if (!result.success) throw new Error(result.message)
  }

  const fee = paymentProcessor.calculateFee(gateway, parseFloat(amount || '0'))

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span>Checkout</span>
            {response?.success && <Badge variant="accent">Paid</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Gateway selector */}
          <div className="flex flex-wrap gap-1">
            {gatewayList.map((g) => (
              <Button
                key={g} size="sm" variant={gateway === g ? 'default' : 'outline'}
                onClick={() => handleGatewayChange(g)}
              >
                {GATEWAY_NAMES[g]}
              </Button>
            ))}
          </div>

          {/* Amount */}
          <div className="grid grid-cols-2 gap-2">
            <AmountInput symbol={symbol} value={amount} onChange={setAmount} label="Amount" />
            <div className="space-y-1">
              <Label className="text-xs">Fee</Label>
              <div className="flex h-8 items-center rounded-md border border-primary-200 px-3 text-sm">
                {symbol}{fee.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Net Banking bank selector */}
          {gateway === 'payfast' && (
            <div className="space-y-1">
              <Label className="text-xs">Select Bank (Net Banking)</Label>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Choose your bank" />
                </SelectTrigger>
                <SelectContent>
                  {SA_BANKS.map((b) => (
                    <SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Payment method buttons */}
          <div className="grid grid-cols-2 gap-1">
            {availableMethods.map((method) => (
              <Button
                key={method} variant="outline" size="sm"
                className="justify-start gap-1 text-xs"
                onClick={() => handlePay(method)}
                disabled={processing}
              >
                {methodIcons[method]}
                {method === 'net_banking' ? 'Net Banking' :
                 method === 'credit_card' ? 'Credit Card' :
                 method === 'debit_card' ? 'Debit Card' :
                 method === 'mobile_wallet' ? 'Wallet' :
                 method === 'raast_id' ? 'Raast' :
                 method === 'bank_transfer' ? 'Bank Transfer' :
                 method === 'otp_flow' ? 'OTP' : method}
              </Button>
            ))}
          </div>

          {/* Processing */}
          {processing && (
            <div className="flex items-center justify-center gap-2 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-accent-600" />
              <span className="text-xs text-primary-500">Processing {GATEWAY_NAMES[gateway]}...</span>
            </div>
          )}

          {/* Result */}
          {response && (
            <div className={`rounded-lg p-2 text-xs ${response.success ? 'bg-accent-50 text-accent-700' : 'bg-red-50 text-red-700'}`}>
              <div className="flex items-center gap-1 font-medium">
                {response.success ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                {response.success ? 'Payment successful' : 'Payment failed'}
              </div>
              <p className="mt-1 opacity-80">{response.message}</p>
              <p className="mt-0.5 font-mono">Ref: {response.transactionId}</p>
            </div>
          )}

          {/* Currency conversion card */}
          {showConversion && (
            <div className="rounded border border-primary-200 bg-primary-50 p-2 dark:border-primary-800 dark:bg-primary-900">
              <Label className="mb-1 block text-xs font-medium">Currency Converter</Label>
              <div className="grid grid-cols-3 gap-1 text-xs">
                <div>
                  <span className="text-primary-500">{symbol}</span>
                  <span className="ml-1 font-medium">{parseFloat(amount || '0').toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-center">
                  <Banknote className="h-3 w-3 text-primary-400" />
                </div>
                <Select value={convertTo} onValueChange={(v) => setConvertTo(v as PaymentCurrency)}>
                  <SelectTrigger className="h-6 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PKR">₨ PKR</SelectItem>
                    <SelectItem value="ZAR">R ZAR</SelectItem>
                    <SelectItem value="USD">$ USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {currency !== convertTo && (
                <p className="mt-1 text-center text-xs text-primary-500">
                  ≈ {currencyConverter.convert(parseFloat(amount || '0'), currency, convertTo).converted.toFixed(2)} {convertTo}
                  {' '}
                  <span className="text-primary-400">
                    @ {currencyConverter.convert(1, currency, convertTo).rate}
                  </span>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <MobileWalletOTPDialog
        open={showOtpDialog}
        onOpenChange={setShowOtpDialog}
        gatewayName={GATEWAY_NAMES[gateway]}
        onConfirm={handleOtpConfirm}
      />
    </>
  )
}