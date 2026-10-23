// Aplica preço de venda aos tênis com referência oficial encontrada (pesquisa 23/10/2026).
// Regra aprovada pelo Daniel: max(50% do menor preço oficial, piso R$ 539,90) — custo R$ 400 c/ frete, margem mín. 25%.
// Uso: node scripts/precos-tenis-20261023.mjs            (simulação, não grava)
//      node scripts/precos-tenis-20261023.mjs --aplicar  (grava worker/catalog.json e public/catalogo.json)
import fs from 'node:fs';
const APLICAR = process.argv.includes('--aplicar');
const REF = '../PORTELA-CULTURE/data/referencias-precos-familias-2026-10-23.csv';
const PISO = 539.9;
const num = s => { const v = parseFloat(String(s || '').replace(/\./g, '').replace(',', '.')); return isFinite(v) && v > 0 ? v : null; };
const refs = new Map();
for (const l of fs.readFileSync(REF, 'utf8').replace(/^﻿/, '').split(/\r?\n/).slice(1)) {
  const [modelo, min, , , conf] = l.split(';');
  if (modelo && num(min) && /^(ALTA|MEDIA)$/.test((conf || '').trim())) refs.set(modelo.trim().toLowerCase(), { modelo: modelo.trim(), min: num(min) });
}
const TETO = 749.9; // 23/10 19:24: Daniel pediu todos os tênis abaixo de R$ 750
const preco = min => Math.min(Math.max(Math.ceil(min * 0.5 / 10) * 10 - 0.1, PISO), TETO);
const marcaPrefixos = p => { const m = p.marca; return m === 'On' ? ['On Running', 'On'] : [m]; };
function ref(p) {
  if (p.categoria !== 'tenis') return null;
  if (/infantil|juvenil|kids|\bGS\b|\bPS\b|\bTD\b/i.test(p.nome)) return null;
  // edições especiais/collabs não têm preço oficial de varejo: ficam sem preço
  if (/ x |\bLV\b|Louis Vuitton|Hello Kitty|CS:?GO|Just Do It|Green Apple|Supreme|Travis|Sacai|Fragment/i.test(p.nome)) return null;
  const base = p.nome.split(' — ')[0].trim();
  const cands = [base];
  if (p.linha) for (const pre of marcaPrefixos(p)) cands.push(`${pre} ${p.linha}`, p.linha);
  for (const c of cands) { const r = refs.get(c.toLowerCase()); if (r) return r; }
  return null;
}
function carregar(f) { const txt = fs.readFileSync(f, 'utf8'); const bom = txt.charCodeAt(0) === 0xFEFF; const j = JSON.parse(bom ? txt.slice(1) : txt); const ind = /^\[\s*\n(\s+)/.exec(txt.replace(/^﻿/, '')); return { j, bom, ind: ind ? ind[1].length : 0, nl: txt.includes('\r\n') ? '\r\n' : '\n', fim: /\n$/.test(txt) }; }
function salvar(f, o) { let s = JSON.stringify(o.j, null, o.ind || undefined); if (o.nl === '\r\n') s = s.replace(/\n/g, '\r\n'); if (o.fim) s += o.nl; fs.writeFileSync(f, (o.bom ? '﻿' : '') + s, 'utf8'); }
const arr = o => Array.isArray(o.j) ? o.j : Object.values(o.j).find(Array.isArray);
const W = carregar('worker/catalog.json'), P = carregar('public/catalogo.json');
const precos = new Map(); const porModelo = {}; let jaTinha = 0;
for (const p of arr(W)) { const r = ref(p); if (!r) continue; const v = Math.round(preco(r.min) * 100) / 100; precos.set(p.id, v); porModelo[r.modelo] = (porModelo[r.modelo] || 0) + 1; }
const tenis = arr(W).filter(p => p.categoria === 'tenis').length;
let aplicW = 0, aplicP = 0;
if (APLICAR) {
  for (const p of arr(W)) if (precos.has(p.id)) { p.preco = precos.get(p.id); aplicW++; }
  for (const p of arr(P)) if (precos.has(p.id)) { p.preco = precos.get(p.id); aplicP++; }
  salvar('worker/catalog.json', W); salvar('public/catalogo.json', P);
}
const vals = [...precos.values()];
console.log(JSON.stringify({ modo: APLICAR ? 'APLICADO' : 'SIMULACAO', tenis, comPreco: precos.size, semRef: tenis - precos.size - jaTinha, jaTinha, aplicW, aplicP, min: Math.min(...vals), max: Math.max(...vals), noPiso: vals.filter(v => v === PISO).length }, null, 1));
console.log(Object.entries(porModelo).sort((a, b) => b[1] - a[1]).map(([m, n]) => `${n}\t${m}`).join('\n'));
