# FocusForge — 日本語対応（i18n）仕様書

## 概要
FocusForgeに日本語UIを追加し、英語/日本語の言語切り替えを実装する。

## 技術スタック
- Next.js 16 + React 19
- next-intl ライブラリを使用

## 要件

### 1. next-intl セットアップ
- `pnpm add next-intl` でインストール
- `messages/en.json` と `messages/ja.json` に翻訳ファイル
- `src/i18n/` にルーティング設定
- `middleware.ts` でロケール検出（Accept-Language → デフォルトen）

### 2. 翻訳対象
- 全UIテキスト（ランディングページ、ダッシュボード、ボタン、ラベル等）
- ページタイトル（metadata）
- Pomodoro関連テキスト
- AI Breakdown関連テキスト
- XPシステム関連テキスト
- エラーメッセージ

### 3. 言語スイッチャー
- ヘッダーのテーマトグル隣に配置
- EN/JA テキストトグル
- LocalStorageに選択を保存

### 4. URL構造
- `/en/dashboard`, `/ja/dashboard` のようなパス方式
- デフォルト: `/en/...`

### 5. 日本語翻訳の注意
- ADHD用語は日本でも認知されているのでカタカナ表記OK
- 「ポモドーロ」「タスク」「XP」はそのまま使用
- やわらかいトーンで（「～しましょう！」「頑張った！」等）

### 6. 品質基準
- `pnpm run build` が通ること
- 型エラーなし
- モバイル390pxで日本語表示確認（テキストあふれなし）

## 制約
- 既存の英語機能を壊さない
- ダッシュボードのlocalStorageデータは言語に依存しない
