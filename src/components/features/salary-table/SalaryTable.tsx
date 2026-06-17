"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { SalaryRecord, DisplayCurrency } from "@/types/salary"
import SalaryRow from "./SalaryRow"
import EmptyState from "@/components/ui/EmptyState"

type SortKey = "total_comp_desc" | "total_comp_asc" | "date_desc"

interface SortConfig {
  key: SortKey
  column: string
}

const SORT_COLUMNS: { label: string; ascKey: SortKey; descKey: SortKey }[] = [
  { label: "Total Comp", ascKey: "total_comp_asc", descKey: "total_comp_desc" },
]

interface SalaryTableProps {
  salaries: SalaryRecord[]
  total: number
  page: number
  limit: number
  totalPages: number
  displayCurrency: DisplayCurrency
  currentSort: SortKey
}

export default function SalaryTable({
  salaries,
  total,
  page,
  limit,
  totalPages,
  displayCurrency,
  currentSort,
}: SalaryTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function buildPageUrl(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPage))
    return `${pathname}?${params.toString()}`
  }

  function buildSortUrl(sort: SortKey) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", sort)
    params.set("page", "1")
    return `${pathname}?${params.toString()}`
  }

  function handleSort(col: (typeof SORT_COLUMNS)[0]) {
    const nextSort =
      currentSort === col.descKey ? col.ascKey : col.descKey
    router.push(buildSortUrl(nextSort))
  }

  function clearAllFilters() {
    router.push(pathname)
  }

  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  const columns = [
    { label: "Company", sortable: false },
    { label: "Role", sortable: false },
    { label: "Level", sortable: false },
    { label: "Location", sortable: false },
    { label: "Experience", sortable: false },
    { label: "Base Salary", sortable: false },
    { label: "Stock", sortable: false },
    { label: "Total Comp", sortable: true },
  ]

  return (
    <div>
      {/* Record count */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-label text-brand-muted">
          {total === 0 ? (
            "No records found"
          ) : (
            <>
              Showing <span className="font-semibold text-brand-dark">{start}–{end}</span>{" "}
              of <span className="font-semibold text-brand-dark">{total.toLocaleString()}</span> records
            </>
          )}
        </p>

        <div className="flex items-center gap-2">
          <label className="text-label text-brand-muted">Sort:</label>
          <select
            id="sort-select"
            value={currentSort}
            onChange={(e) => router.push(buildSortUrl(e.target.value as SortKey))}
            className="text-label border border-brand-border rounded-lg px-3 py-1.5 bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            aria-label="Sort results"
          >
            <option value="total_comp_desc">Total Comp: High → Low</option>
            <option value="total_comp_asc">Total Comp: Low → High</option>
            <option value="date_desc">Newest First</option>
          </select>
        </div>
      </div>

      {salaries.length === 0 ? (
        <EmptyState onClearFilters={clearAllFilters} />
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-brand-border shadow-card">
            <table className="salary-table" aria-label="Salary records">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.label}
                      className={col.sortable ? "sortable" : ""}
                      onClick={
                        col.sortable
                          ? () => handleSort(SORT_COLUMNS[0])
                          : undefined
                      }
                      aria-sort={
                        col.label === "Total Comp"
                          ? currentSort === "total_comp_desc"
                            ? "descending"
                            : currentSort === "total_comp_asc"
                            ? "ascending"
                            : "none"
                          : undefined
                      }
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {col.label === "Total Comp" && (
                          <svg
                            className="w-3.5 h-3.5 text-brand-muted"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            {currentSort === "total_comp_asc" ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            )}
                          </svg>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {salaries.map((salary) => (
                  <SalaryRow
                    key={salary.id}
                    salary={salary}
                    displayCurrency={displayCurrency}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-label text-brand-muted">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  id="pagination-prev"
                  disabled={page <= 1}
                  onClick={() => router.push(buildPageUrl(page - 1))}
                  className="pagination-btn"
                  aria-label="Previous page"
                >
                  ‹
                </button>

                {/* Page numbers (show max 5) */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      id={`pagination-page-${pageNum}`}
                      onClick={() => router.push(buildPageUrl(pageNum))}
                      className={`pagination-btn ${pageNum === page ? "active" : ""}`}
                      aria-label={`Page ${pageNum}`}
                      aria-current={pageNum === page ? "page" : undefined}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                <button
                  id="pagination-next"
                  disabled={page >= totalPages}
                  onClick={() => router.push(buildPageUrl(page + 1))}
                  className="pagination-btn"
                  aria-label="Next page"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
