# Size-Up Trainer

A one-page practice tool for fire scene size-ups. It shows a picture of a fire and a time of day; you give your size-up out loud. Built for James's captain assessment prep, with scenes that lean toward Santa Rosa building stock.

- Live page: https://jbone707.github.io/size-up-trainer/
- Source of truth: `SPEC.md`
- Current phase: version 1 page is built; the real scene pictures are not in yet (three placeholder drawings stand in).

## Working files
- `AGENTS.md`: project rules
- `SPEC.md`: what the page is and how a scene is described
- `CONFIRM_REGISTER.md`: things still to be checked
- `handoffs/`: one file per session

## Add a scene
1. Put the picture in `img/` (about 1600 px wide, JPG).
2. Add one entry to `scenes.json` (see `SPEC.md` for the fields).
3. Run `node scripts/check.mjs`, then commit and push. The page updates in about a minute.
