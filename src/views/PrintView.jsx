import { LEVEL_ORDER } from '../parties.js';
import { PARTY_LABEL } from '../parties.js';
import { formatDate, formatDateShort, formatHour } from '../dates.js';
import { guideUrl } from '../urls.js';

// One-page cheat sheet. Print stylesheet renders it black on white with
// no backgrounds; the guide URL goes in the footer.
export default function PrintView({ guide }) {
  const { instance, election, ballot } = guide;
  const races = LEVEL_ORDER.flatMap((level) =>
    ballot.races.filter((r) => r.level === level)
  );
  const url = guideUrl(instance);

  return (
    <div className="print-view">
      <button className="print-button" onClick={() => window.print()}>
        Print this page
      </button>

      <header className="print-head">
        {instance.publication.logo && (
          <img
            className="print-logo"
            src={import.meta.env.BASE_URL + instance.publication.logo}
            alt={instance.publication.name}
          />
        )}
        <h1 className="print-title">
          {election.name} — {formatDate(election.date)}
        </h1>
        <p className="print-sub">
          Voter guide from {instance.publication.name}. Polls open{' '}
          {formatHour(election.polls.open)} to {formatHour(election.polls.close)}.
        </p>
      </header>

      <section className="print-dates">
        <h2 className="print-heading">Key dates</h2>
        <ul className="print-date-list">
          {election.deadlines.map((d) => (
            <li key={d.id}>
              <strong>{formatDateShort(d.date)}</strong> — {d.label}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="print-heading">Races on your ballot</h2>
        {races.map((race) => (
          <div key={race.id} className="print-race">
            <h3 className="print-office">
              {race.office}
              {race.open_seat && <span className="print-open"> (open seat)</span>}
            </h3>
            {race.primaries.map((p) => (
              <p key={p.party} className="print-primary">
                <strong>{PARTY_LABEL[p.party]}:</strong>{' '}
                {p.candidates
                  .map((c) => c.name + (c.status === 'suspended' ? ' (suspended campaign)' : ''))
                  .join(', ')}
              </p>
            ))}
          </div>
        ))}
      </section>

      <footer className="print-foot">
        {election.ballot_note && <p>{election.ballot_note}</p>}
        <p>
          Full guide with candidate details: {url} · Remember: vote in only ONE
          party's primary. Bring photo ID.
        </p>
      </footer>
    </div>
  );
}
