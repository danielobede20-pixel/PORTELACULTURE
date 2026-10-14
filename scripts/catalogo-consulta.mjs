// Consulta o catálogo sem carregar o arquivo inteiro no contexto da IA.
// public/catalogo.json tem ~2 MB (~500 mil tokens): nunca abra o arquivo inteiro, use este script.
// Exemplos:
//   node scripts/catalogo-consulta.mjs PC-021 PC-1706          -> produtos por ID
//   node scripts/catalogo-consulta.mjs --busca "air force"      -> nomes que contêm o texto (máx. 20)
//   node scripts/catalogo-consulta.mjs --marca Adidas --categoria roupas --contar
//   node scripts/catalogo-consulta.mjs --resumo                 -> totais por marca e categoria
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const catalogo = JSON.parse(readFileSync('public/catalogo.json', 'utf8'));
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const curto = (p) => ({ id: p.id, nome: p.nome, marca: p.marca, categoria: p.categoria || 'tenis', linha: p.linha, fotos: p.fotos?.length || 0 });

const ids = args.filter((a) => /^PC-\d+$/.test(a));
if (ids.length) {
  for (const id of ids) console.log(JSON.stringify(curto(catalogo.find((p) => p.id === id) || { id, nome: '(não encontrado)' })));
  process.exit(0);
}

if (args.includes('--resumo')) {
  const por = {};
  for (const p of catalogo) { const k = `${p.marca} | ${p.categoria || 'tenis'}`; por[k] = (por[k] || 0) + 1; }
  console.log(`total ${catalogo.length}`);
  for (const [k, n] of Object.entries(por).sort((a, b) => b[1] - a[1])) console.log(`${n}\t${k}`);
  process.exit(0);
}

let lista = catalogo;
if (opt('--marca')) lista = lista.filter((p) => norm(p.marca) === norm(opt('--marca')));
if (opt('--categoria')) lista = lista.filter((p) => (p.categoria || 'tenis') === opt('--categoria'));
if (opt('--linha')) lista = lista.filter((p) => norm(p.linha) === norm(opt('--linha')));
if (opt('--busca')) lista = lista.filter((p) => norm(p.nome).includes(norm(opt('--busca'))));

if (args.includes('--contar')) { console.log(lista.length); process.exit(0); }
const limite = Number(opt('--limite') || 20);
for (const p of lista.slice(0, limite)) console.log(JSON.stringify(curto(p)));
if (lista.length > limite) console.log(`... +${lista.length - limite} (use --limite N ou refine o filtro)`);
