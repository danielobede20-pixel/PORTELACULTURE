const PortelaCatalog = (() => {
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function visibleProducts(items) { return items.filter(p => p.marca !== 'Alo' || p.categoria === 'roupas'); }
  function label(brand) { return brand === 'On' ? 'On Running' : brand; }
  function line(p) {
    if (p.linha) return p.linha;
    const name = normalize(p.nome);
    if (name.includes('dunk')) return name.includes('sb') ? 'Dunk SB' : name.includes('high') ? 'Dunk High' : 'Dunk Low';
    if (name.includes('force 58')) return 'SB Force 58';
    return p.categoria === 'roupas' ? 'Roupas' : p.categoria === 'acessorios' ? 'Acessórios' : 'Outros modelos';
  }
  function matches(p, selection = {}) {
    return (!selection.brand || p.marca === selection.brand) && (!selection.category || (p.categoria || 'tenis') === selection.category) && (!selection.line || line(p) === selection.line) && (!selection.gender || p.genero === selection.gender) && (!selection.kind || p.subtipo === selection.kind);
  }
  function brandForCategory(items, brand, category) {
    return brand && items.some(p => matches(p, {brand, category})) ? brand : '';
  }
  function perfumeOptions(items) {
    const perfumes = items.filter(p => p.categoria === 'perfumaria'), unique = key => [...new Set(perfumes.map(p => p[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    return {gender:unique('genero'), brand:unique('marca'), kind:unique('subtipo')};
  }
  function perfumeSpecs(p) {
    return [p.marca, p.concentracao, p.volume ? p.volume + ' ml' : ''].filter(Boolean).join(' · ');
  }
  function groups(items, category = '') {
    const result = new Map();
    items.filter(p => !category || (p.categoria || 'tenis') === category).forEach(p => {
      if (!result.has(p.marca)) result.set(p.marca, {brand:p.marca, label:label(p.marca), count:0, lines:new Map()});
      const group=result.get(p.marca), name=line(p);group.count++;group.lines.set(name,(group.lines.get(name)||0)+1);
    });
    return [...result.values()].sort((a,b)=>a.label.localeCompare(b.label,'pt-BR')).map(g=>({...g, lines:[...g.lines].sort(([a],[b])=>a.localeCompare(b,'pt-BR',{numeric:true})).map(([name,count])=>({name,count}))}));
  }
  function search(p, query = '') {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return true;
    const text = normalize([p.nome, p.marca, label(p.marca), line(p), p.categoria, p.categoria === 'tenis' ? 'tenis sneaker' : '', p.id, p.subtipo, p.genero, p.concentracao].filter(Boolean).join(' '));
    return terms.every(term => text.includes(term));
  }
  return {visibleProducts, label, line, matches, search, brandForCategory, groups, perfumeOptions, perfumeSpecs};
})();
