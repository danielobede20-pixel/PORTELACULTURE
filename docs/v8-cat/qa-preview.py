import json, sys
from playwright.sync_api import sync_playwright

BASE = 'http://127.0.0.1:8795/'
OUT = '/home/claude/v8cat/'
results = []

def check(name, ok, info=''):
    results.append({'check': name, 'ok': bool(ok), 'info': info})

with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in [(1440, 900), (390, 844), (360, 740), (320, 640)]:
        ctx = b.new_context(viewport={'width': w, 'height': h})
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(BASE, wait_until='networkidle')
        page.wait_for_function("document.querySelectorAll('#destaques-lista .product-card').length>0", timeout=15000)
        n = page.locator('#destaques-lista .product-card').count()
        check(f'{w}px destaques 12 cards', n == 12, str(n))
        ov = page.evaluate('document.documentElement.scrollWidth - window.innerWidth')
        check(f'{w}px sem overflow horizontal', ov <= 0, str(ov))
        # Familia Air Force 1 Low da Nike contem PC-021
        page.goto(BASE + '?marca=Nike&categoria=tenis&linha=Air%20Force%201%20Low#catalogo', wait_until='networkidle')
        page.wait_for_timeout(800)
        txt = page.locator('#products').inner_text()
        check(f'{w}px PC-021 na familia Air Force 1 Low', 'PC-021' in txt, txt[:120].replace('\n', ' '))
        # Adidas roupas Camisetas contem PC-1950; Nike camisetas contem PC-1553
        page.goto(BASE + '?marca=Adidas&categoria=roupas&linha=Camisetas#catalogo', wait_until='networkidle')
        page.wait_for_timeout(800)
        while page.locator('#mais').is_visible():
            page.locator('#mais').click(); page.wait_for_timeout(200)
        txt = page.locator('#products').inner_text()
        check(f'{w}px PC-1950 em Adidas > Camisetas', 'PC-1950' in txt)
        page.goto(BASE + '?marca=Adidas&categoria=roupas&linha=Moletons#catalogo', wait_until='networkidle')
        page.wait_for_timeout(800)
        while page.locator('#mais').is_visible():
            page.locator('#mais').click(); page.wait_for_timeout(200)
        txt = page.locator('#products').inner_text()
        check(f'{w}px PC-1679 em Adidas > Roupas > Moletons', 'PC-1679' in txt)
        # Produto direto + WhatsApp com referencia
        page.goto(BASE + '?produto=PC-1553', wait_until='networkidle')
        page.wait_for_timeout(800)
        href = page.locator('#order').get_attribute('href') or ''
        title = page.locator('#product-title').inner_text()
        check(f'{w}px modal PC-1553 + WhatsApp com referencia', 'PC-1553' in href and 'Nike' in title, title)
        if w in (360, 320):
            page.goto(BASE + '#destaques', wait_until='networkidle')
            page.wait_for_timeout(600)
            page.screenshot(path=OUT + f'qa-{w}.png')
            br = page.evaluate("(()=>{const r=document.querySelector('.whatsapp').getBoundingClientRect();return [r.width,r.height]})()")
            check(f'{w}px botao WhatsApp compacto e tocavel (>=44px)', br[1] >= 44 and br[0] < 140, str(br))
            page.evaluate('window.scrollTo(0,document.body.scrollHeight)'); page.wait_for_timeout(400)
            gap = page.evaluate("(()=>{const m=document.querySelector('main').getBoundingClientRect();const w=document.querySelector('.whatsapp').getBoundingClientRect();return getComputedStyle(document.querySelector('main')).paddingBottom})()")
            check(f'{w}px espaco inferior reservado', gap == '76px', gap)
        check(f'{w}px sem pageerror', not errors, '; '.join(errors)[:200])
        ctx.close()
    b.close()

json.dump(results, open(OUT + 'qa.json', 'w'), ensure_ascii=False, indent=1)
fails = [r for r in results if not r['ok']]
print(f"{len(results)-len(fails)}/{len(results)} ok")
for f in fails: print('FALHA', f)
