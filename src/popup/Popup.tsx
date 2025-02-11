import { useEffect, useState } from 'react';
import { getSelectedModel, setSelectedModel } from '../app/configurations';

const Popup = () => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const value = await getSelectedModel();
      if (value) {
        setSelectedModel(value);
      }
    })();
  }, []);

  const saveSelectedModel = (model: string | null) => {
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
      <textarea placeholder="Custom Instruction"></textarea>
    </div>
  );
};

export default Popup;
