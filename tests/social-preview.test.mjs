import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const site='https://jyhome1228-cyber.github.io/cfinder/';
const image=site+'assets/share/cfinder-social-20261125.png';
const read=path=>readFile(new URL(path,import.meta.url),'utf8');

test('Kakao and Open Graph metadata consistently use an absolute, versioned PNG',async()=>{
 for(const path of ['../index.html','../about/index.html']){
  const html=await read(path);
  assert.ok(html.includes('property="og:image" content="'+image+'"'));
  assert.ok(html.includes('property="og:image:width" content="1200"'));
  assert.ok(html.includes('property="og:image:height" content="630"'));
  assert.ok(html.includes('property="og:site_name" content="C-Finder"'));
  assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
  assert.ok(!html.includes('og_v1_261123.png'));
 }
});

test('published Kakao share image is a real 1200x630 PNG',async()=>{
 const png=await readFile(new URL('../assets/share/cfinder-social-20261125.png',import.meta.url));
 assert.deepEqual(png.subarray(0,8),Buffer.from([137,80,78,71,13,10,26,10]));
 assert.equal(png.readUInt32BE(16),1200);
 assert.equal(png.readUInt32BE(20),630);
 assert.ok(png.length>10000);
});

test('sharing text does not claim unofficial sample is an official diagnosis',async()=>{
 const main=await read('../index.html');
 const about=await read('../about/index.html');
 const artwork=await read('../share-card/index.html');
 assert.match(main,/49항목 비공식 자기탐색/);
 assert.match(about,/49항목 비공식 자기탐색/);
 assert.ok(!artwork.includes('10분 만에'));
 assert.ok(!artwork.includes('실제 샘플 결과지'));
});
