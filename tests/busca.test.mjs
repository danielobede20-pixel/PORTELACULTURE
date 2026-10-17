import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const core = vm.runInNewContext(readFileSync('public/catalogo-core.js', 'utf8') + ';PortelaCatalog');
const catalog = core.visibleProducts(JSON.parse(readFileSync('public/catalogo.json', 'utf8')));
const html = readFileSync('public/index.html', 'utf8');
const ui = readFileSync('public/catalogo.js', 'utf8');
const find = q => catalog.filter(p => core.search(p, q));

test('busca vazia nao filtra nada', () => {
  assert.equal(find('').length, catalog.length);
  assert.equal(find('   ').length, catalog.length);
});

test('busca ignora acentos e maiusculas e exige todos os termos', () => {
  const dunk = find('DUNK low');
  assert.ok(dunk.length > 0);
  assert.ok(dunk.every(p => /dunk/i.test(p.nome) && /low/i.test(p.nome + ' ' + core.line(p))));
  assert.deepEqual(find('tênis nike').map(p => p.id), find('tenis NIKE').map(p => p.id));
});

test('busca encontra por marca, referencia e perfumaria', () => {
  assert.ok(find('new balance').every(p => p.marca === 'New Balance' || /new balance/i.test(p.nome)));
  assert.deepEqual(find('PC-001').map(p => p.id), ['PC-001']);
  assert.ok(find('lattafa').length > 0 && find('lattafa').every(p => p.categoria === 'perfumaria'));
});

test('termo inexistente retorna vazio', () => {
  assert.equal(find('zzzz-inexistente').length, 0);
});

test('campo de busca acessivel no catalogo e atalho no cabecalho', () => {
  assert.match(html, /<label for="busca"[^>]*>[^<]*<input id="busca" type="search"/);
  assert.match(html, /class="nav-search" href="#catalogo" aria-label="Buscar no catálogo"/);
  assert.match(ui, /PortelaCatalog\.search\(p,\s*query\)/);
});
