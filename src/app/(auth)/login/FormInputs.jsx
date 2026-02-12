export default function FormInputs() {
    return (
        <>
            <div className="mb-5">
                <label
                    htmlFor="username"
                    className="block mb-2.5 text-sm font-medium text-heading"
                >
                    username
                </label>

                <input
                    type="text"
                    id="username"
                    name="username"
                    className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
                    placeholder="username"
                    required
                />
            </div>

            <div className="mb-5">
                <label
                    htmlFor="password"
                    className="block mb-2.5 text-sm font-medium text-heading"
                >
                    Password
                </label>

                <input
                    type="password"
                    id="password"
                    name="password"
                    className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
                    placeholder="••••••••"
                    required
                />
            </div>
        </>
    )
}