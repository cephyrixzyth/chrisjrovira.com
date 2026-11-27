import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const source = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(source, '../..');
globalThis.window = {};
await import('../../content.js');
const { projects, stories, experience, skills, credentials } = window.PORTFOLIO_CONTENT;
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[char]);
const pad = number => String(number).padStart(2, '0');
const tags = (values, tag) => values.map(value => `<${tag}>${escape(value)}</${tag}>`).join('');
const visuals = {
  'stream-visual': '<div class="visual-pills"><span>READINESS</span><span>PARTNERS</span><span>DELIVERY</span></div><div class="visual-monitor">' + '<i></i>'.repeat(11) + '</div>',
  'library-visual': '<div class="mini-library"><span>✳</span><span>◉</span><span>✦</span><span>◈</span><span>⌁</span></div><div class="library-label mono">ONEIRODEX / HOME LIBRARY</div>',
  'website-visual': '<div class="web-preview"><span class="web-preview-nav"></span><span class="web-preview-title"></span><span class="web-preview-title web-preview-title-short"></span><span class="web-preview-button"></span><span class="web-preview-shot"><i></i><i></i><i></i></span></div><div class="library-label mono">ONEIRODEX WEBSITE</div>',
  'audio-visual': '<div class="mini-wave">' + [28,52,36,70,44,86,58,40,74,48,30,62,38,22].map(h => `<i style="height:${h}%"></i>`).join('') + '</div><div class="library-label mono">AUDIOTHECA / AUDIO LIBRARY</div>',
  'launch-visual': '<div class="launch-visual-lines"><span>01 / INGEST</span><span>02 / PREPARE</span><span>03 / PLAY</span></div><div class="launch-spark">✳</div>'
};
function projectCard(project, index) {
  return `<article class="project-card ${project.featured ? 'project-featured' : ''}" data-category="${escape(project.category)}">
    <div class="project-visual ${escape(project.visual || '')}" aria-hidden="true">
      <div class="visual-grid"></div><div class="visual-mark">${escape(project.mark || '')}</div>
      <span class="visual-number mono">${pad(index+1)} / ${pad(projects.length)}</span>${visuals[project.visual] || ''}
    </div><div class="project-body">
      <div class="project-eyebrow mono"><span></span>${escape(project.eyebrow)}</div>
      <h3>${escape(project.title)}</h3><p>${escape(project.description)}</p>
      <div class="tag-row">${tags(project.tags, 'span')}</div>
      <a class="project-link" href="${escape(project.href)}">${escape(project.linkLabel)} <span aria-hidden="true">↗</span></a>
    </div></article>`;
}
function chapterLink(story, index) {
  return `<a class="story-index-item" data-story-index="${index}" id="entry-${escape(story.id)}" href="#chapter-${escape(story.id)}"><span class="story-index-number mono">${pad(index+1)}</span>
    <span class="story-index-copy"><strong>${escape(story.shortTitle)}</strong><span>${escape(story.eyebrow)}</span></span><span class="story-index-arrow" aria-hidden="true">↗</span></a>`;
}
function media(story) {
  const asset = story.media;
  if (!asset?.src) return '';
  if (asset.type === 'video') {
    const captions = asset.captions ? `<track kind="captions" src="${escape(asset.captions)}" srclang="en" label="English" default>` : '';
    const poster = asset.poster ? ` poster="${escape(asset.poster)}"` : '';
    return `<video controls playsinline preload="metadata"${poster}><source src="${escape(asset.src)}">${captions}</video>`;
  }
  if (asset.type === 'embed') return `<iframe src="${escape(asset.src)}" title="${escape(story.title)}" loading="lazy" allowfullscreen></iframe>`;
  return '';
}
function chapter(story) {
  const links = (story.links || []).map(link => `<a href="${escape(link.url)}">${escape(link.label)}</a>`).join(' ');
  return `<article class="story-detail" id="chapter-${escape(story.id)}" tabindex="-1">
    <div class="story-detail-top"><p class="eyebrow">${escape(story.eyebrow)}</p><p class="story-highlight">${escape(story.highlight)}</p></div>
    <h3>${escape(story.title)}</h3><div class="story-detail-copy">${tags(story.paragraphs, 'p')}</div>
    ${links ? '<div class="story-detail-links">' + links + '</div>' : ''}${media(story)}
    <a class="chapter-return" href="#entry-${escape(story.id)}">Back to chapter list</a></article>`;
}
function role(item, index) {
  return `<article class="timeline-item ${item.current ? 'is-current' : ''}">
    <div class="timeline-rail" aria-hidden="true"><span class="timeline-dot"></span>${index < experience.length-1 ? '<span class="timeline-stem"></span>' : ''}</div>
    <div class="timeline-content"><div class="timeline-top"><span class="timeline-date mono">${escape(item.dates)}</span></div>
    <h3>${escape(item.company)}</h3><div class="timeline-role">${escape(item.title)}</div><p>${escape(item.summary)}</p>
    <details class="timeline-details"><summary>What that looked like <span aria-hidden="true">+</span></summary><ul>${tags(item.points, 'li')}</ul></details></div></article>`;
}
function render(file, context) {
  return fs.readFileSync(path.join(source, file), 'utf8').replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in context)) throw Error('Unknown template field ' + key);
    return context[key];
  }).replace(/^[ \t]+$/gm, '');
}
const home = render('home.html', {
  projects: projects.map(projectCard).join('\n'), all: pad(projects.length),
  streaming: pad(projects.filter(p => p.category === 'streaming').length), building: pad(projects.filter(p => p.category === 'building').length),
  storyIndex: stories.map(chapterLink).join('\n'), stories: stories.map(chapter).join('\n'),
  experience: experience.map(role).join('\n'), skills: tags(skills, 'span'), credentials: tags(credentials,'li')
});
const resume = render('resume.html', {
  roles: experience.map(item => `<article><h3>${escape(item.title)}</h3><p class="period"><strong>${escape(item.company)}</strong> · ${escape(item.dates)}</p><p>${escape(item.summary)}</p><ul>${tags(item.points, 'li')}</ul></article>`).join('\n'),
  skills: escape(skills.join(' · ')), credentials: tags(credentials, 'li')
});
const brief = JSON.parse(fs.readFileSync(path.join(source,'interview.json'),'utf8'));
const topics = Object.entries(brief.topics);
const durations = Object.entries(brief.minutes);
for (const [total, allocation] of durations) {
  if (allocation.length !== 3 || allocation.some(n => !Number.isInteger(n) || n < 1) || allocation.reduce((a,b) => a+b,0) !== Number(total)) throw Error('Invalid interview allocation for ' + total);
}
for (const [id, topic] of topics) {
  if (topic.questions.length !== brief.steps.length || new URL(topic.source.url).protocol !== 'https:') throw Error('Review interview topic ' + id);
}
const [, defaultTopic] = topics[0], [duration,allocation] = durations[0];
const options = entries => entries.map(([value,label]) => `<option value="${escape(value)}">${escape(label)}</option>`).join('\n');
const agenda = `<h2>${escape(defaultTopic.title)} · ${duration} minutes</h2><p class="intro">${escape(defaultTopic.context)}</p>
  <ol>${defaultTopic.questions.map((q,i) => `<li><h3>${allocation[i]} min · ${escape(brief.steps[i])}</h3><p>${escape(q)}</p></li>`).join('')}</ol>
  <div class="end"><h3>Reading for the conversation</h3><a href="${escape(defaultTopic.source.url)}">${escape(defaultTopic.source.label)}</a></div>`;
const interview = render('interview.html', {
  agenda, settings:JSON.stringify(brief).replaceAll('<','\\u003c'),
  topics:options(topics.map(([k,t])=>[k,t.title])), minutes:options(durations.map(([k])=>[k,k+' minutes']))
});
for (const [file, html] of Object.entries({'index.html':home,'resume/index.html':resume,'interview/index.html':interview})) {
  const destination = path.join(root,file);
  if (process.argv.includes('--check')) {
    if (html !== fs.readFileSync(destination,'utf8')) throw Error('Rebuild ' + file);
  } else {
    fs.writeFileSync(destination,html);
  }
}
