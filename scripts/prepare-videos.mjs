// Manual preparation only. The build consumes committed files and never downloads media.
import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, copyFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
const ffprobe = process.env.FFPROBE_PATH || 'ffprobe';
const sourceDir = process.env.VIDEO_SOURCE_DIR || '.scratch/video-sources';
const workDir = '.scratch/video-encodes';
const output = 'public/videos';
const definitions = [
  ['peer-gynt', '1006258583', '/realisations/peer-gynt', 'Peer Gynt - Opéra de Limoges 2024'],
  ['runik-tcg', '1189015174', '/realisations/tcg', 'Runik TCG Serie démo TCG'],
  ['multiplex-inovae', '1006640017', '/solutions/multiplex', 'inovae_1'],
  ['ceremonie-docteurs-bordeaux', '1006235909', '/realisations/ceremonie-docteurs-bordeaux', 'Cérémonie des docteurs - Université de Bordeaux 2024'],
  ['histoire-facebook-2016', '1006969061', '/histoire', '2016 - Diffusion Facebook'],
  ['histoire-multiplex-2018', '1013489106', '/histoire', '2018 - Premier multiplex'],
];
const probe = path => JSON.parse(execFileSync(ffprobe, ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', path], { encoding: 'utf8' }));
const run = args => new Promise((resolve, reject) => {
  const child = spawn(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { windowsHide: true });
  let error = '';
  child.stderr.on('data', data => { error += data; });
  child.on('error', reject);
  child.on('close', code => code === 0 ? resolve() : reject(new Error(error || `FFmpeg exited ${code}`)));
});
const describe = async path => {
  const data = probe(path), video = data.streams.find(s => s.codec_type === 'video');
  const audio = data.streams.find(s => s.codec_type === 'audio');
  return { bytes: (await stat(path)).size, sha256: createHash('sha256').update(await readFile(path)).digest('hex'),
    width: video.width, height: video.height, duration: Number(data.format.duration), fps: video.r_frame_rate,
    videoCodec: video.codec_name, pixelFormat: video.pix_fmt, audioCodec: audio?.codec_name,
    audioChannels: audio?.channels, audioBitrate: Number(audio?.bit_rate || 0) };
};
await Promise.all([mkdir(output, { recursive: true }), mkdir(workDir, { recursive: true })]);
const registry = {};
// Two jobs keep CPU/memory bounded; each encoder uses four threads.
let next = 0;
async function worker() {
  while (next < definitions.length) {
    const [slug, vimeoId, route, title] = definitions[next++];
    const sourcePath = join(sourceDir, `${slug}.mp4`);
    const source = await describe(sourcePath);
    const entry = { title, route, source: { provider: 'Vimeo', id: vimeoId, copy: 'owner-download-export', ...source } };
    for (const [variant, width, height, crf, rate] of [['desktop', 1920, 1080, 23, '4M'], ['mobile', 1280, 720, 25, '2M']]) {
      if (variant === 'mobile' && source.width <= 1280 && source.height <= 720) { entry.mobile = entry.desktop; continue; }
      const candidate = join(workDir, `${slug}-${variant}.mp4`);
      await run(['-i', sourcePath, '-map', '0:v:0', '-map', '0:a:0?', '-map_metadata', '-1',
        '-vf', `scale=w=min(${width}\\,iw):h=min(${height}\\,ih):force_original_aspect_ratio=decrease:force_divisible_by=2`,
        '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-maxrate', rate, '-bufsize', variant === 'desktop' ? '8M' : '4M',
        '-threads', '4', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', candidate]);
      let chosen = candidate, method = `x264-slow-crf${crf}-max${rate}`;
      if ((await stat(candidate)).size > source.bytes && source.width <= width && source.height <= height && source.videoCodec === 'h264' && source.pixelFormat === 'yuv420p' && source.audioCodec === 'aac') {
        const remux = join(workDir, `${slug}-${variant}-remux.mp4`);
        await run(['-i', sourcePath, '-map', '0:v:0', '-map', '0:a:0?', '-map_metadata', '-1', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', remux]);
        if ((await stat(remux)).size < (await stat(candidate)).size) { chosen = remux; method = 'source-h264-aac128-faststart'; }
      }
      const filename = `${slug}${variant === 'mobile' ? '-mobile' : ''}.mp4`;
      const destination = join(output, filename);
      await copyFile(chosen, destination);
      const metadata = await describe(destination);
      if (metadata.bytes >= 90 * 1024 ** 2 || Math.abs(metadata.duration - source.duration) > .2 || metadata.fps !== source.fps) throw new Error(`${slug}: invalid size, duration or cadence`);
      await run(['-xerror', '-err_detect', 'explode', '-i', destination, '-map', '0:v', '-map', '0:a?', '-f', 'null', '-']);
      entry[variant] = { src: `/videos/${filename}`, method, ...metadata };
      console.log(`${slug} ${variant}: ${(metadata.bytes / 1024 ** 2).toFixed(2)} MiB, ${metadata.width}×${metadata.height}, decode OK`);
    }
    const posterName = `${slug}.webp`, posterTime = source.duration * .2;
    await run(['-ss', String(posterTime), '-i', sourcePath, '-frames:v', '1', '-vf', 'scale=1280:-2', '-c:v', 'libwebp', '-quality', '82', join(output, posterName)]);
    const poster = await readFile(join(output, posterName));
    const posterInfo = probe(join(output, posterName)).streams[0];
    entry.poster = { src: `/videos/${posterName}`, at: posterTime, bytes: poster.length, width: posterInfo.width, height: posterInfo.height, sha256: createHash('sha256').update(poster).digest('hex') };
    const captions = await readFile(join(sourceDir, `${slug}.0.vtt`), 'utf8');
    if (!captions.trimStart().startsWith('WEBVTT')) throw new Error(`${slug}: invalid captions`);
    const trackName = `${slug}.fr.vtt`;
    await writeFile(join(output, trackName), captions);
    entry.tracks = [{ src: `/videos/${trackName}`, language: 'fr', sourceLanguage: 'fr-x-autogen', label: 'Français (générés automatiquement)', kind: slug === 'runik-tcg' ? 'subtitles' : 'captions', sha256: createHash('sha256').update(captions).digest('hex') }];
    registry[slug] = entry;
  }
}
await Promise.all([worker(), worker()]);
await writeFile('src/data/local-videos.json', JSON.stringify(Object.fromEntries(definitions.map(([slug]) => [slug, registry[slug]])), null, 2) + '\n');
console.log('Six videos prepared; public registry contains no credentials or signed links.');
