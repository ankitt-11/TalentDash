import Link from "next/link"

export default function CompanyNotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">🏢</div>
      <h1 className="text-h1 text-brand-black mb-3">Company Not Found</h1>
      <p className="text-body text-brand-muted mb-8">
        This company doesn&apos;t exist in our database yet. It may have been removed or the
        URL is incorrect.
      </p>
      <div className="flex gap-3 justify-center">
        <Link href="/salaries" className="btn-primary">
          Browse Salaries
        </Link>
        <Link href="/" className="btn-secondary">
          Go Home
        </Link>
      </div>
    </div>
  )
}
