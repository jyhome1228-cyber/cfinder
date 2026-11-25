import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LETTER_IMAGES, letterArt } from '../assets/ui/letter-art.js';
import { renderHome } from '../assets/ui/home.js';
import { renderSampleReport } from '../assets/ui/sample-report.js';
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');

test('all six user-supplied letters map to the distinct original CDN assets',()=>{
  assert.deepEqual(Object.keys(LETTER_IMAGES).sort(), ['A','C','E','I','R','S']);
  assert.equal(new Set(Object.values(LETTER_IMAGES)).size,6);
  for (const [code,url] of Object.entries(LETTER_IMAGES)){
    assert.match(url,/^https:\/\/nineworksdatabase\.planus253\.workers\.dev\/cdn\/uncategorized\/20261124-/);
    assert.ok(url.endsWith('.webp'),code);
    const html=letterArt(code);
    assert.ok(html.includes(url),code);
    assert.ok(html.includes('data-letter-asset'),code);
    assert.ok(html.includes('cf-letter-fallback'),code);
  }
});
test('C is the only hero letter; catalog and sample results use contextually accurate assets',()=>{
  const home=renderHome({storageAvailable:true});
  const hero=home.slice(home.indexOf('<section class="lab-hero"'),home.indexOf('</section>')+10);
  assert.ok(hero.includes('cf-hero-letter'));
  assert.ok(hero.includes(LETTER_IMAGES.C));
  assert.ok(!hero.includes(LETTER_IMAGES.R));
  assert.equal((home.match(/class="lab-type cf-type-trigger"/g)||[]).length,6);
  for(const code of ['R','I','A','S','E','C'])assert.ok(home.includes('data-letter-code="'+code+'"'));
  assert.ok(home.includes('cf-result-letters'));
  assert.ok(home.includes('data-letter-code="E"'));
  assert.ok(home.includes('data-letter-code="S"'));
});
test('sample PDF report ES header uses E and S without creating a false score',()=>{
  const html=renderSampleReport();
  assert.match(html,/class="cf-report-pair"/);
  assert.ok(html.includes(LETTER_IMAGES.E));
  assert.ok(html.includes(LETTER_IMAGES.S));
  assert.ok(html.includes('샘플 · 실제 검사 결과 아님'));
});
test('letter visuals are responsive, protect original official logo, and fall back offline',()=>{
  const css=read('../assets/letter-art.css');
  const app=read('../assets/app.js');
  const index=read('../index.html');
  const views=read('../assets/ui/views.js');
  assert.ok(index.includes('assets/letter-art.css'));
  assert.ok(index.includes('nineworksdatabase.planus253.workers.dev'));
  assert.ok(views.includes('cfinder-official-logo.svg'));
  assert.ok(css.includes('cf-letter.is-fallback'));
  assert.ok(css.includes('max-width:1120px'));
  assert.ok(css.includes('max-width:660px'));
  assert.ok(app.includes("event.target.hasAttribute('data-letter-asset')"));
  assert.ok(app.includes("letterArt('C', 'loading'"));
});
