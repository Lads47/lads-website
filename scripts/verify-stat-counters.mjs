import assert from 'node:assert/strict';

export async function verifyStatCounters(contextFor, base) {
  const expected = ['27', '+1000', '8', '100 %'];
  for (const width of [390, 768, 1440, 2240]) {
    const context = await contextFor({ width, height: 900 });
    const page = await context.newPage();
    try {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.addInitScript(() => {
        window.counterStarts = [];
        setInterval(() => document.querySelectorAll('.stat-nombre').forEach((number, index) => {
          const overlay = number.querySelector('.stat-counter-overlay');
          if (overlay && Number(overlay.textContent.replace(/\D/g, '')) > 0 && window.counterStarts[index] === undefined) {
            window.counterStarts[index] = performance.now();
          }
        }), 16);
      });
      await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.fonts.ready);
      const numbers = page.locator('.stat-nombre');
      for (let i = 0; i < 4; i++) {
        const number = numbers.nth(i);
        const alreadyPlayed = await number.getAttribute('data-test-played');
        if (alreadyPlayed) continue;
        await number.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await page.waitForFunction(() => document.querySelector('.stat-counter-overlay'));
        const started = Date.now();
        const before = await number.boundingBox();
        await page.waitForTimeout(160);
        if (width === 390 && i === 0) assert.equal(await numbers.last().locator('.stat-counter-overlay').count(), 0, 'Last mobile number has not entered');
        const overlay = number.locator('.stat-counter-overlay');
        if (await overlay.count()) {
          const text = await overlay.textContent();
          assert.match(text, /^\+?\d+( %)?$/);
          const current = Number(text.replace(/\D/g, ''));
          assert.ok(current > 0 && current < Number(expected[i].replace(/\D/g, '')), 'Intermediate integer before final value');
          assert.equal(await overlay.getAttribute('aria-hidden'), 'true');
          assert.equal(await number.locator('span').first().textContent(), expected[i]);
        }
        // Several desktop/tablet counters can enter together.
        await page.evaluate(() => document.querySelectorAll('.stat-counter-overlay').forEach(el => el.parentElement.dataset.testPlayed = 'true'));
        await page.waitForFunction(() => !document.querySelector('.stat-counter-overlay'));
        assert.ok(Date.now() - started >= 1100 && Date.now() - started < 2300, 'Count completes in approximately 1.4 seconds');
        assert.equal(await number.textContent(), expected[i]);
        const after = await number.boundingBox();
        assert.ok(Math.abs(after.width - before.width) < 1 && Math.abs(after.height - before.height) < 1);
      }
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await numbers.first().evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.waitForTimeout(100);
      assert.equal(await page.locator('.stat-counter-overlay').count(), 0);
      assert.deepEqual(await numbers.allTextContents(), expected);
      if (width >= 1024) {
        const starts = await page.evaluate(() => window.counterStarts);
        assert.equal(starts.length, 4);
        for (let i = 1; i < starts.length; i++) {
          assert.ok(starts[i] - starts[i - 1] > 100 && starts[i] - starts[i - 1] < 300, 'Desktop counters start successively, about 180 ms apart');
        }
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: `test-results/stat-counters-${width}.png` });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2100);
      await page.waitForFunction(() => !document.querySelector('.stat-counter-overlay'));
      assert.deepEqual(await numbers.allTextContents(), expected, 'Restored scroll settles to final values');
    } finally { await context.close(); }
  }
  for (const mode of ['no-js', 'reduced', 'change']) {
    const context = await contextFor({ width: 390, height: 900 }, 'empty', mode !== 'no-js');
    const page = await context.newPage();
    try {
      await page.emulateMedia({ reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference' });
      await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
      const numbers = page.locator('.stat-nombre');
      await numbers.first().evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
      if (mode === 'change') {
        await page.waitForSelector('.stat-counter-overlay');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.waitForFunction(() => !document.querySelector('.stat-counter-overlay'));
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await numbers.last().evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
      }
      assert.equal(await page.locator('.stat-counter-overlay').count(), 0);
      assert.deepEqual(await numbers.allTextContents(), expected);
    } finally { await context.close(); }
  }
}
