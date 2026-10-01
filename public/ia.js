const aiDialog=document.querySelector('#ia-dialog'),aiForm=document.querySelector('#ia-form'),aiInput=document.querySelector('#ia-message'),aiResults=document.querySelector('#ia-results'),aiStatus=document.querySelector('#ia-status'),aiSend=document.querySelector('#ia-send'),aiContact=document.querySelector('#ia-contact');
let aiMessages=[],aiModels=[],aiCatalog;
fetch('/api/ia').then(r=>r.json()).then(state=>{if(state.enabled)document.querySelector('.ai-invite').hidden=false;}).catch(()=>{});
function contact(){const text=['Olá, Portela! Vim da ajuda com IA do site.',...aiMessages.slice(-3).map(m=>'Minha preferência: '+m),...aiModels.map(p=>'Modelo: '+p.nome+' ('+p.id+')'), 'Quero confirmar condições e disponibilidade.'].join('\n');aiContact.href='https://wa.me/5561995158424?text='+encodeURIComponent(text);}
document.querySelector('[data-open-ai]').addEventListener('click',()=>{aiDialog.showModal();aiInput.focus();});
aiDialog.querySelector('.close').addEventListener('click',()=>aiDialog.close());
aiForm.addEventListener('submit',async e=>{
 e.preventDefault();const message=aiInput.value.trim();if(!message||aiSend.disabled)return;
 aiSend.disabled=true;aiInput.disabled=true;aiStatus.textContent='Consultando a seleção Portela…';aiResults.replaceChildren();
 const next=[...aiMessages,message].slice(-6);
 try{
  const r=await fetch('/api/ia',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:next}),signal:AbortSignal.timeout(30000)}),body=await r.json();
  if(!r.ok)throw Error(body.error||'A IA está indisponível.');
  aiMessages=next;aiModels=body.products;aiStatus.textContent=body.message;
  aiCatalog ||= await fetch('/catalogo.json').then(r=>{if(!r.ok)throw Error('Fotos indisponíveis.');return r.json();});
  for(const p of aiModels){const full=aiCatalog.find(item=>item.id===p.id);if(!full)continue;const card=document.createElement('a');card.className='ai-card';card.href='/?produto='+encodeURIComponent(p.id)+'#catalogo';const img=document.createElement('img');img.src=full.fotos[0];img.alt=p.nome;img.loading='lazy';const name=document.createElement('strong');name.textContent=p.nome;const ref=document.createElement('span');ref.textContent=p.marca+' · '+p.id+' · Ver detalhes';card.append(img,name,ref);aiResults.append(card);}
  aiInput.value='';contact();
 }catch(error){aiStatus.textContent=error.name==='TimeoutError'?'A resposta está demorando. Você pode continuar no WhatsApp.':error.message;aiMessages=next;contact();}
 finally{aiSend.disabled=false;aiInput.disabled=false;aiInput.focus();}
});
document.querySelector('#ia-reset').addEventListener('click',()=>{if(aiSend.disabled)return;aiMessages=[];aiModels=[];aiResults.replaceChildren();aiInput.value='';aiStatus.textContent='Qual marca ou modelo você procura?';contact();aiInput.focus();});
contact();
