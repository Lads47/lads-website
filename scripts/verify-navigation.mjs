import assert from 'node:assert/strict';

export async function verifyNavigation(contextFor, base, routes) {
  const observations = [];
  const style = () => {
    const header = document.querySelector('#header');
    const computed = getComputedStyle(header);
    return {
      background: computed.backgroundColor,
      color: computed.color,
      transition: computed.transitionDuration,
      light: header.querySelector('[data-mode="light"]') ? getComputedStyle(header.querySelector('[data-mode="light"]')).opacity : '0',
      dark: getComputedStyle(header.querySelector('[data-mode="dark"]')).opacity,
      top: header.getBoundingClientRect().top,
    };
  };
  const menuTemplates = new Set(['/', '/solutions', '/realisations/peer-gynt', '/formations/ia', '/mentions-legales']);
  for (const width of [390, 1440]) {
    const context = await contextFor({ width, height: 1000 });
    const page = await context.newPage();
    try {
      await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
      const initial = await page.evaluate(style);
      assert.equal(initial.background, 'rgba(0, 0, 0, 0)');
      assert.equal(initial.light, '1');
      await page.evaluate(() => scrollTo({ top: 160, behavior: 'instant' }));
      await page.waitForFunction(() => getComputedStyle(document.querySelector('#header [data-mode="dark"]')).opacity === '1');
      const solid = await page.evaluate(style);
      for (const route of routes.filter(route => route.shell)) {
        await page.goto(base + route.route, { waitUntil: 'domcontentloaded' });
        const expected = route.route === '/' ? initial : solid;
        assert.deepEqual(await page.evaluate(style), expected, `${route.route} : accueil transparent, pages internes blanches à ${width} px`);
        const homeLink = page.locator('#site-navigation a[href="/"]');
        assert.equal((await homeLink.textContent()).trim(), 'Accueil');
        assert.equal(await homeLink.getAttribute('aria-current'), route.route === '/' ? 'page' : null);
        assert.equal(await homeLink.getAttribute('data-active'), route.route === '/' ? 'true' : null);
        assert.ok(await page.locator('.nav_link').evaluateAll(links => links.every(link => getComputedStyle(link).textDecorationLine === 'none')), 'Aucun soulignement dans la navigation');
        assert.ok(await page.locator('.nav_link[data-active="true"]').evaluateAll(links => links.every(link => getComputedStyle(link).color === 'rgb(125, 206, 245)')), 'État actif avec le bleu clair de marque');
        await page.evaluate(() => scrollTo({ top: 160, behavior: 'instant' }));
        await page.waitForFunction(() => document.querySelector('#header').classList.contains('scrolled') && getComputedStyle(document.querySelector('#header [data-mode="dark"]')).opacity === '1');
        const scrolled = await page.evaluate(style);
        assert.equal(scrolled.background, 'rgb(255, 255, 255)');
        assert.equal(scrolled.light, '0');
        assert.equal(scrolled.top, 0, 'Header fixe sans déplacement');
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.waitForFunction(() => !document.querySelector('#header').classList.contains('scrolled') && getComputedStyle(document.querySelector('#header [data-mode="dark"]')).opacity === (document.querySelector('#header').classList.contains('home') ? '0' : '1'));
        assert.deepEqual(await page.evaluate(style), expected, 'Retour à l’état initial propre à chaque page');
        if (width === 390 && menuTemplates.has(route.route)) {
          const toggle = page.getByRole('button', { name: 'Menu', exact: true });
          await toggle.click();
          assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
          await page.keyboard.press('Tab');
          assert.equal(await page.evaluate(() => document.activeElement.closest('nav')?.id), 'site-navigation');
          await page.keyboard.press('Escape');
          assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
          assert.ok(await toggle.evaluate(el => el === document.activeElement));
        }
        observations.push({ route: route.route, width, initial: expected, scrolled });
      }
    } finally { await context.close(); }
  }
  const nojs = await contextFor({ width: 390, height: 844 }, 'empty', false);
  try {
    const page = await nojs.newPage();
    await page.goto(base + '/solutions', { waitUntil: 'networkidle' });
    await page.evaluate(() => scrollTo({ top: 600, behavior: 'instant' }));
    const fallback = await page.evaluate(style);
    assert.equal(fallback.background, 'rgb(255, 255, 255)', 'Sans JS, le header garde un fond opaque lisible');
    assert.equal(fallback.dark, '1');
    assert.equal(fallback.light, '0');
    assert.equal(await page.locator('.nav_link[data-active="true"]').evaluate(el => getComputedStyle(el).color), 'rgb(125, 206, 245)', 'Le choix du bleu clair de marque est conservé sans JS');
  } finally { await nojs.close(); }
  return observations;
}
