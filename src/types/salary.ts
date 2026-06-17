import { Level, Currency, Source } from "@prisma/client"

export interface SalaryRecord {
  id: string
  company: {
    id: string
    name: string
    slug: string
    industry?: string | null
    headquarters?: string | null
    founded_year?: number | null
    headcount_range?: string | null
  }
  role: string
  level: Level
  location: string
  currency: Currency
  experience_years: number
  base_salary: string // BigInt serialised as string for JSON transport
  bonus: string
  stock: string
  total_compensation: string
  source: Source
  confidence_score: string
  is_verified: boolean
  submitted_at: string
}

export interface SalaryListResponse {
  data: SalaryRecord[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface SalaryFilters {
  company?: string
  role?: string
  level?: Level
  location?: string
  currency?: Currency
  sort?: "total_comp_desc" | "total_comp_asc" | "date_desc"
  page?: number
  limit?: number
}

export interface DeltaResult {
  base_delta: string
  bonus_delta: string
  stock_delta: string
  tc_delta: string
  experience_delta: number
}

export interface CompareResponse {
  record1: SalaryRecord
  record2: SalaryRecord
  delta: DeltaResult
}

export interface CompanyStats {
  median_total_compensation: string
  min_total_compensation: string
  max_total_compensation: string
  record_count: number
  level_distribution: Partial<Record<Level, number>>
}

export interface CompanyResponse {
  company: {
    id: string
    name: string
    slug: string
    industry?: string | null
    headquarters?: string | null
    founded_year?: number | null
    headcount_range?: string | null
  }
  stats: CompanyStats
  salaries: SalaryRecord[]
}

// Display currency toggle state
export type DisplayCurrency = "INR" | "USD"
