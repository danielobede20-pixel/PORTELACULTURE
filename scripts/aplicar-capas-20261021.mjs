// CAPAS-20261021: aplica o manifesto de capas limpas (roupas e acessorios; tenis ficam de fora).
//   LIMPA_OK -> copia a capa limpa para public/media/capas-limpas/<id>.webp (arquivo LOCAL novo, servido pelo ASSETS
//               do pacote; nao toca no R2 nem em worker/catalog-assets.json) e troca fotos[0] do produto.
//   TROCAR   -> move fotos[indice_troca] (indice do array fotos da galeria ORIGINAL; 0 = capa) para a posicao 0. Nenhuma foto some.
//   MANTER / REVISAR / tenis -> ignorados.
// Alvos (mesmo padrao do aplicar-minimal-20261021): public/catalogo.json e worker/catalog.json (este nao tem "fotos"; so valida o id).
// Registro: scripts/dados/capas-aplicadas.json {id:{capa_original,nova_capa,tipo,indice?}} - os testes de hash o usam para
// descontar so esta mudanca (scripts/capas-reverter.mjs). Idempotente: sempre recalcula a partir da galeria original.
// Uso: node scripts/aplicar-capas-20261021.mjs [--dry-run] [--raiz DIR] [--manifesto CSV] [--capas DIR]
// Padrao: manifesto C:\Users\danie\Documents\Portela-Entrega\limpeza-fotos\capas-manifesto.csv ; capas = <pasta do manifesto>\capas-limpas
import { closeSync, copyFileSync, existsSync, mkdirSync, openSync, readFileSync, readSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { reverterFotos } from './capas-reverter.mjs';

const args = process.argv.slice(2);
const flag = n => args.includes(n);
const valor = (n, p) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : p; };
const dry = flag('--dry-run');
const raiz = valor('--raiz', '.');
const arqManifesto = valor('--manifesto', 'C:\\Users\\danie\\Documents\\Portela-Entrega\\limpeza-fotos\\capas-manifesto.csv');
const dirCapas = valor('--capas', join(dirname(arqManifesto), 'capas-limpas'));
const arqAplicadas = join(raiz, 'scripts/dados/capas-aplicadas.json');
const DESTINO = 'media/capas-limpas';
const erros = [];
const erro = m => erros.push(m);

// ---- CSV (utf-8-sig, , ou ;, aspas) ----
function parseCsv(txt) {
  txt = txt.replace(/^\uFEFF/, '');
  const delim = (txt.split(/\r?\n/, 1)[0].match(/;/g) || []).length > (txt.split(/\r?\n/, 1)[0].match(/,/g) || []).length ? ';' : ',';
  const linhas = []; let campo = '', linha = [], aspas = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (aspas) { if (c === '"') { if (txt[i + 1] === '"') { campo += '"'; i++; } else aspas = false; } else campo += c; }
    else if (c === '"') aspas = true;
    else if (c === delim) { linha.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && txt[i + 1] === '\n') i++; linha.push(campo); campo = ''; if (linha.some(x => x.trim() !== '')) linhas.push(linha); linha = []; }
    else campo += c;
  }
  linha.push(campo); if (linha.some(x => x.trim() !== '')) linhas.push(linha);
  const cab = linhas.shift().map(h => h.trim().toLowerCase());
  return linhas.map(l => Object.fromEntries(cab.map((h, i) => [h, (l[i] ?? '').trim()])));
}

