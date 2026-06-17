// ─── Company Name Normalisation ────────────────────────────────────────────
// The single most important data quality function in TalentDash.
// "Google India", "GOOGLE", "google " → all become "google"
// "Tata Consultancy Services" → "tcs"

const LEGAL_SUFFIXES = [
  /\s+pvt\.?\s*ltd\.?$/i,
  /\s+private\s+limited$/i,
  /\s+ltd\.?$/i,
  /\s+inc\.?$/i,
  /\s+llc\.?$/i,
  /\s+corp\.?$/i,
  /\s+corporation$/i,
  /\s+technologies$/i,
  /\s+technology$/i,
  /\s+solutions$/i,
  /\s+services$/i,
  /\s+internet$/i,
  /\s+bpo$/i,
  /\s+limited$/i,
  /\.com$/i,
]

// Known aliases — must be a separate data structure (per spec)
const COMPANY_ALIASES: Record<string, string> = {
  "tata consultancy services": "tcs",
  "tata consultancy": "tcs",
  "tcs": "tcs",
  "amazon web services": "aws",
  "amazon.com": "amazon",
  "amazon india": "amazon",
  "infosys bpo": "infosys",
  "wipro technologies": "wipro",
  "wipro limited": "wipro",
  "flipkart internet": "flipkart",
  "flipkart internet pvt ltd": "flipkart",
  "microsoft india": "microsoft",
  "google india": "google",
  "meta platforms": "meta",
  "meta platforms inc": "meta",
  "facebook": "meta",
  "nvidia corporation": "nvidia",
  "nvidia": "nvidia",
  "razorpay software pvt ltd": "razorpay",
  "zepto": "zepto",
}

/**
 * Normalise a raw company name for storage and dedup lookups.
 * Returns lowercase canonical name (e.g. "google", "tcs", "amazon").
 */
export function normaliseCompanyName(raw: string): string {
  // Step 1: trim + lowercase
  let name = raw.trim().toLowerCase()

  // Step 2: check alias table first (before stripping suffixes)
  if (COMPANY_ALIASES[name]) return COMPANY_ALIASES[name]

  // Step 3: strip legal suffixes iteratively
  let prev = ""
  while (prev !== name) {
    prev = name
    for (const suffix of LEGAL_SUFFIXES) {
      name = name.replace(suffix, "").trim()
    }
  }

  // Step 4: check alias table again (after stripping)
  if (COMPANY_ALIASES[name]) return COMPANY_ALIASES[name]

  // Step 5: strip remaining non-alphanumeric except spaces/hyphens
  name = name.replace(/[^a-z0-9\s-]/g, "").trim()

  return name
}

/**
 * Convert a normalised company name to a URL-safe slug.
 * "google india" → "google-india", "tcs" → "tcs"
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

/**
 * Format a slug back to a display-friendly name.
 * "google-india" → "Google India"
 */
export function slugToDisplay(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
