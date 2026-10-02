import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const core=vm.runInNewContext(readFileSync('public/catalogo-core.js','utf8')+';PortelaCatalog');
function match(product,{marca='',linha='',categoria=''}={}) {
 return core.matches(product,{brand:marca,line:linha,category:categoria});
}
test('category and brand filters combine without mixing clothing and shoes',()=>{
 const p={id:'PC-1000',nome:'Adidas Jaqueta',marca:'Adidas',categoria:'roupas'};
 assert.equal(match(p,{categoria:'roupas',marca:'Adidas'}),true);
 assert.equal(match(p,{categoria:'tenis',marca:'Adidas'}),false);
 assert.equal(match(p,{categoria:'roupas',marca:'Nike'}),false);
});
test('brand and line cannot leak matching products from another brand',()=>{
 const selection={marca:'Adidas',linha:'Samba'};
 assert.equal(match({nome:'Adidas Samba — Preto',marca:'Adidas',linha:'Samba',id:'PC-356'},selection),true);
 assert.equal(match({nome:'Nike Samba',marca:'Nike',linha:'Samba',id:'PC-001'},selection),false);
 assert.equal(match({nome:'Adidas Gazelle',marca:'Adidas',linha:'Gazelle Indoor',id:'PC-358'},selection),false);
});
test('legacy Dunk and New Balance line filtering survives the expanded catalog',()=>{
 assert.equal(match({nome:'Nike SB Dunk Low',marca:'Nike',id:'PC-001'},{marca:'Nike',linha:'Dunk SB'}),true);
 assert.equal(match({nome:'Nike Dunk Low Retro',marca:'Nike',id:'PC-002'},{marca:'Nike',linha:'Dunk Low'}),true);
 assert.equal(match({nome:'New Balance 530',marca:'New Balance',linha:'530',id:'PC-214'},{marca:'New Balance',linha:'530'}),true);
});
test('every catalog product is reachable through its brand and model without typed search',()=>{
 const catalog=core.visibleProducts(JSON.parse(readFileSync('public/catalogo.json')));
 const groups=core.groups(catalog);
 for(const p of catalog){
  const brand=groups.find(g=>g.brand===p.marca);
  assert.ok(brand.lines.some(l=>l.name===core.line(p)),p.id);
  assert.equal(match(p,{marca:p.marca,linha:core.line(p)}),true);
 }
 assert.doesNotMatch(readFileSync('public/index.html','utf8'),/id=["']busca["']|Buscar modelo ou referência/i);
});
