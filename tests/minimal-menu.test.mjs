import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// 21/10: navegacao minimalista. Unissex deixa de ser categoria; Masculino/Feminino = somente roupas.
const html = readFileSync('public/index.html', 'utf8');
const script = readFileSync('public/catalogo.js', 'utf8');
const css = ['marble-preview.css', 'home-refino.css', 'catalog-navigation.css'].map(f => readFileSync('public/' + f, 'utf8')).join('\n');
const core = vm.runInNewContext(readFileSync('public/catalogo-core.js', 'utf8') + ';PortelaCatalog', {});
const catalog = JSON.parse(readFileSync('public/catalogo.json', 'utf8'));
const clothes = [
  {id: 'm', categoria: 'roupas', marca: 'Nike', nome: 'Camiseta M', genero: 'Masculino'},
  {id: 'f', categoria: 'roupas', marca: 'Nike', nome: 'Top F', genero: 'Feminino'},
  {id: 'u', categoria: 'roupas', marca: 'Nike', nome: 'Moletom U', genero: 'Unissex'},
  {id: 'p', categoria: 'perfumaria', marca: 'Lattafa', nome: 'Perfume F', genero: 'Feminino'},
  {id: 't', categoria: 'tenis', marca: 'Nike', nome: 'Dunk', genero: 'Feminino'},
];
const ids = selection => clothes.filter(p => core.matches(p, selection)).map(p => p.id).join(',');

test('menu principal: ordem final e sem Unissex', () => {
  const nav = html.match(/<nav class="links" id="nav"[\s\S]*?<\/nav>/)[0];
  // 24/10: as 4 categorias viraram submenus; o "Ver todos" de cada painel fica fora da contagem.
  const labels = [...nav.replace(/<div class="nav-drop-panel"[\s\S]*?<\/div>/g, '').matchAll(/<(?:a|summary)[^>]*>([^<]+)<\/(?:a|summary)>/g)].map(m => m[1]);
  assert.deepEqual(labels, ['PERFUMES', 'TÊNIS', 'ROUPAS', 'ACESSÓRIOS', 'MASCULINO', 'FEMININO', 'MARCAS', 'COMO PEDIR']);
  for (const g of ['Masculino', 'Feminino']) assert.match(nav, new RegExp('data-catalog-category="roupas" data-catalog-gender="' + g + '" href="\\?categoria=roupas&genero=' + g + '#catalogo"'));
});

test('Unissex nao aparece como categoria no HTML, no JS nem no CSS', () => {
  assert.doesNotMatch(html, /UNISSEX|data-catalog-gender="Unissex"|genero=Unissex|category-unissex|cat-unissex/);
  assert.doesNotMatch(script, /Unissex/);
  assert.doesNotMatch(css, /category-unissex/);
  assert.equal((html.match(/class="category"/g) || []).length, 4, 'home com 4 categorias');
});

test('barra de chips duplicada foi removida; voltar para todos os produtos continua', () => {
  assert.doesNotMatch(html, /catalog-chips|data-chip/);
  assert.match(html, /id="catalog-back"/);
  assert.match(script, /#catalog-back'\)\.hidden = !any/);
  assert.match(script, /setAttribute\('aria-current', 'true'\)/);
});

test('Masculino/Feminino filtram so roupas; Unissex de roupa vale para os dois', () => {
  assert.equal(ids({category: 'roupas', gender: 'Masculino'}), 'm,u');
  assert.equal(ids({category: 'roupas', gender: 'Feminino'}), 'f,u');
  assert.equal(ids({gender: 'Masculino'}), 'm,u', 'sem categoria, perfume e tenis continuam fora');
  assert.equal(ids({category: 'perfumaria', gender: 'Feminino'}), 'p', '24/10: dentro de Perfumes o genero filtra perfumes');
  assert.equal(ids({category: 'perfumaria'}), 'p');
  assert.equal(ids({category: 'tenis'}), 't', 'tenis: masculinos e femininos juntos');
});

test('no catalogo real, nenhum perfume, tenis ou acessorio entra em Masculino/Feminino', () => {
  for (const gender of ['Masculino', 'Feminino']) {
    const hit = catalog.filter(p => core.matches(p, {gender}));
    assert.ok(hit.every(p => p.categoria === 'roupas'), gender);
  }
});

test('URL: ?genero= aceita so Masculino/Feminino (forca roupas); Unissex cai no catalogo geral', () => {
  assert.match(script, /\['Masculino','Feminino'\]\.includes\(params\.get\('genero'\)\)/);
  assert.match(script, /genderParam \? \(type==='perfumaria' \? 'perfumaria' : 'roupas'\)/, '24/10: genero sem categoria=perfumaria continua forcando roupas');
});

test('paineis Masculino/Feminino da home levam as roupas, sem falar de fragrancias', () => {
  const sec = html.match(/<section class="audience"[\s\S]*?<\/section>/)[0];
  assert.doesNotMatch(sec, /fragr/i);
  assert.equal((sec.match(/href="\?categoria=roupas&genero=(Masculino|Feminino)#catalogo"/g) || []).length, 2);
});

test('perfume mantem o genero como informacao no detalhe, sem controle de filtro', () => {
  assert.match(script, /perfumeSpecs\(p\), p\.genero/);
  assert.doesNotMatch(script, /perfumeOptions\.gender/);
});
