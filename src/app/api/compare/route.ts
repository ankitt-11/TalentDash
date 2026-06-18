import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { GetCompareSchema } from "@/lib/validation"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rawParams = {
      s1: searchParams.get("s1") ?? undefined,
      s2: searchParams.get("s2") ?? undefined,
    }

    // ── Validate query params ───────────────────────────────────────────
    const parseResult = GetCompareSchema.safeParse(rawParams)
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

    const { s1, s2 } = parseResult.data

    // ── Reject identical IDs ────────────────────────────────────────────
    if (s1 === s2) {
      return NextResponse.json(
        {
          error: true,
          field: "s2",
          message: "Cannot compare a record with itself. s1 and s2 must be different IDs.",
        },
        { status: 400 }
      )
    }

    // ── Fetch both records concurrently ─────────────────────────────────
    const [record1, record2] = await Promise.all([
      prisma.salary.findUnique({
        where: { id: s1 },
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
      prisma.salary.findUnique({
        where: { id: s2 },
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

    // ── 404 if either record not found ──────────────────────────────────
    if (!record1 || !record2) {
      const missingField = !record1 ? "s1" : "s2"
      const missingId = !record1 ? s1 : s2
      return NextResponse.json(
        {
          error: true,
          field: missingField,
          message: `Salary record with id '${missingId}' not found`,
        },
        { status: 404 }
      )
    }

    // ── Compute delta (record1 - record2) ───────────────────────────────
    const delta = {
      base_delta: (record1.base_salary - record2.base_salary).toString(),
      bonus_delta: (record1.bonus - record2.bonus).toString(),
      stock_delta: (record1.stock - record2.stock).toString(),
      tc_delta: (record1.total_compensation - record2.total_compensation).toString(),
      experience_delta: record1.experience_years - record2.experience_years,
    }

    // ── Serialise ───────────────────────────────────────────────────────
    function serialise(r: NonNullable<typeof record1>) {
      return {
        id: r.id,
        company: r.company,
        role: r.role,
        level: r.level,
        location: r.location,
        currency: r.currency,
        experience_years: r.experience_years,
        base_salary: r.base_salary.toString(),
        bonus: r.bonus.toString(),
        stock: r.stock.toString(),
        total_compensation: r.total_compensation.toString(),
        source: r.source,
        confidence_score: r.confidence_score.toString(),
        is_verified: r.is_verified,
        submitted_at: r.submitted_at.toISOString(),
      }
    }

    return NextResponse.json({
      record1: serialise(record1),
      record2: serialise(record2),
      delta,
    })
  } catch (error) {
    console.error("[GET /api/compare]", error)
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    )
  }
}
