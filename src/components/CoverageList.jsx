import { formatDateShort } from '../dates.js';

// Editorial-curated article links. Which outlets appear is decided by
// what editorial adds to ballot.json coverage — nothing is pulled
// automatically (no scraper, no cron; see CLAUDE.md).
export default function CoverageList({ items }) {
  return (
    <ul className="coverage-list">
      {items.map((item) => (
        <li key={item.url} className="coverage-item">
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            {item.headline}
          </a>
          <span className="coverage-meta">
            {item.outlet} · {formatDateShort(item.date)}
          </span>
        </li>
      ))}
    </ul>
  );
}
