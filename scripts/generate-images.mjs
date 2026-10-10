// Runs on GitHub's machines (see .github/workflows/generate-images.yml).
// Sends each prompt in scripts/image-prompts.json to OpenAI's image API and saves the
// results under generated/ with a manifest. Nothing here is shown on the page until a
// person reviews it and copies it into img/.
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";

const key = process.env.OPENAI_API_KEY;
if (!key) {
  console.log("No OPENAI_API_KEY secret is set on this repo, so nothing was generated.");
  process.exit(0);
}
const model = process.env.IMAGE_MODEL || "gpt-image-1";
const quality = process.env.IMAGE_QUALITY || "medium";
const perPrompt = Number(process.env.PER_PROMPT || 2);
const only = (process.env.ONLY || "").split(",").map((s) => s.trim()).filter(Boolean);

let prompts = JSON.parse(readFileSync(process.env.PROMPTS_FILE || "scripts/image-prompts.json", "utf8"));
if (only.length) prompts = prompts.filter((p) => only.includes(p.code));

mkdirSync("generated", { recursive: true });
const manifest = [];
let failures = 0;

let jobs = [];
for (const p of prompts) for (let v = 1; v <= perPrompt; v++) jobs.push([p, v]);
const maxImages = Number(process.env.MAX_IMAGES || 250);
if (jobs.length > maxImages) { console.log(`capped at ${maxImages} of ${jobs.length}`); jobs = jobs.slice(0, maxImages); }
let stop = false;
async function one([p, v]) {
  if (stop) return;
  const file = `generated/${p.code}-${v}.png`;
  try {
    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt: p.prompt, size: "1536x1024", quality, n: 1 }),
    });
    const body = await r.json();
    if (!r.ok) {
      failures++;
      const msg = body?.error?.message || "";
      console.log(`${p.code}-${v}: refused, ${r.status} ${msg}`);
      if (r.status === 401 || /quota|billing|insufficient/i.test(msg)) stop = true;
      return;
    }
    writeFileSync(file, Buffer.from(body.data[0].b64_json, "base64"));
    manifest.push({ ...p, file, model, quality });
    console.log(`${p.code}-${v}: ok`);
  } catch (e) {
    failures++;
    console.log(`${p.code}-${v}: failed, ${e.message}`);
  }
}
const lanes = Number(process.env.LANES || 4);
let next = 0;
await Promise.all(Array.from({ length: lanes }, async () => {
  while (next < jobs.length && !stop) await one(jobs[next++]);
}));
manifest.sort((a, b) => a.file.localeCompare(b.file));
writeFileSync("generated/manifest.json", JSON.stringify(manifest, null, 2));
console.log(`made ${manifest.length}, failed ${failures}`);
