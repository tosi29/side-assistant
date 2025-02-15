import { useEffect, useState } from 'react';
import { getApiKeyGeminiConfiguration, setApiKeyGeminiConfiguration } from '../app/configurations';

const Options = () => {
  const [apiKeyGemini, setApiKeyGemini] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const value = await getApiKeyGeminiConfiguration();
      if (value) {
        setApiKeyGemini(value);
      }
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setApiKeyGeminiConfiguration(newValue);
    setApiKeyGemini(newValue);
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
    </div>
  );
};

export default Options;
