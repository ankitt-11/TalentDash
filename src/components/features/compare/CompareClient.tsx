"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CompareResponse } from "@/types/salary"
import { formatSalary, formatDelta, formatExperience } from "@/lib/format"
import LevelBadge from "@/components/ui/LevelBadge"
import { Level } from "@prisma/client"

export type LightweightSalary = {
  id: string
  company: { name: string }
  role: string
  level: string
  location: string
}

// ── Selector component ────────────────────────────────────────────────────
interface CompareSelectorProps {
  slot: "A" | "B"
  allSalaries: LightweightSalary[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function CompareSelector({ slot, allSalaries, selectedId, onSelect }: CompareSelectorProps) {
  return (
    <div className="card flex-1">
      <label className="block text-label font-semibold text-brand-muted mb-2">
        Record {slot}
      </label>
      <div className="relative">
        <select
          id={`compare-selector-${slot.toLowerCase()}`}
          value={selectedId ?? ""}
          onChange={(e) => onSelect(e.target.value)}
          className="filter-select w-full pr-8"
          aria-label={`Select salary record ${slot}`}
        >
          <option value="">Select a salary record…</option>
          {allSalaries.map((s) => (
            <option key={s.id} value={s.id}>
              {s.company.name} · {s.role} · {s.level} · {s.location}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
          <svg className="w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Mini-preview removed. The user asked to only fetch detailed data on selection. 
          Detailed data is shown in the main CompareTable anyway. */}
    </div>
  )
}

// ── Compare Table ─────────────────────────────────────────────────────────
interface CompareTableProps {
  data: CompareResponse
}

function CompareTable({ data }: CompareTableProps) {
  const { record1, record2, delta } = data
  const r1currency = record1.currency as "INR" | "USD" | "GBP" | "EUR"
  const r2currency = record2.currency as "INR" | "USD" | "GBP" | "EUR"

  const tc1 = BigInt(record1.total_compensation)
  const tc2 = BigInt(record2.total_compensation)
  const base1 = BigInt(record1.base_salary)
  const base2 = BigInt(record2.base_salary)
  const bonus1 = BigInt(record1.bonus)
  const bonus2 = BigInt(record2.bonus)
  const stock1 = BigInt(record1.stock)
  const stock2 = BigInt(record2.stock)

  type RowData = {
    label: string
    v1: bigint | number | string
    v2: bigint | number | string
    d: bigint | number | string
    winner: 1 | 2 | 0 // 1: A wins, 2: B wins, 0: tie/NA
  }

  const rows: RowData[] = [
    { label: "Base Salary", v1: base1, v2: base2, d: BigInt(delta.base_delta), winner: base1 > base2 ? 1 : base2 > base1 ? 2 : 0 },
    { label: "Yearly Bonus", v1: bonus1, v2: bonus2, d: BigInt(delta.bonus_delta), winner: bonus1 > bonus2 ? 1 : bonus2 > bonus1 ? 2 : 0 },
    { label: "Stock / RSU", v1: stock1, v2: stock2, d: BigInt(delta.stock_delta), winner: stock1 > stock2 ? 1 : stock2 > stock1 ? 2 : 0 },
    { label: "Total Comp", v1: tc1, v2: tc2, d: BigInt(delta.tc_delta), winner: tc1 > tc2 ? 1 : tc2 > tc1 ? 2 : 0 },
  ]

  return (
    <div className="animate-slide-up mt-8">
      {/* Summary Header */}
      <div className="card mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-brand-black text-white border-brand-black shadow-card">
        <div className="text-center flex-1">
          <div className="text-label text-gray-400 mb-1">{record1.company.name} · {record1.level}</div>
          <div className={`text-[32px] font-bold ${tc1 >= tc2 ? "text-brand-primary" : "text-white"}`}>
            {formatSalary(tc1, r1currency)}
          </div>
          {tc1 >= tc2 && <div className="text-brand-success text-meta mt-1 font-bold">Winner 🏆</div>}
        </div>
        
        <div className="text-meta font-bold text-gray-500 uppercase tracking-widest shrink-0">VS</div>
        
        <div className="text-center flex-1">
          <div className="text-label text-gray-400 mb-1">{record2.company.name} · {record2.level}</div>
          <div className={`text-[32px] font-bold ${tc2 > tc1 ? "text-brand-primary" : "text-white"}`}>
            {formatSalary(tc2, r2currency)}
          </div>
          {tc2 > tc1 && <div className="text-brand-success text-meta mt-1 font-bold">Winner 🏆</div>}
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-3 border-b border-brand-border text-label font-semibold text-brand-muted uppercase tracking-wide">Component</th>
              <th className="px-4 py-3 border-b border-brand-border text-right text-label font-semibold text-brand-muted uppercase tracking-wide">{record1.company.name}</th>
              <th className="px-4 py-3 border-b border-brand-border text-center text-label font-semibold text-brand-muted uppercase tracking-wide">Delta</th>
              <th className="px-4 py-3 border-b border-brand-border text-left text-label font-semibold text-brand-muted uppercase tracking-wide">{record2.company.name}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const val1 = typeof r.v1 === "bigint" ? formatSalary(r.v1, r1currency) : r.v1
              const val2 = typeof r.v2 === "bigint" ? formatSalary(r.v2, r2currency) : r.v2
              return (
                <tr key={r.label} className="group hover:bg-[#F2F2F2] transition-colors">
                  <td className="px-4 py-3 border-b border-brand-border text-label font-medium text-brand-muted whitespace-nowrap">{r.label}</td>
                  <td className={`px-4 py-3 border-b border-brand-border text-right text-body whitespace-nowrap ${r.winner === 1 ? 'font-bold text-brand-black' : 'text-brand-dark'}`}>
                    {val1}
                  </td>
                  <td className="px-4 py-3 border-b border-brand-border text-center whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-meta font-bold ${typeof r.d === "bigint" ? (r.d > 0n ? "bg-green-100 text-green-700" : r.d < 0n ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700") : "bg-gray-100 text-gray-700"}`}>
                      {typeof r.d === "bigint" ? formatDelta(r.d, r1currency) : r.d}
                    </span>
                  </td>
                  <td className={`px-4 py-3 border-b border-brand-border text-left text-body whitespace-nowrap ${r.winner === 2 ? 'font-bold text-brand-black' : 'text-brand-dark'}`}>
                    {val2}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface CompareClientProps {
  initialSalaries: LightweightSalary[]
}

export default function CompareClient({ initialSalaries }: CompareClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [s1, setS1] = useState<string | null>(searchParams.get("s1") ?? searchParams.get("c1"))
  const [s2, setS2] = useState<string | null>(searchParams.get("s2") ?? searchParams.get("c2"))
  const [compareData, setCompareData] = useState<CompareResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync URL when selection changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (s1) params.set("s1", s1)
    if (s2) params.set("s2", s2)
    const qs = params.toString()
    router.replace(qs ? `/compare?${qs}` : "/compare", { scroll: false })
  }, [s1, s2, router])

  // Fetch comparison data when both IDs set
  const fetchComparison = useCallback(async (id1: string, id2: string) => {
    if (id1 === id2) {
      setError("Please select two different salary records to compare.")
      setCompareData(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/compare?s1=${id1}&s2=${id2}`)
      if (!res.ok) {
        const err = await res.json()
        setError(err.message ?? "Failed to load comparison")
        setCompareData(null)
        return
      }
      setCompareData(await res.json())
    } catch {
      setError("Failed to load comparison data. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (s1 && s2) fetchComparison(s1, s2)
    else setCompareData(null)
  }, [s1, s2, fetchComparison])

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <CompareSelector
          slot="A"
          allSalaries={initialSalaries}
          selectedId={s1}
          onSelect={setS1}
        />
        <div className="flex items-center justify-center text-h3 text-brand-muted font-bold">vs</div>
        <CompareSelector
          slot="B"
          allSalaries={initialSalaries}
          selectedId={s2}
          onSelect={setS2}
        />
      </div>

      {error && (
        <div className="card border-brand-error bg-red-50 mb-6">
          <p className="text-body text-brand-error">{error}</p>
        </div>
      )}

      {loading && (
        <div className="card text-center py-12 animate-pulse">
          <div className="text-body text-brand-muted">Loading comparison…</div>
        </div>
      )}

      {!s1 && !s2 && !loading && (
        <div className="card text-center py-16 border-dashed">
          <div className="text-4xl mb-4">⚡</div>
          <p className="text-h3 text-brand-muted mb-2">Select two records above</p>
          <p className="text-body text-brand-muted">
            The comparison table will appear automatically once you select both records.
          </p>
        </div>
      )}

      {compareData && !loading && <CompareTable data={compareData} />}
    </>
  )
}
