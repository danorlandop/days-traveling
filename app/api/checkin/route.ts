import { NextRequest, NextResponse } from 'next/server';
import { sql, runMigration } from '@/lib/db';
import { reverseGeocode } from '@/lib/geocode';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${process.env.CHECKIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const lat = parseFloat(body.lat);
  const lon = parseFloat(body.lon);
  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: 'lat and lon required' }, { status: 400 });
  }

  const date = body.timestamp
    ? new Date(body.timestamp).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  await runMigration();
  const { country, country_name } = await reverseGeocode(lat, lon);

  await sql`
    INSERT INTO checkins (date, country, country_name, lat, lon, source)
    VALUES (${date}, ${country}, ${country_name}, ${lat}, ${lon}, 'shortcut')
    ON CONFLICT (date, country) DO UPDATE SET lat = EXCLUDED.lat, lon = EXCLUDED.lon
  `;

  return NextResponse.json({ date, country, country_name });
}
