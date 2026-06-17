// Currency conversion rates (stored once, used everywhere)
// These are approximate fixed rates for display purposes
export const CONVERSION_RATES: Record<string, number> = {
  INR_TO_USD: 1 / 83.5,
  USD_TO_INR: 83.5,
  GBP_TO_INR: 106.0,
  EUR_TO_INR: 90.0,
  INR_TO_GBP: 1 / 106.0,
  INR_TO_EUR: 1 / 90.0,
}

export const USD_TO_INR = 83.5

// Pagination
export const DEFAULT_PAGE_SIZE = 25
export const MAX_PAGE_SIZE = 100

// Cache revalidation times (in seconds)
export const REVALIDATE_SALARY_LIST = 300 // 5 minutes
export const REVALIDATE_COMPANY_PAGE = 3600 // 1 hour
export const REVALIDATE_HOMEPAGE = 3600

// Duplicate detection window
export const DUPLICATE_WINDOW_HOURS = 48
export const DUPLICATE_SALARY_TOLERANCE = 0.10 // 10%

// Confidence score floors
export const CONFIDENCE_FLOOR_SCRAPED = 0.5
export const CONFIDENCE_FLOOR_CONTRIBUTOR = 0.9
export const CONFIDENCE_REVIEW_THRESHOLD = 0.4

// Site metadata
export const SITE_NAME = "TalentDash"
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://talentdash.vercel.app"
export const SITE_DESCRIPTION =
  "India's most structured compensation intelligence platform. Real salary data for tech, finance, and beyond."
