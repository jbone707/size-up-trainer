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
