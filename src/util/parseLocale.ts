export default function parseLocale(...candidates: string[] | undefined[]) {
  // eslint-disable-next-line no-restricted-syntax
  for (const candidate of candidates) {
    if (candidate != null) {
      const matches = candidate.match(/(^|[\W_])([a-z]{2}[-_][A-Z]{2})($|[\W_])/);

      if (matches) {
        return matches[2].replace('_', '-');
      }
    }
  }

  return undefined;
}
