// Bounded Widget — paste this into the Scriptable app on your iPhone
// Add your deployed URL and secret below, then add a Scriptable widget to your home screen.

const API_URL = "https://YOUR_APP.vercel.app/api/today";
const SECRET  = "YOUR_CHECKIN_SECRET";

async function fetchToday() {
  const req = new Request(API_URL);
  req.headers = { Authorization: `Bearer ${SECRET}` };
  return await req.loadJSON();
}

async function buildWidget(data) {
  const w = new ListWidget();
  w.backgroundColor = new Color("#0f0f0f");
  w.setPadding(16, 16, 16, 16);

  // Refresh at next midnight
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 1, 0, 0);
  w.refreshAfterDate = tomorrow;

  const flag = w.addText(data.flag);
  flag.font = Font.systemFont(48);
  flag.centerAlignText();

  w.addSpacer(6);

  const name = w.addText(data.country_name);
  name.font = Font.semiboldSystemFont(16);
  name.textColor = Color.white();
  name.centerAlignText();

  w.addSpacer(4);

  const days = w.addText(`${data.days_in_country} day${data.days_in_country === 1 ? "" : "s"}`);
  days.font = Font.systemFont(13);
  days.textColor = new Color("#888888");
  days.centerAlignText();

  return w;
}

async function buildErrorWidget(msg) {
  const w = new ListWidget();
  w.backgroundColor = new Color("#0f0f0f");
  const t = w.addText(msg);
  t.textColor = Color.red();
  t.font = Font.systemFont(12);
  return w;
}

let widget;
try {
  const data = await fetchToday();
  widget = await buildWidget(data);
} catch (e) {
  widget = await buildErrorWidget(e.message || "Error loading data");
}

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  await widget.presentSmall();
}
Script.complete();
