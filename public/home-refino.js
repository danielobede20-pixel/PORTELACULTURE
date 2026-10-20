/* Refino da home (19/10).
   1. Mostra o catálogo assim que o visitante escolhe categoria, marca, busca ou #catalogo.
   2. Abre o painel "Como pedir" a partir do menu e do rodapé.
   3. Revela as fotos em alta com transição suave quando carregam. */
(() => {
  const root = document.documentElement;
  root.classList.add('home-js');
  const wantsCatalog = () =>
    /[?&](categoria|genero|marca|linha|tipo|produto|busca)=/.test(location.search) || location.hash === '#catalogo';
  const sync = () => { if (wantsCatalog()) root.classList.remove('home-compact'); };

  // catalogo.js troca a URL com replaceState ao filtrar: acompanha sem alterar o script original
  ['replaceState', 'pushState'].forEach(name => {
    const original = history[name];
    history[name] = function (...args) { const result = original.apply(this, args); sync(); return result; };
  });
  addEventListener('hashchange', sync);
  // Antes do catalogo.js rolar até a seção, garante que ela esteja visível
  document.addEventListener('click', e => {
    if (e.target.closest('[data-catalog-category],[data-catalog-gender],a[href$="#catalogo"],.show-item,#nav-brands a,#nav-brands button')) {
      root.classList.remove('home-compact');
    }
  }, true);

  // Painel "Como pedir"
  const help = document.querySelector('#como-pedir');
  const openHelp = () => { if (help && !help.open) help.showModal(); };
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href="#como-pedir"]');
    if (!link || !help) return;
    e.preventDefault();
    document.querySelector('.menu[aria-expanded="true"]')?.click();
    openHelp();
  });
  help?.querySelector('.close')?.addEventListener('click', () => help.close());
  help?.addEventListener('click', e => { if (e.target === help) help.close(); });
  if (location.hash === '#como-pedir') openHelp();

  // Fotos em alta: aparecem suavemente quando carregadas
  document.querySelectorAll('.is-photo img').forEach(img => {
    const done = () => img.classList.add('is-loaded');
    if (img.complete && img.naturalWidth) done(); else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
  });
})();
