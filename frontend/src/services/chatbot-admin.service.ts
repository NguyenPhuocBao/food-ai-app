import api from './api';

export interface ChatbotProviderHealth {
  providerMode: string;
  providerChain: string[];
  providerChainDisplay?: string[];
  providers: {
    retrieval: { enabled: boolean; active: boolean };
    grok: {
      configured: boolean;
      model: string;
      baseUrl: string;
      label?: string;
      vendor?: 'groq' | 'xai';
      isGroqCompatible?: boolean;
    };
    gemini: { configured: boolean; model: string; candidates: string[]; apiVersions: string[] };
    openai: { configured: boolean; model: string };
  };
  training: {
    key: string;
    totalExamples: number;
    source: 'custom' | 'default';
    defaultExamples: number;
    maxExamples: number;
    maxExamplesInPrompt: number;
  };
  timestamp: string;
}

export interface ChatbotTrainingExample {
  id: string;
  question: string;
  answer: string;
  tags: string[];
}

export interface ChatbotTrainingData {
  key: string;
  source: 'custom' | 'default';
  examples: ChatbotTrainingExample[];
  total: number;
  defaultExamples: number;
}

export interface ChatbotTrainingBenchmark {
  source: 'custom' | 'default';
  totalTrainingExamples: number;
  sampleSize: number;
  metrics: {
    top1Rate: number;
    top3Rate: number;
    avgAnswerSimilarity: number;
  };
  failedCases: Array<{
    id: string;
    question: string;
    variantQuestion: string;
    topQuestion: string;
    topAnswerPreview: string;
  }>;
  timestamp: string;
}

export interface ChatbotQuickTestResult {
  answer: string;
  degraded: boolean;
  degradedReason?: string;
  aiProvider: string;
}

export const getChatbotHealth = async (): Promise<ChatbotProviderHealth> => {
  const response = await api.get('/chat/health');
  return response.data.data;
};

export const getChatbotTraining = async (): Promise<ChatbotTrainingData> => {
  const response = await api.get('/chat/training');
  return response.data.data;
};

export const updateChatbotTraining = async (examples: ChatbotTrainingExample[]) => {
  const response = await api.put('/chat/training', { examples });
  return response.data;
};

export const bootstrapChatbotTrainingDefaults = async () => {
  const response = await api.post('/chat/training/bootstrap-defaults');
  return response.data;
};

export const benchmarkChatbotTraining = async (sampleSize?: number): Promise<ChatbotTrainingBenchmark> => {
  const response = await api.post('/chat/training/benchmark', sampleSize ? { sampleSize } : {});
  return response.data.data;
};

export const runQuickChatAdmin = async (question: string): Promise<ChatbotQuickTestResult> => {
  const response = await api.post('/chat/quick', { question });
  return response.data.data;
};
