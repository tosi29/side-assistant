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
    <div className="flex h-screen items-center justify-center">
      <h1>Options</h1>

      <br />
      <span>
        Gemini API KEY:
        <input
          type="password"
          value={apiKeyGemini ?? ''}
          onChange={handleChange}
          placeholder="Input Gemini API Key"
        />
      </span>
    </div>
  );
};

export default Options;
