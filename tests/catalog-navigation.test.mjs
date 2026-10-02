import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const context={};
const core=vm.runInNewContext(readFileSync(new URL('../public/catalogo-core.js',import.meta.url),'utf8')+';PortelaCatalog',context);
const items=[
 {id:'a',marca:'Nike',nome:'Nike Dunk Low',categoria:'tenis',linha:'Dunk Low'},
 {id:'b',marca:'Adidas',nome:'Adidas Samba',categoria:'tenis',linha:'Samba'},
 {id:'c',marca:'Alo',nome:'Alo Camiseta',categoria:'roupas',linha:'Camisetas'},
 {id:'d',marca:'Alo',nome:'Alo Runner',categoria:'tenis',linha:'Runner'},
 {id:'e',marca:'Alo',nome:'Alo Gorro',categoria:'acessorios',linha:'Gorros'},
 {id:'f',marca:'Nike',nome:'Nike Camiseta',categoria:'roupas',linha:'Camisetas'},
 {id:'g',marca:'On',nome:'On Cloudtilt',categoria:'tenis',linha:'Cloudtilt'},
];

test('Alo exposes only clothing while other brands keep all categories',()=>{
 assert.equal(core.visibleProducts(items).map(p=>p.id).join(','),'a,b,c,f,g');
});
test('model selection cannot cross brands or product categories',()=>{
 assert.equal(core.matches(items[0],{brand:'Adidas',line:'Dunk Low'}),false);
 assert.equal(core.matches(items[5],{brand:'Nike',category:'tenis'}),false);
 assert.equal(core.matches(items[0],{brand:'Nike',line:'Dunk Low',category:'tenis'}),true);
});
test('brand menu contains only the models present in the selected category',()=>{
 const groups=core.groups(core.visibleProducts(items),'roupas');
 assert.equal(groups.length,2);
 assert.equal(groups.find(g=>g.brand==='Alo').lines.map(l=>l.name).join(','),'Camisetas');
 assert.equal(groups.some(g=>g.brand==='On'),false);
});
test('On Running label and legacy Dunk model names remain recognizable',()=>{
 assert.equal(core.label('On'),'On Running');
 assert.equal(core.line({nome:'Nike SB Dunk Low',categoria:'tenis'}),'Dunk SB');
 assert.equal(core.line({nome:'Nike Dunk High',categoria:'tenis'}),'Dunk High');
});
