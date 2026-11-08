/* CyStation page-view counting: OFF until a GoatCounter code is set below.
 *
 * GoatCounter is free for personal sites, sets no cookies and stores no personal data.
 * To switch it on:
 *   1. Create a site at https://www.goatcounter.com (pick a code, e.g. "cystation").
 *   2. Put that code in GOATCOUNTER_CODE below and publish this file.
 *   3. In privacy.html, replace the "Analytics" paragraph with the one marked
 *      "when analytics is on" in the comment there.
 * It only runs on cystation.neocities.org, so local previews are never counted,
 * and it respects the browser's Do Not Track setting.
 */
(() => {
  const GOATCOUNTER_CODE = '';
  if (!GOATCOUNTER_CODE || location.hostname !== 'cystation.neocities.org') return;
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://gc.zgo.at/count.js';
  script.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`;
  document.head.append(script);
})();
