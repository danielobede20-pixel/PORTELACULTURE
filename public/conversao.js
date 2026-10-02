(function() {
 const core=PortelaCore, phone='5561995158424', pending=new Map();
 const context={session:crypto.randomUUID(),entry:core.page(location.href),source:core.source(location.href,document.referrer),campaign:core.campaign(location.href)};
 try {const prior=JSON.parse(sessionStorage.getItem('portela-visita'));if(prior&&/^[a-f0-9-]{36}$/.test(prior.session)&&['direto','instagram','whatsapp','outros'].includes(prior.source)&&/^\/(?:\?produto=PC-\d{3,6})?(?:#[a-z-]+)?$/.test(prior.entry)) Object.assign(context,prior);else sessionStorage.setItem('portela-visita',JSON.stringify(context));}catch{}
 let quiz={},product=null;const viewed=new Set();
 const quizDialog=document.querySelector('#quiz'),form=document.querySelector('#quiz-form'),steps=[...form.querySelectorAll('[data-step]')],next=document.querySelector('#quiz-next'),back=document.querySelector('#quiz-back'),summary=document.querySelector('#quiz-summary');
 let step=0,trigger=null;
 function link(options={}) {return 'https://wa.me/'+phone+'?text='+encodeURIComponent(core.message({...options,quiz}));}
 function refreshLinks() {
  document.querySelectorAll('a[data-contact]').forEach(a=>{if(a.id==='order')return;const localProduct=a.classList.contains('whatsapp')?product:null;a.href=link({product:localProduct,category:a.dataset.category,use:a.dataset.use,url:localProduct?new URL('/?produto='+localProduct.id+'#catalogo',location.origin).href:location.origin+core.page(location.href)});});
  if(product)document.dispatchEvent(new Event('portela-preferences'));
 }
 function status(text) {document.querySelectorAll('[data-save-status]').forEach(el=>el.textContent=text);document.querySelectorAll('[data-retry]').forEach(el=>el.hidden=!pending.size);}
 async function send(e) {
  try {const r=await fetch('/api/interesses',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(e),keepalive:true});const value=await r.json();if(!r.ok||value.saved!==true)throw new Error(value.error||'');pending.delete(e.id);if(e.type==='product_view')return;status(pending.size?'Algumas preferências ainda não foram registradas.':'Preferências registradas. Você pode continuar pelo WhatsApp.');}
  catch {if(e.type==='product_view'){pending.delete(e.id);return;}status('Não conseguimos registrar suas preferências. Tente novamente. O WhatsApp continua disponível.');}
 }
 function register(type,placement,opts={}) {const e={id:crypto.randomUUID(),...context,type,page:opts.product?'/?produto='+opts.product.id+'#catalogo':core.page(location.href),placement,productId:opts.product?.id||null,category:opts.product?(opts.product.categoria||'tenis'):opts.category||null,quiz:{...quiz}};pending.set(e.id,e);send(e);}
 document.querySelectorAll('[data-retry]').forEach(b=>b.addEventListener('click',()=>{status('Tentando registrar…');[...pending.values()].forEach(send);}));
 document.querySelectorAll('a[href*="wa.me"],#order').forEach(a=>{a.dataset.contact='true';a.rel='noopener';a.target='_blank';if(!a.dataset.placement) a.dataset.placement=a.id==='order'?'produto':a.classList.contains('whatsapp')?'flutuante':a.closest('section')?.id||'cta';let last=0;a.addEventListener('click',()=>{if(Date.now()-last<1200)return;last=Date.now();register('whatsapp_click',a.dataset.placement,{product:a.id==='order'||a.classList.contains('whatsapp')?product:null,category:a.dataset.category});});});
 function draw() {steps.forEach((el,i)=>el.hidden=i!==step);summary.hidden=step!==3;document.querySelector('#quiz-progress').textContent=step<3?'Etapa '+(step+1)+' de 3':'Suas preferências';back.hidden=step===0;next.hidden=step===3;next.textContent=step===2?'Concluir preferências':'Continuar';if(step<3)steps[step].querySelector('input,select')?.focus();}
 document.querySelectorAll('[data-open-quiz]').forEach(b=>b.addEventListener('click',()=>{trigger=b;step=0;quizDialog.showModal();draw();}));
 function close() {quizDialog.close();trigger?.focus();}
 quizDialog.querySelector('.close').addEventListener('click',close);
 quizDialog.addEventListener('cancel',()=>trigger?.focus());
 quizDialog.addEventListener('click',e=>{if(e.target===quizDialog){const r=quizDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
 back.addEventListener('click',()=>{step--;draw();});
 form.addEventListener('submit',e=>{e.preventDefault();if(step>=3)return;if(step<2){step++;draw();return;}quiz=Object.fromEntries([...new FormData(form)].filter(([,v])=>v));document.querySelector('#quiz-preferences').replaceChildren();const fields={category:'Categoria',use:'Uso',brand:'Marca',availability:'Entrega',intent:'Momento'};for(const [k,v] of Object.entries(quiz)){const li=document.createElement('li');li.textContent=fields[k]+': '+(core.labels[v]||v);document.querySelector('#quiz-preferences').append(li);}if(!Object.keys(quiz).length){const li=document.createElement('li');li.textContent='Prefiro conversar diretamente com a loja.';document.querySelector('#quiz-preferences').append(li);}refreshLinks();step=3;draw();status('Registrando suas preferências…');register('quiz_complete','quiz');document.querySelector('#quiz-contact').focus();});
 document.querySelector('#quiz-reset').addEventListener('click',()=>{form.reset();quiz={};refreshLinks();step=0;draw();status('');});
 window.Portela={link,setProduct(p){product=p;refreshLinks();if(p&&!viewed.has(p.id)){viewed.add(p.id);register('product_view','produto',{product:p});}}};
 window.addEventListener('hashchange',refreshLinks);
 refreshLinks();
})();
