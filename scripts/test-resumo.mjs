// Roda a suíte de testes e imprime só o essencial: totais e, se houver, as falhas.
// Motivo: a saída completa tem ~20 KB (~5 mil tokens) por rodada; o resumo cabe em poucas linhas.
// Uso: npm run test:resumo   (código de saída igual ao da suíte)
import { spawnSync } from 'node:child_process';

const run = spawnSync(process.execPath, ['--test', 'tests/*.test.mjs'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const lines = `${run.stdout || ''}\n${run.stderr || ''}`.split(/\r?\n/);

const totals = lines.filter(l => /^[ℹ#] (tests|pass|fail|cancelled|skipped|todo) \d+/.test(l));
// Dois formatos possíveis: "spec" (terminal, linhas com ✖) e "tap" (sem terminal, linhas "not ok").
const resumoFalhas = [];
const vistos = new Set();
for (let i = 0; i < lines.length && resumoFalhas.length < 60; i++) {
  const l = lines[i];
  const tap = /^\s*not ok \d+ - (.*)/.exec(l);
  const spec = /^✖ (?!failing tests)(.*)/.exec(l);
  if (!tap && !spec) continue;
  const nome = (tap ? tap[1] : spec[1]).replace(/ \([\d.]+ms\)$/, '');
  if (vistos.has(nome)) continue; // o formato spec repete as falhas no final
  vistos.add(nome);
  resumoFalhas.push('✖ ' + nome);
  for (const d of lines.slice(i + 1, i + 25)) {
    if (/^\s*(not )?ok \d+ - /.test(d) || /^✖ /.test(d)) break;
    if (/(location|expected|actual|AssertionError|Error:|message)/.test(d)) resumoFalhas.push('    ' + d.trim().slice(0, 200));
  }
}

console.log(totals.join('\n') || 'Sem totais na saída (a suíte não rodou?)');
if (resumoFalhas.length) console.log('\nFALHAS:\n' + resumoFalhas.join('\n'));
process.exit(run.status ?? 1);
