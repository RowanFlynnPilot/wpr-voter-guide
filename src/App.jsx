import { useEffect, useState } from 'react';
import { loadGuide } from './data.js';
import { useHashRoute } from './router.js';
import RaceBrowser from './views/RaceBrowser.jsx';
import RaceDetail from './views/RaceDetail.jsx';

export default function App() {
  const [guide, setGuide] = useState(null);
  const [error, setError] = useState(null);
  const route = useHashRoute();

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
        <h1 className="masthead-title">
          <a className="masthead-link" href="#/">
            Voter Guide
          </a>
        </h1>
        <p className="masthead-sub">
          {election.name} — {formatDate(election.date)}
        </p>
        <nav className="nav">
          <a className={route.length === 0 ? 'nav-active' : ''} href="#/">
            Races
          </a>
        </nav>
      </header>
      <main>
        <Route route={route} guide={guide} />
      </main>
    </div>
  );
}

function Route({ route, guide }) {
  if (route.length === 0) return <RaceBrowser guide={guide} />;
  if (route[0] === 'race' && route[1]) return <RaceDetail guide={guide} raceId={route[1]} />;
  return (
    <p>
      Page not found. <a href="#/">Back to the guide</a>
    </p>
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
