import knowledge from './base-atendimento.json' with {type:'json'};
import privatePage from './atendimento-page.js';
export const statuses=['novo','em_atendimento','aguardando_retorno','concluido','arquivado'];
const headers={'cache-control':'private, no-store','vary':'Cookie','x-content-type-options':'nosniff'};
const json=(body,status=200)=>Response.json(body,{status,headers});
function row(r){return {...r,quiz:JSON.parse(r.quiz),historico:JSON.parse(r.historico)};}
export async function attendance(request,env,catalog){
 const url=new URL(request.url),path=decodeURIComponent(url.pathname),page=['/atendimento','/atendimento/','/atendimento.html'].includes(path);
 const email=request.headers.get('oai-authenticated-user-email')?.trim().toLowerCase(),identity=request.headers.get('oai-authenticated-user-id');
 if(!email||!identity) return page ? new Response(null,{status:302,headers:{...headers,location:'/signin-with-chatgpt?return_to=%2Fatendimento'}}) : json({error:'Entre com sua conta ChatGPT.'},401);
 if(!env.PORTELA_ADMIN_EMAIL) return json({error:'O acesso privado ainda não foi configurado.'},503);
 if(email!==env.PORTELA_ADMIN_EMAIL.trim().toLowerCase())return json({error:'Esta conta não tem acesso ao atendimento da Portela.'},403);
 if(page){if(request.method!=='GET')return json({error:'Método não permitido.'},405);return new Response(privatePage,{headers:{...headers,'content-type':'text/html; charset=utf-8'}});}
 if(path==='/api/atendimento/base'&&request.method==='GET')return json({...knowledge,ia_ativa:env.PORTELA_IA_ENABLED==='1'&&Boolean(env.OPENAI_API_KEY),produtos:catalog});
 if(!env.DB)return json({error:'A base está indisponível. Tente novamente.'},503);
 try{
  if(path==='/api/atendimento'&&request.method==='GET'){
   const offset=Number(url.searchParams.get('offset')||0);if(!Number.isInteger(offset)||offset<0||offset>10000)return json({error:'Página inválida.'},400);
   const clauses=[],values=[];
   for(const [key,column] of [['status','status'],['marca','marca'],['origem','origem'],['tipo','tipo']]){const value=url.searchParams.get(key);if(value){if(value.length>80||(key==='status'&&!statuses.includes(value)))return json({error:'Filtro inválido.'},400);clauses.push(column+' = ?');values.push(value);}}
   const search=url.searchParams.get('busca');if(search){if(search.length>120)return json({error:'Busca muito longa.'},400);clauses.push('(produto_id LIKE ? OR produto_nome LIKE ?)');values.push('%'+search+'%','%'+search+'%');}
   const where=clauses.length?' WHERE '+clauses.join(' AND '):'';
   const results=await env.DB.prepare('SELECT * FROM interesses'+where+' ORDER BY criado_em DESC,id DESC LIMIT 26 OFFSET ?').bind(...values,offset).all();
   return json({items:results.results.slice(0,25).map(row),next_offset:results.results.length>25&&offset<10000?offset+25:null});
  }
  if(path.startsWith('/api/atendimento/')&&request.method==='PATCH'){
   if(request.headers.get('origin')!==url.origin||request.headers.get('sec-fetch-site')==='cross-site')return json({error:'Origem não permitida.'},403);
   if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Formato inválido.'},415);
   const id=path.slice('/api/atendimento/'.length);if(!/^[a-f0-9-]{36}$/i.test(id))return json({error:'Registro inválido.'},400);
   const raw=await request.text();if(raw.length>20000)return json({error:'Dados excessivos.'},413);
   let body;try{body=JSON.parse(raw);}catch{return json({error:'Dados inválidos.'},400);}
   if(!body||Array.isArray(body)||Object.keys(body).some(k=>!['status','observacoes','revisao'].includes(k))||!statuses.includes(body.status)||typeof body.observacoes!=='string'||body.observacoes.length>3000||!Number.isSafeInteger(body.revisao)||body.revisao<0)return json({error:'Confira o andamento e as observações (máximo de 3.000 caracteres).'},400);
   const previous=await env.DB.prepare('SELECT * FROM interesses WHERE id = ?').bind(id).first();if(!previous)return json({error:'Registro não encontrado.'},404);
   if(previous.revisao!==body.revisao)return json({error:'Este registro foi alterado. Recarregue para conferir a versão atual.'},409);
   if(previous.status===body.status&&previous.observacoes===body.observacoes)return json({item:row(previous)});
   const now=new Date().toISOString(),history=JSON.parse(previous.historico);
   history.push({data:now,autor:identity,status_anterior:previous.status,status:body.status,observacoes:body.observacoes});
   const result=await env.DB.prepare('UPDATE interesses SET status = ?,observacoes = ?,historico = ?,atualizado_em = ?,revisao = revisao + 1 WHERE id = ? AND revisao = ?').bind(body.status,body.observacoes,JSON.stringify(history),now,id,body.revisao).run();
   if(result.meta.changes!==1)return json({error:'Outra alteração chegou antes. Recarregue o registro.'},409);
   return json({item:row({...previous,status:body.status,observacoes:body.observacoes,historico:JSON.stringify(history),atualizado_em:now,revisao:body.revisao+1})});
  }
  return json({error:'Método ou endereço não disponível.'},405);
 }catch(error){console.error('attendance_failed',error.message);return json({error:'Não foi possível acessar ou salvar o registro. Tente novamente.'},503);}
}
