# Build Plan — wpr-voter-guide

Primary is **Tuesday, August 11, 2026**. Online/mail voter registration closes
**July 22** — the guide must be live before then to matter. Two milestones,
guide first, results second.

## Milestone 0 — Data completion (this week, blocks launch)

Human/editorial tasks, not code:

- [ ] Enter Attorney General, Secretary of State, and State Treasurer primary
      fields into ballot.json from the WEC certified "Candidates on Ballot"
      list (elections.wi.gov Election Information Hub). These races are
      deliberately absent from the seed — every race in ballot.json must be
      render-ready (see CLAUDE.md invariant). Note: Josh Kaul (D) is seeking
      a third term as AG.
- [ ] Add campaign `website` URLs for all seeded candidates.
- [ ] Editorial verification pass (Shereen): every `bio`, `occupation`,
      `residence` checked against WEC filings / campaign sites. Seeded values
      came from news coverage and are starting points, not verified facts.
- [ ] Verify all MyVote deep links in election.json resolve to the intended
      pages (myvote.wi.gov section paths were entered from memory).
- [ ] Questionnaire go/no-go from Shereen. If GO: questions must be sent to
      candidates by ~July 8 to allow a two-week response window before launch.
      If NO-GO: `questions` stays `[]` and the comparison view never renders.
      No code change either way.

## Milestone 1 — Guide (ship by July 20)

Build order:

1. Vite + React scaffold, GitHub Actions → Pages deploy, WPR design tokens.
2. Data loading: fetch instance.json + election.json + ballot.json at boot.
   Throw on any missing file, malformed JSON, geography mismatch, or race
   with an empty primary. Fail loud at load, not quietly at render.
3. Race browser + race detail + candidate cards (alphabetical, equal space,
   suspended badge for Hughes).
4. How-to-vote view: deadline timeline (next deadline emphasized, past muted),
   explainers (one-party rule, photo ID), MyVote links.
5. `/print` route + print stylesheet — one-page cheat sheet.
6. `/newsletter` route — email-safe inline-styled block for Devon.
7. Iframe embed snippet for WordPress with height postMessage (standard WPR
   pattern).
8. Launch checklist: Milestone 0 boxes all checked, Shereen sign-off, embed
   on a draft WordPress page, mobile check.

## Milestone 2 — Results mode (ready by Aug 10, live Aug 11)

1. Results view: joins results.json to ballot.json on race/candidate ids.
   Vote bars, percentage, reporting status, "Updated 9:15 p.m." timestamp,
   unofficial disclaimer. Winner checkmark when `winner: true` (set manually
   only when AP/WEC-sourced calls are made — the app never computes winners).
2. Polling: when `results.enabled`, fetch the raw GitHub URL for results.json
   every 60s. Fetch failure = visible error state, not stale-data silence.
3. Election night runbook (RESULTS_RUNBOOK.md): where to pull numbers (WEC
   election night links → county clerk pages), commit cadence every 20–30
   minutes, results.json created from a pre-built template with all
   race/candidate ids and zero votes.
4. Dry run Aug 10 with fake numbers, then reset to the zeroed template.

This is the anti-Singapore-2008 strategy: no live pipeline to fail under
pressure. A human, a JSON file, and a commit button finish the race.

## Backlog (explicitly not v1)

- Questionnaire comparison view (blocked on editorial go)
- November 3 general election: new folder `data/elections/2026-11-03/`,
  same contracts, results mode gets heavier use
- Second-publication instance (Gavel-style licensing play)
- Address-based "what's on my ballot" (MyVote already does this; only worth
  building if reader demand shows up)
