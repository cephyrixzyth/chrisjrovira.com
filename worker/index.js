import lessons from "./practice-source/coach-library.json" with { type: "json" };

const cards = new Map(lessons.map(card => [card.id, card]));
const goals = new Set(["diagnose", "verify", "explain"]);
const moves = new Set(["evidence", "alternate", "test"]);
const MAX_BODY_BYTES = 256;
const DAILY_LIMIT = 100;
const MODEL = "@cf/zai-org/glm-4.7-flash";
const origins = new Set(["https://chrisjrovira.com", "https://www.chrisjrovira.com", "http://localhost:8000", "http://127.0.0.1:8000"]);

function reply(origin, status, data) {
  const headers = {"Content-Type":"application/json", "Cache-Control":"no-store", "Vary":"Origin", "X-Content-Type-Options":"nosniff"};
  if (origins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "content-type";
  }
  return new Response(data ? JSON.stringify(data) : null, {status, headers});
}
async function smallJson(request) {
  if (!request.body) throw new Error("empty");
  const reader = request.body.getReader();
  const bytes = new Uint8Array(MAX_BODY_BYTES);
  let size = 0;
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      if (size + value.length > bytes.length) {
        await reader.cancel();
        throw new Error("oversize");
      }
      bytes.set(value, size);
      size += value.length;
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(new TextDecoder("utf-8", {fatal:true}).decode(bytes.subarray(0, size)));
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const path = new URL(request.url).pathname;
    if (origin && !origins.has(origin)) return reply(origin, 403, {error:"Unavailable here."});
    if (request.method === "OPTIONS") return reply(origin, origins.has(origin) ? 204 : 403);
    if (path === "/api/chat") return reply(origin, 410, {error:"This chat has retired. Reload the site to open the practice guide."});
    if (path === "/api/health" && request.method === "GET") return reply(origin, 200, {ok:true, mode:"topic-coach-v1"});
    if (path !== "/api/coach" || request.method !== "POST") return reply(origin, 404, {error:"Unknown route."});
    if (!origins.has(origin)) return reply(origin, 403, {error:"Unavailable here."});
    if ((request.headers.get("content-type") || "").split(";")[0].trim().toLowerCase() !== "application/json")
      return reply(origin, 415, {error:"Use a JSON selection."});
    let choice;
    try {choice = await smallJson(request);} catch {return reply(origin, 400, {error:"Invalid selection."});}
    if (!choice || Array.isArray(choice) || typeof choice !== "object" || Object.keys(choice).length !== 2 ||
      !cards.has(choice.topicId) || !goals.has(choice.focus)) return reply(origin, 400, {error:"Invalid selection."});
    if (!env.AI || !env.BUDGET) return reply(origin, 503, {error:"Use the local exercise."});
    const card = cards.get(choice.topicId);
    try {
      const quota = env.BUDGET.get(env.BUDGET.idFromName("practice-coach-global"));
      const reserved = await quota.fetch("https://counter.invalid/reserve", {method:"POST"});
      if (!reserved.ok) return reply(origin, reserved.status === 429 ? 429 : 503, {error:"Use the local exercise."});
      const packet = {goal:choice.focus, lesson:card.title, method:card.practice, fictionalCase:card.example, success:card.check};
      const result = await env.AI.run(MODEL, {
        messages:[
          {role:"system", content:"Choose one practice move for the teaching goal and fictional case. evidence asks for the first observation, alternate asks for a competing explanation, test asks what would verify the result. Return exactly one word: evidence, alternate or test."},
          {role:"user", content:JSON.stringify(packet)}
        ], temperature:0, max_completion_tokens:240, reasoning_effort:"low", stream:false
      });
      const raw = typeof result?.response === "string" ? result.response : result?.choices?.[0]?.message?.content;
      const move = typeof raw === "string" ? raw.trim().toLowerCase() : "";
      if (!moves.has(move)) return reply(origin, 502, {error:"Use the local exercise."});
      return reply(origin, 200, {move});
    } catch {return reply(origin, 503, {error:"Use the local exercise."});}
  }
};
// Preserve the deployed class and migration. The new instance counts global reservations only.
export class DailyBudget {
  constructor(ctx) {this.ctx = ctx;}
  async fetch(request) {
    if (request.method !== "POST" || new URL(request.url).pathname !== "/reserve") return new Response(null, {status:404});
    const date = new Date().toISOString().slice(0, 10);
    const allowed = await this.ctx.storage.transaction(async tx => {
      const last = await tx.get("global-count");
      const count = last?.date === date ? last.count : 0;
      if (count >= DAILY_LIMIT) return false;
      await tx.put("global-count", {date, count:count + 1});
      return true;
    });
    return new Response(null, {status:allowed ? 204 : 429});
  }
}
