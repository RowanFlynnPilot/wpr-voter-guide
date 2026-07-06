import { LEVEL_ORDER, PARTY_LABEL, PARTY_NOUN } from '../parties.js';
import { formatDate, formatHour } from '../dates.js';
import { useMyBallot, clearPicks } from '../myballot.js';
import { guideUrl } from '../urls.js';

// The reader's own checklist — picks stay in their browser, period.
// Every candidate gets the identical toggle; a pick here is the
// reader's choice, not an endorsement.
export default function MyBallot({ guide }) {
  const picks = useMyBallot();
  const { election, ballot } = guide;

  const races = LEVEL_ORDER.flatMap((level) => ballot.races.filter((r) => r.level === level));
  const picked = races
    .map((race) => ({
      race,
      candidates: race.primaries.flatMap((p) =>
        p.candidates.filter((c) => picks.includes(c.id)).map((c) => ({ ...c, party: p.party }))
      ),
    }))
    .filter((entry) => entry.candidates.length > 0);

  const partiesPicked = new Set(picked.flatMap((e) => e.candidates.map((c) => c.party)));

  if (picks.length === 0) {
    return (
      <div>
        <h2 className="view-title">My ballot</h2>
        <p>
          As you browse the <a href="#/">races</a>, tap{' '}
          <strong>“+ My ballot”</strong> on candidates you're considering. Your picks
          collect here into a list you can print or screenshot and take to the polls.
        </p>
        <p className="results-note">
          Picks are saved only in your browser — nothing is sent to us or anyone else.
        </p>
      </div>
    );
  }

  return (
    <div className="myballot">
      <h2 className="view-title">My ballot</h2>
      <p className="myballot-sub">
        {election.name} — {formatDate(election.date)}
      </p>

      {partiesPicked.size > 1 && (
        <div className="myballot-warning" role="alert">
          <strong>Heads up:</strong> your picks include both {PARTY_NOUN.DEM.many} and{' '}
          {PARTY_NOUN.REP.many}. Wisconsin's primary lets you vote in{' '}
          <strong>only one party's primary</strong> — votes cast across parties won't
          count. Use this list to decide which primary you'll vote in.
        </div>
      )}

      {picked.map(({ race, candidates }) => (
        <section key={race.id} className="myballot-race">
          <h3 className="myballot-office">
            <a className="news-race-link" href={`#/race/${race.id}`}>
              {race.office}
            </a>
          </h3>
          <ul className="myballot-picks">
            {candidates.map((c) => (
              <li key={c.id}>
                <span className="myballot-name">{c.name}</span>
                <span className="myballot-party">{PARTY_LABEL[c.party]}</span>
                {c.status === 'suspended' && (
                  <span className="results-suspended"> (suspended campaign)</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="myballot-remaining">
        {races.length - picked.length > 0 &&
          `Races without a pick yet: ${races
            .filter((r) => !picked.some((e) => e.race.id === r.id))
            .map((r) => r.office)
            .join(' · ')}`}
      </p>

      <div className="ballot-actions">
        <button className="print-button" onClick={() => window.print()}>
          Print my list
        </button>
        <button
          className="ballot-clear"
          onClick={() => {
            if (window.confirm('Clear all your picks?')) clearPicks();
          }}
        >
          Clear all
        </button>
      </div>

      <p className="myballot-foot">
        Polls are open {formatHour(election.polls.open)}–{formatHour(election.polls.close)} on
        election day. Bring photo ID. Full guide: {guideUrl(guide.instance)}
      </p>
    </div>
  );
}
