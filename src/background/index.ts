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
});

const handleData = (data: string) => {
  chrome.runtime.sendMessage({ type: 'response_stream', text: data });
};

const handleCompleted = (data: string) => {
  chrome.runtime.sendMessage({ type: 'response_completed', text: data });
};

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (tab !== undefined && info.selectionText !== undefined) {
    const clearContext = () => {
      chrome.runtime.sendMessage({ type: 'clear_context' });
    };

    switch (info.menuItemId) {
      case 'summarize': {
        chrome.sidePanel.open({ windowId: tab.windowId });
        clearContext();
        await callGeminiApi(
          '与えられたテキストを要約してください。',
          [info.selectionText],
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
          [info.selectionText],
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
          [info.selectionText],
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
          [info.selectionText],
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
          [info.selectionText],
          handleData,
          handleCompleted
        );
        break;
      }
      case 'forward': {
        chrome.sidePanel.open({ windowId: tab.windowId });
        chrome.runtime.sendMessage({ type: 'forward', text: info.selectionText });
        break;
      }
    }
  }
});

chrome.runtime.onMessage.addListener((request) => {
  console.log(request);
  if (request.type === 'request') {
    callGeminiApi('', request.context, handleData, handleCompleted);
  } else if (request.type === 'process_pdf') {
    // TODO: サイドパネルを開いてコンテキストをクリアする
    //chrome.sidePanel.open({ windowId: tab.windowId });
    //clearContext();
    const { action, url } = request.payload;
    (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }
        const pdfData = await response.blob();

        let prompt = '';
        if (action === 'summarize') {
          prompt = 'このPDFファイルの内容を要約してください。';
        } else if (action === 'generate_toc') {
          prompt =
            'このPDFファイルから目次（見出しに相当する情報およびページ数）を抽出してください。もし目次がなければ生成してください。';
        }

        // TODO: Send PDF data to Gemini API and handle response
        // For now, we are just sending the URL, but we might need to send the actual PDF data
        await callGeminiApi(prompt, [], handleData, handleCompleted, url);
      } catch (error) {
        console.error(error);
        chrome.runtime.sendMessage({
          type: 'response_error',
          text: error instanceof Error ? error.message : 'An unknown error occurred',
        });
      }
    })();
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab?.url) {
    const isPdf =
      tab.url.toLowerCase().endsWith('.pdf') ||
      (tab.url.startsWith('chrome-extension://') && tab.url.includes('pdfviewer'));

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
  }
});

export {};
