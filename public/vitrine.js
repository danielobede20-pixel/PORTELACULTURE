/* Vitrine em movimento da abertura: rolagem lateral com snap, avanço automático suave,
   arrasto com o mouse e leve inclinação no hover. Respeita prefers-reduced-motion. */
(() => {
  const root = document.querySelector('.showcase');
  if (!root) return;
  const track = root.querySelector('.showcase-track');
  const bar = root.querySelector('.showcase-progress span');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let timer = 0, paused = false, visible = true;

  const step = () => {
    const item = track.querySelector('.show-item');
    return item ? item.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : 300;
  };
  const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  const move = dir => {
    if (dir > 0 && atEnd()) track.scrollTo({ left: 0, behavior: 'smooth' });
    else track.scrollBy({ left: dir * step(), behavior: 'smooth' });
  };
  const progress = () => {
    const max = track.scrollWidth - track.clientWidth;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.max(.08, track.scrollLeft / max) : 1})`;
  };
  const stop = () => { clearInterval(timer); timer = 0; };
  const start = () => {
    stop();
    if (reduce.matches || paused || !visible) return;
    timer = setInterval(() => move(1), 3400);
  };

  root.querySelectorAll('[data-show]').forEach(b => b.addEventListener('click', () => {
    move(b.dataset.show === 'next' ? 1 : -1); paused = true; stop();
  }));
  track.addEventListener('scroll', () => requestAnimationFrame(progress), { passive: true });
  ['pointerenter', 'focusin', 'touchstart'].forEach(e => track.addEventListener(e, () => { paused = true; stop(); }, { passive: true }));
  ['pointerleave', 'focusout'].forEach(e => track.addEventListener(e, () => { paused = false; start(); }));
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
  });

  // Arrasto com o mouse (no toque, a rolagem nativa já funciona)
  let dragX = 0, dragLeft = 0, dragging = false, moved = false;
  track.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    dragging = true; moved = false; dragX = e.clientX; dragLeft = track.scrollLeft;
    track.classList.add('dragging');
  });
  addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - dragX;
    if (Math.abs(dx) > 4) moved = true;
    track.scrollLeft = dragLeft - dx;
  });
  addEventListener('pointerup', () => { if (dragging) { dragging = false; track.classList.remove('dragging'); } });
  track.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } }, true);

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
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; visible ? start() : stop(); }, { threshold: .25 }).observe(track);
  }
  reduce.addEventListener?.('change', start);
  progress(); start();
})();
