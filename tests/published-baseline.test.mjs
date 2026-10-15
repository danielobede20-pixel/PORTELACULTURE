import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const catalog=JSON.parse(readFileSync('public/catalogo.json','utf8'));
// V8-CAT: as únicas exceções de marca/categoria/linha são as do manifesto, conferidas campo a campo.
const {mudancas}=JSON.parse(readFileSync('docs/v8-cat/manifesto.json','utf8'));
const semV8Cat=items=>{const byId=new Map(items.map(p=>[p.id,structuredClone(p)]));for(const m of mudancas){const p=byId.get(m.id);assert.equal(p[m.campo]??null,m.depois,m.id+' '+m.campo);if(m.antes==null)delete p[m.campo];else p[m.campo]=m.antes;}return items.map(p=>byId.get(p.id));};
test('preserves 2775 legacy products plus 40 perfumes after the authorized Alo accessory removal',()=>{
 assert.equal(catalog.length,2815);
 assert.equal(new Set(catalog.map(p=>p.id)).size,2815);
 for(const id of ['PC-1819','PC-1820','PC-1821'])assert.equal(catalog.some(p=>p.id===id),false,id);
 // 15/10/2026: Daniel autorizou remover os 3 acessórios Alo que já eram ocultos da vitrine.
 const hash=createHash('sha256').update(JSON.stringify(semV8Cat(catalog).slice(0,2775).map(({nome,...r})=>r))).digest('hex');
 assert.equal(hash,'a614eb72b7c14d0ceb0ce62e02774ceca0708ce32d956e5e82af720dd11b634c');
});
test('every product has a non-empty display name without internal PC codes',()=>{
 // 14/10: Daniel pediu para não exibir "PC-…" ao cliente; o código fica só na mensagem de WhatsApp.
 for(const p of catalog){assert.ok(String(p.nome||'').trim(),p.id);assert.doesNotMatch(p.nome,/PC-\d/,p.id);}
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
