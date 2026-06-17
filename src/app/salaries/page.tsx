import { Metadata } from "next"
import { Suspense } from "react"
import { buildSalaryListMeta, buildDatasetJsonLd } from "@/lib/seo"
import { SITE_URL } from "@/lib/constants"
import SalaryFilters from "@/components/features/salary-table/SalaryFilters"
import SalaryTable from "@/components/features/salary-table/SalaryTable"
import { SalaryListResponse, DisplayCurrency } from "@/types/salary"

// ── Metadata ──────────────────────────────────────────────────────────────
export async function generateMetadata(): Promise<Metadata> {
  const meta = buildSalaryListMeta()
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: meta.canonical },
    openGraph: meta.openGraph,
  }
}

interface SalaryPageProps {
  searchParams: Promise<{
    company?: string
    role?: string
    level?: string
    location?: string
    currency?: string
    sort?: string
    page?: string
    limit?: string
  }>
}

async function fetchSalaries(params: Awaited<SalaryPageProps["searchParams"]>) {
  const queryString = new URLSearchParams()
  if (params.company) queryString.set("company", params.company)
  if (params.role) queryString.set("role", params.role)
  if (params.level) queryString.set("level", params.level)
  if (params.location) queryString.set("location", params.location)
  if (params.currency) queryString.set("currency", params.currency)
  if (params.sort) queryString.set("sort", params.sort)
  if (params.page) queryString.set("page", params.page)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  const res = await fetch(`${baseUrl}/api/salaries?${queryString.toString()}`, {
    next: { revalidate: 300 },
  })

  if (!res.ok) throw new Error("Failed to fetch salaries")
  return res.json() as Promise<SalaryListResponse>
}

import KpiCards from "@/components/features/salary-table/KpiCards"
// ... (imports remain)

export default async function SalaryPage({ searchParams }: SalaryPageProps) {
  const params = await searchParams
  const displayCurrency: DisplayCurrency = params.currency === "USD" ? "USD" : "INR"
  const currentSort = (params.sort as "total_comp_desc" | "total_comp_asc" | "date_desc") ?? "total_comp_desc"

  const jsonLd = buildDatasetJsonLd()

  // Fetch data server-side
  let salaryData: SalaryListResponse
  try {
    salaryData = await fetchSalaries(params)
  } catch {
    salaryData = { data: [], meta: { total: 0, page: 1, limit: 25, totalPages: 0 } }
  }

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-h2 text-brand-black mb-1">
              Compensation Intelligence
            </h1>
            <p className="text-body text-brand-muted">
              Benchmark tech salaries across verified industry reports.
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <KpiCards 
          salaries={salaryData.data} 
          totalRecords={salaryData.meta.total} 
          displayCurrency={displayCurrency} 
        />

        {/* Filter bar — client component */}
        <div className="sticky top-16 z-40 bg-brand-bg/95 backdrop-blur pt-2 pb-4 mb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <Suspense fallback={<div className="h-16 bg-white rounded-xl border border-brand-border animate-pulse" />}>
            <SalaryFilters />
          </Suspense>
        </div>

        {/* Salary table — client component (for sort/pagination interactivity) */}
        <SalaryTable
          salaries={salaryData.data}
          total={salaryData.meta.total}
          page={salaryData.meta.page}
          limit={salaryData.meta.limit}
          totalPages={salaryData.meta.totalPages}
          displayCurrency={displayCurrency}
          currentSort={currentSort}
        />
      </div>
    </>
  )
}
