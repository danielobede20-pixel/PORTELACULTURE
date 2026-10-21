import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reverterCapas,lerAplicadas} from '../scripts/capas-reverter.mjs';
const catalog=JSON.parse(readFileSync('public/catalogo.json','utf8'));
const aplicadas=lerAplicadas(); // CAPAS-20261021: troca de capa autorizada, revertida em memoria antes do hash (scripts/dados/capas-aplicadas.json)
const assets=JSON.parse(readFileSync('worker/catalog-assets.json','utf8'));
// 21/10: 22085 - 61 fotos exclusivas do PC-1631 (removido a pedido do Daniel) = 22024; calculado pela base dcedca2.
test('all 22024 rescued collection photos are registered for existing R2 bucket',()=>{
 const rows=reverterCapas(catalog,aplicadas).filter(x=>/^PC-/.test(x.id)&&x.categoria!=='perfumaria').flatMap(x=>x.fotos||[]).filter(s=>s.startsWith('media/catalogo/colecao-20261010/'));
 const unique=[...new Set(rows)];assert.equal(unique.length,22024);
 for(const s of unique){assert.ok(Object.hasOwn(assets,s),'Unregistered '+s);assert.match(assets[s].sha256,/^[a-f0-9]{64}$/);assert.ok(assets[s].bytes>12);}
});
