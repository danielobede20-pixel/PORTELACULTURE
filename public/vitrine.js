/* Vitrine em movimento da abertura: rolagem lateral com snap, avanço automático suave
   (com botão de pausa), arrasto com o mouse e leve inclinação no hover.
   Respeita prefers-reduced-motion e pausa fora da tela ou com a aba oculta. */
(() => {
  const root = document.querySelector('.showcase');
  const track = root?.querySelector('.showcase-track');
  if (!root || !track) return;
  const bar = root.querySelector('.showcase-progress span');
  const toggle = root.querySelector('[data-show="toggle"]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let timer = 0, resumeTimer = 0, visible = true, hover = false, focus = false, userPaused = false;

  const step = () => {
    const item = track.querySelector('.show-item');
    return item ? item.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0) : 300;
  };
  const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
  const move = dir => {
    if (dir > 0 && atEnd()) track.scrollTo({ left: 0, behavior: 'smooth' });
    else track.scrollBy({ left: dir * step(), behavior: 'smooth' });
  };
  const progress = () => {
    const max = track.scrollWidth - track.clientWidth;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.max(.08, track.scrollLeft / max) : 1})`;
  };
  const stop = () => { clearInterval(timer); timer = 0; };
  const canPlay = () => !reduce.matches && !userPaused && visible && !hover && !focus && !document.hidden;
  const start = () => { stop(); if (canPlay()) timer = setInterval(() => move(1), 3400); };
  const syncToggle = () => {
    if (!toggle) return;
    const playing = !userPaused && !reduce.matches;
    toggle.setAttribute('aria-pressed', String(!playing));
    toggle.setAttribute('aria-label', playing ? 'Pausar movimento automático' : 'Retomar movimento automático');
    toggle.textContent = playing ? '❚❚' : '▶';
    toggle.hidden = reduce.matches;
  };
  // Interação manual: pausa por alguns segundos e retoma sozinha
  const nudge = () => { stop(); clearTimeout(resumeTimer); resumeTimer = setTimeout(start, 8000); };

  root.querySelectorAll('[data-show="prev"],[data-show="next"]').forEach(b => b.addEventListener('click', () => {
    move(b.dataset.show === 'next' ? 1 : -1); nudge();
  }));
  toggle?.addEventListener('click', () => { userPaused = !userPaused; syncToggle(); start(); });
  track.addEventListener('scroll', () => requestAnimationFrame(progress), { passive: true });
  track.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hover = true; stop(); } });
  track.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { hover = false; start(); } });
  track.addEventListener('focusin', () => { focus = true; stop(); });
  track.addEventListener('focusout', e => { if (!track.contains(e.relatedTarget)) { focus = false; start(); } });
  track.addEventListener('touchstart', nudge, { passive: true });
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
  });

  // Arrasto com o mouse: só vira "arrasto" depois de 5px, para não bloquear o clique no produto
  let downX = 0, downLeft = 0, pressing = false, moved = false;
  track.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    pressing = true; moved = false; downX = e.clientX; downLeft = track.scrollLeft;
  });
  addEventListener('pointermove', e => {
    if (!pressing) return;
    const dx = e.clientX - downX;
    if (!moved && Math.abs(dx) > 5) { moved = true; track.classList.add('dragging'); }
    if (moved) track.scrollLeft = downLeft - dx;
  });
  addEventListener('pointerup', () => {
    if (!pressing) return;
    pressing = false; track.classList.remove('dragging');
    if (moved) setTimeout(() => { moved = false; }, 0);
  });
  track.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

  // Inclinação sutil acompanhando o cursor
  if (fine.matches && !reduce.matches) {
    track.querySelectorAll('.show-item').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--rx', ((e.clientY - r.top) / r.height - .5) * -6 + 'deg');
        card.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 8 + 'deg');
      });
      card.addEventListener('pointerleave', () => { card.style.removeProperty('--rx'); card.style.removeProperty('--ry'); });
    });
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; start(); }, { threshold: .25 }).observe(track);
  }
  document.addEventListener('visibilitychange', start);
  reduce.addEventListener?.('change', () => { syncToggle(); start(); });
  syncToggle(); progress(); start();
})();
