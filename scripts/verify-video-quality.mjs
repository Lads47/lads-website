// Optional local check against the private owner exports; not a build/CI dependency.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
const ffprobe = process.env.FFPROBE_PATH || 'ffprobe';
const sourceDir = process.env.VIDEO_SOURCE_DIR || '.scratch/video-sources';
const videos = JSON.parse(await readFile('src/data/local-videos.json', 'utf8'));
const probe = path => JSON.parse(execFileSync(ffprobe, ['-v', 'error', '-show_streams', '-of', 'json', path]));
function audio(path, time) {
  const buffer = execFileSync(ffmpeg, ['-v', 'error', '-ss', String(time), '-i', path, '-t', '2', '-vn', '-ac', '1', '-ar', '8000', '-f', 'f32le', '-'], { maxBuffer: 1024 ** 2 });
  return Array.from({ length: buffer.length / 4 }, (_, i) => buffer.readFloatLE(i * 4));
}
function correlation(a, b, lag = 0) {
  let ab = 0, aa = 0, bb = 0;
  for (let i = 800; i < Math.min(a.length, b.length) - 800; i += 4) {
    ab += a[i] * b[i + lag]; aa += a[i] ** 2; bb += b[i + lag] ** 2;
  }
  return ab / Math.sqrt(aa * bb || 1);
}
const report = [];
for (const [slug, entry] of Object.entries(videos)) {
  const sourcePath = `${sourceDir}/${slug}.mp4`;
  const original = probe(sourcePath);
  const sourceVideo = original.streams.find(s => s.codec_type === 'video');
  for (const variant of ['desktop', 'mobile']) {
    const asset = entry[variant], outputPath = `public${asset.src}`;
    const output = probe(outputPath);
    const video = output.streams.find(s => s.codec_type === 'video');
    const sound = output.streams.find(s => s.codec_type === 'audio');
    assert.equal(video.nb_frames, sourceVideo.nb_frames, `${slug}: frames`);
    assert.ok(Math.abs(Number(video.duration) - Number(sourceVideo.duration)) < .001);
    assert.ok(Math.abs(Number(video.start_time) - Number(sound.start_time)) < .05);
    assert.ok(Math.abs(Number(video.duration) - Number(sound.duration)) < .15);
    const samples = [];
    for (const fraction of [.1, .5, .9]) {
      const time = entry.source.duration * fraction;
      const a = audio(sourcePath, time), b = audio(outputPath, time);
      const match = correlation(a, b);
      // Verify timing as well as audio content; a shifted signal must not match better.
      const lags = [-160, -80, -40, 0, 40, 80, 160].map(lag => ({ lagMs: lag / 8, match: correlation(a, b, lag) }));
      assert.ok(match > .90, `${slug} ${variant} at ${time}: audio correlation ${match}`);
      assert.equal(lags.sort((x, y) => y.match - x.match)[0].lagMs, 0, `${slug}: audio shift`);
      samples.push({ time, correlation: Number(match.toFixed(5)), offsetMs: 0 });
    }
    report.push({ slug, variant, frames: Number(video.nb_frames), videoDuration: Number(video.duration), audioDuration: Number(sound.duration), samples });
    console.log(`${slug} ${variant}: frames/durée inchangés, synchronisation et 3 extraits audio OK`);
  }
}
await mkdir('test-results', { recursive: true });
await writeFile('test-results/video-quality-report.json', JSON.stringify(report, null, 2));
