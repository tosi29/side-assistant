import { getBucket } from '@extend-chrome/storage';
import { useEffect, useState } from 'react';
import { getApiKeyGemini, setApiKeyGemini } from '../app/configurations';

const Options = () => {
  const [apiKeyGemini, setApiKeyGemini] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const value = await getApiKeyGemini();
      if (value) {
        setApiKeyGemini(value);
      }
    })();
  }, []);

  const saveApiKeyGemini = (apiKeyGemini: string | null) => {
    setApiKeyGemini(apiKeyGemini);
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
          onChange={(e) => saveApiKeyGemini(e.target.value)}
          placeholder="Input Gemini API Key"
        />
      </span>
    </div>
  );
};

export default Options;
