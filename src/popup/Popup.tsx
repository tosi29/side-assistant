import { useEffect, useState } from 'react';
import {
  getSelectedModelConfiguration,
  setSelectedModelConfiguration,
  getCustomInstructionConfiguration,
  setCustomInstructionConfiguration,
} from '../app/configurations';

const Popup = () => {
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.0-flash-thinking-exp-01-21');
  const [customInstruction, setCustomInstruction] = useState<string>('');
  const [isPdfTab, setIsPdfTab] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const value = await getSelectedModelConfiguration();
      if (value) {
        setSelectedModel(value);
      }

      const customInstructionValue = await getCustomInstructionConfiguration();
      if (customInstructionValue) {
        setCustomInstruction(customInstructionValue);
      }
    })();

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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

  const handleChangeCustomInstruction = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCustomInstructionConfiguration(newValue);
    setCustomInstruction(newValue);
  };

  const handleSummarizePdf = () => {
    console.log('Summarize PDF clicked');
    // TODO: Implement PDF summarization logic
  };

  const handleGenerateToc = () => {
    console.log('Generate TOC clicked');
    // TODO: Implement TOC generation logic
  };

  return (
    <div className="px-2 w-[30rem] h-[auto]">
      <h1 className="text-base mt-2">Popup</h1>
      <br />
      {isPdfTab ? (
        <div id="pdfMode">
          <h2 className="text-base mt-2">PDF Mode</h2>
          <div className="flex flex-col space-y-2">
            <button
              id="summarizePdfBtn"
              onClick={handleSummarizePdf}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              PDFを要約
            </button>
            <button
              id="generateTocBtn"
              onClick={handleGenerateToc}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              目次を生成
            </button>
            <input
              type="text"
              id="pageRange"
              placeholder="ページ範囲 (例: 1-5)"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
      ) : (
        <div id="webMode">
          <div className="mb-2">
            Select Model:
            <select
              value={selectedModel}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="gemini-2.0-flash-thinking-exp-01-21">
                Gemini 2.0 Flash Thinking Experimental 01-21
              </option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-2.0-pro-exp-02-05">Gemini 2.0 Pro Experimental 02-05</option>
            </select>
          </div>
          <div>
            Custom Instruction:
            <textarea
              placeholder="Custom Instruction"
              value={customInstruction}
              onChange={handleChangeCustomInstruction}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Popup;
