// MINIMAL-20261021: (a) grava o campo "genero" nas roupas e (b) remove produtos listados.
// Entradas:  scripts/dados/genero-roupas.json  -> {"PC-123":"Masculino"|"Feminino"|"Unissex", ...}
//            scripts/dados/remover-ids.json    -> ["PC-123", ...]
// Alvos (mesmo padrao do aplicar-v8-cat): public/catalogo.json e worker/catalog.json.
// Nao mexe em precos, fotos, nomes nem em worker/catalog-assets.json (chaveado por arquivo de imagem, nao por produto).
// Idempotente. Uso: node scripts/aplicar-minimal-20261021.mjs [--dry-run] [--raiz DIR] [--genero ARQ] [--remover ARQ]
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const flag = nome => args.includes(nome);
const valor = (nome, padrao) => { const i = args.indexOf(nome); return i >= 0 && args[i + 1] ? args[i + 1] : padrao; };
const dry = flag('--dry-run');
const raiz = valor('--raiz', '.');
const arqGenero = valor('--genero', join(raiz, 'scripts/dados/genero-roupas.json'));
const arqRemover = valor('--remover', join(raiz, 'scripts/dados/remover-ids.json'));
const GENEROS = new Set(['Masculino', 'Feminino', 'Unissex']);

const lerJson = (arq, padrao) => existsSync(arq) ? JSON.parse(readFileSync(arq, 'utf8')) : padrao;
const generos = lerJson(arqGenero, {});
const remover = new Set(lerJson(arqRemover, []));
if (Array.isArray(generos) || typeof generos !== 'object') throw new Error(`${arqGenero}: esperado objeto {"PC-123":"Feminino"}`);
for (const [id, g] of Object.entries(generos)) if (!GENEROS.has(g)) throw new Error(`${arqGenero}: ${id} tem genero invalido "${g}"`);

let falhas = 0;
function aplicar(rel) {
  const caminho = join(raiz, rel);
  const raw = readFileSync(caminho, 'utf8');
  const crlf = raw.includes('\r\n');
  const data = JSON.parse(raw);
  const antes = data.length;
  const resultado = data.filter(p => !remover.has(p.id));
  const removidos = antes - resultado.length;
  let novos = 0, alterados = 0, iguais = 0, ausentes = 0;
  const invalidos = [];
  const byId = new Map(resultado.map(p => [p.id, p]));
  for (const [id, g] of Object.entries(generos)) {
    const p = byId.get(id);
    if (!p) { ausentes++; continue; } // removido ou inexistente
    if (p.categoria !== 'roupas') { invalidos.push(id); continue; }
    if (p.genero === g) iguais++;
    else { if (p.genero === undefined) novos++; else alterados++; p.genero = g; }
  }
  if (invalidos.length) { falhas++; console.error(`${rel}: ${invalidos.length} id(s) de genero nao sao roupas: ${invalidos.slice(0, 5).join(', ')}`); return; }
  const indent = raw.startsWith('[\n') ? (raw.match(/\n( +)/)?.[1].length ?? 2) : undefined;
  let saida = JSON.stringify(resultado, null, indent) + (raw.endsWith('\n') ? '\n' : '');
  if (crlf) saida = saida.replace(/\r?\n/g, '\r\n');
  const mudou = removidos + novos + alterados > 0;
  if (!dry && mudou) writeFileSync(caminho, saida);
  console.log(`${rel}: ${antes} -> ${resultado.length} produtos | removidos ${removidos} | genero novo ${novos}, alterado ${alterados}, ja igual ${iguais}, ids ausentes ${ausentes}${dry ? ' | DRY-RUN (nada gravado)' : mudou ? ' | gravado' : ' | sem mudancas'}`);
}

aplicar('public/catalogo.json');
aplicar('worker/catalog.json');
if (falhas) process.exit(1);
