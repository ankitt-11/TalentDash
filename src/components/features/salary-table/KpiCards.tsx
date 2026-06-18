import { formatSalary } from "@/lib/format"
import { computeMedian } from "@/lib/salary"
import { SalaryRecord } from "@/types/salary"

interface KpiCardsProps {
  salaries: SalaryRecord[]
  totalRecords: number
  displayCurrency: "INR" | "USD"
}

export default function KpiCards({ salaries, totalRecords, displayCurrency }: KpiCardsProps) {
  // Compute stats based on the current visible dataset
  const uniqueCompanies = new Set(salaries.map(s => s.company.name)).size
  
  const tcValues = salaries.map(s => BigInt(s.total_compensation))
  const medianTC = tcValues.length > 0 ? computeMedian(tcValues) : 0n
  
  let maxTC = 0n
  tcValues.forEach(tc => {
    if (tc > maxTC) maxTC = tc
  })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1 */}
      <div className="card flex items-center gap-4 animate-fade-in" style={{ animationDelay: "0ms" }}>
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <div className="text-meta font-medium text-brand-muted uppercase tracking-wider">Total Reports</div>
          <div className="text-h3 font-bold text-brand-black">{totalRecords.toLocaleString()}</div>
        </div>
      </div>

      {/* Card 2 */}
      <div className="card flex items-center gap-4 animate-fade-in" style={{ animationDelay: "50ms" }}>
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-brand-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <div className="text-meta font-medium text-brand-muted uppercase tracking-wider">Median Comp (Page)</div>
          <div className="text-h3 font-bold text-brand-black">{formatSalary(medianTC, displayCurrency)}</div>
        </div>
      </div>

      {/* Card 3 */}
      <div className="card flex items-center gap-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <div className="text-meta font-medium text-brand-muted uppercase tracking-wider">Highest Comp (Page)</div>
          <div className="text-h3 font-bold text-brand-black">{formatSalary(maxTC, displayCurrency)}</div>
        </div>
      </div>

      {/* Card 4 */}
      <div className="card flex items-center gap-4 animate-fade-in" style={{ animationDelay: "150ms" }}>
        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-brand-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <div className="text-meta font-medium text-brand-muted uppercase tracking-wider">Companies (Page)</div>
          <div className="text-h3 font-bold text-brand-black">{uniqueCompanies}</div>
        </div>
      </div>
    </div>
  )
}
