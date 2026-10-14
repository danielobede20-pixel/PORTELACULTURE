// V8-CAT: aplica somente as mudanças de marca/categoria/linha listadas em docs/v8-cat/manifesto.json
// em public/catalogo.json e worker/catalog.json. Confere o valor "antes" de cada campo e falha se não bater.
// Não altera IDs, nomes, fotos, preços ou estoque.
import { readFileSync, writeFileSync } from 'node:fs';

const { mudancas } = JSON.parse(readFileSync('docs/v8-cat/manifesto.json', 'utf8'));

function apply(path) {
  const raw = readFileSync(path, 'utf8');
  const data = JSON.parse(raw);
  const byId = new Map(data.map(p => [p.id, p]));
  let applied = 0;
  for (const m of mudancas) {
    const p = byId.get(m.id);
    if (!p) throw new Error(`${path}: ${m.id} não existe`);
    const atual = p[m.campo] ?? null;
    if (atual === m.depois) continue; // já aplicado
    if (atual !== (m.antes ?? null)) throw new Error(`${path}: ${m.id}.${m.campo} esperado ${m.antes}, encontrado ${atual}`);
    p[m.campo] = m.depois;
    applied++;
  }
  const indent = raw.startsWith('[\n') ? (raw.match(/\n( +)/)?.[1].length ?? 2) : undefined;
  writeFileSync(path, JSON.stringify(data, null, indent) + (raw.endsWith('\n') ? '\n' : ''));
  console.log(path, 'mudanças aplicadas', applied, 'de', mudancas.length);
}

apply('public/catalogo.json');
apply('worker/catalog.json');
