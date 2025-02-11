import { GoogleGenerativeAI } from '@google/generative-ai';
import { getApiKeyGemini, getSelectedModel } from './configurations';

export const callGeminiApi = async (
  instruction: string,
  prompt: string,
  onData: (data: string) => void
) => {
  const apiKeyGemini = await getApiKeyGemini();
  const selectedModel = await getSelectedModel();

  if (!apiKeyGemini) {
    return 'API KEYがセットされていません。';
  }
  const genai = new GoogleGenerativeAI(apiKeyGemini);
  const model = genai.getGenerativeModel({
    model: selectedModel,
    systemInstruction:
      instruction +
      '回答は日本語で、Markdown形式で出力してください。「はい、わかりました」などの相槌は回答に含めないでください。',
  });
  const result = await model.generateContentStream([prompt]);

  let response = '';
  for await (const chunk of result.stream) {
    response += chunk.text();
    onData(response);
  }
};
