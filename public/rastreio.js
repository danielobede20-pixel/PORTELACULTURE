export const CORREIOS = /^[A-Z]{2}\d{9}[A-Z]{2}$/;

export function trackingTarget(value) {
  const code = String(value ?? '').trim().toUpperCase();
  if (!/^[A-Z0-9-]{4,64}$/.test(code)) return null;
  return {
    code,
    url: CORREIOS.test(code)
      ? 'https://rastreamento.correios.com.br/app/index.php'
      : `https://t.17track.net/pt#nums=${encodeURIComponent(code)}`,
  };
}

if (typeof document !== 'undefined') {
  const form = document.querySelector('#tracking-form');
  const input = document.querySelector('#tracking-code');
  const message = document.querySelector('#tracking-message');
  const link = document.querySelector('#tracking-link');
  const supplied = new URLSearchParams(location.search).get('codigo');

  if (supplied !== null) {
    input.value = supplied;
    if (trackingTarget(supplied)) form.classList.add('has-code');
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const target = trackingTarget(input.value);
    if (!target) {
      message.textContent = input.value.trim()
        ? 'Confira o código: use apenas letras, números ou hífen (4 a 64 caracteres).'
        : 'Digite o código de rastreio para continuar.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    input.value = target.code;
    input.removeAttribute('aria-invalid');
    const correios = target.url.includes('correios.com.br');
    message.textContent = correios
      ? 'A página oficial dos Correios abrirá em outra aba. Cole o código lá para consultar.'
      : 'O rastreio abrirá em outra aba.';
    if (correios && navigator.clipboard) {
      navigator.clipboard.writeText(target.code)
        .then(() => { message.textContent = 'Código copiado. A página oficial dos Correios abrirá em outra aba: cole o código lá.'; })
        .catch(() => {});
    }
    link.href = target.url;
    link.click();
  });

  input.addEventListener('input', () => {
    message.textContent = '';
    input.removeAttribute('aria-invalid');
    form.classList.toggle('has-code', Boolean(trackingTarget(input.value)));
  });
}
