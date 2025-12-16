export const MODELS = {
  IMAGE: 'gemini-3-pro-image-preview',
  VIDEO_FAST: 'veo-3.1-fast-generate-preview',
  VIDEO_HIGH: 'veo-3.1-generate-preview',
  TTS: 'gemini-2.5-flash-preview-tts',
  TEXT: 'gemini-2.5-flash', // For prompt refinement
};

export const ASPECT_RATIOS = [
  { label: '16:9 (Landscape)', value: '16:9' },
  { label: '9:16 (Portrait)', value: '9:16' },
  { label: '1:1 (Square)', value: '1:1' },
  { label: '4:3 (Classic)', value: '4:3' },
  { label: '3:4 (Vertical)', value: '3:4' },
];

export const STYLE_PRESETS = [
  { label: 'Cinematic', value: 'cinematic, photorealistic, 8k, dramatic lighting' },
  { label: '3D Render', value: '3D render, octane render, unreal engine 5, clay material' },
  { label: 'Anime', value: 'anime style, studio ghibli, vibrant colors' },
  { label: 'Cyberpunk', value: 'cyberpunk, neon lights, futuristic, high tech' },
  { label: 'Oil Painting', value: 'oil painting, textured, brush strokes, classic art' },
];

export const VOICE_PRESETS = [
  { label: 'Kore (Female)', value: 'Kore' },
  { label: 'Puck (Male)', value: 'Puck' },
  { label: 'Fenrir (Male)', value: 'Fenrir' },
  { label: 'Zephyr (Female)', value: 'Zephyr' },
];
