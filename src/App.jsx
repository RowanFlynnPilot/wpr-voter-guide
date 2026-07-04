import { useEffect, useState } from 'react';
import { loadGuide } from './data.js';

export default function App() {
  const [guide, setGuide] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGuide().then(setGuide, setError);
  }, []);

  if (error) {
    return (
      <div className="load-error" role="alert">
        <h1>Voter guide failed to load</h1>
        <p className="load-error-detail">{error.message}</p>
        <p>This is a data or configuration problem, not something you can fix by reloading.</p>
      </div>
    );
  }

  if (!guide) {
    return <div className="loading">Loading voter guide…</div>;
  }

  const { instance, election } = guide;

  return (
    <div className="app">
      <header className="masthead">
        <p className="masthead-kicker">{instance.publication.name}</p>
        <h1 className="masthead-title">Voter Guide</h1>
        <p className="masthead-sub">
          {election.name} — {formatDate(election.date)}
        </p>
      </header>
    </div>
  );
}

export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
