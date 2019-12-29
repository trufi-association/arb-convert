export default function parseLocale(...candidates: string[]) {
    for (const candidate of candidates) {
        if (candidate != null) {
            const matches = candidate.match(/(^|[\W_])([a-z]{2}[-_][A-Z]{2})($|[\W_])/);

            if (matches) {
                return matches[2].replace('_', '-');
            }
        }
    }
}
