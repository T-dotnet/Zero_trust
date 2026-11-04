import { colors, applyDocumentPalette } from './mvp-document-theme.mjs';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const model = JSON.parse(readFileSync(path.join(root, 'docs/mvp/user-flows.json'), 'utf8'));
const screens = new Map(model.screens.map(s => [s.id, s]));
const known = new Set([...screens.keys(), 'origin', 'self', 'external']);
const ids = new Set();
function unique(id) { if (ids.has(id)) throw Error(`Duplicate ID: ${id}`); ids.add(id); }
for (const s of model.screens) {
  unique(s.id);
  if (!s.stories.length || !s.layout.length || !s.actions.length) throw Error(`Incomplete screen ${s.id}`);
  for (const story of s.stories) { unique(story.id); if (!story.acceptance.length) throw Error(`No acceptance: ${story.id}`); }
  for (const source of s.source) if (!existsSync(path.join(root, 'src/mvp', source.split(':')[0]))) throw Error(`Missing source ${source}`);
  for (const a of s.actions) { unique(a.id); if (!known.has(a.to)) throw Error(`Unknown destination ${a.id}: ${a.to}`); }
}
for (const f of model.journeys) {
  unique(f.id);
  if (new Set(f.screens).size !== f.screens.length) throw Error(`Duplicate screen in ${f.id}`);
  for (const id of f.screens) if (!screens.has(id)) throw Error(`Unknown flow screen ${id}`);
  for (const [from,to] of f.edges) if (!f.screens.includes(from) || !f.screens.includes(to)) throw Error(`Invalid edge in ${f.id}: ${from} → ${to}`);
}
const reached = new Set(['S01']);
for (let changed=true;changed;) {
 changed=false;
 for (const id of [...reached]) for (const a of screens.get(id).actions) if (screens.has(a.to) && !reached.has(a.to)) { reached.add(a.to); changed=true; }
}
if (reached.size !== screens.size) throw Error(`Unreachable screens: ${[...screens.keys()].filter(id=>!reached.has(id))}`);
for (const s of model.screens) if (!model.journeys.some(f=>f.screens.includes(s.id))) throw Error(`No journey for ${s.id}`);
const html = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const dotString = s => JSON.stringify(String(s));
const base = `https://github.com/T-dotnet/Zero_trust/blob/${model.sourceCommit}/src/mvp/`;
const graphDir=path.join(root,'public/mvp-flow-docs/flows'); mkdirSync(graphDir,{recursive:true});
const graphs={};
for (const f of model.journeys) {
 const lines=['digraph flow {','graph [rankdir=LR, bgcolor="transparent", pad="0.25", nodesep="0.6", ranksep="1.05", splines=polyline, outputorder=edgesfirst];','node [shape=plain, fontname="Arial"];',`edge [color="${colors.slate}", fontcolor="${colors.body}", fontname="Arial", fontsize=12, arrowsize=0.75, penwidth=1.3];`];
 for (const id of f.screens) {
  const s=screens.get(id); const title=s.title.replace(' · ','<BR ALIGN="LEFT"/>');
  const label=`<TABLE BORDER="1" COLOR="${colors.line}" CELLBORDER="0" CELLSPACING="0" CELLPADDING="12" BGCOLOR="white"><TR><TD ALIGN="LEFT" WIDTH="260" BGCOLOR="${colors.primarySoft}"><FONT POINT-SIZE="12" COLOR="${colors.primaryDark}">${id} · ${html(s.kind)}</FONT></TD></TR><TR><TD ALIGN="LEFT"><FONT POINT-SIZE="16" COLOR="${colors.ink}"><B>${title.split('<BR ALIGN="LEFT"/>').map(html).join('<BR ALIGN="LEFT"/>')}</B></FONT></TD></TR>${s.layout.slice(0,3).map(x=>`<TR><TD ALIGN="LEFT"><FONT POINT-SIZE="12" COLOR="${colors.muted}">${html(x.length>52?x.slice(0,49)+'…':x)}</FONT></TD></TR>`).join('')}<TR><TD ALIGN="LEFT"><FONT POINT-SIZE="12" COLOR="${colors.primaryDark}">Open screen + user story →</FONT></TD></TR></TABLE>`;
  lines.push(`${id} [id="node-${id}", href="#screen=${id}&journey=${f.id}", tooltip=${dotString(s.title)}, label=<${label}>];`);
 }
 for (const [from,to,label] of f.edges) lines.push(`${from} -> ${to} [label=${dotString(label)}, tooltip=${dotString(label)}];`);
 lines.push('}'); const source=lines.join('\n')+'\n'; const dotPath=path.join(graphDir,`${f.id}.dot`); writeFileSync(dotPath,source);
 const svg=execFileSync('dot',['-Tsvg',dotPath],{encoding:'utf8'}).replace(/<\?xml[^>]*>\s*/,'').replace(/<!DOCTYPE[\s\S]*?>\s*/,'');
 writeFileSync(path.join(graphDir,`${f.id}.svg`),svg); graphs[f.id]=svg;
}
writeFileSync(path.join(root,'public/mvp-flow-docs/model.json'),JSON.stringify(model,null,2)+'\n');
const link = id => `[${id} · ${screens.get(id)?.title || id}](#${id.toLowerCase()})`;
const destination = a => a.to==='self'?'Same screen':a.to==='origin'?'Originating page / parent state':a.to==='external'?'Archived workspace (`/?view=full`)':link(a.to);
const cell = s=>String(s||'—').replaceAll('|','\\|').replaceAll('\n',' ');
const md=[`# ${model.title}`,'',`Reviewed ${model.reviewedAt} against MVP source [\`${model.sourceCommit.slice(0,7)}\`](https://github.com/T-dotnet/Zero_trust/tree/${model.sourceCommit}/src/mvp).`,'','[Open the clickable wireframes](https://zero-trust-git-mvp-t-dotnets-projects.vercel.app/mvp-flows.html) · [Download / open local HTML](../../public/mvp-flows.html) · [Canonical flow model](user-flows.json)','',`${model.screens.length} screen states · ${model.journeys.length} connected journeys · ${model.screens.reduce((n,s)=>n+s.actions.length,0)} action/transition entries · ${model.screens.reduce((n,s)=>n+s.stories.length,0)} attached user stories.`,'',model.scope,'','High-level companion: [Customer journey with real screenshots](customer-journey.md).','', '## How to read the wires','','A box is a page, dialog, step or meaningful state of an existing screen. Click a box in the interactive document to see its wireframe, actions and story. Wireframe action buttons navigate the documentation, not the live app. Diagrams show curated journey paths; the action tables below are the complete transition inventory. A wire may combine approval and a labelled role handoff; the intermediate waiting state is explicitly documented. “Same screen” covers filtering, validation, download, disclosure and simulation events. “Originating page” depends on where a dialog was opened.','','Wireframes are schematic representations of the implemented controls, not pixel-exact screenshots or proposed new screens. Story acceptance criteria describe current prototype behavior; they do not claim production security guarantees.','','## Personas','',model.personaEvidence,'','| Persona | Objective | Pain | Gain |','| --- | --- | --- | --- |',...model.personas.map(p=>`| ${p.name} | ${p.objective} | ${p.pain} | ${p.gain} |`),'','## Always-on feature and interaction contract','',...model.globalRules.map(x=>`- ${x}`),'','## Prototype boundaries','',...model.boundaries.map(x=>`- ${x}`),'','## Journey index','','| Journey | Goal |','| --- | --- |',...model.journeys.map(f=>`| [${f.id} · ${f.title}](#${f.id.toLowerCase()}) | ${f.goal} |`),'','## Connected journeys',''];
for (const f of model.journeys) {
 md.push(`<a id="${f.id.toLowerCase()}"></a>`,'',`### ${f.id} · ${f.title}`,'',f.goal,'',`**Entry:** ${f.entry}`,'',`**Completion:** ${f.done}`,'',`![${f.title} — connected screen wireframes](../../public/mvp-flow-docs/flows/${f.id}.svg)`,'',`[Editable Graphviz source](../../public/mvp-flow-docs/flows/${f.id}.dot) · [SVG](../../public/mvp-flow-docs/flows/${f.id}.svg)`,'','| From | Click / event | Next |','| --- | --- | --- |',...f.edges.map(([from,to,label])=>`| ${link(from)} | ${cell(label)} | ${link(to)} |`),'');
}
md.push('## Screen index','','| Screen | Surface | Roles | Story |','| --- | --- | --- | --- |',...model.screens.map(s=>`| ${link(s.id)} | ${s.kind} | ${cell(s.roles.join('; '))} | [${s.stories[0].id}](#${s.stories[0].id.toLowerCase()}) |`),'','## Screen-by-screen reference','');
for (const s of model.screens) {
 md.push(`<a id="${s.id.toLowerCase()}"></a>`,'',`### ${s.id} · ${s.title}`,'',`**Surface:** ${s.kind}. **Roles:** ${s.roles.join('; ')}.`,'',s.goal,'','**Wireframe content, top to bottom**','',...s.layout.map((x,i)=>`${i+1}. ${x}`),'');
 for (const story of s.stories) md.push(`#### ${story.id}`,'',story.text,'','Acceptance criteria:','',...story.acceptance.map(x=>`- ${x}`),'');
 if(s.parentScreens?.length) md.push(`**Parent screen actions remain available:** ${s.parentScreens.map(link).join(' · ')}. This is an inline panel within Run details.`, '');
 if(s.notes.length) md.push('Behavior and limits:','',...s.notes.map(x=>`- ${x}`),'');
 md.push('| ID | Click / event | Required condition | Next screen / state | Result |','| --- | --- | --- | --- | --- |',...s.actions.map(a=>`| ${a.id} | ${cell(a.label)} (${a.kind}) | ${cell(a.guard)} | ${destination(a)} | ${cell(a.outcome)} |`),'',`**Source:** ${s.source.map(src=>`[${src}](${base+src.split(':')[0]})`).join(' · ')}`,'');
}
md.push('## Coverage checklist','','| Feature area | Screen coverage |','| --- | --- |',...model.coverage.map(x=>`| ${x.area} | ${x.screens.map(link).join(', ')} |`),'','## Maintain this document','','Edit `docs/mvp/user-flows.json` for screen, story and transition content. Edit `scripts/mvp-flow-viewer.html` for document presentation. With Graphviz installed (`dot` on PATH), run:','','```sh','npm run docs:mvp','```','','The generator validates stable IDs, transition endpoints, source-file references, screen reachability, journey membership and story acceptance criteria. It emits this Markdown document, a standalone interactive HTML document, a portable model JSON, and editable `.dot` plus SVG diagrams. Source commit identifies the app behavior reviewed, not a guarantee that later code has identical flows. Refresh the review after changes to `src/mvp`.','');
writeFileSync(path.join(root,'docs/mvp/screen-flows.md'),md.join('\n'));
const payload=JSON.stringify({...model,graphs}).replaceAll('<','\\u003c');
const template=applyDocumentPalette(readFileSync(path.join(root,'scripts/mvp-flow-viewer.html'),'utf8'));
writeFileSync(path.join(root,'public/mvp-flows.html'),template.replace('/*__MODEL__*/',payload));
console.log(`MVP docs validated: ${screens.size} reachable screens, ${model.journeys.length} journeys, ${model.screens.reduce((n,s)=>n+s.actions.length,0)} transitions. Generated Markdown, standalone HTML and SVG/DOT diagrams.`);
