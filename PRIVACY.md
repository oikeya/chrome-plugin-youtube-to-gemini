# Privacy Policy / プライバシーポリシー

Effective date / 施行日: 2026-06-22

## English

### Overview

YouTube to Gemini is an unofficial Chrome extension that helps a user send a user-selected YouTube video's title, URL, and a summary prompt to Google Gemini. It is not affiliated with, endorsed by, or provided by Google, YouTube, or Gemini.

### Data handled by the extension

The extension handles only the following data required for its user-facing feature:

- The title and URL of the YouTube video whose **Summarize** button the user clicks.
- The summary language, custom prompt, and automatic-send preference configured by the user.
- The final prompt assembled from those values.

The extension does not collect account credentials, cookies, complete browsing history, analytics, advertising identifiers, or payment information.

### How data is used and shared

- Settings are stored using Chrome Storage Sync and may be synchronized by Chrome according to the user's Chrome settings.
- After the user clicks **Summarize**, the extension temporarily stores the assembled prompt in Chrome's local extension storage so it can be transferred between the YouTube and Gemini tabs. It is removed after insertion or after it expires.
- The video title, URL, and prompt are disclosed directly to Google Gemini solely to provide the requested summary. If **Send to Gemini automatically** is disabled, the extension fills the Gemini input and waits for the user to review and send it. If the user explicitly enables that setting, the extension also activates Gemini's Send button.
- If Gemini's input cannot be found, the prompt is shown in a read-only field on the Gemini page. The extension does not copy it to the system clipboard.

The developer does not operate a server for this extension and does not receive, store, sell, or use this data for advertising. Data processed by Google services is governed by Google's own terms and privacy policy.

### Retention and deletion

Settings remain in Chrome storage until the user changes them, clears extension data, or uninstalls the extension. A pending prompt is transient and is removed after use or expiration.

### Limited Use

The use of information received from Chrome APIs adheres to the Chrome Web Store User Data Policy, including the Limited Use requirements. Data is used only to provide the extension's single user-facing purpose, is not used for personalized advertising, and is not made available for human review by the developer.

### Contact

Questions can be sent to **oikeya.store@gmail.com**.

## 日本語

### 概要

YouTube to Geminiは、ユーザーが選択したYouTube動画のタイトル、URL、要約プロンプトをGoogle Geminiへ渡す非公式Chrome拡張です。Google、YouTube、Geminiによる承認・提供を受けた製品ではありません。

### 取り扱うデータ

ユーザー向け機能の提供に必要な、次のデータのみを取り扱います。

- ユーザーが「要約」ボタンを押したYouTube動画のタイトルとURL
- ユーザーが設定した要約言語、カスタムプロンプト、自動送信設定
- これらから組み立てた最終プロンプト

アカウント認証情報、Cookie、閲覧履歴全体、アクセス解析情報、広告識別子、決済情報は収集しません。

### 利用方法と共有先

- 設定はChrome Storage Syncへ保存され、ユーザーのChrome設定に従ってChromeによって同期される場合があります。
- 「要約」を押した後、YouTubeタブからGeminiタブへ渡すため、完成したプロンプトをChromeの拡張機能用ローカルストレージへ一時保存します。入力後または有効期限後に削除します。
- 動画タイトル、URL、プロンプトは、ユーザーが要求した要約を生成する目的に限りGoogle Geminiへ直接渡されます。「Geminiへ自動送信する」が無効の場合はGeminiの入力欄へ入力して停止し、ユーザーの確認と送信を待ちます。ユーザーが明示的に有効化した場合のみ、送信ボタンも自動で押します。
- Geminiの入力欄を検出できない場合は、Gemini画面上の読み取り専用欄へプロンプトを表示します。拡張機能がOSのクリップボードへ自動コピーすることはありません。

開発者は本拡張用のサーバーを運用しておらず、これらのデータを受信、保存、販売、広告利用しません。Googleサービス上で処理されるデータには、Googleの規約およびプライバシーポリシーが適用されます。

### 保存期間と削除

設定は、ユーザーが変更、拡張データを消去、または拡張をアンインストールするまでChromeストレージに保存されます。処理待ちのプロンプトは使用後または有効期限後に削除されます。

### Limited Use

Chrome APIから取得した情報の利用は、Limited Use要件を含むChrome Web Store User Data Policyに準拠します。データは本拡張の単一のユーザー向け目的にのみ使用し、パーソナライズ広告には使用せず、開発者が人手で閲覧することもありません。

### 連絡先

お問い合わせ先: **oikeya.store@gmail.com**
