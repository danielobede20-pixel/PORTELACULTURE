import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {assistant} from '../worker/ia.js';
const sql=new DatabaseSync(':memory:');for(const e of JSON.parse(readFileSync('drizzle/meta/_journal.json')).entries)sql.exec(readFileSync('drizzle/'+e.tag+'.sql','utf8'));
const DB={prepare(q){let args=[];return {bind(...a){args=a;return this;},async first(){return sql.prepare(q).get(...args)||null;}};}};
const catalog=JSON.parse(readFileSync('worker/catalog.json'));
const provider=async(...args)=>{const r=await fetch(...args);const copy=await r.clone().json();console.log(JSON.stringify({upstreamStatus:r.status,errorCode:copy.error?.code,usage:copy.usage}));return r;};
for(const question of ['Quero ASICS GEL-1130 preto e prata para visual casual.','Quanto custa e tem tamanho 40?']){
 const r=await assistant(new Request('https://portela.test/api/ia',{method:'POST',headers:{origin:'https://portela.test','content-type':'application/json'},body:JSON.stringify({messages:[question]})}),{DB,PORTELA_IA_ENABLED:'1',OPENAI_API_KEY:process.env.OPENAI_API_KEY,PORTELA_IA_MONTHLY_USD:'20'},catalog,provider);
 const body=await r.json();console.log(JSON.stringify({status:r.status,refs:body.products?.map(p=>p.id),message:body.message,error:body.error}));if(r.status!==200)process.exit(1);
}
