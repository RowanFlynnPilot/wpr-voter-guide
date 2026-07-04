import { useEffect, useState } from 'react';
import { fetchResults, joinRace } from '../results.js';
import { LEVEL_ORDER, PARTY_LABEL } from '../parties.js';

export default function Results({ guide }) {
  const { instance, election, ballot } = guide;
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetchResults(instance, election).then(
        (r) => {
          if (!alive) return;
          setResults(r);
          setError(null);
        },
        (e) => alive && setError(e)
      );
    load();
    const timer = setInterval(load, election.results.poll_seconds * 1000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [instance, election]);

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

  return (
    <div>
      <h2 className="view-title">Primary results</h2>
      <p className="results-note">
        {results.note} Updated {formatUpdated(results.updated)}
      </p>

      {races.map((race) => (
        <section key={race.id} className="results-race">
          <h3 className="results-office">{race.office}</h3>
          {joinRace(race, results).map((primary) => (
            <div key={primary.party} className="results-primary">
              <h4 className={`primary-heading primary-heading-${primary.party.toLowerCase()}`}>
                {PARTY_LABEL[primary.party]}
                {primary.reporting && (
                  <span className="results-reporting">{primary.reporting}</span>
                )}
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
                        className={`results-bar results-bar-${primary.party.toLowerCase()}`}
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
  return time.replace(' AM', ' a.m.').replace(' PM', ' p.m.');
}
