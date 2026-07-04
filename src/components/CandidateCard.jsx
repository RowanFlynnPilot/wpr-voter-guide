// One identical layout for every candidate — equal space, alphabetical
// order comes from the data layer. bio/occupation are self-stated sources
// only; empty fields mean "not yet verified" and render as nothing.
// Photos are candidate-supplied headshots (see CLAUDE.md); a candidate
// without one gets the same-size neutral initials placeholder, never a
// stock image and never a different layout.
export default function CandidateCard({ candidate, photoBase }) {
  return (
    <div className="candidate-card">
      <div className="candidate-head">
        <Headshot candidate={candidate} photoBase={photoBase} />
        <div>
          <h4 className="candidate-name">{candidate.name}</h4>
          {(candidate.residence || candidate.occupation) && (
            <p className="candidate-meta">
              {[candidate.residence, candidate.occupation].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>
      {candidate.status === 'suspended' && (
        <p className="badge badge-suspended">
          Suspended campaign
          {candidate.status_note && (
            <span className="badge-note"> — {candidate.status_note}</span>
          )}
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

function Headshot({ candidate, photoBase }) {
  if (candidate.photo) {
    return (
      <img
        className="candidate-photo"
        src={photoBase + candidate.photo}
        alt={candidate.name}
      />
    );
  }
  const words = candidate.name.split(' ');
  const initials = (words[0][0] + words[words.length - 1][0]).toUpperCase();
  return (
    <span className="candidate-photo candidate-photo-placeholder" aria-hidden="true">
      {initials}
    </span>
  );
}
