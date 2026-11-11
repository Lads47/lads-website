document.documentElement.classList.add('has-js');

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const header = document.querySelector<HTMLElement>('#header');
const menu = document.querySelector<HTMLElement>('#site-navigation');
const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
const mobile = matchMedia('(max-width: 815px)');

function closeMenu(restoreFocus = false) {
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.classList.remove('open');
  menu?.classList.remove('active');
  if (restoreFocus) toggle?.focus();
}
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.classList.toggle('open', open);
  menu?.classList.toggle('active', open);
});
header?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
header?.addEventListener('focusout', (event) => {
  if (!header.contains(event.relatedTarget as Node)) closeMenu();
});
menu?.addEventListener('click', (event) => {
  if ((event.target as Element).closest('a')) closeMenu();
});
mobile.addEventListener('change', () => closeMenu());

const backToTop = document.querySelector<HTMLButtonElement>('#backToTop');
function onScroll() {
  const scrolled = window.scrollY > 80;
  header?.classList.toggle('scrolled', scrolled);
  backToTop?.classList.toggle('visible', scrolled);
  if (toggle?.getAttribute('aria-expanded') === 'true') closeMenu();
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();
backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' }));

document.querySelectorAll<HTMLElement>('.real-photos').forEach((grid) => {
  const count = grid.querySelectorAll('.real-photo-item').length;
  if (count >= 2) grid.classList.add(count === 2 ? 'has-two' : count === 3 ? 'has-three' : 'has-four');
});

const dialog = document.querySelector<HTMLDialogElement>('#photo-lightbox');
if (dialog) {
  const largeImage = dialog.querySelector<HTMLImageElement>('img')!;
  document.querySelectorAll<HTMLImageElement>('.real-photo-item img, .equipe-photo-card img').forEach((image) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'photo-trigger';
    button.setAttribute('aria-label', `Agrandir : ${image.alt || 'photographie'}`);
    image.before(button);
    button.append(image);
    button.addEventListener('click', () => {
      largeImage.src = image.currentSrc || image.src;
      largeImage.alt = image.alt;
      dialog.showModal();
    });
  });
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    const outside = (event: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom;
    };
    let pressedOutside = false;
    dialog.addEventListener('pointerdown', (event) => { pressedOutside = outside(event); });
    dialog.addEventListener('pointerup', (event) => { if (pressedOutside && outside(event)) dialog.close(); });
  }
}

const video = document.querySelector<HTMLVideoElement>('.hero-video');
const pause = document.querySelector<HTMLButtonElement>('#heroPause');
if (video && pause) {
  const updatePause = () => {
    pause.setAttribute('aria-label', video.paused ? 'Lire la vidéo' : 'Mettre la vidéo en pause');
    pause.innerHTML = video.paused
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
  };
  if (reducedMotion.matches) video.pause();
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) video.pause(); });
  video.addEventListener('play', updatePause);
  video.addEventListener('pause', updatePause);
  pause.addEventListener('click', () => {
    if (video.paused) void video.play().catch(updatePause);
    else video.pause();
  });
  updatePause();
}
