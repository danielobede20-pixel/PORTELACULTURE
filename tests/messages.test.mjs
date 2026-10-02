import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const context={URL}; runInNewContext(readFileSync('public/conversao-core.js','utf8'),context); const c=context.PortelaCore;

test('clothing orders use their category and size label',()=>{const m=c.message({product:{id:'PC-1000',nome:'Adidas Jaqueta',marca:'Adidas',categoria:'roupas'},size:'M'});assert.ok(m.includes('Categoria: roupas'));assert.ok(m.includes('Tamanho desejado: M'));});
test('large catalog references survive clean URLs',()=>{assert.equal(c.page('https://p.test/?produto=PC-12345&email=private#catalogo'),'/?produto=PC-12345#catalogo');});
test('campaign tracking accepts bounded labels without collecting other URL data',()=>{assert.equal(c.campaign('https://p.test/?utm_campaign=lancamento-outubro&email=private'),'lancamento-outubro');assert.equal(c.campaign('https://p.test/?utm_campaign=someone%40mail.com'),null);assert.equal(c.campaign('https://p.test/'),null);});
test('product message identifies the precise product and retains optional fields',()=>{const m=c.message({product:{id:'PC-214',nome:'NB 530 Prata',marca:'New Balance'},url:'https://portela.test/?produto=PC-214#catalogo',size:'40',city:'Brasília / DF'});assert.ok(m.startsWith('Olá! Vim pelo site da Portela Culture e tenho interesse no produto NB 530 Prata. Gostaria de consultar a disponibilidade.'));assert.ok(m.includes('PC-214'));assert.ok(m.includes('Brasília / DF'));assert.ok(m.includes('40'));});
test('generic and category messages do not contain undefined products',()=>{assert.ok(c.message({}).includes('atendimento'));assert.ok(c.message({category:'roupas'}).includes('roupas'));assert.ok(!c.message({}).includes('undefined'));});
test('all five quiz answers become readable WhatsApp context',()=>{const m=c.message({quiz:{category:'tenis',use:'lifestyle',brand:'Nike',availability:'pronta_entrega',intent:'opcoes'}});for(const s of ['tênis','Lifestyle','Nike','Pronta entrega','Quero ver opções']) assert.ok(m.includes(s));});
test('origin detects Instagram while page storage removes unrelated parameters',()=>{assert.equal(c.source('https://p.test/?utm_source=instagram',''),'instagram');assert.equal(c.source('https://p.test/','https://l.instagram.com/'),'instagram');assert.equal(c.source('https://p.test/',''),'direto');assert.equal(c.page('https://p.test/?email=private&produto=PC-214#catalogo'),'/?produto=PC-214#catalogo');});
