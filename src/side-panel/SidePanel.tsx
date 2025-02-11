import React, { useState, useEffect } from 'react';

const SidePanel = () => {
  const [responseData, setResponseData] = useState<string | null>(null); // State を追加

  useEffect(() => {
    // メッセージリスナー関数
    const messageListener = (
      request: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      console.log(request);
      if (request.type === 'response') {
        const data = request.text;
        console.log('Side panel: background script からメッセージを受信しました:', data);
        setResponseData(data); // State を更新
      }
    };

    // Listener を登録 (コンポーネントがマウントされた時)
    chrome.runtime.onMessage.addListener(messageListener);
    console.log('Side panel: Message listener added.');

    // Listener を解除 (コンポーネントがアンマウントされる時)
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
      console.log('Side panel: Message listener removed.');
    };
  }, []); // 空の依存配列で、初回マウント時のみ実行

  return (
    <div className="flex h-screen items-center justify-center">
      <div>{responseData ? responseData : 'データなし'}</div> {/* State を表示 */}
    </div>
  );
};

export default SidePanel;
