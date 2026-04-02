export default function DashboardLoading() {
    return (
        <div className="max-w-lg mx-auto px-4 py-6 animate-pulse">
            {/* Page title */}
            <div className="mb-6">
                <div className="h-6 w-32 bg-gray-200 rounded-lg mb-2" />
                <div className="h-4 w-48 bg-gray-100 rounded-lg" />
            </div>

            {/* Filter card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <div className="h-3 w-12 bg-gray-200 rounded mb-2" />
                        <div className="h-12 bg-gray-100 rounded-xl" />
                    </div>
                    <div>
                        <div className="h-3 w-10 bg-gray-200 rounded mb-2" />
                        <div className="h-12 bg-gray-100 rounded-xl" />
                    </div>
                </div>
                <div className="h-12 bg-gray-200 rounded-xl" />
            </div>

            {/* 4 stat cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 ${i === 0 ? "border-l-4 border-l-gray-200" : ""}`}>
                        <div className="h-3 w-20 bg-gray-200 rounded mb-3" />
                        <div className="h-7 w-16 bg-gray-200 rounded-lg" />
                    </div>
                ))}
            </div>

            {/* Status badges */}
            <div className="flex flex-col gap-2">
                <div className="h-3 w-24 bg-gray-200 rounded mb-1" />
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-xl" />
                ))}
            </div>
        </div>
    );
}
