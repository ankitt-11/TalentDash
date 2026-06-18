import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { computeMedian, getLevelDistribution } from "@/lib/salary"
import { formatSalary } from "@/lib/format"
import { buildCompanyMeta, buildOrganizationJsonLd } from "@/lib/seo"
import LevelDistributionBar from "@/components/features/company/LevelDistributionBar"
import LevelBadge from "@/components/ui/LevelBadge"
import { Level } from "@prisma/client"
import { cache } from "react"

// ── Memoized server-side helper for stats ─────────────────────────────────
// Prevents redundant re-computation if called multiple times in a request tree
const getCompanyStats = cache(async (companyId: string) => {
  const data = await prisma.salary.findMany({
    where: { company_id: companyId },
    select: { total_compensation: true, level: true, currency: true },
    orderBy: { total_compensation: "desc" },
  })
  
  const tcValues = data.map((s) => s.total_compensation)
  const medianTC = computeMedian(tcValues)
  const minTC = tcValues.length > 0 ? tcValues[tcValues.length - 1] : 0n
  const maxTC = tcValues.length > 0 ? tcValues[0] : 0n
  const levelDist = getLevelDistribution(data)
  
  return { data, medianTC, minTC, maxTC, levelDist, total: data.length }
})

interface CompanyPageProps {
  params: Promise<{ slug: string }>
}

// ── generateStaticParams — live DB query at build time ──────────────────────
// NOT a hardcoded array. Queries Neon at build time.
export async function generateStaticParams() {
  const companies = await prisma.company.findMany({
    select: { slug: true },
  })
  return companies.map((c) => ({ slug: c.slug }))
}

// ── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { slug } = await params
  const company = await prisma.company.findUnique({ where: { slug } })
  if (!company) return { title: "Company Not Found" }

  const meta = buildCompanyMeta(company)
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: meta.canonical },
    openGraph: meta.openGraph,
  }
}




