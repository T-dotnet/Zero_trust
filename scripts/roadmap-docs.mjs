import {applyDocumentPalette} from './mvp-document-theme.mjs';
import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Marked, lexer} from 'marked';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const roadmapSource = readFileSync(path.join(root, 'docs/post-mvp-roadmap.md'), 'utf8');
const tokens = lexer(roadmapSource);
export const escapeHtml = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const slug = text => text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

function tableAfter(heading) {
  const at = tokens.findIndex(token => token.type === 'heading' && token.text === heading);
  if (at < 0) throw new Error(`Missing roadmap heading: ${heading}`);
  const table = tokens.slice(at + 1).find(token => token.type === 'table' || token.type === 'heading');
  if (table?.type !== 'table') throw new Error(`Missing roadmap table: ${heading}`);
  return table.rows.map(row => Object.fromEntries(row.map((cell, i) => [table.header[i].text, cell.text])));
}
const releases = tableAfter('Roadmap overview').map(row => ({
  name: row.Release, outcome: row['User outcome'], scope: row['Proposed scope'], gate: row['Exit decision'],
}));
const features = tableAfter('Prioritized post MVP features').map(row => {
  const label = row['Rank and feature'];
  const rank = Number(label.match(/^\d+/)?.[0]);
  if (!rank) throw new Error(`Invalid roadmap feature: ${label}`);
  return {rank, name: label.replace(/^\d+\s+/, ''), why: row['Why add it'], scope: row['First useful release slice'], release: row['Release group']};
});
const links = JSON.parse(readFileSync(path.join(root, 'docs/mvp/roadmap-links.json'), 'utf8'));
const atlas = JSON.parse(readFileSync(path.join(root, 'docs/mvp/user-flows.json'), 'utf8'));
const journey = JSON.parse(readFileSync(path.join(root, 'docs/mvp/customer-journey.json'), 'utf8'));
for (const [kind, ids] of [['flows', atlas.journeys.map(flow => flow.id)], ['stages', journey.stages.map(stage => stage.id)]]) {
  for (const id of ids) if (!Array.isArray(links[kind][id])) throw new Error(`Missing roadmap mapping: ${id}`);
  for (const [id, ranks] of Object.entries(links[kind])) {
    if (!ids.includes(id)) throw new Error(`Unknown roadmap ${kind}: ${id}`);
    for (const rank of ranks) if (!features.some(feature => feature.rank === rank)) throw new Error(`Unknown feature ${rank} at ${id}`);
  }
}
export const roadmap = {title: 'Post MVP product roadmap', href: 'post-mvp-roadmap.html', releases, features, links};
export function roadmapLinks(kind, id) {
  const ranks = links[kind][id];
  if (!ranks) throw new Error(`Unknown roadmap mapping ${kind}: ${id}`);
  return ranks.map(rank => features.find(feature => feature.rank === rank));
}
export function roadmapMarkdown(kind, rows) {
  return [
    '## Post MVP roadmap', '',
    'Proposed improvements are grouped by priority, dependencies and release criteria. They are not implemented screens or committed delivery dates. All four pipeline reviews and separate author publication remain required.', '',
    '[Read the full product roadmap](../post-mvp-roadmap.md) · [Open the published roadmap](https://zero-trust-git-mvp-t-dotnets-projects.vercel.app/post-mvp-roadmap.html)', '',
    '| Release group | Outcome |', '| --- | --- |', ...releases.map(release => `| ${release.name} | ${release.outcome} |`), '',
    '| Current journey | Planned improvements |', '| --- | --- |',
    ...rows.map(row => `| ${row.id} · ${row.title} | ${roadmapLinks(kind, row.id).map(feature => `${feature.rank}. ${feature.name} (${feature.release})`).join('; ') || 'Preserve the guided demo and recovery behavior while completing the G0 pilot release gates.'} |`), '',
    'Mappings: [roadmap links](roadmap-links.json). Scope and release gates: [canonical roadmap](../post-mvp-roadmap.md).', '',
  ];
}
export function roadmapSummaryHtml() {
  return `<p class="roadmap-label">Planned improvements</p><h2>Post MVP product roadmap</h2><p>Priorities and dependencies guide progression. These are proposed additions; the existing MVP screens remain documented above.</p><div class="roadmap-releases">${releases.map(release => `<article><h3>${escapeHtml(release.name)}</h3><p>${escapeHtml(release.outcome)}</p><p>${escapeHtml(release.scope)}</p></article>`).join('')}</div><p><a href="post-mvp-roadmap.html">Read priorities, dependencies and release criteria →</a></p>`;
}
roadmap.summaryHtml = roadmapSummaryHtml();

function docHref(href) {
  if (/^(https?:|#)/.test(href)) return href;
  if (/^[a-z]+:/i.test(href)) return '#';
  const [file, anchor] = href.split('#');
  const published = {'mvp/customer-journey.md':'mvp-customer-journey.html','mvp/screen-flows.md':'mvp-flows.html','post-mvp-roadmap.md':'post-mvp-roadmap.html'};
  if (published[file]) return published[file] + (anchor ? `#${anchor}` : '');
  const repoPath = path.posix.normalize(path.posix.join('docs', file));
  return `https://github.com/T-dotnet/Zero_trust/blob/mvp/${repoPath}${anchor ? `#${anchor}` : ''}`;
}
const markdown = new Marked({gfm:true, renderer:{
  heading({tokens, depth, text}) {
    return `<h${depth} id="${slug(text)}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
  },
  link({href, title, tokens}) {
    return `<a href="${escapeHtml(docHref(href))}"${title ? ` title="${escapeHtml(title)}"` : ''}>${this.parser.parseInline(tokens)}</a>`;
  },
  table({header, rows}) {
    const heading = header.map(cell => cell.text);
    const isFeatures = heading[0] === 'Rank and feature';
    const body = rows.map(row => {
      const id = isFeatures ? ` id="feature-${row[0].text.match(/^\d+/)[0]}"` : '';
      return `<tr role="row"${id}>${row.map((cell,i) => `<td role="cell" data-label="${escapeHtml(heading[i])}">${this.parser.parseInline(cell.tokens)}</td>`).join('')}</tr>`;
    }).join('');
    return `<table role="table"><thead role="rowgroup"><tr role="row">${header.map(cell => `<th scope="col">${this.parser.parseInline(cell.tokens)}</th>`).join('')}</tr></thead><tbody role="rowgroup">${body}</tbody></table>`;
  },
}});
export function buildRoadmapPage() {
  const content = markdown.parse(roadmapSource);
  const toc = tokens.filter(token => token.type === 'heading' && token.depth === 2).map(token => `<a href="#${slug(token.text)}">${escapeHtml(token.text)}</a>`).join('');
  const template = applyDocumentPalette(readFileSync(path.join(root, 'scripts/post-mvp-roadmap-viewer.html'), 'utf8'));
  writeFileSync(path.join(root, 'public/post-mvp-roadmap.html'), template.replace('<!--__TOC__-->', toc).replace('<!--__ROADMAP__-->', content));
  writeFileSync(path.join(root, 'public/post-mvp-roadmap.md'), roadmapSource);
  console.log(`Roadmap built from canonical Markdown: ${features.length} priorities, ${releases.length} release groups; no delivery timeline.`);
}
