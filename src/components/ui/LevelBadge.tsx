import { Level } from "@prisma/client"
import { formatLevel } from "@/lib/salary"

interface LevelBadgeProps {
  level: Level
}

const LEVEL_CLASS_MAP: Record<Level, string> = {
  L3: "level-badge level-badge-l3",
  L4: "level-badge level-badge-l4",
  L5: "level-badge level-badge-l5",
  L6: "level-badge level-badge-l6",
  SDE_I: "level-badge level-badge-sde_i",
  SDE_II: "level-badge level-badge-sde_ii",
  SDE_III: "level-badge level-badge-sde_iii",
  STAFF: "level-badge level-badge-staff",
  PRINCIPAL: "level-badge level-badge-principal",
  IC4: "level-badge level-badge-ic4",
  IC5: "level-badge level-badge-ic5",
}

export default function LevelBadge({ level }: LevelBadgeProps) {
  return (
    <span className={LEVEL_CLASS_MAP[level]} aria-label={`Level: ${formatLevel(level)}`}>
      {formatLevel(level)}
    </span>
  )
}
