import { PARTY_LABEL } from '../parties.js';

// Question-by-question comparison, candidates side by side, answers
// verbatim. A candidate with no answer gets an explicit "Did not respond"
// label — that label is itself information for voters (editorial rule 4).
export default function Questionnaire({ guide, raceId }) {
  const race = guide.ballot.races.find((r) => r.id === raceId);
  const questions = guide.ballot.questions.filter((q) => q.race_id === raceId);

  if (!race || questions.length === 0) {
    return (
      <p>
        No questionnaire for this race. <a href="#/">Back to all races</a>
      </p>
    );
  }

  return (
    <article>
      <a className="back-link" href={`#/race/${race.id}`}>
        ← {race.office}
      </a>
      <h2 className="race-title">Candidates in their own words</h2>
      <p className="race-context">
        {guide.instance.publication.name} sent every candidate in this race the same
        questions. Answers appear verbatim, in the candidates' own words, edited only
        for length where noted.
      </p>

      {questions.map((q, i) => (
        <section key={q.id} className="question-section">
          <h3 className="question-text">
            <span className="question-number">Q{i + 1}</span> {q.text}
          </h3>
          {race.primaries.map((primary) => (
            <div key={primary.party}>
              <h4 className={`primary-heading primary-heading-${primary.party.toLowerCase()}`}>
                {PARTY_LABEL[primary.party]}
              </h4>
              <div className="answer-grid">
                {primary.candidates.map((c) => (
                  <Answer key={c.id} candidate={c} questionId={q.id} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </article>
  );
}

function Answer({ candidate, questionId }) {
  const response = candidate.questionnaire?.responses.find((r) => r.q_id === questionId);
  return (
    <div className="answer-card">
      <p className="answer-name">
        {candidate.name}
        {candidate.status === 'suspended' && (
          <span className="results-suspended"> (suspended campaign)</span>
        )}
      </p>
      {response ? (
        <p className="answer-text">{response.answer}</p>
      ) : (
        <p className="answer-none">Did not respond</p>
      )}
    </div>
  );
}
