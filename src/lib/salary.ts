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
