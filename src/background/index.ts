import store, { initializeWrappedStore } from '../app/store';
import { callGeminiApi } from '../app/generativeAi';
import { getCustomInstructionConfiguration } from '../app/configurations';
import { Part } from '@google/generative-ai';
import { Usecase } from '../typings';

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

const usecases: Record<string, Usecase> = {
  summarize: {
    id: 'summarize',
    title: '要約する',
    systemPrompt: '与えられたテキストを要約してください。',
  },
  polish: {
    id: 'polish',
    title: '推敲する',
    systemPrompt:
      '与えられたテキストを推敲してください。また変更箇所は、別途表形式で変更前と変更後をまとめて出力してください。',
  },
  rephrase: {
    id: 'rephrase',
    title: '言い換え表現を探す',
    systemPrompt: '与えられたテキストを言い換える表現を、5つ挙げてください。',
  },
  explain: {
    id: 'explain',
    title: '解説する',
    systemPrompt: '与えられたテキストを、分かりやすく解説してください。',
  },
  custom: {
    id: 'custom',
    title: '（カスタム命令を実行する）',
    systemPrompt: '', // Dynamically loaded in the handler
  },
  forward: {
    id: 'forward',
    title: '（チャット欄に転記する）',
    systemPrompt: '', // Not used in this case
  },
};

const usecasesForPdf: Record<string, Usecase> = {
  summarize: {
    id: 'summarize',
    title: 'PDFを要約する',
    systemPrompt: 'このPDFファイルの内容を要約してください。',
  },
  generate_toc: {
    id: 'generate_toc',
    title: 'PDFの目次を生成する',
    systemPrompt:
      'このPDFファイルから目次（見出しに相当する情報およびページ数）を抽出してください。もし目次がなければ生成してください。',
  },
  markdown: {
    id: 'markdown',
    title: 'PDFをMarkdownに変換する',
    systemPrompt: 'このPDFファイルをMarkdown形式に変換してください。',
  },
};

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

  const usecase = usecases[info.menuItemId];
  if (!usecase) {
    return;
  }

  chrome.sidePanel.open({ windowId: tab.windowId });
  clearContext();

  if (usecase.id === 'custom') {
    usecase.systemPrompt = (await getCustomInstructionConfiguration()) ?? '';
  }

  if (usecase.id === 'forward') {
    chrome.runtime.sendMessage({ type: 'forward', text: info.selectionText });
  } else {
    await callGeminiApi(usecase.systemPrompt, [info.selectionText], handleData, handleCompleted);
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
              const usecase = usecasesForPdf[action];
              if (!usecase) {
                console.error('Unknown PDF action:', action);
                chrome.runtime.sendMessage({
                  type: 'response_error',
                  text: `Unknown PDF action: ${action}`,
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
