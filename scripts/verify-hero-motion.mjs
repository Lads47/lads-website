import assert from 'node:assert/strict';

export async function verifyHeroMotion(contextFor, base) {
  for (const width of [384, 390, 1440]) {
    const context = await contextFor({ width, height: 1000 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.addInitScript(() => {
        window.heroMotionSamples = [];
        const timer = setInterval(() => {
          const lines = [...document.querySelectorAll('.hero-line')];
          const button = document.querySelector('.hero-intro .button-wrapper a');
          if (lines.length && button) window.heroMotionSamples.push({
            positions: lines.map(line => line.getBoundingClientRect().y),
            buttonOpacity: getComputedStyle(button).opacity,
            buttonOpacities: [...document.querySelectorAll('.hero-intro .button-wrapper a')].map(el => getComputedStyle(el).opacity),
          });
        }, 30);
        setTimeout(() => clearInterval(timer), 2500);
      });
      await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.querySelectorAll('.hero-line').length > 1);
      const name = await page.locator('h1').getAttribute('aria-label');
      assert.match(name, /Captation Vidéo multicaméra et diffusion en direct/);
      if (width === 1440) assert.deepEqual(
        (await page.locator('.hero-line').allTextContents()).map(text => text.trim()),
        ['Captation Vidéo multicaméra', 'et diffusion en direct'],
        'Deux lignes distinctes sur bureau',
      );
      const initialHeight = await page.locator('h1').evaluate(el => el.clientHeight);
      const animatedLines = (await page.locator('.hero-line').allTextContents()).map(text => text.trim());
      await page.waitForFunction(() => !document.querySelector('.hero-line'));
      assert.equal(await page.locator('h1').evaluate(el => el.clientHeight), initialHeight, 'Titre stable après nettoyage');
      const finalLines = await page.locator('h1').evaluate(title => {
        const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
        const lines = [];
        let node;
        while ((node = walker.nextNode())) {
          for (const match of node.textContent.matchAll(/\S+/g)) {
            const range = document.createRange();
            range.setStart(node, match.index);
            range.setEnd(node, match.index + match[0].length);
            const top = range.getBoundingClientRect().top;
            const previous = lines.at(-1);
            if (previous && Math.abs(previous.top - top) < 1) previous.words.push(match[0]);
            else lines.push({ top, words: [match[0]] });
          }
        }
        return lines.map(line => line.words.join(' '));
      });
      assert.deepEqual(animatedLines, finalLines, `Même répartition des mots pendant et après l'animation à ${width}px`);
      const samples = await page.evaluate(() => window.heroMotionSamples);
      assert.ok(samples.length > 3, 'Animation observée sur plusieurs images');
      assert.ok(samples.some(sample => sample.buttonOpacities.every(opacity => Number(opacity) === 0)), 'Les deux boutons sont complètement invisibles avant leur entrée');
      assert.ok(samples.some(sample => Number(sample.buttonOpacity) < 0.9));
      assert.ok(samples.some(sample => Number(sample.buttonOpacity) > 0.9));
      // A sample can precede GSAP's initial positioning and equal the final position.
      // Check the full sampled trajectory, not just its two endpoints.
      const firstLinePositions = samples.map(sample => sample.positions[0]);
      assert.ok(Math.max(...firstLinePositions) - Math.min(...firstLinePositions) > 1, 'Déplacement du titre observé pendant la séquence');
      assert.equal(await page.locator('h1').getAttribute('aria-label'), null);

      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.querySelector('.hero-line'));
      await page.setViewportSize({ width: width === 390 ? 768 : 1024, height: 1000 });
      await page.waitForFunction(() => !document.querySelector('.hero-line'));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.querySelector('.hero-line'));
      await page.locator('.hero-intro .button-wrapper a').first().focus();
      assert.equal(await page.locator('.hero-line').count(), 0, 'Focus immédiatement stable');
      assert.equal(await page.locator('.hero-intro .button-wrapper a').first().evaluate(el => getComputedStyle(el).opacity), '1');

      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.querySelector('.hero-line'));
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => !document.querySelector('.hero-line'));
      assert.equal(await page.locator('.hero-intro .button-wrapper a').first().evaluate(el => getComputedStyle(el).opacity), '1');
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(await page.locator('.hero-line').count(), 0);
      assert.equal(await page.locator('h1').evaluate(el => getComputedStyle(el).opacity), '1');
      assert.deepEqual(errors, []);
    } finally { await context.close(); }
  }
}
