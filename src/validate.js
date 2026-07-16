// Pure data-contract validation, shared by the app (src/data.js at boot)
// and CI (scripts/validate-data.mjs on every push). Every violation
// throws — one validator, two places it runs.

function fail(msg) {
  throw new Error(`Invalid guide data: ${msg}`);
}

export function validateInstance(instance) {
  if (!instance.publication?.id || !instance.publication?.name) {
    fail('instance.json is missing publication id or name');
  }
  if (!Array.isArray(instance.geographies) || instance.geographies.length === 0) {
    fail('instance.json geographies must be a non-empty array');
  }
  if (!instance.election) fail('instance.json is missing the election id');
}

export function validateElection(election, instance) {
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
  for (const key of [
    'myvote_home',
    'register',
    'polling_place',
    'absentee',
    'track_ballot',
    'whats_on_ballot',
    'wec_hub',
  ]) {
    if (!election.links?.[key]) fail(`election.json links is missing "${key}"`);
  }
  // "" is valid — it means this guide covers the reader's whole ballot.
  if (typeof election.ballot_note !== 'string') {
    fail('election.json ballot_note must be a string');
  }
  if (!Array.isArray(election.explainers)) fail('election.json explainers must be an array');
  for (const e of election.explainers) {
    if (!e.id || !e.title || !e.body) {
      fail(`explainer "${e.id ?? '(no id)'}" is missing id, title, or body`);
    }
    if (Boolean(e.link) !== Boolean(e.link_label)) {
      fail(`explainer "${e.id}" must have both link and link_label, or neither`);
    }
  }
}

export function validateBallot(ballot, instance) {
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
    if (!Array.isArray(race.coverage)) {
      fail(`${where} coverage must be an array`);
    }
    for (const item of race.coverage) {
      if (!item.headline || !item.outlet || !item.date || !item.url) {
        fail(`${where} has a coverage item missing headline, outlet, date, or url`);
      }
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

// Multi-tenant filter check: the publication must have at least one race.
export function matchRaces(ballot, instance) {
  const races = ballot.races.filter((race) =>
    race.geography.some((g) => instance.geographies.includes(g))
  );
  if (races.length === 0) {
    fail(
      `no races match geographies [${instance.geographies.join(', ')}] — geography mismatch between instance.json and ballot.json`
    );
  }
  return races;
}
