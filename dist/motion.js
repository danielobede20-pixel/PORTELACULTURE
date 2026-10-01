(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.hero');
  let observer;
  let frame = 0;
  const targets = document.querySelectorAll('.manifesto .wrap, .section-title, .lead, .journeys a, .category, .steps li, .cta-box, .brands');
  function updateHero() {
    frame = 0;
    if (!preference.matches && hero.getBoundingClientRect().bottom > 0) {
      hero.style.setProperty('--hero-shift', Math.min(scrollY * .12, 64) + 'px');
    }
  }
  function onScroll() { if (!frame && !preference.matches) frame = requestAnimationFrame(updateHero); }
  function configure() {
    observer?.disconnect();
    targets.forEach(element => element.classList.remove('pending'));
    hero.style.removeProperty('--hero-shift');
    if (preference.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('pending');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08 });
    targets.forEach((element, index) => {
      element.classList.add('reveal');
      if (element.getBoundingClientRect().top >= innerHeight) {
        element.classList.add('pending');
        element.style.setProperty('--reveal-delay', (index % 3) * 65 + 'ms');
        observer.observe(element);
      }
    });
    updateHero();
  }
  addEventListener('scroll', onScroll, { passive: true });
  preference.addEventListener('change', configure);
  configure();
})();
