// Optional live coaching bridge. The guide itself has an opaque origin and cannot fetch.
(() => {
  const frame = document.getElementById("practice-reader");
  const endpoint = window.PRACTICE_COACH_ENDPOINT;
  if (!frame || !endpoint) return;
  const topics = new Set(["playlist", "renditions", "captions", "audio-selection", "triage", "recovery", "release", "handoff", "identity", "duration", "provenance", "availability", "continuity", "loudness", "descriptions", "delivery-qc", "keyboard", "print", "motion", "minimization", "retrieval", "ranking", "evaluation", "training"]);
  const focuses = new Set(["diagnose", "verify", "explain"]);
  const moves = new Set(["evidence", "alternate", "test"]);
  const enabled = () => frame.contentWindow.postMessage({type:"practice-guide-enabled"}, "*");
  frame.addEventListener("load", enabled);
  enabled();
  window.addEventListener("message", async event => {
    if (event.source !== frame.contentWindow || event.origin !== "null") return;
    const msg = event.data;
    if (msg?.type === "practice-guide-ready") {enabled(); return;}
    if (msg?.type !== "practice-guide-request" || !topics.has(msg.topicId) || !focuses.has(msg.focus)) return;
    if (typeof msg.key !== "string" || !/^[0-9a-f-]{36}$/i.test(msg.key)) return;
    let move = null;
    try {
      const response = await fetch(endpoint, {
        method:"POST", credentials:"omit", referrerPolicy:"no-referrer", redirect:"error",
        headers:{"content-type":"application/json"}, signal:AbortSignal.timeout(6000),
        body:JSON.stringify({topicId:msg.topicId, focus:msg.focus})
      });
      if (response.ok) {
        const result = await response.json();
        if (moves.has(result.move)) move = result.move;
      }
    } catch { /* The reader supplies the local exercise when the endpoint is unavailable. */ }
    frame.contentWindow.postMessage({type:"practice-guide-result", key:msg.key, move}, "*");
  });
})();
