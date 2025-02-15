import { useState, useEffect } from 'react';
import Response from '../app/features/response/Response';
import Chat from '../app/features/chat/Chat';
import Requesta from '../app/features/request/UserRequest';

type Request = {
  type: string;
  text: string;
};

const SidePanel = () => {
  const [responseData, setResponseData] = useState<string | null>(null);

  useEffect(() => {
    const messageListener = (
      request: Request
      // sender: chrome.runtime.MessageSender,
      // sendResponse: (response?: any) => void
    ) => {
      console.log(request);
      if (request.type === 'response') {
        const data = request.text;
        console.log('Side panel: background script からメッセージを受信しました:', data);
        setResponseData(data); // State を更新
      }
    };

    // コンポーネントがマウントされた時にListener を登録
    chrome.runtime.onMessage.addListener(messageListener);
    console.log('Side panel: Message listener added.');

    // コンポーネントがアンマウントされる時にListener を解除
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
      console.log('Side panel: Message listener removed.');
    };
  }, []); // 空の依存配列で、初回マウント時のみ実行

  return (
    <div className="flex flex-col h-screen justify-between">
      <div>
        <Response markdownText={responseData ?? 'No Text'} />
      </div>
      <Chat />
    </div>
  );
};

export default SidePanel;
