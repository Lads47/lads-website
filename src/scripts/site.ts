import mediaTokens from '@/styles/media-tokens.json';
document.documentElement.classList.add('has-js');
const reducedMotion = matchMedia(mediaTokens['--mq-motion-reduced']);
const header = document.querySelector<HTMLElement>('#header');
const backToTop = document.querySelector<HTMLButtonElement>('#backToTop');
function onScroll() {
  const scrolled = window.scrollY > 80;
  header?.classList.toggle('scrolled', scrolled);
  backToTop?.classList.toggle('visible', scrolled);
  const wrapper = backToTop?.parentElement;
  if (wrapper) wrapper.inert = !scrolled;
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();
backToTop?.addEventListener('click', () => window.scrollTo({top: 0}));
const dialog = document.querySelector<HTMLDialogElement>('#photo-lightbox');
if (dialog) {
  const largeImage = dialog.querySelector<HTMLImageElement>('img')!;
  document.querySelectorAll<HTMLImageElement>('.real-photo-item img, img[data-lightbox]').forEach((image) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'photo-trigger';
    button.setAttribute('aria-label', `Agrandir : ${image.alt || 'photographie'}`);
    image.before(button);
    button.append(image);
    button.addEventListener('click', () => {
      largeImage.src = image.src;
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


const video = document.querySelector<HTMLVideoElement>('#heroVideo');
const pause = document.querySelector<HTMLButtonElement>('#heroPause');
if (video && pause) {
  const updatePause = () => {
    pause.setAttribute('aria-label', video.paused ? 'Lire la vidéo' : 'Mettre la vidéo en pause');
    pause.setAttribute('aria-pressed', String(!video.paused));
  };
  if (!reducedMotion.matches) void video.play().catch(updatePause);
  reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)video.pause();});
  video.addEventListener('play',updatePause);
  video.addEventListener('pause',updatePause);
  pause.addEventListener('click',()=>{if(video.paused)void video.play().catch(updatePause);else video.pause();});
  updatePause();
}
