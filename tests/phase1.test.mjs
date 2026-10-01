import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from '../worker/index.js';
const event = { id: 'a1234567-1234-4123-8123-123456789abc', session: 'b1234567-1234-4123-8123-123456789abc', type: 'whatsapp_click', source: 'instagram', entry: '/?produto=PC-214#catalogo', page: '/#catalogo', placement: 'produto', productId: 'PC-214', quiz: {category:'tenis',use:'casual',brand:'New Balance',availability:'encomenda',intent:'agora'} };
function env() {
  const sql = new DatabaseSync(':memory:');
  for (const file of JSON.parse(readFileSync('drizzle/meta/_journal.json')).entries) sql.exec(readFileSync('drizzle/' + file.tag + '.sql', 'utf8'));
  return { sql, DB: { prepare(query) { let values = []; return { bind(...args) { values = args; return this; }, async run() { return sql.prepare(query).run(...values); }, async first() { return sql.prepare(query).get(...values) || null; } }; } } };
}
function request(body = event, origin = 'https://portela.test', method = 'POST') { return new Request('https://portela.test/api/interesses', {method,headers: {'content-type':'application/json',origin}, ...(method === 'POST' ? {body: JSON.stringify(body)} : {})}); }
test('durable product event is stored with server-owned catalog metadata', async () => {
 const e = env(); const r = await worker.fetch(request(),e); assert.equal(r.status,201); const row = e.sql.prepare('SELECT * FROM interesses').get(); assert.equal(row.produto_id,'PC-214'); assert.equal(row.marca,'New Balance'); assert.equal(row.status,'novo'); assert.equal(row.clique_whatsapp,1); assert.equal(row.origem,'instagram'); assert.equal(JSON.parse(row.quiz).use,'casual'); assert.ok(row.criado_em);
});
test('retrying same event cannot duplicate records', async () => {const e=env(); await worker.fetch(request(),e); await worker.fetch(request(),e); assert.equal(e.sql.prepare('SELECT count(*) as n FROM interesses').get().n,1);});
test('quiz completion is distinct from a WhatsApp click',async()=>{const e=env(); const r=await worker.fetch(request({...event,type:'quiz_complete',productId:null}),e);assert.equal(r.status,201);assert.equal(e.sql.prepare('SELECT clique_whatsapp FROM interesses').get().clique_whatsapp,0);});
test('forged product reference is rejected',async()=>{assert.equal((await worker.fetch(request({...event,productId:'INVALID'}),env())).status,400);});
test('unknown quiz fields and invalid choices are rejected',async()=>{assert.equal((await worker.fetch(request({...event,quiz:{category:'hacked'}}),env())).status,400);assert.equal((await worker.fetch(request({...event,quiz:{phone:'secret'}}),env())).status,400);});
test('cross-site submissions and public reads are blocked',async()=>{const e=env();assert.equal((await worker.fetch(request(event,'https://other.test'),e)).status,403);assert.equal((await worker.fetch(request(event,undefined,'GET'),e)).status,405);});
test('URLs cannot collect arbitrary query strings or external locations',async()=>{assert.equal((await worker.fetch(request({...event,entry:'/?email=private'}),env())).status,400);assert.equal((await worker.fetch(request({...event,page:'https://elsewhere.test'}),env())).status,400);});
test('storage outage returns recoverable error without pretending it saved',async()=>{assert.equal((await worker.fetch(request(),{})).status,503);});
test('large requests are bounded',async()=>{assert.equal((await worker.fetch(request({...event,extra:'x'.repeat(7000)}),env())).status,413);});
test('session limit bounds repeated submissions without blocking idempotent retry',async()=>{const e=env();for(let i=0;i<30;i++)assert.equal((await worker.fetch(request({...event,id:crypto.randomUUID()}),e)).status,201);assert.equal((await worker.fetch(request({...event,id:crypto.randomUUID()}),e)).status,429);});
test('prototype property names cannot crash quiz validation',async()=>{for(const key of ['constructor','toString','__proto__']){const quiz=JSON.parse('{"'+key+'":"Nike"}');assert.equal((await worker.fetch(request({...event,quiz}),env())).status,400);}});
