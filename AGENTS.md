General working rules: `C:\Users\james\Playbook\PLAYBOOK.md`. This file holds only Size-Up Trainer-specific rules.

Repo: `size-up-trainer`. Remote: `https://github.com/jbone707/size-up-trainer`. A prompt that names a different project gets "WRONG SESSION: this is size-up-trainer" and no action.

## Source of truth
`SPEC.md`. James edits it, or an agent on his explicit instruction, with a dated entry in its `## Changelog`. A contradiction between the spec and the repo goes in the spec's "Blocking issues" section and is never worked around.

## File ownership
CC owns README, code, and `handoffs/session-NN-*.md`. Cowork owns `handoffs/cowork-*.md`. Both may append to `CONFIRM_REGISTER.md` and to the spec's blocking issues. Neither edits the other's files.

## Session handoffs
Every session ends with a handoff file (prompt as given, what happened, deviations with reasons, open items). Each new session of either agent reads the newest file from the other agent first.

## Git
Commit at the end of every session, handoffs included. Never tracked: `scratch/`, `node_modules/`, any file holding a credential.

## Project-specific rules
- **Green is `node scripts/check.mjs`** (2026-10-09). It runs the picker tests, checks every `scenes.json` entry, and runs the copy check. It also runs on every push.
- **One environment** (2026-10-09). The page is static, public, and holds no user data, so there is no database, no staging, no launch phrase, and no credential. The only deploy is GitHub Pages from `main`. The Playbook's database, environment and credential sections have nothing to act on here. The testing ladder is: `scripts/check.mjs`, a browser look at desktop and 390 px wide, then James's own look.
- **The repo is public, so every picture carries its license** (2026-10-09). No picture is committed without a `source` that names where it came from and its license, or says `generated`. Accepted: public domain, CC0, CC BY, CC BY-SA. A CC BY or CC BY-SA picture also needs a `credit`, which the page shows under the picture. Never NC, ND, or "found on the web".
- **Pictures are files in `img/`, not links to other sites** (2026-10-09). The page has to load from a city network that blocks unfamiliar hosts, so everything it shows is served from this repo.
- **No build step, no framework, no dependency** (2026-10-09). `index.html`, `picker.js`, `scenes.json`, `img/`. If a change seems to need tooling, ask first.
- **Version 1 was built by Cowork directly, not through CC** (2026-10-09), at James's choice, from a cloud session with no access to his computer. It has not had a CC session or an outside review.
- **Photo hunting runs on GitHub, not in a session** (2026-10-09). Cloud sessions cannot reach Wikimedia, so `.github/workflows/fetch-candidates.yml` runs `scripts/fetch-candidates.mjs` on GitHub's machines whenever `scripts/candidate-queries.txt` changes, and force-pushes results to the `candidates` branch. That branch is scratch: never merged, overwritten every run. Only licenses public domain, CC0, CC BY and CC BY-SA get through its filter, and the license is still read again from the manifest before a picture is added.
- **Scene times are invented to fit the light in the picture** (2026-10-09). They are not the real incident times. Notes describe what the picture shows; they are Cowork's reading and James may correct them.
- **What makes a usable scene** (2026-10-09, James after the first look, when only two of 33 passed). It must look like first arrival: no firefighters, hose lines, ladders or apparatus working in the shot. The whole building is visible, with enough of its sides, stories and exposures to size it up. It looks like Santa Rosa: US wood frame, California hills and grass, no foreign buildings or apparatus. The fire is early or still offensive, not fully involved. Every new picture is held to all four before it goes in.
- **Vegetation scenes are first-due size** (2026-10-09, James: the wildland photos were too large, not first due material). A grass or brush fire a single engine company could size up and start on: under an acre or so, one flank or head, exposures close by. No campaign fires, smoke columns over mountains, or fronts that need a strike team.
- **Generated scenes come from OpenAI's image API, run on GitHub** (2026-10-09). Claude cannot make images. `.github/workflows/generate-images.yml` runs `scripts/generate-images.mjs` when `scripts/generate.trigger` changes, using the repo secret `OPENAI_API_KEY`, which James typed into GitHub himself and no agent has seen. Results land on the `generated` branch (scratch, overwritten each run). A run without the secret does nothing. The first run after the key is added makes one picture only, to prove the key and the cost before a full batch. A generated picture is held to the same four tests as a photo, and its `source` is `generated, <model>`.
- **Image prompts never mention the fire department** (2026-10-10). "As the first fire engine pulls up" made the model draw fire engines in about one image in five. Prompts are framed as a neighbor across the street at the moment the fire is discovered.
- **Out of OpenAI credit looks like a rate limit** (2026-10-10). OpenAI answers an empty balance with status 429 and code `credit_balance_exhausted`. The job stops on that code at once; it once retried it for 90 minutes and timed out with nothing saved. Every run writes `generated/errors.json`, and stops itself at 70 minutes so results are always committed.
