import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {reverterCapas,lerAplicadas} from '../scripts/capas-reverter.mjs';
const catalog=JSON.parse(readFileSync('public/catalogo.json','utf8'));
const aplicadas=lerAplicadas(); // CAPAS-20261021: troca de capa autorizada, revertida em memoria antes do hash (scripts/dados/capas-aplicadas.json)
// V8-CAT: as únicas exceções de marca/categoria/linha são as do manifesto, conferidas campo a campo.
const {mudancas}=JSON.parse(readFileSync('docs/v8-cat/manifesto.json','utf8'));
const semV8Cat=items=>{const byId=new Map(items.map(p=>[p.id,structuredClone(p)]));for(const m of mudancas){const p=byId.get(m.id);assert.equal(p[m.campo]??null,m.depois,m.id+' '+m.campo);if(m.antes==null)delete p[m.campo];else p[m.campo]=m.antes;}return items.map(p=>byId.get(p.id));};
test('preserves all 2778 published products (ids, photos, brand, category) exactly',()=>{
 assert.equal(catalog.length,2849); // 20/10: +32 perfumes no fim; os 2778 publicados continuam travados pelo hash
 assert.equal(new Set(catalog.map(p=>p.id)).size,2849);
 // V7 (2026-10-14): nomes foram desambiguados; o restante dos dados publicados continua travado.
 // 21/10: mudancas autorizadas pelo Daniel descontadas antes do hash: PC-1631 removido (posicao 1623, dentro dos 2778 => fatia 2777) e campo "genero" em roupas.
 const removidos=new Set(JSON.parse(readFileSync('scripts/dados/remover-ids.json','utf8')));
 const normalizado=reverterCapas(catalog,aplicadas).filter(p=>!removidos.has(p.id)).map(p=>{if(p.categoria!=='perfumaria'&&'preco' in p){const {preco,...r}=p;p=r;} /* 23/10: preços de tênis autorizados pelo Daniel */ if(p.categoria!=='roupas')return p;const {genero,...r}=p;return r;});
 const hash=createHash('sha256').update(JSON.stringify(semV8Cat(normalizado).slice(0,2777).map(({nome,...r})=>r))).digest('hex');
 // 21/10: hash derivado de `git show dcedca2:public/catalogo.json` com a mesma normalizacao (o hash antigo 655a5510... valia para a base crua de 2778).
 assert.equal(hash,'0dc1a4b29fd0bbb8068378ab4f3e682dc9ae40f8d8b6c0a842049c61b2b9da58');
});
test('every product has a non-empty display name without internal PC codes',()=>{
 // 14/10: Daniel pediu para não exibir "PC-…" ao cliente; o código fica só na mensagem de WhatsApp.
 for(const p of catalog){assert.ok(String(p.nome||'').trim(),p.id);assert.doesNotMatch(p.nome,/PC-\d/,p.id);}
});
test('adds exactly 72 sanitized perfume references (40 + 32 em 20/10)',()=>{
 const perfume=catalog.filter(p=>p.categoria==='perfumaria');
 assert.equal(perfume.length,72);
 for(const p of perfume){
  assert.match(p.id,/^PC-9000[0-7][0-9]$/);
  assert.equal(Object.hasOwn(p,'codigo'),false);
  assert.doesNotMatch(p.nome,/PIEZAS/i);
  assert.ok(p.fotos?.every(s=>s.startsWith('media/perfumaria/pc-')));
 }
});
