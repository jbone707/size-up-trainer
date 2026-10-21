// One command that is "green" for this repo: node scripts/check.mjs
// 1. Picker tests. 2. scenes.json shape. 3. Copy check on what reaches the screen.
// The copy check reads index.html, picker.js and scenes.json only. It deliberately
// ignores Markdown files, this script, and the contents of image files.
import { readFileSync, existsSync } from "node:fs";
import { filterScenes, createDeck, formatTime } from "../picker.js";
import { runOrder, dispatchFor, placeOnMap } from "../units.js";

const fails = [];
const fail = (msg) => fails.push(msg);
const root = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");

// 1. Picker
{
  const items = ["a", "b", "c", "d", "e"];
  const deck = createDeck(items);
  for (let pass = 0; pass < 20; pass++) {
    const seen = new Set();
    let first = null, prevLast = deck._last;
    for (let i = 0; i < items.length; i++) {
      const s = deck.next();
      if (i === 0) first = s;
      seen.add(s);
      deck._last = s;
    }
    if (seen.size !== items.length) fail(`picker: pass ${pass} repeated a scene before the set was used up`);
    if (prevLast && first === prevLast) fail(`picker: pass ${pass} opened with the scene that closed the last pass`);
  }
  if (createDeck([]).next() !== null) fail("picker: empty deck should deal null");
  if (filterScenes([{ type: "x" }, { type: "y" }], "x").length !== 1) fail("picker: filter by type");
  if (filterScenes([{ type: "x" }, { type: "y" }], "all").length !== 2) fail("picker: filter all");
  if (formatTime("06:42") !== "0642") fail("picker: formatTime 06:42");
  if (formatTime("25:00") !== "") fail("picker: formatTime rejects 25:00");
}

// 2. scenes.json
const TYPES = ["residential", "multi-family", "commercial", "high-rise", "vegetation", "vehicle"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const scenes = JSON.parse(read("scenes.json"));
const ids = new Set();
for (const s of scenes) {
  const at = `scenes.json ${s.id || "(no id)"}`;
  if (!s.id || ids.has(s.id)) fail(`${at}: id missing or repeated`);
  ids.add(s.id);
  if (!TYPES.includes(s.type)) fail(`${at}: type "${s.type}" is not one of ${TYPES.join(", ")}`);
  if (!formatTime(s.time)) fail(`${at}: time "${s.time}" is not HH:MM`);
  if (!DAYS.includes(s.day)) fail(`${at}: day "${s.day}"`);
  if (!s.source) fail(`${at}: source is required (license and where it came from, or "generated")`);
  if (typeof s.file !== "string" || !s.file) fail(`${at}: file missing`);
  else if (!/^https:\/\//.test(s.file) && !existsSync(new URL(s.file, root))) fail(`${at}: file ${s.file} not found`);
  if (/CC BY/i.test(s.source) && !s.credit) fail(`${at}: a CC BY picture needs a credit line`);
  if (!existsSync(new URL(`img/thumbs/${s.id}.jpg`, root))) fail(`${at}: thumbnail img/thumbs/${s.id}.jpg missing (run python3 scripts/make_thumbs.py)`);
}

// 2b. Every scene can be dispatched: an area, a map, three different engines.
{
  const areas = JSON.parse(read("data/areas.json"));
  const maps = JSON.parse(read("maps/maps.json"));
  const byName = Object.fromEntries(areas.map((a) => [a.area, a]));
  const engines = new Set(maps.stations.map((s) => s.engine));
  if (!maps.stations.every((s) => typeof s.lat === "number")) fail("maps.json: a station has no location");
  for (const a of areas) {
    const order = runOrder(a, maps.stations);
    if (order.length !== 3 || new Set(order).size !== 3 || !order.every((e) => engines.has(e))) fail(`areas.json ${a.area}: run order ${order.join(",")} is not three different known engines`);
  }
  for (const sc of scenes) {
    const at = `scenes.json ${sc.id}`;
    if (!byName[sc.area]) { fail(`${at}: area "${sc.area}" is not in data/areas.json`); continue; }
    const m = maps.areas[sc.area];
    if (!m || !existsSync(new URL(m.file, root))) fail(`${at}: no map picture for "${sc.area}" (rerun the build-maps job)`);
    else {
      const p = placeOnMap(m, byName[sc.area].lat, byName[sc.area].lon);
      if (Math.abs(p.left - 50) > 5 || Math.abs(p.top - 50) > 5) fail(`${at}: incident is not centered on its map (rerun the build-maps job)`);
    }
    const d = dispatchFor(sc, byName, maps.stations);
    if (!d || d.units.length !== 5 || !d.location) fail(`${at}: dispatch card incomplete`);
  }
}

// 3. Copy check
const screenText = [
  ["index.html", read("index.html")],
  ["gallery.html", read("gallery.html")],
  ["picker.js", read("picker.js")],
  ["scenes.json", scenes.map((s) => `${s.day} ${s.credit || ""}`).join("\n")],
];
for (const [name, text] of screenText) {
  if (/[—–]/.test(text)) fail(`${name}: contains an em dash or en dash`);
}
for (const page of ["index.html", "gallery.html"]) {
  const html = read(page);
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) fail(`${page}: must have exactly one h1`);
  if (!/<title>[^<]+<\/title>/.test(html)) fail(`${page}: missing title`);
  if (/<h[1-3][^>]*>[^<]*\.\s*<\/h[1-3]>/.test(html)) fail(`${page}: heading ends with a period`);
  if (!/<nav aria-label="Main">[\s\S]*href="\.\/"[\s\S]*href="gallery\.html"[\s\S]*<\/nav>/.test(html)) fail(`${page}: main navigation must link Practice and Gallery`);
}

if (fails.length) {
  console.error("FAIL\n" + fails.map((f) => " - " + f).join("\n"));
  process.exit(1);
}
console.log(`OK: picker, ${scenes.length} scenes, copy check`);
