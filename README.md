# Bounded — iPhone Country Day Tracker

iPhone home screen widget showing your current country flag + number of days there.

## How it works

1. An **iOS Shortcut** runs at midnight daily and posts your GPS location to this app
2. The **Vercel backend** reverse-geocodes the coordinates → stores the country + date
3. The **Scriptable widget** fetches today's country and renders it on your home screen

---

## Setup

### 1. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

### 2. Add Postgres database

In the Vercel dashboard → Storage → Connect a database (Neon recommended, free tier).  
The `DATABASE_URL` env var is set automatically.

### 3. Set your secret

```bash
vercel env add CHECKIN_SECRET
# Enter any random string, e.g. the output of: openssl rand -hex 16
```

Copy this secret — you'll need it in both the iOS Shortcut and the Scriptable widget.

### 4. iOS Shortcut (runs daily at midnight)

1. Open **Shortcuts** app → Automation → New Automation → **Time of Day**
2. Set time: **Midnight**, repeat: **Daily**
3. Add actions:
   - **Get Current Location** → save to variable `myLocation`
   - **Get Details of Location** → Latitude from `myLocation` → save to `myLat`
   - **Get Details of Location** → Longitude from `myLocation` → save to `myLon`
   - **URL**: `https://YOUR_APP.vercel.app/api/checkin`
   - **Get Contents of URL**:
     - Method: POST
     - Headers: `Authorization` = `Bearer YOUR_SECRET`
     - Body (JSON): `{"lat": myLat, "lon": myLon}`
4. Turn off "Ask Before Running" → Done

### 5. Scriptable widget

1. Install **Scriptable** from the App Store (free)
2. Open Scriptable → tap **+** → paste contents of `scriptable/bounded-widget.js`
3. Edit the top two lines:
   ```js
   const API_URL = "https://YOUR_APP.vercel.app/api/today";
   const SECRET  = "YOUR_CHECKIN_SECRET";
   ```
4. Tap the play button → you should see the widget preview
5. Long-press your iPhone home screen → **+** → search **Scriptable** → pick small widget → Edit Widget → Script: `bounded-widget`

---

## Testing

```bash
# Test checkin (Madrid, Spain)
curl -X POST https://YOUR_APP.vercel.app/api/checkin \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"lat": 40.4168, "lon": -3.7038}'

# Test today endpoint
curl https://YOUR_APP.vercel.app/api/today \
  -H "Authorization: Bearer YOUR_SECRET"

# Full country summary
curl https://YOUR_APP.vercel.app/api/summary \
  -H "Authorization: Bearer YOUR_SECRET"
```
