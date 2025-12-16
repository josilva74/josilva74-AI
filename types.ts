export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  AVATAR = 'AVATAR'
}

export interface Asset {
  id: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  name: string;
  createdAt: number;
  metadata?: {
    prompt?: string;
    width?: number;
    height?: number;
    duration?: number;
  };
}

export interface TimelineItem {
  id: string;
  assetId: string;
  trackId: number;
  startTime: number;
  duration: number;
  name: string;
  type: MediaType;
}

export interface GenerationConfig {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: string;
  resolution: '720p' | '1080p' | '1K' | '2K' | '4K'; // Combined for Image/Video logic
  durationSeconds?: number; // For video
  model: string;
  stylePreset?: string;
  seed?: number;
}

export interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface Collaborator extends User {
  role: 'viewer' | 'editor';
  status: 'active' | 'pending';
  email?: string;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
}

export interface AppState {
  activeTool: 'generate' | 'edit' | 'avatar' | 'team';
  selectedMediaType: MediaType;
  generatedAssets: Asset[];
  timeline: TimelineItem[];
  isGenerating: boolean;
  generationProgress: string; // Message to show
}
