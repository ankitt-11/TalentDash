import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { GetSalariesSchema } from "@/lib/validation"
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/constants"
import { Level, Currency } from "@prisma/client"
import { getSalaries } from "@/lib/salary"

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

    const limit = Math.min(params.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)
    const page = Math.max(1, params.page ?? 1)

    // Execute paginated query using shared helper
    const result = await getSalaries({
      ...params,
      limit,
      page
    })

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=3600",
      },
    })
  } catch (error) {
    console.error("[GET /api/salaries]", error)
    return NextResponse.json(
      { error: true, field: "server", message: "Internal server error" },
      { status: 500 }
    )
  }
}
