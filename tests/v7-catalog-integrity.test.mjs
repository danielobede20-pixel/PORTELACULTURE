import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const catalog=JSON.parse(readFileSync('public/catalogo.json','utf8'));
const assets=JSON.parse(readFileSync('worker/catalog-assets.json','utf8'));
const ui=readFileSync('public/catalogo.js','utf8');
const category=p=>p.categoria||'tenis';

test('catalog keeps 2818 unique ids with the same brand, category and photos',()=>{
 assert.equal(catalog.length,2818);
 assert.equal(new Set(catalog.map(p=>p.id)).size,2818);
 for(const p of catalog){
  assert.match(p.id,/^PC-\d+$/);
  assert.ok(p.fotos?.length>0,p.id);
 }
 const hash=createHash('sha256').update(JSON.stringify(catalog.map(p=>[p.id,p.marca,category(p),p.fotos]))).digest('hex');
 assert.equal(hash,'5070ce1c56024aa3300577ca57e6afd0bd7261bf8f9f64bb3dc358193114e3a3');
});

test('every photo is either a local file or registered for the media worker',()=>{
 for(const p of catalog)for(const src of p.fotos)assert.ok(existsSync('public/'+src)||Object.hasOwn(assets,src),p.id+' '+src);
});

test('same-name products of one brand and category are told apart by a public PC reference',()=>{
 const groups=new Map();
 for(const p of catalog){const key=[p.marca,category(p),p.nome].join('|');groups.set(key,[...(groups.get(key)||[]),p]);}
 const duplicated=[...groups.values()].filter(g=>g.length>1);
 assert.ok(duplicated.length>0);
 for(const group of duplicated)assert.equal(new Set(group.map(p=>p.id)).size,group.length);
 // The card shows the reference above the original name, and the detail shows it too.
 assert.match(ui,/ref\.textContent\s*=\s*p\.id/);
 assert.match(ui,/title\.textContent\s*=\s*p\.nome/);
 assert.match(ui,/'Referência '\s*\+\s*p\.id/);
 assert.match(ui,/info\.append\(ref,\s*title,/);
});

test('V7 curated selection uses existing ids, matching brand/category, with no invented gender',()=>{
 const selection={
  'PC-351':['Nike','tenis'],'PC-355':['Adidas','tenis'],'PC-214':['New Balance','tenis'],'PC-362':['ASICS','tenis'],'PC-368':['On','tenis'],'PC-374':['Vans','tenis'],
  'PC-2747':['Nike','acessorios'],'PC-1679':['Adidas','acessorios'],'PC-2857':['On','acessorios'],'PC-462':['Gucci','acessorios'],
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
