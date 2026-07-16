# wpr-voter-guide

Config-driven voter guide for Wausau Pilot & Review. First deployment: Wisconsin
Partisan Primary, August 11, 2026. Designed for reuse across future elections
(new folder under `data/elections/`) and future publications (new `instance.json`).

**Live product:** race browser + candidate cards + how-to-vote logistics,
embedded in WordPress via iframe from GitHub Pages. On election night, flips
into results mode.

## Engineering Principles

1. Don't overengineer: simple beats complex
2. No fallbacks: one correct path, no alternatives
3. One way to do things, not many
4. Clarity over compatibility
5. Throw errors: fail fast when preconditions aren't met
6. No backups: trust the primary mechanism
7. Separation of concerns: single responsibility per function
8. Surgical changes only
9. Fix root causes, not symptoms

**Applied here:** there is NO scraper, NO cron, NO Python in this repo. The
certified candidate field is small (~25 people) and frozen after the June 1
filing deadline. Data is hand-curated JSON, verified by editorial. A pipeline
would be overengineering. Results on election night are manual commits — see
BUILD_PLAN.md Milestone 2.

## Stack

- React 18 + Vite, static build
- GitHub Actions builds and deploys to GitHub Pages on push to `main`
- Embedded in WordPress via iframe (standard WPR pattern)
- No backend, no database, no runtime dependencies beyond the static JSON files

## Data Contracts

Four JSON files. `ballot.json` is the single source of truth for candidate
identity — no other file repeats candidate names.

### config/instance.json — publication identity

```json
{
  "publication": { "id": "wpr", "name": "...", "url": "...", "guide_url": "", "logo": "config/wpr-logo.png", "icon": "config/wpr-icon.png" },
  "geographies": ["wi", "wi-cd-07", "wi-marathon"],
  "theme": { "colors": {...}, "fonts": {...} },
  "sponsor": null,
  "election": "2026-08-11-partisan-primary"
}
```

- `geographies` is the multi-tenant hook: the app renders only races whose
  `geography` tags intersect this list. A second publication = a second
  instance.json, zero code changes.
- `guide_url` is the guide's canonical public URL — the WordPress page
  permalink once it publishes, `""` until then (falls back to the app's
  own location). Feeds the Share button, /print footer, /newsletter CTA,
  and the my-ballot footer.
- `sponsor` is `null` or `{ "name", "logo_url", "url", "disclosure" }`.
  Sponsor branding renders on the landing view and how-to-vote view ONLY.
  Never on race or candidate views. This is an editorial integrity rule,
  not a style preference.

### data/elections/{id}/election.json — logistics

Election metadata: date, poll hours, deadline array (each with `id`, `date`,
`label`, `detail`, `link`), MyVote/WEC links (`myvote_home`, `register`,
`polling_place`, `absentee`, `track_ballot`, `whats_on_ballot`, `wec_hub` —
all required), explainer blocks (optional `link` + `link_label`, both or
neither), `ballot_note`, and the results-mode flag:

```json
"results": { "enabled": false, "file": "results.json", "poll_seconds": 60 }
```

Results mode is toggled by this flag and nothing else. No date-sniffing, no
environment detection. Flip it in a commit on election day.

