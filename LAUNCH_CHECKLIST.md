# Launch Checklist — Wisconsin Partisan Primary, August 11, 2026

Every human task standing between the current build and launch, in one
place. The code is done; everything below is verification and sign-off.
Target: live before **July 22** (online registration deadline). Sources
of record: WEC filings and candidates' own materials.

## 1. Hard deadline first

- [x] **Questionnaire: NO-GO (decided July 8).** `questions` stays `[]`;
      the comparison view never appears. The stated-positions blocks are
      now the guide's only "in their own words" layer — which upgrades
      §3's quote verification and per-race fairness calls from
      important to launch-critical.
- [ ] **Send the outreach email anyway** — CANDIDATE_OUTREACH.md has the
      no-questionnaire version: headshot request + data corrections +
      the stated-positions notice. One per campaign, reply deadline at
      least a week out.

## 2. Roster verification (against WEC certification)

- [ ] **Secretary of State — three challenged candidacies** (Eileen
      Newcomer DEM, Nate Pollnow REP, Cindy Werner REP): marked
      "Challenged" in the WEC June 9 ballot access report and NOT in
      ballot.json. Confirm their final status; add any who were certified.
- [ ] **Lt. Governor — David Varnam**: added July 4 from the WEC report
      (Sablich was denied access and removed). Varnam has had NO
      research: residence, website, positions, photo all empty.
- [ ] **Niina Threlfall-Baum ballot name**: campaigns as "Niina Baum" —
      match ballot.json `name` to the WEC certified form.
- [ ] **Suspension statuses**: Hughes (June 22) and Wassgren (April 21,
      per WPR/WSAW — drafted July 4) both marked suspended; confirm both
      remain on the printed ballot.

## 3. Candidate data (rule 6 verification pass)

- [ ] Every seeded `bio` / `occupation` / `residence` checked against WEC
      filings and campaign sites (seeds came from news coverage). Note:
      Fred Clark seeded as Bayfield; campaign mail goes to Washburn.
- [ ] 27 drafted `website` URLs — click each; they were verified live
      July 4 but campaigns move.
- [ ] **66 drafted `positions` quotes** — verify each against the live
      page (source_url on every entry). Specific flags: Murray's items
      came from a press-release feed (likely re-select); Myer's "Vision"
      section has no real topic headings; Hughes has one minimal entry;
      Schroeder's quote says "the corrupt WEC" (framing call); Kaul,
      Godlewski, Leiber, Hermening have no platform content — decide if
      "No stated positions available" is fair per race, or blank that
      race's positions to deactivate the block.
- [ ] Race `context` paragraphs were rewritten as reader-facing copy on
      July 8 (draft markers removed from display) — Shereen reviews and
      edits the wording like all drafted copy. The warnings those markers
      carried live in this checklist (esp. §2's challenged SoS trio).
- [ ] **Six `office_note` lines** (drafted July 15): the "what this
      office does" italic line under each race title. Verify the civic
      facts — duties, term lengths, the SoS-doesn't-run-elections point,
      the treasurer's Board of Commissioners of Public Lands seat — and
      edit the wording like all drafted copy.

## 4. Coverage links (drafted July 4)

- [ ] Click all 23 — verified loading July 4, headlines verbatim.
- [ ] The two WP&R governor items may be States Newsroom republications —
      confirm attribution/URL choice.
- [ ] AG has two same-day announcement stories — trim if desired.

## 5. Photos

- [ ] Spot-check the 9 integrated freely licensed photos (identity +
      license per PHOTO_SOURCING.md); Zamarripa's is ~8 years old,
      Toney's is a video still, Godlewski's is low-res — all replaceable
      via permission emails.
- [ ] Batch emails for the other 19: WPR archive first (Hermening,
      Xiong), PBS Wisconsin (Manske, Myer, Schroeder), state offices
      (Godlewski, Leiber, Roys, Crowley, Kaul), campaigns for the rest
      (fold into questionnaire outreach).

## 6. Logistics + product

- [ ] Verify all MyVote deep links in election.json resolve (entered from
      memory per BUILD_PLAN). `track_ballot` and `whats_on_ballot` were
      verified live in a browser July 15; `bringit.wi.gov` (photo-ID
      explainer link) confirmed the same day via its redirect to the WEC
      photo-ID page.
- [ ] Download one "Add to my calendar" .ics from How to Vote and open it
      in Google Calendar or Outlook — confirm the event lands on the right
      day with the right title.
- [ ] Sponsor decision: `sponsor` is null; if one signs, add the block —
      branding renders on landing and how-to-vote only, never race pages.
- [ ] Embed on a draft WordPress page with the EMBED.md snippet (includes
      the scroll-to-top listener); hand-check on a real phone.
- [ ] **Once the WordPress guide page publishes, paste its permalink into
      `publication.guide_url` in config/instance.json** — the Share
      button, /print footer, /newsletter CTA, and my-ballot footer all
      point there automatically (currently they fall back to the Pages
      URL).

## 7. Election night (see RESULTS_RUNBOOK.md)

- [ ] Aug 10 dry run with fake numbers, then reset to the zeroed template.
- [ ] Aug 11 ~7:30 p.m.: copy template → results.json, flip
      `results.enabled`, push. Watch for the red X in Actions after
      every push — the validator catches bad ids and malformed JSON
      within a minute.
