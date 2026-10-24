import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// 24/10 (videos do Daniel): Tenis/Roupas abrem marcas; Acessorios abre tipos; Perfumes abre Masculino/Feminino > tipos.
const html = readFileSync('public/index.html', 'utf8');
const script = readFileSync('public/catalogo.js', 'utf8');
const css = readFileSync('public/marble-preview.css', 'utf8');
const core = vm.runInNewContext(readFileSync('public/catalogo-core.js', 'utf8') + ';PortelaCatalog', {});
const catalog = core.visibleProducts(JSON.parse(readFileSync('public/catalogo.json', 'utf8')));

test('as 4 categorias do menu sao submenus com "Ver todos" de fallback', () => {
  for (const cat of ['perfumaria', 'tenis', 'roupas', 'acessorios']) {
    assert.match(html, new RegExp('<details class="nav-drop" data-drop="' + cat + '"><summary>[^<]+</summary><div class="nav-drop-panel" data-drop-panel="' + cat + '"><a data-catalog-category="' + cat + '" href="\\?categoria=' + cat + '#catalogo">Ver tod'));
  }
  assert.match(script, /buildDropMenus\(\)/);
  assert.match(css, /\.nav-drop\[open\]>\.nav-drop-panel\{position:absolute/);
  assert.match(css, /@media\(max-width:1020px\)\{\s*\.nav-drop\{/);
});

test('marcas de tenis e roupas saem do catalogo e nao misturam categorias', () => {
  for (const cat of ['tenis', 'roupas']) {
    const groups = core.groups(catalog, cat);
    assert.ok(groups.length > 1, cat);
    for (const g of groups) assert.equal(catalog.filter(p => core.matches(p, {brand: g.brand, category: cat})).length, g.count, cat + ' ' + g.brand);
  }
});

test('acessorios: tipos unificados (Bone/Bones, Cinto/Cintos) e todos os acessorios cobertos', () => {
  const aces = catalog.filter(p => p.categoria === 'acessorios');
  const types = [...new Set(aces.map(p => core.line(p)))];
  assert.ok(!types.includes('Boné') && types.includes('Bonés') && !types.includes('Cinto'));
  assert.equal(types.reduce((n, t) => n + catalog.filter(p => core.matches(p, {category: 'acessorios', line: t})).length, 0), aces.length);
});

test('perfumes: genero + tipo combinados, Unissex nos dois, nada fora de perfumaria', () => {
  const perfumes = catalog.filter(p => p.categoria === 'perfumaria');
  for (const gender of ['Masculino', 'Feminino']) {
    const hits = catalog.filter(p => core.matches(p, {category: 'perfumaria', gender}));
    assert.equal(hits.length, perfumes.filter(p => p.genero === gender || p.genero === 'Unissex').length);
    assert.ok(hits.every(p => p.categoria === 'perfumaria'));
  }
  const cremes = catalog.filter(p => core.matches(p, {category: 'perfumaria', gender: 'Feminino', kind: 'Hidratante'}));
  assert.ok(cremes.length > 0 && cremes.every(p => p.subtipo === 'Hidratante'));
  assert.match(script, /Hidratante:'Cremes hidratantes'/);
  assert.match(script, /genderParam \? \(type==='perfumaria' \? 'perfumaria' : 'roupas'\)/);
});
