import { useState, useEffect } from 'react';
import Response from '../app/features/response/Response';
import Chat from '../app/features/chat/Chat';
import UserRequest from '../app/features/request/UserRequest';

type Request = {
  type: string;
  text: string;
};

type Context = {
  text: string;
  user: string;
};

const SidePanel = () => {
  const [context, setContext] = useState<Array<Context>>([]);
  const [streamResponseData, setStreamResponseData] = useState<string | null>(null);
  const [chatText, setChatText] = useState<string>('');

  useEffect(() => {
    const messageListener = (
      request: Request
      // sender: chrome.runtime.MessageSender,
      // sendResponse: (response?: any) => void
    ) => {
      console.log(request);
      if (request.type === 'clear_context') {
        setContext([]);
      } else if (request.type === 'response_stream') {
        console.log('Side panel: background script からメッセージを受信しました:', request);
        setStreamResponseData(request.text);
      } else if (request.type === 'response_completed') {
        console.log('Side panel: background script からメッセージを受信しました:', request);
        // ストリームの終了を検知したら、contextに移動させてストリーム表示を空にする
        setContext((prevContext) => [
          ...prevContext,
          {
            text: request.text,
            user: 'bot',
          },
        ]);
        setStreamResponseData(null);
      } else if (request.type === 'forward') {
        console.log('Side panel: background script からメッセージを受信しました:', request);
        setChatText(request.text);
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

  const onSubmit = (text: string) => {
    setContext((prevContext) => [
      ...prevContext,
      {
        text: text,
        user: 'user',
      },
    ]);
    const texts = context.map((c) => c.text);
    chrome.runtime.sendMessage({ type: 'request', text: text, context: [...texts, text] });
  };

  return (
    <div className="flex flex-col h-screen justify-between">
      <div>
        {context.map((c, index) => {
          if (c.user === 'user') {
            return <UserRequest key={index} text={c.text} />;
          }
          if (c.user === 'bot') {
            return <Response key={index} markdownText={c.text} />;
          }
        })}
        {streamResponseData ? <Response markdownText={streamResponseData} /> : <></>}
      </div>
      <Chat text={chatText} onSubmit={onSubmit} />
    </div>
  );
};

export default SidePanel;
