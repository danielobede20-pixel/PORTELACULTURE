import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const catalog=JSON.parse(readFileSync('public/catalogo.json','utf8'));
const assets=JSON.parse(readFileSync('worker/catalog-assets.json','utf8'));
const ui=readFileSync('public/catalogo.js','utf8');
const category=p=>p.categoria||'tenis';
// V8-CAT: exceções de marca/categoria/linha somente pelo manifesto, conferidas campo a campo.
const {mudancas}=JSON.parse(readFileSync('docs/v8-cat/manifesto.json','utf8'));
const semV8Cat=items=>{const byId=new Map(items.map(p=>[p.id,structuredClone(p)]));for(const m of mudancas){const p=byId.get(m.id);assert.equal(p[m.campo]??null,m.depois,m.id+' '+m.campo);if(m.antes==null)delete p[m.campo];else p[m.campo]=m.antes;}return items.map(p=>byId.get(p.id));};

test('catalog keeps 2818 unique ids with the same brand, category and photos',()=>{
 assert.equal(catalog.length,2850); // 20/10: +32 perfumes no fim
 assert.equal(new Set(catalog.map(p=>p.id)).size,2850);
 for(const p of catalog){
  assert.match(p.id,/^PC-\d+$/);
  assert.ok(p.fotos?.length>0,p.id);
 }
 const hash=createHash('sha256').update(JSON.stringify(semV8Cat(catalog.slice(0,2818)).map(p=>[p.id,p.marca,category(p),p.fotos]))).digest('hex');
 assert.equal(hash,'5070ce1c56024aa3300577ca57e6afd0bd7261bf8f9f64bb3dc358193114e3a3');
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

test('V7 curated selection uses existing ids, matching brand/category, with no invented gender',()=>{
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
  assert.equal(Object.hasOwn(p,'genero'),false,id+' has no confirmed gender');
 }
 assert.notEqual(catalog.find(p=>p.id==='PC-474').linha,catalog.find(p=>p.id==='PC-2809').linha);
});
