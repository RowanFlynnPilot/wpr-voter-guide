# Embedding the Voter Guide in WordPress

Standard WPR iframe pattern: the guide posts its rendered height to the
parent page, and a small script on the WordPress side resizes the iframe
so there is never an inner scrollbar.

## Snippet

Paste this into a Custom HTML block on the WordPress page:

```html
<iframe
  id="wpr-voter-guide"
  src="https://rowanflynnpilot.github.io/wpr-voter-guide/"
  style="width: 100%; border: 0; display: block;"
  height="900"
  title="Voter Guide — Wisconsin Partisan Primary, August 11, 2026"
></iframe>
<script>
  window.addEventListener('message', function (event) {
    if (event.origin !== 'https://rowanflynnpilot.github.io') return;
    if (!event.data) return;
    var frame = document.getElementById('wpr-voter-guide');
    if (event.data.type === 'wpr-guide-height') {
      frame.height = event.data.height;
    }
    if (event.data.type === 'wpr-guide-nav') {
      // Reader navigated inside the guide; if they were scrolled deep
      // into the previous view, bring them back to the guide's top.
      if (frame.getBoundingClientRect().top < 0) {
        frame.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
</script>
```

## How it works

- The app (src/embed.js) watches its own document height with a
  ResizeObserver and posts `{ type: 'wpr-guide-height', height }` to the
  parent whenever it changes — on load, on every view change, and when
  results rows grow on election night.
- On every in-guide navigation it also posts `{ type: 'wpr-guide-nav' }`.
  Because the iframe is sized to its content, a reader who taps a race at
  the bottom of a long list would otherwise stay scrolled deep into the
  page on the new view; the parent script scrolls the guide's top back
  into view only when needed.
- The WordPress script checks the message origin against the GitHub Pages
  host, then sets the iframe height or scrolls. Nothing else is accepted
  or executed.
- The `height="900"` attribute is only the pre-JavaScript fallback size.

## Notes

- Deep links work: append a hash route to the src to open a specific view,
  e.g. `.../wpr-voter-guide/#/vote` for the how-to-vote page.
- On election night no embed change is needed — the same iframe flips to
  results mode when `results.enabled` goes true.
- The /print and /newsletter routes are internal tools; don't embed them.
