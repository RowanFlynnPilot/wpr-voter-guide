// Data layer. Loads the three JSON contracts and validates them at boot.
// Every violation throws — the app fails at load, loudly, never at render.
// Validation logic lives in validate.js, shared with the CI check.

import { validateInstance, validateElection, validateBallot, matchRaces } from './validate.js';

const BASE = import.meta.env.BASE_URL;

async function fetchJson(path) {
  let res;
  try {
    res = await fetch(BASE + path);
  } catch (err) {
    throw new Error(`Could not fetch ${path}: ${err.message}`);
  }
  if (!res.ok) {
    throw new Error(`Missing data file ${path} (HTTP ${res.status})`);
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Malformed JSON in ${path}: ${err.message}`);
  }
}

// Candidate ids are lastname-firstname kebab (data contract), so sorting by
// id is alphabetical by last name — editorial rule 1.
function sortCandidates(ballot) {
  for (const race of ballot.races) {
    for (const primary of race.primaries) {
      primary.candidates.sort((a, b) => a.id.localeCompare(b.id));
    }
  }
}

// Coverage renders newest first everywhere.
function sortCoverage(ballot) {
  for (const race of ballot.races) {
    race.coverage.sort((a, b) => b.date.localeCompare(a.date));
  }
}

export async function loadGuide() {
  const instance = await fetchJson('config/instance.json');
  validateInstance(instance);

  const dir = `data/elections/${instance.election}/`;
  const [election, ballot] = await Promise.all([
    fetchJson(dir + 'election.json'),
    fetchJson(dir + 'ballot.json'),
  ]);
  validateElection(election, instance);
  validateBallot(ballot, instance);

  // Multi-tenant filter: render only races whose geography intersects this
  // publication's list. Zero matches means the instance is misconfigured.
  const races = matchRaces(ballot, instance);

  sortCandidates(ballot);
  sortCoverage(ballot);
  return { instance, election, ballot: { ...ballot, races } };
}
