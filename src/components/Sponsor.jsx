// Sponsor branding renders on the landing and how-to-vote views ONLY —
// never on race or candidate views. Editorial integrity rule (CLAUDE.md).
export default function Sponsor({ sponsor }) {
  if (!sponsor) return null;
  return (
    <aside className="sponsor">
      <p className="sponsor-disclosure">{sponsor.disclosure}</p>
      <a href={sponsor.url} target="_blank" rel="noopener noreferrer">
        <img className="sponsor-logo" src={sponsor.logo_url} alt={sponsor.name} />
      </a>
    </aside>
  );
}
