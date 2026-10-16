export default {
  fetch() {
    return Response.json(
      { error: "This guide is no longer available." },
      { status: 410, headers: { "cache-control": "no-store" } }
    );
  }
};

// Retained only so Cloudflare can preserve the existing Durable Object migration.
export class DailyBudget {
  fetch() {
    return new Response("This guide is no longer available.", { status: 410 });
  }
}
