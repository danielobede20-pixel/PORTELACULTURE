const menu = document.querySelector('.menu');
const nav = document.querySelector('#nav');
function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Abrir menu'); menu.textContent = '☰'; }
menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); menu.textContent = open ? '×' : '☰'; if (open) nav.querySelector('a').focus(); });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });
nav.addEventListener('keydown', e => { if (e.key !== 'Tab' || !nav.classList.contains('open')) return; const links = [...nav.querySelectorAll('a')]; if (!e.shiftKey && e.target === links.at(-1)) { e.preventDefault(); menu.focus(); } if (e.shiftKey && e.target === links[0]) { e.preventDefault(); menu.focus(); } });
menu.addEventListener('keydown', e => { if (e.key === 'Tab' && nav.classList.contains('open')) { e.preventDefault(); (e.shiftKey ? nav.querySelector('a:last-child') : nav.querySelector('a')).focus(); } });
const products = document.querySelector('#products'), status = document.querySelector('#resultado'), search = document.querySelector('#busca'), model = document.querySelector('#modelo'), more = document.querySelector('#mais'), dialog = document.querySelector('#produto');
let data = [], shown = 12;
const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function matches(p) { const name = normalize(p.nome); return normalize(p.nome + ' ' + p.id).includes(normalize(search.value.trim())) && (!model.value || (model.value === 'sb' ? name.includes('dunk') && name.includes('sb') : model.value === 'high' ? name.includes('dunk') && name.includes('high') : name.includes('dunk') && name.includes('low') && !name.includes('sb'))); }
function showProduct(p) {
  document.querySelector('#product-title').textContent = p.nome;
  document.querySelector('#product-ref').textContent = 'Referência ' + p.id;
  const mainImage = document.querySelector('#detail-image'), thumbs = document.querySelector('#thumbs');
  thumbs.replaceChildren();
  p.fotos.forEach((src, i) => { const button = document.createElement('button'), img = document.createElement('img'); button.type = 'button'; button.setAttribute('aria-label', 'Ver foto ' + (i + 1)); button.setAttribute('aria-pressed', String(i === 0)); img.src = src; img.alt = ''; img.loading = 'lazy'; button.append(img); button.addEventListener('click', () => { mainImage.src = src; mainImage.alt = p.nome + ' — foto ' + (i + 1); thumbs.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button))); }); thumbs.append(button); });
  mainImage.src = p.fotos[0]; mainImage.alt = p.nome + ' — referência ' + p.id;
  thumbs.querySelectorAll('button').forEach((b,i) => b.setAttribute('aria-pressed', String(i === 0)));
  const message = `Olá! Quero consultar ${p.nome}, referência ${p.id}. Poderiam informar preço, numerações e prazo? ${location.origin}/#catalogo`;
  document.querySelector('#order').href = 'https://wa.me/5561995158424?text=' + encodeURIComponent(message);
  dialog.showModal();
}
function render() {
  const filtered = data.filter(matches);
  products.replaceChildren();
  filtered.slice(0, shown).forEach(p => { const card = document.createElement('button'), image = document.createElement('img'), info = document.createElement('div'), ref = document.createElement('p'), title = document.createElement('h3'), note = document.createElement('p'), action = document.createElement('span'); card.type = 'button'; card.className = 'product-card'; card.setAttribute('aria-label', 'Ver detalhes de ' + p.nome + ', ' + p.id); image.src = p.fotos[0]; image.alt = p.nome + ' — ' + p.id; image.loading = 'lazy'; image.decoding = 'async'; image.width = image.height = 960; info.className = 'product-info'; ref.textContent = p.id; title.textContent = p.nome; note.textContent = 'Sob encomenda · Consulte preço e tamanho'; action.textContent = 'Ver detalhes'; info.append(ref, title, note, action); card.append(image, info); card.addEventListener('click', () => showProduct(p)); products.append(card); });
  status.textContent = filtered.length ? `${filtered.length} ${filtered.length === 1 ? 'modelo' : 'modelos'} · mostrando ${Math.min(shown, filtered.length)}` : 'Nenhum modelo encontrado. Tente outro nome ou referência.';
  more.hidden = filtered.length <= shown;
}
search.addEventListener('input', () => { shown = 12; render(); });
model.addEventListener('change', () => { shown = 12; render(); });
more.addEventListener('click', () => { shown += 12; render(); });
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) { const rect = dialog.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) dialog.close(); } });
fetch('catalogo.json').then(r => { if (!r.ok) throw new Error('catalog'); return r.json(); }).then(items => { data = items; render(); }).catch(() => { status.textContent = 'Não foi possível carregar o catálogo. Atualize a página ou consulte a loja pelo WhatsApp.'; more.hidden = true; });

