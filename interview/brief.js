const {topics, minutes, steps} = JSON.parse(document.querySelector('#settings').textContent);
const topicSelect = document.getElementById('topic');
const timeSelect = document.getElementById('minutes');
const result = document.getElementById('result');
function element(tag, text) {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}
function render(announce) {
  const topic = topics[topicSelect.value];
  const title = `${topic.title} · ${timeSelect.value} minutes`;
  const intro = element('p', topic.context);
  intro.className = 'intro';
  const items = document.createElement('ol');
  topic.questions.forEach((question,i) => {
    const item = document.createElement('li');
    item.append(element('h3', `${minutes[timeSelect.value][i]} min · ${steps[i]}`), element('p', question));
    items.append(item);
  });
  const reading = document.createElement('div');
  reading.className = 'end';
  const link = element('a', topic.source.label);
  link.href = topic.source.url;
  reading.append(element('h3','Reading for the conversation'),link);
  result.replaceChildren(element('h2',title),intro,items,reading);
  if (announce) document.getElementById('status').textContent = title;
}
function restore() {
  const params = new URLSearchParams(location.hash.slice(1));
  const topic = params.get('topic'), duration = params.get('minutes');
  topicSelect.value = Object.hasOwn(topics,topic) ? topic : topicSelect.options[0].value;
  timeSelect.value = Object.hasOwn(minutes,duration) ? duration : timeSelect.options[0].value;
  render(false);
}
restore();
document.getElementById('choices').hidden = false;
document.getElementById('actions').hidden = false;
for (const select of [topicSelect,timeSelect]) select.addEventListener('change', () => {
  const hash = new URLSearchParams({topic:topicSelect.value,minutes:timeSelect.value}).toString();
  try { history.replaceState(null, '', '#' + hash); }
  catch { location.hash = hash; }
  render(true);
});
window.addEventListener('hashchange',restore);
document.getElementById('print').addEventListener('click', () => window.print());
document.getElementById('save').addEventListener('click', () => {
  const topic = topics[topicSelect.value];
  const lines = [document.title, result.querySelector('h2').textContent, topic.context,''];
  topic.questions.forEach((question,i) => lines.push(`${minutes[timeSelect.value][i]} min · ${steps[i]}`,question,''));
  lines.push('Reading for the conversation',topic.source.label,topic.source.url);
  const url = URL.createObjectURL(new Blob([lines.join('\n')+'\n'],{type:'text/plain;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = `interview-${topicSelect.value}-${timeSelect.value}.txt`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
