import json,re,random
from playwright.sync_api import sync_playwright
c=json.load(open('/home/claude/portelaculture/public/catalogo.json'))
random.seed(14)
by={}
for p in c: by.setdefault((p['marca'],p['categoria']),[]).append(p)
sample=[]
for k,v in by.items(): sample+=random.sample(v,min(2,len(v)))
bad=[];ok=0
with sync_playwright() as pw:
    b=pw.chromium.launch();pg=b.new_page(viewport={'width':390,'height':844})
    for p in sample:
        pg.goto('http://127.0.0.1:8795/?produto='+p['id'],wait_until='domcontentloaded')
        try: pg.wait_for_function("document.querySelector('#produto')?.open",timeout=10000)
        except Exception:
            bad.append(('NAO ABRIU',p['id'],p['marca'],p['categoria'],pg.locator('#resultado').inner_text()[:80])); continue
        t=pg.locator('#produto').inner_text(); href=pg.locator('#order').get_attribute('href') or ''
        if re.search(r'PC-\d',t) or p['id'] not in href: bad.append((p['id'],t[:80]))
        else: ok+=1
    # brand pages: every brand x category card list
    for (m,cat) in by:
        pg.goto('http://127.0.0.1:8795/?marca='+m+'&categoria='+cat+'#catalogo',wait_until='networkidle')
        pg.wait_for_timeout(300)
        t=pg.locator('#catalogo').inner_text()
        if re.search(r'PC-\d',t): bad.append((m,cat,re.findall(r'.{0,20}PC-\d+',t)[:2]))
        else: ok+=1
    b.close()
print('amostra produtos',len(sample),'paginas marca/categoria',len(by),'ok',ok,'falhas',len(bad));print(bad[:5])
