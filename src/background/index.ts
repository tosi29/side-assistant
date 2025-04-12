import store, { initializeWrappedStore } from '../app/store';
import { callGeminiApi } from '../app/generativeAi';
import { getCustomInstructionConfiguration } from '../app/configurations';
import { Part } from '@google/generative-ai';
import { usecases, usecasesForPdf } from '../app/usecases';

initializeWrappedStore();

store.subscribe(() => {
  // access store state
  // const state = store.getState();
  // console.log('state', state);
});

chrome.runtime.onInstalled.addListener(() => {
  const contextMenuItems = [
    { id: 'summarize', title: '要約する' },
    { id: 'polish', title: '推敲する' },
    { id: 'rephrase', title: '言い換え表現を探す' },
    { id: 'explain', title: '解説する' },
    { id: 'custom', title: '（カスタム命令を実行する）' },
    { id: 'forward', title: '（チャット欄に転記する）' },
  ];

  contextMenuItems.forEach((item) => {
    chrome.contextMenus.create({
      id: item.id,
      title: item.title,
      contexts: ['selection'],
    });
  });
  // 新しいコンテキストメニュー項目を追加
  chrome.contextMenus.create({
    id: 'abstract_compare',
    title: '抽象度を変えて読む',
    contexts: ['selection'],
  });
});

const handleData = (data: string) => {
  chrome.runtime.sendMessage({ type: 'response_stream', text: data });
};

const handleCompleted = (data: string) => {
  chrome.runtime.sendMessage({ type: 'response_completed', text: data });
};

const clearContext = () => {
  chrome.runtime.sendMessage({ type: 'clear_context' });
};

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (tab === undefined || info.selectionText === undefined) {
    return;
  }

  chrome.sidePanel.open({ windowId: tab.windowId });
  clearContext();

  if (info.menuItemId === 'abstract_compare') {
    // 新しい抽象度比較リクエストをサイドパネルに送信
    chrome.runtime.sendMessage({ type: 'abstract_compare_request', text: info.selectionText });
  } else {
    // 既存のユースケース処理
    const usecase = usecases[info.menuItemId as string];
    if (!usecase) {
      console.error('Unknown context menu item ID:', info.menuItemId);
      return; // 不明なIDの場合は何もしない
    }

    if (usecase.id === 'custom') {
      usecase.systemPrompt = (await getCustomInstructionConfiguration()) ?? '';
    }

    if (usecase.id === 'forward') {
      chrome.runtime.sendMessage({ type: 'forward', text: info.selectionText });
    } else {
      // 通常のAPI呼び出し
      await callGeminiApi(usecase.systemPrompt, [info.selectionText], handleData, handleCompleted);
    }
  }
});

chrome.runtime.onMessage.addListener((request) => {
  console.log(request);
  if (request.type === 'request') {
    callGeminiApi('', request.context, handleData, handleCompleted);
  } else if (request.type === 'process_pdf') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].windowId) {
        chrome.sidePanel.open({ windowId: tabs[0].windowId });
      }
      clearContext();
      const { usecaseId, pdfUrl } = request.payload;
      console.log(usecaseId, pdfUrl);

      (async () => {
        try {
          console.log(pdfUrl);
          const pdfData = await fetch(pdfUrl)
            .then((response) => response.arrayBuffer())
            .catch((error) => {
              throw new Error(`Failed to fetch PDF: ${error}`);
            });

          const reader = new FileReader();
          reader.onloadend = async () => {
            if (reader.result) {
              const base64String = reader.result.toString().split(',')[1]; // Data URLからBase64部分を抽出
              const pdfPart: Part = {
                inlineData: {
                  data: base64String,
                  mimeType: 'application/pdf',
                },
              };
              const usecase = usecasesForPdf[usecaseId];
              if (!usecase) {
                console.error('Unknown PDF usecaseId:', usecaseId);
                chrome.runtime.sendMessage({
                  type: 'response_error',
                  text: `Unknown PDF usecaseId: ${usecaseId}`,
                });
                return;
              }

              await callGeminiApi(usecase.systemPrompt, [pdfPart], handleData, handleCompleted);
            }
          };
          reader.onerror = (error) => {
            console.error('FileReader error:', error);
            chrome.runtime.sendMessage({
              type: 'response_error',
              text: 'PDFの処理中にエラーが発生しました。',
            });
          };
          reader.readAsDataURL(new Blob([pdfData], { type: 'application/pdf' }));
        } catch (error) {
          console.error(error);
          chrome.runtime.sendMessage({
            type: 'response_error',
            text: error instanceof Error ? error.message : 'An unknown error occurred',
          });
        }
      })();
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab?.url) {
    updateBadgeAndPopup(tabId, tab.url);
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab?.url) {
    updateBadgeAndPopup(activeInfo.tabId, tab.url);
  }
});

const updateBadgeAndPopup = (tabId: number, url: string) => {
  const isPdf =
    url.toLowerCase().endsWith('.pdf') ||
    (url.startsWith('chrome-extension://') && url.includes('pdfviewer'));

  // PDFステータスを保存
  chrome.storage.local.set({ isPdfTab: isPdf, currentTabId: tabId });

  // バッジやアイコンを更新してPDF対応を視覚的に表示
  if (isPdf) {
    chrome.action.setBadgeText({ text: 'PDF', tabId });
  } else {
    chrome.action.setBadgeText({ text: '', tabId });
  }
  // Send message to popup to update UI
  chrome.runtime.sendMessage({ type: 'pdf_status', isPdfTab: isPdf });
};

export {};
