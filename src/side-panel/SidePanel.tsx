import { useState, useEffect } from 'react';
import Response from '../app/features/response/Response';
import Chat from '../app/features/chat/Chat';
import UserRequest from '../app/features/request/UserRequest';
// 新しいコンポーネントとAPI関数をインポート
import AbstractionComparer from '../app/features/response/AbstractionComparer';
import { callGeminiApiForAbstraction } from '../app/generativeAi';

// AbstractionComparerの結果の型定義
type AbstractionResults = {
  summary1: string | null;
  summary2: string | null;
  plain1: string | null;
  plain2: string | null;
};

type Request = {
  type: string;
  text: string;
  // contextはrequestタイプでのみ使用される
  context?: string[];
};

type Context = {
  text: string;
  user: string;
};

const SidePanel = () => {
  const [context, setContext] = useState<Array<Context>>([]); // 通常のチャット履歴
  const [streamResponseData, setStreamResponseData] = useState<string | null>(null); // 通常のストリーム応答
  const [chatText, setChatText] = useState<string>(''); // チャット入力欄のテキスト

  // 抽象度比較用のState
  const [abstractionOriginalText, setAbstractionOriginalText] = useState<string | null>(null);
  const [abstractionResults, setAbstractionResults] = useState<AbstractionResults | null>(null);
  const [isAbstractionLoading, setIsAbstractionLoading] = useState<boolean>(false);

  // 抽象度比較の状態をクリアする関数
  const clearAbstractionState = () => {
    setAbstractionOriginalText(null);
    setAbstractionResults(null);
    setIsAbstractionLoading(false);
  };

  useEffect(() => {
    const messageListener = (
      request: Request
      // sender: chrome.runtime.MessageSender,
      // sendResponse: (response?: any) => void
    ) => {
      console.log('Side panel received message:', request);

      // メッセージタイプに応じて処理を分岐
      if (request.type === 'abstract_compare_request') {
        // 抽象度比較リクエストの処理
        console.log('Handling abstract_compare_request');
        clearAbstractionState(); // 前回の結果をクリア
        setStreamResponseData(null); // 通常のストリーム表示もクリア
        setContext([]); // 通常のチャット履歴もクリア (UIをシンプルにするため)
        setAbstractionOriginalText(request.text);
        setIsAbstractionLoading(true);

        callGeminiApiForAbstraction(request.text)
          .then((results) => {
            console.log('Abstraction results received:', results);
            setAbstractionResults(results);
          })
          .catch((error) => {
            console.error('Error calling callGeminiApiForAbstraction:', error);
            // エラーをUIに表示するために結果オブジェクトにエラーメッセージを入れる
            setAbstractionResults({
              summary1: `エラー: ${error.message || '不明なエラー'}`,
              summary2: `エラー: ${error.message || '不明なエラー'}`,
              plain1: `エラー: ${error.message || '不明なエラー'}`,
              plain2: `エラー: ${error.message || '不明なエラー'}`,
            });
          })
          .finally(() => {
            setIsAbstractionLoading(false);
          });
      } else if (request.type === 'clear_context') {
        // コンテキストクリア
        console.log('Handling clear_context');
        setContext([]);
        setStreamResponseData(null);
        clearAbstractionState(); // 抽象度比較もクリア
      } else if (request.type === 'response_stream') {
        // 通常の応答ストリーム
        console.log('Handling response_stream');
        clearAbstractionState(); // 抽象度比較をクリア
        setStreamResponseData(request.text);
      } else if (request.type === 'response_completed') {
        // 通常の応答完了
        console.log('Handling response_completed');
        clearAbstractionState(); // 抽象度比較をクリア
        setContext((prevContext) => [
          ...prevContext,
          {
            text: request.text, // Duplicate removed
            user: 'bot',
          },
        ]);
        setStreamResponseData(null); // ストリーム表示をクリア
      } else if (request.type === 'forward') {
        // テキスト転記
        console.log('Handling forward');
        clearAbstractionState(); // 抽象度比較をクリア
        setChatText(request.text); // チャット入力欄にテキストを設定
      } else {
        console.warn('Unhandled message type:', request.type);
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
  }, []);

  // チャット送信時の処理
  const onSubmit = (text: string) => {
    clearAbstractionState(); // 新しいチャットが始まったら抽象度比較をクリア
    setStreamResponseData(null); // ストリーム表示もクリア
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
      {/* 上部にコンテンツ表示エリア */}
      <div className="flex-grow overflow-y-auto">
        {/* 抽象度比較コンポーネント */}
        <AbstractionComparer
          originalText={abstractionOriginalText}
          results={abstractionResults}
          isLoading={isAbstractionLoading}
        />

        {/* 通常のチャット履歴 */}
        {context.map((c, index) => {
          if (c.user === 'user') {
            return <UserRequest key={`user-${index}`} text={c.text} />;
          }
          if (c.user === 'bot') {
            return <Response key={`bot-${index}`} markdownText={c.text} />;
          }
          return null; // Add a default return for safety
        })}

        {/* 通常のストリーミング応答 */}
        {streamResponseData && <Response markdownText={streamResponseData} />}
      </div>

      {/* 下部にチャット入力欄 */}
      <div className="flex-shrink-0">
        <Chat text={chatText} onSubmit={onSubmit} />
      </div>
    </div>
  );
};

export default SidePanel;
