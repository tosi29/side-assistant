import { Usecase } from '../typings';

export const usecases: Record<string, Usecase> = {
  summarize: {
    id: 'summarize',
    title: '要約する',
    systemPrompt: '与えられたテキストを要約してください。',
  },
  polish: {
    id: 'polish',
    title: '推敲する',
    systemPrompt:
      '与えられたテキストを推敲してください。また変更箇所は、別途表形式で変更前と変更後をまとめて出力してください。',
  },
  rephrase: {
    id: 'rephrase',
    title: '言い換え表現を探す',
    systemPrompt: '与えられたテキストを言い換える表現を、5つ挙げてください。',
  },
  explain: {
    id: 'explain',
    title: '解説する',
    systemPrompt: '与えられたテキストを、分かりやすく解説してください。',
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
    systemPrompt: 'このPDFファイルの内容を要約してください。',
  },
  generate_toc: {
    id: 'generate_toc',
    title: 'PDFの目次を生成する',
    systemPrompt:
      'このPDFファイルから目次（見出しに相当する情報およびページ数）を抽出してください。もし目次がなければ生成してください。',
  },
  markdown: {
    id: 'markdown',
    title: 'PDFをMarkdownに変換する',
    systemPrompt: 'このPDFファイルをMarkdown形式に変換してください。',
  },
};
