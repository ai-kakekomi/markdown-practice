# マークダウン練習帳（markdown-practice）

AIに伝わりやすい書き方（マークダウン）を、書きながら覚える練習帳です。
左（スマホでは下）に書くと、右（スマホでは上）に整形後がその場で出ます。

非営利団体 **AIかけこみ寺** が制作し、**MITライセンス** で公開しています。
配信先: https://ai-kakekomi.com/apps/markdown-practice/

## できること

- 書いたそばから整形後（AIにはこう見えます）が見える（パソコンは左右、スマホは上下）
- 「押すと入る」ブロック 11個（見出し・箇条書き・表・太字など）。押すと小さな見本がカーソルの位置に入り、
  見本の文字が選ばれた状態になるので、そのまま打てば置き換わる。白紙から組み上げる
- お手本 8つ（README.md（この練習帳の説明書）／基本の書き方／AIへのお願い文／CLAUDE.md・AGENTS.md／
  アプリ・ホームページ・チラシを作ってもらう／議事録）
- 書いたものをコピー（AIに貼る）、.md で保存、整形後を .html で保存・コピー
- 書きかけは、この端末のブラウザの中に残る（次に開いたとき続きから）

## 情報の流れ

**完全にローカルで動きます。** サーバーもデータベースもなく、書いたものはどこにも送られません。
保存先はこの端末のブラウザ（localStorage）だけです。詳しくは `manual.html` の「書いたものはどこに行くか」を見てください。

## 動かし方

静的なファイルだけなので、`index.html` をブラウザで開けば動きます（`file://` でも可）。

```
git clone https://github.com/ai-kakekomi/markdown-practice.git
cd markdown-practice
open index.html          # Mac
start index.html         # Windows
```

## 構成

| | |
|---|---|
| `index.html` | 練習帳の画面 |
| `manual.html` | 使い方（情報の流れ、AIに頼んで改造する方法、免責） |
| `js/app.js` | 整形・保存・書き出し |
| `js/samples.js` | お手本。増やすならここ |
| `css/style.css` | 見た目。整形後の見た目（`.md`）は書き出すHTMLにも写される |
| `vendor/marked.min.js` | 整形の部品 [marked](https://github.com/markedjs/marked) v15（MIT） |
| `test/run.js` | テスト |

## テスト

```
npm test
```

Node だけで動きます（追加の道具は要りません）。記入例が壊れていないか、画面に技術用語が出ていないか、
書き出すHTMLが正しい形か、を見ます。

## 自分用に変える

`manual.html` の「自分用に変えたい（AIに頼む）」に、Claude Code や Codex に貼るだけの文を置いてあります。
記入例の追加は `js/samples.js` に1項目足すだけです。

## ライセンス

MIT License. Copyright (c) 2026 AIかけこみ寺 / AI Kakekomi-dera
