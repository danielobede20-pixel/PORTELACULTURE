async function digest(bytes){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');}
async function permitted(request,env){
 if(env.PORTELA_ASSET_IMPORT_ENABLED!=='1'||!env.PORTELA_ASSET_IMPORT_TOKEN)return false;
 const header=request.headers.get('authorization')||'';
 if(header.length>512)return false;
 return await digest(new TextEncoder().encode(header))===await digest(new TextEncoder().encode('Bearer '+env.PORTELA_ASSET_IMPORT_TOKEN));
}
export async function catalogMedia(request,env,registry){
 const url=new URL(request.url),upload=url.pathname.startsWith('/api/catalogo/imagens/');
 const key=upload?'media/catalogo/'+url.pathname.slice('/api/catalogo/imagens/'.length):url.pathname.slice(1);
 const record=Object.hasOwn(registry,key)?registry[key]:null;
 if(!record)return new Response('Not found',{status:404});
 try{
  if(upload){
   if(request.method!=='PUT')return new Response('Method not allowed',{status:405});
   if(!await permitted(request,env))return new Response('Unauthorized',{status:401});
   if(!env.BUCKET)return new Response('Storage unavailable',{status:503});
   if(request.headers.get('content-type')!=='image/webp')return new Response('Unsupported format',{status:415});
   if(record.bytes>2*1024*1024||Number(request.headers.get('content-length'))>record.bytes)return new Response('Too large',{status:413});
   const chunks=[];let size=0;const reader=request.body?.getReader();
   if(!reader)return new Response('Invalid image',{status:422});
   while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>record.bytes){await reader.cancel();return new Response('Too large',{status:413});}chunks.push(part.value);}
   const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
   if(size!==record.bytes||new TextDecoder().decode(bytes.slice(0,4))!=='RIFF'||new TextDecoder().decode(bytes.slice(8,12))!=='WEBP'||await digest(bytes)!==record.sha256)return new Response('Image mismatch',{status:422});
   const existing=await env.BUCKET.head(key);
   if(existing)return existing.customMetadata?.sha256===record.sha256?Response.json({stored:true,existing:true}):new Response('Existing image mismatch',{status:409});
   await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:'image/webp',cacheControl:'public, max-age=31536000, immutable'},customMetadata:{sha256:record.sha256}});
   return Response.json({stored:true},{status:201});
  }
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
  const object=env.BUCKET?await env.BUCKET.get(key):null;
  if(!object)return env.ASSETS?env.ASSETS.fetch(request):new Response('Not found',{status:404});
  return new Response(request.method==='HEAD'?null:object.body,{headers:{'content-type':'image/webp','content-length':String(record.bytes),'cache-control':'public, max-age=31536000, immutable','x-content-type-options':'nosniff',etag:object.httpEtag||record.sha256}});
 }catch(error){console.error('catalog_media_unavailable',error.message);return new Response('Image storage temporarily unavailable',{status:503,headers:{'retry-after':'30'}});}
}
