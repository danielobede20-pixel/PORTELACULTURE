import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

test('CLAUDE.md stays short and imports the stable project rules', () => {
 const md = readFileSync('CLAUDE.md', 'utf8');
 assert.ok(md.split('\n').length < 60, 'CLAUDE.md deve ficar abaixo de 60 linhas');
 assert.match(md, /@AGENTS\.md/);
 assert.match(md, /catalogo-consulta\.mjs/);
 assert.match(md, /test:resumo/);
});

test('catalog lookup answers by id without dumping the catalog', () => {
 const out = execFileSync(process.execPath, ['scripts/catalogo-consulta.mjs', 'PC-001'], {encoding: 'utf8'});
 const p = JSON.parse(out.trim());
 assert.equal(p.id, 'PC-001');
 assert.ok(p.nome && p.marca);
 assert.ok(out.length < 400, 'saída deve ser curta');
});

test('catalog lookup caps list output', () => {
 const out = execFileSync(process.execPath, ['scripts/catalogo-consulta.mjs', '--marca', 'Nike'], {encoding: 'utf8'});
 assert.ok(out.trim().split('\n').length <= 21);
 assert.match(out, /\.\.\. \+\d+/);
});

test('test:resumo script is wired in package.json', () => {
 const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
 assert.equal(pkg.scripts['test:resumo'], 'node scripts/test-resumo.mjs');
});
