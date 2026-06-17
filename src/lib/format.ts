import { USD_TO_INR } from "./constants"

type CurrencyCode = "INR" | "USD" | "GBP" | "EUR"

/**
 * Format a salary value (in smallest unit) for display.
 * INR values are in paise, USD in cents.
 */
export function formatSalary(
  amount: bigint | number,
  currency: CurrencyCode,
  displayCurrency?: CurrencyCode
): string {
  const numAmount = typeof amount === "bigint" ? Number(amount) : amount

  // Convert to display currency if needed
  let displayAmount = numAmount
  const targetCurrency = displayCurrency ?? currency

  if (currency !== targetCurrency) {
    displayAmount = convertCurrency(numAmount, currency, targetCurrency)
  }

  return formatByCurrency(displayAmount, targetCurrency)
}

/**
 * Format a number by currency conventions.
 * INR: uses Indian lakh/crore system with ₹ prefix
 * USD: standard US format with $ prefix
 */
function formatByCurrency(amount: number, currency: CurrencyCode): string {
  switch (currency) {
    case "INR":
      return formatINR(amount)
    case "USD":
      return formatUSD(amount)
    case "GBP":
      return `£${formatWithCommas(Math.round(amount / 100))}`
    case "EUR":
      return `€${formatWithCommas(Math.round(amount / 100))}`
    default:
      return String(amount)
  }
}

/**
 * Format INR amount (in paise) using Indian lakh/crore system.
 * 4500000 paise → ₹45,000 (₹45K)
 * 45000000 paise → ₹4,50,000 (₹4.5L)
 * 40000000 paise → ₹4,00,000 
 *
 * Note: base_salary is stored in PAISE (smallest unit).
 * ₹45 LPA = 4,500,000 paise
 */
export function formatINR(paise: number): string {
  const rupees = Math.round(paise / 100)

  if (rupees >= 10000000) {
    // Crore
    const crore = rupees / 10000000
    return `₹${crore % 1 === 0 ? crore.toFixed(0) : crore.toFixed(2)} Cr`
  } else if (rupees >= 100000) {
    // Lakh
    const lakh = rupees / 100000
    return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(2)} L`
  } else {
    return `₹${formatWithCommas(rupees)}`
  }
}

/**
 * Format USD amount (in cents) with standard US formatting.
 */
export function formatUSD(cents: number): string {
  const dollars = Math.round(cents / 100)
  if (dollars >= 1000000) {
    return `$${(dollars / 1000000).toFixed(1)}M`
  } else if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(0)}K`
  }
  return `$${formatWithCommas(dollars)}`
}

/**
 * Convert between currencies.
 * All stored values are in smallest unit (paise for INR, cents for USD).
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (from === to) return amount

  // Normalise to INR paise first
  let inrPaise = amount
  if (from === "USD") inrPaise = amount * USD_TO_INR
  else if (from === "GBP") inrPaise = amount * 106.0
  else if (from === "EUR") inrPaise = amount * 90.0

  // Convert from INR paise to target
  if (to === "INR") return Math.round(inrPaise)
  if (to === "USD") return Math.round(inrPaise / USD_TO_INR)
  if (to === "GBP") return Math.round(inrPaise / 106.0)
  if (to === "EUR") return Math.round(inrPaise / 90.0)

  return Math.round(inrPaise)
}

function formatWithCommas(n: number): string {
  return n.toLocaleString("en-IN")
}

/**
 * Format a delta value (difference between two salaries) with + or - prefix.
 */
export function formatDelta(delta: bigint | number, currency: CurrencyCode): string {
  const numDelta = typeof delta === "bigint" ? Number(delta) : delta
  if (numDelta === 0) return "—"
  const abs = Math.abs(numDelta)
  const formatted = formatByCurrency(abs, currency)
  return numDelta > 0 ? `+${formatted}` : `-${formatted}`
}

/**
 * Format experience years for display.
 */
export function formatExperience(years: number): string {
  if (years === 1) return "1 yr"
  return `${years} yrs`
}
