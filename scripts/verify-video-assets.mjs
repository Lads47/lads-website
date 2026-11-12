import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const videos = JSON.parse(await readFile('src/data/local-videos.json', 'utf8'));
assert.equal(Object.keys(videos).length, 6);
let desktop = 0, mobile = 0;
for (const [slug, entry] of Object.entries(videos)) {
  for (const variant of ['desktop', 'mobile']) {
    const asset = entry[variant];
    assert.match(asset.src, /^\/videos\/[a-z0-9-]+\.mp4$/);
    const buffer = await readFile(`public${asset.src}`);
    assert.equal(buffer.length, asset.bytes);
    assert.equal(createHash('sha256').update(buffer).digest('hex'), asset.sha256);
    assert.ok(asset.bytes < 90 * 1024 ** 2);
    assert.equal(asset.videoCodec, 'h264');
    assert.equal(asset.pixelFormat, 'yuv420p');
    assert.equal(asset.audioCodec, 'aac');
    assert.ok(asset.audioBitrate > 0 && asset.audioBitrate <= 140_000);
    assert.equal(asset.fps, entry.source.fps);
    assert.ok(Math.abs(asset.duration - entry.source.duration) < .2);
    assert.ok(asset.width <= (variant === 'mobile' ? 1280 : 1920) && asset.height <= (variant === 'mobile' ? 720 : 1080));
    assert.ok(Math.abs(asset.width / asset.height - entry.source.width / entry.source.height) < .01);
    // ISO BMFF top-level boxes: faststart requires the complete index before media data.
    const boxes = [];
    for (let offset = 0; offset < buffer.length;) {
      let size = buffer.readUInt32BE(offset);
      boxes.push(buffer.toString('ascii', offset + 4, offset + 8));
      if (size === 1) size = Number(buffer.readBigUInt64BE(offset + 8));
      if (size === 0) break;
      assert.ok(size >= 8 && offset + size <= buffer.length);
      offset += size;
    }
    assert.ok(boxes.indexOf('moov') >= 0 && boxes.indexOf('moov') < boxes.indexOf('mdat'), `${slug}: faststart`);
    if (variant === 'desktop') desktop += buffer.length; else mobile += buffer.length;
  }
  const poster = await readFile(`public${entry.poster.src}`);
  assert.equal(poster.length, entry.poster.bytes);
  assert.equal(createHash('sha256').update(poster).digest('hex'), entry.poster.sha256);
  for (const track of entry.tracks) {
    const text = await readFile(`public${track.src}`, 'utf8');
    assert.ok(text.startsWith('WEBVTT'));
    assert.match(text, /\d{2}:\d{2}\.\d{3}\s+-->/);
    assert.equal(createHash('sha256').update(text).digest('hex'), track.sha256);
  }
}
console.log(`6 vidéos, 12 MP4 : empreintes, index faststart, profils, cadence, durée et 6 pistes WebVTT OK ; ${(desktop / 1024 ** 2).toFixed(1)} Mio bureau, ${(mobile / 1024 ** 2).toFixed(1)} Mio mobile`);
