/*
 * Cloudflare Web Analytics loader.
 * Set SITE_ANALYTICS_TOKEN to a token created for this site in Cloudflare.
 * Do not reuse the Oneirodex token: that would combine the two sites' traffic.
 */
(() => {
  const token = window.SITE_ANALYTICS_TOKEN || "";
  if (!token || token === "CHRISJROVIRA_COM_TOKEN") return;

  const beacon = document.createElement("script");
  beacon.type = "module";
  beacon.src = "https://static.cloudflareinsights.com/beacon.min.js";
  beacon.dataset.cfBeacon = JSON.stringify({ token });
  document.head.append(beacon);
})();
