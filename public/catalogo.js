const menu = document.querySelector('.menu');
const nav = document.querySelector('#nav');
function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Abrir menu'); menu.textContent = '☰'; }
menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); menu.textContent = open ? '×' : '☰'; if (open) nav.querySelector('a').focus(); });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });
nav.addEventListener('keydown', e => { if (e.key !== 'Tab' || !nav.classList.contains('open')) return; const links = [...nav.querySelectorAll('a')]; if (!e.shiftKey && e.target === links.at(-1)) { e.preventDefault(); menu.focus(); } if (e.shiftKey && e.target === links[0]) { e.preventDefault(); menu.focus(); } });
menu.addEventListener('keydown', e => { if (e.key === 'Tab' && nav.classList.contains('open')) { e.preventDefault(); (e.shiftKey ? nav.querySelector('a:last-child') : nav.querySelector('a')).focus(); } });
const products = document.querySelector('#products'), status = document.querySelector('#resultado'), search = document.querySelector('#busca'), brand = document.querySelector('#marca'), model = document.querySelector('#modelo'), more = document.querySelector('#mais'), dialog = document.querySelector('#produto');
let data = [], shown = 12, selectedProduct = null;
const category = document.querySelector('#categoria');
const sizeInput = document.querySelector('#pedido-tamanho'), cityInput = document.querySelector('#pedido-cidade');
function productURL(p) { const url = new URL(location.pathname, location.origin); url.searchParams.set('produto', p.id); url.hash = 'catalogo'; return url.href; }
function updateOrder() {
  if (!selectedProduct) return;
  document.querySelector('#order').href = Portela.link({product:selectedProduct,url:productURL(selectedProduct),size:sizeInput.value,city:cityInput.value});
}
sizeInput.addEventListener('input', updateOrder);
cityInput.addEventListener('input', updateOrder);
document.addEventListener('portela-preferences', updateOrder);
dialog.addEventListener('close', () => { selectedProduct=null; Portela.setProduct(null); });
document.querySelector('#pedido-form').addEventListener('submit', e => e.preventDefault());
const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function productLine(p) {
  if (p.linha) return p.linha;
  const name = normalize(p.nome);
  if (name.includes('dunk')) return name.includes('sb') ? 'Dunk SB' : name.includes('high') ? 'Dunk High' : 'Dunk Low';
  if (name.includes('force 58')) return 'SB Force 58';
  return 'Outras linhas';
}
function matches(p) {
  const inLine = !model.value || model.value === JSON.stringify([p.marca, productLine(p)]);
  return (!category.value || (p.categoria||'tenis') === category.value) && (!brand.value || p.marca === brand.value) && inLine && normalize(p.nome + ' ' + p.id + ' ' + p.marca + ' ' + productLine(p)).includes(normalize(search.value.trim()));
}
function updateModels() {
  model.replaceChildren(new Option('Todas as linhas', ''));
  [...new Set(data.filter(p => (!brand.value || p.marca === brand.value) && (!category.value || (p.categoria||'tenis')===category.value)).map(p => JSON.stringify([p.marca,productLine(p)])))].sort((a,b) => a.localeCompare(b,'pt-BR',{numeric:true})).forEach(value => {const [maker,line] = JSON.parse(value); model.add(new Option(brand.value ? line : maker + ' · ' + line,value));});
}
function showProduct(p) {
  selectedProduct = p;
  Portela.setProduct(p);
  sizeInput.value = ''; cityInput.value = '';
  document.querySelector('#product-title').textContent = p.nome;
  document.querySelector('#product-ref').textContent = 'Referência ' + p.id;
  const mainImage = document.querySelector('#detail-image'), thumbs = document.querySelector('#thumbs');
  thumbs.replaceChildren();
  p.fotos.forEach((src, i) => { const button = document.createElement('button'), img = document.createElement('img'); button.type = 'button'; button.setAttribute('aria-label', 'Ver foto ' + (i + 1)); button.setAttribute('aria-pressed', String(i === 0)); img.src = src; img.alt = ''; img.loading = 'lazy'; button.append(img); button.addEventListener('click', () => { mainImage.src = src; mainImage.alt = p.nome + ' — foto ' + (i + 1); thumbs.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button))); }); thumbs.append(button); });
  mainImage.src = p.fotos[0]; mainImage.alt = p.nome + ' — referência ' + p.id;
  thumbs.querySelectorAll('button').forEach((b,i) => b.setAttribute('aria-pressed', String(i === 0)));
  document.querySelector('#product-link').href = productURL(p);
  updateOrder();
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
category.addEventListener('change', () => { shown = 12; updateModels(); render(); });
document.querySelectorAll('[data-catalog-category]').forEach(link=>link.addEventListener('click',()=>{category.value=link.dataset.catalogCategory;brand.value='';search.value='';shown=12;updateModels();render();category.focus({preventScroll:true});}));
brand.addEventListener('change', () => { shown = 12; updateModels(); render(); });
model.addEventListener('change', () => { shown = 12; render(); });
more.addEventListener('click', () => { shown += 12; render(); });
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) { const rect = dialog.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) dialog.close(); } });
fetch('catalogo.json').then(r => { if (!r.ok) throw new Error('catalog'); return r.json(); }).then(items => {
  data = items;
  category.replaceChildren(new Option('Todas as categorias',''));
  [...new Set(data.map(p=>p.categoria||'tenis'))].forEach(value=>category.add(new Option(PortelaCore.labels[value]||value,value)));
  const quizBrand=document.querySelector('#quiz-form select[name="brand"]');
  quizBrand.replaceChildren(new Option('Prefiro não informar',''));
  [...new Set(data.map(p=>p.marca))].sort((a,b)=>a.localeCompare(b,'pt-BR')).forEach(value=>quizBrand.add(new Option(value,value)));
  quizBrand.add(new Option('Quero descobrir opções','Descobrir'));quizBrand.add(new Option('Outra marca','Outra'));quizBrand.add(new Option('Sem preferência','Sem preferencia'));
  const brands = [...new Set(data.map(p => p.marca))];
  brand.replaceChildren(new Option('Todas as marcas',''));
  const strip = document.querySelector('.brands'); strip.replaceChildren();
  brands.forEach(maker => {brand.add(new Option(maker,maker)); const button = document.createElement('button'); button.type = 'button'; button.className = 'brand-item'; button.textContent = maker; button.setAttribute('aria-label','Ver modelos ' + maker); button.addEventListener('click',() => {brand.value = maker; category.value = ''; search.value = ''; shown = 12; updateModels(); render(); document.querySelector('#catalogo').scrollIntoView(); brand.focus({preventScroll:true});}); strip.append(button);});
  updateModels(); render();
  const curated = document.querySelector('#curated');
  ['PC-001', 'PC-003', 'PC-214'].forEach(id => { const p = data.find(item => item.id === id); if (!p) return; const card = document.createElement('button'), image = document.createElement('img'), info = document.createElement('div'), title = document.createElement('h3'), ref = document.createElement('p'), action = document.createElement('span'); card.type = 'button'; card.className = 'product-card'; card.setAttribute('aria-label', 'Seleção Portela: ' + p.nome + ', ' + p.id); image.src = p.fotos[0]; image.alt = p.nome; image.loading = 'lazy'; image.width = image.height = 720; info.className = 'product-info'; title.textContent = p.nome; ref.textContent = p.id + ' · Sob encomenda'; action.textContent = 'Ver detalhes'; info.append(ref,title,action); card.append(image,info); card.addEventListener('click',()=>showProduct(p)); curated.append(card); });
  const requested = new URLSearchParams(location.search).get('produto');
  if (requested) { const p = data.find(item => item.id === requested); if (p) showProduct(p); else status.textContent = 'Referência não encontrada. Explore os modelos disponíveis ou consulte a loja.'; }
}).catch(() => { status.textContent = 'Não foi possível carregar o catálogo. Atualize a página ou consulte a loja pelo WhatsApp.'; more.hidden = true; });

