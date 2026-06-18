export default function CompareLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="mb-8">
        <div className="h-10 w-80 bg-gray-200 rounded mb-3"></div>
        <div className="h-5 w-[600px] bg-gray-200 rounded"></div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="card flex-1 h-24 bg-gray-50 border border-gray-100"></div>
        <div className="flex items-center justify-center w-8">
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
        </div>
        <div className="card flex-1 h-24 bg-gray-50 border border-gray-100"></div>
      </div>

      <div className="card h-64 border-dashed bg-gray-50 border-gray-200"></div>
    </div>
  )
}
