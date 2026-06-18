import { Metadata } from "next"
import Link from "next/link"
import { buildHomeMeta } from "@/lib/seo"

export async function generateMetadata(): Promise<Metadata> {
  const meta = buildHomeMeta()
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: meta.canonical },
    openGraph: meta.openGraph,
  }
}

export const revalidate = 3600

const FEATURED_COMPANIES = [
  { slug: "google", name: "Google" },
  { slug: "amazon", name: "Amazon" },
  { slug: "meta", name: "Meta" },
  { slug: "microsoft", name: "Microsoft" },
  { slug: "flipkart", name: "Flipkart" },
  { slug: "razorpay", name: "Razorpay" },
]

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-white border-b border-brand-border py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-data-light text-brand-data px-4 py-1.5 rounded-full text-label font-medium mb-6">
            Compensation Intelligence for Tech Professionals
          </div>
          <h1 className="text-[48px] sm:text-[60px] font-bold text-brand-black leading-[1.05] mb-6">
            Explore and Compare{" "}
            <span className="text-gradient-primary">Real Compensation Data.</span>
          </h1>
          <p className="text-body text-brand-muted max-w-xl mx-auto mb-10 text-lg">
            Make data-driven career decisions. Filter by company, role, level, and city. Compare offers side-by-side with exact deltas. <br/><span className="text-meta text-brand-muted font-medium">Updated from verified salary submissions.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/salaries" prefetch={true} id="hero-cta-salaries" className="btn-primary text-base px-8 py-3">
              Browse Salaries →
            </Link>
            <Link href="/compare" prefetch={true} id="hero-cta-compare" className="btn-secondary text-base px-8 py-3">
              Compare Offers
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-brand-black text-white py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-[32px] font-bold text-brand-primary">65+</div>
              <div className="text-label text-gray-400">Verified Records</div>
            </div>
            <div>
              <div className="text-[32px] font-bold text-brand-primary">12</div>
              <div className="text-label text-gray-400">Companies</div>
            </div>
            <div>
              <div className="text-[32px] font-bold text-brand-primary">8</div>
              <div className="text-label text-gray-400">Cities Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured companies */}
      <section className="py-16 px-4 bg-brand-bg">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-h2 text-brand-black text-center mb-3">Popular Companies</h2>
          <p className="text-body text-brand-muted text-center mb-10">
            Explore compensation data for top employers in India
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {FEATURED_COMPANIES.map((company) => (
              <Link
                key={company.slug}
                href={`/companies/${company.slug}`}
                prefetch={true}
                id={`company-card-${company.slug}`}
                className="card hover:shadow-card-hover hover:border-brand-primary/30 transition-all duration-200 group text-center"
              >
                <div className="text-h3 font-bold text-brand-black group-hover:text-brand-primary transition-colors">
                  {company.name}
                </div>
                <div className="text-label text-brand-muted mt-1 group-hover:text-brand-dark transition-colors">
                  View salaries →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white border-t border-brand-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-h2 text-brand-black text-center mb-12">How TalentDash Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: "🔍", title: "Search", desc: "Filter by company, role, level, and city to find exactly the data you need." },
              { icon: "📊", title: "Compare", desc: "Put any two offers side by side. See base, bonus, stock, and TC delta instantly." },
              { icon: "✅", title: "Decide", desc: "Walk into your next negotiation with real market data. Not guesses." },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-h3 text-brand-black mb-2">{item.title}</h3>
                <p className="text-body text-brand-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
