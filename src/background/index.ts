import store, { initializeWrappedStore } from '../app/store';
import { callGeminiApi } from '../app/generativeAi';
import { getCustomInstructionConfiguration } from '../app/configurations';

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
  chrome.contextMenus.create({
    id: 'custom',
    title: 'Custom Instruction',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (tab !== undefined && info.selectionText !== undefined) {
    const handleData = (data: string) => {
      chrome.runtime.sendMessage({ type: 'response_stream', text: data });
    };

    const handleCompleted = (data: string) => {
      chrome.runtime.sendMessage({ type: 'response_completed', text: data });
    };

    const clearContext = () => {
      chrome.runtime.sendMessage({ type: 'clear_context' });
    };

    switch (info.menuItemId) {
      case 'summarize': {
        chrome.sidePanel.open({ windowId: tab.windowId });
        clearContext();
        await callGeminiApi(
          '与えられたテキストを要約してください。',
          info.selectionText,
          handleData,
          handleCompleted
        );
        break;
      }
      case 'polish': {
        chrome.sidePanel.open({ windowId: tab.windowId });
        clearContext();
        await callGeminiApi(
          '与えられたテキストを推敲してください。また変更箇所は、別途表形式で変更前と変更後をまとめて出力してください。',
          info.selectionText,
          handleData,
          handleCompleted
        );
        break;
      }
      case 'rephrase': {
        chrome.sidePanel.open({ windowId: tab.windowId });
        clearContext();
        await callGeminiApi(
          '与えられたテキストを言い換える表現を、5つ挙げてください。',
          info.selectionText,
          handleData,
          handleCompleted
        );
        break;
      }
      case 'explain': {
        chrome.sidePanel.open({ windowId: tab.windowId });
        clearContext();
        await callGeminiApi(
          '与えられたテキストを、分かりやすく解説してください。',
          info.selectionText,
          handleData,
          handleCompleted
        );
        break;
      }
      case 'custom': {
        chrome.sidePanel.open({ windowId: tab.windowId });
        clearContext();
        await callGeminiApi(
          (await getCustomInstructionConfiguration()) ?? '', // TODO: 指示がないときの対策
          info.selectionText,
          handleData,
          handleCompleted
        );
        break;
      }
    }
  }
});

export {};
