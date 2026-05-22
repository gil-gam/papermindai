export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

