import { Level } from "@prisma/client"
import { formatLevel } from "@/lib/salary"

interface LevelDistributionBarProps {
  distribution: Partial<Record<Level, number>>
  total: number
}

const LEVEL_COLORS: Partial<Record<Level, string>> = {
  L3: "#64748b",
  SDE_I: "#64748b",
  L4: "#3b82f6",
  SDE_II: "#3b82f6",
  L5: "#6366f1",
  SDE_III: "#6366f1",
  L6: "#a855f7",
  IC4: "#a855f7",
  IC5: "#a855f7",
  STAFF: "#8b5cf6",
  PRINCIPAL: "#18181b",
}

export default function LevelDistributionBar({
  distribution,
  total,
}: LevelDistributionBarProps) {
  const entries = Object.entries(distribution) as [Level, number][]

  if (entries.length === 0) {
    return (
      <div className="h-10 bg-brand-border rounded-full flex items-center justify-center">
        <span className="text-meta text-brand-muted">No level data available</span>
      </div>
    )
  }

  return (
    <div>
      {/* Stacked bar */}
      <div
        className="flex h-8 rounded-full overflow-hidden gap-0.5"
        role="img"
        aria-label={`Level distribution: ${entries.map(([l, c]) => `${formatLevel(l)} ${c}`).join(", ")}`}
      >
        {entries.map(([level, count]) => {
          const pct = (count / total) * 100
          const color = LEVEL_COLORS[level] ?? "#e2e8f0"
          return (
            <div
              key={level}
              className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
              style={{ width: `${pct}%`, backgroundColor: color, minWidth: "4px" }}
              title={`${formatLevel(level)}: ${count} record${count !== 1 ? "s" : ""} (${pct.toFixed(0)}%)`}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3">
        {entries.map(([level, count]) => {
          const pct = ((count / total) * 100).toFixed(0)
          const color = LEVEL_COLORS[level] ?? "#e2e8f0"
          return (
            <div key={level} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-meta text-brand-muted">
                {formatLevel(level)}{" "}
                <span className="font-medium text-brand-dark">
                  {count} ({pct}%)
                </span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
