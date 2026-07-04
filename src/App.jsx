import { useEffect, useState } from 'react';
import { loadGuide } from './data.js';
import { formatDate } from './dates.js';
import { useHashRoute } from './router.js';
import RaceBrowser from './views/RaceBrowser.jsx';
import RaceDetail from './views/RaceDetail.jsx';
import HowToVote from './views/HowToVote.jsx';
import PrintView from './views/PrintView.jsx';
import NewsletterView from './views/NewsletterView.jsx';
import Results from './views/Results.jsx';
import Questionnaire from './views/Questionnaire.jsx';

export default function App() {
  const [guide, setGuide] = useState(null);
  const [error, setError] = useState(null);
  const route = useHashRoute();

  useEffect(() => {
    loadGuide().then(setGuide, setError);
  }, []);

  const routeKey = route.join('/');

  // Hash navigation keeps scroll position; a new view should start at the top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [routeKey]);

  useEffect(() => {
    if (!guide) return;
    document.title = `${viewTitle(route, guide)} — ${guide.instance.publication.name}`;
  }, [routeKey, guide]);

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
        <div className="masthead-brand">
          {instance.publication.icon && (
            <img
              className="masthead-icon"
              src={import.meta.env.BASE_URL + instance.publication.icon}
              alt=""
            />
          )}
          {instance.publication.logo ? (
            <img
              className="masthead-logo"
              src={import.meta.env.BASE_URL + instance.publication.logo}
              alt={instance.publication.name}
            />
          ) : (
            <span>{instance.publication.name}</span>
          )}
        </div>
        <h1 className="masthead-title">
          <a className="masthead-link" href="#/">
            Voter Guide
          </a>
        </h1>
        <p className="masthead-sub">
          {election.name} — {formatDate(election.date)}
        </p>
        <nav className="nav">
          {election.results.enabled ? (
            <>
              <a className={route.length === 0 ? 'nav-active' : ''} href="#/">
                Results
              </a>
              <a className={route[0] === 'races' ? 'nav-active' : ''} href="#/races">
                Races
              </a>
            </>
          ) : (
            <a className={route.length === 0 ? 'nav-active' : ''} href="#/">
              Races
            </a>
          )}
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

function viewTitle(route, guide) {
  if (route[0] === 'race' && route[1]) {
    const race = guide.ballot.races.find((r) => r.id === route[1]);
    if (race) return route[2] === 'questionnaire' ? `${race.office} questionnaire` : race.office;
  }
  if (route[0] === 'vote') return 'How to vote';
  if (route[0] === 'print') return 'Print guide';
  if (route[0] === 'newsletter') return 'Newsletter block';
  if (route.length === 0 && guide.election.results.enabled) return 'Primary results';
  return 'Voter Guide';
}

function Route({ route, guide }) {
  // Results mode: when enabled the guide's front page becomes the results
  // board. Toggled only by the results.enabled flag in election.json.
  const resultsMode = guide.election.results.enabled;
  if (route.length === 0) return resultsMode ? <Results guide={guide} /> : <RaceBrowser guide={guide} />;
  if (route[0] === 'races') return <RaceBrowser guide={guide} />;
  if (route[0] === 'race' && route[1] && route[2] === 'questionnaire') {
    return <Questionnaire guide={guide} raceId={route[1]} />;
  }
  if (route[0] === 'race' && route[1]) return <RaceDetail guide={guide} raceId={route[1]} />;
  if (route[0] === 'vote') return <HowToVote guide={guide} />;
  return (
    <p>
      Page not found. <a href="#/">Back to the guide</a>
    </p>
  );
}
