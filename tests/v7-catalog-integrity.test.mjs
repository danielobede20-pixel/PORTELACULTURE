import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {reverterCapas,lerAplicadas} from '../scripts/capas-reverter.mjs';
const catalog=JSON.parse(readFileSync('public/catalogo.json','utf8'));
const aplicadas=lerAplicadas(); // CAPAS-20261021: troca de capa autorizada, revertida em memoria antes do hash (scripts/dados/capas-aplicadas.json)
const assets=JSON.parse(readFileSync('worker/catalog-assets.json','utf8'));
const ui=readFileSync('public/catalogo.js','utf8');
const category=p=>p.categoria||'tenis';
// V8-CAT: exceções de marca/categoria/linha somente pelo manifesto, conferidas campo a campo.
const {mudancas}=JSON.parse(readFileSync('docs/v8-cat/manifesto.json','utf8'));
const semV8Cat=items=>{const byId=new Map(items.map(p=>[p.id,structuredClone(p)]));for(const m of mudancas){const p=byId.get(m.id);assert.equal(p[m.campo]??null,m.depois,m.id+' '+m.campo);if(m.antes==null)delete p[m.campo];else p[m.campo]=m.antes;}return items.map(p=>byId.get(p.id));};

test('catalog keeps 2818 unique ids with the same brand, category and photos',()=>{
 assert.equal(catalog.length,2849); // 20/10: +32 perfumes no fim
 assert.equal(new Set(catalog.map(p=>p.id)).size,2849);
 for(const p of catalog){
  assert.match(p.id,/^PC-\d+$/);
  assert.ok(p.fotos?.length>0,p.id);
 }
 // 21/10: descontadas as mudancas autorizadas: PC-1631 removido (posicao 1623, dentro dos 2818 => fatia 2817) e campo "genero" em roupas (nao entra neste hash, mas normaliza igual ao outro teste).
 const removidos=new Set(JSON.parse(readFileSync('scripts/dados/remover-ids.json','utf8')));
 const normalizado=reverterCapas(catalog,aplicadas).filter(p=>!removidos.has(p.id)).map(p=>{if(p.categoria!=='roupas')return p;const {genero,...r}=p;return r;});
 const hash=createHash('sha256').update(JSON.stringify(semV8Cat(normalizado.slice(0,2817)).map(p=>[p.id,p.marca,category(p),p.fotos]))).digest('hex');
 // 21/10: hash derivado da base dcedca2 com a mesma normalizacao (o antigo 5070ce1c... valia para a base crua de 2818).
 assert.equal(hash,'12ead17134a5df48a5dbf67ba3c1b00438db8b8e2bc9a1f34e6235d2d4ccf2b6');
});

test('every photo is either a local file or registered for the media worker',()=>{
 for(const p of catalog)for(const src of p.fotos)assert.ok(existsSync('public/'+src)||Object.hasOwn(assets,src),p.id+' '+src);
});

test('same-name products stay distinct by id and photos, and PC codes are not shown to the customer',()=>{
 const groups=new Map();
 for(const p of catalog){const key=[p.marca,category(p),p.nome].join('|');groups.set(key,[...(groups.get(key)||[]),p]);}
 const duplicated=[...groups.values()].filter(g=>g.length>1);
 // Nomes podem repetir (mesmo modelo/cor); cada anúncio continua com ID e capa próprios.
 for(const group of duplicated){assert.equal(new Set(group.map(p=>p.id)).size,group.length);assert.equal(new Set(group.map(p=>p.fotos[0])).size,group.length);}
 // Nada de "PC-…" visível: cards e detalhe mostram a marca; o ID só vai para URL e WhatsApp.
 assert.doesNotMatch(ui,/textContent\s*=[^;]*p\.id/);
 assert.doesNotMatch(ui,/'Referência '\s*\+\s*p\.id/);
 assert.doesNotMatch(ui,/\.alt\s*=[^;]*p\.id/);
 assert.match(ui,/ref\.textContent\s*=\s*PortelaCatalog\.label\(p\.marca\)/);
 assert.match(ui,/title\.textContent\s*=\s*p\.nome/);
 const core=readFileSync('public/conversao-core.js','utf8');
 assert.match(core,/Referência Portela: \$\{product\.id\}/);
});

// 21/10: titulo atualizado; genero de roupas segue genero-roupas.json (autorizado pelo Daniel), demais categorias sem genero.
test('V7 curated selection uses existing ids, matching brand/category, with gender only from genero-roupas.json (clothing)',()=>{
 const generoRoupas=JSON.parse(readFileSync('scripts/dados/genero-roupas.json','utf8'));
 const selection={
  'PC-351':['Nike','tenis'],'PC-355':['Adidas','tenis'],'PC-214':['New Balance','tenis'],'PC-362':['ASICS','tenis'],'PC-368':['On','tenis'],'PC-374':['Vans','tenis'],
  'PC-2747':['Nike','acessorios'],'PC-1706':['Adidas','acessorios'],'PC-2857':['On','acessorios'],'PC-462':['Gucci','acessorios'],
  'PC-474':['Gucci','roupas'],'PC-2809':['Nike','roupas']
 };
 for(const [id,[marca,cat]] of Object.entries(selection)){
  const p=catalog.find(item=>item.id===id);
  assert.ok(p,id);
  assert.equal(p.marca,marca,id);
  assert.equal(category(p),cat,id);
  // 21/10: genero das roupas vem de scripts/dados/genero-roupas.json; fora de roupas continua sem genero.
  if(cat==='roupas')assert.equal(p.genero,generoRoupas[id],id+' genero deve vir de genero-roupas.json');
  else assert.equal(Object.hasOwn(p,'genero'),false,id+' has no confirmed gender');
 }
 assert.notEqual(catalog.find(p=>p.id==='PC-474').linha,catalog.find(p=>p.id==='PC-2809').linha);
});
