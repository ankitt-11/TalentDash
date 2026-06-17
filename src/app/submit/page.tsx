"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Level, Currency } from "@prisma/client"
import { IngestSalarySchema } from "@/lib/validation"

export default function SubmitSalaryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    
    // Parse form data into matching API payload
    const payload = {
      company: formData.get("company") as string,
      role: formData.get("role") as string,
      level: formData.get("level") as Level,
      location: formData.get("location") as string,
      currency: formData.get("currency") as Currency,
      experience_years: parseInt(formData.get("experience_years") as string, 10),
      base_salary: parseInt(formData.get("base_salary") as string, 10),
      bonus: parseInt(formData.get("bonus") as string, 10) || 0,
      stock: parseInt(formData.get("stock") as string, 10) || 0,
      source: "CONTRIBUTOR",
      confidence_score: 0.9,
    }

    // Client-side validation using our shared Zod schema
    const parseResult = IngestSalarySchema.safeParse(payload)
    if (!parseResult.success) {
      const errors: Record<string, string> = {}
      parseResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message
        }
      })
      setFieldErrors(errors)
      setLoading(false)
      return
    }

    // Submit to API
    try {
      const res = await fetch("/api/ingest-salary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parseResult.data),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.field) {
          setFieldErrors({ [data.field]: data.message })
        } else {
          setError(data.message || "Failed to submit salary")
        }
        setLoading(false)
        return
      }

      // Success! Redirect to the salaries table to see it
      router.push("/salaries")
      router.refresh()
    } catch (err) {
      setError("Network error occurred while submitting.")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-h1 text-brand-black mb-2">Contribute a Salary</h1>
        <p className="text-body text-brand-muted">
          Help others negotiate better by anonymously sharing your compensation data.
        </p>
      </div>

      <div className="card max-w-2xl mx-auto animate-slide-up">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-brand-error text-brand-error text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Company */}
            <div>
              <label htmlFor="company" className="block text-label font-semibold text-brand-muted mb-2">
                Company Name *
              </label>
              <input
                id="company"
                name="company"
                type="text"
                placeholder="e.g. Google, Amazon"
                className={`filter-select w-full bg-white ${fieldErrors.company ? "border-brand-error" : ""}`}
                required
              />
              {fieldErrors.company && <p className="mt-1 text-xs text-brand-error">{fieldErrors.company}</p>}
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-label font-semibold text-brand-muted mb-2">
                Job Title / Role *
              </label>
              <input
                id="role"
                name="role"
                type="text"
                placeholder="e.g. Software Engineer"
                className={`filter-select w-full bg-white ${fieldErrors.role ? "border-brand-error" : ""}`}
                required
              />
              {fieldErrors.role && <p className="mt-1 text-xs text-brand-error">{fieldErrors.role}</p>}
            </div>

            {/* Level */}
            <div>
              <label htmlFor="level" className="block text-label font-semibold text-brand-muted mb-2">
                Level *
              </label>
              <select
                id="level"
                name="level"
                className={`filter-select w-full bg-white ${fieldErrors.level ? "border-brand-error" : ""}`}
                required
                defaultValue=""
              >
                <option value="" disabled>Select level...</option>
                {Object.values(Level).map(l => (
                  <option key={l} value={l}>{l.replace(/_/g, " ")}</option>
                ))}
              </select>
              {fieldErrors.level && <p className="mt-1 text-xs text-brand-error">{fieldErrors.level}</p>}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-label font-semibold text-brand-muted mb-2">
                Location (City) *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                placeholder="e.g. Bengaluru, Remote"
                className={`filter-select w-full bg-white ${fieldErrors.location ? "border-brand-error" : ""}`}
                required
              />
              {fieldErrors.location && <p className="mt-1 text-xs text-brand-error">{fieldErrors.location}</p>}
            </div>

            {/* Experience */}
            <div>
              <label htmlFor="experience_years" className="block text-label font-semibold text-brand-muted mb-2">
                Total Experience (Years) *
              </label>
              <input
                id="experience_years"
                name="experience_years"
                type="number"
                min="1"
                max="50"
                placeholder="e.g. 5"
                className={`filter-select w-full bg-white ${fieldErrors.experience_years ? "border-brand-error" : ""}`}
                required
              />
              {fieldErrors.experience_years && <p className="mt-1 text-xs text-brand-error">{fieldErrors.experience_years}</p>}
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="currency" className="block text-label font-semibold text-brand-muted mb-2">
                Currency *
              </label>
              <select
                id="currency"
                name="currency"
                className={`filter-select w-full bg-white ${fieldErrors.currency ? "border-brand-error" : ""}`}
                required
                defaultValue="INR"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="EUR">EUR (€)</option>
              </select>
              {fieldErrors.currency && <p className="mt-1 text-xs text-brand-error">{fieldErrors.currency}</p>}
            </div>
          </div>

          <div className="border-t border-brand-border pt-6 mt-6">
            <h3 className="text-h3 text-brand-black mb-4">Compensation Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Base Salary */}
              <div>
                <label htmlFor="base_salary" className="block text-label font-semibold text-brand-muted mb-2">
                  Base Salary *
                </label>
                <input
                  id="base_salary"
                  name="base_salary"
                  type="number"
                  min="1000"
                  placeholder="Annual Base"
                  className={`filter-select w-full bg-white ${fieldErrors.base_salary ? "border-brand-error" : ""}`}
                  required
                />
                {fieldErrors.base_salary && <p className="mt-1 text-xs text-brand-error">{fieldErrors.base_salary}</p>}
              </div>

              {/* Bonus */}
              <div>
                <label htmlFor="bonus" className="block text-label font-semibold text-brand-muted mb-2">
                  Yearly Bonus
                </label>
                <input
                  id="bonus"
                  name="bonus"
                  type="number"
                  min="0"
                  placeholder="0"
                  className={`filter-select w-full bg-white ${fieldErrors.bonus ? "border-brand-error" : ""}`}
                />
                {fieldErrors.bonus && <p className="mt-1 text-xs text-brand-error">{fieldErrors.bonus}</p>}
              </div>

              {/* Stock */}
              <div>
                <label htmlFor="stock" className="block text-label font-semibold text-brand-muted mb-2">
                  Yearly Stock / RSU
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  className={`filter-select w-full bg-white ${fieldErrors.stock ? "border-brand-error" : ""}`}
                />
                {fieldErrors.stock && <p className="mt-1 text-xs text-brand-error">{fieldErrors.stock}</p>}
              </div>

            </div>
            <p className="text-xs text-brand-muted mt-3">
              Note: Total Compensation is calculated automatically (Base + Bonus + Stock). For INR, enter the exact amount (e.g. 4000000 for 40 Lakhs).
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              className="btn-primary w-full sm:w-auto min-w-[200px] flex justify-center"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Salary Anonymously"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
