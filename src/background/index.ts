import store, { initializeWrappedStore } from '../app/store';
import { callGeminiApi } from '../app/generativeAi';
import { getCustomInstructionConfiguration } from '../app/configurations';
import { Part } from '@google/generative-ai';

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

const clearContext = () => {
  chrome.runtime.sendMessage({ type: 'clear_context' });
};

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (tab !== undefined && info.selectionText !== undefined) {
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
    // TODO: サイドパネルを開く
    //chrome.sidePanel.open({ windowId: tab.windowId });
    clearContext();
    const { action, pdfUrl } = request.payload;
    console.log(action, pdfUrl);

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
            let prompt = '';
            if (action === 'summarize') {
              prompt = 'このPDFファイルの内容を要約してください。';
            } else if (action === 'generate_toc') {
              prompt =
                'このPDFファイルから目次（見出しに相当する情報およびページ数）を抽出してください。もし目次がなければ生成してください。';
            } else if (action === 'markdown') {
              prompt = 'このPDFファイルをMarkdown形式に変換してください。';
            }

            await callGeminiApi(prompt, [pdfPart], handleData, handleCompleted);
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
