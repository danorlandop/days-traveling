// Converts ISO 3166-1 alpha-2 country code to emoji flag
// "US" → "🇺🇸", "ES" → "🇪🇸"
export function countryFlag(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('');
}
