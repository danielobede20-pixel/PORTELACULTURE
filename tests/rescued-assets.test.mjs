import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const catalog=JSON.parse(readFileSync('public/catalogo.json','utf8'));
const assets=JSON.parse(readFileSync('worker/catalog-assets.json','utf8'));
test('all 21998 active rescued collection photos are registered for the existing R2 bucket',()=>{
 const rows=catalog.filter(x=>/^PC-/.test(x.id)&&x.categoria!=='perfumaria').flatMap(x=>x.fotos||[]).filter(s=>s.startsWith('media/catalogo/colecao-20261010/'));
 const unique=[...new Set(rows)];assert.equal(unique.length,21998);
 for(const s of unique){assert.ok(Object.hasOwn(assets,s),'Unregistered '+s);assert.match(assets[s].sha256,/^[a-f0-9]{64}$/);assert.ok(assets[s].bytes>12);}
});
