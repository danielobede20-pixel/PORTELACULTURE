// Validação do restauro (somente leitura). Uso: node scripts/validar-restauro.mjs
import {readFileSync, existsSync, statSync} from 'node:fs';
const pub = JSON.parse(readFileSync('public/catalogo.json', 'utf8'));
const wrk = JSON.parse(readFileSync('worker/catalog.json', 'utf8'));
const assets = JSON.parse(readFileSync('worker/catalog-assets.json', 'utf8'));
const html = readFileSync('public/index.html', 'utf8');
const out = {erros: [], avisos: []};
const err = m => out.erros.push(m), warn = m => out.avisos.push(m);

out.total_public = pub.length; out.total_worker = wrk.length;
if (pub.length !== wrk.length) err(`contagem difere public=${pub.length} worker=${wrk.length}`);
const ids = new Set(); for (const p of pub) { if (ids.has(p.id)) err('id duplicado ' + p.id); ids.add(p.id); }
const wmap = new Map(wrk.map(w => [w.id, w]));
const cats = {}, marcas = {};
let fotosTotal = 0, fotosDisco = 0, fotosRegistro = 0, semFoto = 0, ausentes = [], registroSemArquivo = 0;
for (const p of pub) {
  for (const k of ['id', 'nome', 'marca', 'categoria']) if (!p[k] || !String(p[k]).trim()) err(`${p.id} campo vazio ${k}`);
  const w = wmap.get(p.id);
  if (!w) err('ausente no worker ' + p.id);
  else for (const k of ['nome', 'marca', 'categoria']) if (w[k] !== p[k]) err(`${p.id} ${k} difere public="${p[k]}" worker="${w[k]}"`);
  cats[p.categoria] = (cats[p.categoria] || 0) + 1; marcas[p.marca] = (marcas[p.marca] || 0) + 1;
  if (!Array.isArray(p.fotos) || !p.fotos.length) { semFoto++; err('sem foto ' + p.id); continue; }
  for (const f of p.fotos) {
    fotosTotal++;
    const disco = existsSync('public/' + f) && statSync('public/' + f).size > 0;
    const reg = Object.hasOwn(assets, f);
    if (disco) fotosDisco++; else if (reg) { fotosRegistro++; registroSemArquivo++; } else ausentes.push(p.id + ' ' + f);
    if (/\.\.|^\/|^https?:/i.test(f)) warn(`${p.id} caminho incomum ${f}`);
  }
}
for (const w of wrk) if (!ids.has(w.id)) err('só no worker ' + w.id);
for (const a of ausentes) err('foto sem arquivo e sem registro: ' + a);
out.categorias = cats; out.qtd_marcas = Object.keys(marcas).length;
out.fotos = {total: fotosTotal, em_disco: fotosDisco, apenas_no_registro: fotosRegistro, ausentes: ausentes.length};
// links internos
const idsHtml = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
const ancoras = [...new Set([...html.matchAll(/href="[^"#]*#([^"]+)"/g)].map(m => m[1]))];
out.ancoras_quebradas = ancoras.filter(a => !idsHtml.has(a));
for (const a of out.ancoras_quebradas) err('âncora sem destino #' + a);
const wa = [...new Set([...html.matchAll(/wa\.me\/(\d+)/g)].map(m => m[1]))];
out.whatsapp = wa; if (wa.length !== 1) err('mais de um número de WhatsApp: ' + wa.join(','));
const blank = [...html.matchAll(/<a[^>]*target="_blank"[^>]*>/g)].map(m => m[0]).filter(t => !/rel="[^"]*noopener/.test(t));
out.links_blank_sem_noopener = blank.length;
for (const src of [...html.matchAll(/(?:src|href)="([^"#:?]+\.(?:js|css|png|webp|svg|jpg))(?:\?[^"]*)?"/g)].map(m => m[1])) if (!existsSync('public/' + src)) err('recurso ausente ' + src);
out.destaques_no_html = html.includes('id="destaques"');
console.log(JSON.stringify({...out, erros: out.erros.slice(0, 40), total_erros: out.erros.length, avisos: out.avisos.slice(0, 20), total_avisos: out.avisos.length}, null, 1));
process.exitCode = out.erros.length ? 1 : 0;
