import { getBucket } from '@extend-chrome/storage';

type ConfigurationBucket = {
  apiKeyGemini: string | null;
  selectedModel: string | null;
  customInstruction: string | null;
};

const bucket = getBucket<ConfigurationBucket>('configuration', 'sync');

export const getSelectedModelConfiguration = async (): Promise<string> => {
  const value = await bucket.get();
  return value.selectedModel ?? 'gemini-2.5-flash';
};

export const getApiKeyGeminiConfiguration = async (): Promise<string | null> => {
  const value = await bucket.get();
  return value.apiKeyGemini;
};

export const setSelectedModelConfiguration = async (selectedModel: string) => {
  bucket.set({ selectedModel: selectedModel });
};

export const setApiKeyGeminiConfiguration = async (apiKeyGemini: string) => {
  bucket.set({ apiKeyGemini: apiKeyGemini });
};

export const getCustomInstructionConfiguration = async (): Promise<string | null> => {
  const value = await bucket.get();
  return value.customInstruction;
};

export const setCustomInstructionConfiguration = async (customInstruction: string) => {
  bucket.set({ customInstruction: customInstruction });
};
