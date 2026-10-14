import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
const catalog=JSON.parse(readFileSync('public/catalogo.json','utf8'));
const assets=JSON.parse(readFileSync('worker/catalog-assets.json','utf8'));
const ui=readFileSync('public/catalogo.js','utf8');
const html=readFileSync('public/index.html','utf8');
const IDS=['PC-351','PC-355','PC-214','PC-362','PC-368','PC-374','PC-2747','PC-1706','PC-2857','PC-462','PC-474','PC-2809'];

test('Destaques Portela renders the 12 approved ids from the existing catalog objects',()=>{
 const line=ui.split('\n').find(l=>l.includes('#destaques-lista')||l.includes('featured.append'))||'';
 const block=ui.slice(ui.indexOf("const featured"),ui.indexOf('if (requested)'));
 const listed=[...block.matchAll(/'(PC-\d+)'/g)].map(m=>m[1]);
 assert.deepEqual(listed,IDS);
 assert.ok(line);
 for(const id of IDS){
  const p=catalog.find(item=>item.id===id);
  assert.ok(p,id);
  assert.ok(existsSync('public/'+p.fotos[0])||Object.hasOwn(assets,p.fotos[0]),id+' cover');
 }
 assert.match(block,/image\.loading\s*=\s*'lazy'/);
 assert.match(block,/card\.type\s*=\s*'button'/);
 assert.match(block,/image\.alt\s*=\s*p\.nome/);
 assert.match(block,/ref\.textContent\s*=\s*PortelaCatalog\.label\(p\.marca\)/);
 assert.doesNotMatch(block,/textContent\s*=[^;]*p\.id/);
 assert.match(block,/addEventListener\('click',\(\)=>showProduct\(p\)\)/);
 assert.doesNotMatch(block,/preco|price|R\$|genero/i);
});

test('new section is additive and the current curated section is untouched',()=>{
 assert.match(html,/<section id="selecao">.*?Três pontos de partida\..*?id="curated"/);
 assert.match(ui,/\['PC-001', 'PC-003', 'PC-214'\]\.forEach/);
 assert.match(html,/id="destaques"[^>]*aria-labelledby="destaques-title"/);
 assert.match(html,/id="destaques-lista"/);
 assert.ok(html.indexOf('id="selecao"')<html.indexOf('id="destaques"')&&html.indexOf('id="destaques"')<html.indexOf('id="catalogo"'));
 for(const keep of ['id="manifesto"','id="categorias"','id="catalogo"','id="como-pedir"','data-catalog-category="perfumaria"','https://wa.me/5561995158424'])assert.ok(html.includes(keep),keep);
 assert.equal((html.match(/id="destaques-lista"/g)||[]).length,1);
});

test('no invented content in the new section (no price, gender or metrics)',()=>{
 const section=html.match(/<section id="destaques".*?<\/section>/)[0];
 assert.doesNotMatch(section,/R\$|\d+%|masculin|feminin|original|autêntic|esgotad|estoque/i);
});
