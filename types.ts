export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  AVATAR = 'AVATAR',
  CHAT = 'CHAT'
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
}

export interface Asset {
  id: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  name: string;
  createdAt: number;
  folderId?: string;
  tags?: string[];
  metadata?: {
    prompt?: string;
    width?: number;
    height?: number;
    duration?: number;
    analysis?: string;
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
  resolution: '720p' | '1080p';
  imageSize?: '1K' | '2K' | '4K';
  durationSeconds?: number;
  model: string;
  stylePreset?: string;
  seed?: number;
  useThinking?: boolean;
  useSearch?: boolean;
  useMaps?: boolean;
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
  activeTool: 'generate' | 'edit' | 'avatar' | 'team' | 'chat';
  selectedMediaType: MediaType;
  generatedAssets: Asset[];
  timeline: TimelineItem[];
  isGenerating: boolean;
  generationProgress: string;
}