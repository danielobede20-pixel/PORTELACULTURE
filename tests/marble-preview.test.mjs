import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync, statSync} from 'node:fs';
const html = readFileSync('public/index.html', 'utf8');
const css = readFileSync('public/marble-preview.css', 'utf8');
const ui = readFileSync('public/catalogo.js', 'utf8');
const catalog = JSON.parse(readFileSync('public/catalogo.json', 'utf8'));
const byId = new Map(catalog.map(p => [p.id, p]));

test('marmore claro como fundo global continuo e leve', () => {
  assert.match(html, /<link rel="stylesheet" href="marble-preview\.css\?v=\d+">/);
  assert.match(css, /body:before\{[^}]*position:fixed;inset:0;[^}]*url\('media\/portela-marble-light\.webp'\)/);
  const size = statSync('public/media/portela-marble-light.webp').size;
  assert.ok(size < 150_000, 'textura de marmore deve ficar abaixo de 150 KB');
});

test('marca oficial preservada: brasao recortado do arquivo original e abertura em WebP', () => {
  assert.ok(existsSync('public/media/portela-crest-192.webp'));
  assert.match(html, /class="brand-crest"[^>]*><img src="media\/portela-crest-192\.webp"/);
  assert.match(html, /media\/portela-logo-integrado\.webp/);
});

test('imagens e referencias da home existem no catalogo real', () => {
  const refs = [...html.matchAll(/\?produto=(PC-\d+)/g)].map(m => m[1]);
  assert.ok(refs.length >= 3);
  for (const id of refs) assert.ok(byId.has(id), id);
  const imgs = [...html.matchAll(/<img[^>]+src="(media\/[^"]+)"/g)].map(m => m[1]);
  for (const src of imgs) assert.ok(existsSync('public/' + src), src);
  for (const [id, src] of [['PC-900002', 'pc-900002'], ['PC-900015', 'pc-900015'], ['PC-900016', 'pc-900016'], ['PC-900001', 'pc-900001'], ['PC-900030', 'pc-900030']]) {
    assert.ok(byId.get(id).fotos.some(f => f.includes(src)), id);
  }
});

test('Unissex nao e categoria; Masculino e Feminino levam a roupas (dado verificado)', () => {
  assert.equal(byId.get('PC-900001').genero, 'Unissex'); // continua como informacao do perfume
  assert.ok(catalog.filter(p => p.genero === 'Unissex').every(p => ['perfumaria', 'roupas'].includes(p.categoria)));
  assert.doesNotMatch(html, /data-catalog-gender="Unissex"|genero=Unissex|category-unissex|cat-unissex/);
  for (const g of ['Masculino', 'Feminino']) {
    assert.ok(catalog.some(p => p.categoria === 'perfumaria' && p.genero === g), g);
    assert.ok((html.match(new RegExp('data-catalog-gender="' + g + '" href="\\?categoria=roupas&genero=' + g + '#catalogo"', 'g')) || []).length >= 2, g);
  }
});

test('sem precos, frete gratis, parcelamento ou carrinho inventados', () => {
  assert.doesNotMatch(html, /R\$\s?\d/);
  assert.doesNotMatch(html, /frete gr[aá]tis|12x|parcel|carrinho|favoritos/i);
});

test('codigos PC nao aparecem para o cliente', () => {
  assert.doesNotMatch(html.replace(/<[^>]+>/g, ' '), /PC-\d/);
  assert.doesNotMatch(ui, /ref\.textContent\s*=\s*p\.id/);
  assert.doesNotMatch(ui, /'Refer[eê]ncia ' \+ p\.id/);
  assert.doesNotMatch(ui, /alt = p\.nome \+ ' — ' \+ p\.id/);
});

test('vitrine interativa da abertura usa produtos reais e recortes existentes', () => {
  const items = [...html.matchAll(/<a class="show-item" href="\?produto=(PC-\d+)#catalogo"[^>]*><span class="show-media"><img src="(media\/vitrine\/[^"]+)"/g)];
  assert.ok(items.length >= 8);
  for (const [, id, src] of items) { assert.ok(byId.has(id), id); assert.ok(existsSync('public/' + src), src); }
  assert.match(html, /<script src="vitrine\.js\?v=\d+" defer><\/script>/);
  const js = readFileSync('public/vitrine.js', 'utf8');
  assert.match(js, /prefers-reduced-motion/);
  assert.match(js, /visibilitychange/);
  assert.match(html, /data-show="toggle"/);
});

test('cards de perfume usam recorte sem fundo para todos os 40 perfumes', () => {
  for (const p of catalog.filter(p => p.categoria === 'perfumaria')) assert.ok(existsSync('public/media/vitrine/' + p.id.toLowerCase() + '.webp'), p.id);
  assert.match(ui, /function setCardImage\(img, p\)/);
});
