import assert from 'node:assert/strict';

// Exercise the defects found by the visual audit, rather than CSS implementation details.
export async function verifyRefinements(contextFor, base) {
  const observations = [];
  for (const width of [320, 390, 768, 1200, 1440]) {
    const context = await contextFor({ width, height: width < 768 ? 844 : 1000 }, 'sessions');
    const page = await context.newPage();
    try {
      await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('.back-to-top_wrap').evaluate(el => el.inert), true);
      assert.equal(await page.locator('#backToTop').isVisible(), false);
      const home = await page.evaluate(() => ({
        header: document.querySelector('header').getBoundingClientRect().toJSON(),
        actions: [...document.querySelectorAll('[data-review-addition="home-actions"] a')].map(el => el.getBoundingClientRect().toJSON()),
        pause: document.querySelector('#heroPause').getBoundingClientRect().toJSON(),
        nav: [...document.querySelectorAll('.nav_link')].filter(el => getComputedStyle(el).visibility !== 'hidden').map(el => el.getBoundingClientRect().toJSON()),
        height: innerHeight,
      }));
      if (!home.nav.length) assert.ok(home.header.height <= 96, `Header compact à ${width}`);
      assert.ok(home.actions.every(rect => rect.top > home.header.bottom && rect.bottom <= home.height), `Actions dans le premier écran à ${width}`);
      assert.ok(home.pause.width >= 44 && home.pause.height >= 44, `Pause tactile à ${width}`);
      for (let index = 1; index < home.nav.length; index++) assert.ok(home.nav[index].left >= home.nav[index - 1].right, `Menu sans collision à ${width}`);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const mediaRequests = [];
      page.on('request', request => { if (request.url().endsWith('.mp4')) mediaRequests.push(request.url()); });
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert.equal(await page.locator('video').evaluate(el => el.paused), true);
      assert.equal(mediaRequests.length, 0, 'Pas de téléchargement vidéo imposé en mouvement réduit');
      await page.locator('#heroPause').click();
      await page.waitForFunction(() => !document.querySelector('video').paused);
      assert.match(await page.locator('video').evaluate(el => el.currentSrc), width <= 640 ? /-mobile\.mp4$/ : /demo-ateliers-du-stream\.mp4$/);
      await page.goto(base + '/formations', { waitUntil: 'networkidle' });
      await page.locator('.formation-card-logo-wrap').first().scrollIntoViewIfNeeded();
      const logos = await page.locator('.formation-card-logo-wrap img').evaluateAll(images => images.map(image => [image.clientWidth, image.clientHeight]));
      assert.ok(logos.every(([w, h]) => w > 0 && h > 0), `Deux logos visibles à ${width}`);
      const descriptions = await page.locator('.formation-card-logo-wrap + .heading + .text').evaluateAll(elements => elements.map(el => parseFloat(getComputedStyle(el).fontSize)));
      assert.equal(descriptions.length, 2);
      assert.ok(descriptions.every(size => size >= 16), `Même rôle de texte pour les deux formations à ${width}`);
      const catalogue = await page.locator('.formation-card-logo-wrap').first().evaluate(el => getComputedStyle(el.closest('.grid')).gridTemplateColumns.split(' ').length);
      assert.equal(catalogue, width >= 768 ? 2 : 1);
      await page.goto(base + '/realisations', { waitUntil: 'networkidle' });
      await page.locator('.card_visual img').first().scrollIntoViewIfNeeded();
      await page.locator('.card_visual img').first().evaluate(image => image.decode());
      assert.match(await page.locator('.card_visual img').first().evaluate(image => image.currentSrc), /\/media\/responsive\//);
      assert.ok(await page.locator('.card_content .text').first().evaluate(el => parseFloat(getComputedStyle(el).fontSize) >= 16));
      for (const path of ['/formations/ia', '/formations/vmix']) {
        await page.goto(base + path, { waitUntil: 'networkidle' });
        await page.getByRole('link', { name: 'Prochaines sessions', exact: true }).click();
        await page.waitForFunction(() => {
          const target = document.querySelector('#formation-sessions').getBoundingClientRect();
          const header = document.querySelector('header');
          return header.classList.contains('scrolled') && Math.abs(target.top - header.getBoundingClientRect().bottom) < 3;
        });
        await page.locator('#header').evaluate(async header => {
          await Promise.all(header.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {})));
        });
        const contrast = await page.evaluate(() => {
          const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          const rgb = color => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data]; };
          const luminance = values => values.slice(0, 3).map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, i) => sum + value * [.2126, .7152, .0722][i], 0);
          return [...document.querySelectorAll('.training-summary .button_wrap, .formation-tag-inline, .nav_link[data-active="true"]')].map(el => {
            const surfaces = [];
            for (let surface = el; surface; surface = surface.parentElement) surfaces.unshift(rgb(getComputedStyle(surface).backgroundColor));
            const background = surfaces.reduce((base, color) => color.slice(0, 3).map((channel, i) => channel * color[3] / 255 + base[i] * (1 - color[3] / 255)), [255, 255, 255]);
            const a = luminance(rgb(getComputedStyle(el).color)), b = luminance(background);
            return { text: el.textContent.trim(), ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) };
          });
        });
        assert.ok(contrast.every(sample => sample.ratio >= 4.5), `${path} contraste : ${JSON.stringify(contrast)}`);
        observations.push({ width, path, contrast });
      }
    } finally { await context.close(); }
  }
  return observations;
}
