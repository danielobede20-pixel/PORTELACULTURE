// Aplica preços (Pix) aos perfumes e cadastra novos itens de perfumaria.
// Uso: node scripts/aplicar-precos-perfumaria.mjs scripts/dados/precos-perfumaria-20261020.json
// Idempotente: reaplicar não duplica produtos. Mantém public/catalogo.json e worker/catalog.json sincronizados (worker sem "fotos").
import {readFileSync, writeFileSync} from 'node:fs';
const dados = JSON.parse(readFileSync(process.argv[2] || 'scripts/dados/precos-perfumaria-20261020.json', 'utf8'));
const files = {client: 'public/catalogo.json', worker: 'worker/catalog.json'};
for (const [kind, file] of Object.entries(files)) {
  const items = JSON.parse(readFileSync(file, 'utf8'));
  const ids = new Set(items.map(p => p.id));
  for (const p of items) if (p.categoria === 'perfumaria' && dados.precos[p.id]) p.preco = dados.precos[p.id];
  for (const novo of dados.novos) {
    if (ids.has(novo.id)) { const p = items.find(x => x.id === novo.id); p.preco = novo.preco; continue; }
    const {fotos, ...rest} = novo;
    items.push(kind === 'client' ? novo : rest);
  }
  writeFileSync(file, JSON.stringify(items));
  console.log(file, items.length, 'itens;', items.filter(p => typeof p.preco === 'number').length, 'com preço');
}
