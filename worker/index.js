import catalog from './catalog.json' with { type: 'json' };
import {attendance} from './atendimento.js';
const choices = {category:['tenis','roupas','acessorios'],use:['treino','casual','lifestyle'],brand:['Nike','New Balance','Adidas','ASICS','On','Vans','Puma','Outra','Sem preferencia'],availability:['pronta_entrega','encomenda','sem_preferencia'],intent:['agora','opcoes']};
const sources = ['instagram','direto','quiz','whatsapp','outros'];
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const page = /^\/(?:\?produto=PC-\d{3})?(?:#[a-z-]+)?$/;
const placements = ['inicio','estilo','categorias','selecao','catalogo','como-pedir','cta','produto','quiz','flutuante'];
function json(value,status=200) {return Response.json(value,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});}
export async function saveInterest(db, e, p) {
 if (!db) throw new Error('DB unavailable');
 const existing = await db.prepare('SELECT id FROM interesses WHERE id = ?').bind(e.id).first();
 if (existing) return true;
 const recent = await db.prepare('SELECT COUNT(*) AS n FROM interesses WHERE sessao = ? AND criado_em >= ?').bind(e.session,new Date(Date.now()-3600000).toISOString()).first();
 if (recent.n >= 30) return false;
 await db.prepare(`INSERT OR IGNORE INTO interesses (id,sessao,criado_em,tipo,origem,pagina_entrada,pagina_atual,posicionamento,produto_id,produto_nome,marca,categoria,quiz,clique_whatsapp,intencao,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(e.id,e.session,new Date().toISOString(),e.type,e.source,e.entry,e.page,e.placement,p?.id??null,p?.nome??null,p?.marca??e.quiz.brand??null,p?'tenis':e.category??e.quiz.category??null,JSON.stringify(e.quiz),e.type==='whatsapp_click'?1:0,e.quiz.intent??'consulta','novo').run();
 return true;
}
export default {
 async fetch(request,env) {
  const url = new URL(request.url);
  let path;try{path=decodeURIComponent(url.pathname);}catch{return json({error:'Endereço inválido.'},400);}
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
  if (!e || !uuid.test(e.id) || !uuid.test(e.session) || !['quiz_complete','whatsapp_click'].includes(e.type) || !sources.includes(e.source) || !page.test(e.entry) || !page.test(e.page) || !placements.includes(e.placement) || !e.quiz || typeof e.quiz!=='object' || Array.isArray(e.quiz) || Object.entries(e.quiz).some(([k,v])=>!Object.hasOwn(choices,k)||!choices[k].includes(v)) || (e.category!=null&&!choices.category.includes(e.category))) return json({error:'Preferências inválidas.'},400);
  const product = e.productId ? catalog.find(p=>p.id===e.productId) : null;
  if (e.productId&&!product) return json({error:'Produto inválido.'},400);
  try { const saved = await saveInterest(env.DB,e,product); return saved ? json({saved:true,id:e.id},201) : json({error:'Aguarde um pouco antes de tentar novamente.'},429); }
  catch (error) { console.error('interest_save_failed',error.message); return json({error:'Não conseguimos registrar suas preferências. Tente novamente; o atendimento pelo WhatsApp continua disponível.'},503); }
 }
};
