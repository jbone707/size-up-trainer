# Size-Up Trainer

A one-page practice tool for fire scene size-ups. It shows a picture of a fire and a time of day; you give your size-up out loud. Built for James's captain assessment prep, with scenes that lean toward Santa Rosa building stock.

- Live page: https://jbone707.github.io/size-up-trainer/
- Source of truth: `SPEC.md`
- Current phase: version 1 is built with 33 real scenes from Wikimedia Commons (8 houses, 4 multi-family, 4 commercial, 4 high-rise, 9 vegetation, 4 vehicle and outbuilding).

## Working files
- `AGENTS.md`: project rules
- `SPEC.md`: what the page is and how a scene is described
- `CONFIRM_REGISTER.md`: things still to be checked
- `handoffs/`: one file per session

## Add a scene
1. Put the picture in `img/` (about 1600 px wide, JPG).
2. Add one entry to `scenes.json` (see `SPEC.md` for the fields).
3. Run `node scripts/check.mjs`, then commit and push. The page updates in about a minute.

## Finding more photos
Edit `scripts/candidate-queries.txt` (one Wikimedia Commons search per line) and push. A GitHub job pulls every freely licensed match into the `candidates` branch with a `manifest.json` of license and author. Pick from there, resize into `img/`, and add the entry.
