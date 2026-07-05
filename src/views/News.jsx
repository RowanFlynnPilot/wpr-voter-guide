import { LEVEL_ORDER } from '../parties.js';
import CoverageList from '../components/CoverageList.jsx';

// All curated coverage, grouped by race, newest first within each.
export default function News({ guide }) {
  const races = LEVEL_ORDER.flatMap((level) =>
    guide.ballot.races.filter((r) => r.level === level && r.coverage.length > 0)
  );

  if (races.length === 0) {
    return (
      <p>
        No coverage yet. <a href="#/">Back to the guide</a>
      </p>
    );
  }

  return (
    <div>
      <h2 className="view-title">Race coverage</h2>
      <p className="results-note">
        Reporting on these races from {guide.instance.publication.name} and other
        Wisconsin newsrooms, selected by our editors.
      </p>
      {races.map((race) => (
        <section key={race.id} className="news-race">
          <h3 className="section-heading">
            <a className="news-race-link" href={`#/race/${race.id}`}>
              {race.office}
            </a>
          </h3>
          <CoverageList items={race.coverage} />
        </section>
      ))}
    </div>
  );
}
