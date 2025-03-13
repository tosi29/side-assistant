import { useEffect, useState } from 'react';
import {
  getApiKeyGeminiConfiguration,
  setApiKeyGeminiConfiguration,
  getCustomInstructionConfiguration,
  setCustomInstructionConfiguration,
} from '../app/configurations';

const Options = () => {
  const [apiKeyGemini, setApiKeyGemini] = useState<string | null>(null);
  const [customInstruction, setCustomInstruction] = useState<string>('');

  useEffect(() => {
    (async () => {
      const value = await getApiKeyGeminiConfiguration();
      if (value) {
        setApiKeyGemini(value);
      }
      const customInstructionValue = await getCustomInstructionConfiguration();
      if (customInstructionValue) {
        setCustomInstruction(customInstructionValue);
      }
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setApiKeyGeminiConfiguration(newValue);
    setApiKeyGemini(newValue);
  };

  const handleChangeCustomInstruction = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCustomInstructionConfiguration(newValue);
    setCustomInstruction(newValue);
  };

  return (
    <div className="px-10">
      <h1>Options</h1>
      <br />
      <div>
        Gemini API KEY:
        <input
          type="password"
          value={apiKeyGemini ?? ''}
          onChange={handleChange}
          placeholder="Input Gemini API Key"
          className="shadow appearance-none border rounded w-full max-w-[240px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <br />
      <div>
        Custom Instruction:
        <textarea
          placeholder="Custom Instruction"
          value={customInstruction}
          onChange={handleChangeCustomInstruction}
          className="shadow appearance-none border rounded w-full max-w-[240px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
        />
      </div>
    </div>
  );
};

export default Options;
