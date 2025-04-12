import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { getApiKeyGeminiConfiguration, getSelectedModelConfiguration } from './configurations';

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const callGeminiApi = async (
  instruction: string,
  context: (string | Part)[],
  onData: (data: string) => void,
  onCompleted: (data: string) => void
) => {
  const apiKeyGemini = await getApiKeyGeminiConfiguration();
  const selectedModel = await getSelectedModelConfiguration();

  if (!apiKeyGemini) {
    chrome.runtime.openOptionsPage();
    await sleep(1000); // Wait for the options page to open
    onData(
      'GeminiのAPI KEYがセットされていません。オプションのページから設定してください。\n GeminiのAPI Keyは以下から払い出すことができます。\n https://aistudio.google.com/apikey'
    );
    onCompleted(
      'GeminiのAPI KEYがセットされていません。オプションのページから設定してください。\n GeminiのAPI KEYは以下のページから生成できます。\n https://aistudio.google.com/apikey'
    );
    return;
  }
  const genai = new GoogleGenerativeAI(apiKeyGemini);
  const model = genai.getGenerativeModel({
    model: selectedModel,
    systemInstruction: instruction,
  });

  const result = await model.generateContentStream(context);

  let response = '';
  for await (const chunk of result.stream) {
    response += chunk.text();
    onData(response);
  }
  onCompleted(response);
};

// 新しい関数: 抽象度比較のためにAPIを4回呼び出す
export const callGeminiApiForAbstraction = async (
  selectedText: string
): Promise<{
  summary1: string | null;
  summary2: string | null;
  plain1: string | null;
  plain2: string | null;
}> => {
  const apiKeyGemini = await getApiKeyGeminiConfiguration();
  const selectedModel = await getSelectedModelConfiguration();

  if (!apiKeyGemini) {
    console.error('Gemini API Key is not set.');
    // UI側で処理しやすいようにエラーメッセージを含むオブジェクトを返す
    return {
      summary1: 'エラー: Gemini APIキーが設定されていません。',
      summary2: 'エラー: Gemini APIキーが設定されていません。',
      plain1: 'エラー: Gemini APIキーが設定されていません。',
      plain2: 'エラー: Gemini APIキーが設定されていません。',
    };
  }

  const genai = new GoogleGenerativeAI(apiKeyGemini);
  // systemInstructionなしでモデルを取得 (各呼び出しでプロンプト全体を渡すため)
  const model = genai.getGenerativeModel({ model: selectedModel });

  // 各抽象度レベルのプロンプト定義
  const prompts = {
    summary1: `以下のテキストを、元の意味をできるだけ保ちつつ、少しだけ簡潔にしてください:\n\n${selectedText}`,
    summary2: `以下のテキストの要点をまとめて、非常に短く要約してください:\n\n${selectedText}`,
    plain1: `以下の専門的なテキストについて、専門用語を少し解説しながら、少しだけ易しい言葉で書き直してください:\n\n${selectedText}`,
    plain2: `以下の専門的なテキストを、専門知識がない小学生にも理解できるように、非常に簡単な言葉で説明してください:\n\n${selectedText}`,
  };

  // API呼び出しを並行実行
  // generateContentはストリーミングではないため、結果を直接受け取る
  const results = await Promise.allSettled([
    model.generateContent(prompts.summary1),
    model.generateContent(prompts.summary2),
    model.generateContent(prompts.plain1),
    model.generateContent(prompts.plain2),
  ]);

  // 結果を整形する関数
  const formatResult = (result: PromiseSettledResult<any>, level: string): string | null => {
    if (result.status === 'fulfilled') {
      try {
        // response.text() が存在するか確認
        if (result.value?.response?.text) {
          return result.value.response.text();
        } else {
          console.error(
            `Error formatting result for ${level}: No text found in response`,
            result.value
          );
          return `エラー: ${level} の結果取得中に問題が発生しました (レスポンス形式不正)。`;
        }
      } catch (e) {
        console.error(`Error extracting text for ${level}:`, e);
        return `エラー: ${level} の結果解析中に問題が発生しました。`;
      }
    } else {
      console.error(`Error generating ${level}:`, result.reason);
      // エラー理由をより具体的に表示
      const errorMessage =
        result.reason instanceof Error ? result.reason.message : String(result.reason);
      return `エラー: ${level} の生成中に問題が発生しました - ${errorMessage}`;
    }
  };

  // 結果を整形
  const formattedResults = {
    summary1: formatResult(results[0], '要約レベル1'),
    summary2: formatResult(results[1], '要約レベル2'),
    plain1: formatResult(results[2], '平易レベル1'),
    plain2: formatResult(results[3], '平易レベル2'),
  };

  return formattedResults;
};
