// Data layer. Loads the three JSON contracts and validates them at boot.
// Every violation throws — the app fails at load, loudly, never at render.

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

function fail(msg) {
  throw new Error(`Invalid guide data: ${msg}`);
}

function validateInstance(instance) {
  if (!instance.publication?.id || !instance.publication?.name) {
    fail('instance.json is missing publication id or name');
  }
  if (!Array.isArray(instance.geographies) || instance.geographies.length === 0) {
    fail('instance.json geographies must be a non-empty array');
  }
  if (!instance.election) fail('instance.json is missing the election id');
}

function validateElection(election, instance) {
  if (election.id !== instance.election) {
    fail(`election.json id "${election.id}" does not match instance election "${instance.election}"`);
  }
  if (!election.date) fail('election.json is missing date');
  if (!Array.isArray(election.deadlines) || election.deadlines.length === 0) {
    fail('election.json deadlines must be a non-empty array');
  }
  for (const d of election.deadlines) {
    if (!d.id || !d.date || !d.label) {
      fail(`deadline "${d.id ?? '(no id)'}" is missing id, date, or label`);
    }
  }
  if (typeof election.results?.enabled !== 'boolean' || !election.results?.file) {
    fail('election.json results block must have enabled (boolean) and file');
  }
  if (!election.polls?.open || !election.polls?.close) {
    fail('election.json polls must have open and close times');
  }
  for (const key of ['myvote_home', 'register', 'polling_place', 'absentee', 'wec_hub']) {
    if (!election.links?.[key]) fail(`election.json links is missing "${key}"`);
  }
  if (!Array.isArray(election.explainers)) fail('election.json explainers must be an array');
}

function validateBallot(ballot, instance) {
  if (ballot.election_id !== instance.election) {
    fail(`ballot.json election_id "${ballot.election_id}" does not match instance election "${instance.election}"`);
  }
  if (!Array.isArray(ballot.races) || ballot.races.length === 0) {
    fail('ballot.json races must be a non-empty array');
  }
  if (!Array.isArray(ballot.questions)) fail('ballot.json questions must be an array');
  const questionIdsByRace = new Map();
  for (const q of ballot.questions) {
    if (!q.id || !q.race_id || !q.text) {
      fail(`question "${q.id ?? '(no id)'}" is missing id, race_id, or text`);
    }
    if (!ballot.races.some((r) => r.id === q.race_id)) {
      fail(`question "${q.id}" references unknown race "${q.race_id}"`);
    }
    if (!questionIdsByRace.has(q.race_id)) questionIdsByRace.set(q.race_id, new Set());
    questionIdsByRace.get(q.race_id).add(q.id);
  }

  for (const race of ballot.races) {
    const where = `race "${race.id ?? race.office ?? '(unidentified)'}"`;
    if (!race.id || !race.office || !race.level) {
      fail(`${where} is missing id, office, or level`);
    }
    if (!Array.isArray(race.geography) || race.geography.length === 0) {
      fail(`${where} has no geography tags`);
    }
    if (!Array.isArray(race.primaries) || race.primaries.length === 0) {
      fail(`${where} has no primaries`);
    }
    for (const primary of race.primaries) {
      if (primary.party !== 'DEM' && primary.party !== 'REP') {
        fail(`${where} has an invalid party "${primary.party}"`);
      }
      if (!Array.isArray(primary.candidates) || primary.candidates.length === 0) {
        fail(`${where} has an empty ${primary.party} primary`);
      }
      for (const c of primary.candidates) {
        if (!c.id || !c.name) {
          fail(`${where} ${primary.party} has a candidate missing id or name`);
        }
        if (c.status !== 'active' && c.status !== 'suspended') {
          fail(`candidate "${c.id}" has invalid status "${c.status}"`);
        }
        if (!Array.isArray(c.positions)) {
          fail(`candidate "${c.id}" positions must be an array`);
        }
        for (const p of c.positions) {
          if (!p.topic || !p.statement || !p.source_url) {
            fail(`candidate "${c.id}" has a position missing topic, statement, or source_url — every stated position must cite its source`);
          }
        }
        if (c.questionnaire !== null) {
          if (!Array.isArray(c.questionnaire?.responses)) {
            fail(`candidate "${c.id}" questionnaire must be null or have a responses array`);
          }
          for (const r of c.questionnaire.responses) {
            if (!r.q_id || typeof r.answer !== 'string') {
              fail(`candidate "${c.id}" has a response missing q_id or answer`);
            }
            if (!questionIdsByRace.get(race.id)?.has(r.q_id)) {
              fail(`candidate "${c.id}" answers unknown question "${r.q_id}" for ${where}`);
            }
          }
        }
      }
    }
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
  const races = ballot.races.filter((race) =>
    race.geography.some((g) => instance.geographies.includes(g))
  );
  if (races.length === 0) {
    fail(
      `no races match geographies [${instance.geographies.join(', ')}] — geography mismatch between instance.json and ballot.json`
    );
  }

  sortCandidates(ballot);
  return { instance, election, ballot: { ...ballot, races } };
}
