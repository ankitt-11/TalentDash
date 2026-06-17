import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { IngestSalarySchema } from "@/lib/validation"
import { normaliseCompanyName, slugify } from "@/lib/normalise"
import { computeTotalCompensation, findDuplicate } from "@/lib/salary"
import { ZodError } from "zod"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // ── Step 1: Validate input ──────────────────────────────────────────
    const parseResult = IngestSalarySchema.safeParse(body)
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]
      return NextResponse.json(
        {
          error: true,
          field: firstError.path.join(".") || "unknown",
          message: firstError.message,
          details: parseResult.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }

    const data = parseResult.data

    // ── Step 2: Normalise company name ──────────────────────────────────
    const normalizedName = normaliseCompanyName(data.company)
    const slug = slugify(normalizedName)

    // ── Step 3: Find or create Company record ───────────────────────────
    const company = await prisma.company.upsert({
      where: { slug },
      update: {}, // Don't overwrite existing metadata
      create: {
        name: data.company.trim(),
        slug,
        normalized_name: normalizedName,
      },
    })

    // ── Step 4: Recompute total_compensation (NEVER trust client) ───────
    const base_salary = BigInt(Math.round(data.base_salary))
    const bonus = BigInt(Math.round(data.bonus ?? 0))
    const stock = BigInt(Math.round(data.stock ?? 0))
    const total_compensation = computeTotalCompensation(base_salary, bonus, stock)

    // ── Step 5: Duplicate check ─────────────────────────────────────────
    const duplicate = await findDuplicate({
      company_id: company.id,
      role: data.role,
      level: data.level,
      location: data.location,
      base_salary,
    })

    if (duplicate) {
      return NextResponse.json(
        {
          error: true,
          field: "duplicate",
          message: `A similar record for ${data.role} at ${company.name} in ${data.location} was submitted within the last 48 hours. Please wait before re-submitting.`,
        },
        { status: 409 }
      )
    }

    // ── Step 6: Store record ────────────────────────────────────────────
    const salary = await prisma.salary.create({
      data: {
        company_id: company.id,
        role: data.role,
        level: data.level,
        location: data.location,
        currency: data.currency,
        experience_years: data.experience_years,
        base_salary,
        bonus,
        stock,
        total_compensation, // Always computed here
        source: data.source,
        confidence_score: data.confidence_score,
        is_verified: false,
      },
      include: { company: true },
    })

    // ── Step 7: Trigger ISR revalidation ────────────────────────────────
    // In production, call revalidatePath for affected pages
    // revalidatePath('/salaries')
    // revalidatePath(`/companies/${slug}`)

    return NextResponse.json(
      {
        id: salary.id,
        company: {
          id: company.id,
          slug: company.slug,
          name: company.name,
        },
        role: salary.role,
        level: salary.level,
        location: salary.location,
        currency: salary.currency,
        experience_years: salary.experience_years,
        base_salary: salary.base_salary.toString(),
        bonus: salary.bonus.toString(),
        stock: salary.stock.toString(),
        total_compensation: salary.total_compensation.toString(),
        source: salary.source,
        confidence_score: salary.confidence_score.toString(),
        is_verified: salary.is_verified,
        submitted_at: salary.submitted_at.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: true, field: "unknown", message: "Invalid request body" },
        { status: 400 }
      )
    }
    console.error("[POST /api/ingest-salary]", error)
    return NextResponse.json(
      { error: true, field: "server", message: "Internal server error" },
      { status: 500 }
    )
  }
}
