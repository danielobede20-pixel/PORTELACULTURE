const FALLBACK_IMAGE = 'media/imagem-indisponivel.svg';
function setCardImage(img, p) { if (p.categoria === 'perfumaria' && /^PC-9000\d\d$/.test(p.id)) { img.src = 'media/vitrine/' + p.id.toLowerCase() + '.webp'; img.classList.add('is-cutout'); } else img.src = p.fotos[0]; }
document.addEventListener('error', e => { const img = e.target; if (!(img instanceof HTMLImageElement) || !img.closest('.products, .thumbs, #produto') || img.getAttribute('src') === FALLBACK_IMAGE) return; img.src = FALLBACK_IMAGE; if (img.alt) img.alt += ' (imagem indisponível)'; }, true);
const menu = document.querySelector('.menu');
const nav = document.querySelector('#nav');
function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Abrir menu'); menu.textContent = '⋮'; }
menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); menu.textContent = open ? '×' : '⋮'; if (open) menuControls()[0]?.focus(); });
nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });
const menuControls = () => [...nav.querySelectorAll('a,summary')].filter(el => el.getClientRects().length);
nav.addEventListener('keydown', e => { if (e.key !== 'Tab' || !nav.classList.contains('open')) return; const controls = menuControls(); if ((!e.shiftKey && e.target === controls.at(-1)) || (e.shiftKey && e.target === controls[0])) { e.preventDefault(); menu.focus(); } });
menu.addEventListener('keydown', e => { if (e.key === 'Tab' && nav.classList.contains('open')) { e.preventDefault(); const controls=menuControls(); (e.shiftKey ? controls.at(-1) : controls[0])?.focus(); } });
const products = document.querySelector('#products'), status = document.querySelector('#resultado'), more = document.querySelector('#mais'), dialog = document.querySelector('#produto');
let data = [], shown = 12, selectedProduct = null, query = '';
let selection = {brand:'', line:'', category:'', gender:'', kind:''};
const perfumeBox = document.querySelector('#perfumaria-filters'), perfumeSelects = {gender:document.querySelector('#filtro-genero'), brand:document.querySelector('#filtro-marca'), kind:document.querySelector('#filtro-tipo')};
const productNote = document.querySelector('#product-note'), formNote = document.querySelector('#form-note'), defaultNotes = [productNote.textContent, formNote.textContent];
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
function catalogURL(brand='', line='', type='', gender='', kind='') {
  const url=new URL(location.href);url.searchParams.delete('produto');
  [['marca',brand],['linha',line],['categoria',type],['genero',gender],['tipo',kind]].forEach(([key,value])=>value ? url.searchParams.set(key,value) : url.searchParams.delete(key));
  url.hash='catalogo';return url.href;
}
function choose(brand='', line='', type='', scroll=true, gender=type==='perfumaria' ? selection.gender : '', kind=type==='perfumaria' ? selection.kind : '') {
  const restoreLineFocus=document.activeElement.closest('#catalog-lines');
  selection={brand,line,category:brand==='Alo' ? 'roupas' : type,gender,kind};category.value=selection.category;shown=12;
  history.replaceState(null,'',catalogURL(selection.brand,selection.line,selection.category,selection.gender,selection.kind));
  updateNavigation();render();closeMenu();
  if(restoreLineFocus)document.querySelector('#catalog-lines [aria-pressed="true"]')?.focus({preventScroll:true});
  if(scroll){document.querySelector('#catalogo').scrollIntoView();document.querySelector('#catalog-heading').focus({preventScroll:true});}
}
function makeLink(text, maker, line='', type='') {
  const a=document.createElement('a');a.textContent=text;a.href=catalogURL(maker,line,type);
  a.addEventListener('click',e=>{e.preventDefault();choose(maker,line,type);});return a;
}
function updateNavigation() {
  const strip=document.querySelector('.brands'), lines=document.querySelector('#catalog-lines');strip.replaceChildren();lines.replaceChildren();
  const groups=PortelaCatalog.groups(data,selection.brand==='Alo' ? '' : selection.category);
  groups.forEach(group=>{const button=document.createElement('button'),title=document.createElement('strong'),count=document.createElement('span');button.type='button';button.className='brand-item';button.setAttribute('aria-pressed',String(selection.brand===group.brand));title.textContent=group.label;count.textContent=group.count+(group.count===1 ? ' produto' : ' produtos');button.append(title,count);button.addEventListener('click',()=>choose(group.brand,'',selection.brand==='Alo' ? '' : selection.category));strip.append(button);});
  const selected=groups.find(group=>group.brand===selection.brand);
  document.querySelector('#catalog-heading').textContent=selection.brand ? PortelaCatalog.label(selection.brand) : selection.category==='perfumaria' ? 'Explore perfumes e kits.' : 'Escolha sua marca.';
  document.querySelector('#catalog-back').hidden=!selection.brand;
  category.closest('label').hidden=selection.brand==='Alo';lines.hidden=(!selected&&selection.category!=='acessorios')||selection.category==='perfumaria';
  perfumeBox.hidden=selection.category!=='perfumaria';Object.entries({gender:selection.gender,brand:selection.brand,kind:selection.kind}).forEach(([key,value])=>perfumeSelects[key].value=value);
  if(selected){[{name:'',count:selected.count},...selected.lines].forEach(line=>{const button=document.createElement('button');button.type='button';button.className='model-choice';button.textContent=(line.name||'Todos')+' · '+line.count;button.setAttribute('aria-pressed',String(selection.line===line.name));button.addEventListener('click',()=>choose(selection.brand,line.name,selection.category,false));lines.append(button);});}
  if(!selected && selection.category==='acessorios'){
    const counts=new Map();
    data.filter(p=>p.categoria==='acessorios').forEach(p=>{const type=PortelaCatalog.line(p);counts.set(type,(counts.get(type)||0)+1);});
    [{name:'',count:[...counts.values()].reduce((a,b)=>a+b,0)},...[...counts].sort(([a],[b])=>a.localeCompare(b,'pt-BR')).map(([name,count])=>({name,count}))].forEach(item=>{
      const button=document.createElement('button');button.type='button';button.className='model-choice';
      button.textContent=(item.name||'Todos os acessórios')+' · '+item.count;
      button.setAttribute('aria-pressed',String(selection.line===item.name));
      button.addEventListener('click',()=>choose('',item.name,'acessorios',false));
      lines.append(button);
    });
  }
  document.querySelector('#catalog-selection').textContent=selection.line || (selection.brand==='Alo' ? 'Roupas Alo' : selection.brand ? 'Todos os modelos' : selection.category==='acessorios' ? 'Escolha um tipo de acessório ou uma marca.' : selection.category==='perfumaria' ? 'Use os filtros para explorar perfumes e kits.' : 'Escolha uma marca para ver seus modelos.');
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
  document.querySelector('#product-ref').textContent = perfume ? [PortelaCatalog.perfumeSpecs(p), p.genero, 'Referência ' + p.id].filter(Boolean).join(' · ') : 'Referência ' + p.id;
  sizeInput.closest('label').hidden = perfume;
  productNote.textContent = perfume ? 'Consulte preço, disponibilidade e prazo com a loja. Envie a referência para confirmar o produto escolhido.' : p.categoria==='acessorios' ? 'Consulte preço, detalhes e prazo com a loja. Envie a referência para confirmar o acessório escolhido.' : defaultNotes[0];
  formNote.textContent = perfume ? 'A cidade entra na mensagem que você enviará pelo WhatsApp. Preço e disponibilidade serão confirmados pela loja.' : defaultNotes[1];
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
  const filtered = data.filter(p=>PortelaCatalog.matches(p,selection) && PortelaCatalog.search(p, query));
  products.replaceChildren();
  filtered.slice(0, shown).forEach(p => { const card = document.createElement('button'), image = document.createElement('img'), info = document.createElement('div'), ref = document.createElement('p'), title = document.createElement('h3'), note = document.createElement('p'), action = document.createElement('span'); card.type = 'button'; card.className = 'product-card'; card.setAttribute('aria-label', 'Ver detalhes de ' + p.nome + ', ' + p.id); setCardImage(image, p); image.alt = p.nome + ' — ' + p.id; image.loading = 'lazy'; image.decoding = 'async'; image.width = image.height = 960; info.className = 'product-info'; ref.textContent = p.id; title.textContent = p.nome; const perfume = p.categoria === 'perfumaria'; note.textContent = perfume ? PortelaCatalog.perfumeSpecs(p) : p.categoria==='acessorios' ? 'Sob encomenda · Consulte preço e detalhes' : 'Disponível sob encomenda · Consulte preço e tamanho'; action.textContent = perfume ? 'Consultar' : 'Ver detalhes'; info.append(ref, title, note, action); card.append(image, info); card.addEventListener('click', () => showProduct(p)); products.append(card); });
  status.textContent = filtered.length ? `${filtered.length} ${filtered.length === 1 ? 'produto' : 'produtos'} · mostrando ${Math.min(shown, filtered.length)}` : (query.trim() ? 'Nenhum produto para “' + query.trim() + '”. Tente outro termo ou limpe a busca.' : 'Nenhum produto nesta seleção. Escolha outra marca ou categoria.');
  more.hidden = filtered.length <= shown;
}
category.addEventListener('change', () => choose(PortelaCatalog.brandForCategory(data, selection.brand, category.value),'',category.value,false));
perfumeSelects.gender.addEventListener('change', () => choose(selection.brand,'','perfumaria',false,perfumeSelects.gender.value,selection.kind));
perfumeSelects.brand.addEventListener('change', () => choose(perfumeSelects.brand.value,'','perfumaria',false,selection.gender,selection.kind));
perfumeSelects.kind.addEventListener('change', () => choose(selection.brand,'','perfumaria',false,selection.gender,perfumeSelects.kind.value));
document.querySelector('#catalog-back').addEventListener('click',()=>choose());
document.querySelectorAll('[data-catalog-category]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();choose('','',link.dataset.catalogCategory);}));
more.addEventListener('click', () => { shown += 12; render(); });
const searchInput = document.querySelector('#busca'); let searchTimer;
const runSearch = () => { query = searchInput.value; shown = 12; render(); };
searchInput?.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(runSearch, 160); });
searchInput?.addEventListener('search', runSearch);
document.querySelector('.nav-search')?.addEventListener('click', e => { e.preventDefault(); closeMenu(); document.querySelector('#catalogo').scrollIntoView(); searchInput?.focus({preventScroll:true}); });
document.querySelector('#header-search')?.addEventListener('submit', e => { if (!searchInput) return; e.preventDefault(); searchInput.value = (e.currentTarget.elements.busca?.value || '').slice(0, 60); runSearch(); document.querySelector('#catalogo').scrollIntoView(); });
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) { const rect = dialog.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) dialog.close(); } });
fetch('catalogo.json?v=21',{cache:'no-cache'}).then(r => { if (!r.ok) throw new Error('catalog'); return r.json(); }).then(items => {
  data = PortelaCatalog.visibleProducts(items);
  category.replaceChildren(new Option('Todas as categorias',''));
  [...new Set(data.map(p=>p.categoria||'tenis'))].forEach(value=>category.add(new Option(PortelaCore.labels[value]||value,value)));
  const quizBrand=document.querySelector('#quiz-form select[name="brand"]');
  quizBrand.replaceChildren(new Option('Prefiro não informar',''));
  [...new Set(data.map(p=>p.marca))].sort((a,b)=>a.localeCompare(b,'pt-BR')).forEach(value=>quizBrand.add(new Option(value,value)));
  quizBrand.add(new Option('Quero descobrir opções','Descobrir'));quizBrand.add(new Option('Outra marca','Outra'));quizBrand.add(new Option('Sem preferência','Sem preferencia'));
  const perfumeOptions=PortelaCatalog.perfumeOptions(data);
  Object.entries({gender:'Todos os gêneros',brand:'Todas as marcas',kind:'Todos os tipos'}).forEach(([key,all])=>perfumeSelects[key].replaceChildren(new Option(all,''),...perfumeOptions[key].map(value=>new Option(value,value))));
  buildBrandMenu();
  const params=new URLSearchParams(location.search),requested=params.get('produto');
  const maker=params.get('marca')||'', type=params.get('categoria')||'', line=params.get('linha')||'';
  const group=PortelaCatalog.groups(data).find(g=>g.brand===maker);
  selection={brand:group ? maker : '',line:(group?.lines.some(l=>l.name===line) || (type==='acessorios' && data.some(p=>p.categoria==='acessorios' && PortelaCatalog.line(p)===line))) ? line : '',category:maker==='Alo' ? 'roupas' : [...category.options].some(o=>o.value===type) ? type : '',gender:'',kind:''};
  if(selection.category==='perfumaria'){selection.gender=perfumeOptions.gender.includes(params.get('genero')) ? params.get('genero') : '';selection.kind=perfumeOptions.kind.includes(params.get('tipo')) ? params.get('tipo') : '';}
  query=(params.get('busca')||searchInput?.value||'').slice(0,60);if(searchInput)searchInput.value=query;category.value=selection.category;updateNavigation();render();
  const curated = document.querySelector('#curated');
  ['PC-001', 'PC-003', 'PC-214'].forEach(id => { const p = data.find(item => item.id === id); if (!p) return; const card = document.createElement('button'), image = document.createElement('img'), info = document.createElement('div'), title = document.createElement('h3'), ref = document.createElement('p'), action = document.createElement('span'); card.type = 'button'; card.className = 'product-card'; card.setAttribute('aria-label', 'Seleção Portela: ' + p.nome + ', ' + p.id); setCardImage(image, p); image.alt = p.nome; image.loading = 'lazy'; image.width = image.height = 720; info.className = 'product-info'; title.textContent = p.nome; ref.textContent = p.id + ' · Disponível sob encomenda'; action.textContent = 'Ver detalhes'; info.append(ref,title,action); card.append(image,info); card.addEventListener('click',()=>showProduct(p)); curated.append(card); });
  if (requested) { const p = data.find(item => item.id === requested); if (p) showProduct(p); else status.textContent = 'Referência não encontrada. Explore os modelos disponíveis ou consulte a loja.'; }
}).catch(() => { status.textContent = 'Não foi possível carregar o catálogo. Atualize a página ou consulte a loja pelo WhatsApp.'; more.hidden = true; });

