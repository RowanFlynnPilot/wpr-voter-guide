import { useState } from 'react';
import { guideUrl } from '../urls.js';

// "Bookmark" the modern way: native share sheet on phones (which includes
// add-bookmark / reading list / home screen), clipboard copy on desktop,
// prompt as the last resort in locked-down iframe contexts.
// `path` deep-links a view (e.g. "#/race/governor") — the embed script
// forwards the published page's hash into the iframe, so these links
// land on the right view there too.
export default function ShareButton({ instance, election, path = '', label = 'Share', title }) {
  const [copied, setCopied] = useState(false);
  const url = guideUrl(instance) + path;

  const share = async () => {
    const shareTitle = title ?? `Voter Guide — ${election.name}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url });
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
      {copied ? 'Link copied ✓' : label}
    </button>
  );
}
