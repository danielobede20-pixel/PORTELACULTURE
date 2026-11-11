import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import worker from '../worker/index.js';

test('assistente de IA removido: sem arquivos, sem dialog e sem rota', async () => {
  for (const file of ['public/ia.js', 'public/ia.css', 'worker/ia.js']) assert.equal(existsSync(file), false, file);
  const html = readFileSync('public/index.html', 'utf8');
  for (const marker of ['ia-dialog', 'ia.js', 'ia.css', 'data-open-ai', 'ai-invite']) assert.equal(html.includes(marker), false, marker);
  for (const method of ['GET', 'POST']) {
    const r = await worker.fetch(new Request('https://portela.test/api/ia', { method, headers: { origin: 'https://portela.test', 'content-type': 'application/json' }, body: method === 'POST' ? '{"messages":["oi"]}' : undefined }), {});
    assert.equal(r.status, 404, method);
  }
});

test('catálogo do Worker continua servindo interesses e atendimento', () => {
  const src = readFileSync('worker/index.js', 'utf8');
  assert.match(src, /import catalog from '\.\/catalog\.json'/);
  assert.match(src, /attendance\(request,env,catalog\)/);
});