export default async function CompanyPage({ params }: CompanyPageProps) {
  const { slug } = await params

  // ── Fetch company ────────────────────────────────────────────────────────
  const company = await prisma.company.findUnique({
    where: { slug },
  })

  if (!company) notFound()

  // ── Compute statistics via Server-Side Helper ────────────────────────────
  const stats = await getCompanyStats(company.id)
  const { medianTC, minTC, maxTC, levelDist, total, data: allStatsData } = stats

  // Determine primary currency (most common in this company's records)
  const currencyCount: Record<string, number> = {}
  for (const s of allStatsData) {
    currencyCount[s.currency] = (currencyCount[s.currency] ?? 0) + 1
  }
  const primaryCurrency =
    (Object.entries(currencyCount).sort((a, b) => b[1] - a[1])[0]?.[0] as
      | "INR"
      | "USD"
      | "GBP"
      | "EUR") ?? "INR"

  // ── Fetch recent salaries for the table (capped to prevent HTML bloat) ───
  const salaries = await prisma.salary.findMany({
    where: { company_id: company.id },
    orderBy: { total_compensation: "desc" },
    take: 100, // Capped to prevent massive DOM nodes on large companies
  })



  const jsonLd = buildOrganizationJsonLd(company)

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-label text-brand-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link>
          <span>›</span>
          <Link href="/salaries" className="hover:text-brand-primary transition-colors">Salaries</Link>
          <span>›</span>
          <span className="text-brand-dark">{company.name}</span>
        </nav>

        {/* Company header - SaaS Style */}
        <div className="card mb-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              {/* Logo Placeholder */}
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-gray-100 border border-brand-border shadow-sm flex items-center justify-center shrink-0">
                <span className="text-2xl font-bold text-brand-primary">
                  {company.name.substring(0, 1).toUpperCase()}
                </span>
              </div>
              
              <div>
                <h1 className="text-h1 text-brand-black mb-2">{company.name}</h1>
                <div className="text-meta text-brand-muted mb-3">
                  Based on {total} compensation records · Data refreshed regularly
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {company.industry && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-brand-data-light text-brand-data text-label font-medium border border-blue-100">
                      {company.industry}
                    </span>
                  )}
                  {company.founded_year && (
                    <span className="text-label font-medium text-brand-muted">
                      Est. {company.founded_year}
                    </span>
                  )}
                  {company.headcount_range && (
                    <span className="text-label font-medium text-brand-muted flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {company.headcount_range}
                    </span>
                  )}
                  {company.headquarters && (
                    <span className="text-label font-medium text-brand-muted flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {company.headquarters}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Compare CTA */}
            <Link
              href={`/compare?c1=${company.slug}`}
              id={`compare-btn-${company.slug}`}
              className="btn-secondary shrink-0 self-start"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Compare
            </Link>
          </div>
        </div>

        {/* Stats grid */}
        {salaries.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="stat-card flex flex-col justify-center">
                <div className="text-meta font-medium uppercase tracking-wider text-brand-muted mb-1">Median TC</div>
                <div className="tc-amount-large text-brand-black">
                  {formatSalary(medianTC, primaryCurrency)}
                </div>
              </div>
              <div className="stat-card flex flex-col justify-center">
                <div className="text-meta font-medium uppercase tracking-wider text-brand-muted mb-1">Highest TC</div>
                <div className="text-[22px] font-bold text-brand-black">
                  {formatSalary(maxTC, primaryCurrency)}
                </div>
              </div>
              <div className="stat-card flex flex-col justify-center">
                <div className="text-meta font-medium uppercase tracking-wider text-brand-muted mb-1">Lowest TC</div>
                <div className="text-[22px] font-bold text-brand-dark">
                  {formatSalary(minTC, primaryCurrency)}
                </div>
              </div>
              <div className="stat-card flex flex-col justify-center">
                <div className="text-meta font-medium uppercase tracking-wider text-brand-muted mb-1">Total Reports</div>
                <div className="text-[22px] font-bold text-brand-primary">
                  {salaries.length}
                </div>
              </div>
            </div>

            {/* Level distribution */}
            <div className="card mb-6">
              <h2 className="text-h3 text-brand-black mb-4">Level Distribution</h2>
              <LevelDistributionBar
                distribution={levelDist}
                total={total}
              />
            </div>

            {/* Salary list */}
            <div className="card">
              <h2 className="text-h3 text-brand-black mb-4">
                All {company.name} Salaries
                <span className="ml-2 text-label text-brand-muted font-normal">
                  ({total} records · top {salaries.length} shown)
                </span>
              </h2>

              <div className="overflow-x-auto -mx-6 px-6">
                <table className="salary-table" aria-label={`${company.name} salary records`}>
                  <thead>
                    <tr>
                      <th className="text-left">Role</th>
                      <th className="text-left">Level</th>
                      <th className="text-left">Location</th>
                      <th className="text-left">Experience</th>
                      <th className="text-right">Base Salary</th>
                      <th className="text-right">Bonus</th>
                      <th className="text-right">Stock</th>
                      <th className="text-right">Total Comp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaries.map((s) => {
                      const currency = s.currency as "INR" | "USD" | "GBP" | "EUR"
                      return (
                        <tr key={s.id} className="group even:bg-gray-50/50 hover:bg-brand-hover transition-colors">
                          <td className="px-4 py-3 border-b border-brand-border max-w-[200px]">
                            <span className="truncate block font-medium text-brand-dark" title={s.role}>{s.role}</span>
                          </td>
                          <td className="px-4 py-3 border-b border-brand-border">
                            <LevelBadge level={s.level as Level} />
                          </td>
                          <td className="px-4 py-3 border-b border-brand-border whitespace-nowrap">
                            {s.location}
                          </td>
                          <td className="px-4 py-3 border-b border-brand-border whitespace-nowrap">
                            {s.experience_years} yr{s.experience_years !== 1 ? "s" : ""}
                          </td>
                          <td className="px-4 py-3 border-b border-brand-border whitespace-nowrap text-right">
                            {formatSalary(s.base_salary, currency)}
                          </td>
                          <td className="px-4 py-3 border-b border-brand-border whitespace-nowrap text-right">
                            {s.bonus > 0n ? formatSalary(s.bonus, currency) : "—"}
                          </td>
                          <td className="px-4 py-3 border-b border-brand-border whitespace-nowrap text-right">
                            {s.stock > 0n ? formatSalary(s.stock, currency) : "—"}
                          </td>
                          <td className="px-4 py-3 border-b border-brand-border whitespace-nowrap text-right">
                            <span className="tc-amount">
                              {formatSalary(s.total_compensation, currency)}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="card text-center py-16">
            <p className="text-h3 text-brand-muted">No salary data yet for {company.name}</p>
            <p className="text-body text-brand-muted mt-2">Be the first to submit a salary record.</p>
          </div>
        )}
      </div>
    </>
  )
}
