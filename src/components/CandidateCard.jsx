import { useMyBallot, togglePick } from '../myballot.js';

// One identical layout for every candidate — equal space, alphabetical
// order comes from the data layer. bio/occupation are self-stated sources
// only; empty fields mean "not yet verified" and render as nothing.
// Photos are candidate-supplied headshots (see CLAUDE.md); a candidate
// without one gets the same-size neutral initials placeholder, never a
// stock image and never a different layout.
export default function CandidateCard({ candidate, photoBase, positionsActive }) {
  const picks = useMyBallot();
  const picked = picks.includes(candidate.id);
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
      {positionsActive && <Positions positions={candidate.positions} />}
      {candidate.website && (
        <p className="candidate-site">
          <a href={candidate.website} target="_blank" rel="noopener noreferrer">
            Campaign website
          </a>
        </p>
      )}
      {candidate.photo && candidate.photo_credit && (
        <p className="photo-credit">Photo: {candidate.photo_credit}</p>
      )}
      <button
        className={picked ? 'ballot-toggle ballot-toggle-on' : 'ballot-toggle'}
        onClick={() => togglePick(candidate.id)}
        aria-pressed={picked}
      >
        {picked ? '✓ On my ballot' : '+ My ballot'}
      </button>
    </div>
  );
}

// Stated positions: verbatim quotes from the candidate's own campaign
// materials, each with a source link (editorial rule 8). The block only
// renders once any candidate in the race has entries (positionsActive);
// from then on, a candidate without any gets an explicit label.
function Positions({ positions }) {
  return (
    <div className="candidate-positions">
      <p className="positions-heading">Stated positions</p>
      {positions.length === 0 ? (
        <p className="positions-none">No stated positions available</p>
      ) : (
        <>
          {positions.map((p) => (
            <p key={p.topic} className="position">
              <strong>{p.topic}:</strong> “{p.statement}”{' '}
              <a href={p.source_url} target="_blank" rel="noopener noreferrer">
                source
              </a>
            </p>
          ))}
          <p className="positions-note">From the candidate's campaign materials.</p>
        </>
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
