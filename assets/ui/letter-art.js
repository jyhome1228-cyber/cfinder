// User-provided 3D letter assets. Source: Nineworks Database CDN, 2026-11-24.
// Keep the original files unchanged. A text glyph remains as the offline fallback.
export const LETTER_IMAGES = Object.freeze({
  C: 'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261124-024618-0c11e54c-dd03-4f52-9700-318ed54c609f-a6a74dbc.webp',
  R: 'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261124-024619-7b23eb63-09b7-4d97-8bed-12097d502d14-7090be79.webp',
  A: 'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261124-024619-616dc5dc-641f-4a0c-a772-0daa134ed562-53594178.webp',
  S: 'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261124-024620-a26a0c82-950d-4b52-98c6-d2e180745b62-b9b060b7.webp',
  E: 'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261124-024620-ca5705ec-2d8b-4299-baa2-360420d168e1-37f02b9f.webp',
  I: 'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261124-024621-d639aa79-018f-4288-be3c-c55cf53799d8-9ec01071.webp'
});

export function letterArt(code, variant = 'card', eager = false) {
  if (!Object.hasOwn(LETTER_IMAGES, code)) return '';
  return `<span class="cf-letter cf-letter--${variant}" data-letter-code="${code}" aria-hidden="true">
    <img class="cf-letter-img" data-letter-asset src="${LETTER_IMAGES[code]}" alt="" width="320" height="320" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''}>
    <span class="cf-letter-fallback">${code}</span>
  </span>`;
}
