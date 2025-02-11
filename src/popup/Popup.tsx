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

  return (
    <div className="flex flex-col items-center justify-center w-[30rem] h-[15rem]">
      <h1 className="text-base mt-2">Popup</h1>
      <br />
      <span>
        Select Model:
        <select value={selectedModel} onChange={handleChange}>
          <option value="gemini-2.0-flash-thinking-exp-01-21">
            Gemini 2.0 Flash Thinking Experimental 01-21
          </option>
          <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
          <option value="gemini-2.0-pro-exp-02-05">Gemini 2.0 Pro Experimental 02-05</option>
        </select>
      </span>
      <textarea
        placeholder="Custom Instruction"
        value={customInstruction}
        onChange={handleChangeCustomInstruction}
      ></textarea>
    </div>
  );
};

export default Popup;
