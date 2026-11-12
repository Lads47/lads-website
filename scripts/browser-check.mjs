import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { chromium } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { verifyRefinements } from './verify-refinements.mjs';
import { verifyHeroMotion } from './verify-hero-motion.mjs';
import { verifyNavigation } from './verify-navigation.mjs';
import { verifyHistoryTimeline } from './verify-history-timeline.mjs';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4321';
const sourceBase = process.env.COMPARE_SOURCE_URL;
let executablePath = process.env.BROWSER_PATH;
if (!executablePath && process.platform === 'win32') {
  for (const path of ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']) {
    if (await access(path).then(() => true, () => false)) { executablePath = path; break; }
  }
}
const browser = await chromium.launch({ executablePath, headless: true });
const routes = JSON.parse(await readFile('tests/fixtures/routes.json', 'utf8'));
const results = [], errors = [], screenshots = [];
const visualReportName = process.env.ROUTE_FILTER ? 'filtered-visual-report' : 'visual-report';
await mkdir('test-results', { recursive: true });

async function contextFor(viewport, scenario = 'empty', javascript = true) {
  const context = await browser.newContext({ viewport, javaScriptEnabled: javascript, locale: 'fr-FR', timezoneId: 'Europe/Paris' });
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (['127.0.0.1', 'localhost'].includes(url.hostname)) return route.continue();
    if (url.pathname.startsWith('/api/public/formations/')) {
      if (scenario === 'error') return route.fulfill({ status: 503, body: '{}', contentType: 'application/json' });
      const body = url.pathname.endsWith('/upcoming-sessions')
        ? { sessions: scenario === 'sessions' ? [{ dateDebut: '2027-02-01T09:00:00', dateFin: '2027-02-05T17:00:00', inscriptionUrl: 'https://evaremote.com/inscription-test', placesRestantes: 2 }] : [] }
        : { hasEnoughData: scenario === 'results', traineesAccueillisTotal: 12, satisfactionAverage: 4.8, npsScore: 80, sessionsCount: 3, objectifsAtteintsRate: 90, responseRate: 85, lastUpdated: '2026-11-01' };
      return route.fulfill({ json: body });
    }
    const type = route.request().resourceType();
    return route.fulfill({ body: '', contentType: type === 'script' ? 'application/javascript' : type === 'stylesheet' ? 'text/css' : type === 'document' ? 'text/html' : 'text/plain' });
  });
  return context;
}

async function settle(page) {
  await page.evaluate(async () => {
    for (const image of document.images) image.loading = 'eager';
    await document.fonts.ready;
    await Promise.all([...document.images].filter((image) => image.getAttribute('src')).map((image) => image.decode().catch(() => {})));
  });
  await page.addStyleTag({ content: '*{animation:none!important;transition:none!important;scroll-behavior:auto!important}.reveal,.hero-content{opacity:1!important;transform:none!important}' });
  await page.waitForFunction(() => !document.querySelector('.hero-line'));
}

