# Cowork 01: version 1 build (2026-10-09)

## Asked
James: a much simpler size-up simulator than the commercial ones, reachable from a city desktop, static pictures of fires, units to come later. He chose GitHub Pages, a mix of real and generated pictures, picture plus time of day only, SRFD-specific, and for Cowork to build it directly from a cloud session.

## What happened
- Built `index.html`, `picker.js`, `scenes.json`, `scripts/check.mjs`, the CI workflow, `AGENTS.md`, `SPEC.md`, `README.md`, `CONFIRM_REGISTER.md`.
- Each of the three checks was made to fail first: a bad time (`time "26:42" is not HH:MM`), a planted em dash (`index.html: contains an em dash or en dash`), and a picker that repeats (`pass 18 repeated a scene before the set was used up`).
- Looked at the page in a browser at 1366 and 390 px wide: no sideways scroll, button 48 px, list 44 px, space and right arrow advance, empty type shows its message.

## Deviations
- Built by Cowork, not CC, at James's choice. No day-one CC session. Playbook was read from GitHub `playbook-hub` because his computer was off.
- Three placeholder drawings stand in for scenes. No real pictures yet.

## Walls
- This cloud session cannot reach Wikimedia Commons or any picture host: the shell is blocked, the page reader refuses Commons file and API pages, and no browser was connected. So no picture could be found, checked for license, or downloaded. What removes the wall: James's computer on with Chrome connected, or James dropping pictures into the chat.

## Open items
- Scene pictures (the whole point). See the wall above.
- Firewall test from a city desktop.
- Units panel, later.

## Later the same night: real photos
- The wall was removed without James's computer: a GitHub Action (GitHub's machines can reach Wikimedia) pulled 341 freely licensed photos in two rounds into the `candidates` branch.
- Cowork reviewed every one on contact sheets, then 35 at full size, and kept 33 that read like a first-due view. Dropped: fire stations, aftermath, satellite pictures, drills, historical engravings, and anything from a tragedy where the picture would be about the people rather than the fire.
- Times and days were picked to fit the light in each picture, spread across early morning, work hours, dinner and the middle of the night. Notes hold what each picture shows.
- Checked in a browser again at 1366 and 390 px: no sideways scroll, credit line wraps on a phone, filter works.

## Open items, updated
- James to make the repo public and turn on Pages (Cowork's access cannot).
- Firewall test from a city desktop.
- More houses, ideally Northern California wood frame and hillside interface.

## Later still: James's review and generated scenes
- James: only two of the 33 photos were usable. His four tests (first arrival with no crews, whole building visible, looks like Santa Rosa, early or offensive fire) are now an AGENTS.md rule. The set was cut to the photos that pass, then the four large wildland photos were dropped as not first-due material.
- Claude cannot make images. James chose an automated GitHub job using OpenAI's image API with a key he put in the repo secrets himself. One test image passed, then two versions of each of the 38 prompts were made (76 in all). Cowork kept the better version of every prompt.
- The page now shows a fixed scene code under each picture, because "Scene 7 of 33" is a position in the shuffle and could not be traced back to a picture.

## Overnight 2026-10-09 to 10: gallery and batch two
- Gallery page (`gallery.html`): every scene as a thumbnail, filter by type, click for a full-size viewer with Previous and Next (arrow keys too), Escape closes. Practice and Gallery links on both pages. Thumbnails in `img/thumbs/`, made by `scripts/make_thumbs.py`; the check fails if one is missing (proven by deleting one).
- Dropped GEN-HR-02 and GEN-HR-04: a road ran straight at the tower, which is the "high-rise in the middle of a highway" James saw.
- Batch two: 98 prompts across Santa Rosa (downtown balloon frame, McDonald Ave craftsman, West End, Montgomery Village, Rincon Valley, Oakmont, Bennett Valley, Coffey Park and Fountaingrove rebuilds, Fountaingrove and Skyhawk WUI, Mark West, west of Fulton rural, Roseland, Southwest), with cars and clues matched to the time and day.
- 86 images made before the OpenAI credit ran out. 39 house scenes kept. Rejected: both versions of B-RES-14, 19, 28, 29 (a fire engine drawn in), and in general any version with an engine, a road running into the building, or fire past offensive.
- A second run retried the out-of-credit error for 90 minutes and was cancelled with nothing saved; a third, hardened run read the error plainly. No images were charged during either.
- Not made yet: the 55 remaining batch-two prompts and the 4 redos. They need more OpenAI credit, then one push of `scripts/generate.trigger` (bump RUN).

## 2026-10-20: units, dispatch card, map slide, timer
- From James's October 2026 assessment instructions: three slides per scenario (dispatch, Tablet Command map, scene), five minutes, first-due engine designator, Control 3. Built all three plus the timer, each switchable.
- Station addresses verified from srcity.org facility pages and located by OpenStreetMap: 1 Sonoma Ave, 2 Stony Point Rd, 3 Coffey Ln, 4 Yulupa Ave, 5 Fountaingrove Pkwy (temporary per the page), 6 Calistoga Rd, 7 Stone Bridge Rd, 8 Burbank Ave, 10 Corporate Center Pkwy, 11 Lewis Rd. No Station 9 found.
- Every scene got a Santa Rosa area. Mark West and west-of-Fulton scenes were relabeled Upper Calistoga Road and West edge near Fulton Road, because Mark West is county, not city.
- Run orders: nearest three by straight line, hand-pinned for ten areas where a freeway or a hill with no through road changes the order.
