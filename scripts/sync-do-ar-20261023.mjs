// Traz para o repositório os arquivos de front-end que estão no ar no Sites (v39) e divergem do git.
// Uso: node scripts/sync-do-ar-20261023.mjs [--aplicar]
import fs from 'node:fs';
const S = 'https://portela-culture.danielobede20.chatgpt.site/';
const APLICAR = process.argv.includes('--aplicar');
const get = async u => { const r = await fetch(S + u + (u.includes('?') ? '&' : '?') + 't=' + Date.now()); return r.ok ? await r.text() : null; };
const norm = s => s.replace(/\r/g, '');
const html = await get('');
const refs = [...new Set([...html.matchAll(/(?:href|src)="([^"#:]+\.(?:css|js))(?:\?[^"]*)?"/g)].map(m => m[1]))];
const files = ['index.html', ...refs];
for (const f of files) {
  const live = f === 'index.html' ? html : await get(f);
  if (live == null) { console.log('ERRO HTTP', f); continue; }
  const p = 'public/' + f, local = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  const st = local == null ? 'NOVO' : norm(local) === norm(live) ? 'igual' : 'DIFERENTE';
  if (st !== 'igual') { console.log(st, f, local ? norm(local).length + ' -> ' + norm(live).length : norm(live).length); if (APLICAR) fs.writeFileSync(p, local && local.includes('\r\n') ? norm(live).replace(/\n/g, '\r\n') : norm(live), 'utf8'); }
}
