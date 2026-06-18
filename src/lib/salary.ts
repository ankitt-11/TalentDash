import { Level } from "@prisma/client"
import { prisma } from "./db"

/**
 * Always compute total_compensation server-side.
 * NEVER trust the client-submitted value.
 */
export function computeTotalCompensation(
  base_salary: bigint,
  bonus: bigint = 0n,
  stock: bigint = 0n
): bigint {
  return base_salary + bonus + stock
}

/**
 * Compute the true statistical median of an array of BigInt values.
 * Returns the middle value (odd count) or average of two middle values (even count).
 */
export function computeMedian(values: bigint[]): bigint {
  if (values.length === 0) return 0n
  const sorted = [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2n
  }
  return sorted[mid]
}

/**
 * Compute level distribution for a set of salary records.
 * Returns object like: { L3: 8, L4: 19, L5: 12, ... }
 */
export function getLevelDistribution(
  records: { level: Level }[]
): Partial<Record<Level, number>> {
  const distribution: Partial<Record<Level, number>> = {}
  for (const record of records) {
    distribution[record.level] = (distribution[record.level] ?? 0) + 1
  }
  return distribution
}

/**
 * Check for duplicate salary record within 48-hour window.
 * Returns the duplicate record if found, null otherwise.
 */
export async function findDuplicate(params: {
  company_id: string
  role: string
  level: Level
  location: string
  base_salary: bigint
  windowHours?: number
  tolerance?: number
}) {
  const {
    company_id,
    role,
    level,
    location,
    base_salary,
    windowHours = 48,
    tolerance = 0.1,
  } = params

  const windowStart = new Date(Date.now() - windowHours * 60 * 60 * 1000)

  const candidates = await prisma.salary.findMany({
    where: {
      company_id,
      level,
      location,
      submitted_at: { gte: windowStart },
    },
  })

  // Check role match (case-insensitive) and base salary within tolerance
  const baseNum = Number(base_salary)
  return (
    candidates.find((c) => {
      const roleMatch = c.role.toLowerCase() === role.toLowerCase()
      const salaryDiff = Math.abs(Number(c.base_salary) - baseNum) / baseNum
      return roleMatch && salaryDiff <= tolerance
    }) ?? null
  )
}

/**
 * Format Level enum for human-readable display.
 */
export function formatLevel(level: Level): string {
  const map: Record<Level, string> = {
    L3: "L3",
    L4: "L4",
    L5: "L5",
    L6: "L6",
    SDE_I: "SDE-I",
    SDE_II: "SDE-II",
    SDE_III: "SDE-III",
    STAFF: "Staff",
    PRINCIPAL: "Principal",
    IC4: "IC4",
    IC5: "IC5",
  }
  return map[level] ?? level
}

/**
 * Fetch salaries directly from Prisma (used by API route and Server Components)
 */
export async function getSalaries(params: {
  company?: string
  role?: string
  level?: string
  location?: string
  currency?: string
  sort?: string
  page?: number
  limit?: number
}) {
  const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = await import("./constants")
  
  const limit = Math.min(params.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)
  const page = Math.max(1, params.page ?? 1)
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}

  if (params.company) {
    where.company = {
      normalized_name: {
        contains: params.company.toLowerCase(),
        mode: "insensitive",
      },
    }
  }

  if (params.role) {
    where.role = { contains: params.role, mode: "insensitive" }
  }

  if (params.level) {
    where.level = params.level as Level
  }

  if (params.location) {
    where.location = { contains: params.location, mode: "insensitive" }
  }

  if (params.currency) {
    where.currency = params.currency // Let Prisma handle the enum validation or we cast it
  }

  type OrderBy =
    | { total_compensation: "asc" | "desc" }
    | { submitted_at: "asc" | "desc" }

  let orderBy: OrderBy = { total_compensation: "desc" }
  if (params.sort === "total_comp_asc") orderBy = { total_compensation: "asc" }
  else if (params.sort === "date_desc") orderBy = { submitted_at: "desc" }

  const [total, salaries] = await Promise.all([
    prisma.salary.count({ where }),
    prisma.salary.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            industry: true,
            headquarters: true,
            founded_year: true,
            headcount_range: true,
          },
        },
      },
    }),
  ])

  const totalPages = Math.ceil(total / limit)

  // Serialise BigInt fields for JSON compatibility
  const data = salaries.map((s) => ({
    id: s.id,
    company: s.company,
    role: s.role,
    level: s.level,
    location: s.location,
    currency: s.currency,
    experience_years: s.experience_years,
    base_salary: s.base_salary.toString(),
    bonus: s.bonus.toString(),
    stock: s.stock.toString(),
    total_compensation: s.total_compensation.toString(),
    source: s.source,
    confidence_score: s.confidence_score.toString(),
    is_verified: s.is_verified,
    submitted_at: s.submitted_at.toISOString(),
  }))

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  }
}
