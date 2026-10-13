import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const catalog=JSON.parse(readFileSync('public/catalogo.json','utf8'));
test('preserves all 2778 products exactly as previously published',()=>{
 assert.equal(catalog.length,2818);
 assert.equal(new Set(catalog.map(p=>p.id)).size,2818);
 const hash=createHash('sha256').update(JSON.stringify(catalog.slice(0,2778))).digest('hex');
 assert.equal(hash,'2fa655daf0a083ef70a469eca295b6890bceb083e45efc52a96fa69154f73775');
});
test('adds exactly 40 sanitized perfume references',()=>{
 const perfume=catalog.filter(p=>p.categoria==='perfumaria');
 assert.equal(perfume.length,40);
 for(const p of perfume){
  assert.match(p.id,/^PC-9000[0-4][0-9]$/);
  assert.equal(Object.hasOwn(p,'codigo'),false);
  assert.doesNotMatch(p.nome,/PIEZAS/i);
  assert.ok(p.fotos?.every(s=>s.startsWith('media/perfumaria/pc-')));
 }
});
