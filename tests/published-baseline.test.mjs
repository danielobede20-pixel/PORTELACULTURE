import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const catalog=JSON.parse(readFileSync('public/catalogo.json','utf8'));
// V8-CAT: as únicas exceções de marca/categoria/linha são as do manifesto, conferidas campo a campo.
const {mudancas}=JSON.parse(readFileSync('docs/v8-cat/manifesto.json','utf8'));
const semV8Cat=items=>{const byId=new Map(items.map(p=>[p.id,structuredClone(p)]));for(const m of mudancas){const p=byId.get(m.id);assert.equal(p[m.campo]??null,m.depois,m.id+' '+m.campo);if(m.antes==null)delete p[m.campo];else p[m.campo]=m.antes;}return items.map(p=>byId.get(p.id));};
test('preserves all 2778 published products (ids, photos, brand, category) exactly',()=>{
 assert.equal(catalog.length,2818);
 assert.equal(new Set(catalog.map(p=>p.id)).size,2818);
 // V7 (2026-10-14): nomes foram desambiguados; o restante dos dados publicados continua travado.
 const hash=createHash('sha256').update(JSON.stringify(semV8Cat(catalog).slice(0,2778).map(({nome,...r})=>r))).digest('hex');
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
