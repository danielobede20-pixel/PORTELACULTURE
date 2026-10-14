import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const catalog=JSON.parse(readFileSync('public/catalogo.json','utf8'));
test('preserves all 2778 published products (ids, photos, brand, category) exactly',()=>{
 assert.equal(catalog.length,2818);
 assert.equal(new Set(catalog.map(p=>p.id)).size,2818);
 // V7 (2026-10-14): nomes foram desambiguados; o restante dos dados publicados continua travado.
 const hash=createHash('sha256').update(JSON.stringify(catalog.slice(0,2778).map(({nome,...r})=>r))).digest('hex');
 assert.equal(hash,'655a5510692dba76437429dd7065e19487946d24fe42985553667a9a119e258e');
});
test('every product has a unique, non-empty display name',()=>{
 const nomes=catalog.map(p=>String(p.nome||'').trim().toLowerCase());
 assert.ok(nomes.every(Boolean));
 assert.equal(new Set(nomes).size,catalog.length);
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
