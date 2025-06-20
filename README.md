# Side Assistant

[![version](https://img.shields.io/badge/version-0.5.0-blue.svg)](package.json) [![license](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Side Assistant は、生成 AI (Gemini) を活用してブラウジング体験を向上させる Chrome 拡張機能です。Web ページ上のテキストや PDF ドキュメントの内容を元に、要約、推敲、解説などを簡単に行うことができます。

## 主な機能

- **Web ページでの利用**:
  - テキストを選択し、右クリックメニューから「要約」「推敲」「解説」などのプロンプトを素早く実行できます。
  - 実行結果はサイドパネルに表示されます。
- **PDF での利用**:
  - Chrome で PDF を開くと、専用のポップアップメニューが表示されます。
  - 「要約」「目次生成」「Markdown 形式に変換」などの機能を利用できます。
  - 実行結果はサイドパネルに表示されます。
- **サイドパネル**:
  - 生成 AI との対話履歴や、実行したタスクの結果を確認できます。
- **カスタマイズ**:
  - ご自身の Google AI Studio (Gemini) API キーを設定して利用できます。
  - 利用する Gemini モデルを選択できます。

## インストール

Chrome ウェブストアについては、現在公開準備中です。

**開発者モードでの手動インストール:**

1.  このリポジトリをクローンまたはダウンロードします。
2.  ターミナルでリポジトリのディレクトリに移動し、依存関係をインストールします:
    ```bash
    yarn install
    ```
3.  プロジェクトをビルドします:
    ```bash
    yarn build
    ```
    これにより `dist` ディレクトリが生成されます。
4.  Chrome ブラウザで `chrome://extensions` を開きます。
5.  右上の「デベロッパーモード」を有効にします。
6.  「パッケージ化されていない拡張機能を読み込む」ボタンをクリックします。
7.  ステップ 3 で生成された `dist` ディレクトリを選択します。

## 使い方

1.  拡張機能アイコンをクリックして、オプションページを開きます。
2.  Google AI Studio で取得したご自身の API キーを入力し、保存します。
3.  利用したい Gemini モデルを選択します。
4.  Web ページ上でテキストを選択し、右クリックメニューから実行したいタスクを選択します。
5.  PDF を開いている場合は、画面右下に表示されるポップアップメニューからタスクを選択します。
6.  サイドパネルで結果を確認します。

## 開発者向け情報

### セットアップ

```bash
# リポジトリをクローン (リポジトリのURLを適切に設定してください)
# git clone https://github.com/(ユーザー名)/(リポジトリ名).git
# cd side-assistant

# 依存関係をインストール
yarn install
```

### 開発サーバーの起動

```bash
yarn dev
```

これにより、ファイルの変更を監視し、自動的に再ビルドが行われます (`dist` ディレクトリが更新されます)。Chrome 拡張機能として読み込み直すことで、変更が反映されます。

### ビルド

```bash
yarn build
```

`dist` ディレクトリに本番用のファイルが生成されます。

### テスト

```bash
yarn test
```

### Lint & Format

```bash
# Lintチェック
yarn lint

# フォーマット (Prettier & ESLint --fix)
yarn format
```

## リリース

リリースを作成するには、以下の手順に従ってください：

1. `package.json` の `version` を更新します。
2. リポジトリにタグを付けます（例: `v0.5.1`）:
   ```bash
   git tag v0.5.1
   git push origin v0.5.1
   ```

タグをプッシュすると、GitHub Actions が自動的に拡張機能をビルドし、Chrome Web Store へのアップロード用の zip ファイルを作成します。作成された zip ファイルは GitHub Actions の実行結果からダウンロードできます。

## LICENSE
MIT

This extension contains MIT license software as follows:
- https://github.com/sinanbekar/browser-extension-react-typescript-starter
