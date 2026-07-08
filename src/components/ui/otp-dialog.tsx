/**
 * MobileWalletOTPDialog
 *
 * Reusable OTP input dialog for Easypaisa/JazzCash mobile wallet payments.
 * Shows phone number input, OTP field, and confirmation/cancel buttons.
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2, Smartphone, CheckCircle, XCircle } from 'lucide-react'

type OtpDialogState = 'phone-input' | 'otp-sent' | 'processing' | 'success' | 'error'

type MobileWalletOTPDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  gatewayName: string
  onConfirm: (phoneNumber: string, otp: string) => Promise<void>
}

export function MobileWalletOTPDialog({
  open,
  onOpenChange,
  gatewayName,
  onConfirm,
}: MobileWalletOTPDialogProps) {
  const [state, setState] = useState<OtpDialogState>('phone-input')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [message, setMessage] = useState('')

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setState('phone-input')
      setPhoneNumber('')
      setOtp('')
      setMessage('')
    }
  }, [open])

  const handleSendOtp = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setMessage('Please enter a valid phone number')
      return
    }
    setState('otp-sent')
    setMessage(`OTP sent to ${phoneNumber}. Use code 1234 to confirm.`)
  }

  const handleConfirm = async () => {
    if (!otp || otp.length < 4) {
      setMessage('Please enter the 4-digit OTP')
      return
    }
    setState('processing')
    try {
      await onConfirm(phoneNumber, otp)
      setState('success')
      setMessage('Payment completed successfully!')
      setTimeout(() => onOpenChange(false), 1500)
    } catch {
      setState('error')
      setMessage('Payment failed. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-accent-600" />
            {gatewayName} Wallet Payment
          </DialogTitle>
          <DialogDescription>
            Enter your mobile wallet number to receive an OTP
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Phone Number Input */}
          <div className="space-y-2">
            <Label>Mobile Number</Label>
            <Input
              type="tel"
              placeholder="03XX XXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={state !== 'phone-input'}
            />
          </div>

          {/* OTP Input (shown after sending) */}
          {(state === 'otp-sent' || state === 'processing' || state === 'error') && (
            <div className="space-y-2">
              <Label>OTP Code</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="1234"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={state === 'processing' || state === 'success'}
                  className="text-center text-lg tracking-widest"
                />
              </div>
            </div>
          )}

          {/* Status message */}
          {message && (
            <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
              state === 'success' ? 'bg-accent-50 text-accent-700' :
              state === 'error' ? 'bg-red-50 text-red-700' :
              'bg-amber-50 text-amber-700'
            }`}>
              {state === 'success' ? <CheckCircle className="h-4 w-4" /> :
               state === 'error' ? <XCircle className="h-4 w-4" /> :
               <Smartphone className="h-4 w-4" />}
              {message}
            </div>
          )}

          {/* Processing indicator */}
          {state === 'processing' && (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-accent-600" />
              <span className="text-sm text-primary-500">Processing payment...</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={state === 'processing'}>
            Cancel
          </Button>
          {state === 'phone-input' && (
            <Button onClick={handleSendOtp} variant="accent">
              Send OTP
            </Button>
          )}
          {state === 'otp-sent' && (
            <Button onClick={handleConfirm} variant="accent" disabled={otp.length < 4}>
              Confirm Payment
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}