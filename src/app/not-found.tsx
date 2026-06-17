import Link from "next/link"

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">404</div>
      <h1 className="text-h1 text-brand-black mb-3">Page Not Found</h1>
      <p className="text-body text-brand-muted mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="btn-primary">
        Go Home
      </Link>
    </div>
  )
}
