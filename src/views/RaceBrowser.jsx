import { LEVEL_ORDER, LEVEL_LABEL, PARTY_NOUN } from '../parties.js';
import { nextDeadline, formatDate } from '../dates.js';
import Sponsor from '../components/Sponsor.jsx';

function countLine(race) {
  return race.primaries
    .map((p) => {
      const n = p.candidates.length;
      const noun = PARTY_NOUN[p.party];
      return `${n} ${n === 1 ? noun.one : noun.many}`;
    })
    .join(' · ');
}

export default function RaceBrowser({ guide }) {
  const { races } = guide.ballot;
  const levels = LEVEL_ORDER.filter((level) => races.some((r) => r.level === level));
  const next = nextDeadline(guide.election.deadlines);

  return (
    <div>
      {next && (
        <a className="deadline-banner" href="#/vote">
          <span className="deadline-banner-label">Next deadline</span>
          <span>
            {next.label} — {formatDate(next.date)}
          </span>
          <span className="deadline-banner-cta">How to vote →</span>
        </a>
      )}
      {levels.map((level) => (
        <section key={level} className="level-section">
          <h2 className="level-heading">{LEVEL_LABEL[level]}</h2>
          <div className="race-list">
            {races
              .filter((r) => r.level === level)
              .map((race) => (
                <a key={race.id} className="race-card" href={`#/race/${race.id}`}>
                  <h3 className="race-card-office">{race.office}</h3>
                  {race.open_seat && <span className="badge badge-open">Open seat</span>}
                  <p className="race-card-counts">{countLine(race)}</p>
                </a>
              ))}
          </div>
        </section>
      ))}
      <Sponsor sponsor={guide.instance.sponsor} />
    </div>
  );
}
