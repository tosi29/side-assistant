import store, { initializeWrappedStore } from '../app/store';
import { getBucket } from '@extend-chrome/storage';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ConfigurationBucket {
  apiKeyGemini: string | null;
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

const callGeminiApi = async (prompt: string, onData: (data: string) => void) => {
  const bucket = getBucket<ConfigurationBucket>('my_bucket', 'sync');
  const apiKeyGemini = (await bucket.get()).apiKeyGemini;

  if (!apiKeyGemini) {
    return 'API KEYがセットされていません。';
  }
  const genai = new GoogleGenerativeAI(apiKeyGemini);
  const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContentStream([prompt]);

  let response = '';
  for await (const chunk of result.stream) {
    response += chunk.text();
    onData(response);
  }
};

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (tab !== undefined) {
    const handleData = (data: string) => {
      chrome.runtime.sendMessage({ type: 'response', text: data });
    };

    switch (info.menuItemId) {
      case 'summarize': {
        chrome.sidePanel.open({ windowId: tab.windowId });
        await callGeminiApi('次のテキストを要約してください。' + info.selectionText, handleData);
        break;
      }
      case 'polish': {
        chrome.sidePanel.open({ windowId: tab.windowId });
        await callGeminiApi('次のテキストを推敲してください。' + info.selectionText, handleData);
        break;
      }
      case 'rephrase': {
        chrome.sidePanel.open({ windowId: tab.windowId });
        await callGeminiApi(
          '次のテキストを言い換える表現を、5つ挙げてください。' + info.selectionText,
          handleData
        );
        break;
      }
      case 'explain': {
        chrome.sidePanel.open({ windowId: tab.windowId });
        await callGeminiApi(
          '以下のテキストを、分かりやすく解説してください。' + info.selectionText,
          handleData
        );
        break;
      }
    }
  }
});

export {};
