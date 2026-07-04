import { useEffect, useState } from 'react';

// Hash routing only: GitHub Pages project sites 404 on path refresh.
// '#/race/governor' -> ['race', 'governor'], '#/' or '' -> [].
export function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash.replace(/^#\/?/, '').split('/').filter(Boolean);
}
