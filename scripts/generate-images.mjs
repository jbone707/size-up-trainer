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
const errors = [];
const started = Date.now();
const budgetMs = Number(process.env.TIME_BUDGET_MIN || 70) * 60000;
let consecutive429 = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function one([p, v]) {
  if (stop) return;
  const file = `generated/${p.code}-${v}.png`;
  for (let attempt = 1; attempt <= 6 && !stop; attempt++) {
    if (Date.now() - started > budgetMs) { stop = true; errors.push({ image: `${p.code}-${v}`, message: "time budget reached, stopped so the images made so far are saved" }); return; }
    try {
      const r = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt: p.prompt, size: "1536x1024", quality, n: 1 }),
      });
      const body = await r.json().catch(() => ({}));
      if (r.ok) {
        consecutive429 = 0;
        writeFileSync(file, Buffer.from(body.data[0].b64_json, "base64"));
        manifest.push({ ...p, file, model, quality });
        console.log(`${p.code}-${v}: ok`);
        return;
      }
      const code = body?.error?.code || "";
      const msg = body?.error?.message || "";
      errors.push({ image: `${p.code}-${v}`, attempt, status: r.status, code, message: msg.slice(0, 300) });
      console.log(`${p.code}-${v}: ${r.status} ${code} ${msg}`);
      // Out of money or bad key: stop everything, spending more cannot help.
      if (r.status === 401 || /insufficient_quota|billing_hard_limit|credit_balance_exhausted/.test(code) || /billing hard limit|exceeded your current quota|no credits remaining/i.test(msg)) { stop = true; return; }
      // Rate limit or server trouble: wait and try again.
      if (r.status === 429 && ++consecutive429 >= 5) { stop = true; errors.push({ image: `${p.code}-${v}`, message: "five rate-limit refusals in a row, stopped" }); return; }
      if (r.status === 429 || r.status >= 500) { await sleep(Math.min(60000, 5000 * 2 ** (attempt - 1))); continue; }
      // Anything else (a refused prompt): give up on this one image.
      failures++;
      return;
    } catch (e) {
      errors.push({ image: `${p.code}-${v}`, attempt, status: 0, message: String(e.message).slice(0, 300) });
      await sleep(5000);
    }
  }
  failures++;
}
const lanes = Number(process.env.LANES || 4);
let next = 0;
await Promise.all(Array.from({ length: lanes }, async () => {
  while (next < jobs.length && !stop) await one(jobs[next++]);
}));
manifest.sort((a, b) => a.file.localeCompare(b.file));
writeFileSync("generated/manifest.json", JSON.stringify(manifest, null, 2));
writeFileSync("generated/errors.json", JSON.stringify(errors, null, 2));
console.log(`made ${manifest.length}, failed ${failures}`);
