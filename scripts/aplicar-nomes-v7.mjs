// V7: aplica nomes propostos (id -> nome) em public/catalogo.json e worker/catalog.json.
// Não altera IDs, fotos, marca, categoria, preço ou estoque.
import { readFileSync, writeFileSync } from 'node:fs';
const tsv = process.argv[2];
const map = new Map(readFileSync(tsv, 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter(Boolean).map(l => l.split('\t')));
function apply(path) {
  const raw = readFileSync(path, 'utf8');
  const data = JSON.parse(raw);
  const arr = Array.isArray(data) ? data : (data.products || data.items);
  let n = 0;
  for (const p of arr) if (map.has(p.id) && p.nome !== map.get(p.id)) { p.nome = map.get(p.id); n++; }
  const indent = raw.startsWith('[\n') || raw.startsWith('{\n') ? (raw.match(/\n( +)/)?.[1].length ?? 2) : 0;
  writeFileSync(path, JSON.stringify(data, null, indent || undefined) + (raw.endsWith('\n') ? '\n' : ''));
  const nomes = new Map(); for (const p of arr) { const k = p.nome.trim().toLowerCase(); nomes.set(k, (nomes.get(k) || 0) + 1); }
  console.log(path, 'itens', arr.length, 'renomeados', n, 'nomes repetidos', [...nomes.values()].filter(v => v > 1).length);
}
apply('public/catalogo.json');
apply('worker/catalog.json');
