
export const MODELS = {
  IMAGE_PRO: 'gemini-3-pro-image-preview',
  IMAGE_EDIT: 'gemini-2.5-flash-image',
  VIDEO_FAST: 'veo-3.1-fast-generate-preview',
  VIDEO_HIGH: 'veo-3.1-generate-preview',
  PRO: 'gemini-3-pro-preview',
  FLASH: 'gemini-3-flash-preview',
  FLASH_LITE: 'gemini-2.5-flash-lite-latest',
  TTS: 'gemini-2.5-flash-preview-tts',
};

export const ASPECT_RATIOS = [
  { label: '1:1 (Square)', value: '1:1' },
  { label: '2:3', value: '2:3' },
  { label: '3:2', value: '3:2' },
  { label: '3:4', value: '3:4' },
  { label: '4:3', value: '4:3' },
  { label: '9:16 (Portrait)', value: '9:16' },
  { label: '16:9 (Landscape)', value: '16:9' },
  { label: '21:9 (Ultrawide)', value: '21:9' },
];

export const IMAGE_SIZES = [
  { label: '1K', value: '1K' },
  { label: '2K', value: '2K' },
  { label: '4K', value: '4K' },
];

export const STYLE_PRESETS = [
  { label: 'None', value: '' },
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
