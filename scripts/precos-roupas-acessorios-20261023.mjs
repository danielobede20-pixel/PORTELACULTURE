// Preços acessíveis de roupas/acessórios (custo x ~1,6, final ,90) e piso R$ 539,90 para tênis sem referência.
// Aprovado pelo Daniel em 23/10/2026 19:31. Custos do vídeo do fornecedor (On/Adidas); demais tipos estimados.
// Uso: node scripts/precos-roupas-acessorios-20261023.mjs [--aplicar]
import fs from 'node:fs';
const APLICAR = process.argv.includes('--aplicar');
const COLLAB = / x |\bLV\b|Louis Vuitton|Hello Kitty|CS:?GO|Just Do It|Green Apple|Supreme|Travis|Sacai|Fragment/i;
const INF = /infantil|juvenil|kids|\bGS\b|\bPS\b|\bTD\b/i;
function precoRoupa(p) {
  const l = (p.linha || '').toLowerCase(), n = p.nome.toLowerCase();
  if (/infantil/.test(l) || INF.test(p.nome)) return 79.9; // 19:51: infantil na faixa mais baixa
  if (/conjunto|camisetas e shorts|polos e shorts/.test(l)) return /moletom|calça|agasalho|fleece|jaqueta|manga longa/.test(n) ? 349.9 : 139.9;
  if (/^(shorts|bermudas?)$/.test(l)) return 79.9;
  if (/manga longa/.test(l)) return 199.9;
  if (/^(camisetas?|regatas|tops|blusas|camisas?|camisas esportivas)$/.test(l)) return 89.9;
  if (/^cuecas$/.test(l)) return 59.9;
  if (/^polos?$/.test(l)) return 119.9;
  if (/^(calças?|leggings|saias|macacões)$/.test(l)) return /jeans|cargo/.test(n) ? 299.9 : 149.9;
  if (/^moletons?$/.test(l)) return 149.9;
  if (/^(jaquetas?|jaqueta com capuz|coletes|blazers|suéteres?|cardigã)$/.test(l)) return 249.9;
  return null;
}
function precoAcessorio(p) {
  const l = (p.linha || '').toLowerCase();
  if (/^(bonés?|chapéus)$/.test(l)) return 119.9;
  if (/^meias$/.test(l)) return 39.9;
  if (/^(toucas|gorro de malha|balaclavas|faixas de cabeça|golas|luvas)$/.test(l)) return 69.9;
  // 23/10 19:51: Daniel pediu catálogo completo; preço-base estimado por comparação
  if (/^capas para celular$/.test(l)) return 59.9;
  if (/^(cinto|óculos)$/.test(l)) return 149.9;
  if (/^bolsas$/.test(l)) return 199.9;
  if (/^mochilas$/.test(l)) return 249.9;
  return 119.9; // qualquer outro acessório: faixa do boné
}
function preco(p) {
  if (p.categoria === 'roupas') return precoRoupa(p);
  if (p.categoria === 'acessorios') return precoAcessorio(p);
  if (p.categoria === 'tenis' && p.preco == null) return COLLAB.test(p.nome) ? 749.9 : 539.9; // 19:51: collabs no teto, demais (inclusive infantis) no piso
  return null;
}
function carregar(f) { const txt = fs.readFileSync(f, 'utf8'); const bom = txt.charCodeAt(0) === 0xFEFF; return { j: JSON.parse(bom ? txt.slice(1) : txt), bom, nl: txt.includes('\r\n') ? '\r\n' : '\n', fim: /\n$/.test(txt) }; }
function salvar(f, o) { let s = JSON.stringify(o.j); if (o.fim) s += o.nl; fs.writeFileSync(f, (o.bom ? '﻿' : '') + s, 'utf8'); }
const W = carregar('worker/catalog.json'), P = carregar('public/catalogo.json');
const precos = new Map(), resumo = {}, sem = {};
for (const p of W.j) { if (p.categoria === 'perfumaria') continue; const v = preco(p); const k = p.categoria + ' | ' + (p.linha || '-');
  if (v != null) { precos.set(p.id, v); const r = resumo[p.categoria + ' ' + v.toFixed(2)] ||= 0; resumo[p.categoria + ' ' + v.toFixed(2)]++; }
  else if (p.preco == null) sem[k] = (sem[k] || 0) + 1; }
if (APLICAR) { for (const o of [W, P]) for (const p of o.j) if (precos.has(p.id)) p.preco = precos.get(p.id); salvar('worker/catalog.json', W); salvar('public/catalogo.json', P); }
const cats = c => W.j.filter(p => p.categoria === c), com = c => cats(c).filter(p => p.preco != null || precos.has(p.id)).length;
console.log(JSON.stringify({ modo: APLICAR ? 'APLICADO' : 'SIMULACAO', novos: precos.size, tenis: com('tenis') + '/' + cats('tenis').length, roupas: com('roupas') + '/' + cats('roupas').length, acessorios: com('acessorios') + '/' + cats('acessorios').length, perfumes: cats('perfumaria').filter(p => p.preco != null).length }, null, 1));
console.log(Object.entries(resumo).sort().map(([k, n]) => n + '\t' + k).join('\n'));
console.log('SEM PRECO:', JSON.stringify(Object.entries(sem).sort((a, b) => b[1] - a[1])));
