import { NextRequest, NextResponse } from 'next/server';
import { sql, runMigration } from '@/lib/db';
import { countryFlag } from '@/lib/flags';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${process.env.CHECKIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await runMigration();

  // Most recent checkin
  const latest = await sql`
    SELECT country, country_name FROM checkins ORDER BY date DESC LIMIT 1
  `;

  if (latest.rows.length === 0) {
    return NextResponse.json({ error: 'No checkins yet' }, { status: 404 });
  }

  const { country, country_name } = latest.rows[0];

  // Total days in that country
  const count = await sql`
    SELECT COUNT(*) as days FROM checkins WHERE country = ${country}
  `;

  return NextResponse.json({
    country,
    country_name,
    flag: countryFlag(country),
    days_in_country: parseInt(count.rows[0].days),
    date: new Date().toISOString().slice(0, 10),
  });
}
