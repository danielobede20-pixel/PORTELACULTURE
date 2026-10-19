import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const catalog=JSON.parse(readFileSync('public/catalogo.json','utf8'));
const worker=JSON.parse(readFileSync('worker/catalog.json','utf8'));
const {mudancas}=JSON.parse(readFileSync('docs/v8-cat/manifesto.json','utf8'));
const byId=new Map(catalog.map(p=>[p.id,p]));
const ctx={};vm.createContext(ctx);vm.runInContext(readFileSync('public/catalogo-core.js','utf8')+';this.PortelaCatalog=PortelaCatalog;',ctx);
const {line,visibleProducts}=ctx.PortelaCatalog;

test('every V8-CAT change is applied in client and worker, only on allowed fields',()=>{
 const wById=new Map(worker.map(p=>[p.id,p]));
 for(const m of mudancas){
  assert.ok(['marca','categoria','linha'].includes(m.campo),m.id+' campo '+m.campo);
  assert.equal(byId.get(m.id)[m.campo],m.depois,m.id+' cliente');
  assert.equal(wById.get(m.id)[m.campo],m.depois,m.id+' worker');
 }
});

test('every V8-CAT change cites photos of the same product and a justification',()=>{
 for(const m of mudancas){
  const fotos=byId.get(m.id).fotos;
  assert.ok(m.evidencia.length>0,m.id);
  for(const src of m.evidencia)assert.ok(fotos.includes(src),m.id+' evidência fora do produto: '+src);
  assert.ok(m.justificativa.length>20,m.id);
  assert.equal(byId.get(m.id).nome,m.nome_atual,m.id+' nome V7 preservado');
 }
});

test('PC-021 is an Air Force 1 and is listed in that Nike family',()=>{
 const p=byId.get('PC-021');
 assert.match(p.nome,/Air Force 1/);
 assert.equal(line(p),'Air Force 1 Low');
});

test('Dunk and Dunk SB families from V7 stay as confirmed by photos',()=>{
 for(const id of ['PC-001','PC-016'])assert.equal(line(byId.get(id)),'Dunk Low',id);
 for(const id of ['PC-165','PC-176','PC-191','PC-193','PC-207'])assert.equal(line(byId.get(id)),'Dunk SB',id);
});

test('no product name announces a different sportswear brand than its brand field',()=>{
 const others={Nike:/\b(adidas|puma|asics|new balance|vans)\b/i,Adidas:/\b(nike|puma|asics|new balance|vans)\b/i};
 for(const p of catalog){const re=others[p.marca];if(re)assert.doesNotMatch(p.nome,re,p.id+' '+p.nome);}
});

test('corrected products stay reachable by brand, category and family',()=>{
 const visible=new Set(visibleProducts(catalog).map(p=>p.id));
 for(const id of new Set(mudancas.map(m=>m.id))){
  const p=byId.get(id);
  assert.ok(visible.has(id),id);
  assert.ok(line(p),id);
 }
});

test('small screens keep the floating WhatsApp compact and leave room after the last cards',()=>{
 const html=readFileSync('public/index.html','utf8');
 const rule=html.match(/@media\(max-width:360px\)\{\.whatsapp\{[^}]*\}main\{padding-bottom:(\d+)px\}\}/);
 assert.ok(rule,'regra de 360px ausente');
 assert.ok(Number(rule[1])>=64,'espaço inferior insuficiente');
 assert.match(rule[0],/padding:11px 14px/);
 assert.match(rule[0],/min-height:44px/);
});

test('vitrine da abertura usa produtos reais, com marca e categoria corretas, sem o PC-1679',()=>{
 // 19/10: a secao Destaques saiu na restauracao de 13/10; a vitrine agora fica na abertura (index.html).
 const html=readFileSync('public/index.html','utf8');
 const ids=[...html.matchAll(/class="show-item" href="\?produto=(PC-\d+)#catalogo"/g)].map(m=>m[1]);
 assert.ok(ids.length>=8);
 assert.ok(!ids.includes('PC-1679'));
 for(const id of ids){const p=byId.get(id);assert.ok(p,id);assert.ok(['tenis','perfumaria','roupas','acessorios'].includes(p.categoria||'tenis'),id);}
});

test('floating WhatsApp hides only while scrolling down on small screens and never by transform',()=>{
 const ui=readFileSync('public/catalogo.js','utf8'),html=readFileSync('public/index.html','utf8');
 assert.match(ui,/matchMedia\('\(max-width: 820px\)'\)/);
 assert.match(ui,/classList\.add\('recolhido'\)/);
 assert.match(ui,/nearEnd/);
 assert.match(ui,/addEventListener\('scroll', \(\) => \{[^}]*\}, \{ passive: true \}\)/);
 assert.match(html,/\.whatsapp\.recolhido\{opacity:0;visibility:hidden;pointer-events:none\}/);
 assert.doesNotMatch(html,/\.recolhido\{[^}]*transform/);
});
