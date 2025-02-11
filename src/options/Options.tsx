import { getBucket } from '@extend-chrome/storage';
import { useEffect, useState } from 'react';

interface ConfigurationBucket {
  apiKeyGemini: string | null;
}

const bucket = getBucket<ConfigurationBucket>('my_bucket', 'sync');

const Options = () => {
  const [apiKeyGemini, setApiKeyGemini] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const value = await bucket.get();
      if (value.apiKeyGemini) {
        setApiKeyGemini(value.apiKeyGemini);
      }
    })();
  }, []);

  const saveApiKeyGemini = (apiKeyGemini: string | null) => {
    bucket.set({ apiKeyGemini: apiKeyGemini });
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
