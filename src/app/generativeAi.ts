import { GoogleGenerativeAI } from '@google/generative-ai';
import { getApiKeyGeminiConfiguration, getSelectedModelConfiguration } from './configurations';

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const callGeminiApi = async (
  instruction: string,
  context: string[],
  onData: (data: string) => void,
  onCompleted: (data: string) => void
) => {
  const apiKeyGemini = await getApiKeyGeminiConfiguration();
  const selectedModel = await getSelectedModelConfiguration();

  if (!apiKeyGemini) {
    chrome.runtime.openOptionsPage();
    await sleep(1000); // Wait for the options page to open
    onData(
      'GeminiのAPI KEYがセットされていません。オプションのページから設定してください。\n GeminiのAPI Keyは以下から払い出すことができます。\n https://aistudio.google.com/apikey'
    );
    onCompleted(
      'GeminiのAPI KEYがセットされていません。オプションのページから設定してください。\n GeminiのAPI KEYは以下のページから生成できます。\n https://aistudio.google.com/apikey'
    );
    return;
  }
  const genai = new GoogleGenerativeAI(apiKeyGemini);
  const model = genai.getGenerativeModel({
    model: selectedModel,
    systemInstruction:
      instruction +
      '回答は日本語で、Markdown形式で出力してください。「はい、わかりました」などの相槌は回答に含めないでください。',
  });
  const result = await model.generateContentStream(context);

  let response = '';
  for await (const chunk of result.stream) {
    response += chunk.text();
    onData(response);
  }
  onCompleted(response);
};
