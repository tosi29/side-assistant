import browser from 'webextension-polyfill';
import store, { initializeWrappedStore } from '../app/store';

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

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (tab !== undefined) {
    switch (info.menuItemId) {
      case 'summarize':
        console.log(info.selectionText);
        chrome.sidePanel.open({ windowId: tab.windowId });
        break;
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
