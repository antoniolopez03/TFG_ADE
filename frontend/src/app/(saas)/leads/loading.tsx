export default function LeadsLoading() {
  return (
    <div className="p-8">
      {/* Header skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="h-7 w-48 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-gray-100 rounded animate-pulse mt-2" />
        </div>
        <div className="h-7 w-20 bg-gray-100 rounded-full animate-pulse" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-100 pb-0">
        {[80, 100, 120, 72, 96].map((w, i) => (
          <div
            key={i}
            className="h-10 bg-gray-100 rounded animate-pulse mx-1"
            style={{ width: w }}
          />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 h-10" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-4 border-b border-gray-50 last:border-0"
          >
            <div className="flex-1">
              <div className="h-4 w-36 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="w-24">
              <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="w-32">
              <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-20 bg-gray-100 rounded animate-pulse mt-1.5" />
            </div>
            <div className="w-24">
              <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
            </div>
            <div className="w-20">
              <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="w-28 flex justify-end gap-2">
              <div className="h-7 w-16 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-7 w-14 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