try {
  const viewports = process.env.INTERACTIONS_ONLY ? [] : [{ width: 1440, height: 1000 }, { width: 390, height: 844 }];
  for (const viewport of viewports) {
    const context = await contextFor(viewport);
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(`${page.url()}: ${error.message}`));
    const original = sourceBase ? await context.newPage() : null;
    for (const route of routes.filter((r) => r.kind !== 'redirect' && (!process.env.ROUTE_FILTER || new RegExp(process.env.ROUTE_FILTER).test(r.route)))) {
      const response = await page.goto(base + route.route, { waitUntil: route.route === '/' ? 'domcontentloaded' : 'networkidle' });
      assert.equal(response.status(), 200, route.route);
      await settle(page);
      const dimensions = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth, height: document.documentElement.scrollHeight, broken: [...document.images].filter((i) => i.getAttribute('src') && (i.naturalWidth === 0 || i.getBoundingClientRect().width < 1 || i.getBoundingClientRect().height < 1)).map((i) => i.getAttribute('src')) }));
      assert.ok(dimensions.width <= dimensions.viewport + 1, `Débordement horizontal ${route.route} à ${viewport.width}: ${dimensions.width}`);
      assert.deepEqual(dimensions.broken, [], `Images cassées ${route.route}`);
      const label = (route.route === '/' ? 'accueil' : route.route.slice(1).replaceAll('/', '-')) + '-' + viewport.width;
      const targetPng = await page.screenshot({ path: `test-results/${label}.png`, fullPage: true, animations: 'disabled', mask: [page.locator('video, iframe')] });
      let difference = null;
      if (original) {
        await original.goto(sourceBase + route.route, { waitUntil: 'networkidle' });
        await settle(original);
        const before = PNG.sync.read(await original.screenshot({ path: `test-results/${label}-source.png`, fullPage: true, animations: 'disabled', mask: [original.locator('video, iframe')] }));
        const after = PNG.sync.read(targetPng);
        if (before.width === after.width && before.height === after.height) {
          const diff = new PNG({ width: before.width, height: before.height });
          difference = pixelmatch(before.data, after.data, diff.data, before.width, before.height, { threshold: .15 }) / (before.width * before.height);
          if (difference > .005) await writeFile(`test-results/${label}-diff.png`, PNG.sync.write(diff));
        } else difference = { source: [before.width, before.height], target: [after.width, after.height] };
      }
      screenshots.push({ route: route.route, viewport: viewport.width, height: dimensions.height, difference });
      await writeFile(`test-results/${visualReportName}.json`, JSON.stringify(screenshots, null, 2));
      console.log(`Page ${viewport.width} ${route.route} ${typeof difference === 'number' ? (100*difference).toFixed(3)+' % écart' : difference ? JSON.stringify(difference) : 'OK'}`);
    }
    await context.close();
  }
  if (screenshots.length) results.push(`${screenshots.length} rendus : ${new Set(screenshots.map((s) => s.route)).size} pages sur mobile et bureau, aucun débordement horizontal ni image cassée`);

  const tablet = await contextFor({ width: 768, height: 1024 });
  const page = await tablet.newPage();
  for (const path of ['/', '/solutions', '/realisations/peer-gynt', '/formations/ia', '/mentions-legales']) {
    await page.goto(base+path, { waitUntil: path === '/' ? 'domcontentloaded' : 'networkidle' });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1), path);
  }
  results.push('5 gabarits tablette sans débordement');
  await page.goto(base+'/', { waitUntil: 'domcontentloaded' });
  const toggle = page.getByRole('button', { name: 'Menu', exact: true });
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  await toggle.click(); assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Accueil');
  await page.keyboard.press('Escape'); assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(await toggle.evaluate((el) => document.activeElement === el), true);
  await toggle.click();
  await page.locator('#site-navigation a[href="/solutions"]').click();
  await page.waitForURL(base+'/solutions');
  assert.equal(await page.locator('#site-navigation a[href="/solutions"]').getAttribute('aria-current'), 'page');
  await toggle.click();
  await page.getByRole('link', { name: 'Accueil', exact: true }).click();
  await page.waitForURL(base+'/');
  assert.equal(await page.locator('#site-navigation a[href="/"]').getAttribute('aria-current'), 'page');
  results.push('Menu : ouverture, clavier, Échap, retour du focus et navigation');

  for (const path of ['/', '/realisations/peer-gynt', '/solutions/multiplex']) {
    await page.goto(base+path, { waitUntil: path === '/' ? 'domcontentloaded' : 'networkidle' });
    const trigger = page.locator('.photo-trigger').first();
    await trigger.click();
    assert.equal(await page.locator('#photo-lightbox').evaluate((el) => el.open), true);
    assert.equal(new URL(await page.locator('#photo-lightbox img').getAttribute('src'), base).href, new URL(await trigger.locator('img').getAttribute('src'), base).href);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#photo-lightbox').evaluate((el) => el.open), false);
    assert.equal(await trigger.evaluate((el) => document.activeElement === el), true);
    await trigger.press('Enter'); await page.getByRole('button', { name: 'Fermer la photographie' }).click();
    assert.equal(await page.locator('#photo-lightbox').evaluate((el) => el.open), false);
    await trigger.click(); await page.mouse.click(2, 2);
    assert.equal(await page.locator('#photo-lightbox').evaluate((el) => el.open), false);
  }
  results.push('Lightboxes accueil, réalisation et solution : souris, clavier, fermeture et retour du focus');
  await page.goto(base+'/politique-confidentialite', { waitUntil: 'networkidle' });
  await page.locator('#eva-stat-choix').click();
  assert.equal(await page.evaluate(() => localStorage.getItem('evaStat_off')), '1');
  await page.reload({ waitUntil: 'networkidle' });
  assert.match(await page.locator('#eva-stat-etat').innerText(), /désactivée/);
  await page.locator('#eva-stat-choix').click();
  assert.equal(await page.evaluate(() => localStorage.getItem('evaStat_off')), null);
  results.push('Opposition EVA : état persistant et réactivation');

  await page.goto(base+'/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('video').readyState >= 2);
  assert.equal(await page.locator('video').evaluate((el) => el.currentSrc), base+'/videos/demo-ateliers-du-stream.mp4');
  await page.waitForFunction(() => !document.querySelector('video').paused);
  await page.locator('#heroPause').click();
  assert.equal(await page.locator('video').evaluate((el) => el.paused), true);
  await page.locator('#heroPause').click();
  await page.waitForFunction(() => !document.querySelector('video').paused);
  results.push('Vidéo locale : chargement MP4, lecture, pause et reprise sans S3');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base+'/', { waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('video').evaluate((el) => el.paused), true);
  assert.equal(await page.locator('h1').evaluate((el) => getComputedStyle(el).opacity), '1');
  results.push('Réduction des animations : vidéo en pause et titre visible');
  assert.equal(await page.locator('#contact svg.icon-brand').count(), 3);
  const tokensBefore = await page.evaluate(() => {
    const root = document.documentElement;
    const eyebrow = document.querySelector('#possibilites .eyebrow_wrap');
    const card = document.querySelector('#possibilites .card_content');
    const before = { color: getComputedStyle(eyebrow).color, padding: getComputedStyle(card).paddingTop };
    root.style.setProperty('--brand-500', 'rgb(1 2 3)');
    root.style.setProperty('--space-5', '48px');
    return before;
  });
  await page.waitForFunction(() =>
    getComputedStyle(document.querySelector('#possibilites .eyebrow_wrap')).color !== 'rgb(125, 206, 245)' &&
    getComputedStyle(document.querySelector('#possibilites .card_content')).paddingTop === '48px' &&
    [...document.querySelectorAll('#contact svg.icon-brand path')].every((path) => getComputedStyle(path).fill === 'rgb(1, 2, 3)'));
  const tokensAfter = await page.evaluate(() => {
    const root = document.documentElement;
    const after = { color: getComputedStyle(document.querySelector('#possibilites .eyebrow_wrap')).color, padding: getComputedStyle(document.querySelector('#possibilites .card_content')).paddingTop };
    root.style.removeProperty('--brand-500'); root.style.removeProperty('--space-5');
    return after;
  });
  assert.notEqual(tokensBefore.color, tokensAfter.color);
  assert.notEqual(tokensBefore.padding, tokensAfter.padding);
  assert.equal(tokensAfter.padding, '48px');
  results.push('Lumos actif : les tokens de couleur et d’espacement modifient réellement les composants natifs');
  await tablet.close();

  for (const scenario of ['sessions','empty','error','results']) {
    const context = await contextFor({ width: 1440, height: 1000 }, scenario);
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(`${scenario}: ${error.message}`));
    for (const path of ['/formations/vmix','/formations/ia']) {
      await page.goto(base+path, { waitUntil: path === '/' ? 'domcontentloaded' : 'networkidle' });
      if (scenario === 'sessions') {
        const chip = page.locator('[data-formation-code] a');
        assert.equal(await chip.count(), 1);
        assert.equal(new URL(await chip.getAttribute('href')).searchParams.get('retour'), base+path);
        assert.equal(await chip.getAttribute('data-eva-event'), 'inscription_formation');
        assert.equal(await page.locator('.meta-dates-hint').isVisible(), true);
      } else if (scenario === 'empty') {
        assert.match(await page.locator('[data-formation-code]').innerText(), /Prochaines dates à venir/);
        assert.equal(await page.locator('.meta-dates-hint').isVisible(), false);
      } else if (scenario === 'error') {
        assert.equal(await page.locator('[data-formation-code] a').count(), 0);
        assert.equal(await page.locator('.meta-dates-hint').isVisible(), false);
        assert.match(await page.locator('[data-formation-code]').innerText(), /2026/);
      }
      assert.equal(await page.locator('[data-formation-results-code]').isVisible(), scenario === 'results');
      if (scenario === 'results') {
        assert.match(await page.locator('[data-formation-results-code]').innerText(), /4.8/);
        assert.doesNotMatch(await page.locator('[data-formation-results-code]').innerText(), /undefined|NaN/);
      }
    }
    await context.close();
  }
  results.push('8 scénarios EVA : deux formations × sessions, aucune session, panne et résultats publics');

  await verifyHeroMotion(contextFor, base);
  results.push('Animation hero GSAP : lignes et boutons, titre stable, redimensionnement, focus clavier et mouvement réduit à 390 et 1440 px');

  await writeFile('test-results/history-timeline-report.json', JSON.stringify(await verifyHistoryTimeline(contextFor, base), null, 2));
  results.push('Frise histoire : 8 étapes à 7 largeurs, texte 200 %, médias, contrastes, 64 passages aller/retour, restauration, redimensionnement et repli sans JavaScript');

  const navigation = await verifyNavigation(contextFor, base, routes);
  await writeFile('test-results/navigation-report.json', JSON.stringify(navigation, null, 2));
  results.push(`Header : ${navigation.length} parcours haut/défilement/retour ; pages internes blanches, accueil transparent, menu mobile et repli sans JavaScript`);

  await writeFile('test-results/refinements-report.json', JSON.stringify(await verifyRefinements(contextFor, base), null, 2));
  results.push('Audit Impeccable : 320, 390, 768, 1200 et 1440 px ; contraste, logos, CTA, focus masqué, ancres, images responsive et vidéo adaptée');

  const nojs = await contextFor({ width: 390, height: 844 }, 'empty', false);
  const nojsPage = await nojs.newPage();
  await nojsPage.goto(base+'/solutions', { waitUntil: 'networkidle' });
  assert.equal(await nojsPage.locator('#site-navigation').isVisible(), true);
  assert.equal(await nojsPage.locator('h1').isVisible(), true);
  await nojsPage.goto(base+'/', { waitUntil: 'domcontentloaded' });
  await nojsPage.waitForLoadState('load');
  assert.equal(await nojsPage.locator('#heroPause').isVisible(), false);
  assert.match(await nojsPage.locator('video').getAttribute('poster'), /demo-ateliers-du-stream\.webp$/);
  await nojs.close();
  results.push('Navigation et contenu mobile accessibles sans JavaScript');

  const redirectContext = await contextFor({ width: 1440, height: 1000 });
  const redirectPage = await redirectContext.newPage();
  for (const route of routes.filter((r) => r.kind === 'redirect')) {
    await redirectPage.goto(base+route.route);
    await redirectPage.waitForURL(base+route.destination, { timeout: 10000 });
  }
  assert.equal((await redirectPage.goto(base+'/page-inexistante-test')).status(),404);
  await redirectContext.close();
  results.push('5 anciennes routes redirigées et vraie réponse 404');
  assert.deepEqual(errors, [], 'Erreurs JavaScript');
  const reportName = process.env.INTERACTIONS_ONLY ? 'interactions-report' : process.env.ROUTE_FILTER ? 'filtered-browser-report' : 'browser-report';
  await writeFile(`test-results/${reportName}.json`, JSON.stringify({ results, errors, screenshots }, null, 2));
  console.log(results.join('\n'));
} finally { await browser.close(); }
