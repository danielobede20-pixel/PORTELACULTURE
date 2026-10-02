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
    return (!selection.brand || p.marca === selection.brand) && (!selection.category || (p.categoria || 'tenis') === selection.category) && (!selection.line || line(p) === selection.line);
  }
  function groups(items, category = '') {
    const result = new Map();
    items.filter(p => !category || (p.categoria || 'tenis') === category).forEach(p => {
      if (!result.has(p.marca)) result.set(p.marca, {brand:p.marca, label:label(p.marca), count:0, lines:new Map()});
      const group=result.get(p.marca), name=line(p);group.count++;group.lines.set(name,(group.lines.get(name)||0)+1);
    });
    return [...result.values()].sort((a,b)=>a.label.localeCompare(b.label,'pt-BR')).map(g=>({...g, lines:[...g.lines].sort(([a],[b])=>a.localeCompare(b,'pt-BR',{numeric:true})).map(([name,count])=>({name,count}))}));
  }
  return {visibleProducts, label, line, matches, groups};
})();
