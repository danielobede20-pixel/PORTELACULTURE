import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync('public/catalogo.js','utf8');
const filters=source.slice(source.indexOf('const normalize'),source.indexOf('function showProduct'));
function match(product,{marca='',linha='',busca='',categoria=''}={}) {
 const context={brand:{value:marca},model:{value:linha},search:{value:busca},category:{value:categoria},product};
 vm.createContext(context);vm.runInContext(filters,context);
 return vm.runInContext('matches(product)',context);
}
test('category and brand filters combine without mixing clothing and shoes',()=>{
 const p={id:'PC-1000',nome:'Adidas Jaqueta',marca:'Adidas',categoria:'roupas'};
 assert.equal(match(p,{categoria:'roupas',marca:'Adidas'}),true);
 assert.equal(match(p,{categoria:'tenis',marca:'Adidas'}),false);
 assert.equal(match(p,{categoria:'roupas',marca:'Nike'}),false);
});
test('brand and line cannot leak matching products from another brand',()=>{
 const linha=JSON.stringify(['Adidas','Samba']);
 assert.equal(match({nome:'Adidas Samba — Preto',marca:'Adidas',linha:'Samba',id:'PC-356'},{linha}),true);
 assert.equal(match({nome:'Nike Samba',marca:'Nike',linha:'Samba',id:'PC-001'},{linha}),false);
 assert.equal(match({nome:'Adidas Gazelle',marca:'Adidas',linha:'Gazelle Indoor',id:'PC-358'},{linha}),false);
});
test('legacy Dunk and New Balance line filtering survives the expanded catalog',()=>{
 assert.equal(match({nome:'Nike SB Dunk Low',marca:'Nike',id:'PC-001'},{linha:JSON.stringify(['Nike','Dunk SB'])}),true);
 assert.equal(match({nome:'Nike Dunk Low Retro',marca:'Nike',id:'PC-002'},{linha:JSON.stringify(['Nike','Dunk Low'])}),true);
 assert.equal(match({nome:'New Balance 530',marca:'New Balance',linha:'530',id:'PC-214'},{linha:JSON.stringify(['New Balance','530'])}),true);
});
test('reference and accented name search work together with new brand filters',()=>{
 const p={nome:'On Cloud 6 — Café',marca:'On',linha:'Cloud 6',id:'PC-372'};
 assert.equal(match(p,{marca:'On',busca:'cafe'}),true);
 assert.equal(match(p,{marca:'On',busca:'PC-372'}),true);
 assert.equal(match(p,{marca:'ASICS',busca:'PC-372'}),false);
});
