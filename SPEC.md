# Size-Up Trainer: spec

## What it is
One web page. It shows one picture of a fire and, under it, a time of day and a day of the week. James reads the scene and gives his size-up out loud. The time is the cue for who is likely inside: 0642 Tuesday means people are home getting ready; 0230 Saturday means people are asleep; 1415 Wednesday means school and work.

It must open on a city desktop, so it lives on `github.io`, an address old enough that the firewall's new-domain rule does not block it.

## The screen
- Header: the name of the page and a "Scene type" list (All scenes, Residential, Multi-family, Commercial, High-rise, Vegetation, Vehicle and other). The choice is remembered on that device.
- The picture, as large as fits, nothing drawn over it.
- A small credit line under the picture when the license asks for one.
- The time in large type (four digits, no colon), the day, "Scene 3 of 38", and Previous, Random and Next buttons.
- Previous and Next step through the chosen type in a fixed order; Random jumps to a random scene of that type, and none repeats until every scene of the type has come up. The page opens on a random scene.
- Keys: left and right arrows for Previous and Next, space bar or R for Random.
- A Gallery page shows every scene as a thumbnail, with the same buttons in its full-size viewer.
- A type with no scenes says so and tells the person to pick another.
- No timer, no checklist, no typed answer in version 1.

## Dispatch, map, scene (added 2026-10-20)
Each scene runs like the assessment's three slides: a dispatch card (call type, location, time, 1st alarm, "You are Engine N, first due", Control 3), a map slide (street close-up with the incident, and a citywide map with every station and the three 1st-alarm engines highlighted), then the scene with the 1st alarm beside it and a 5:00 timer. "Dispatch and map first" and "5 minute timer" can each be turned off.

The 1st alarm is three engines plus Rescue 1 and Squad 1. The engines are the three closest stations to the scene's area, by straight line from verified station addresses, except where an area pins its own order in `data/areas.json` because of road access. Maps come from OpenStreetMap, built by `.github/workflows/build-maps.yml` and stored in `maps/`.

## A scene (`scenes.json`)
| Field | Meaning |
|---|---|
| `id` | Unique, like `res-014` |
| `file` | Path under `img/` |
| `type` | `residential`, `multi-family`, `commercial`, `high-rise`, `vegetation`, `vehicle` |
| `time` | `HH:MM`, 24 hour, believable for the light in the picture |
| `day` | Monday to Sunday |
| `source` | Where it came from and its license, or `generated`. Never shown. |
| `credit` | Shown under the picture. Required for CC BY and CC BY-SA. |
| `area` | One of the areas in `data/areas.json`; decides the location, the map and the 1st alarm |
| `notes` | What the picture shows (construction, stories, where the fire is, exposures, cars). Never shown. Kept for the units panel and any later answer key. |

## Scene set target
30 to 40 scenes, leaning toward Santa Rosa: single-family 12, multi-family 6, commercial 6, high-rise 4, vegetation and interface 6, vehicle and outbuilding 4. Within each type, vary where the fire is, the smoke, exposures, construction, access, and light.

## Later, not version 1
- A units panel under the time: a plain read-only list of responding SRFD apparatus in arrival order.
- Maybe a dispatch line (reported as, number of callers).

## Blocking issues
- None.

## Changelog
- 2026-10-20: Dispatch card, map slide, 1st alarm and 5 minute timer, at James's request, modeled on the October 2026 assessment instructions.
- 2026-10-10: Previous, Random and Next on the Practice page, Gallery page added, at James's request.
- 2026-10-09: Written by Cowork from James's decisions in chat that day.
