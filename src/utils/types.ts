export interface Config {
  apiKey?: string;
  baseUrl: string;
  model: string;
  systemPrompt?: string;
  filters: string[];
  maxTokens?: number;
  temperature?: number;
  verbose?: boolean;
  systemPromptSource?: 'project' | 'global' | 'default';
}

export interface PromptResult {
  contextMessage: string;
  instructions: string;
}

export interface ProjectConfig {
  prompt?: string;
  filters?: string[];
  model?: string;
  maxTokens?: number;
}

export interface MergeConfig {
  apiKey?: string;
  baseUrl: string;
  model: string;
  systemPrompt: string;
  filters: string[];
}

export interface DiffFile {
  filename: string;
  status: 'added' | 'modified' | 'deleted';
  content: string[];
}

export interface AIResponse {
  message: string;
  success: boolean;
  error?: string;
}

export type CommitAction = 'accept' | 'edit' | 'regenerate' | 'cancel';

export interface CommitOptions {
  action: CommitAction;
  message?: string;
  amend?: boolean;
}