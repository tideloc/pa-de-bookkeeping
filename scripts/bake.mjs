// Bakes src/content/site.json (written by the Tideloc portal) into the HTML.
// Output goes to dist/; everything else is copied through unchanged.
import { readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
const site = JSON.parse(readFileSync("src/content/site.json", "utf8"));
const DAYS = ["mon","tue","wed","thu","fri","sat","sun"], LABEL = {mon:"Monday",tue:"Tuesday",wed:"Wednesday",thu:"Thursday",fri:"Friday",sat:"Saturday",sun:"Sunday"}, ABBR = {mon:"Mo",tue:"Tu",wed:"We",thu:"Th",fri:"Fr",sat:"Sa",sun:"Su"};
const fmt = (t) => { const [h, m] = t.split(":").map(Number); const ap = h >= 12 ? "pm" : "am"; const hh = ((h + 11) % 12) + 1; return m ? `${hh}.${String(m).padStart(2,"0")}${ap}` : `${hh}${ap}`; };
export function summary(hours) {
  const byDay = Object.fromEntries(hours.map((h) => [h.day, h]));
  const runs = []; let cur = null;
  for (const d of DAYS) { const h = byDay[d]; const key = !h || h.closed ? "closed" : `${h.open}-${h.close}`; if (cur && cur.key === key) cur.days.push(d); else { cur = { key, days: [d] }; runs.push(cur); } }
  const open = runs.filter((r) => r.key !== "closed");
  if (!open.length) return "By appointment";
  const label = (r) => r.days.length > 1 ? `${LABEL[r.days[0]]} to ${LABEL[r.days[r.days.length-1]]}` : LABEL[r.days[0]];
  const time = (r) => { const [a, b] = r.key.split("-"); return `${fmt(a)} to ${fmt(b)}`; };
  return open.map((r) => `${label(r)}, ${time(r)}`).join("; ");
}
export function schemaHours(hours) {
  const byDay = Object.fromEntries(hours.map((h) => [h.day, h]));
  const runs = []; let cur = null;
  for (const d of DAYS) { const h = byDay[d]; if (!h || h.closed) { cur = null; continue; } const key = `${h.open}-${h.close}`; if (cur && cur.key === key) cur.days.push(d); else { cur = { key, days: [d] }; runs.push(cur); } }
  return runs.map((r) => `${r.days.length > 1 ? ABBR[r.days[0]] + "-" + ABBR[r.days[r.days.length-1]] : ABBR[r.days[0]]} ${r.key.replace("-", "-")}`).join(", ");
}
if (process.argv[1] && process.argv[1].endsWith("bake.mjs")) {
  const email = (site.contact && site.contact.email) || "";
  const vals = { __TL_HOURS__: summary(site.hours || []), __TL_OPENING__: schemaHours(site.hours || []), __TL_EMAIL__: email, __TL_VERSION__: String(site.version || 0) };
  rmSync("dist", { recursive: true, force: true }); mkdirSync("dist");
  for (const f of readdirSync(".")) { if ([".git", ".github", "dist", "node_modules", "scripts", "src", ".gitignore", ".wrangler"].includes(f)) continue; cpSync(f, join("dist", f), { recursive: true }); }
  for (const f of readdirSync("dist").filter((f) => f.endsWith(".html"))) {
    let h = readFileSync(join("dist", f), "utf8");
    for (const [k, v] of Object.entries(vals)) h = h.split(k).join(v);
    if (/__TL_[A-Z]+__/.test(h)) throw new Error(`unfilled placeholder in ${f}`);
    writeFileSync(join("dist", f), h);
  }
  console.log("baked", vals);
}
