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
});

const callGeminiApi = async (prompt: string) => {
  const bucket = getBucket<ConfigurationBucket>('my_bucket', 'sync');
  const apiKeyGemini = (await bucket.get()).apiKeyGemini;

  if (!apiKeyGemini) {
    return 'API KEYがセットされていません。';
  }
  const genai = new GoogleGenerativeAI(apiKeyGemini);
  const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent([prompt]);
  return result.response.text();
};

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (tab !== undefined) {
    switch (info.menuItemId) {
      case 'summarize': {
        console.log(info.selectionText);
        const result = await callGeminiApi('次のテキストを要約してください。' + info.selectionText);
        // chrome.sidePanel.open({ windowId: tab.windowId });
        console.log(result);
        break;
      }
      case 'polish':
        console.log(info.selectionText);
        chrome.sidePanel.open({ windowId: tab.windowId });
        break;
      case 'rephrase':
        console.log(info.selectionText);
        chrome.sidePanel.open({ windowId: tab.windowId });
        break;
    }
  }
});

export {};
