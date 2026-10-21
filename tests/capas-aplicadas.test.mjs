import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {lerAplicadas, reverterFotos} from '../scripts/capas-reverter.mjs';
// CAPAS-20261021: capas limpas/trocadas autorizadas pelo Daniel. Sem registro (nada aplicado ainda) o teste passa vazio.
const catalog=JSON.parse(readFileSync('public/catalogo.json','utf8'));
const assets=JSON.parse(readFileSync('worker/catalog-assets.json','utf8'));
const aplicadas=lerAplicadas();
const byId=new Map(catalog.map(p=>[p.id,p]));
test('cada capa aplicada existe em media/capas-limpas ou na galeria original, e nenhuma foto se perde',()=>{
 for(const [id,reg] of Object.entries(aplicadas)){
  const p=byId.get(id);
  assert.ok(p,id+' existe no catalogo');
  assert.notEqual(p.categoria||'tenis','tenis',id+' tenis fora do escopo');
  assert.equal(p.fotos[0],reg.nova_capa,id+' capa atual = nova_capa');
  const original=reverterFotos(p.fotos,reg);
  assert.equal(original[0],reg.capa_original,id);
  if(reg.tipo==='LIMPA_OK'){
   assert.equal(reg.nova_capa,'media/capas-limpas/'+id+'.webp',id);
   assert.ok(existsSync('public/'+reg.nova_capa),id+' arquivo limpo local');
   assert.equal(Object.hasOwn(assets,reg.nova_capa),false,id+' capa limpa e local, nao do R2');
   assert.deepEqual(p.fotos.slice(1),original.slice(1),id+' demais fotos intactas');
   assert.equal(p.fotos.length,original.length,id);
  }else if(reg.tipo==='TROCAR'){
   assert.ok(original.includes(reg.nova_capa),id+' nova capa estava na galeria original');
   assert.equal(original[reg.indice],reg.nova_capa,id);
   assert.deepEqual([...p.fotos].sort(),[...original].sort(),id+' mesmo conjunto de fotos (nenhuma perdida)');
  }else assert.fail(id+' tipo invalido '+reg.tipo);
  for(const src of p.fotos)assert.ok(existsSync('public/'+src)||Object.hasOwn(assets,src),id+' '+src);
  assert.equal(new Set(p.fotos).size,p.fotos.length,id+' sem fotos repetidas');
 }
});
