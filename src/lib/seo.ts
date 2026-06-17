import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "./constants"

export interface PageMeta {
  title: string
  description: string
  canonical: string
  openGraph: {
    title: string
    description: string
    url: string
    siteName: string
    type: string
  }
}

export function buildSalaryListMeta(): PageMeta {
  const title = `Software Engineer & Tech Salaries in India | ${SITE_NAME}`
  const description =
    "Browse real salary data for Software Engineers, Product Managers, Data Scientists and more across Google, Amazon, Meta, TCS and 100+ companies in India."
  return {
    title,
    description,
    canonical: `${SITE_URL}/salaries`,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/salaries`,
      siteName: SITE_NAME,
      type: "website",
    },
  }
}

export function buildCompanyMeta(company: {
  name: string
  slug: string
  industry?: string | null
}): PageMeta {
  const title = `${company.name} Salaries & Compensation — ${company.industry ?? "Tech"} | ${SITE_NAME}`
  const description = `Real compensation data for ${company.name}. See salary ranges by level, role, and location sourced from verified employees and public data.`
  return {
    title,
    description,
    canonical: `${SITE_URL}/companies/${company.slug}`,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/companies/${company.slug}`,
      siteName: SITE_NAME,
      type: "website",
    },
  }
}

export function buildCompareMeta(): PageMeta {
  const title = `Compare Job Offers & Salaries Side by Side | ${SITE_NAME}`
  const description =
    "Compare any two salary records side by side. See base, bonus, stock, and total compensation differences instantly."
  return {
    title,
    description,
    canonical: `${SITE_URL}/compare`,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/compare`,
      siteName: SITE_NAME,
      type: "website",
    },
  }
}

export function buildHomeMeta(): PageMeta {
  return {
    title: `${SITE_NAME} — India's Salary Intelligence Platform`,
    description: SITE_DESCRIPTION,
    canonical: SITE_URL,
    openGraph: {
      title: `${SITE_NAME} — India's Salary Intelligence Platform`,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      siteName: SITE_NAME,
      type: "website",
    },
  }
}

// JSON-LD builders
export function buildDatasetJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "TalentDash India Tech Salary Dataset",
    description:
      "Structured compensation data for software engineers, product managers, and data professionals at companies in India and globally.",
    url: `${SITE_URL}/salaries`,
    creator: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    keywords: [
      "salary",
      "compensation",
      "software engineer salary India",
      "tech salaries",
      "LPA",
    ],
    license: "https://creativecommons.org/licenses/by/4.0/",
  }
}

export function buildOrganizationJsonLd(company: {
  name: string
  slug: string
  industry?: string | null
  headquarters?: string | null
  founded_year?: number | null
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: `${SITE_URL}/companies/${company.slug}`,
    ...(company.industry && { industry: company.industry }),
    ...(company.headquarters && {
      address: { "@type": "PostalAddress", addressLocality: company.headquarters },
    }),
    ...(company.founded_year && { foundingDate: String(company.founded_year) }),
  }
}
