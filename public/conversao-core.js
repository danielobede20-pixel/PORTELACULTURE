(function(root) {
 const labels={tenis:'tênis',roupas:'roupas',acessorios:'acessórios',treino:'Treino',casual:'Casual',lifestyle:'Lifestyle',pronta_entrega:'Pronta entrega (a confirmar)',encomenda:'Encomenda',sem_preferencia:'Sem preferência',agora:'Quero comprar agora',opcoes:'Quero ver opções','Sem preferencia':'Sem preferência',Outra:'Outra marca'};
 function message({product,category,quiz={},url,size,city,use}={}) {
  const lines=[product ? `Olá! Vim pelo site da Portela Culture e tenho interesse no produto ${product.nome}. Gostaria de consultar a disponibilidade.` : 'Olá! Vim pelo site da Portela Culture e gostaria de atendimento.'];
  if(product) lines.push(`Referência: ${product.id} · Marca: ${product.marca} · Categoria: tênis`);
  else if(category) lines.push('Procuro: '+labels[category]);
  if(use&&!quiz.use) lines.push('Uso: '+labels[use]);
  if(size?.trim()) lines.push('Numeração desejada: '+size.trim());
  if(city?.trim()) lines.push('Cidade / UF: '+city.trim());
  const fields={category:'Categoria',use:'Uso',brand:'Marca preferida',availability:'Preferência de entrega',intent:'Momento da compra'};
  if(Object.keys(quiz).length) {lines.push('Minhas preferências:');for(const [k,label] of Object.entries(fields)) if(quiz[k]) lines.push(label+': '+(labels[quiz[k]]||quiz[k]));}
  lines.push('Podem confirmar preço, disponibilidade, frete, pagamento e prazo?');
  if(url) lines.push(url);
  return lines.join('\n');
 }
 function source(href,referrer) {const s=new URL(href).searchParams.get('utm_source')?.toLowerCase();if(['instagram','ig'].includes(s))return 'instagram';if(['whatsapp','wa'].includes(s))return 'whatsapp';if(s)return 'outros';if(!referrer)return 'direto';let host;try {host=new URL(referrer).hostname;}catch{return 'outros';}return /(^|\.)instagram\.com$/.test(host)?'instagram':/(^|\.)whatsapp\.com$/.test(host)?'whatsapp':'outros';}
 function page(href) {const u=new URL(href),p=u.searchParams.get('produto');return '/'+(/^PC-\d{3}$/.test(p)?'?produto='+p:'')+(/^#[a-z-]+$/.test(u.hash)?u.hash:'');}
 root.PortelaCore={message,source,page,labels};
})(globalThis);
