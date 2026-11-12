// Native controls and source selection work without this enhancement.
// A resize never reloads a source or interrupts the current playback.
document.addEventListener('play', event => {
  const video = event.target;
  if (!(video instanceof HTMLVideoElement) || !video.matches('[data-local-video]')) return;
  const timeline = video.closest('.timeline');
  if (!timeline) return;
  timeline.querySelectorAll<HTMLVideoElement>('video[data-local-video]').forEach(other => {
    if (other !== video) other.pause();
  });
}, true);
