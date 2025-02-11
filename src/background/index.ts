import store, { initializeWrappedStore } from '../app/store';
import { getBucket } from '@extend-chrome/storage';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ConfigurationBucket {
  apiKeyGemini: string | null;
  selectedModel: string | null;
}

initializeWrappedStore();

store.subscribe(() => {
  // access store state
  // const state = store.getState();
  // console.log('state', state);
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'summarize',
    title: 'Summarize',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: 'polish',
    title: 'Polish',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: 'rephrase',
    title: 'Rephrase',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: 'explain',
    title: 'Explain',
    contexts: ['selection'],
  });
});

const callGeminiApi = async (
  instruction: string,
  prompt: string,
  onData: (data: string) => void
) => {
  const bucket = getBucket<ConfigurationBucket>('configuration', 'sync');
  const configuration = await bucket.get();
  const apiKeyGemini = configuration.apiKeyGemini;
  const selectedModel = configuration.selectedModel ?? 'gemini-2.0-flash-thinking-exp-01-21';

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

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (tab !== undefined && info.selectionText !== undefined) {
    const handleData = (data: string) => {
      chrome.runtime.sendMessage({ type: 'response', text: data });
    };

    switch (info.menuItemId) {
      case 'summarize': {
        chrome.sidePanel.open({ windowId: tab.windowId });
        await callGeminiApi(
          '与えられたテキストを要約してください。',
          info.selectionText,
          handleData
        );
        break;
      }
      case 'polish': {
        chrome.sidePanel.open({ windowId: tab.windowId });
        await callGeminiApi(
          '与えられたテキストを推敲してください。',
          info.selectionText,
          handleData
        );
        break;
      }
      case 'rephrase': {
        chrome.sidePanel.open({ windowId: tab.windowId });
        await callGeminiApi(
          '与えられたテキストを言い換える表現を、5つ挙げてください。',
          info.selectionText,
          handleData
        );
        break;
      }
      case 'explain': {
        chrome.sidePanel.open({ windowId: tab.windowId });
        await callGeminiApi(
          '与えられたテキストを、分かりやすく解説してください。',
          info.selectionText,
          handleData
        );
        break;
      }
    }
  }
});

export {};
