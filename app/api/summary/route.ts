import { NextRequest, NextResponse } from 'next/server';
import { sql, runMigration } from '@/lib/db';
import { countryFlag } from '@/lib/flags';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${process.env.CHECKIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await runMigration();

  const rows = await sql`
    SELECT country, country_name, COUNT(*) as days
    FROM checkins
    GROUP BY country, country_name
    ORDER BY days DESC
  `;

  return NextResponse.json(
    rows.rows.map((r) => ({
      country: r.country,
      country_name: r.country_name,
      flag: countryFlag(r.country),
      days: parseInt(r.days),
    }))
  );
}
