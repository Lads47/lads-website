import assert from 'node:assert/strict';

export async function verifyHistoryTimeline(contextFor, base) {
  const report = [];
  const years = ['1998', '2008', '2014', '2016', '2018', '2022', '2024', '2025'];
  const geometry = () => {
    const rect = element => {
      const { x, y, width, height, right, bottom } = element.getBoundingClientRect();
      return { x, y, width, height, right, bottom };
    };
    return [...document.querySelectorAll('.timeline-item')].map(item => {
      const year = item.querySelector('.timeline-year');
      const content = item.querySelector('.timeline-content');
      const media = item.querySelector('.timeline-media');
      const image = media.querySelector('img');
      const frame = media.querySelector('iframe');
      const textStyle = getComputedStyle(content.querySelector('p'));
      return {
        year: year.textContent.trim(), date: rect(year), content: rect(content), media: rect(media),
        font: parseFloat(textStyle.fontSize), lineHeight: parseFloat(textStyle.lineHeight),
        color: textStyle.color, background: getComputedStyle(item.closest('section')).backgroundColor,
        // Responsive candidates can round their height by a pixel; layout follows the original dimensions.
        imageRatio: image ? Number(image.getAttribute('width')) / Number(image.getAttribute('height')) : null,
        mediaRatio: media.getBoundingClientRect().width / media.getBoundingClientRect().height,
        frame: frame ? rect(frame) : null,
      };
    });
  };
  const statesMatch = () => {
    const header = document.querySelector('#header').getBoundingClientRect().height;
    const threshold = header + (innerHeight - header) / 2;
    return [...document.querySelectorAll('.timeline-item')].every(item =>
      item.hasAttribute('data-reached') === (item.querySelector('.timeline-year').getBoundingClientRect().top <= threshold));
  };
  const luminance = color => {
    const channels = color.match(/[\d.]+/g).slice(0, 3).map(value => {
      const channel = Number(value) / 255;
      return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
    });
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  };

  for (const width of [320, 390, 768, 1023, 1024, 1440, 1600]) {
    const context = await contextFor({ width, height: 1000 });
    const page = await context.newPage();
    try {
      await page.goto(base + '/histoire', { waitUntil: 'networkidle' });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.querySelectorAll('.timeline img')].map(image => {
          image.loading = 'eager';
          return image.decode();
        }));
      });
      assert.deepEqual(await page.locator('ol.timeline > li .timeline-year').allTextContents().then(values => values.map(v => v.trim())), years);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('.timeline h3').count(), 8);
      assert.equal(await page.locator('.timeline img').count(), 6);
      assert.equal(await page.locator('.timeline iframe').count(), 2);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      for (const textScale of [1, 2]) {
        if (textScale === 2) await page.addStyleTag({ content: 'html{font-size:200%}' });
        const rows = await page.evaluate(geometry);
        const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        if (textScale === 1) assert.ok(pageOverflow <= 1, `${width}px : débordement`);
        assert.ok(await page.locator('.timeline').evaluate(list => list.scrollWidth <= list.clientWidth + 1), `${width}px, texte ${textScale * 100}% : débordement de la frise`);
        for (const row of rows) {
          assert.ok(Math.abs(row.lineHeight / row.font - 1.5) < .01);
          const contrast = (luminance(row.background) + .05) / (luminance(row.color) + .05);
          assert.ok(contrast >= 4.5, `Contraste ${contrast}`);
          assert.ok(row.media.right <= width + 1 && row.content.right <= width + 1);
          assert.ok(Math.abs(row.mediaRatio - (row.imageRatio ?? 16 / 9)) < .01, `Proportions ${width}px / ${textScale} / ${row.year} : ${row.mediaRatio} vs ${row.imageRatio ?? 16 / 9}`);
          if (width >= 1024) {
            assert.ok(row.content.x >= row.date.right && row.media.x > row.content.right);
            assert.ok(Math.abs(row.media.width / row.content.width - 1.25) < .01);
            const center = rect => rect.y + rect.height / 2;
            assert.ok(Math.abs(center(row.date) - center(row.content)) < 1 && Math.abs(center(row.date) - center(row.media)) < 1, 'Année, texte et média centrés verticalement');
          } else if (width >= 768) {
            assert.ok(row.content.y >= row.date.bottom && row.media.x > row.content.right);
          } else {
            assert.ok(row.content.y >= row.date.bottom && row.media.y >= row.content.bottom);
          }
        }
        report.push({ width, textScale, pageOverflow, rows });
        await page.screenshot({ path: `test-results/history-${width}-${textScale * 100}.png`, fullPage: true, mask: [page.locator('iframe')] });
      }
    } finally { await context.close(); }
  }

  for (const reducedMotion of ['no-preference', 'reduce']) {
    const context = await contextFor({ width: 1440, height: 1000 });
    const page = await context.newPage();
    try {
      await page.emulateMedia({ reducedMotion });
      await page.goto(base + '/histoire', { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      // Cross every year just before/after the threshold, then reverse the entire journey.
      for (const direction of [1, -1]) {
        for (const index of direction === 1 ? years.keys() : [...years.keys()].reverse()) {
          for (const offset of direction === 1 ? [-12, 12] : [12, -12]) {
            await page.evaluate(({ index, offset }) => {
              const header = document.querySelector('#header').getBoundingClientRect().height;
              const year = document.querySelectorAll('.timeline-year')[index];
              scrollTo({ top: scrollY + year.getBoundingClientRect().top - (header + (innerHeight - header) / 2) + offset, behavior: 'instant' });
            }, { index, offset });
            await page.waitForFunction(statesMatch);
            assert.equal(await page.locator('.timeline-item').nth(index).evaluate(item => item.hasAttribute('data-reached')), offset > 0);
          }
        }
      }
      await page.evaluate(() => scrollTo({ top: document.querySelectorAll('.timeline-year')[5].getBoundingClientRect().top + scrollY, behavior: 'instant' }));
      await page.waitForFunction(statesMatch);
      // Let Chrome persist the scroll entry before navigating, as it does during normal reading.
      await page.waitForTimeout(300);
      await page.reload({ waitUntil: 'networkidle' });
      assert.ok(await page.evaluate(() => scrollY > 0), 'Défilement restauré au rechargement');
      await page.waitForFunction(statesMatch);
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForFunction(statesMatch);
      if (reducedMotion === 'reduce') {
        assert.equal(await page.locator('.timeline-year').first().evaluate(item => getComputedStyle(item, '::before').transitionProperty), 'none');
      }
      report.push({ reducedMotion, crossings: 32, restoredScroll: true, resize: true });
    } finally { await context.close(); }
  }

  const context = await contextFor({ width: 390, height: 844 }, 'empty', false);
  const page = await context.newPage();
  try {
    await page.goto(base + '/histoire', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.timeline-item[data-reached]').count(), 0);
    for (const item of await page.locator('.timeline-item').all()) assert.ok(await item.isVisible());
    assert.equal(await page.locator('.timeline h3').count(), 8);
    report.push({ javaScript: false, visibleEvents: 8 });
  } finally { await context.close(); }
  return report;
}
