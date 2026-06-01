import { NextRequest, NextResponse } from 'next/server';
import { sql, runMigration } from '@/lib/db';
import { reverseGeocode } from '@/lib/geocode';

interface PhotoRecord {
  lat: number;
  lon: number;
  timestamp: string; // ISO string or date string
}

// Nominatim ToS: max 1 request/second
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${process.env.CHECKIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const photos: PhotoRecord[] = body.photos ?? [];
  if (!Array.isArray(photos) || photos.length === 0) {
    return NextResponse.json({ error: 'photos array required' }, { status: 400 });
  }

  await runMigration();

  // Deduplicate by date — one geocode call per unique date
  const byDate = new Map<string, PhotoRecord>();
  for (const p of photos) {
    if (!p.lat || !p.lon || !p.timestamp) continue;
    const date = new Date(p.timestamp).toISOString().slice(0, 10);
    if (!byDate.has(date)) byDate.set(date, { ...p });
  }

  let imported = 0;
  let skipped = 0;

  for (const [date, photo] of byDate.entries()) {
    try {
      const { country, country_name } = await reverseGeocode(photo.lat, photo.lon);
      await sql`
        INSERT INTO checkins (date, country, country_name, lat, lon, source)
        VALUES (${date}, ${country}, ${country_name}, ${photo.lat}, ${photo.lon}, 'photos')
        ON CONFLICT (date, country) DO NOTHING
      `;
      imported++;
    } catch {
      skipped++;
    }
    await sleep(1100); // respect Nominatim rate limit
  }

  return NextResponse.json({ imported, skipped });
}
