import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
test('official Illustrator logo replaces provisional mark on both pages',()=>{
  const logo=read('../assets/brand/cfinder-official-logo.svg');
  const mark=read('../assets/brand/cfinder-official-mark.svg');
  const main=read('../index.html');
  const about=read('../about/index.html');
  const view=read('../assets/ui/views.js');
  assert.match(logo,/viewBox="0 0 426\.97 107\.05"/);
  assert.match(logo,/#214FF4/);
  assert.match(mark,/viewBox="0 0 110 107\.05"/);
  assert.ok(about.includes('cfinder-official-logo.svg'));
  assert.ok(main.includes('cfinder-official-mark.svg'));
  assert.ok(view.includes('cfinder-official-logo.svg'));
});
test('supplied blue and white eater loader has seven sequential vanishing dots',()=>{
  const svg=read('../assets/brand/cfinder-loader.svg');
  const main=read('../index.html');
  assert.match(svg,/viewBox="0 0 426\.97 107\.05"/);
  assert.match(svg,/#214FF4/);
  assert.match(svg,/#F9F8FA/);
  assert.match(svg,/cfTravel 2\.8s/);
  assert.match(svg,/cfEat/);
  assert.ok(svg.includes('translateX(324px)'));
  assert.equal((svg.match(/<circle class="dot dot-/g)||[]).length,7);
  assert.ok(main.includes('id="brand-loader"'));
  assert.ok(main.includes('cfinder-loader.svg'));
  assert.ok(main.includes('brand-loading.css'));
});
test('intro is dismissible, honors reduced motion and does not repeat on navigation',()=>{
  const app=read('../assets/app.js');
  assert.ok(app.includes('cfinder:brand-intro:v1'));
  assert.ok(app.includes("sessionStorage.setItem('cfinder:brand-intro:v1', 'seen')"));
  assert.ok(app.includes('isHomeEntry'));
  assert.ok(app.includes('prefers-reduced-motion: reduce'));
  assert.ok(app.includes('cfinder-intro-skip'));
  assert.ok(app.includes('closeBrandIntro'));
  const css=read('../assets/brand-loading.css');
  assert.ok(css.includes('.cfinder-intro.is-leaving'));
});
