import { GoogleGenAI, Modality } from "@google/genai";
import { MODELS } from "../constants";

// Removed conflicting global declaration of Window interface.
// We assume 'aistudio' is available on the global Window object as per the environment.

/**
 * Ensures a valid API key is selected via the AI Studio overlay for Veo/Paid models.
 */
async function ensureApiKey(): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (apiKey) return apiKey;

  const win = window as any;
  if (win.aistudio) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await win.aistudio.openSelectKey();
    }
    // We assume the environment variable or internal state is updated after selection
    // In a real env, we might need to reload or re-fetch, but for this demo logic:
    return process.env.API_KEY || ''; 
  }
  return '';
}

/**
 * Creates a new client instance. 
 * Essential to call this immediately before requests to capture any newly selected keys.
 */
const getClient = async () => {
  await ensureApiKey(); 
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateImage = async (prompt: string, aspectRatio: string, style: string) => {
  const ai = await getClient();
  const fullPrompt = style ? `${prompt}, style: ${style}` : prompt;

  const response = await ai.models.generateContent({
    model: MODELS.IMAGE,
    contents: {
      parts: [{ text: fullPrompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any, // 16:9, etc.
        imageSize: "1K", // Defaulting to 1K for speed/stability in demo
      },
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

export const generateVideo = async (
  prompt: string, 
  aspectRatio: string, 
  resolution: string = '720p',
  onProgress: (msg: string) => void
) => {
  // Ensure Key Selection for Veo
  const win = window as any;
  if (win.aistudio) {
    const hasKey = await win.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      onProgress("Waiting for API Key selection...");
      await win.aistudio.openSelectKey();
    }
  }

  const ai = await getClient(); // Re-init with key
  
  onProgress("Initializing video generation...");
  
  // Use fast preview for demo purposes, unless user specifically asks for high quality (mapped in UI)
  const model = MODELS.VIDEO_FAST;

  let operation = await ai.models.generateVideos({
    model: model,
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: resolution as any,
      aspectRatio: aspectRatio as any,
    }
  });

  onProgress("Rendering video... this may take a moment.");

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
    onProgress("Still rendering...");
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed or returned no URI");

  // Fetch the actual bytes to create a local blob URL or return the authenticated URI
  // The documentation says we must append the key.
  const authenticatedUrl = `${videoUri}&key=${process.env.API_KEY}`;
  
  return authenticatedUrl;
};

// Helper to convert base64 PCM to WAV Blob URL
const pcmBase64ToWavUrl = (base64: string, sampleRate: number): string => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // PCM data (16-bit, mono)
  // WAV Header construction
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = bytes.length;
  const chunkSize = 36 + dataSize;
  
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  
  // RIFF
  view.setUint8(0, 'R'.charCodeAt(0));
  view.setUint8(1, 'I'.charCodeAt(0));
  view.setUint8(2, 'F'.charCodeAt(0));
  view.setUint8(3, 'F'.charCodeAt(0));
  view.setUint32(4, chunkSize, true);
  view.setUint8(8, 'W'.charCodeAt(0));
  view.setUint8(9, 'A'.charCodeAt(0));
  view.setUint8(10, 'V'.charCodeAt(0));
  view.setUint8(11, 'E'.charCodeAt(0));
  
  // fmt
  view.setUint8(12, 'f'.charCodeAt(0));
  view.setUint8(13, 'm'.charCodeAt(0));
  view.setUint8(14, 't'.charCodeAt(0));
  view.setUint8(15, ' '.charCodeAt(0));
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  
  // data
  view.setUint8(36, 'd'.charCodeAt(0));
  view.setUint8(37, 'a'.charCodeAt(0));
  view.setUint8(38, 't'.charCodeAt(0));
  view.setUint8(39, 'a'.charCodeAt(0));
  view.setUint32(40, dataSize, true);
  
  // payload
  const payload = new Uint8Array(buffer, 44);
  payload.set(bytes);
  
  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

export const generateSpeech = async (text: string, voiceName: string) => {
  const ai = await getClient();

  const response = await ai.models.generateContent({
    model: MODELS.TTS,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioData) throw new Error("No audio data generated");

  // Convert raw PCM (24kHz default for Gemini TTS) to WAV Blob URL
  return pcmBase64ToWavUrl(audioData, 24000);
};

// Helper to decode base64 audio string to AudioBuffer (to be used in frontend)
export const decodeAudio = async (base64Data: string, audioContext: AudioContext): Promise<AudioBuffer> => {
  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // The API returns raw PCM (no header). 
  // We need to decode strictly as PCM if using raw data, but the `decodeAudioData` usually expects headers.
  // The Gemini TTS documentation implies we receive PCM.
  // We need to construct a float32 buffer manually.
  
  const dataInt16 = new Int16Array(bytes.buffer);
  const sampleRate = 24000; 
  const numChannels = 1;
  const frameCount = dataInt16.length / numChannels;
  
  const buffer = audioContext.createBuffer(numChannels, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);
  
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  
  return buffer;
}