import { PrismaClient, Level, Currency, Source } from "@prisma/client"

const prisma = new PrismaClient()

// ─── Company name normalisation (mirrors lib/normalise.ts) ─────────────────
const LEGAL_SUFFIXES = [
  /\s+pvt\.?\s*ltd\.?$/i,
  /\s+private\s+limited$/i,
  /\s+ltd\.?$/i,
  /\s+inc\.?$/i,
  /\s+llc\.?$/i,
  /\s+corp\.?$/i,
  /\s+technologies$/i,
  /\s+technology$/i,
  /\s+solutions$/i,
  /\s+services$/i,
  /\s+internet$/i,
  /\s+bpo$/i,
  /\.com$/i,
]

const ALIASES: Record<string, string> = {
  "tata consultancy services": "tcs",
  "tata consultancy": "tcs",
  "tcs ltd": "tcs",
  "amazon web services": "aws",
  "amazon.com": "amazon",
  "infosys bpo": "infosys",
  "wipro technologies": "wipro",
  "wipro limited": "wipro",
  "flipkart internet": "flipkart",
  "flipkart internet pvt ltd": "flipkart",
  "microsoft india": "microsoft",
  "google india": "google",
  "meta platforms": "meta",
  "nvidia corporation": "nvidia",
}

function normaliseCompanyName(raw: string): string {
  let name = raw.trim().toLowerCase()
  for (const suffix of LEGAL_SUFFIXES) {
    name = name.replace(suffix, "").trim()
  }
  name = name.replace(/[^a-z0-9\s-]/g, "").trim()
  return ALIASES[name] ?? name
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

// ─── Company definitions ───────────────────────────────────────────────────
const COMPANIES = [
  // Demonstrates normalisation: "Google India", "GOOGLE", "google" → same record
  { raw: "Google India", industry: "Technology", headquarters: "Mountain View, USA", founded_year: 1998, headcount_range: "100,000+" },
  { raw: "Amazon", industry: "E-Commerce / Technology", headquarters: "Seattle, USA", founded_year: 1994, headcount_range: "100,000+" },
  { raw: "Meta", industry: "Social Media / Technology", headquarters: "Menlo Park, USA", founded_year: 2004, headcount_range: "50,000–100,000" },
  { raw: "Microsoft", industry: "Technology", headquarters: "Redmond, USA", founded_year: 1975, headcount_range: "100,000+" },
  { raw: "Flipkart", industry: "E-Commerce", headquarters: "Bengaluru, India", founded_year: 2007, headcount_range: "10,000–50,000" },
  { raw: "Meesho", industry: "Social Commerce", headquarters: "Bengaluru, India", founded_year: 2015, headcount_range: "5,000–10,000" },
  { raw: "NVIDIA Corporation", industry: "Semiconductors / AI", headquarters: "Santa Clara, USA", founded_year: 1993, headcount_range: "20,000–50,000" },
  { raw: "Tata Consultancy Services", industry: "IT Services", headquarters: "Mumbai, India", founded_year: 1968, headcount_range: "100,000+" },
  { raw: "Infosys", industry: "IT Services", headquarters: "Bengaluru, India", founded_year: 1981, headcount_range: "100,000+" },
  { raw: "Wipro", industry: "IT Services", headquarters: "Bengaluru, India", founded_year: 1945, headcount_range: "100,000+" },
  { raw: "Razorpay", industry: "Fintech", headquarters: "Bengaluru, India", founded_year: 2014, headcount_range: "2,500–5,000" },
  { raw: "Zepto", industry: "Quick Commerce", headquarters: "Mumbai, India", founded_year: 2021, headcount_range: "1,000–2,500" },
]

// ─── Salary records ────────────────────────────────────────────────────────
const SALARY_RECORDS = [
  // ── GOOGLE (normalisation demo: also seeded as "GOOGLE" and "google") ──
  { company: "Google India", role: "Software Engineer", level: Level.L4, location: "Bengaluru", currency: Currency.INR, experience_years: 4, base_salary: 4500000n, bonus: 800000n, stock: 2000000n, source: Source.CONTRIBUTOR, confidence_score: 0.95, is_verified: true },
  { company: "GOOGLE", role: "Software Engineer", level: Level.L5, location: "Bengaluru", currency: Currency.INR, experience_years: 7, base_salary: 7500000n, bonus: 1500000n, stock: 4000000n, source: Source.CONTRIBUTOR, confidence_score: 0.93, is_verified: true },
  { company: "google", role: "Senior Software Engineer", level: Level.L6, location: "Bengaluru", currency: Currency.INR, experience_years: 10, base_salary: 12000000n, bonus: 3000000n, stock: 8000000n, source: Source.CONTRIBUTOR, confidence_score: 0.90, is_verified: true },
  { company: "Google India", role: "Staff Engineer", level: Level.STAFF, location: "Hyderabad", currency: Currency.INR, experience_years: 12, base_salary: 16000000n, bonus: 4000000n, stock: 12000000n, source: Source.SCRAPED, confidence_score: 0.75, is_verified: false },
  { company: "Google India", role: "Principal Engineer", level: Level.PRINCIPAL, location: "Bengaluru", currency: Currency.INR, experience_years: 18, base_salary: 30000000n, bonus: 8000000n, stock: 40000000n, source: Source.CONTRIBUTOR, confidence_score: 0.88, is_verified: true },
  { company: "Google India", role: "Product Manager", level: Level.L4, location: "Bengaluru", currency: Currency.INR, experience_years: 5, base_salary: 5000000n, bonus: 1200000n, stock: 2500000n, source: Source.CONTRIBUTOR, confidence_score: 0.91, is_verified: true },
  { company: "Google India", role: "Software Engineer", level: Level.L3, location: "Bengaluru", currency: Currency.INR, experience_years: 1, base_salary: 2200000n, bonus: 300000n, stock: 500000n, source: Source.CONTRIBUTOR, confidence_score: 0.92, is_verified: true },
  { company: "Google India", role: "Data Scientist", level: Level.L5, location: "San Francisco", currency: Currency.USD, experience_years: 8, base_salary: 18000000n, bonus: 4000000n, stock: 10000000n, source: Source.SCRAPED, confidence_score: 0.72, is_verified: false },

  // ── AMAZON ──
  { company: "Amazon", role: "Software Development Engineer", level: Level.SDE_I, location: "Bengaluru", currency: Currency.INR, experience_years: 2, base_salary: 2600000n, bonus: 400000n, stock: 800000n, source: Source.CONTRIBUTOR, confidence_score: 0.94, is_verified: true },
  { company: "Amazon", role: "Software Development Engineer", level: Level.SDE_II, location: "Bengaluru", currency: Currency.INR, experience_years: 5, base_salary: 4200000n, bonus: 700000n, stock: 2200000n, source: Source.CONTRIBUTOR, confidence_score: 0.96, is_verified: true },
  { company: "Amazon", role: "Software Development Engineer", level: Level.SDE_III, location: "Bengaluru", currency: Currency.INR, experience_years: 8, base_salary: 7000000n, bonus: 1400000n, stock: 5000000n, source: Source.CONTRIBUTOR, confidence_score: 0.90, is_verified: true },
  { company: "Amazon", role: "Software Development Engineer", level: Level.SDE_II, location: "Hyderabad", currency: Currency.INR, experience_years: 4, base_salary: 3800000n, bonus: 600000n, stock: 1800000n, source: Source.SCRAPED, confidence_score: 0.68, is_verified: false },
  { company: "Amazon", role: "Applied Scientist", level: Level.L5, location: "Bengaluru", currency: Currency.INR, experience_years: 6, base_salary: 6500000n, bonus: 1300000n, stock: 4500000n, source: Source.CONTRIBUTOR, confidence_score: 0.89, is_verified: true },
  { company: "Amazon", role: "Software Development Engineer", level: Level.SDE_I, location: "Mumbai", currency: Currency.INR, experience_years: 1, base_salary: 2400000n, bonus: 0n, stock: 600000n, source: Source.CONTRIBUTOR, confidence_score: 0.85, is_verified: true },
  // ← Edge case: zero bonus
  { company: "Amazon", role: "SDE Intern to FTE", level: Level.SDE_I, location: "Pune", currency: Currency.INR, experience_years: 1, base_salary: 2000000n, bonus: 0n, stock: 0n, source: Source.AI_INFERRED, confidence_score: 0.55, is_verified: false },
  { company: "Amazon", role: "Senior SDE", level: Level.SDE_III, location: "San Francisco", currency: Currency.USD, experience_years: 9, base_salary: 18000000n, bonus: 3500000n, stock: 9000000n, source: Source.SCRAPED, confidence_score: 0.70, is_verified: false },

  // ── META ──
  { company: "Meta", role: "Software Engineer", level: Level.L4, location: "Bengaluru", currency: Currency.INR, experience_years: 4, base_salary: 5000000n, bonus: 1000000n, stock: 3000000n, source: Source.CONTRIBUTOR, confidence_score: 0.93, is_verified: true },
  { company: "Meta", role: "Software Engineer", level: Level.L5, location: "Bengaluru", currency: Currency.INR, experience_years: 7, base_salary: 9000000n, bonus: 2000000n, stock: 7000000n, source: Source.CONTRIBUTOR, confidence_score: 0.91, is_verified: true },
  { company: "Meta", role: "Software Engineer", level: Level.L6, location: "Bengaluru", currency: Currency.INR, experience_years: 11, base_salary: 14000000n, bonus: 3500000n, stock: 12000000n, source: Source.CONTRIBUTOR, confidence_score: 0.88, is_verified: true },
  { company: "Meta", role: "Research Scientist", level: Level.IC5, location: "London", currency: Currency.GBP, experience_years: 9, base_salary: 15000000n, bonus: 3000000n, stock: 10000000n, source: Source.SCRAPED, confidence_score: 0.65, is_verified: false },
  // ← Edge case: very high equity
  { company: "Meta", role: "Distinguished Engineer", level: Level.PRINCIPAL, location: "San Francisco", currency: Currency.USD, experience_years: 20, base_salary: 42000000n, bonus: 10000000n, stock: 80000000n, source: Source.CONTRIBUTOR, confidence_score: 0.85, is_verified: true },

  // ── MICROSOFT ──
  { company: "Microsoft", role: "Software Engineer", level: Level.L4, location: "Bengaluru", currency: Currency.INR, experience_years: 3, base_salary: 3500000n, bonus: 600000n, stock: 1500000n, source: Source.CONTRIBUTOR, confidence_score: 0.90, is_verified: true },
  { company: "Microsoft", role: "Software Engineer II", level: Level.L5, location: "Bengaluru", currency: Currency.INR, experience_years: 6, base_salary: 6000000n, bonus: 1200000n, stock: 3500000n, source: Source.CONTRIBUTOR, confidence_score: 0.92, is_verified: true },
  { company: "Microsoft", role: "Principal SWE", level: Level.PRINCIPAL, location: "Hyderabad", currency: Currency.INR, experience_years: 15, base_salary: 20000000n, bonus: 5000000n, stock: 18000000n, source: Source.CONTRIBUTOR, confidence_score: 0.87, is_verified: true },
  { company: "Microsoft", role: "Software Engineer", level: Level.L3, location: "Pune", currency: Currency.INR, experience_years: 1, base_salary: 1800000n, bonus: 250000n, stock: 400000n, source: Source.SCRAPED, confidence_score: 0.62, is_verified: false },

  // ── FLIPKART ──
  { company: "Flipkart", role: "Software Development Engineer", level: Level.SDE_I, location: "Bengaluru", currency: Currency.INR, experience_years: 2, base_salary: 2200000n, bonus: 350000n, stock: 700000n, source: Source.CONTRIBUTOR, confidence_score: 0.88, is_verified: true },
  { company: "Flipkart", role: "Software Development Engineer", level: Level.SDE_II, location: "Bengaluru", currency: Currency.INR, experience_years: 5, base_salary: 3800000n, bonus: 600000n, stock: 1800000n, source: Source.CONTRIBUTOR, confidence_score: 0.91, is_verified: true },
  { company: "Flipkart", role: "Software Development Engineer", level: Level.SDE_III, location: "Bengaluru", currency: Currency.INR, experience_years: 8, base_salary: 5500000n, bonus: 1100000n, stock: 3000000n, source: Source.CONTRIBUTOR, confidence_score: 0.89, is_verified: true },
  { company: "Flipkart", role: "Engineering Manager", level: Level.L6, location: "Bengaluru", currency: Currency.INR, experience_years: 11, base_salary: 8000000n, bonus: 2000000n, stock: 5000000n, source: Source.CONTRIBUTOR, confidence_score: 0.86, is_verified: true },
  { company: "Flipkart", role: "Data Analyst", level: Level.L4, location: "Bengaluru", currency: Currency.INR, experience_years: 4, base_salary: 2800000n, bonus: 450000n, stock: 900000n, source: Source.SCRAPED, confidence_score: 0.64, is_verified: false },

  // ── MEESHO ──
  { company: "Meesho", role: "Software Engineer", level: Level.SDE_II, location: "Bengaluru", currency: Currency.INR, experience_years: 4, base_salary: 3200000n, bonus: 500000n, stock: 2000000n, source: Source.CONTRIBUTOR, confidence_score: 0.86, is_verified: true },
  { company: "Meesho", role: "Software Engineer", level: Level.SDE_III, location: "Bengaluru", currency: Currency.INR, experience_years: 7, base_salary: 5000000n, bonus: 900000n, stock: 3500000n, source: Source.CONTRIBUTOR, confidence_score: 0.84, is_verified: true },
  { company: "Meesho", role: "Product Manager", level: Level.L4, location: "Bengaluru", currency: Currency.INR, experience_years: 5, base_salary: 4000000n, bonus: 800000n, stock: 2500000n, source: Source.CONTRIBUTOR, confidence_score: 0.85, is_verified: true },
  // ← Edge case: zero stock
  { company: "Meesho", role: "Data Analyst", level: Level.L3, location: "Bengaluru", currency: Currency.INR, experience_years: 2, base_salary: 1500000n, bonus: 200000n, stock: 0n, source: Source.AI_INFERRED, confidence_score: 0.58, is_verified: false },

  // ── NVIDIA ──
  { company: "NVIDIA Corporation", role: "GPU Software Engineer", level: Level.L4, location: "Bengaluru", currency: Currency.INR, experience_years: 4, base_salary: 5500000n, bonus: 1100000n, stock: 4000000n, source: Source.CONTRIBUTOR, confidence_score: 0.89, is_verified: true },
  { company: "NVIDIA Corporation", role: "AI Research Engineer", level: Level.L5, location: "Pune", currency: Currency.INR, experience_years: 7, base_salary: 9000000n, bonus: 2500000n, stock: 8000000n, source: Source.CONTRIBUTOR, confidence_score: 0.91, is_verified: true },
  { company: "NVIDIA Corporation", role: "Senior Software Engineer", level: Level.L6, location: "Bengaluru", currency: Currency.INR, experience_years: 12, base_salary: 15000000n, bonus: 4000000n, stock: 15000000n, source: Source.CONTRIBUTOR, confidence_score: 0.87, is_verified: true },

  // ── TCS ──
  { company: "Tata Consultancy Services", role: "Software Engineer", level: Level.L3, location: "Mumbai", currency: Currency.INR, experience_years: 2, base_salary: 700000n, bonus: 50000n, stock: 0n, source: Source.CONTRIBUTOR, confidence_score: 0.82, is_verified: true },
  { company: "Tata Consultancy Services", role: "Senior Software Engineer", level: Level.L4, location: "Pune", currency: Currency.INR, experience_years: 5, base_salary: 1200000n, bonus: 100000n, stock: 0n, source: Source.CONTRIBUTOR, confidence_score: 0.80, is_verified: true },
  { company: "Tata Consultancy Services", role: "Technical Lead", level: Level.L5, location: "Hyderabad", currency: Currency.INR, experience_years: 9, base_salary: 1800000n, bonus: 180000n, stock: 0n, source: Source.SCRAPED, confidence_score: 0.61, is_verified: false },
  { company: "Tata Consultancy Services", role: "Software Engineer", level: Level.L3, location: "Chennai", currency: Currency.INR, experience_years: 3, base_salary: 800000n, bonus: 60000n, stock: 0n, source: Source.CONTRIBUTOR, confidence_score: 0.79, is_verified: true },

  // ── INFOSYS ──
  { company: "Infosys", role: "Systems Engineer", level: Level.L3, location: "Bengaluru", currency: Currency.INR, experience_years: 2, base_salary: 750000n, bonus: 60000n, stock: 0n, source: Source.CONTRIBUTOR, confidence_score: 0.81, is_verified: true },
  { company: "Infosys", role: "Senior Systems Engineer", level: Level.L4, location: "Pune", currency: Currency.INR, experience_years: 4, base_salary: 1100000n, bonus: 90000n, stock: 0n, source: Source.CONTRIBUTOR, confidence_score: 0.78, is_verified: true },
  { company: "Infosys", role: "Technology Lead", level: Level.L5, location: "Mumbai", currency: Currency.INR, experience_years: 8, base_salary: 1700000n, bonus: 170000n, stock: 0n, source: Source.SCRAPED, confidence_score: 0.60, is_verified: false },

  // ── WIPRO ──
  { company: "Wipro Technologies", role: "Software Engineer", level: Level.L3, location: "Bengaluru", currency: Currency.INR, experience_years: 2, base_salary: 680000n, bonus: 55000n, stock: 0n, source: Source.CONTRIBUTOR, confidence_score: 0.80, is_verified: true },
  { company: "Wipro Technologies", role: "Senior Engineer", level: Level.L4, location: "Hyderabad", currency: Currency.INR, experience_years: 5, base_salary: 1050000n, bonus: 80000n, stock: 0n, source: Source.CONTRIBUTOR, confidence_score: 0.76, is_verified: true },
  { company: "Wipro Technologies", role: "Project Lead", level: Level.L5, location: "Pune", currency: Currency.INR, experience_years: 9, base_salary: 1600000n, bonus: 160000n, stock: 0n, source: Source.SCRAPED, confidence_score: 0.59, is_verified: false },

  // ── RAZORPAY ──
  { company: "Razorpay", role: "Software Engineer", level: Level.SDE_II, location: "Bengaluru", currency: Currency.INR, experience_years: 4, base_salary: 3500000n, bonus: 600000n, stock: 2000000n, source: Source.CONTRIBUTOR, confidence_score: 0.90, is_verified: true },
  { company: "Razorpay", role: "Software Engineer", level: Level.SDE_III, location: "Bengaluru", currency: Currency.INR, experience_years: 7, base_salary: 5500000n, bonus: 1100000n, stock: 4000000n, source: Source.CONTRIBUTOR, confidence_score: 0.88, is_verified: true },
  { company: "Razorpay", role: "Staff Engineer", level: Level.STAFF, location: "Bengaluru", currency: Currency.INR, experience_years: 11, base_salary: 8500000n, bonus: 2000000n, stock: 6000000n, source: Source.CONTRIBUTOR, confidence_score: 0.86, is_verified: true },
  { company: "Razorpay", role: "Engineering Manager", level: Level.L6, location: "Bengaluru", currency: Currency.INR, experience_years: 10, base_salary: 7500000n, bonus: 1800000n, stock: 5000000n, source: Source.CONTRIBUTOR, confidence_score: 0.87, is_verified: true },

  // ── ZEPTO ──
  { company: "Zepto", role: "Software Engineer", level: Level.SDE_I, location: "Mumbai", currency: Currency.INR, experience_years: 2, base_salary: 2000000n, bonus: 300000n, stock: 800000n, source: Source.CONTRIBUTOR, confidence_score: 0.82, is_verified: true },
  { company: "Zepto", role: "Software Engineer", level: Level.SDE_II, location: "Mumbai", currency: Currency.INR, experience_years: 4, base_salary: 3200000n, bonus: 550000n, stock: 1800000n, source: Source.CONTRIBUTOR, confidence_score: 0.83, is_verified: true },
  { company: "Zepto", role: "Product Manager", level: Level.L4, location: "Mumbai", currency: Currency.INR, experience_years: 5, base_salary: 3800000n, bonus: 700000n, stock: 2000000n, source: Source.CONTRIBUTOR, confidence_score: 0.81, is_verified: true },

  // ── ADDITIONAL CROSS-CITY records ──
  { company: "Amazon", role: "Software Development Engineer", level: Level.SDE_II, location: "Delhi", currency: Currency.INR, experience_years: 4, base_salary: 3600000n, bonus: 580000n, stock: 1600000n, source: Source.SCRAPED, confidence_score: 0.66, is_verified: false },
  { company: "Microsoft", role: "Software Engineer II", level: Level.L4, location: "Hyderabad", currency: Currency.INR, experience_years: 4, base_salary: 3200000n, bonus: 520000n, stock: 1300000n, source: Source.SCRAPED, confidence_score: 0.63, is_verified: false },
  { company: "Google India", role: "Software Engineer", level: Level.L4, location: "Hyderabad", currency: Currency.INR, experience_years: 3, base_salary: 4200000n, bonus: 750000n, stock: 1800000n, source: Source.CONTRIBUTOR, confidence_score: 0.91, is_verified: true },
  { company: "Flipkart", role: "Software Development Engineer", level: Level.SDE_II, location: "Mumbai", currency: Currency.INR, experience_years: 5, base_salary: 3600000n, bonus: 580000n, stock: 1700000n, source: Source.SCRAPED, confidence_score: 0.65, is_verified: false },
  { company: "Meesho", role: "Software Engineer", level: Level.SDE_I, location: "Bengaluru", currency: Currency.INR, experience_years: 2, base_salary: 2000000n, bonus: 300000n, stock: 1000000n, source: Source.CONTRIBUTOR, confidence_score: 0.83, is_verified: true },
  { company: "Google India", role: "Data Engineer", level: Level.L4, location: "Mumbai", currency: Currency.INR, experience_years: 4, base_salary: 4100000n, bonus: 720000n, stock: 1900000n, source: Source.CONTRIBUTOR, confidence_score: 0.90, is_verified: true },
  { company: "Amazon", role: "Machine Learning Engineer", level: Level.SDE_III, location: "Bengaluru", currency: Currency.INR, experience_years: 7, base_salary: 7500000n, bonus: 1500000n, stock: 5500000n, source: Source.CONTRIBUTOR, confidence_score: 0.92, is_verified: true },
  { company: "Razorpay", role: "Data Scientist", level: Level.SDE_II, location: "Bengaluru", currency: Currency.INR, experience_years: 4, base_salary: 3000000n, bonus: 500000n, stock: 1500000n, source: Source.CONTRIBUTOR, confidence_score: 0.85, is_verified: true },
]

async function main() {
  console.log("🌱 Seeding TalentDash database...")

  // Build unique company map (normalise all names)
  const companyMap = new Map<string, string>() // normalized_name → company id

  // Upsert companies
  for (const c of COMPANIES) {
    const normalized = normaliseCompanyName(c.raw)
    const slug = slugify(normalized)

    const company = await prisma.company.upsert({
      where: { slug },
      update: {},
      create: {
        name: c.raw,
        slug,
        normalized_name: normalized,
        industry: c.industry,
        headquarters: c.headquarters,
        founded_year: c.founded_year,
        headcount_range: c.headcount_range,
      },
    })
    companyMap.set(normalized, company.id)
    console.log(`  ✅ Company: ${c.raw} → slug: ${slug}`)
  }

  // Insert salary records
  let inserted = 0
  for (const record of SALARY_RECORDS) {
    const normalized = normaliseCompanyName(record.company)
    const slug = slugify(normalized)

    // Find or create company
    let companyId = companyMap.get(normalized)
    if (!companyId) {
      const company = await prisma.company.upsert({
        where: { slug },
        update: {},
        create: {
          name: record.company,
          slug,
          normalized_name: normalized,
        },
      })
      companyId = company.id
      companyMap.set(normalized, companyId)
    }

    // Always recompute total_compensation
    const total_compensation = record.base_salary + record.bonus + record.stock

    await prisma.salary.create({
      data: {
        company_id: companyId,
        role: record.role,
        level: record.level,
        location: record.location,
        currency: record.currency,
        experience_years: record.experience_years,
        base_salary: record.base_salary,
        bonus: record.bonus,
        stock: record.stock,
        total_compensation,
        source: record.source,
        confidence_score: record.confidence_score,
        is_verified: record.is_verified,
      },
    })
    inserted++
  }

  console.log(`\n✅ Seeding complete: ${inserted} salary records inserted`)
  console.log("📝 Normalisation demo:")
  console.log('  "Google India" → slug: google')
  console.log('  "GOOGLE" → slug: google')
  console.log('  "google" → slug: google')
  console.log('  "Tata Consultancy Services" → slug: tcs')
  console.log('  "Wipro Technologies" → slug: wipro')
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
