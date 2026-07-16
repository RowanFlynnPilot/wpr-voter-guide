import { PARTY_LABEL } from '../parties.js';
import CandidateCard from '../components/CandidateCard.jsx';
import CoverageList from '../components/CoverageList.jsx';
import ShareButton from '../components/ShareButton.jsx';

export default function RaceDetail({ guide, raceId }) {
  const race = guide.ballot.races.find((r) => r.id === raceId);
  const photoBase = `${import.meta.env.BASE_URL}data/elections/${guide.instance.election}/photos/`;
  // Positions activate race-wide: once any candidate has entries, every
  // card in the race shows the block so absence is visible information.
  const positionsActive =
    race?.primaries.some((p) => p.candidates.some((c) => c.positions.length > 0)) ?? false;

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
      <div className="race-topbar">
        <a className="back-link" href="#/">
          ← All races
        </a>
        <ShareButton
          instance={guide.instance}
          election={guide.election}
          path={`#/race/${race.id}`}
          label="Share this race"
          title={`${race.office} — ${guide.election.name}`}
        />
      </div>
      <h2 className="race-title">
        {race.office}
        {race.open_seat && <span className="badge badge-open">Open seat</span>}
      </h2>
      {race.office_note && <p className="office-note">{race.office_note}</p>}
      <p className="race-context">{race.context}</p>

      {guide.ballot.questions.some((q) => q.race_id === race.id) && (
        <p>
          <a className="questionnaire-link" href={`#/race/${race.id}/questionnaire`}>
            Compare the candidates in their own words →
          </a>
        </p>
      )}

      {race.primaries.map((primary) => (
        <section key={primary.party} className="primary-section">
          <h3 className={`primary-heading primary-heading-${primary.party.toLowerCase()}`}>
            {PARTY_LABEL[primary.party]}
            <span className="primary-count">
              {primary.candidates.length}{' '}
              {primary.candidates.length === 1 ? 'candidate' : 'candidates'}
            </span>
          </h3>
          <div className="candidate-grid">
            {primary.candidates.map((c) => (
              <CandidateCard
                key={c.id}
                candidate={c}
                photoBase={photoBase}
                positionsActive={positionsActive}
              />
            ))}
          </div>
        </section>
      ))}

      {race.coverage.length > 0 && (
        <section className="race-coverage">
          <h3 className="section-heading">Related coverage</h3>
          <CoverageList items={race.coverage} />
        </section>
      )}
    </article>
  );
}
