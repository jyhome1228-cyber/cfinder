import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const svg = readFileSync(new URL('../assets/brand/cfinder-loader.svg', import.meta.url), 'utf8');
const app = readFileSync(new URL('../assets/app.js', import.meta.url), 'utf8');
test('each pellet vanishes precisely as the C mouth reaches its center', () => {
  const distance = 287;
  const movementMs = 3350 * .90;
  const mouthX = 96;
  const centers = [124.37,167.59,210.81,254.03,297.25,340.47,383.69];
  const delays = [.30,.75,1.21,1.66,2.11,2.57,3.02];
  assert.match(svg, /cfTravel 3\.35s linear both/);
  assert.match(svg, /90%\{transform:translateX\(287px\)\}/);
  for (let i = 0; i < 7; i++){
    const id=i+1;
    assert.ok(svg.includes('dot-'+id+',.impact-'+id+'{animation-delay:'+delays[i].toFixed(2).replace(/^0/, '')+'s}'),id);
    assert.ok(svg.includes('class="dot dot-'+id+'"'),id);
    assert.ok(svg.includes('class="impact impact-'+id+'"'),id);
    const collisionX = mouthX + distance * (delays[i]*1000/movementMs);
    assert.ok(Math.abs(collisionX-centers[i])<3,id+': '+collisionX+' vs '+centers[i]);
  }
  assert.equal((svg.match(/<circle class="dot dot-/g)||[]).length,7);
  assert.equal((svg.match(/<circle class="impact impact-/g)||[]).length,7);
});
test('loading is timed beyond the final collision and can be replayed on demand', () => {
  assert.match(svg, /@keyframes cfChomp/);
  assert.match(svg, /@keyframes cfEat/);
  assert.match(svg, /@keyframes cfImpact/);
  assert.ok(svg.includes('prefers-reduced-motion:reduce'));
  assert.ok(app.includes("get('intro') === 'replay'"));
  assert.ok(app.includes('window.setTimeout(closeBrandIntro, 3580)'));
  assert.ok(3580 > 3020 + 140 + 240);
  assert.ok(app.includes("window.clearTimeout(finishTimer)"));
});
