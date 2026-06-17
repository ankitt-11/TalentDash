import { z } from "zod"
import { Level, Currency, Source } from "@prisma/client"

// ─── Ingest Salary ─────────────────────────────────────────────────────────
export const IngestSalarySchema = z.object({
  company: z.string().min(2, "Company name must be at least 2 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  level: z.nativeEnum(Level, {
    errorMap: () => ({
      message: `Level must be one of: ${Object.values(Level).join(", ")}`,
    }),
  }),
  location: z.string().min(2, "Location must be at least 2 characters"),
  currency: z.nativeEnum(Currency, {
    errorMap: () => ({
      message: `Currency must be one of: ${Object.values(Currency).join(", ")}`,
    }),
  }),
  experience_years: z
    .number()
    .int("experience_years must be an integer")
    .positive("experience_years must be greater than 0")
    .max(50, "experience_years must be less than 51"),
  base_salary: z.number().positive("base_salary must be greater than 0"),
  bonus: z.number().min(0, "bonus cannot be negative").optional().default(0),
  stock: z.number().min(0, "stock cannot be negative").optional().default(0),
  // total_compensation is intentionally excluded — always recomputed server-side
  source: z.nativeEnum(Source),
  confidence_score: z
    .number()
    .min(0, "confidence_score must be between 0 and 1")
    .max(1, "confidence_score must be between 0 and 1"),
})

export type IngestSalaryInput = z.infer<typeof IngestSalarySchema>

// ─── GET /api/salaries query params ────────────────────────────────────────
export const GetSalariesSchema = z.object({
  company: z.string().optional(),
  role: z.string().optional(),
  level: z.nativeEnum(Level).optional(),
  location: z.string().optional(),
  currency: z.nativeEnum(Currency).optional(),
  sort: z
    .enum(["total_comp_desc", "total_comp_asc", "date_desc"])
    .optional()
    .default("total_comp_desc"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(25),
})

export type GetSalariesInput = z.infer<typeof GetSalariesSchema>

// ─── GET /api/compare query params ─────────────────────────────────────────
export const GetCompareSchema = z.object({
  s1: z.string().uuid("s1 must be a valid UUID"),
  s2: z.string().uuid("s2 must be a valid UUID"),
})

export type GetCompareInput = z.infer<typeof GetCompareSchema>
