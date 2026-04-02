export default function PlansLoading() {
    return (
        <div className="max-w-lg mx-auto px-4 py-6 animate-pulse">
            {/* Page title */}
            <div className="mb-6">
                <div className="h-6 w-36 bg-gray-200 rounded-lg mb-2" />
                <div className="h-4 w-52 bg-gray-100 rounded-lg" />
            </div>

            {/* Active plans card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
                <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
                <div className="flex flex-col gap-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded-xl" />
                    ))}
                </div>
            </div>

            {/* Mode selector buttons */}
            <div className="grid grid-cols-3 gap-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded-xl" />
                ))}
            </div>
        </div>
    );
}
