import { useEffect, useState } from 'react';
import { fetchResults, joinRace } from '../results.js';
import { LEVEL_ORDER, PARTY_LABEL } from '../parties.js';

export default function Results({ guide }) {
  const { instance, election, ballot } = guide;
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetchResults(instance, election);
        // Join every race now, so a bad id in a hand-edited results.json
        // surfaces as the visible error banner — never a crash at render.
        for (const race of ballot.races) joinRace(race, r);
        if (!alive) return;
        setResults(r);
        setError(null);
      } catch (e) {
        if (alive) setError(e);
      }
    };
    load();
    const timer = setInterval(load, election.results.poll_seconds * 1000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [instance, election, ballot]);

  if (error) {
    return (
      <div className="load-error" role="alert">
        <h1>Results unavailable</h1>
        <p className="load-error-detail">{error.message}</p>
        <p>
          Retrying automatically every {election.results.poll_seconds} seconds. Statewide
          results are also available from the{' '}
          <a href={election.links.wec_hub} target="_blank" rel="noopener noreferrer">
            Wisconsin Elections Commission
          </a>
          .
        </p>
      </div>
    );
  }

  if (!results) {
    return <div className="loading">Loading results…</div>;
  }

  const races = LEVEL_ORDER.flatMap((level) => ballot.races.filter((r) => r.level === level));
  // Numbers are hand-committed; if the last update is aging, say so —
  // silent staleness is the one failure mode this page must never have.
  const staleMinutes = Math.floor((Date.now() - new Date(results.updated)) / 60000);

  return (
    <div>
      <h2 className="view-title">Primary results</h2>
      <p className="results-note">
        {results.note} Updated {formatUpdated(results.updated)}
      </p>
      {staleMinutes > 45 && (
        <p className="results-stale" role="status">
          These numbers were last updated {staleMinutes} minutes ago and may be
          behind the current count.
        </p>
      )}

      {races.map((race) => (
        <section key={race.id} className="results-race">
          <h3 className="results-office">{race.office}</h3>
          {joinRace(race, results).map((primary) => (
            <div key={primary.party} className="results-primary">
              <h4 className={`primary-heading primary-heading-${primary.party.toLowerCase()}`}>
                {PARTY_LABEL[primary.party]}
                <span className="results-reporting">
                  {primary.reporting && `${primary.reporting} · `}
                  {primary.total.toLocaleString('en-US')} votes counted
                </span>
              </h4>
              <ol className="results-list">
                {primary.candidates.map((c) => (
                  <li key={c.id} className="results-row">
                    <span className="results-name">
                      {c.winner && (
                        <span className="results-winner" title="Winner">
                          ✓{' '}
                        </span>
                      )}
                      {c.name}
                      {c.status === 'suspended' && (
                        <span className="results-suspended"> (suspended campaign)</span>
                      )}
                    </span>
                    <span className="results-numbers">
                      {Math.round(c.share * 100)}% · {c.votes.toLocaleString('en-US')}
                    </span>
                    <span className="results-bar-track">
                      <span
                        className="results-bar"
                        style={{ width: `${Math.round(c.share * 100)}%` }}
                      />
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

function formatUpdated(iso) {
  const time = new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Chicago',
  });
  // \s covers the narrow no-break space newer browsers put before AM/PM.
  return time.replace(/\s*AM$/, ' a.m.').replace(/\s*PM$/, ' p.m.');
}
