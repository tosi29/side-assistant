import { getBucket } from '@extend-chrome/storage';
import { useEffect, useState } from 'react';

interface ConfigurationBucket {
  apiKeyGemini: string | null;
}

const bucket = getBucket<ConfigurationBucket>('my_bucket', 'sync');

const Popup = () => {
  document.body.className = 'w-[30rem] h-[15rem]';

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
    <>
      <div className="flex justify-center mt-2 text-base">Configurations </div>
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
    </>
  );
};

export default Popup;
