export default function CompanyLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* Breadcrumb */}
      <div className="h-4 w-48 bg-gray-200 rounded mb-6"></div>

      {/* Hero */}
      <div className="card mb-6 flex gap-5 items-start">
        <div className="w-16 h-16 rounded-xl bg-gray-200 shrink-0"></div>
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded mb-3"></div>
          <div className="flex gap-3">
            <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-32 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="stat-card h-24 bg-gray-50 border border-gray-100 flex flex-col justify-center">
            <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Dist */}
      <div className="card mb-6 h-32 bg-gray-50 border border-gray-100"></div>

      {/* Table */}
      <div className="card h-96 bg-gray-50 border border-gray-100"></div>
    </div>
  )
}
