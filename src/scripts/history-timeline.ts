import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
// Initial global refreshes temporarily reset scrollY, interrupting Chrome's smooth restoration.
// This page has no pins: measure its triggers individually during loading instead.
ScrollTrigger.config({ autoRefreshEvents: 'visibilitychange,resize' });

const items = document.querySelectorAll<HTMLElement>('.timeline-item');
const header = document.querySelector<HTMLElement>('#header');

// Discrete reading states only: content is never hidden, pinned or moved.
const triggers: ScrollTrigger[] = [];
items.forEach(item => {
  const year = item.querySelector<HTMLElement>('.timeline-year');
  if (!year) return;

  const sync = (trigger: ScrollTrigger) => {
    item.toggleAttribute('data-reached', trigger.scroll() >= trigger.start);
  };

  triggers.push(ScrollTrigger.create({
    trigger: year,
    start: () => {
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      return `top ${headerHeight + (window.innerHeight - headerHeight) / 2}px`;
    },
    end: 'max',
    onEnter: sync,
    onLeaveBack: sync,
    onRefresh: sync,
  }));
});

// Fonts and browser scroll restoration can settle after the module runs.
const refresh = () => triggers.forEach(trigger => trigger.refresh());
void document.fonts.ready.then(refresh);
window.addEventListener('pageshow', refresh);
