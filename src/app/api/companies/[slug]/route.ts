import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { computeMedian, getLevelDistribution } from "@/lib/salary"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // ── Find company ────────────────────────────────────────────────────
    const company = await prisma.company.findUnique({
      where: { slug },
    })

    if (!company) {
      return NextResponse.json(
        { error: true, message: "Company not found" },
        { status: 404 }
      )
    }

    // ── Fetch all salary records for this company ────────────────────────
    const salaries = await prisma.salary.findMany({
      where: { company_id: company.id },
      orderBy: { total_compensation: "desc" },
    })

    // ── Compute statistics ──────────────────────────────────────────────
    const tcValues = salaries.map((s) => s.total_compensation)

    const median_total_compensation = computeMedian(tcValues)
    const min_total_compensation = tcValues.length > 0 ? tcValues[tcValues.length - 1] : 0n
    const max_total_compensation = tcValues.length > 0 ? tcValues[0] : 0n
    const level_distribution = getLevelDistribution(salaries)

    // ── Serialise response ──────────────────────────────────────────────
    const serialisedSalaries = salaries.map((s) => ({
      id: s.id,
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        industry: company.industry,
        headquarters: company.headquarters,
        founded_year: company.founded_year,
        headcount_range: company.headcount_range,
      },
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

    return NextResponse.json(
      {
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          industry: company.industry,
          headquarters: company.headquarters,
          founded_year: company.founded_year,
          headcount_range: company.headcount_range,
        },
        stats: {
          median_total_compensation: median_total_compensation.toString(),
          min_total_compensation: min_total_compensation.toString(),
          max_total_compensation: max_total_compensation.toString(),
          record_count: salaries.length,
          level_distribution,
        },
        salaries: serialisedSalaries,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    )
  } catch (error) {
    console.error("[GET /api/companies/[slug]]", error)
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    )
  }
}
