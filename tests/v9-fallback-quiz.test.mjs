import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import worker from '../worker/index.js';
import {DatabaseSync} from 'node:sqlite';
const ui=readFileSync('public/catalogo.js','utf8');
const html=readFileSync('public/index.html','utf8');
const core=await import('../public/conversao-core.js').catch(()=>null);

test('local image fallback asset exists and leaks no supplier data',()=>{
 assert.ok(existsSync('public/media/imagem-indisponivel.svg'));
 const svg=readFileSync('public/media/imagem-indisponivel.svg','utf8');
 assert.match(svg,/<svg[^>]+role="img"[^>]+aria-label=/);
 assert.doesNotMatch(svg.replace('http://www.w3.org/2000/svg',''),/http|¥|yuan|<script|href/i);
});

test('image error handler is local, scoped, and cannot loop',()=>{
 assert.match(ui,/FALLBACK_IMAGE\s*=\s*'media\/imagem-indisponivel\.svg'/);
 assert.match(ui,/addEventListener\('error'[\s\S]*?,\s*true\)/);
 assert.match(ui,/getAttribute\('src'\)\s*===\s*FALLBACK_IMAGE\)\s*return/);
 assert.match(ui,/closest\('\.products, \.thumbs, #produto'\)/);
});

test('error handler swaps a broken image once and ignores a failing fallback (simulated DOM)',()=>{
 const src=ui.split('\n').find(l=>l.startsWith("document.addEventListener('error'"));
 let handler; const doc={addEventListener:(t,f)=>{handler=f;}};
 class HTMLImageElement{constructor(src,alt){this.attrs={src};this.alt=alt;}getAttribute(k){return this.attrs[k];}set src(v){this.attrs.src=v;}get src(){return this.attrs.src;}closest(){return this;}}
 new Function('document','HTMLImageElement','const FALLBACK_IMAGE = \'media/imagem-indisponivel.svg\';'+src)(doc,HTMLImageElement);
 const img=new HTMLImageElement('media/quebrada.webp','Produto');
 handler({target:img}); assert.equal(img.src,'media/imagem-indisponivel.svg'); assert.match(img.alt,/indisponível/);
 const alt=img.alt; handler({target:img}); assert.equal(img.alt,alt);
 img.src='media/outra.webp'; handler({target:img}); assert.equal(img.src,'media/imagem-indisponivel.svg');
});

test('catalog fetch version is synchronized and cache policy is unchanged',()=>{
 assert.match(ui,/fetch\('catalogo\.json\?v=25',\{cache:'no-cache'\}\)/);
 assert.match(html,/catalogo\.js\?v=34/);
});

test('quiz offers Perfumaria in the category group',()=>{
 assert.match(html,/<input type="radio" name="category" value="perfumaria">Perfumaria<\/label>/);
});

test('Perfumaria appears in quiz summary label and WhatsApp text',()=>{
 const labels=readFileSync('public/conversao-core.js','utf8');
 const root={}; new Function('window','self','globalThis',labels).call(root,root,root,root);
 const c=root.PortelaCore; assert.ok(c,'PortelaCore');
 assert.equal(c.labels.perfumaria,'Perfumaria');
 assert.match(c.message({quiz:{category:'perfumaria'},url:'https://portela.test/'}),/Categoria: Perfumaria/);
});

test('interest worker accepts quiz category perfumaria',async()=>{
 const sql=new DatabaseSync(':memory:');
 for(const f of JSON.parse(readFileSync('drizzle/meta/_journal.json')).entries) sql.exec(readFileSync('drizzle/'+f.tag+'.sql','utf8'));
 const DB={prepare(q){let v=[];return{bind(...a){v=a;return this;},async run(){return sql.prepare(q).run(...v);},async first(){return sql.prepare(q).get(...v)??null;},async all(){return{results:sql.prepare(q).all(...v)};}};}};
 const body={id:crypto.randomUUID(),session:crypto.randomUUID(),type:'quiz_complete',source:'instagram',entry:'/?produto=PC-214#catalogo',page:'/#catalogo',placement:'quiz',productId:null,quiz:{category:'perfumaria'}};
 const r=await worker.fetch(new Request('https://portela.test/api/interesses',{method:'POST',headers:{'content-type':'application/json',origin:'https://portela.test'},body:JSON.stringify(body)}),{DB});
 assert.equal(r.status,201);
 assert.equal(JSON.parse(sql.prepare('SELECT quiz FROM interesses').get().quiz).category,'perfumaria');
});
