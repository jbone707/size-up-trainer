// Runs on GitHub's machines (see .github/workflows/fetch-candidates.yml), which can reach
// Wikimedia Commons. Pulls freely licensed fire photos into candidates/ with a manifest,
// so a person can review them and copy the good ones into img/. Nothing here is shown on the page.
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";

const UA = "SizeUpTrainer/1.0 (https://github.com/jbone707/size-up-trainer; training tool)";
const API = "https://commons.wikimedia.org/w/api.php";
const OK_LICENSE = /^(cc0|public domain|pd\b|pd-|cc[- ]by(-sa)?[- ]\d)/i;
const BAD_LICENSE = /\b(nc|nd)\b|non-?commercial|no ?deriv/i;
const strip = (s) => (s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

const queries = readFileSync("scripts/candidate-queries.txt", "utf8")
  .split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
const perQuery = Number(process.env.PER_QUERY || 15);

mkdirSync("candidates", { recursive: true });
const manifest = [];
const seen = new Set();

for (const q of queries) {
  const url = `${API}?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=40` +
    `&gsrsearch=${encodeURIComponent(q + " filetype:bitmap")}` +
    `&prop=imageinfo&iiprop=url|mime|size|extmetadata&iiurlwidth=1600`;
  let data;
  try {
    data = await (await fetch(url, { headers: { "User-Agent": UA } })).json();
  } catch (e) { console.log(`query failed: ${q}`); continue; }
  const pages = Object.values(data?.query?.pages || {}).sort((a, b) => (a.index || 0) - (b.index || 0));
  let taken = 0;
  for (const p of pages) {
    if (taken >= perQuery) break;
    const info = p.imageinfo?.[0];
    if (!info || seen.has(p.title)) continue;
    if (info.mime !== "image/jpeg" || info.width < 900 || info.width < info.height) continue;
    const m = info.extmetadata || {};
    const license = strip(m.LicenseShortName?.value);
    if (!OK_LICENSE.test(license) || BAD_LICENSE.test(license)) continue;
    const img = info.thumburl || info.url;
    let buf;
    try {
      const r = await fetch(img, { headers: { "User-Agent": UA } });
      if (!r.ok) continue;
      buf = Buffer.from(await r.arrayBuffer());
    } catch (e) { continue; }
    seen.add(p.title);
    const n = String(manifest.length + 1).padStart(3, "0");
    const file = `candidates/c${n}.jpg`;
    writeFileSync(file, buf);
    manifest.push({
      n, file, query: q, title: p.title,
      page: info.descriptionurl, license,
      author: strip(m.Artist?.value).slice(0, 200),
      description: strip(m.ImageDescription?.value).slice(0, 400),
      date: strip(m.DateTimeOriginal?.value).slice(0, 40),
    });
    taken++;
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log(`${q}: ${taken}`);
}
writeFileSync("candidates/manifest.json", JSON.stringify(manifest, null, 2));
console.log(`total ${manifest.length}`);
