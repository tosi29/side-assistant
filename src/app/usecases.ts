import { Usecase } from '../typings';

export const usecases: Record<string, Usecase> = {
  summarize: {
    id: 'summarize',
    title: '要約する',
    systemPrompt: `
    与えられたテキストを要約してください。
    回答は日本語で、Markdown形式で出力してください。「はい、わかりました」などの相槌は回答に含めないでください。
    `,
  },
  polish: {
    id: 'polish',
    title: '推敲する',
    systemPrompt: `
    与えられたテキストを推敲してください。また変更箇所は、別途表形式で変更前と変更後をまとめて出力してください。
    回答は日本語で、Markdown形式で出力してください。「はい、わかりました」などの相槌は回答に含めないでください。    
    `,
  },
  rephrase: {
    id: 'rephrase',
    title: '言い換え表現を探す',
    systemPrompt: `
    与えられたテキストを言い換える表現を、5つ挙げてください。
    回答は日本語で、Markdown形式で出力してください。「はい、わかりました」などの相槌は回答に含めないでください。    
    `,
  },
  explain: {
    id: 'explain',
    title: '解説する',
    systemPrompt: `
    与えられたテキストを、分かりやすく解説してください。
    回答は日本語で、Markdown形式で出力してください。「はい、わかりました」などの相槌は回答に含めないでください。    
    `,
  },
  custom: {
    id: 'custom',
    title: '（カスタム命令を実行する）',
    systemPrompt: '', // Dynamically loaded in the handler
  },
  forward: {
    id: 'forward',
    title: '（チャット欄に転記する）',
    systemPrompt: '', // Not used in this case
  },
};

export const usecasesForPdf: Record<string, Usecase> = {
  summarize: {
    id: 'summarize',
    title: 'PDFを要約する',
    systemPrompt: `
    このPDFファイルの内容を要約してください。
    回答は日本語で、Markdown形式で出力してください。「はい、わかりました」などの相槌は回答に含めないでください。
    `,
  },
  generate_toc: {
    id: 'generate_toc',
    title: 'PDFの目次を生成する',
    systemPrompt: `
      このPDFファイルから目次（見出しに相当する情報およびページ数）を抽出してください。もし目次がなければ生成してください。',
      回答は日本語で、Markdown形式で出力してください。「はい、わかりました」などの相槌は回答に含めないでください。
      `,
  },
  markdown: {
    id: 'markdown',
    title: 'PDFをMarkdownに変換する',
    systemPrompt: `
    このPDFファイルをMarkdown形式に変換してください。
    Markdownのみ出力してください。「はい、わかりました」などの相槌は回答に含めないでください。
    元の言語や文体を厳密に維持してください。
    画像は表示できないので、出力には含めないでください。
    `,
  },
};
