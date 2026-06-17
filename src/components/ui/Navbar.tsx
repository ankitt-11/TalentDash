import Link from "next/link"

const navLinks = [
  { href: "/salaries", label: "Salaries" },
  { href: "/companies/google", label: "Companies" },
  { href: "/compare", label: "Compare" },
]

export default function Navbar() {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-h3 font-bold text-brand-primary group-hover:opacity-90 transition-opacity">
              Talent
            </span>
            <span className="text-h3 font-bold text-brand-black group-hover:opacity-90 transition-opacity">
              Dash
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-label font-medium text-brand-dark hover:text-brand-black hover:bg-brand-hover transition-all duration-150"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Submit CTA */}
          <Link href="/submit" className="btn-primary text-sm">
            Submit Salary
          </Link>
        </div>
      </div>
    </nav>
  )
}
