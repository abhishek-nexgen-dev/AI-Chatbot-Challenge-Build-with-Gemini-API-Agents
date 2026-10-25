export type MessageRole = 'user' | 'model';

export type MessageStatus = 'sending' | 'streaming' | 'complete' | 'error';

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  base64?: string;
  content?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  status: MessageStatus;
  attachments?: FileAttachment[];
  error?: string;
  feedback?: 'like' | 'dislike' | null;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  model: string;
  systemInstruction?: string;
  temperature?: number;
  pinned?: boolean;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  badge: string;
}

export interface PersonaPreset {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  activeModel: string;
  systemInstruction: string;
  temperature: number;
  activePersonaId: string;
  streamResponses: boolean;
}
