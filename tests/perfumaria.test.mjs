import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import vm from 'node:vm';
const core=vm.runInNewContext(readFileSync('public/catalogo-core.js','utf8')+';PortelaCatalog');
const context={URL};vm.runInNewContext(readFileSync('public/conversao-core.js','utf8'),context);
const conversion=context.PortelaCore;
const catalog=JSON.parse(readFileSync('public/catalogo.json','utf8'));
const perfumes=catalog.filter(p=>p.categoria==='perfumaria');

test('perfumaria has 72 items, each with a local image and complete labels',()=>{
 assert.equal(perfumes.length,72);
 for(const p of perfumes){
  assert.ok(p.marca&&p.genero&&p.volume&&['Perfume','Kit','Body Splash','Hidratante'].includes(p.subtipo),p.id);
  assert.ok(p.fotos.every(src=>src.startsWith('media/perfumaria/')&&existsSync('public/'+src)),p.id);
 }
});
test('gender, brand and type filters combine inside perfumaria only',()=>{
 const pick=selection=>perfumes.filter(p=>core.matches(p,{category:'perfumaria',...selection}));
 assert.equal(pick({}).length,72);
  // 24/10: dentro de Perfumes, Masculino/Feminino filtram perfumes (Unissex entra nos dois); fora de Perfumes continuam so roupas.
  assert.ok(pick({gender:'Feminino'}).length>0&&pick({gender:'Feminino'}).every(p=>['Feminino','Unissex'].includes(p.genero)));
  assert.equal(catalog.filter(p=>p.categoria==='perfumaria'&&core.matches(p,{gender:'Feminino'})).length,0,'sem categoria, perfumes nao entram no Feminino');
  assert.equal(catalog.filter(p=>p.categoria==='perfumaria'&&core.matches(p,{category:'roupas',gender:'Masculino'})).length,0);
 assert.ok(pick({kind:'Kit'}).every(p=>p.subtipo==='Kit')&&pick({kind:'Kit'}).length>0);
 assert.equal(['Kit','Perfume','Body Splash','Hidratante'].reduce((n,kind)=>n+pick({kind}).length,0),72);
 const brand=perfumes[0].marca,combined=pick({brand,kind:perfumes[0].subtipo});
 assert.ok(combined.includes(perfumes[0])&&combined.every(p=>p.marca===brand));
 assert.equal(catalog.filter(p=>p.categoria!=='perfumaria'&&core.matches(p,{category:'perfumaria'})).length,0);
});
test('filter options are derived only from perfumaria and card specs show brand, concentration and volume',()=>{
 const options=core.perfumeOptions(catalog);
 assert.deepEqual(Array.from(options.kind),['Body Splash','Hidratante','Kit','Perfume']);
 assert.ok(options.gender.includes('Masculino')&&options.gender.includes('Feminino'));
 assert.ok(options.brand.every(b=>perfumes.some(p=>p.marca===b)));
 assert.equal(core.perfumeSpecs({marca:'LATTAFA',concentracao:'EDP',volume:100}),['LATTAFA','EDP','100 ml'].join(String.fromCharCode(32,183,32)));
 assert.equal(core.perfumeSpecs({marca:'ARMAF',volume:30}),['ARMAF','30 ml'].join(String.fromCharCode(32,183,32)));
});
test('perfume WhatsApp message keeps product context and optional city, without size or prices',()=>{
 const p=perfumes[0],url='https://portela.test/?produto='+p.id+'#catalogo';
 const city='Brasília / DF',m=conversion.message({product:p,url,size:'42',city});
 for(const s of [p.nome,p.id,p.marca,p.volume+' ml',city,url])assert.ok(m.includes(s),s);
 assert.ok(!/c[oó]digo/i.test(m),'supplier code must not be sent to customers');
 assert.ok(!m.includes('42')&&!/R\$|[¥￥]|\b(?:JPY|CNY|RMB)\b|undefined/i.test(m));
 assert.ok(!conversion.message({product:p,url}).includes('Cidade'));
});
test('public catalog exposes no private supplier metadata or yuan/yen prices',()=>{
 const privateKey=/yupoo|1688|taobao|weidian|supplier|fornecedor|origem|custo|cost|album|raw|interno|internal|privad/i;
 const privateValue=/yupoo|1688\.com|taobao|weidian|[¥￥]|\b(?:JPY|CNY|RMB)\b|yuan|iene/i;
 for(const p of catalog){
  for(const [key,value] of Object.entries(p)){
   assert.ok(!privateKey.test(key),p.id+' campo privado: '+key);
   if(typeof value==='string')assert.ok(!privateValue.test(value),p.id+' valor privado em '+key);
  }
  for(const src of [...(p.fotos||[]),...(p.imagens||[])])assert.ok(!privateValue.test(src),p.id+' imagem com origem privada');
 }
});
test('perfumaria route and filter controls exist in the page and script',()=>{
 const html=readFileSync('public/index.html','utf8'),script=readFileSync('public/catalogo.js','utf8');
  // 21/10: perfumes sem filtro de genero; Masculino/Feminino do menu levam a roupas.
  for(const g of ['Masculino','Feminino'])assert.ok(html.includes('data-catalog-gender="'+g+'"'),g);
  assert.ok(!html.includes('data-catalog-gender="Unissex"'));
 assert.ok(html.includes('data-catalog-category="perfumaria"'),'Perfumaria must be visible in the home categories');
 assert.ok(script.includes("params.get('categoria')")&&script.includes("'Consultar'"));
});
test('perfumaria public data carries no supplier code: no codigo field and photos named by Portela reference',()=>{
 const worker=JSON.parse(readFileSync('worker/catalog.json','utf8')).filter(p=>p.categoria==='perfumaria');
 assert.equal(worker.length,72);
 for(const p of [...perfumes,...worker])assert.ok(!('codigo' in p),p.id+' expõe codigo');
 for(const p of perfumes){
  const ref=p.id.toLowerCase();
  assert.match(ref,/^pc-9\d{5}$/);
  for(const src of p.fotos){
   assert.ok(src.startsWith('media/perfumaria/'+ref+'-'),p.id+' foto fora do padrão: '+src);
   assert.ok(existsSync('public/'+src),p.id+' foto ausente: '+src);
  }
 }
});
test('kit names use Portuguese wording without inventing quantities',()=>{
 for(const p of perfumes){
  assert.ok(!/PIEZAS/i.test(p.nome),p.id+' ainda tem PIEZAS');
  assert.ok(!/\bpeças\b/.test(p.nome)||/\d peças/.test(p.nome),p.id+' peças sem quantidade');
 }
});
test('prices: public price is a positive BRL number, shown on card and detail, never in the WhatsApp message',()=>{
 const priced=perfumes.filter(p=>'preco' in p);
 assert.ok(priced.length===72,'expected most perfumes priced, got '+priced.length);
 for(const p of priced){assert.equal(typeof p.preco,'number',p.id);assert.ok(p.preco>50&&p.preco<2000,p.id+' preço fora da faixa');}
 assert.equal(core.price({preco:152.9}),'R$ 152,90'.replace(' ',String.fromCharCode(160)).replace(String.fromCharCode(160),' '));
 assert.equal(core.price({}),'');
 // 23/10: Daniel autorizou preço em tênis (regra: max(50% do oficial, piso R$ 539,90)). Roupas e acessórios seguem sem preço.
 const outros=catalog.filter(p=>p.categoria!=='perfumaria'&&'preco' in p);
 // 23/10 19:31: tabela acessível de roupas/acessórios (custo x ~1,6) substitui o preço único de R$ 249,90.
 for(const p of outros){assert.equal(typeof p.preco,'number',p.id);assert.ok(p.preco>0&&p.preco<750,p.id+' preço fora da faixa');if(p.categoria==='tenis')assert.ok(p.preco>=539.9,p.id+' tênis abaixo do piso');}
 const script=readFileSync('public/catalogo.js','utf8');
 assert.ok(script.includes('product-price')&&script.includes('PortelaCatalog.price(p)'));
 const m=conversion.message({product:priced[0],url:'https://portela.test/?produto='+priced[0].id});
 assert.ok(!/R\$/.test(m),'WhatsApp message must not carry the price');
});
test('new perfumaria items keep the vitrine cutout used by the cards',()=>{
 for(const p of perfumes.filter(p=>Number(p.id.slice(3))>=900041))assert.ok(existsSync('public/media/vitrine/'+p.id.toLowerCase()+'.webp'),p.id);
});
