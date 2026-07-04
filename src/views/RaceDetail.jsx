import { PARTY_LABEL } from '../parties.js';
import CandidateCard from '../components/CandidateCard.jsx';

export default function RaceDetail({ guide, raceId }) {
  const race = guide.ballot.races.find((r) => r.id === raceId);
  const photoBase = `${import.meta.env.BASE_URL}data/elections/${guide.instance.election}/photos/`;

  if (!race) {
    return (
      <div>
        <p>
          No such race. <a href="#/">Back to all races</a>
        </p>
      </div>
    );
  }

  return (
    <article>
      <a className="back-link" href="#/">
        ← All races
      </a>
      <h2 className="race-title">
        {race.office}
        {race.open_seat && <span className="badge badge-open">Open seat</span>}
      </h2>
      <p className="race-context">{race.context}</p>

      {race.primaries.map((primary) => (
        <section key={primary.party} className="primary-section">
          <h3 className={`primary-heading primary-heading-${primary.party.toLowerCase()}`}>
            {PARTY_LABEL[primary.party]}
          </h3>
          <div className="candidate-grid">
            {primary.candidates.map((c) => (
              <CandidateCard key={c.id} candidate={c} photoBase={photoBase} />
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}
