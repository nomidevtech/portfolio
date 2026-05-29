function capitalizeWord(word) {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/** Names, addresses, departments (stored with spaces → hyphens). */
export function fromHyphenSlug(value, fallback = "") {
    if (value == null || value === "") return fallback;
    if (!String(value).includes("-")) return capitalizeWord(String(value));
    return String(value).split("-").map(capitalizeWord).join(" ");
}

/** Treatments (stored with spaces → underscores). */
export function fromUnderscoreSlug(value, fallback = "") {
    if (value == null || value === "") return fallback;
    if (!String(value).includes("_")) return capitalizeWord(String(value));
    return String(value).split("_").map(capitalizeWord).join(" ");
}

export function capitalizeLabel(value, fallback = "") {
    if (value == null || value === "") return fallback;
    const s = String(value);
    return s.charAt(0).toUpperCase() + s.slice(1);
}
