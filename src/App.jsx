import { useEffect, useState } from 'react';
import { loadGuide } from './data.js';
import { formatDate } from './dates.js';
import { useHashRoute } from './router.js';
import RaceBrowser from './views/RaceBrowser.jsx';
import RaceDetail from './views/RaceDetail.jsx';
import HowToVote from './views/HowToVote.jsx';
import PrintView from './views/PrintView.jsx';
import NewsletterView from './views/NewsletterView.jsx';

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

  // Standalone routes render without the app shell.
  if (route[0] === 'print') return <PrintView guide={guide} />;
  if (route[0] === 'newsletter') return <NewsletterView guide={guide} />;

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
          <a className={route[0] === 'vote' ? 'nav-active' : ''} href="#/vote">
            How to vote
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
  if (route[0] === 'vote') return <HowToVote guide={guide} />;
  return (
    <p>
      Page not found. <a href="#/">Back to the guide</a>
    </p>
  );
}
