import { gsap } from 'gsap';
import mediaTokens from '@/styles/media-tokens.json';

const numbers = document.querySelectorAll<HTMLElement>('.stat-nombre');
const preference = window.matchMedia(mediaTokens['--mq-motion-reduced']);

if (!preference.matches && 'IntersectionObserver' in window) {
  const finishers = new Set<() => void>();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.5) continue;
      const number = entry.target as HTMLElement;
      observer.unobserve(number);
      const finalText = number.textContent ?? '';
      const match = finalText.match(/^(\+?)(\d+)(.*)$/);
      if (!match) continue;

      const overlay = document.createElement('span');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.className = 'stat-counter-overlay';
      Object.assign(overlay.style, { position: 'absolute', inset: '0', textAlign: 'inherit' });
      const original = document.createElement('span');
      original.textContent = finalText;
      original.style.opacity = '0';
      number.replaceChildren(original, overlay);
      number.style.position = 'relative';
      const state = { value: 0 };
      const render = () => { overlay.textContent = `${match[1]}${Math.round(state.value)}${match[3]}`; };
      render();
      const finish = () => {
        tween.kill();
        number.replaceChildren(document.createTextNode(finalText));
        number.style.removeProperty('position');
        finishers.delete(finish);
      };
      const tween = gsap.to(state, {
        value: Number(match[2]), duration: 1.4, ease: 'power2.out',
        onUpdate: render, onComplete: finish,
      });
      finishers.add(finish);
    }
  }, { threshold: 0.5 });
  numbers.forEach(number => observer.observe(number));
  preference.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    finishers.forEach(finish => finish());
  });
}
