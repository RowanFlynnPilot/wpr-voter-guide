// The guide's canonical public URL. Once the guide is embedded on a
// published WordPress page, publication.guide_url in instance.json holds
// that permalink; until then, fall back to wherever the app is running.
// Consumed by the share button, /print footer, /newsletter CTA, and the
// my-ballot footer, so flipping the config updates them all.
export function guideUrl(instance) {
  return instance.publication.guide_url || window.location.origin + window.location.pathname;
}
