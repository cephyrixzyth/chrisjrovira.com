const cuts = [
  [
    {end:4, shot:'wide', caption:'0–4 seconds. The wide frame introduces all three objects.'},
    {end:6, shot:'wheel', caption:'4–6 seconds. The wheel fills the frame.'},
    {end:8, shot:'prism', caption:'6–8 seconds. Light passes through the prism.'}
  ],
  [
    {end:2, shot:'wheel', caption:'0–2 seconds. The wheel fills the frame.'},
    {end:4, shot:'prism', caption:'2–4 seconds. Light passes through the prism.'},
    {end:8, shot:'wide', caption:'4–8 seconds. The wide frame reveals how the objects connect.'}
  ]
];
const descriptions = {wide:'A film strip connects an editing wheel to a prism.', wheel:'A close view of the editing wheel.', prism:'A close view of the glass prism.'};
const frames = [...document.querySelectorAll('.frame')];
const time = document.querySelector('#time');
const play = document.querySelector('#play');
let animation = 0;
let start = 0;
function setTime(value) {
  time.value = Math.min(8, Math.max(0, value));
  const seconds = Number(time.value);
  document.querySelector('#elapsed').textContent = seconds + ' seconds';
  time.setAttribute('aria-valuetext', seconds + ' seconds');
  cuts.forEach((sequence, i) => {
    const cut = sequence.find(record => seconds < record.end) || sequence.at(-1);
    const frame = frames[i];
    frame.className = 'frame ' + cut.shot;
    frame.firstElementChild.alt = descriptions[cut.shot];
    frame.nextElementSibling.textContent = cut.caption;
  });
}
function pause() {
  cancelAnimationFrame(animation);
  animation = 0;
  play.textContent = Number(time.value) === 8 ? 'Replay both edits' : 'Play both edits';
}
function tick(now) {
  setTime((now - start) / 1000);
  if (Number(time.value) >= 8) pause();
  else animation = requestAnimationFrame(tick);
}
play.addEventListener('click', () => {
  if (animation) return pause();
  if (Number(time.value) === 8) setTime(0);
  start = performance.now() - Number(time.value) * 1000;
  play.textContent = 'Pause both edits';
  animation = requestAnimationFrame(tick);
});
function seek(value) {
  setTime(value);
  pause();
}
time.addEventListener('input', () => seek(time.value));
document.querySelector('#next').addEventListener('click', () => seek(Math.floor(Number(time.value)) + 1));
document.querySelector('#previous').addEventListener('click', () => seek(Math.ceil(Number(time.value)) - 1));
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
document.querySelector('#transport').hidden = false;
