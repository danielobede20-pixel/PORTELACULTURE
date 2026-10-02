import catalog from './catalog.json' with { type: 'json' };
import {attendance} from './atendimento.js';
import {assistant} from './ia.js';
import {catalogMedia} from './catalog-media.js';
import assetRegistry from './catalog-assets.json' with {type:'json'};
const choices = {category:['tenis','roupas','acessorios','calcados'],use:['treino','casual','lifestyle','streetwear'],brand:[...new Set(catalog.map(p=>p.marca)),'Outra','Sem preferencia','Descobrir'],availability:['pronta_entrega','encomenda','sem_preferencia'],intent:['agora','opcoes','disponibilidade','estilo']};
const sources = ['instagram','direto','quiz','whatsapp','outros'];
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const page = /^\/(?:\?produto=PC-\d{3,6})?(?:#[a-z-]+)?$/;
const placements = ['inicio','estilo','categorias','selecao','catalogo','como-pedir','cta','produto','quiz','flutuante'];
function json(value,status=200) {return Response.json(value,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});}
export async function notifyAutomation(env,e,p) {
 if(!env?.PORTELA_AUTOMATION_WEBHOOK_URL || !['quiz_complete','whatsapp_click'].includes(e.type)) return false;
 const payload={eventId:e.id,eventType:e.type,session:e.session,source:e.source,campaign:e.campaign??null,entry:e.entry,page:e.page,placement:e.placement,product:p?{id:p.id,nome:p.nome,marca:p.marca,categoria:p.categoria||'tenis'}:null,quiz:e.quiz,intent:e.quiz?.intent??'consulta',whatsappClick:e.type==='whatsapp_click',sentAt:new Date().toISOString()};
 const headers={'content-type':'application/json','x-portela-event-id':e.id};
 if(env.PORTELA_AUTOMATION_WEBHOOK_TOKEN) headers.authorization=`Bearer ${env.PORTELA_AUTOMATION_WEBHOOK_TOKEN}`;
 try {const sender=env.__fetch||fetch;const response=await sender(env.PORTELA_AUTOMATION_WEBHOOK_URL,{method:'POST',headers,body:JSON.stringify(payload)});if(!response.ok)console.error('automation_webhook_failed',response.status);return response.ok;}
 catch(error){console.error('automation_webhook_error',error.message);return false;}
}
export async function saveInterest(db, e, p) {
 if (!db) throw new Error('DB unavailable');
 const existing = await db.prepare('SELECT id FROM interesses WHERE id = ?').bind(e.id).first();
 if (existing) return true;
 const passive=e.type==='product_view';
 const recent = await db.prepare('SELECT COUNT(*) AS n FROM interesses WHERE sessao = ? AND criado_em >= ? AND tipo '+(passive?'=':'<>')+" 'product_view'").bind(e.session,new Date(Date.now()-3600000).toISOString()).first();
 if (recent.n >= (passive?60:30)) return false;
 await db.prepare(`INSERT OR IGNORE INTO interesses (id,sessao,criado_em,tipo,origem,pagina_entrada,pagina_atual,posicionamento,produto_id,produto_nome,marca,categoria,quiz,clique_whatsapp,intencao,status,campanha) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(e.id,e.session,new Date().toISOString(),e.type,e.source,e.entry,e.page,e.placement,p?.id??null,p?.nome??null,p?.marca??e.quiz.brand??null,p?(p.categoria||'tenis'):e.category??e.quiz.category??null,JSON.stringify(e.quiz),e.type==='whatsapp_click'?1:0,e.quiz.intent??'consulta','novo',e.campaign??null).run();
 return true;
}
export default {
 async fetch(request,env,ctx) {
  const url = new URL(request.url);
  let path;try{path=decodeURIComponent(url.pathname);}catch{return json({error:'Endereço inválido.'},400);}
  if(url.pathname.startsWith('/api/catalogo/imagens/')||Object.hasOwn(assetRegistry,url.pathname.slice(1)))return catalogMedia(request,env,assetRegistry);
  if(path==='/api/ia')return assistant(request,env,catalog);
  if (['/atendimento','/atendimento/','/atendimento.html'].includes(path)||path==='/api/atendimento'||path.startsWith('/api/atendimento/'))return attendance(request,env,catalog);
  if (url.pathname !== '/api/interesses') {
   if (url.pathname.startsWith('/api/')) return json({error:'Não encontrado.'},404);
   return env.ASSETS ? env.ASSETS.fetch(request) : new Response('Not found',{status:404});
  }
  if (request.method!=='POST') return json({error:'Método não permitido.'},405);
  if (request.headers.get('origin') !== url.origin || request.headers.get('sec-fetch-site')==='cross-site') return json({error:'Origem não permitida.'},403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({error:'Formato inválido.'},415);
  if (Number(request.headers.get('content-length'))>6144) return json({error:'Dados excessivos.'},413);
  let e;
  try { const raw = await request.text(); if (raw.length>6144) return json({error:'Dados excessivos.'},413); e = JSON.parse(raw); } catch {return json({error:'Dados inválidos.'},400);}
  if (!e || !uuid.test(e.id) || !uuid.test(e.session) || !['quiz_complete','whatsapp_click','product_view'].includes(e.type) || !sources.includes(e.source) || !page.test(e.entry) || !page.test(e.page) || !placements.includes(e.placement) || !e.quiz || typeof e.quiz!=='object' || Array.isArray(e.quiz) || Object.entries(e.quiz).some(([k,v])=>!Object.hasOwn(choices,k)||!choices[k].includes(v)) || (e.category!=null&&!choices.category.includes(e.category))) return json({error:'Preferências inválidas.'},400);
  if((e.campaign!=null&&(typeof e.campaign!=='string'||!/^[A-Za-z0-9_-]{1,80}$/.test(e.campaign)))||(e.type==='product_view'&&!e.productId))return json({error:'Dados de origem inválidos.'},400);
  const product = e.productId ? catalog.find(p=>p.id===e.productId) : null;
  if (e.productId&&!product) return json({error:'Produto inválido.'},400);
  try { const saved = await saveInterest(env.DB,e,product); if(!saved)return json({error:'Aguarde um pouco antes de tentar novamente.'},429); const automation=notifyAutomation(env,e,product); if(ctx?.waitUntil)ctx.waitUntil(automation);else await automation; return json({saved:true,id:e.id},201); }
  catch (error) { console.error('interest_save_failed',error.message); return json({error:'Não conseguimos registrar suas preferências. Tente novamente; o atendimento pelo WhatsApp continua disponível.'},503); }
 }
};
