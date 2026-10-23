// Preço único das roupas aprovado pelo Daniel em 23/10/2026: R$ 249,90 (custo máx. R$ 200, foco em volume).
import fs from 'node:fs';
const PRECO = 249.9;
function carregar(f) { const txt = fs.readFileSync(f, 'utf8'); const bom = txt.charCodeAt(0) === 0xFEFF; const j = JSON.parse(bom ? txt.slice(1) : txt); const ind = /^\[\s*\n(\s+)/.exec(txt.replace(/^\uFEFF/, '')); return { j, bom, ind: ind ? ind[1].length : 0, nl: txt.includes('\r\n') ? '\r\n' : '\n', fim: /\n$/.test(txt) }; }
function salvar(f, o) { let s = JSON.stringify(o.j, null, o.ind || undefined); if (o.nl === '\r\n') s = s.replace(/\n/g, '\r\n'); if (o.fim) s += o.nl; fs.writeFileSync(f, (o.bom ? '\uFEFF' : '') + s, 'utf8'); }
const res = {};
for (const f of ['worker/catalog.json', 'public/catalogo.json']) {
  const o = carregar(f); const a = Array.isArray(o.j) ? o.j : Object.values(o.j).find(Array.isArray);
  let n = 0; for (const p of a) if (p.categoria === 'roupas') { p.preco = PRECO; n++; }
  salvar(f, o); res[f] = n;
}
function trocar(f, de, para) { const t = fs.readFileSync(f, 'utf8'); if (!t.includes(de)) throw new Error('nao achei em ' + f + ': ' + de.slice(0, 60)); fs.writeFileSync(f, t.replace(de, para), 'utf8'); }
trocar('tests/perfumaria.test.mjs',
  "assert.equal(p.categoria,'tenis',p.id+' só tênis pode ter preço fora da perfumaria');assert.equal(typeof p.preco,'number',p.id);assert.ok(p.preco>=539.9&&p.preco<2000,p.id+' preço de tênis fora da faixa');",
  "assert.ok(['tenis','roupas'].includes(p.categoria),p.id+' acessórios seguem sem preço');assert.equal(typeof p.preco,'number',p.id);if(p.categoria==='tenis')assert.ok(p.preco>=539.9&&p.preco<2000,p.id+' preço de tênis fora da faixa');else assert.equal(p.preco,249.9,p.id+' roupa deve custar R$ 249,90');");
trocar('tests/published-baseline.test.mjs', "if(p.categoria==='tenis'&&'preco' in p)", "if((p.categoria==='tenis'||p.categoria==='roupas')&&'preco' in p)");
trocar('public/catalogo.js', "catalogo.json?v=26'", "catalogo.json?v=27'");
trocar('public/index.html', 'catalogo.js?v=35', 'catalogo.js?v=36');
trocar('tests/v9-fallback-quiz.test.mjs', "catalogo\\.json\\?v=26'", "catalogo\\.json\\?v=27'");
trocar('tests/v9-fallback-quiz.test.mjs', 'catalogo\\.js\\?v=35/', 'catalogo\\.js\\?v=36/');
console.log(JSON.stringify(res));
