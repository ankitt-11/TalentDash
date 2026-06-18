import { Metadata } from "next"
import { prisma } from "@/lib/db"
import { buildCompareMeta } from "@/lib/seo"
import CompareClient, { LightweightSalary } from "@/components/features/compare/CompareClient"

export async function generateMetadata(): Promise<Metadata> {
  const meta = buildCompareMeta()
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: meta.canonical },
    openGraph: meta.openGraph,
  }
}

export default async function ComparePage() {
  // Fetch only the fields needed for the dropdown selectors, 
  // bypassing the heavy API call and preventing a client waterfall.
  const salaries = await prisma.salary.findMany({
    select: {
      id: true,
      company: {
        select: {
          name: true,
        },
      },
      role: true,
      level: true,
      location: true,
    },
    orderBy: {
      total_compensation: "desc",
    },
    take: 100, // Hard cap for UI dropdown
  })

  // Format to match LightweightSalary
  const lightweightSalaries: LightweightSalary[] = salaries.map(s => ({
    id: s.id,
    company: { name: s.company.name },
    role: s.role,
    level: s.level,
    location: s.location
  }))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-h1 text-brand-black mb-2">Compare Salary Records</h1>
        <p className="text-body text-brand-muted">
          Select any two salary records to see a side-by-side breakdown with delta calculations.
          Share the URL to save your comparison.
        </p>
      </div>

      <CompareClient initialSalaries={lightweightSalaries} />
    </div>
  )
}
