import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {assistant} from '../worker/ia.js';
const catalog=JSON.parse(readFileSync('worker/catalog.json','utf8'));
const asics=catalog.filter(p=>p.marca==='ASICS').slice(0,6);

function env(){
 const sql=new DatabaseSync(':memory:');
 for(const e of JSON.parse(readFileSync('drizzle/meta/_journal.json')).entries) sql.exec(readFileSync('drizzle/'+e.tag+'.sql','utf8'));
 return {sql,PORTELA_IA_ENABLED:'1',OPENAI_API_KEY:'test-secret',PORTELA_IA_MONTHLY_USD:'20',DB:{prepare(q){let args=[];return {bind(...a){args=a;return this;},async first(){return sql.prepare(q).get(...args)||null;},async run(){return sql.prepare(q).run(...args);}};}}};
}
function req(body={messages:['Quero ASICS']},origin='https://portela.test'){
 return new Request('https://portela.test/api/ia',{method:'POST',headers:{origin,'content-type':'application/json','cf-connecting-ip':'192.0.2.1'},body:JSON.stringify(body)});
}
function mockProvider(ids=['PC-362'],kind='modelos',inspect=()=>{}){
 return async(url,opts)=>{
  const b=JSON.parse(opts.body);
  assert.equal(b.store,false);
  assert.equal(b.model,'gpt-4.1-mini-2025-04-14');
  assert.doesNotMatch(JSON.stringify(b),/SELECT |observacoes|historico|test-secret/);
  assert.ok(Buffer.byteLength(opts.body,'utf8')<=80000,'Exceeded API payload byte budget');
  inspect(b);
  return Response.json({output:[{content:[{type:'output_text',text:JSON.stringify({ids,kind})}]}]});
 };
}
function ids(b){return b.text.format.schema.properties.ids.items.enum;}
function candidates(b){const match=b.instructions.match(/Candidatos JSON: (\[[\s\S]*\])$/);assert.ok(match,'Candidate list missing');return JSON.parse(match[1]);}

test('disabled deployment does not advertise AI or call the provider',async()=>{
 const e=env();e.PORTELA_IA_ENABLED='0';
 assert.deepEqual(await (await assistant(new Request('https://portela.test/api/ia'),e,catalog)).json(),{enabled:false});
 assert.equal((await assistant(req(),e,catalog,()=>{throw Error('must not call');})).status,503);
});

test('GET AI does not advertise service without a working database',async()=>{
 const e=env();delete e.DB;
 assert.deepEqual(await (await assistant(new Request('https://portela.test/api/ia'),e,catalog)).json(),{enabled:false});
});

test('AI uses canonical references and never exposes secrets or private records',async()=>{
 const r=await assistant(req(),env(),asics,mockProvider());
 assert.equal(r.status,200);const b=await r.json();
 assert.equal(b.products[0].id,'PC-362');assert.equal(b.products[0].marca,'ASICS');
 assert.doesNotMatch(JSON.stringify(b),/test-secret/);
});

test('foreign origins, oversized conversations and missing configuration do not call the provider',async()=>{
 const no=()=>{throw Error('provider must not run');};
 assert.equal((await assistant(req({},'https://other.test'),env(),asics,no)).status,403);
 assert.equal((await assistant(req({messages:['x'.repeat(601)]}),env(),asics,no)).status,400);
 const e=env();delete e.OPENAI_API_KEY;assert.equal((await assistant(req(),e,asics,no)).status,503);
});

test('monthly reservation blocks beyond authorized $20 even with simultaneous callers',async()=>{
 const e=env();await assistant(req(),e,asics,mockProvider());
 e.sql.prepare("UPDATE ia_uso SET quantidade=399 WHERE id LIKE 'mes:%'").run();
 const r=await Promise.all([assistant(req(),e,asics,mockProvider()),assistant(req(),e,asics,mockProvider())]);
 assert.deepEqual(r.map(x=>x.status).sort(),[200,429]);
});

test('commercial questions get human confirmation and unknown model IDs fail closed',async()=>{
 const good=await (await assistant(req(),env(),asics,mockProvider([],'condicoes'))).json();
 assert.match(good.message,/confirmad/);assert.equal(good.products.length,0);
 assert.equal((await assistant(req(),env(),asics,mockProvider(['PC-999999']))).status,503);
});

test('entire published catalog is supported with a small brand and line shortlist',async()=>{
 assert.equal(catalog.length,1505);
 const r=await assistant(req({messages:['Quero ASICS GEL-1130 preto e prata']}),env(),catalog,mockProvider(['PC-362'],'modelos',b=>{
  assert.ok(ids(b).includes('PC-362'));assert.ok(ids(b).length<=48);
  assert.ok(candidates(b).every(p=>p.marca==='ASICS'));
  assert.ok(!ids(b).includes('PC-1468'),'Unrelated brand leaked into ASICS shortlist');
 }));
 assert.equal(r.status,200);assert.equal((await r.json()).products[0].id,'PC-362');
});

test('Nike Alphafly newly published item is selectable without 1505-item prompt',async()=>{
 const r=await assistant(req({messages:['Quero Nike Alphafly NEXT%']}),env(),catalog,mockProvider(['PC-1468'],'modelos',b=>{
  assert.ok(ids(b).includes('PC-1468'));assert.ok(ids(b).length<20);
  assert.ok(candidates(b).every(p=>p.marca==='Nike'));
 }));
 assert.equal(r.status,200);
});

test('follow-up message remembers the earlier brand preference',async()=>{
 const r=await assistant(req({messages:['Quero modelos Adidas','Quero um Samba preto']}),env(),catalog,mockProvider(['PC-357'],'modelos',b=>{
  assert.ok(ids(b).includes('PC-357'));assert.ok(candidates(b).every(p=>p.marca==='Adidas'));
 }));
 assert.equal(r.status,200);
});

test('explicit selected IDs are restricted to the shortlist, even if ID exists in catalog',async()=>{
 const r=await assistant(req({messages:['Quero Adidas Samba']}),env(),catalog,mockProvider(['PC-1468']));
 assert.equal(r.status,503);
});

test('very large catalogs are shortlisted before provider and quota, not automatically blocked',async()=>{
 const fake=Array.from({length:2200},(_,i)=>({id:'PC-'+String(10000+i),nome:'Exemplo '+i,marca:'ASICS',categoria:'tenis',linha:'Exemplo'}));
 const id=fake[0].id;
 const e=env();
 const r=await assistant(req(),e,fake,mockProvider([id],'modelos',b=>{
  assert.ok(ids(b).length<=48);assert.ok(Buffer.byteLength(JSON.stringify(b))<80000);
 }));
 assert.equal(r.status,200);
 assert.equal(e.sql.prepare("SELECT quantidade FROM ia_uso WHERE id LIKE 'mes:%'").get().quantidade,1);
});

test('IP allowance and upstream failure retain the monthly reservation',async()=>{
 const e=env();for(let i=0;i<12;i++)assert.equal((await assistant(req(),e,asics,mockProvider())).status,200);
 assert.equal((await assistant(req(),e,asics,mockProvider())).status,429);
 const f=env();assert.equal((await assistant(req(),f,asics,async()=>new Response('',{status:429}))).status,503);
 assert.equal(f.sql.prepare("SELECT quantidade FROM ia_uso WHERE id LIKE 'mes:%'").get().quantidade,1);
});
