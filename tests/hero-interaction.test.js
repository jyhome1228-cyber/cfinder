import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderHome } from '../assets/ui/home.js';
import { LETTER_IMAGES } from '../assets/ui/letter-art.js';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const page = renderHome({ storageAvailable:true });

test('hero is centered around one C character and one primary assessment CTA', () => {
 const hero = page.slice(page.indexOf('<section class="lab-hero"'), page.indexOf('</section>') + 10);
 assert.ok(hero.includes('cf-hero-visual'));
 assert.ok(hero.includes(LETTER_IMAGES.C));
 assert.match(hero, /<button class="cf-hero-character" type="button" data-action="play-hero-character"/);
 assert.ok(hero.includes('aria-label="C-Finder 캐릭터와 인사하기"'));
 assert.ok(hero.includes('aria-live="polite"'));
 assert.ok(hero.includes('cf-hero-spark-one'));
 assert.equal((hero.match(/href="#start"/g) || []).length, 1);
 assert.ok(!hero.includes('href="#report"'));
 assert.ok(!hero.includes('lab-hero-aside'));
 const title = hero.indexOf('id="page-heading"');
 const visual = hero.indexOf('cf-hero-visual');
 const cta = hero.indexOf('class="lab-hero-actions"');
 assert.ok(title > 0 && visual > title && cta > visual, 'Title -> C -> CTA');
});

test('light sky hero remains white-blue, centered and mobile friendly', () => {
 const css = read('../assets/hero-interaction.css');
 const index = read('../index.html');
 assert.ok(index.includes('./assets/hero-interaction.css'));
 assert.match(css, /background:radial-gradient\([\s\S]*?#F0F7FF;/);
 assert.match(css, /\.cf-hero-character\s*\{/);
 assert.match(css, /\.cf-hero-character:focus-visible/);
 assert.match(css, /@media\(max-width:760px\)/);
 assert.match(css, /@media\(max-width:430px\)/);
 assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css, /cfHeroFloat/);
 assert.match(css, /cfHeroTap/);
 assert.match(css, /cfHeroBubble/);
});

test('touch and keyboard character interaction is delegated without blocking diagnosis', () => {
 const app = read('../assets/app.js');
 assert.ok(app.includes("button[data-action=\"play-hero-character\"]"));
 assert.ok(app.includes("character.classList.add('is-reacting')"));
 assert.ok(app.includes("if (reaction) reaction.textContent = '반가워요!'"));
 assert.ok(app.includes("event.animationName === 'cfHeroTap'"));
 assert.ok(app.includes("href"));
 assert.ok(page.includes('data-letter-code="C"'));
});
