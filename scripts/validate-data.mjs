// CI data check: runs the same validators the app runs at boot, plus a
// full join of results-template.json (and results.json when it exists)
// against ballot.json. Fails the build before a bad commit reaches
// readers. Run locally with: node scripts/validate-data.mjs
import fs from 'node:fs';
import { validateInstance, validateElection, validateBallot, matchRaces } from '../src/validate.js';
import { validateResults, joinRace } from '../src/results.js';

const read = (path) => {
  const text = fs.readFileSync(path, 'utf8');
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Malformed JSON in ${path}: ${err.message}`);
  }
};

const instance = read('config/instance.json');
validateInstance(instance);

const dir = `data/elections/${instance.election}/`;
const election = read(dir + 'election.json');
const ballot = read(dir + 'ballot.json');
validateElection(election, instance);
validateBallot(ballot, instance);
matchRaces(ballot, instance);
console.log(`ok: instance, election, ballot (${ballot.races.length} races)`);

for (const file of ['results-template.json', election.results.file]) {
  const path = dir + file;
  if (!fs.existsSync(path)) {
    if (file === 'results-template.json') throw new Error(`${path} is required`);
    continue; // results.json only exists on election night
  }
  const results = read(path);
  validateResults(results);
  for (const race of ballot.races) joinRace(race, results);
  console.log(`ok: ${file} joins every race and candidate`);
}

if (election.results.enabled && !fs.existsSync(dir + election.results.file)) {
  throw new Error(
    `results.enabled is true but ${dir}${election.results.file} does not exist — the live site will show the error banner`
  );
}

console.log('all guide data valid');
