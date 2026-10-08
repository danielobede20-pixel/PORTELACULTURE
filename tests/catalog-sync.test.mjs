import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';

const client = JSON.parse(readFileSync('public/catalogo.json','utf8'));
const server = JSON.parse(readFileSync('worker/catalog.json','utf8'));
const stripImages = ({fotos,...fields}) => fields;

test('catalog client and worker share exactly the same references and metadata',()=>{
  assert.ok(client.length >= 1505,'Do not drop published catalog references');
  assert.equal(client.length,server.length);
  assert.equal(new Set(client.map(p=>p.id)).size,client.length,'Duplicate product ID');
  for(let i=0;i<client.length;i++)assert.deepStrictEqual(stripImages(client[i]),server[i],client[i].id);
});

test('62 published Nike additions retain their 62 local images',()=>{
  const additions=client.filter(p=>Number(p.id.replace('PC-',''))>=1450);
  assert.equal(additions.length,62);
  for(const p of additions){
    assert.equal(p.marca,'Nike',p.id);
    assert.ok(p.fotos?.length,p.id);
    for(const rel of p.fotos){
      assert.match(rel,/^media\/catalogo\/.+\.webp$/);
      const file=join('public',rel);
      assert.ok(existsSync(file),'Missing published image: '+file);
      const bytes=readFileSync(file);
      assert.equal(bytes.toString('ascii',0,4),'RIFF',file);
      assert.equal(bytes.toString('ascii',8,12),'WEBP',file);
    }
  }
});
