export default function FeeSubmitLoading() {
    return (
        <div className="max-w-lg mx-auto px-4 py-6 animate-pulse">
            {/* Page title */}
            <div className="mb-6">
                <div className="h-6 w-32 bg-gray-200 rounded-lg mb-2" />
                <div className="h-4 w-52 bg-gray-100 rounded-lg" />
            </div>

            {/* Search card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="h-3 w-28 bg-gray-200 rounded mb-2" />
                <div className="h-12 bg-gray-100 rounded-xl" />
            </div>
        </div>
    );
}
