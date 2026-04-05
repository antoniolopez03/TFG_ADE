export default function ProspectingLoading() {
  return (
    <div className="p-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-7 w-48 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-4 w-80 bg-gray-100 rounded animate-pulse mt-2" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="h-5 w-36 bg-gray-100 rounded animate-pulse mb-5" />
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse mb-2" />
                <div className="h-9 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        </div>

        <div className="bg-leadby-500/5 border border-leadby-500/20 rounded-xl p-6">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse flex-shrink-0" />
            <div className="flex-1">
              <div className="h-5 w-48 bg-gray-100 rounded animate-pulse mb-2" />
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse mt-1" />
            </div>
          </div>
          <div className="h-12 bg-gray-100 rounded-xl animate-pulse mt-4" />
        </div>
      </div>

      {/* History skeleton */}
      <div className="h-5 w-36 bg-gray-100 rounded animate-pulse mb-4" />
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-4 border-b border-gray-50 last:border-0"
          >
            <div className="h-4 w-36 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
            <div className="h-6 w-28 bg-gray-100 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
