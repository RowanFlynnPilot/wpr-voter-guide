// "My ballot" picks live ONLY in the reader's browser (localStorage) —
// no accounts, no tracking, nothing leaves the device. If storage is
// unavailable (locked-down iframe contexts), picks still work for the
// session in memory; they just don't persist.
import { useEffect, useReducer } from 'react';

let storageKey = null;
let picks = [];
const listeners = new Set();

function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(picks));
  } catch {
    // storage unavailable — in-memory only
  }
}

// Called once at boot with the loaded guide; drops stale ids so picks
// survive roster corrections without pointing at removed candidates.
export function initMyBallot(guide) {
  storageKey = `wpr-voter-guide:myballot:${guide.instance.election}`;
  const validIds = new Set(
    guide.ballot.races.flatMap((r) => r.primaries).flatMap((p) => p.candidates).map((c) => c.id)
  );
  let stored = [];
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    if (Array.isArray(raw)) stored = raw;
  } catch {
    // unreadable storage — start empty
  }
  picks = stored.filter((id) => validIds.has(id));
}

export function togglePick(id) {
  picks = picks.includes(id) ? picks.filter((p) => p !== id) : [...picks, id];
  persist();
  listeners.forEach((notify) => notify());
}

export function clearPicks() {
  picks = [];
  persist();
  listeners.forEach((notify) => notify());
}

export function useMyBallot() {
  const [, force] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    listeners.add(force);
    return () => listeners.delete(force);
  }, []);
  return picks;
}
