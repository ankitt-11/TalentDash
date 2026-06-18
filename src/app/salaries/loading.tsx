export default function SalariesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="mb-6">
        <div className="h-10 w-64 bg-gray-200 rounded-md mb-2"></div>
        <div className="h-5 w-96 bg-gray-200 rounded-md"></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card h-28 bg-gray-50 border border-gray-100 flex flex-col justify-center">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

      <div className="h-16 bg-gray-100 rounded-xl mb-6"></div>

      <div className="card overflow-hidden p-0">
        <div className="h-12 bg-gray-100 border-b border-gray-200"></div>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex px-4 py-4 border-b border-gray-100 items-center gap-4">
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
            <div className="h-5 w-20 bg-gray-200 rounded"></div>
            <div className="h-5 w-24 bg-gray-200 rounded"></div>
            <div className="h-5 w-16 bg-gray-200 rounded"></div>
            <div className="h-5 w-28 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
