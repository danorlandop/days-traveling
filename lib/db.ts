import { sql } from '@vercel/postgres';

export { sql };

export async function runMigration() {
  await sql`
    CREATE TABLE IF NOT EXISTS checkins (
      id           SERIAL PRIMARY KEY,
      date         DATE NOT NULL,
      country      TEXT NOT NULL,
      country_name TEXT NOT NULL,
      lat          FLOAT,
      lon          FLOAT,
      source       TEXT DEFAULT 'shortcut',
      created_at   TIMESTAMPTZ DEFAULT now()
    )
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS checkins_date_country_idx ON checkins(date, country)
  `;
}
