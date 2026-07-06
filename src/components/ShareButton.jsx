import { useState } from 'react';
import { guideUrl } from '../urls.js';

// "Bookmark" the modern way: native share sheet on phones (which includes
// add-bookmark / reading list / home screen), clipboard copy on desktop,
// prompt as the last resort in locked-down iframe contexts.
export default function ShareButton({ instance, election }) {
  const [copied, setCopied] = useState(false);
  const url = guideUrl(instance);

  const share = async () => {
    const title = `Voter Guide — ${election.name}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // reader closed the sheet
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link to save the guide:', url);
    }
  };

  return (
    <button className="share-button" onClick={share}>
      {copied ? 'Link copied ✓' : 'Share'}
    </button>
  );
}
