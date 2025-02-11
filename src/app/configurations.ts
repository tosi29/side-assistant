import { getBucket } from '@extend-chrome/storage';

type ConfigurationBucket = {
  apiKeyGemini: string | null;
  selectedModel: string | null;
};

const bucket = getBucket<ConfigurationBucket>('configuration', 'sync');

export const getSelectedModel = async (): Promise<string> => {
  const value = await bucket.get();
  return value.selectedModel ?? 'gemini-2.0-flash-thinking-exp-01-21';
};

export const getApiKeyGemini = async (): Promise<string | null> => {
  const value = await bucket.get();
  return value.apiKeyGemini;
};

export const setSelectedModel = async (selectedModel: string) => {
  bucket.set({ apiKeyGemini: selectedModel });
};

export const setApiKeyGemini = async (apiKeyGemini: string) => {
  bucket.set({ selectedModel: apiKeyGemini });
};
