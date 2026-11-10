import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {trackingTarget} from '../public/rastreio.js';

test('código dos Correios abre o serviço oficial', () => {
  assert.deepEqual(trackingTarget('ab123456789br'), {
    code: 'AB123456789BR',
    url: 'https://rastreamento.correios.com.br/app/index.php',
  });
});

test('código de outra transportadora abre o 17TRACK', () => {
  assert.deepEqual(trackingTarget('  YT123456789  '), {
    code: 'YT123456789',
    url: 'https://t.17track.net/pt#nums=YT123456789',
  });
});

test('código vazio ou com caracteres inválidos é rejeitado', () => {
  for (const code of ['', '   ', 'ABC<script>', 'AB 123', 'AB/123', 'AB?123', 'ABC']) {
    assert.equal(trackingTarget(code), null, code);
  }
});

test('página lê ?codigo=, abre em nova aba com noopener e usa o WhatsApp do site', () => {
  const page = readFileSync('public/rastreio.html', 'utf8');
  const script = readFileSync('public/rastreio.js', 'utf8');
  assert.match(script, /URLSearchParams\(location\.search\)\.get\('codigo'\)/);
  assert.match(page, /id="tracking-link"[^>]*target="_blank"[^>]*rel="noopener"/);
  assert.match(page, /href="https:\/\/wa\.me\/5561995158424"/);
  assert.match(page, /15 a 20 dias/);
});

test('menu e rodapé da home têm o link Rastrear pedido', () => {
  const home = readFileSync(process.env.HOME_HTML || 'public/index.html', 'utf8');
  assert.match(home, /<nav class="links"[^>]*>[\s\S]*?href="rastreio\.html"[^>]*>RASTREAR PEDIDO<\/a>/);
  assert.match(home, /<footer class="footer-reference"[\s\S]*?href="rastreio\.html"[^>]*>Rastrear pedido<\/a>/);
});
