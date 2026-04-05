export default function SettingsLoading() {
  return (
    <div className="p-8 max-w-3xl">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-7 w-40 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mt-2" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex items-center gap-0 border-b border-gray-100 mb-6">
        {[80, 56, 48, 72].map((w, i) => (
          <div
            key={i}
            className="h-10 bg-gray-100 rounded animate-pulse mx-2"
            style={{ width: w }}
          />
        ))}
      </div>

      {/* Form card skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <div className="h-5 w-52 bg-gray-100 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        ))}
        <div className="h-9 w-36 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
