// Standard WPR iframe pattern: post the document height to the parent
// page so the WordPress embed can resize the iframe. See EMBED.md.
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
  window.addEventListener('hashchange', () => setTimeout(post, 50));
  post();
}