const norm = s => String(s || '').replace(/\\/g, '/').replace(/^\/+/, '');
const cat = p => p.categoria || 'tenis';
const lerJson = (arq, padrao) => existsSync(arq) ? JSON.parse(readFileSync(arq, 'utf8').replace(/^\uFEFF/, '')) : padrao;
function ehWebp(arq) { const b = Buffer.alloc(12); const fd = openSync(arq, 'r'); try { readSync(fd, b, 0, 12, 0); } finally { closeSync(fd); } return b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP'; }
function mesmoConteudo(a, b) { return existsSync(b) && statSync(a).size === statSync(b).size && readFileSync(a).equals(readFileSync(b)); }

// ---- carregar ----
if (!existsSync(arqManifesto)) { console.error('Manifesto ausente: ' + arqManifesto); process.exit(1); }
const manifesto = parseCsv(readFileSync(arqManifesto, 'utf8'));
for (const col of ['id', 'decisao']) if (manifesto.length && !(col in manifesto[0])) { console.error(`Manifesto sem coluna "${col}"`); process.exit(1); }
const alvos = ['public/catalogo.json', 'worker/catalog.json'].map(rel => {
  const caminho = join(raiz, rel), raw = readFileSync(caminho, 'utf8');
  return { rel, caminho, raw, data: JSON.parse(raw) };
});
const aplicadas = lerJson(arqAplicadas, {});
const principal = alvos[0];
const porId = new Map(principal.data.map(p => [p.id, p]));

// ---- planejar (nada e gravado antes de validar tudo) ----
const plano = []; // {id, p, tipo, novasFotos, reg, copia?}
const vistos = new Set(); const ignorados = { MANTER: 0, REVISAR: 0, tenis: 0 };
for (const [n, m] of manifesto.entries()) {
  const id = m.id, dec = (m.decisao || '').toUpperCase(), ctx = `linha ${n + 2} (${id})`;
  if (!['LIMPA_OK', 'TROCAR', 'MANTER', 'REVISAR'].includes(dec)) { erro(`${ctx}: decisao desconhecida "${m.decisao}"`); continue; }
  if (vistos.has(id)) { erro(`${ctx}: id repetido no manifesto`); continue; }
  vistos.add(id);
  const p = porId.get(id);
  if (!p) { erro(`${ctx}: id inexistente em public/catalogo.json`); continue; }
  for (const a of alvos.slice(1)) if (!a.data.some(x => x.id === id)) erro(`${ctx}: id inexistente em ${a.rel}`);
  if (dec === 'MANTER' || dec === 'REVISAR') { ignorados[dec]++; continue; }
  if (cat(p) === 'tenis') { ignorados.tenis++; continue; }
  if (!Array.isArray(p.fotos) || !p.fotos.length) { erro(`${ctx}: produto sem fotos`); continue; }
  const base = reverterFotos(p.fotos, aplicadas[id]); // galeria original (desfaz aplicacao anterior)
  if (dec === 'LIMPA_OK') {
    const rel = norm(m.caminho);
    if (rel && rel !== norm(base[0])) { erro(`${ctx}: caminho do manifesto "${rel}" difere da capa original "${base[0]}"`); continue; }
    const src = join(dirCapas, rel || norm(base[0]));
    if (!existsSync(src)) { erro(`${ctx}: capa limpa ausente: ${src}`); continue; }
    if (!ehWebp(src)) { erro(`${ctx}: ${src} nao e WEBP valido`); continue; }
    const nova = `${DESTINO}/${id}.webp`;
    plano.push({ id, p, tipo: dec, novasFotos: [nova, ...base.slice(1)], reg: { capa_original: base[0], nova_capa: nova, tipo: dec }, copia: { src, dest: join(raiz, 'public', nova) } });
  } else {
    const i = Number(m.indice_troca);
    if (!Number.isInteger(i) || i < 1 || i >= base.length) { erro(`${ctx}: indice_troca "${m.indice_troca}" fora do intervalo 1..${base.length - 1}`); continue; }
    plano.push({ id, p, tipo: dec, novasFotos: [base[i], ...base.filter((_, k) => k !== i)], reg: { capa_original: base[0], nova_capa: base[i], tipo: dec, indice: i } });
  }
}
if (erros.length) { console.error(`RECUSADO (${erros.length} erro(s); nada foi gravado):\n - ` + erros.join('\n - ')); process.exit(1); }

// ---- aplicar ----
let mudou = 0, iguais = 0, bytes = 0;
const novoRegistro = { ...aplicadas };
for (const it of plano) {
  const igual = JSON.stringify(it.p.fotos) === JSON.stringify(it.novasFotos) && JSON.stringify(aplicadas[it.id]) === JSON.stringify(it.reg);
  let copiar = false;
  if (it.copia) { copiar = !mesmoConteudo(it.copia.src, it.copia.dest); bytes += copiar ? statSync(it.copia.src).size : 0; }
  if (igual && !copiar) iguais++; else mudou++;
  console.log(`${it.id} ${it.tipo}: capa ${it.reg.capa_original.split('/').slice(-2).join('/')} -> ${it.reg.nova_capa}${igual && !copiar ? ' (ja aplicado)' : ''}`);
  novoRegistro[it.id] = it.reg;
  if (!dry) {
    if (copiar) { mkdirSync(dirname(it.copia.dest), { recursive: true }); copyFileSync(it.copia.src, it.copia.dest); }
    it.p.fotos = it.novasFotos;
  }
}
if (!dry) {
  for (const a of alvos) {
    const crlf = a.raw.includes('\r\n');
    const indent = a.raw.startsWith('[\n') || a.raw.startsWith('[\r\n') ? (a.raw.match(/\n( +)/)?.[1].length ?? 2) : undefined;
    if (a !== principal) continue; // worker/catalog.json nao tem fotos: nada a gravar
    let saida = JSON.stringify(a.data, null, indent) + (a.raw.endsWith('\n') ? '\n' : '');
    if (crlf) saida = saida.replace(/\r?\n/g, '\r\n');
    if (mudou) writeFileSync(a.caminho, saida);
  }
  if (mudou || !existsSync(arqAplicadas)) {
    const ordenado = Object.fromEntries(Object.keys(novoRegistro).sort().map(k => [k, novoRegistro[k]]));
    mkdirSync(dirname(arqAplicadas), { recursive: true });
    writeFileSync(arqAplicadas, JSON.stringify(ordenado, null, 2) + '\n');
  }
}
console.log(`\nLIMPA_OK ${plano.filter(i => i.tipo === 'LIMPA_OK').length} | TROCAR ${plano.filter(i => i.tipo === 'TROCAR').length} | alterados ${mudou}, ja aplicados ${iguais} | ignorados: MANTER ${ignorados.MANTER}, REVISAR ${ignorados.REVISAR}, tenis ${ignorados.tenis} | capas novas ${(bytes / 1024).toFixed(0)} KB${dry ? ' | DRY-RUN (nada gravado)' : ''}`);

// ---- outros pontos que citam a capa original / o id (vitrine, home, worker, testes) ----
const textos = [];
const varrer = (dir, ext) => { if (!existsSync(dir)) return; for (const f of readdirSync(dir)) if (ext.test(f) && f !== 'catalogo.json' && !/^catalog(-assets)?\.json$/.test(f)) textos.push(join(dir, f)); };
varrer(join(raiz, 'public'), /\.(html|js|css|json)$/); varrer(join(raiz, 'worker'), /\.(js|json)$/); varrer(join(raiz, 'tests'), /\.mjs$/);
const citacoes = [];
for (const f of textos) {
  const t = readFileSync(f, 'utf8');
  for (const it of plano) for (const chave of [it.reg.capa_original, dirname(it.reg.capa_original), `'${it.id}'`, `"${it.id}"`])
    if (t.includes(chave)) { citacoes.push(`${it.id} citado em ${relative(raiz, f)} (${chave})`); break; }
}
console.log(citacoes.length ? 'ATENCAO - pontos que citam estes produtos:\n - ' + [...new Set(citacoes)].join('\n - ') : 'Nenhum ponto de public/*.{html,js,css}, worker/*.js ou tests cita estes ids/capas.');
console.log('Obs.: media/vitrine/*.webp so e usada para perfumes PC-9000xx (catalogo.js); roupas/acessorios nao usam vitrine.');
