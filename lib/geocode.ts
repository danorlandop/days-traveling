export interface GeoResult {
  country: string;      // ISO alpha-2 uppercase e.g. "ES"
  country_name: string; // "Spain"
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeoResult> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'bounded-app/1.0' },
  });
  if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);
  const data = await res.json();
  const code = (data.address?.country_code as string | undefined)?.toUpperCase();
  const name = data.address?.country as string | undefined;
  if (!code || !name) throw new Error('Could not determine country from coordinates');
  return { country: code, country_name: name };
}
