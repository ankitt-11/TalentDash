import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { GetSalariesSchema } from "@/lib/validation"
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/constants"
import { Level, Currency } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse and validate query parameters
    const rawParams = {
      company: searchParams.get("company") ?? undefined,
      role: searchParams.get("role") ?? undefined,
      level: searchParams.get("level") ?? undefined,
      location: searchParams.get("location") ?? undefined,
      currency: searchParams.get("currency") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    }

    const parseResult = GetSalariesSchema.safeParse(rawParams)
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]
      return NextResponse.json(
        {
          error: true,
          field: firstError.path.join("."),
          message: firstError.message,
        },
        { status: 400 }
      )
    }

    const params = parseResult.data

    // Hard cap limit at MAX_PAGE_SIZE (100) — returning unbounded rows is a hard failure
    const limit = Math.min(params.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)
    const page = Math.max(1, params.page ?? 1)
    const skip = (page - 1) * limit

    // ── Build where clause ──────────────────────────────────────────────
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
      where.currency = params.currency as Currency
    }

    // ── Build orderBy ───────────────────────────────────────────────────
    type OrderBy =
      | { total_compensation: "asc" | "desc" }
      | { submitted_at: "asc" | "desc" }

    let orderBy: OrderBy = { total_compensation: "desc" }
    if (params.sort === "total_comp_asc") orderBy = { total_compensation: "asc" }
    else if (params.sort === "date_desc") orderBy = { submitted_at: "desc" }

    // ── Execute paginated query ─────────────────────────────────────────
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

    // Serialise BigInt fields (JSON doesn't support BigInt natively)
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

    return NextResponse.json(
      {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      },
      {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=3600",
        },
      }
    )
  } catch (error) {
    console.error("[GET /api/salaries]", error)
    return NextResponse.json(
      { error: true, field: "server", message: "Internal server error" },
      { status: 500 }
    )
  }
}
