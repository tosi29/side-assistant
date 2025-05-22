import { useEffect, useState } from 'react';

import {
  getSelectedModelConfiguration,
  setSelectedModelConfiguration,
} from '../app/configurations';
import store, { setCurrentTabId } from '../app/store';
import { usecasesForPdf } from '../app/usecases';

const Popup = () => {
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash-preview-05-20');
  const [isPdfTab, setIsPdfTab] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const value = await getSelectedModelConfiguration();
      if (value) {
        setSelectedModel(value);
      }

      // Load isPdfTab and currentTabId from storage
      chrome.storage.local.get(['isPdfTab', 'currentTabId'], (result) => {
        if (result.isPdfTab !== undefined) {
          setIsPdfTab(result.isPdfTab);
        }
        if (result.currentTabId !== undefined) {
          store.dispatch(setCurrentTabId(result.currentTabId));
        }
      });
    })();

    chrome.runtime.onMessage.addListener((request) => {
      if (request.type === 'pdf_status') {
        setIsPdfTab(request.isPdfTab);
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectedModelConfiguration(newValue);
    setSelectedModel(newValue);
  };

  const handleSummarizePdf = async () => {
    const { currentTabId } = store.getState();
    if (currentTabId === undefined) {
      console.error('currentTabId is undefined');
      return;
    }
    const tab = await chrome.tabs.get(currentTabId);
    const url = tab.url;
    if (url === undefined) {
      console.error('url is undefined');
      return;
    }

    chrome.runtime.sendMessage({
      type: 'process_pdf',
      payload: {
        usecaseId: 'summarize',
        pdfUrl: url,
      },
    });
  };

  const handleGenerateToc = async () => {
    const { currentTabId } = store.getState();
    if (currentTabId === undefined) {
      console.error('currentTabId is undefined');
      return;
    }
    const tab = await chrome.tabs.get(currentTabId);
    const url = tab.url;
    if (url === undefined) {
      console.error('url is undefined');
      return;
    }
    chrome.runtime.sendMessage({
      type: 'process_pdf',
      payload: {
        usecaseId: 'generate_toc',
        pdfUrl: url,
      },
    });
  };

  const handleMarkdownPdf = async () => {
    const { currentTabId } = store.getState();
    if (currentTabId === undefined) {
      console.error('currentTabId is undefined');
      return;
    }
    const tab = await chrome.tabs.get(currentTabId);
    const url = tab.url;
    if (url === undefined) {
      console.error('url is undefined');
      return;
    }
    chrome.runtime.sendMessage({
      type: 'process_pdf',
      payload: {
        usecaseId: 'markdown',
        pdfUrl: url,
      },
    });
  };

  return (
    <div className="px-2 w-[30rem] h-[auto]">
      <h1 className="text-base mt-2">Popup</h1>
      <br />
      <div id="webMode">
        <div className="mb-2">
          Select Model:
          <select
            value={selectedModel}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="gemini-2.5-flash-preview-05-20">Gemini 2.5 Flash Preview 05-20</option>
            <option value="gemini-2.5-pro-preview-05-06">Gemini 2.5 Pro Preview 05-06</option>
          </select>
        </div>
        {isPdfTab ? (
          <div id="pdfMode">
            <h2 className="text-base mt-2">PDF Mode</h2>
            <div className="flex flex-col space-y-2 my-2">
              <button
                id="summarizePdfBtn"
                onClick={handleSummarizePdf}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
              >
                {usecasesForPdf.summarize.title}
              </button>
              <button
                id="generateTocBtn"
                onClick={handleGenerateToc}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
              >
                {usecasesForPdf.generate_toc.title}
              </button>
              <button
                id="markdownPdfBtn"
                onClick={handleMarkdownPdf}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
              >
                {usecasesForPdf.markdown.title}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Popup;
