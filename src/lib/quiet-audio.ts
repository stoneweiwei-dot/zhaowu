/** Quiet gain also works on iOS, where media.volume alone is not reliable. */
export const QUIET_AUDIO_VOLUME = 0.24;
type AudioGraph = { source: MediaElementAudioSourceNode; gain: GainNode; connected: boolean };
let context: AudioContext | null = null;
const graphs = new WeakMap<HTMLMediaElement, AudioGraph>();

export function prepareQuietAudio(media: HTMLMediaElement, volume = QUIET_AUDIO_VOLUME): boolean {
  const level = Math.max(0, Math.min(1, volume));
  media.volume = level;
  if (typeof window === "undefined") return false;
  try {
    const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return false;
    context ??= new AudioContextClass();
    let graph = graphs.get(media);
    if (!graph) {
      const gain = context.createGain();
      // Set attenuation before connecting the media to the output.
      gain.gain.value = level;
      graph = { source: context.createMediaElementSource(media), gain, connected: false };
      graphs.set(media, graph);
    }
    graph.gain.gain.value = level;
    if (!graph.connected) {
      graph.source.connect(graph.gain);
      graph.gain.connect(context.destination);
      graph.connected = true;
    }
    media.volume = 1; // Apply attenuation exactly once through the gain node.
    if (context.state === "suspended") void context.resume().catch(() => {});
    return true;
  } catch {
    media.volume = level;
    return false;
  }
}

export function releaseQuietAudio(media: HTMLMediaElement) {
  const graph = graphs.get(media);
  if (!graph?.connected) return;
  graph.source.disconnect();
  graph.gain.disconnect();
  graph.connected = false;
}
