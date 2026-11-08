import { chromium, expect } from '@playwright/test';
import { colors } from '../src/mvp/palette.mjs';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {tmpdir} from 'node:os';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target=process.env.MVP_CAPTURE_URL||'http://localhost:3000';
const output=path.join(root,'public/mvp-customer-journey');
mkdirSync(path.join(output,'screenshots'),{recursive:true});
const manifest={capturedAt:new Date().toISOString(),sourceCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),appSourceCommit:execFileSync('git',['log','-1','--format=%H','--','src/mvp'],{cwd:root,encoding:'utf8'}).trim(),target,method:'Local Playwright Chromium. Browser runtime tools are not exposed in this session; the established local Playwright fallback is used.',scenario:'Fresh local workspace; synthetic example dataset and new Customer journey outcome classifier v1.0.0. All four reviews are performed through normal UI controls; simulation shortcuts are not used.',screenshots:[],visualPalette:{primary:colors.primary,slate:colors.slate,amber:colors.warningAccent,coral:colors.errorAccent,primaryText:colors.ink,secondaryActionText:colors.ink,tertiaryActionText:colors.ink,selection:colors.primaryDark},checks:{pageErrors:[],consoleErrors:[]}};
const scratch=mkdtempSync(path.join(tmpdir(),'mvp-customer-journey-'));
const screenshotScratch=path.join(scratch,'screenshots');
mkdirSync(screenshotScratch);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
 page.on('pageerror',e=>manifest.checks.pageErrors.push(e.message));
 page.on('console',msg=>{if(msg.type()==='error')manifest.checks.consoleErrors.push(msg.text());});
 async function openDemo(){await page.getByRole('button',{name:'Open demo controls',exact:true}).click();}
 async function role(name){await openDemo();await page.getByRole('combobox',{name:'Acting role'}).click();await page.getByRole('option',{name,exact:true}).click();await expect(page.getByRole('listbox')).toBeHidden();await page.getByRole('button',{name:'Close demo controls',exact:true}).click();}
 async function demoAction(name){await openDemo();await page.getByRole('button',{name,exact:true}).click();}
 async function nav(name){await page.getByRole('navigation',{name:'Main navigation'}).getByRole('button',{name,exact:true}).click();}
 async function capture(file,title,screen,actor){
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('.MuiSnackbar-root').waitFor({state:'hidden',timeout:7000});
  await page.evaluate(()=>window.scrollTo(0,0));
  // Publish captures only after the walkthrough ends: writing to Vite's public
  // directory mid-flow can reload the browser and discard its current screen.
  await page.screenshot({path:path.join(screenshotScratch,file),fullPage:page.viewportSize().width>900,animations:'disabled',caret:'hide'});
  const data=readFileSync(path.join(screenshotScratch,file));
  manifest.screenshots.push({file:`screenshots/${file}`,title,screen,actor,viewport:page.viewportSize(),width:data.readUInt32BE(16),height:data.readUInt32BE(20)});
  console.log(`Captured ${file}: ${title}`);
 }
 await page.goto(target);await expect(page).toHaveTitle('Pipelines · Zero Trust');
 await expect(page.getByRole('heading',{name:'Pipelines',exact:true})).toBeVisible();
 await capture('00-pipeline-catalog.png','Initial pipeline catalog','S03','Researcher');
 await nav('Datasets');await page.getByRole('button',{name:'Import dataset',exact:true}).click();
 await demoAction('Use sample');
 await page.getByRole('textbox',{name:/^Dataset name/}).fill('Customer journey · Synthetic cohort');
 await page.getByText('Preview columns and sample rows',{exact:false}).click();
 await expect(page.getByRole('table',{name:'Dataset sample preview'})).toBeVisible();
 await capture('01-import-dataset.png','Preview synthetic dataset before import','S06','Researcher');
 await page.getByRole('dialog').getByRole('button',{name:'Import dataset',exact:true}).click();
 await expect(page.getByRole('button',{name:'Customer journey · Synthetic cohort',exact:true})).toBeVisible();
 await nav('Pipelines');await page.getByRole('button',{name:'New pipeline',exact:true}).click();
 await demoAction('Use example');
 await page.getByRole('textbox',{name:/^Pipeline name/}).fill('Customer journey outcome classifier');
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 await page.locator('input[type=file]').setInputFiles({name:'synthetic-method-evidence.md',mimeType:'text/markdown',buffer:Buffer.from('# Demonstration evidence\nSynthetic clinical records only.\nPurpose: demonstrate longitudinal outcome classification.\nInput: CSV with record_id, clinical_note, visit_date.\nOutput: synthetic outcome classification CSV.\nReview context: consent boundaries, runtime contract, minimization and least-privilege assumptions are illustrative. No actual scanner or code execution is claimed.\n')});
 await expect(page.getByRole('button',{name:'Remove synthetic-method-evidence.md',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 await expect(page.getByRole('button',{name:'Submit for review',exact:true})).toBeVisible();
 await capture('02-submission-summary.png','Review the method before submission','S10','Researcher');
 await page.getByRole('button',{name:'Submit for review',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Submitted for review',exact:true})).toBeVisible();
 await capture('03-submission-receipt.png','Submission receipt and next reviewer','S13','Researcher');
 const stages=['Ethical','Technical','Privacy','Security'];
 for(const [index,stage] of stages.entries()){
  await role(`${stage} reviewer`);
  const approve=page.getByRole('button',{name:'Approve review',exact:true});
  await expect(approve).toBeDisabled();
  for(const check of await page.getByRole('checkbox').all())await check.check();
  await page.getByLabel('Review comments',{exact:true}).fill(`${stage} demonstration evidence reviewed. Synthetic scenario only.`);
  await expect(approve).toBeEnabled();
  await capture(`${String(index+4).padStart(2,'0')}-${stage.toLowerCase()}-review.png`,`${stage} reviewer confirms stage-specific criteria`,`S${14+index}`,`${stage} reviewer`);
  await approve.click();
 }
 await expect(page.getByRole('heading',{name:'Ready to publish',exact:true})).toBeVisible();
 await role('Researcher');
 await capture('08-ready-to-publish.png','Four reviews complete; author publication still required','S21','Researcher');
 await page.getByRole('button',{name:'Publish pipeline',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Ready for research',exact:true})).toBeVisible();
 await capture('09-published-pipeline.png','Published version is ready for research','S22','Researcher');
 await page.getByRole('button',{name:'Configure run',exact:true}).click();
 await page.getByLabel('Source dataset',{exact:true}).click();
 await page.getByRole('option',{name:'Customer journey · Synthetic cohort (CSV)',exact:true}).click();
 await page.getByText('Inspect dataset columns',{exact:true}).click();
 await expect(page.getByRole('button',{name:'Start demo run',exact:true})).toBeEnabled();
 await capture('10-configure-run.png','Pair published method with the imported source','S23','Researcher');
 await page.getByRole('button',{name:'Start demo run',exact:true}).click();
 const row=page.getByRole('row').filter({has:page.getByText('Customer journey outcome classifier',{exact:true})});
 await expect(row.getByText('Completed',{exact:true})).toBeVisible({timeout:15000});
 await row.getByRole('button',{name:'Details',exact:true}).click();
 await expect(page.getByRole('button',{name:'Inspect output',exact:true})).toBeVisible();
 await capture('11-completed-run.png','Completed run links to output awaiting separate validation','S26','Researcher');
 await page.getByRole('button',{name:'Inspect output',exact:true}).click();
 await expect(page.getByRole('button',{name:'Download sample CSV',exact:true})).toBeDisabled();
 await role('Privacy reviewer');
 await page.getByRole('radio',{name:'Acceptable',exact:true}).check();
 await page.getByLabel('Validation comments',{exact:true}).fill('Synthetic sample assessed against the declared output; acceptable for this demonstration.');
 await capture('12-output-validation.png','Privacy reviewer makes the separate output decision','S34','Privacy reviewer');
 await page.getByRole('button',{name:'Accept output',exact:true}).click();
 await expect(page.getByRole('button',{name:'Download sample CSV',exact:true})).toBeEnabled();
 await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();
 await role('Researcher');await row.getByRole('button',{name:'View output',exact:true}).click();
 await expect(page.getByText('Output accepted',{exact:true})).toBeVisible();
 await capture('13-accepted-output.png','Researcher can download the accepted synthetic sample','S35','Researcher');
 const downloadPromise=page.waitForEvent('download');
 await page.getByRole('button',{name:'Download sample CSV',exact:true}).click();
 const download=await downloadPromise;
 await download.saveAs(path.join(scratch,'accepted-sample.csv'));
 const csv=readFileSync(path.join(scratch,'accepted-sample.csv'),'utf8');
 if(!csv.includes('record_id')||csv.trim().split(/\r?\n/).length<2)throw Error('Expected synthetic CSV download');
 manifest.checks.download={filename:download.suggestedFilename(),rowsIncludingHeader:csv.trim().split(/\r?\n/).length,syntheticSample:true};
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('dialog').locator('.MuiDialogContent-root').evaluate(x=>x.scrollTop=0);
 await capture('15-mobile-accepted-output.png','Accepted output on mobile with full-width primary action','S35','Researcher');
 manifest.checks.mobileNoPageOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
 await page.setViewportSize({width:1440,height:1100});
 await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();
 await nav('Activity log');await page.getByPlaceholder('Search activity...').fill('Customer journey');
 await expect(page.getByText('Ethical review approved',{exact:true})).toBeVisible();
 await expect(page.getByText('Security review approved',{exact:true})).toBeVisible();
 await capture('14-activity-history.png','Trace decisions, publication, run and output review','S37','Researcher');
 const exportPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export history',exact:true}).click();
 const history=await exportPromise;await history.saveAs(path.join(scratch,'history.json'));
 const exported=JSON.parse(readFileSync(path.join(scratch,'history.json'),'utf8'));
 if(exported.filters.search!=='Customer journey'||!exported.events.length)throw Error('Filtered history export');
 manifest.checks.historyExport={filename:history.suggestedFilename(),events:exported.events.length,filter:exported.filters.search};
 if(manifest.checks.pageErrors.length||manifest.checks.consoleErrors.length)throw Error('Browser errors: '+JSON.stringify(manifest.checks));
 if(!manifest.checks.mobileNoPageOverflow)throw Error('Mobile overflow');
 for(const shot of manifest.screenshots)copyFileSync(path.join(scratch,shot.file),path.join(output,shot.file));
 writeFileSync(path.join(output,'capture.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log(`Verified ${manifest.screenshots.length} screenshots; four normal UI reviews, publication, run, output decision, sample download and filtered history export passed.`);
} finally {await browser.close();rmSync(scratch,{recursive:true,force:true});}
