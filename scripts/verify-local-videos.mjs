import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

export async function verifyLocalVideos(contextFor, base) {
  const videos = JSON.parse(await readFile('src/data/local-videos.json', 'utf8'));
  const report = [];
  for (const width of [390, 768, 1440]) {
    const context = await contextFor({ width, height: 1000 });
    context.setDefaultTimeout(15000);
    const page = await context.newPage();
    const forbidden = [];
    const mediaRequests = [];
    const viewportBeforeNavigation = await page.evaluate(() => ({ width: innerWidth, mobile: matchMedia('(max-width: 40rem)').matches }));
    await page.addInitScript(() => {
      window.videoSourceEvents = [];
      for (const type of ['error', 'loadstart', 'emptied', 'loadedmetadata']) document.addEventListener(type, event => {
        const target = event.target;
        if (!(target instanceof HTMLVideoElement || target instanceof HTMLSourceElement)) return;
        window.videoSourceEvents.push({ type, at: performance.now(), tag: target.tagName, src: target.currentSrc || target.src, code: target.error?.code, width: innerWidth, mobile: matchMedia('(max-width: 40rem)').matches });
      }, true);
    });
    page.on('request', request => {
      if (new URL(request.url()).pathname.endsWith('.mp4')) mediaRequests.push({ type: 'request', url: request.url(), range: request.headers().range });
    });
    page.on('response', response => {
      if (new URL(response.url()).pathname.endsWith('.mp4')) mediaRequests.push({ type: 'response', url: response.url(), status: response.status(), range: response.headers()['content-range'] });
    });
    page.on('requestfailed', request => {
      if (new URL(request.url()).pathname.endsWith('.mp4')) mediaRequests.push({ type: 'failure', url: request.url(), error: request.failure()?.errorText });
    });
    page.on('request', request => {
      if (/(?:vimeo\.com|vimeocdn\.com)/i.test(new URL(request.url()).hostname)) forbidden.push(request.url());
    });
    try {
      assert.equal(viewportBeforeNavigation.width, width, 'Viewport configuré avant navigation');
      assert.equal(viewportBeforeNavigation.mobile, width <= 640, 'Media query configurée avant navigation');
      for (const [slug, entry] of Object.entries(videos)) {
        console.log(`Lecteur ${width}px : ${slug}`);
        await page.goto(base + entry.route, { waitUntil: 'networkidle' });
        assert.equal(await page.locator('iframe[src*="vimeo.com"]').count(), 0);
        const player = page.locator(`video[data-local-video="${slug}"]`);
        mediaRequests.push({ type: 'before-play', slug, ...(await player.evaluate(video => ({ src: video.currentSrc, width: innerWidth, mobile: matchMedia('(max-width: 40rem)').matches }))) });
        await player.scrollIntoViewIfNeeded();
        const flags = await player.evaluate(v => ({ controls: v.controls, autoplay: v.autoplay, loop: v.loop, muted: v.muted, inline: v.playsInline, preload: v.preload, label: v.getAttribute('aria-label'), fit: getComputedStyle(v).objectFit }));
        assert.deepEqual(flags, { controls: true, autoplay: false, loop: false, muted: false, inline: true, preload: 'none', label: entry.title, fit: 'contain' });
        // Space uses the browser's own keyboard controls, including the initial click-to-load.
        await player.focus();
        await page.keyboard.press('Space');
        await page.waitForFunction(slug => {
          const v = document.querySelector(`video[data-local-video="${slug}"]`);
          return v && !v.paused && v.currentTime > .1;
        }, slug);
        const state = await player.evaluate(v => ({ src: v.currentSrc, duration: v.duration, w: v.videoWidth, h: v.videoHeight, audio: v.webkitAudioDecodedByteCount, time: v.currentTime }));
        const expected = width <= 640 ? entry.mobile : entry.desktop;
        assert.equal(state.src, base + expected.src);
        assert.equal(state.w, expected.width); assert.equal(state.h, expected.height);
        assert.ok(Math.abs(state.duration - entry.source.duration) < .2);
        assert.ok(state.audio > 0, 'Audio réellement décodé');
        await page.keyboard.press('Space');
        assert.ok(await player.evaluate(v => v.paused));
        await player.evaluate(v => { v.currentTime = v.duration / 2; });
        await page.waitForFunction(slug => !document.querySelector(`video[data-local-video="${slug}"]`).seeking, slug);
        assert.ok(await player.evaluate(v => Math.abs(v.currentTime - v.duration / 2) < .2));
        await player.evaluate(v => { v.volume = .5; v.muted = true; });
        assert.deepEqual(await player.evaluate(v => [v.volume, v.muted]), [.5, true]);
        await player.evaluate(v => { v.muted = false; v.textTracks[0].mode = 'showing'; });
        await page.waitForFunction(slug => document.querySelector(`video[data-local-video="${slug}"]`).textTracks[0].cues?.length > 0, slug);
        const track = await player.evaluate(v => ({ language: v.textTracks[0].language, label: v.textTracks[0].label, cues: v.textTracks[0].cues.length }));
        assert.equal(track.language, 'fr'); assert.equal(track.label, entry.tracks[0].label);
        await player.evaluate(v => v.requestFullscreen());
        assert.ok(await player.evaluate(v => document.fullscreenElement === v));
        await page.evaluate(() => document.exitFullscreen());
        await player.evaluate(v => { v.currentTime = v.duration - .5; });
        await player.evaluate(v => v.play());
        await page.waitForFunction(slug => document.querySelector(`video[data-local-video="${slug}"]`).ended, slug);
        const response = await context.request.get(base + expected.src, { headers: { Range: 'bytes=0-1023' } });
        assert.equal(response.status(), 206);
        assert.match(response.headers()['content-type'], /video\/mp4/);
        assert.equal(response.headers()['content-range'], `bytes 0-1023/${expected.bytes}`);
        assert.equal((await response.body()).length, 1024);
        const captionsResponse = await context.request.get(base + entry.tracks[0].src);
        assert.equal(captionsResponse.status(), 200);
        assert.match(captionsResponse.headers()['content-type'], /text\/vtt/);
        if (width === 390 || width === 1440) {
          await player.evaluate(v => { v.currentTime = 2; return v.play(); });
          await page.setViewportSize({ width: width === 390 ? 1440 : 390, height: 1000 });
          assert.equal(await player.evaluate(v => v.currentSrc), base + expected.src);
          assert.ok(await player.evaluate(v => !v.paused && v.currentTime >= 2));
          await page.setViewportSize({ width, height: 1000 });
        }
        report.push({ slug, width, selected: expected.src, audioDecoded: true, keyboard: true, seek: true, ended: true, fullscreen: true, track, range206: true });
      }
      assert.deepEqual(forbidden, []);
      await page.goto(base + '/histoire', { waitUntil: 'networkidle' });
      const players = page.locator('.timeline video');
      await players.nth(0).scrollIntoViewIfNeeded();
      await players.nth(0).evaluate(v => v.play());
      await players.nth(1).scrollIntoViewIfNeeded();
      await players.nth(1).evaluate(v => v.play());
      await page.waitForFunction(() => document.querySelectorAll('.timeline video')[0].paused);
      await players.nth(0).scrollIntoViewIfNeeded();
      await players.nth(0).evaluate(v => v.play());
      await page.waitForFunction(() => document.querySelectorAll('.timeline video')[1].paused);
    } catch (error) {
      const state = await page.evaluate(() => ({
        width: innerWidth, screen: screen.width, mobile: matchMedia('(max-width: 40rem)').matches,
        events: window.videoSourceEvents,
        players: [...document.querySelectorAll('video[data-local-video]')].map(video => ({
          name: video.dataset.localVideo, src: video.currentSrc, code: video.error?.code, readyState: video.readyState,
          sources: [...video.querySelectorAll('source')].map(source => ({ src: source.src, media: source.media, matches: !source.media || matchMedia(source.media).matches })),
        })),
      })).catch(() => null);
      const diagnostic = { width, viewportBeforeNavigation, chrome: context.browser()?.version(), error: String(error), state, mediaRequests };
      await mkdir('test-results', { recursive: true });
      await writeFile(`test-results/video-failure-${width}.json`, JSON.stringify(diagnostic, null, 2));
      await page.screenshot({ path: `test-results/video-failure-${width}.png` }).catch(() => {});
      console.error(JSON.stringify(diagnostic));
      throw error;
    } finally { await context.close(); }
  }
  // No site JavaScript: click the native play control, not a scripted play() call.
  const context = await contextFor({ width: 390, height: 844 }, 'empty', false);
  context.setDefaultTimeout(15000);
  const page = await context.newPage();
  try {
    for (const [slug, entry] of Object.entries(videos)) {
      console.log(`Lecteur sans scripts : ${slug}`);
      await page.goto(base + entry.route, { waitUntil: 'networkidle' });
      const player = page.locator(`video[data-local-video="${slug}"]`);
      await player.scrollIntoViewIfNeeded();
      const box = await player.boundingBox();
      await player.click({ position: { x: 24, y: box.height - 48 } });
      // With JavaScript disabled, page-side requestAnimationFrame polling stops.
      // Poll read-only media state from Node; playback itself uses the native UI.
      const deadline = Date.now() + 15000;
      while (!(await player.evaluate(v => !v.paused && v.currentTime > .1)) && Date.now() < deadline) await delay(100);
      assert.ok(await player.evaluate(v => !v.paused && v.currentTime > .1), `${slug}: lecture native sans scripts`);
      await page.keyboard.press('Space');
      assert.ok(await player.evaluate(v => v.paused), `${slug}: pause clavier sans scripts`);
      report.push({ slug, javaScript: false, nativePlayback: true });
    }
  } finally { await context.close(); }
  return report;
}
