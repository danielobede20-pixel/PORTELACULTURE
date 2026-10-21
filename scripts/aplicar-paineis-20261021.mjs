// 21/10: paineis Masculino/Feminino da home passam a mostrar roupas (pedido do Daniel).
import fs from 'node:fs';
const f = 'public/index.html';
let s = fs.readFileSync(f, 'utf8');
const trocas = [
  [/src="media\/vitrine\/pc-900002\.webp" alt="[^"]*"/, 'src="media/home/painel-masculino.webp" alt="Jaqueta puffer masculina da curadoria Portela"'],
  [/src="media\/vitrine\/pc-900016\.webp" alt="[^"]*"/, 'src="media/home/painel-feminino.webp" alt="Jaqueta puffer feminina da curadoria Portela"'],
];
for (const [re, novo] of trocas) {
  if (s.includes(novo)) { console.log('ja aplicado:', novo.slice(5, 40)); continue; }
  if (!re.test(s)) { console.error('ancora nao encontrada:', re); process.exit(1); }
  s = s.replace(re, novo);
  console.log('trocado:', novo.slice(5, 40));
}
fs.writeFileSync(f, s);
const m = '../Portela-Entrega/limpeza-fotos/capas-manifesto.csv';
const linhas = fs.readFileSync(m, 'utf8').split(/\r?\n/).map(l => l.startsWith('PC-1713,') ? l.replace(',REVISAR,', ',LIMPA_OK,') : l);
fs.writeFileSync(m, linhas.join('\n'));
console.log('manifesto PC-1713:', linhas.find(l => l.startsWith('PC-1713,')).split(',').slice(0, 3).join(','));
