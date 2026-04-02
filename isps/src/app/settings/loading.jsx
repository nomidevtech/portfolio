export default function SettingsLoading() {
    return (
        <div className="max-w-lg mx-auto px-4 py-6 animate-pulse">
            {/* Page title */}
            <div className="mb-6">
                <div className="h-6 w-24 bg-gray-200 rounded-lg mb-2" />
                <div className="h-4 w-44 bg-gray-100 rounded-lg" />
            </div>

            {/* Account card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                <div className="h-4 w-32 bg-gray-200 rounded mb-5" />
                <div className="flex flex-col gap-5">
                    {/* username */}
                    <div>
                        <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
                        <div className="h-12 bg-gray-100 rounded-xl" />
                    </div>
                    {/* email */}
                    <div>
                        <div className="h-3 w-12 bg-gray-200 rounded mb-2" />
                        <div className="h-12 bg-gray-100 rounded-xl" />
                    </div>
                    {/* change password link */}
                    <div className="border-t border-gray-100 pt-4">
                        <div className="h-4 w-36 bg-gray-100 rounded" />
                    </div>
                    {/* current password */}
                    <div>
                        <div className="h-3 w-28 bg-gray-200 rounded mb-2" />
                        <div className="h-12 bg-gray-100 rounded-xl" />
                    </div>
                    {/* save button */}
                    <div className="h-12 bg-gray-200 rounded-xl" />
                </div>
            </div>

            {/* Danger zone card */}
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
                <div className="h-4 w-28 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-52 bg-gray-100 rounded mb-4" />
                <div className="h-12 bg-red-50 rounded-xl border border-red-100" />
            </div>
        </div>
    );
}
