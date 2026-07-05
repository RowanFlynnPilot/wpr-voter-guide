# Election Night Runbook — August 11, 2026

One human, a JSON file, and a commit button. No pipeline, no scraper.
Everything happens in `data/elections/2026-08-11-partisan-primary/`.

## Before election day (Aug 10 dry run)

1. Copy `results-template.json` to `results.json` in the same folder.
2. Put fake numbers in a few races, set `updated`, commit, push.
3. In `election.json`, set `"results": { "enabled": true, ... }`, commit, push.
4. Confirm the live guide flips to the results board and numbers appear
   within 60 seconds of a results.json commit.
5. **Reset:** copy the template over `results.json` again, set `enabled`
   back to `false`, commit, push. Confirm the guide is back in guide mode.

## Election day

### ~7:30 p.m. (before polls close at 8)

1. Copy `results-template.json` to `results.json` (fresh zeros).
2. Set `"enabled": true` in `election.json`.
3. Commit and push both. The guide front page becomes the results board,
   showing zeros — that is expected and correct.

### From 8 p.m. — the update loop, every 20–30 minutes

1. Pull numbers from the WEC election night reporting links
   (https://elections.wi.gov/2026) and, for county detail, the county clerk
   election pages (Marathon County first for CD-07 color).
2. Edit `results.json` ONLY. Touch only these fields:
   - `votes` — integer per candidate
   - `reporting` — free text per primary, e.g. `"42 of 72 counties"`
   - `winner` — see the winner rule below
   - `updated` — current time as ISO with offset, e.g.
     `"2026-08-11T21:15:00-05:00"`
3. Never edit candidate ids, race ids, or party keys. The app joins on
   them and will show a loud error if one is wrong — which is also how
   you'll know within 60 seconds if you make a typo. Fix and re-push.
4. Commit, push. The live site polls the raw GitHub URL for results.json
   every 60 seconds; no rebuild or deploy is involved.
5. **Watch for the red X.** Every push runs the data validator in GitHub
   Actions (same checks the app runs). A red X on your commit within a
   minute means the file is broken — the exact error (bad id, malformed
   JSON) is in the Actions log. Fix and push again. Green check = clean.

### The winner rule

`"winner": true` is set by hand, ONLY when the AP or WEC has called the
race. The app never computes winners — a candidate at 90% with 10% of
counties reporting gets no checkmark until a human sets the field.

### If the error banner appears on the live site

The app refuses to show stale or broken data — a red "Results unavailable"
banner means the last commit had malformed JSON or a bad id. Run a JSON
validity check locally, fix, push. The banner clears on the next poll.

## After election night

Leave `enabled: true` with final numbers and winner checkmarks through
certification week. The November 3 general gets its own folder and a
fresh template.
