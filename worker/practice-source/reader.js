"use strict";
const library = JSON.parse(document.getElementById("library").textContent);
const byId = id => document.getElementById(id);
const group = byId("group");
const topic = byId("topic");
const focus = byId("focus");
const online = byId("online");
const query = byId("query");
const normalize = value => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
const moves = {
  evidence: "What observation would tell you where to look first?",
  alternate: "What other explanation fits this case, and how could you distinguish it?",
  test: "What would you need to see before calling the result verified?"
};
const localMove = { diagnose: "alternate", verify: "test", explain: "evidence" };
let card, pending, timeout;
function cancelCoach() {
  pending = null;
  clearTimeout(timeout);
  online.disabled = false;
  byId("coach").textContent = "";
}
function render() {
  card = library.cards.find(item => item.id === topic.value);
  for (const [id, field] of Object.entries({area:"group", title:"title", principle:"principle", practice:"practice", case:"example", test:"check"})) {
    byId(id).textContent = card[field];
  }
  const [label, url] = library.references[card.ref];
  byId("ref").textContent = label;
  byId("ref").href = url;
  byId("example").open = byId("check").open = false;
  cancelCoach();
}
function topics(selected) {
  topic.replaceChildren(...library.cards.filter(item => item.group === group.value).map(item => new Option(item.title, item.id)));
  if (selected) topic.value = selected;
  render();
}
for (const label of new Set(library.cards.map(item => item.group))) group.add(new Option(label));
topics();
group.addEventListener("change", () => { byId("feedback").textContent = ""; topics(); });
topic.addEventListener("change", () => { byId("feedback").textContent = ""; render(); });
focus.addEventListener("change", cancelCoach);
function findLesson() {
  const phrase = " " + normalize(query.value) + " ";
  query.value = "";
  const matches = library.cards.map(item => {
    const words = [item.title, ...item.aliases].map(normalize).filter(term => phrase.includes(" " + term + " "));
    return {item, score: words.reduce((best, word) => Math.max(best, word.length), 0)};
  }).filter(match => match.score).sort((a,b) => b.score - a.score);
  if (!matches.length || matches[0].score === matches[1]?.score) {
    byId("feedback").textContent = "Choose an area and lesson below, or try a term such as HLS, RAG or caption drift. This guide covers methods and fictional examples.";
    return;
  }
  const next = matches[0].item;
  group.value = next.group;
  topics(next.id);
  byId("feedback").textContent = "Selected lesson · " + next.title;
}
byId("find").addEventListener("click", findLesson);
query.addEventListener("keydown", event => {if (event.key === "Enter") {event.preventDefault(); findLesson();}});
function coach(move, label) {
  byId("example").open = true;
  byId("coach").textContent = label + " · " + moves[move] + " Use the fictional example above, then open “How to tell it worked” to compare.";
}
byId("local").addEventListener("click", () => {cancelCoach(); coach(localMove[focus.value], "Practice question");});
if (window.parent !== window) {
  window.addEventListener("message", event => {
    if (event.source !== window.parent || !event.data) return;
    const msg = event.data;
    if (msg.type === "practice-guide-enabled") {
      online.hidden = false;
      byId("disclosure").hidden = false;
    }
    if (msg.type !== "practice-guide-result" || !pending || msg.key !== pending) return;
    cancelCoach();
    if (Object.hasOwn(moves, msg.move)) coach(msg.move, "AI-selected question");
    else coach(localMove[focus.value], "Offline practice question");
  });
  window.parent.postMessage({type:"practice-guide-ready"}, "*");
}
online.addEventListener("click", () => {
  cancelCoach();
  pending = crypto.randomUUID();
  online.disabled = true;
  byId("coach").textContent = "Choosing a practice question…";
  window.parent.postMessage({type:"practice-guide-request", key:pending, topicId:card.id, focus:focus.value}, "*");
  timeout = setTimeout(() => {cancelCoach(); coach(localMove[focus.value], "Offline practice question");}, 7000);
});
