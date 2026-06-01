// Bounded Widget v2 — paste this into the Scriptable app on your iPhone
// Supports small (top country only) and medium/large (country list) sizes.

const API_URL = "https://YOUR_APP.vercel.app/api/summary";
const SECRET  = "YOUR_CHECKIN_SECRET";

async function fetchSummary() {
  const req = new Request(API_URL);
  req.headers = { Authorization: `Bearer ${SECRET}` };
  return await req.loadJSON();
}

async function buildWidget(data, size) {
  const w = new ListWidget();
  w.backgroundColor = new Color("#0f0f0f");
  w.setPadding(14, 14, 14, 14);

  // Refresh at next midnight
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 1, 0, 0);
  w.refreshAfterDate = tomorrow;

  const countries = data.countries || [];
  const topCountry = countries[0];

  if (size === "small" || !topCountry) {
    // Small: show top country only
    const flag = w.addText(topCountry ? topCountry.flag : "🌍");
    flag.font = Font.systemFont(44);
    flag.centerAlignText();
    w.addSpacer(6);
    const name = w.addText(topCountry ? topCountry.country_name : "No data");
    name.font = Font.semiboldSystemFont(15);
    name.textColor = Color.white();
    name.centerAlignText();
    w.addSpacer(3);
    const days = w.addText(topCountry ? `${topCountry.days} day${topCountry.days === 1 ? "" : "s"}` : "");
    days.font = Font.systemFont(12);
    days.textColor = new Color("#888888");
    days.centerAlignText();
  } else {
    // Medium/Large: header + country list
    const header = w.addText(`${data.total_countries} countries · ${data.total_days} days`);
    header.font = Font.semiboldSystemFont(12);
    header.textColor = new Color("#888888");
    w.addSpacer(10);

    const maxRows = size === "large" ? 8 : 4;
    for (const c of countries.slice(0, maxRows)) {
      const row = w.addStack();
      row.layoutHorizontally();
      row.centerAlignContent();

      const flagText = row.addText(c.flag);
      flagText.font = Font.systemFont(16);

      row.addSpacer(8);

      const nameText = row.addText(c.country_name);
      nameText.font = Font.systemFont(13);
      nameText.textColor = Color.white();
      nameText.lineLimit = 1;

      row.addSpacer();

      const daysText = row.addText(`${c.days}d`);
      daysText.font = Font.systemFont(13);
      daysText.textColor = new Color("#888888");

      w.addSpacer(6);
    }
  }

  return w;
}

async function buildErrorWidget(msg) {
  const w = new ListWidget();
  w.backgroundColor = new Color("#0f0f0f");
  const t = w.addText(msg);
  t.textColor = Color.red();
  t.font = Font.systemFont(11);
  t.minimumScaleFactor = 0.5;
  return w;
}

// Detect widget size
const size = config.widgetFamily ?? "medium";

let widget;
try {
  const data = await fetchSummary();
  widget = await buildWidget(data, size);
} catch (e) {
  widget = await buildErrorWidget(e.message || "Error loading data");
}

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  // Preview all sizes when run in app
  await widget.presentSmall();
}
Script.complete();
