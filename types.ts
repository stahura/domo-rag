// Domo Global Interface
export interface Domo {
  post: (url: string, body: any) => Promise<any>;
}

declare global {
  interface Window {
    domo: Domo;
  }
  const domo: Domo;
}

// RAG API Types
export interface RagMatch {
  content: {
    text: string;
    type: string;
  };
  metadata: {
    fileId: string;
    path: string;
  };
  score: number;
}

export interface RagResponse {
  matches: RagMatch[];
}

// AI API Types
export interface AiChoice {
  output: string;
}

export interface AiResponse {
  prompt: string;
  choices: AiChoice[];
  modelId: string;
  isCustomerModel: boolean;
}

// App State Types
export enum Sender {
  User = 'user',
  Bot = 'bot',
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  sources?: string[]; // List of filenames used for RAG
}

export interface Fileset {
  id: string;
  name: string;
}