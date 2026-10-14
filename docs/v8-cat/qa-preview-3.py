import json
from playwright.sync_api import sync_playwright

BASE = 'http://127.0.0.1:8795/'
OUT = '/home/claude/v8cat/'
R = []
def check(name, ok, info=''):
    R.append({'check': name, 'ok': bool(ok), 'info': str(info)[:160]})

def fab_hidden(page):
    return page.evaluate("getComputedStyle(document.querySelector('.whatsapp')).visibility") == 'hidden'

with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in [(1440, 900), (390, 844), (360, 740), (320, 640)]:
        ctx = b.new_context(viewport={'width': w, 'height': h})
        page = ctx.new_page()
        errs = []
        page.on('pageerror', lambda e: errs.append(str(e)))
        page.on('console', lambda m: errs.append('console:' + m.text) if m.type == 'error' and '503' not in m.text and 'Failed to load resource' not in m.text else None)
        page.goto(BASE, wait_until='networkidle')
        page.wait_for_function("document.querySelectorAll('#destaques-lista .product-card').length>0", timeout=15000)
        txt = page.locator('#destaques-lista').inner_text()
        check(f'{w} destaques 12 cards', page.locator('#destaques-lista .product-card').count() == 12)
        srcs=page.evaluate("[...document.querySelectorAll('#destaques-lista img')].map(i=>i.getAttribute('src'))")
        check(f'{w} vitrine com PC-1706 e sem PC-1679', any('PC-1706' in s for s in srcs) and not any('PC-1679' in s for s in srcs))
        import re
        vis=page.evaluate('document.body.innerText')
        check(f'{w} nenhum PC- visivel na pagina inicial', not re.search(r'PC-\d', vis), re.findall(r'.{0,20}PC-\d+', vis)[:3])
        check(f'{w} sem overflow', page.evaluate('document.documentElement.scrollWidth-innerWidth') <= 0)
        # rolagem do botao
        page.evaluate('scrollTo(0,0)'); page.wait_for_timeout(300)
        check(f'{w} botao visivel no topo', not fab_hidden(page))
        for y in (400, 800, 1200):
            page.mouse.wheel(0, 400); page.wait_for_timeout(120)
        page.wait_for_timeout(400)
        hidden_down = fab_hidden(page)
        check(f'{w} botao ao rolar para baixo', hidden_down == (w <= 820), 'oculto' if hidden_down else 'visivel')
        page.mouse.wheel(0, -300); page.wait_for_timeout(500)
        check(f'{w} botao volta ao rolar para cima', not fab_hidden(page))
        page.evaluate('scrollTo(0,document.documentElement.scrollHeight)'); page.wait_for_timeout(1500)
        check(f'{w} botao visivel no fim da pagina', not fab_hidden(page))
        # menu (mobile)
        if w <= 820:
            page.evaluate('scrollTo(0,0)')
            page.locator('.menu').click(); page.wait_for_timeout(200)
            check(f'{w} menu abre', page.locator('.menu').get_attribute('aria-expanded') == 'true')
            page.locator('.menu').click()
        # quiz: abre, Perfumaria, avanca ate o resumo, fecha
        page.goto(BASE + '#catalogo', wait_until='networkidle')
        page.locator('[data-open-quiz]').click(); page.wait_for_timeout(300)
        check(f'{w} quiz abre com Perfumaria', page.locator('#quiz input[value="perfumaria"]').count() == 1 and page.locator('#quiz').evaluate('d=>d.open'))
        page.locator('#quiz input[value="perfumaria"]').check(force=True)
        page.locator('#quiz input[value="casual"]').check(force=True)
        for _ in range(3):
            if page.locator('#quiz-summary').is_visible(): break
            page.locator('#quiz-next').click(); page.wait_for_timeout(300)
        summary = page.locator('#quiz-summary').inner_text() if page.locator('#quiz-summary').is_visible() else ''
        href = page.locator('#quiz-contact').get_attribute('href') or ''
        check(f'{w} quiz conclui com Perfumaria no resumo e WhatsApp', 'Perfumaria' in summary and 'erfumaria' in href, summary[:80])
        page.locator('#quiz .close').click(); page.wait_for_timeout(200)
        check(f'{w} quiz fecha', not page.locator('#quiz').evaluate('d=>d.open'))
        # produto corrigido + tamanho/cidade opcionais no WhatsApp
        page.goto(BASE + '?produto=PC-1950', wait_until='networkidle'); page.wait_for_timeout(600)
        page.locator('#pedido-tamanho').fill('M'); page.locator('#pedido-cidade').fill('Brasília / DF'); page.wait_for_timeout(200)
        href = page.locator('#order').get_attribute('href') or ''
        title = page.locator('#product-title').inner_text()
        modal=page.locator('#produto').inner_text()
        check(f'{w} PC-1950 Adidas + WhatsApp com ref, tamanho e cidade', 'Adidas' in title and 'PC-1950' in href and 'M' in href, title)
        check(f'{w} detalhe do produto sem PC- visivel', 'PC-' not in modal, modal[:120])
        check(f'{w} sem erro critico', not errs, '; '.join(errs))
        ctx.close()
    # imagem quebrada -> fallback
    ctx = b.new_context(viewport={'width': 390, 'height': 844}); page = ctx.new_page()
    page.route('**/media/001-01.webp', lambda r: r.abort())
    page.goto(BASE, wait_until='networkidle'); page.locator('#curated').scroll_into_view_if_needed(); page.wait_for_timeout(1500)
    srcs = page.evaluate("[...document.querySelectorAll('#curated img')].map(i=>i.getAttribute('src'))")
    check('imagem quebrada usa fallback', any('imagem-indisponivel' in (s or '') for s in srcs), srcs[:2])
    r = page.goto(BASE + 'rota-que-nao-existe', wait_until='domcontentloaded')
    check('rota inexistente nao quebra (status tratado)', r.status in (200, 404), r.status)
    ctx.close(); b.close()

json.dump(R, open(OUT + 'qa3.json', 'w'), ensure_ascii=False, indent=1)
f = [x for x in R if not x['ok']]
print(f'{len(R)-len(f)}/{len(R)} ok')
for x in f: print('FALHA', x)
