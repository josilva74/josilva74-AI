import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { MODELS } from "../constants";

async function ensureApiKey(): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (apiKey) return apiKey;

  const win = window as any;
  if (win.aistudio) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await win.aistudio.openSelectKey();
    }
    return process.env.API_KEY || ''; 
  }
  return '';
}

const getClient = async () => {
  await ensureApiKey(); 
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateImage = async (
  prompt: string, 
  aspectRatio: string, 
  style: string, 
  size: string = '1K',
  cfgScale?: number,
  steps?: number,
  sampler?: string
) => {
  const ai = await getClient();
  const fullPrompt = style ? `${prompt}, style: ${style}` : prompt;

  const response = await ai.models.generateContent({
    model: MODELS.IMAGE_PRO,
    contents: { parts: [{ text: fullPrompt }] },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: size as any,
      },
      // Passing advanced parameters as part of standard generation config where applicable
      // Note: Gemini models typically handle these internally, but we pass them for potential model support
      topP: cfgScale ? Math.min(cfgScale / 30, 1) : undefined, // Mapping CFG roughly to TopP for creativity control
      seed: Math.floor(Math.random() * 1000000),
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("No content generated");

  for (const part of parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data found in response");
};

export const editImage = async (base64Image: string, prompt: string) => {
  const ai = await getClient();
  const [mimeType, data] = base64Image.split(',');
  const actualMimeType = mimeType.match(/:(.*?);/)?.[1] || 'image/png';

  const response = await ai.models.generateContent({
    model: MODELS.IMAGE_EDIT,
    contents: {
      parts: [
        { inlineData: { data: data || base64Image, mimeType: actualMimeType } },
        { text: prompt }
      ]
    }
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("No edit result");

  for (const part of parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateVideo = async (
  prompt: string, 
  aspectRatio: string, 
  resolution: '720p' | '1080p' = '720p',
  durationSeconds?: number,
  negativePrompt?: string,
  sourceImage?: string,
  onProgress?: (msg: string) => void
) => {
  const ai = await getClient();
  onProgress?.("Initializing Veo Engine...");
  
  // Create a configuration object specifically for the Veo model.
  // Resolution, aspectRatio, and numberOfVideos are core requirements.
  const videoConfig: any = {
    numberOfVideos: 1,
    resolution: resolution,
    aspectRatio: aspectRatio as any,
  };

  // Attach optional parameters if they were provided and supported by the API.
  if (durationSeconds) videoConfig.durationSeconds = durationSeconds;
  if (negativePrompt) videoConfig.negativePrompt = negativePrompt;

  const request: any = {
    model: MODELS.VIDEO_FAST,
    prompt: prompt,
    config: videoConfig
  };

  // If a starting image is provided, include it in the request.
  if (sourceImage) {
    const [mimeType, data] = sourceImage.split(',');
    request.image = {
      imageBytes: data || sourceImage,
      mimeType: mimeType.match(/:(.*?);/)?.[1] || 'image/png'
    };
  }

  // Generate the video operation.
  let operation = await ai.models.generateVideos(request);
  onProgress?.("Generation task queued...");

  // Poll the operation until completion.
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    onProgress?.("The AI is imagining your video... This may take a minute.");
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  // Extract the download link for the generated MP4.
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("Video generation failed: No video URI was returned by the engine.");
  }

  // We append the API key to the URI to allow direct playback or download via fetch/video tag.
  return `${downloadLink}&key=${process.env.API_KEY}`;
};

export const chatWithThinking = async (prompt: string) => {
  const ai = await getClient();
  const response = await ai.models.generateContent({
    model: MODELS.PRO,
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
  return response.text || '';
};

export const chatWithGrounding = async (message: string, type: 'search' | 'maps' = 'search') => {
  const ai = await getClient();
  const model = type === 'search' ? MODELS.FLASH : 'gemini-2.5-flash';
  const tools = type === 'search' ? [{ googleSearch: {} }] : [{ googleMaps: {} }];
  
  const response = await ai.models.generateContent({
    model: model,
    contents: message,
    config: { tools: tools as any }
  });
  
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const urls = chunks.map((chunk: any) => {
    if (chunk.web) return { url: chunk.web.uri, title: chunk.web.title };
    if (chunk.maps) return { url: chunk.maps.uri, title: chunk.maps.title };
    return null;
  }).filter(Boolean);

  return { text: response.text || '', urls };
};

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: any,
  sampleRate: number,
  numChannels: number,
): Promise<any> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const connectLiveSession = async (callbacks: any) => {
  const ai = await getClient();
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      systemInstruction: 'You are an advanced creative assistant for Aether Studio. Help users with image, video, and design ideas via real-time conversation.',
    },
  });
};

export const generateSpeech = async (text: string, voiceName: string) => {
  const ai = await getClient();
  const response = await ai.models.generateContent({
    model: MODELS.TTS,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
    },
  });
  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioData) throw new Error("No audio data generated");

  const binary = decode(audioData);
  const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioContextClass({ sampleRate: 24000 });
  const audioBuffer = await decodeAudioData(binary, ctx, 24000, 1);
  
  const OfflineContextClass = (window as any).OfflineAudioContext || (window as any).webkitOfflineAudioContext;
  const offlineCtx = new OfflineContextClass(1, audioBuffer.length, audioBuffer.sampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start();
  const renderedBuffer = await offlineCtx.startRendering();
  
  return URL.createObjectURL(bufferToWav(renderedBuffer));
};

function bufferToWav(abuffer: any) {
  let numOfChan = abuffer.numberOfChannels,
    btwLength = abuffer.length * numOfChan * 2 + 44,
    btwBuffer = new ArrayBuffer(btwLength),
    btwView = new DataView(btwBuffer),
    btwChannels = [],
    btwI, btwSample,
    btwOffset = 0,
    btwPos = 0;

  function setUint16(data: any) {
    btwView.setUint16(btwPos, data, true);
    btwPos += 2;
  }
  function setUint32(data: any) {
    btwView.setUint32(btwPos, data, true);
    btwPos += 4;
  }

  setUint32(0x46464952); setUint32(btwLength - 8); setUint32(0x45564157); setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan); setUint32(abuffer.sampleRate); setUint32(abuffer.sampleRate * 2 * numOfChan); setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164); setUint32(btwLength - btwPos - 4);

  for (btwI = 0; btwI < abuffer.numberOfChannels; btwI++) btwChannels.push(abuffer.getChannelData(btwI));

  while (btwPos < btwLength) {
    for (btwI = 0; btwI < numOfChan; btwI++) {
      btwSample = Math.max(-1, Math.min(1, btwChannels[btwI][btwOffset]));
      btwSample = (btwSample < 0 ? btwSample * 0x8000 : btwSample * 0x7FFF);
      btwView.setInt16(btwPos, btwSample, true);
      btwPos += 2;
    }
    btwOffset++;
  }
  return new Blob([btwBuffer], { type: "audio/wav" });
}