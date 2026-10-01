import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { existsSync } from 'node:fs';
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const workerPath = resolve(projectRoot, "dist/server/index.js");
const manifestPath = resolve(projectRoot, "dist/.openai/hosting.json");

const [source, manifest] = await Promise.all([
  readFile(workerPath, "utf8"),
  readFile(manifestPath, "utf8"),
]);
JSON.parse(manifest);
assert.equal(existsSync(resolve(projectRoot,'dist/client/atendimento.html')),false,'Private HTML must not be published as a static asset');

// A data URL forces ESM parsing even though the generated output has no package.json.
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const workerModule = await import(moduleUrl);
assert.equal(
  typeof workerModule.default?.fetch,
  "function",
  `${pathToFileURL(workerPath)} must export default.fetch`,
);

console.log("Artifact is valid ESM and exports default.fetch");
const origin='https://portela.test';
assert.equal((await workerModule.default.fetch(new Request(origin+'/api/atendimento'),{})).status,401);
const authenticated=new Request(origin+'/api/atendimento/base',{headers:{'oai-authenticated-user-id':'test-user','oai-authenticated-user-email':'owner@example.test'}});
const knowledgeResponse=await workerModule.default.fetch(authenticated,{PORTELA_ADMIN_EMAIL:'owner@example.test'});
assert.equal(knowledgeResponse.status,200);
const knowledge=await knowledgeResponse.json();assert.equal(knowledge.produtos.length,390);assert.equal(knowledge.ia_ativa,false);
console.log('Built attendance protection and knowledge routes verified');
assert.deepEqual(await (await workerModule.default.fetch(new Request(origin+'/api/ia'),{})).json(),{enabled:false});
const aiRequest=new Request(origin+'/api/ia',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({messages:['Quero ASICS']})});
assert.equal((await workerModule.default.fetch(aiRequest,{})).status,503);
console.log('Built AI route fails closed when disabled');