- `ballot_note` is the coverage-honesty line ("your ballot may also include
  state legislative and county primaries…"), rendered on the race browser,
  my-ballot, and /print with a link to MyVote's ballot preview. `""` means
  the guide covers the reader's entire ballot.
- Deadlines render with a client-generated "Add to my calendar" .ics
  download (src/calendar.js) — all-day events, data: URIs, no server.

### data/elections/{id}/ballot.json — races and candidates

```json
{
  "election_id": "...",
  "races": [{
    "id": "us-house-wi-07",
    "office": "U.S. House — 7th Congressional District",
    "level": "federal",          // federal | statewide | legislative | county
    "geography": ["wi-cd-07"],
    "open_seat": true,
    "context": "One editorial paragraph. Editorial-owned.",
    "coverage": [],              // [{ "headline", "outlet", "date", "url" }] — see rule 9
    "primaries": [{
      "party": "DEM",            // DEM | REP
      "candidates": [{
        "id": "clark-fred",      // lastname-firstname, kebab
        "name": "Fred Clark",
        "residence": "Bayfield",
        "occupation": "",
        "website": "",
        "photo": "",             // file name under data/elections/{id}/photos/, "" = none
        "photo_credit": "",      // attribution line, required for CC-licensed photos
        "bio": "",
        "positions": [],         // [{ "topic", "statement", "source_url" }] — see rule 8
        "status": "active",      // active | suspended
        "status_note": "",       // shown as badge detail when suspended
        "questionnaire": null    // null, or { "responses": [{ "q_id", "answer" }] }
      }]
    }]
  }],
  "questions": []                 // [{ "id", "race_id", "text" }] — empty until editorial decides
}
```

**Invariant: every race in ballot.json is render-ready.** No placeholder
races, no empty `primaries` arrays. If a race isn't fully entered, it isn't
in the file. The app throws at load if a race has zero candidates in any
listed primary.

### data/elections/{id}/results.json — election night only

Does not exist until election day. Created and updated by manual commits.

```json
{
  "updated": "2026-08-11T21:15:00-05:00",
  "note": "Unofficial results. Source: WEC / county clerks.",
  "races": [{
    "race_id": "governor",
    "primaries": [{
      "party": "DEM",
      "reporting": "42 of 72 counties",
      "candidates": [{ "id": "barnes-mandela", "votes": 0, "winner": false }]
    }]
  }]
}
```

Joins to ballot.json on `race_id` + candidate `id`. Names are never repeated
here. When `results.enabled` is true and the fetch fails, show an error state
— do not silently fall back to guide mode.

## Editorial Rules (encode in UI, do not violate)

1. Candidates listed **alphabetically by last name** within each primary.
   Equal space, identical card layout for every candidate.
2. `bio` and `occupation` come from **self-stated sources only**: WEC filings,
   campaign websites, candidates' own statements. No endorsements, polling,
   or fundraising figures on candidate cards.
3. Suspended candidates (e.g., Missy Hughes, who suspended June 22 but remains
   on the printed ballot) show a visible "Suspended campaign" badge with
   `status_note`.
4. If the questionnaire is active, non-responders get an explicit
   "Did not respond" label — that label is itself information for voters.
5. Race `context` paragraphs are editorial-owned copy. Neutral framing.
6. **Seeded data in ballot.json was compiled from news coverage in July 2026
   and MUST pass an editorial verification check against WEC filings and
   campaign sites before launch.** Empty fields are intentional — they mean
   "not yet verified," not "unknown forever."
7. Candidate photos come from two sources only: **candidate-supplied
   headshots** (request them in the questionnaire outreach) or **verified
   freely licensed files** (public domain / Creative Commons) with the
   license and attribution recorded in `photo_credit` and provenance
   logged in PHOTO_SOURCING.md. A candidate without a photo gets a
   neutral initials placeholder in the identical frame — never a stock
   image, never an unverified identity. See
   data/elections/{id}/photos/README.md.
8. `positions` entries are **verbatim quotes from the candidate's own
   published campaign materials**, each with a `source_url` citation —
   never news quotes, social media grabs, voting-record summaries, or
   paraphrases. Editorial selects and verifies them. The block activates
   race-wide: once any candidate in a race has entries, candidates without
   any show "No stated positions available" — like "Did not respond,"
   that absence is information, but remember it can also mean a thin web
   presence rather than a choice.
9. Race `coverage` is **hand-curated by editorial** — headline (verbatim),
   outlet, date, URL. Nothing is pulled automatically; which outlets
   appear is purely an editorial selection made in ballot.json. Headlines
   render as written by the originating outlet; don't editorialize them.

## Design System (matched to wausaupilotandreview.com, July 2026)

Sourced from the live site (WordPress Newspack, Joseph child theme):

- Black primary `#000000` on white, body ink `#32373c` — the site's own
  palette. Typewriter teal `#3A867C` (from the round badge logo) is a
  restrained accent only: next-deadline emphasis, winner checkmarks,
  link underlines.
- Oswald (headings/labels, often uppercase — the site's heading font),
  Merriweather (body — the site's body font), JetBrains Mono (data/numbers,
  guide-specific).
- Brand assets in `config/`: `wpr-logo.png` (wordmark) and `wpr-icon.png`
  (round typewriter badge), wired via `publication.logo` / `publication.icon`
  in instance.json. A publication without them gets a text masthead.
- Party accents for primary sections: use restrained, desaturated red/blue
  tints for section headers only — never color entire candidate cards by party
- Print stylesheet: black on white, no backgrounds, guide URL in footer

## Views

1. **Race browser** — races grouped by level: federal → statewide.
   Race cards show office, open-seat badge, candidate count per party.
2. **Race detail** — context paragraph, then candidate cards per primary.
3. **Questionnaire comparison** — question-by-question, candidates side by
   side, answers verbatim, "Did not respond" for non-responders. Built;
   renders only when `questions` is non-empty, so it stays invisible until
   editorial fills in questions and responses.
4. **How to vote** — deadline timeline with the next upcoming deadline
   emphasized and past deadlines muted (computed from current date), explainer
   blocks, MyVote deep links.
5. **/print** — one-page compact layout of all races + key dates.
6. **/newsletter** — email-safe HTML block (inline styles, 600px, table
   layout) showing days-until-primary and next deadline. Devon copies the
   rendered HTML into MailerLite each send.
7. **Results** (when enabled) — vote bars per primary, reporting status,
   "last updated" timestamp, unofficial-results disclaimer.
8. **My ballot** — reader-selected candidate checklist, printable, with a
   one-party-primary warning when picks span parties. Stored ONLY in the
   reader's browser (localStorage) — no accounts, no tracking, nothing
   leaves the device. A pick is the reader's note to self, never rendered
   as social proof or counted anywhere.

## Environment

- Windows / PowerShell 5.1: use `;` to chain commands, never `&&`
- Repo lives at `C:\Users\rpfly\Projects\wpr-voter-guide`
- GitHub org: `RowanFlynnPilot`
- Node/Vite only. No Python in this repo.
