// Election-night results. results.json is updated by manual commits, so we
// poll the raw GitHub URL — it updates on commit without waiting for a
// Pages rebuild. Any fetch or validation failure throws; the view shows a
// visible error state, never silently-stale numbers.

const RAW_BASE = 'https://raw.githubusercontent.com/RowanFlynnPilot/wpr-voter-guide/main/';

export async function fetchResults(instance, election) {
  const path = `data/elections/${instance.election}/${election.results.file}`;
  let res;
  try {
    res = await fetch(RAW_BASE + path, { cache: 'no-store' });
  } catch (err) {
    throw new Error(`Could not fetch results: ${err.message}`);
  }
  if (!res.ok) {
    throw new Error(`Results file not available (HTTP ${res.status}). ${path} must exist on main.`);
  }
  const text = await res.text();
  let results;
  try {
    results = JSON.parse(text);
  } catch (err) {
    throw new Error(`Malformed JSON in ${path}: ${err.message}`);
  }
  validateResults(results);
  return results;
}

function validateResults(results) {
  if (!results.updated) throw new Error('results.json is missing the updated timestamp');
  if (!Array.isArray(results.races)) throw new Error('results.json races must be an array');
  for (const race of results.races) {
    if (!race.race_id) throw new Error('a results race is missing race_id');
    for (const primary of race.primaries ?? []) {
      for (const c of primary.candidates ?? []) {
        if (!c.id || typeof c.votes !== 'number' || typeof c.winner !== 'boolean') {
          throw new Error(
            `results for "${race.race_id}" ${primary.party}: each candidate needs id, numeric votes, boolean winner`
          );
        }
      }
    }
  }
}

// Join a ballot race to its results by race_id + candidate id. The results
// template contains every id, so a missing join is a hand-editing error —
// throw so the mistake is caught on the next poll, loudly.
export function joinRace(race, results) {
  const resultRace = results.races.find((r) => r.race_id === race.id);
  if (!resultRace) throw new Error(`results.json has no entry for race "${race.id}"`);
  return race.primaries.map((primary) => {
    const resultPrimary = resultRace.primaries.find((p) => p.party === primary.party);
    if (!resultPrimary) {
      throw new Error(`results.json race "${race.id}" is missing the ${primary.party} primary`);
    }
    const total = resultPrimary.candidates.reduce((sum, c) => sum + c.votes, 0);
    const candidates = primary.candidates.map((c) => {
      const r = resultPrimary.candidates.find((rc) => rc.id === c.id);
      if (!r) throw new Error(`results.json race "${race.id}" is missing candidate "${c.id}"`);
      return {
        ...c,
        votes: r.votes,
        winner: r.winner,
        share: total > 0 ? r.votes / total : 0,
      };
    });
    // Leaders first on election night; alphabetical while all zeros.
    candidates.sort((a, b) => b.votes - a.votes || a.id.localeCompare(b.id));
    return { party: primary.party, reporting: resultPrimary.reporting, candidates, total };
  });
}
