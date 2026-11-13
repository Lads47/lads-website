import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import mediaTokens from '@/styles/media-tokens.json';

gsap.registerPlugin(SplitText);

async function animateHero() {
  const hero = document.querySelector<HTMLElement>('.hero-intro');
  const title = hero?.querySelector<HTMLHeadingElement>('h1');
  const subtitle = hero?.querySelector<HTMLElement>('.hero-subtitle');
  const buttons = hero?.querySelectorAll<HTMLAnchorElement>('.button-wrapper a');
  if (!hero || !title || !subtitle || !buttons?.length) return;

  await document.fonts.ready;
  // A restored scroll position or deep link should keep its current reading position.
  if (window.scrollY > 0) return;

  let played = false;
  const media = gsap.matchMedia();
  media.add({ reduced: mediaTokens['--mq-motion-reduced'], all: 'all' }, context => {
    if (context.conditions?.reduced || played) return;
    played = true;

    let timeline: gsap.core.Timeline;
    const finish = () => timeline?.progress(1);
    const removeListeners = () => {
      hero.removeEventListener('focusin', finish);
      hero.removeEventListener('pointerdown', finish);
    };
    const split = SplitText.create(title, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'hero-line',
      autoSplit: true,
      aria: 'auto',
      onSplit(self) {
        timeline = gsap.timeline({
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            self.revert();
            removeListeners();
          },
        });
        timeline
          .from(subtitle, { opacity: 0, y: '0.5em', duration: 0.35 }, 0)
          .from(self.lines, { yPercent: 105, opacity: 0.15, duration: 0.8, stagger: 0.1 }, 0.12)
          .from(buttons, { opacity: 0, y: '1em', scale: 0.96, duration: 0.5, stagger: 0.08, clearProps: 'transform,opacity' }, 0.55);
        return timeline;
      },
    });
    hero.addEventListener('focusin', finish);
    hero.addEventListener('pointerdown', finish);
    return () => {
      removeListeners();
      split.revert();
    };
  });
}

void animateHero();
