# days-traveling — iPhone Country Day Tracker

Personal replacement for Bounded ($70/yr). iPhone home screen widget showing countries visited + days spent in each.

**Live at:** https://days-traveling.vercel.app

---

## How it works

1. **Overland** (free iOS app) runs in the background and posts your GPS automatically
2. **Vercel backend** reverse-geocodes coordinates → stores country + date in Postgres
3. **Scriptable widget** on your home screen shows the country list with flags + day counts

---

## Project structure

```
app/api/
  checkin/        ← POST: manual check-in {lat, lon}
  overland/       ← POST: Overland iOS app (GeoJSON, ?secret= auth)
  import-photos/  ← POST: batch import from iPhone photo GPS metadata
  today/          ← GET: current country for small widget
  summary/        ← GET: all countries + total days (for list widget)
lib/
  db.ts           ← Postgres client + auto-migration
  geocode.ts      ← Nominatim reverse geocode (free, no API key)
  flags.ts        ← country code → emoji flag
scriptable/
  bounded-widget.js  ← paste into Scriptable app on iPhone
scripts/
  DailyCheckin.shortcut    ← tap to install iOS Shortcut
  TravelBackfill.shortcut  ← tap to install photo backfill Shortcut
```

---

## Setup (already done for this installation)

### Environment variables (Vercel dashboard)
| Key | Value |
|-----|-------|
| `DATABASE_URL` | set by Neon integration |
| `CHECKIN_SECRET` | your secret token |

### Overland (automatic GPS tracking)
1. Install **Overland** from App Store (free)
2. Settings → Receiver URL:
   ```
   https://days-traveling.vercel.app/api/overland?secret=YOUR_SECRET
   ```
3. Done — runs forever in background

### Scriptable widget
1. Install **Scriptable** from App Store (free)
2. Open Scriptable → paste `scriptable/bounded-widget.js`
3. Edit top two lines with your URL + secret
4. Long-press home screen → **+** → Scriptable → pick medium or large size

---

## API reference

```bash
# Manual check-in
curl -X POST https://days-traveling.vercel.app/api/checkin \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"lat": 40.4168, "lon": -3.7038}'

# Today's country (small widget)
curl https://days-traveling.vercel.app/api/today \
  -H "Authorization: Bearer YOUR_SECRET"

# Full summary (list widget)
curl https://days-traveling.vercel.app/api/summary \
  -H "Authorization: Bearer YOUR_SECRET"

# Overland format test
curl -X POST "https://days-traveling.vercel.app/api/overland?secret=YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"locations":[{"type":"Feature","geometry":{"type":"Point","coordinates":[-3.7038,40.4168]},"properties":{"timestamp":"2026-06-01T12:00:00Z"}}]}'
```
