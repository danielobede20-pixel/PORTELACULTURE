const FALLBACK_IMAGE = 'media/imagem-indisponivel.svg';
function setCardImage(img, p) { if (p.categoria === 'perfumaria' && /^PC-9000\d\d$/.test(p.id)) { img.src = 'media/vitrine/' + p.id.toLowerCase() + '.webp'; img.classList.add('is-cutout'); } else img.src = p.fotos[0]; }
(() => { const fab = document.querySelector('.whatsapp'), small = matchMedia('(max-width: 820px)');
  if (!fab) return;
  let last = scrollY, frame = 0;
  const update = () => { frame = 0; const y = scrollY, nearEnd = innerHeight + y >= document.documentElement.scrollHeight - 120, hide = small.matches && y > 160 && y > last + 8 && !nearEnd && document.activeElement !== fab;
    if (hide) fab.classList.add('recolhido');
    else if (y < last - 8 || nearEnd || y <= 160 || !small.matches) fab.classList.remove('recolhido');
    if (Math.abs(y - last) > 8) last = y; };
  addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
  fab.addEventListener('focus', () => fab.classList.remove('recolhido'));
})();
document.addEventListener('error', e => { const img = e.target; if (!(img instanceof HTMLImageElement) || !img.closest('.products, .thumbs, #produto') || img.getAttribute('src') === FALLBACK_IMAGE) return; img.src = FALLBACK_IMAGE; if (img.alt) img.alt += ' (imagem indisponível)'; }, true);
const menu = document.querySelector('.menu');
const nav = document.querySelector('#nav');
function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Abrir menu'); menu.textContent = '⋮'; }
menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); menu.textContent = open ? '×' : '⋮'; if (open) menuControls()[0]?.focus(); });
nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
const brandsMenu = nav.querySelector('.nav-brands');
const closeBrands = () => { if (!brandsMenu || !brandsMenu.open) return; brandsMenu.open = false; brandsMenu.querySelectorAll('details').forEach(d => { d.open = false; }); };
document.addEventListener('click', e => { if (brandsMenu && (!brandsMenu.contains(e.target) || e.target.closest('a'))) closeBrands(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeBrands(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });
const menuControls = () => [...nav.querySelectorAll('a,summary')].filter(el => el.getClientRects().length);
nav.addEventListener('keydown', e => { if (e.key !== 'Tab' || !nav.classList.contains('open')) return; const controls = menuControls(); if ((!e.shiftKey && e.target === controls.at(-1)) || (e.shiftKey && e.target === controls[0])) { e.preventDefault(); menu.focus(); } });
menu.addEventListener('keydown', e => { if (e.key === 'Tab' && nav.classList.contains('open')) { e.preventDefault(); const controls=menuControls(); (e.shiftKey ? controls.at(-1) : controls[0])?.focus(); } });
const products = document.querySelector('#products'), status = document.querySelector('#resultado'), more = document.querySelector('#mais'), dialog = document.querySelector('#produto');
let data = [], shown = 24, selectedProduct = null, query = '';
let selection = {brand:'', line:'', category:'', gender:'', kind:''};
const CATEGORY_LABELS = {perfumaria:'Perfumes', tenis:'Tênis', roupas:'Roupas', acessorios:'Acessórios'};
const productNote = document.querySelector('#product-note'), formNote = document.querySelector('#form-note'), defaultNotes = [productNote.textContent, formNote.textContent];
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
function catalogURL(brand='', line='', type='', gender='', kind='') {
  const url=new URL(location.href);url.searchParams.delete('produto');
  [['marca',brand],['linha',line],['categoria',type],['genero',gender],['tipo',kind]].forEach(([key,value])=>value ? url.searchParams.set(key,value) : url.searchParams.delete(key));
  url.hash='catalogo';return url.href;
}
function choose(brand='', line='', type='', scroll=true, gender='', kind='') {
  selection={brand,line,category:brand==='Alo' ? 'roupas' : type,gender,kind};shown=24;
  history.replaceState(null,'',catalogURL(selection.brand,selection.line,selection.category,selection.gender,selection.kind));
  updateNavigation();render();closeMenu();
  if(scroll){document.querySelector('#catalogo').scrollIntoView();document.querySelector('#catalog-heading').focus({preventScroll:true});}
}
function makeLink(text, maker, line='', type='') {
  const a=document.createElement('a');a.textContent=text;a.href=catalogURL(maker,line,type);
  a.addEventListener('click',e=>{e.preventDefault();choose(maker,line,type);});return a;
}
function selectionTitle() {
  if (selection.brand) return PortelaCatalog.label(selection.brand) + (selection.line ? ' · ' + selection.line : '');
  if (selection.gender) return 'Roupas ' + (selection.gender === 'Feminino' ? 'femininas' : 'masculinas');
  return CATEGORY_LABELS[selection.category] || 'Todos os produtos';
}
function updateNavigation() {
  document.querySelector('#catalog-heading').textContent = selectionTitle();
  const any = selection.brand || selection.line || selection.category || selection.gender || selection.kind;
  document.querySelector('#catalog-back').hidden = !any;
  document.querySelectorAll('#nav .nav-inner > a[data-catalog-category], #nav .nav-inner > a[data-catalog-gender]').forEach(link => {
    const active = !selection.brand && !selection.line && (link.dataset.catalogCategory || '') === selection.category && (link.dataset.catalogGender || '') === selection.gender;
    if (active) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
  });
  const brandsSummary = document.querySelector('#nav .nav-brands > summary');
  if (brandsSummary) { if (selection.brand) brandsSummary.setAttribute('aria-current', 'true'); else brandsSummary.removeAttribute('aria-current'); }
}
function buildBrandMenu() {
  const container=document.querySelector('#nav-brands');container.replaceChildren();
  PortelaCatalog.groups(data).forEach(group=>{
    const details=document.createElement('details'),summary=document.createElement('summary'),list=document.createElement('div');
    details.className='nav-brand';summary.textContent=group.label;list.className='nav-models';list.append(makeLink('Ver todos · '+group.count,group.brand));
    group.lines.forEach(line=>list.append(makeLink(line.name+' · '+line.count,group.brand,line.name)));
    details.append(summary,list);container.append(details);
  });
}
function showProduct(p) {
  selectedProduct = p;
  Portela.setProduct(p);
  sizeInput.value = ''; cityInput.value = '';
  document.querySelector('#product-title').textContent = p.nome;
  const perfume = p.categoria === 'perfumaria';
  document.querySelector('#product-ref').textContent = perfume ? [PortelaCatalog.perfumeSpecs(p), p.genero].filter(Boolean).join(' · ') : [PortelaCatalog.label(p.marca), CATEGORY_LABELS[p.categoria || 'tenis']].filter(Boolean).join(' · ');
  sizeInput.closest('label').hidden = perfume;
  const priced = PortelaCatalog.price(p); let priceTag = document.querySelector('#product-price');
  if (!priceTag) { priceTag = document.createElement('p'); priceTag.id = 'product-price'; priceTag.className = 'product-price'; document.querySelector('#product-ref').after(priceTag); }
  priceTag.textContent = priced; priceTag.hidden = !priced;
  productNote.textContent = perfume && priced ? 'Confirme disponibilidade e prazo com a loja pelo WhatsApp.' : perfume ? 'Consulte preço, disponibilidade e prazo com a loja pelo WhatsApp.' : p.categoria==='acessorios' ? 'Consulte preço, detalhes e prazo com a loja pelo WhatsApp.' : defaultNotes[0];
  formNote.textContent = perfume ? (priced ? 'A cidade entra na mensagem que você enviará pelo WhatsApp. Disponibilidade e prazo serão confirmados pela loja.' : 'A cidade entra na mensagem que você enviará pelo WhatsApp. Preço e disponibilidade serão confirmados pela loja.') : defaultNotes[1];
  const mainImage = document.querySelector('#detail-image'), thumbs = document.querySelector('#thumbs');
  thumbs.replaceChildren();
  p.fotos.forEach((src, i) => { const button = document.createElement('button'), img = document.createElement('img'); button.type = 'button'; button.setAttribute('aria-label', 'Ver foto ' + (i + 1)); button.setAttribute('aria-pressed', String(i === 0)); img.src = src; img.alt = ''; img.loading = 'lazy'; button.append(img); button.addEventListener('click', () => { mainImage.src = src; mainImage.alt = p.nome + ' — foto ' + (i + 1); thumbs.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button))); }); thumbs.append(button); });
  mainImage.src = p.fotos[0]; mainImage.alt = p.nome;
  thumbs.querySelectorAll('button').forEach((b,i) => b.setAttribute('aria-pressed', String(i === 0)));
  document.querySelector('#product-link').href = productURL(p);
  updateOrder();
  dialog.showModal();
}
function render() {
  const filtered = data.filter(p=>PortelaCatalog.matches(p,selection) && PortelaCatalog.search(p, query));
  products.replaceChildren();
  filtered.slice(0, shown).forEach(p => { const card = document.createElement('button'), image = document.createElement('img'), info = document.createElement('div'), ref = document.createElement('p'), title = document.createElement('h3'), note = document.createElement('p'), action = document.createElement('span'); card.type = 'button'; card.className = 'product-card'; card.setAttribute('aria-label', 'Ver detalhes de ' + p.nome); setCardImage(image, p); image.alt = p.nome; image.loading = 'lazy'; image.decoding = 'async'; image.width = image.height = 960; info.className = 'product-info'; ref.textContent = PortelaCatalog.label(p.marca); title.textContent = p.nome; const perfume = p.categoria === 'perfumaria'; note.textContent = perfume ? PortelaCatalog.perfumeSpecs(p) : p.categoria==='acessorios' ? 'Sob encomenda · Consulte preço e detalhes' : 'Disponível sob encomenda · Consulte preço e tamanho'; action.textContent = perfume ? 'Consultar' : 'Ver detalhes'; const priced = PortelaCatalog.price(p); if (priced) { const tag = document.createElement('p'); tag.className = 'product-price'; tag.textContent = priced; info.append(ref, title, note, tag, action); } else info.append(ref, title, note, action); card.append(image, info); card.addEventListener('click', () => showProduct(p)); products.append(card); });
  status.textContent = filtered.length ? `${filtered.length} ${filtered.length === 1 ? 'produto' : 'produtos'}` : (query.trim() ? 'Nenhum produto para “' + query.trim() + '”. Tente outro termo ou limpe a busca.' : 'Nenhum produto nesta categoria no momento.');
  more.hidden = filtered.length <= shown;
}
document.querySelector('#catalog-back').addEventListener('click',()=>choose());
document.addEventListener('click', e => { const link = e.target.closest('[data-catalog-category],[data-catalog-gender]'); if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey) return; e.preventDefault(); searchDialog?.close(); choose('', '', link.dataset.catalogCategory || '', true, link.dataset.catalogGender || ''); });
document.addEventListener('click', e => { const item = e.target.closest('.show-item'); if (!item || !data.length || e.defaultPrevented || e.metaKey || e.ctrlKey) return; const p = data.find(x => x.id === new URL(item.href).searchParams.get('produto')); if (p) { e.preventDefault(); showProduct(p); } });
more.addEventListener('click', () => { shown += 24; render(); });
// Pesquisar: painel minimalista com as categorias existentes (sem campo de texto nem quiz)
const searchDialog = document.querySelector('#pesquisar');
function buildSearchPanel() {
  const list = searchDialog?.querySelector('.search-list'); if (!list) return;
  const counts = new Map(); data.forEach(p => counts.set(p.categoria || 'tenis', (counts.get(p.categoria || 'tenis') || 0) + 1));
  const clothesFor = g => data.filter(p => PortelaCatalog.matches(p, {category:'roupas', gender:g})).length;
  const entries = [...Object.keys(CATEGORY_LABELS).filter(k => counts.has(k)).map(k => ({label:CATEGORY_LABELS[k], count:counts.get(k), cat:k})),
    ...['Masculino', 'Feminino'].filter(g => clothesFor(g)).map(g => ({label:g, count:clothesFor(g), cat:'roupas', gender:g}))];
  list.replaceChildren(...entries.map(item => { const a = document.createElement('a'), name = document.createElement('span'), n = document.createElement('small');
    a.href = catalogURL('', '', item.cat || '', item.gender || ''); if (item.cat) a.dataset.catalogCategory = item.cat; if (item.gender) a.dataset.catalogGender = item.gender;
    name.textContent = item.label; n.textContent = item.count + (item.count === 1 ? ' produto' : ' produtos'); a.append(name, n); return a; }));
}
document.querySelectorAll('[data-open-search], .nav-search').forEach(b => b.addEventListener('click', e => { e.preventDefault(); closeMenu(); if (searchDialog?.showModal) searchDialog.showModal(); else document.querySelector('#catalogo').scrollIntoView(); }));
searchDialog?.querySelector('.close')?.addEventListener('click', () => searchDialog.close());
searchDialog?.addEventListener('click', e => { if (e.target === searchDialog) searchDialog.close(); });
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) { const rect = dialog.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) dialog.close(); } });
fetch('catalogo.json?v=23',{cache:'no-cache'}).then(r => { if (!r.ok) throw new Error('catalog'); return r.json(); }).then(items => {
  data = PortelaCatalog.visibleProducts(items);
  const quizBrand=document.querySelector('#quiz-form select[name="brand"]');
  if (quizBrand) { quizBrand.replaceChildren(new Option('Prefiro não informar',''));
  [...new Set(data.map(p=>p.marca))].sort((a,b)=>a.localeCompare(b,'pt-BR')).forEach(value=>quizBrand.add(new Option(value,value)));
  quizBrand.add(new Option('Quero descobrir opções','Descobrir'));quizBrand.add(new Option('Outra marca','Outra'));quizBrand.add(new Option('Sem preferência','Sem preferencia')); }
  const perfumeOptions=PortelaCatalog.perfumeOptions(data), categories=new Set(data.map(p=>p.categoria||'tenis'));
  buildBrandMenu(); buildSearchPanel();
  const params=new URLSearchParams(location.search),requested=params.get('produto');
  const maker=params.get('marca')||'', type=params.get('categoria')||'', line=params.get('linha')||'';
  const group=PortelaCatalog.groups(data).find(g=>g.brand===maker), genderParam=['Masculino','Feminino'].includes(params.get('genero')) ? params.get('genero') : '';
  selection={brand:group ? maker : '',line:(group?.lines.some(l=>l.name===line) || (type==='acessorios' && data.some(p=>p.categoria==='acessorios' && PortelaCatalog.line(p)===line))) ? line : '',category:(maker==='Alo' || genderParam) ? 'roupas' : categories.has(type) ? type : '',gender:genderParam,kind:''};
  if(selection.category==='perfumaria')selection.kind=perfumeOptions.kind.includes(params.get('tipo')) ? params.get('tipo') : '';
  query=(params.get('busca')||'').slice(0,60);updateNavigation();render();
  const curated = document.querySelector('#curated');
  ['PC-001', 'PC-003', 'PC-214'].forEach(id => { const p = data.find(item => item.id === id); if (!p) return; const card = document.createElement('button'), image = document.createElement('img'), info = document.createElement('div'), title = document.createElement('h3'), ref = document.createElement('p'), action = document.createElement('span'); card.type = 'button'; card.className = 'product-card'; card.setAttribute('aria-label', 'Seleção Portela: ' + p.nome); setCardImage(image, p); image.alt = p.nome; image.loading = 'lazy'; image.width = image.height = 720; info.className = 'product-info'; title.textContent = p.nome; ref.textContent = 'Disponível sob encomenda'; action.textContent = 'Ver detalhes'; info.append(ref,title,action); card.append(image,info); card.addEventListener('click',()=>showProduct(p)); curated.append(card); });
  if (requested) { const p = data.find(item => item.id === requested); if (p) showProduct(p); else status.textContent = 'Produto não encontrado. Explore os modelos disponíveis ou consulte a loja.'; }
}).catch(() => { status.textContent = 'Não foi possível carregar o catálogo. Atualize a página ou consulte a loja pelo WhatsApp.'; more.hidden = true; });

