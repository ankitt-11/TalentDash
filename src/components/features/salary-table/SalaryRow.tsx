import { SalaryRecord, DisplayCurrency } from "@/types/salary"
import { formatSalary, formatExperience } from "@/lib/format"
import LevelBadge from "@/components/ui/LevelBadge"
import Link from "next/link"

interface SalaryRowProps {
  salary: SalaryRecord
  displayCurrency: DisplayCurrency
  rank?: number
}

export default function SalaryRow({ salary, displayCurrency }: SalaryRowProps) {
  const currency = salary.currency as "INR" | "USD" | "GBP" | "EUR"
  const baseSalary = BigInt(salary.base_salary)
  const bonus = BigInt(salary.bonus)
  const stock = BigInt(salary.stock)
  const tc = BigInt(salary.total_compensation)

  const displayCurr = displayCurrency as "INR" | "USD"

  return (
    <tr className="group even:bg-gray-50/50 hover:bg-brand-hover transition-colors">
      {/* Company */}
      <td className="px-4 py-4 border-b border-brand-border">
        <div className="flex items-center gap-3">
          {/* Initials Avatar */}
          <div className="w-8 h-8 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 text-xs font-bold text-gray-600">
            {salary.company.name.substring(0, 1).toUpperCase()}
          </div>
          <div>
            <Link
              href={`/companies/${salary.company.slug}`}
              className="font-semibold text-brand-black hover:text-brand-primary transition-colors max-w-[160px] block truncate"
              title={salary.company.name}
            >
              {salary.company.name}
            </Link>
            {salary.company.industry && (
              <span className="block text-meta text-brand-muted mt-0.5 truncate max-w-[160px]">
                {salary.company.industry}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-4 py-4 border-b border-brand-border">
        <span className="text-body font-medium text-brand-dark max-w-[180px] block truncate" title={salary.role}>
          {salary.role}
        </span>
      </td>

      {/* Level */}
      <td className="px-4 py-4 border-b border-brand-border">
        <LevelBadge level={salary.level} />
      </td>

      {/* Location */}
      <td className="px-4 py-4 border-b border-brand-border">
        <span className="text-body text-brand-dark whitespace-nowrap">{salary.location}</span>
      </td>

      {/* Experience */}
      <td className="px-4 py-4 border-b border-brand-border">
        <span className="text-body text-brand-dark whitespace-nowrap">
          {formatExperience(salary.experience_years)}
        </span>
      </td>

      {/* Base Salary */}
      <td className="px-4 py-4 border-b border-brand-border">
        <span className="text-body font-medium text-brand-dark whitespace-nowrap">
          {formatSalary(baseSalary, currency, displayCurr)}
        </span>
      </td>

      {/* Stock */}
      <td className="px-4 py-4 border-b border-brand-border">
        <span className="text-body text-brand-dark whitespace-nowrap">
          {stock > 0n ? formatSalary(stock, currency, displayCurr) : "—"}
        </span>
      </td>

      {/* Total Comp — dominant number */}
      <td className="px-4 py-4 border-b border-brand-border">
        <span className="tc-amount whitespace-nowrap">
          {formatSalary(tc, currency, displayCurr)}
        </span>
        {!salary.is_verified && (
          <span className="block text-meta text-brand-muted mt-0.5">unverified</span>
        )}
      </td>
    </tr>
  )
}
