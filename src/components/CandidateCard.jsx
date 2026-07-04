// One identical layout for every candidate — equal space, alphabetical
// order comes from the data layer. bio/occupation are self-stated sources
// only; empty fields mean "not yet verified" and render as nothing.
export default function CandidateCard({ candidate }) {
  return (
    <div className="candidate-card">
      <h4 className="candidate-name">{candidate.name}</h4>
      {candidate.status === 'suspended' && (
        <p className="badge badge-suspended">
          Suspended campaign
          {candidate.status_note && (
            <span className="badge-note"> — {candidate.status_note}</span>
          )}
        </p>
      )}
      {(candidate.residence || candidate.occupation) && (
        <p className="candidate-meta">
          {[candidate.residence, candidate.occupation].filter(Boolean).join(' · ')}
        </p>
      )}
      {candidate.bio && <p className="candidate-bio">{candidate.bio}</p>}
      {candidate.website && (
        <p className="candidate-site">
          <a href={candidate.website} target="_blank" rel="noopener noreferrer">
            Campaign website
          </a>
        </p>
      )}
    </div>
  );
}
