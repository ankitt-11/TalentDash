"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { Level } from "@prisma/client"
import { formatLevel } from "@/lib/salary"

const ALL_LEVELS = Object.values(Level)

const LOCATIONS = [
  "All Locations",
  "Bengaluru",
  "Mumbai",
  "Hyderabad",
  "Pune",
  "Delhi",
  "Chennai",
  "San Francisco",
  "London",
  "Remote",
]

export default function SalaryFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Read current filter state from URL
  const [company, setCompany] = useState(searchParams.get("company") ?? "")
  const [role, setRole] = useState(searchParams.get("role") ?? "")
  const [selectedLevels, setSelectedLevels] = useState<Level[]>(() => {
    const lvl = searchParams.get("level")
    return lvl ? [lvl as Level] : []
  })
  const [location, setLocation] = useState(searchParams.get("location") ?? "")
  const [currency, setCurrency] = useState<"INR" | "USD">(
    (searchParams.get("currency") as "INR" | "USD") ?? "INR"
  )
  const [showLevelDropdown, setShowLevelDropdown] = useState(false)
  const levelDropdownRef = useRef<HTMLDivElement>(null)

  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const buildParams = useCallback(
    (overrides: Record<string, string | string[] | undefined> = {}) => {
      const params = new URLSearchParams()
      const vals: Record<string, string | string[] | undefined> = {
        company,
        role,
        level: selectedLevels.length > 0 ? selectedLevels[0] : undefined,
        location: location && location !== "All Locations" ? location : undefined,
        currency: currency !== "INR" ? currency : undefined,
        page: "1", // Reset to page 1 on any filter change
        ...overrides,
      }
      for (const [k, v] of Object.entries(vals)) {
        if (v && v !== "") params.set(k, Array.isArray(v) ? v[0] : v)
      }
      return params.toString()
    },
    [company, role, selectedLevels, location, currency]
  )

  // Debounced URL push for text inputs
  function debounceNavigate(newParams: string) {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      router.push(`${pathname}?${newParams}`)
    }, 300)
  }

  function handleCompanyChange(value: string) {
    setCompany(value)
    debounceNavigate(
      buildParams({ company: value || undefined })
    )
  }

  function handleRoleChange(value: string) {
    setRole(value)
    debounceNavigate(
      buildParams({ role: value || undefined })
    )
  }

  function handleLocationChange(value: string) {
    setLocation(value)
    const params = buildParams({ location: value !== "All Locations" ? value : undefined })
    router.push(`${pathname}?${params}`)
  }

  function handleCurrencyChange(c: "INR" | "USD") {
    setCurrency(c)
    const params = buildParams({ currency: c !== "INR" ? c : undefined })
    router.push(`${pathname}?${params}`)
  }

  function toggleLevel(level: Level) {
    const next = selectedLevels.includes(level)
      ? selectedLevels.filter((l) => l !== level)
      : [...selectedLevels, level]
    setSelectedLevels(next)
    const params = buildParams({ level: next.length > 0 ? next[0] : undefined })
    router.push(`${pathname}?${params}`)
  }

  function clearAllFilters() {
    setCompany("")
    setRole("")
    setSelectedLevels([])
    setLocation("")
    setCurrency("INR")
    router.push(pathname)
  }

  // Close level dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (levelDropdownRef.current && !levelDropdownRef.current.contains(e.target as Node)) {
        setShowLevelDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const hasActiveFilters = company || role || selectedLevels.length > 0 || location

  return (
    <div className="bg-white border border-brand-border rounded-xl p-4 mb-4 shadow-card">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Company search */}
        <div className="flex-1 min-w-[160px]">
          <label className="block text-label font-medium text-brand-muted mb-1.5">
            Company
          </label>
          <input
            id="filter-company"
            type="text"
            placeholder="e.g. Amazon"
            value={company}
            onChange={(e) => handleCompanyChange(e.target.value)}
            className="filter-input"
            autoComplete="off"
          />
        </div>

        {/* Role search */}
        <div className="flex-1 min-w-[140px]">
          <label className="block text-label font-medium text-brand-muted mb-1.5">
            Role
          </label>
          <input
            id="filter-role"
            type="text"
            placeholder="e.g. Software Engineer"
            value={role}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="filter-input"
            autoComplete="off"
          />
        </div>

        {/* Level multi-select */}
        <div className="flex-1 min-w-[130px] relative" ref={levelDropdownRef}>
          <label className="block text-label font-medium text-brand-muted mb-1.5">
            Level
          </label>
          <button
            id="filter-level-toggle"
            onClick={() => setShowLevelDropdown(!showLevelDropdown)}
            className="filter-input text-left flex items-center justify-between"
            aria-expanded={showLevelDropdown}
          >
            <span className={selectedLevels.length === 0 ? "text-brand-muted" : "text-brand-dark"}>
              {selectedLevels.length === 0
                ? "All Levels"
                : selectedLevels.map(formatLevel).join(", ")}
            </span>
            <svg className="w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showLevelDropdown && (
            <div className="absolute z-20 mt-1 w-48 bg-white border border-brand-border rounded-lg shadow-card-hover py-1 animate-fade-in">
              {ALL_LEVELS.map((level) => (
                <label
                  key={level}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-brand-hover cursor-pointer"
                >
                  <input
                    type="checkbox"
                    id={`level-checkbox-${level}`}
                    checked={selectedLevels.includes(level)}
                    onChange={() => toggleLevel(level)}
                    className="accent-brand-primary w-4 h-4"
                  />
                  <span className="text-label text-brand-dark">{formatLevel(level)}</span>
                </label>
              ))}
              {selectedLevels.length > 0 && (
                <div className="border-t border-brand-border mt-1 pt-1">
                  <button
                    onClick={() => {
                      setSelectedLevels([])
                      const params = buildParams({ level: undefined })
                      router.push(`${pathname}?${params}`)
                      setShowLevelDropdown(false)
                    }}
                    className="w-full text-left px-3 py-2 text-label text-brand-primary hover:bg-brand-hover"
                  >
                    Clear levels
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex-1 min-w-[130px]">
          <label className="block text-label font-medium text-brand-muted mb-1.5">
            Location
          </label>
          <div className="relative">
            <select
              id="filter-location"
              value={location || "All Locations"}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="filter-select pr-8 w-full"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
              <svg className="w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Currency toggle */}
        <div className="shrink-0">
          <label className="block text-label font-medium text-brand-muted mb-1.5">
            Currency
          </label>
          <div className="currency-toggle" role="group" aria-label="Currency selector">
            <button
              id="currency-toggle-inr"
              onClick={() => handleCurrencyChange("INR")}
              className={`currency-toggle-btn ${currency === "INR" ? "active" : ""}`}
              aria-pressed={currency === "INR"}
            >
              ₹ INR
            </button>
            <button
              id="currency-toggle-usd"
              onClick={() => handleCurrencyChange("USD")}
              className={`currency-toggle-btn ${currency === "USD" ? "active" : ""}`}
              aria-pressed={currency === "USD"}
            >
              $ USD
            </button>
          </div>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            id="filter-clear-all"
            onClick={clearAllFilters}
            className="btn-ghost self-end mb-0.5"
            title="Clear all filters"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}
