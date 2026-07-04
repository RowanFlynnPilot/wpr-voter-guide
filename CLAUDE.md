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
  "publication": { "id": "wpr", "name": "...", "url": "..." },
  "geographies": ["wi", "wi-cd-07", "wi-marathon"],
  "theme": { "colors": {...}, "fonts": {...} },
  "sponsor": null,
  "election": "2026-08-11-partisan-primary"
}
```

- `geographies` is the multi-tenant hook: the app renders only races whose
  `geography` tags intersect this list. A second publication = a second
  instance.json, zero code changes.
- `sponsor` is `null` or `{ "name", "logo_url", "url", "disclosure" }`.
  Sponsor branding renders on the landing view and how-to-vote view ONLY.
  Never on race or candidate views. This is an editorial integrity rule,
  not a style preference.

### data/elections/{id}/election.json — logistics

Election metadata: date, poll hours, deadline array (each with `id`, `date`,
`label`, `detail`, `link`), MyVote/WEC links, explainer blocks, and the
results-mode flag:

```json
"results": { "enabled": false, "file": "results.json", "poll_seconds": 60 }
```

Results mode is toggled by this flag and nothing else. No date-sniffing, no
environment detection. Flip it in a commit on election day.

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
    "primaries": [{
      "party": "DEM",            // DEM | REP
      "candidates": [{
        "id": "clark-fred",      // lastname-firstname, kebab
        "name": "Fred Clark",
        "residence": "Bayfield",
        "occupation": "",
        "website": "",
        "photo": "",             // file name under data/elections/{id}/photos/, "" = none
        "bio": "",
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
7. Candidate photos are **candidate-supplied headshots only** (request them
   in the questionnaire outreach). A candidate without a photo gets a
   neutral initials placeholder in the identical frame — never a stock
   image. See data/elections/{id}/photos/README.md.

## Design System (WPR standard)

- Primary teal `#3A867C`, cream background `#f6f2e9`
- Fraunces (display), Public Sans (body), JetBrains Mono (data/numbers)
- Party accents for primary sections: use restrained, desaturated red/blue
  tints for section headers only — never color entire candidate cards by party
- Print stylesheet: black on white, no backgrounds, guide URL in footer

## Views

1. **Race browser** — races grouped by level: federal → statewide.
   Race cards show office, open-seat badge, candidate count per party.
2. **Race detail** — context paragraph, then candidate cards per primary.
3. **Questionnaire comparison** — question-by-question, candidates side by
   side. Renders only when `questions` is non-empty. (Backlog until editorial
   greenlights.)
4. **How to vote** — deadline timeline with the next upcoming deadline
   emphasized and past deadlines muted (computed from current date), explainer
   blocks, MyVote deep links.
5. **/print** — one-page compact layout of all races + key dates.
6. **/newsletter** — email-safe HTML block (inline styles, 600px, table
   layout) showing days-until-primary and next deadline. Devon copies the
   rendered HTML into MailerLite each send.
7. **Results** (when enabled) — vote bars per primary, reporting status,
   "last updated" timestamp, unofficial-results disclaimer.

## Environment

- Windows / PowerShell 5.1: use `;` to chain commands, never `&&`
- Repo lives at `C:\Users\rpfly\Projects\wpr-voter-guide`
- GitHub org: `RowanFlynnPilot`
- Node/Vite only. No Python in this repo.
