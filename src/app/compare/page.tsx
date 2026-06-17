"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SalaryRecord, CompareResponse } from "@/types/salary"
import { formatSalary, formatDelta, formatExperience } from "@/lib/format"
import LevelBadge from "@/components/ui/LevelBadge"
import { Level } from "@prisma/client"
import { buildCompareMeta } from "@/lib/seo"

// ── Selector component ────────────────────────────────────────────────────
interface CompareSelectorProps {
  slot: "A" | "B"
  allSalaries: SalaryRecord[]
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

      {selectedId && (() => {
        const s = allSalaries.find((r) => r.id === selectedId)
        if (!s) return null
        const currency = s.currency as "INR" | "USD" | "GBP" | "EUR"
        return (
          <div className="mt-3 p-3 rounded-lg bg-brand-bg border border-brand-border animate-fade-in">
            <div className="font-semibold text-brand-black truncate">{s.company.name}</div>
            <div className="text-label text-brand-muted">{s.role}</div>
            <div className="mt-2 flex items-center gap-2">
              <LevelBadge level={s.level as Level} />
              <span className="text-label text-brand-muted">{s.location}</span>
            </div>
            <div className="mt-2 tc-amount">
              {formatSalary(BigInt(s.total_compensation), currency)}
            </div>
          </div>
        )
      })()}
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
  ]

  return (
    <div className="animate-slide-up flex flex-col lg:flex-row gap-6 mt-8">
      {/* Card A */}
      <div className="card flex-1 border-2 border-transparent hover:border-brand-primary/20 transition-colors relative">
        {tc1 >= tc2 && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 winner-badge bg-green-100 text-green-700 border border-green-200">
            Higher Total Comp 🏆
          </div>
        )}
        <div className="text-center pb-6 border-b border-brand-border">
          <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-blue-50 to-gray-100 border border-brand-border shadow-sm flex items-center justify-center text-2xl font-bold text-brand-primary mb-3">
            {record1.company.name.substring(0, 1).toUpperCase()}
          </div>
          <h2 className="text-h2 text-brand-black">{record1.company.name}</h2>
          <div className="text-label text-brand-muted mt-1">{record1.role}</div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <LevelBadge level={record1.level as Level} />
            <span className="text-label text-brand-muted">{record1.location}</span>
          </div>
        </div>
        
        <div className="py-6 space-y-5">
          {rows.map(r => (
            <div key={r.label} className="flex justify-between items-center">
              <span className="text-label font-medium text-brand-muted">{r.label}</span>
              <span className={`text-body font-medium ${r.winner === 1 ? "text-brand-black font-bold" : "text-brand-dark"}`}>
                {typeof r.v1 === "bigint" ? formatSalary(r.v1, r1currency) : r.v1}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-brand-border text-center">
          <div className="text-meta font-bold uppercase tracking-wider text-brand-muted mb-1">Total Compensation</div>
          <div className={`text-[32px] font-bold ${tc1 >= tc2 ? "text-brand-primary" : "text-brand-dark"}`}>
            {formatSalary(tc1, r1currency)}
          </div>
        </div>
      </div>

      {/* Delta Column */}
      <div className="flex lg:flex-col justify-center items-center gap-4 py-4 lg:py-0 shrink-0 lg:w-32">
        <div className="text-meta font-bold text-brand-muted uppercase tracking-widest hidden lg:block mb-8">Delta</div>
        <div className="flex flex-col items-center gap-1">
          <div className={`px-3 py-1.5 rounded-full text-label font-bold ${BigInt(delta.tc_delta) > 0n ? "bg-green-100 text-green-700" : BigInt(delta.tc_delta) < 0n ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
            {formatDelta(BigInt(delta.tc_delta), r1currency)}
          </div>
          <div className="text-meta text-brand-muted text-center">Total Comp<br/>Difference</div>
        </div>
      </div>

      {/* Card B */}
      <div className="card flex-1 border-2 border-transparent hover:border-brand-primary/20 transition-colors relative">
        {tc2 > tc1 && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 winner-badge bg-green-100 text-green-700 border border-green-200">
            Higher Total Comp 🏆
          </div>
        )}
        <div className="text-center pb-6 border-b border-brand-border">
          <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-blue-50 to-gray-100 border border-brand-border shadow-sm flex items-center justify-center text-2xl font-bold text-brand-primary mb-3">
            {record2.company.name.substring(0, 1).toUpperCase()}
          </div>
          <h2 className="text-h2 text-brand-black">{record2.company.name}</h2>
          <div className="text-label text-brand-muted mt-1">{record2.role}</div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <LevelBadge level={record2.level as Level} />
            <span className="text-label text-brand-muted">{record2.location}</span>
          </div>
        </div>
        
        <div className="py-6 space-y-5">
          {rows.map(r => (
            <div key={r.label} className="flex justify-between items-center">
              <span className="text-label font-medium text-brand-muted">{r.label}</span>
              <span className={`text-body font-medium ${r.winner === 2 ? "text-brand-black font-bold" : "text-brand-dark"}`}>
                {typeof r.v2 === "bigint" ? formatSalary(r.v2, r2currency) : r.v2}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-brand-border text-center">
          <div className="text-meta font-bold uppercase tracking-wider text-brand-muted mb-1">Total Compensation</div>
          <div className={`text-[32px] font-bold ${tc2 > tc1 ? "text-brand-primary" : "text-brand-dark"}`}>
            {formatSalary(tc2, r2currency)}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Compare Page ─────────────────────────────────────────────────────
export default function ComparePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [s1, setS1] = useState<string | null>(searchParams.get("s1"))
  const [s2, setS2] = useState<string | null>(searchParams.get("s2"))
  const [allSalaries, setAllSalaries] = useState<SalaryRecord[]>([])
  const [compareData, setCompareData] = useState<CompareResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all salary records for the selectors
  useEffect(() => {
    fetch("/api/salaries?limit=100&sort=total_comp_desc")
      .then((r) => r.json())
      .then((d) => setAllSalaries(d.data ?? []))
      .catch(console.error)
  }, [])

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-h1 text-brand-black mb-2">Compare Salary Records</h1>
        <p className="text-body text-brand-muted">
          Select any two salary records to see a side-by-side breakdown with delta calculations.
          Share the URL to save your comparison.
        </p>
      </div>

      {/* Selectors */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <CompareSelector
          slot="A"
          allSalaries={allSalaries}
          selectedId={s1}
          onSelect={setS1}
        />
        <div className="flex items-center justify-center text-h3 text-brand-muted font-bold">vs</div>
        <CompareSelector
          slot="B"
          allSalaries={allSalaries}
          selectedId={s2}
          onSelect={setS2}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="card border-brand-error bg-red-50 mb-6">
          <p className="text-body text-brand-error">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="card text-center py-12 animate-pulse">
          <div className="text-body text-brand-muted">Loading comparison…</div>
        </div>
      )}

      {/* Prompt */}
      {!s1 && !s2 && !loading && (
        <div className="card text-center py-16 border-dashed">
          <div className="text-4xl mb-4">⚡</div>
          <p className="text-h3 text-brand-muted mb-2">Select two records above</p>
          <p className="text-body text-brand-muted">
            The comparison table will appear automatically once you select both records.
          </p>
        </div>
      )}

      {/* Compare table */}
      {compareData && !loading && <CompareTable data={compareData} />}
    </div>
  )
}
