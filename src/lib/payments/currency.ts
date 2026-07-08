/**
 * Currency Conversion Module
 * Supports PKR, ZAR, USD with mock live rates
 */

import { FX_RATES } from './types'
import type { PaymentCurrency } from './types'

export class CurrencyConverter {
  /**
   * Convert an amount from one currency to another
   */
  convert(
    amount: number,
    from: PaymentCurrency,
    to: PaymentCurrency
  ): { converted: number; rate: number } {
    if (from === to) return { converted: amount, rate: 1 }

    const pair = `${from}_${to}`
    let rate = FX_RATES[pair]

    if (!rate) {
      // Try reverse pair
      const reversePair = `${to}_${from}`
      const reverseRate = FX_RATES[reversePair]
      if (reverseRate) {
        rate = 1 / reverseRate
      } else {
        // Cross via USD
        const fromUSD = FX_RATES[`${from}_USD`] || (FX_RATES[`USD_${from}`] ? 1 / FX_RATES[`USD_${from}`] : null)
        const toUSD = FX_RATES[`${to}_USD`] || (FX_RATES[`USD_${to}`] ? 1 / FX_RATES[`USD_${to}`] : null)
        if (fromUSD && toUSD) {
          rate = toUSD / fromUSD
        } else {
          throw new Error(`No conversion rate for ${from} -> ${to}`)
        }
      }
    }

    return {
      converted: parseFloat((amount * rate).toFixed(2)),
      rate: parseFloat(rate.toFixed(6)),
    }
  }

  /**
   * Format amount with currency symbol
   */
  format(amount: number, currency: PaymentCurrency): string {
    const symbols: Record<PaymentCurrency, string> = { PKR: '₨', ZAR: 'R', USD: '$' }
    return `${symbols[currency]}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  /**
   * Get available conversion pairs
   */
  getAvailablePairs(): { from: PaymentCurrency; to: PaymentCurrency; rate: number }[] {
    const currencies: PaymentCurrency[] = ['USD', 'ZAR', 'PKR']
    const pairs: { from: PaymentCurrency; to: PaymentCurrency; rate: number }[] = []
    for (const from of currencies) {
      for (const to of currencies) {
        if (from !== to) {
          try {
            const { rate } = this.convert(1, from, to)
            pairs.push({ from, to, rate })
          } catch { /* skip */ }
        }
      }
    }
    return pairs
  }
}

export const currencyConverter = new CurrencyConverter()