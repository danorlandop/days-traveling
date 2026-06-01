import { NextRequest, NextResponse } from 'next/server';
import { sql, runMigration } from '@/lib/db';
import { reverseGeocode } from '@/lib/geocode';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CHECKIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const locations = body.locations ?? [];
  if (!Array.isArray(locations) || locations.length === 0) {
    return NextResponse.json({ result: 'ok', imported: 0 });
  }

  await runMigration();

  // Deduplicate by date — one geocode per unique day
  const byDate = new Map<string, { lat: number; lon: number }>();
  for (const loc of locations) {
    const coords = loc?.geometry?.coordinates;
    const timestamp = loc?.properties?.timestamp;
    if (!coords || coords.length < 2 || !timestamp) continue;
    const lon = coords[0]; // GeoJSON is [lon, lat]
    const lat = coords[1];
    if (isNaN(lat) || isNaN(lon)) continue;
    const date = new Date(timestamp).toISOString().slice(0, 10);
    if (!byDate.has(date)) byDate.set(date, { lat, lon });
  }

  let imported = 0;
  let skipped = 0;

  for (const [date, { lat, lon }] of byDate.entries()) {
    try {
      const { country, country_name } = await reverseGeocode(lat, lon);
      await sql`
        INSERT INTO checkins (date, country, country_name, lat, lon, source)
        VALUES (${date}, ${country}, ${country_name}, ${lat}, ${lon}, 'overland')
        ON CONFLICT (date, country) DO NOTHING
      `;
      imported++;
    } catch {
      skipped++;
    }
    await sleep(1100);
  }

  // Overland expects { result: "ok" }
  return NextResponse.json({ result: 'ok', imported, skipped });
}
