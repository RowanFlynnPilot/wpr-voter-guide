// Standard WPR iframe pattern: post the document height to the parent
// page so the WordPress embed can resize the iframe, and announce view
// changes so the parent can scroll back to the guide's top. See EMBED.md.
export function startHeightReporting() {
  if (window.parent === window) return; // not embedded

  let last = 0;
  const post = () => {
    const height = document.documentElement.scrollHeight;
    if (height !== last) {
      last = height;
      window.parent.postMessage({ type: 'wpr-guide-height', height }, '*');
    }
  };

  new ResizeObserver(post).observe(document.documentElement);
  window.addEventListener('hashchange', () => {
    // The iframe is sized to its content, so in-app scrollTo can't help a
    // reader who navigated from the bottom of a long view — the parent
    // page must scroll. It decides whether to act (see EMBED.md).
    window.parent.postMessage({ type: 'wpr-guide-nav' }, '*');
    setTimeout(post, 50);
  });
  post();
}
