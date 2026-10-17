import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
const html = readFileSync('public/index.html', 'utf8');
const ui = readFileSync('public/catalogo.js', 'utf8');
const catalog = JSON.parse(readFileSync('public/catalogo.json', 'utf8'));

test('visual de 13/10: sem a secao Destaques de 14/10', () => {
  assert.ok(!html.includes('id="destaques"'));
  assert.ok(!html.includes('destaques-lista'));
  assert.ok(!ui.includes('#destaques-lista'));
});

test('visual de 13/10: ordem das secoes preservada', () => {
  const ordem = ['id="inicio"', 'id="manifesto"', 'id="estilo"', 'id="categorias"', 'id="selecao"', 'id="catalogo"', 'id="como-pedir"'];
  const pos = ordem.map(id => html.indexOf(id));
  pos.forEach((p, i) => assert.ok(p > 0, ordem[i]));
  assert.deepEqual([...pos].sort((a, b) => a - b), pos);
});

test('visual de 13/10: selecao curada e perfumaria mantidas', () => {
  assert.match(ui, /\['PC-001', 'PC-003', 'PC-214'\]\.forEach/);
  assert.ok(html.includes('data-catalog-category="perfumaria"'));
  assert.ok(html.includes('media/portela-culture-opening.png'));
});

test('links externos em nova aba usam rel=noopener', () => {
  const sem = [...html.matchAll(/<a[^>]*target="_blank"[^>]*>/g)].map(m => m[0]).filter(t => !/rel="[^"]*noopener/.test(t));
  assert.deepEqual(sem, []);
});

test('catalogo integral de 2818 produtos com ids unicos', () => {
  assert.equal(catalog.length, 2818);
  assert.equal(new Set(catalog.map(p => p.id)).size, 2818);
});

test('abertura usa WebP otimizado com PNG original como fallback', () => {
  const pic = html.match(/<picture>.*?<\/picture>/s)?.[0] || '';
  assert.match(pic, /type="image\/webp"/);
  assert.match(pic, /portela-culture-opening-900\.webp 900w/);
  assert.match(pic, /<img class="brand-art" src="media\/portela-culture-opening\.png"/);
  for (const f of ['portela-culture-opening.webp', 'portela-culture-opening-900.webp']) assert.ok(existsSync('public/media/' + f), f);
  assert.match(readFileSync('public/brand-opening.css', 'utf8'), /\.brand-stage picture\{display:contents\}/);
});
