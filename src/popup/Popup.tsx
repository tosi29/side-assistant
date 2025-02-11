import { getBucket } from '@extend-chrome/storage';
import { useEffect, useState } from 'react';

interface ConfigurationBucket {
  selectedModel: string | null;
}

const bucket = getBucket<ConfigurationBucket>('configuration', 'sync');

const Popup = () => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const value = await bucket.get();
      if (value.selectedModel) {
        setSelectedModel(value.selectedModel);
      }
    })();
  }, []);

  const saveSelectedModel = (model: string | null) => {
    bucket.set({ selectedModel: model });
    setSelectedModel(model);
  };

  return (
    <div className="flex flex-col items-center justify-center w-[30rem] h-[15rem]">
      <h1 className="text-base mt-2">Popup</h1>
      <br />
      <span>
        Select Model:
        <select
          value={selectedModel ?? 'gemini-2.0-flash-thinking-exp-01-21'}
          onChange={(e) => saveSelectedModel(e.target.value)}
        >
          <option value="gemini-2.0-flash-thinking-exp-01-21">
            Gemini 2.0 Flash Thinking Experimental 01-21
          </option>
          <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
          <option value="gemini-2.0-pro-exp-02-05">Gemini 2.0 Pro Experimental 02-05</option>
        </select>
      </span>
    </div>
  );
};

export default Popup;
