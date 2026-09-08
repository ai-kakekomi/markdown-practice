/* マークダウン練習帳のテスト。Node だけで動く（追加の道具なし）。
   見るのは3つ。
   1. 記入例が壊れていない（読み込める・見出しがある・実在の人名が入っていない）
   2. 画面に技術用語が出ていない（利用者は非技術者）
   3. 整形と書き出しが正しい形になる */
"use strict";
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var ROOT = path.join(__dirname, "..");
var pass = 0, fail = 0;
function ok(cond, name, detail) {
  if (cond) { pass++; console.log("  ok  " + name); }
  else { fail++; console.log("  NG  " + name + (detail ? "   → " + detail : "")); }
}
function read(p) { return fs.readFileSync(path.join(ROOT, p), "utf8"); }

/* ---- ブラウザ無しで marked と見本を読む ---- */
var sandbox = { window: {}, console: console };
sandbox.self = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(read("vendor/marked.min.js"), sandbox);
vm.runInContext(read("js/samples.js"), sandbox);
var marked = sandbox.marked || sandbox.window.marked;
var SAMPLES = sandbox.window.MDP_SAMPLES;

console.log("\n== 1. 記入例 ==");
ok(Array.isArray(SAMPLES) && SAMPLES.length >= 9, "お手本が9つ以上ある", String(SAMPLES && SAMPLES.length));
ok(SAMPLES[0].id === "readme" && /README\.md/.test(SAMPLES[0].label), "最初のお手本は README.md（この練習帳の説明書）");
var ids = {};
SAMPLES.forEach(function (s) {
  ok(s.id && s.label && s.text, "「" + s.label + "」に id・label・text がある");
  ok(!ids[s.id], "id が重複していない: " + s.id); ids[s.id] = true;
  ok(/^#\s/m.test(s.text), "「" + s.label + "」に大見出し（# ）がある");
  ok(s.text.indexOf("```") === -1, "「" + s.label + "」のコード枠は ~~~ を使っている（``` は JS の中で壊れる）");
  ok(s.text.indexOf("\\`") === -1, "「" + s.label + "」に逆斜線つきのバッククォートが残っていない");
  var html = marked.parse(s.text, { gfm: true, breaks: true });
  ok(html.indexOf("<h1") >= 0, "「" + s.label + "」が整形できる");
  ok(!/^> /.test(s.text), "「" + s.label + "」は解説の引用で始まらない（型そのものを見せる）");
});
/* 実在のメンバー名を見本に出さない（公開されるものなので） */
var real = ["大場", "寺村", "寺田", "いとう", "河村", "原田", "伊藤一樹"];
SAMPLES.forEach(function (s) {
  real.forEach(function (n) {
    ok(s.text.indexOf(n) === -1, "「" + s.label + "」に実在の人名「" + n + "」が入っていない");
  });
});

console.log("\n== 2. 画面の言葉 ==");
var index = read("index.html");
var visible = index.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");
["localStorage", "JSON", "YAML", "リポジトリ", "レンダリング", "パース", "デプロイ"].forEach(function (w) {
  ok(visible.indexOf(w) === -1, "画面に「" + w + "」が出ていない");
});
ok(visible.indexOf("どこにも送られません") >= 0, "画面に「どこにも送られません」と書いてある");
ok(visible.indexOf("AIにはこう見えます") >= 0, "整形後に「AIにはこう見えます」と書いてある");
ok(index.indexOf('id="editor"') > 0 && index.indexOf('id="preview"') > 0, "書く欄と整形後の欄がある");
["copy-md", "dl-md", "dl-html", "dl-png", "dl-pdf", "copy-html", "clear", "undo", "samples", "blocks"].forEach(function (id) {
  ok(index.indexOf('id="' + id + '"') > 0, "ボタン " + id + " がある");
});
var css = read("css/style.css");
ok(/\.editor-pane\s*\{\s*order:\s*1/.test(css), "スマホでは書く欄が上（order: 1）");
ok(/@media \(min-width: 900px\)[\s\S]*\.editor-pane\s*\{[^}]*border-right/.test(css), "画面が広いときは書く欄が左");
ok(/grid-template-columns:\s*1fr 1fr/.test(css), "画面が広いときは左右に分かれる");
ok(/\.work \{ display: flex; flex-direction: column; \}/.test(css), "スマホでは画面の高さに押し込まず、縦に流す");
ok(/textarea#editor \{ min-height: 52dvh; \}/.test(css), "スマホの書く欄は画面の半分以上の高さがある");
var manual = read("manual.html");
["どこに行くか", "できないこと", "AIに頼む", "MIT"].forEach(function (w) {
  ok(manual.indexOf(w) >= 0, "使い方に「" + w + "」の節がある");
});
ok(manual.indexOf("github.com/ai-kakekomi/markdown-practice") >= 0, "使い方のプロンプトにリポジトリのアドレスがある");

console.log("\n== 2.3 チャレンジ ==");
var app = read("js/app.js");
vm.runInContext(read("js/challenges.js"), sandbox);
var CH = sandbox.window.MDP_CHALLENGES;
ok(Array.isArray(CH) && CH.length >= 5, "チャレンジが5つ以上ある", String(CH && CH.length));
CH.forEach(function (c) {
  ok(c.id && c.title && c.hint && c.checks.length >= 3, "「" + c.title + "」に id・title・hint・チェック3つ以上がある");
  c.checks.forEach(function (k) { ok(typeof k.test === "function" && k.label, "「" + c.title + "」のチェック「" + k.label + "」が関数"); });
  ok(c.checks.every(function (k) { return k.test("") === false; }), "「" + c.title + "」は白紙では何も付かない");
});
var chById = {}; CH.forEach(function (c) { chById[c.id] = c; });
var diary = "# 9/7 の日記\n\n今日はプリンタが届いた。\n設定に30分かかった。\n\n- よかったこと1\n- よかったこと2\n- よかったこと3\n\n**明日は承諾書を印刷する**\n";
ok(chById.diary.checks.every(function (k) { return k.test(diary); }), "日記の見本でチャレンジ「日記」がクリアになる");
ok(!chById.diary.checks[2].test("- a\n- b\n"), "箇条書きが2つでは付かない");
var ask = "# お願い：案内文\n\n## 目的\n回覧板\n\n## やってほしいこと\n- 300字\n\n## やらないでほしいこと\n- 絵文字\n\n## 材料\n| 日時 | 8/2 |\n|---|---|\n";
ok(chById.ask.checks.every(function (k) { return k.test(ask); }), "4つの見出しの型でチャレンジ「AIにお願い」がクリアになる");
var fr = SAMPLES.filter(function (x) { return x.id === "ai-friend"; })[0];
ok(chById["ai-friend"].checks.every(function (k) { return k.test(fr.text); }), "お手本「AIフレンドを作る」をそのまま入れるとチャレンジ「AIフレンド」がクリアになる");
ok(index.indexOf('id="challenge"') > 0 && index.indexOf('id="ch-next"') > 0, "チャレンジのカードと次へボタンがある");
ok(app.indexOf("chPaint()") > 0, "書くたびにチャレンジを判定する");
ok(/chOpen = false;/.test(app) && /id="challenge"[^>]*hidden/.test(index), "チャレンジは最初は閉じている（右上のボタンで開く）");

console.log("\n== 2.5 ブロック ==");
var blocksSrc = app.match(/var BLOCKS = \[[\s\S]*?\n  \];/)[0];
var BLOCKS = new Function(blocksSrc + " return BLOCKS;")();
ok(BLOCKS.length >= 10, "ブロックが10個以上ある", String(BLOCKS.length));
BLOCKS.forEach(function (b) {
  ok(b.id && b.label && typeof b.text === "string", "ブロック「" + b.label + "」に id・label・text がある");
  ok(!b.sel || b.text.indexOf(b.sel) >= 0, "ブロック「" + b.label + "」の選択する文字が見本の中にある");
  var html = marked.parse(b.text, { gfm: true, breaks: true });
  ok(html.trim().length > 0, "ブロック「" + b.label + "」が整形できる");
});
var byId = {}; BLOCKS.forEach(function (b) { byId[b.id] = b; });
ok(/<h1/.test(marked.parse(byId.h1.text)), "「見出し」は h1 になる");
ok(/<table>/.test(marked.parse(byId.table.text, { gfm: true })), "「表」は表になる");
ok(/<pre>/.test(marked.parse(byId.code.text)), "「そのまま枠」は枠になる");
ok(app.indexOf("setSelectionRange(at, at + len)") > 0, "入れた見本の文字は選択された状態になる（そのまま打てば置き換わる）");
ok(!/first\.text/.test(app), "初めて開いたときは白紙（お手本を勝手に入れない）");
ok(!/confirm\(/.test(app), "確認ダイアログを出さない（さくさく遊べる）");
ok(app.indexOf("undoText") > 0, "消したものは「元にもどす」で戻せる");
ok(!/id="samples"[^>]*hidden/.test(index), "お手本の列は最初から出ている");
ok(app.indexOf("var s = t.selectionEnd, e = s;") > 0, "ブロックは選択を置き換えず、カーソルの後ろに足す");
ok(app.indexOf('v.indexOf("\\n\\n", s)') > 0, "ブロックは、いまの段落の終わりに足す（箇条書きの真ん中に刺さらない）");
ok(/\.pane \{[^}]*min-width: 0/.test(css), "列の幅がボタン列に押し広げられない（min-width: 0）");

console.log("\n== 3. 整形と書き出し ==");
ok(app.indexOf("breaks: true") > 0, "改行はそのまま改行にする（Enter で行が変わる）");
ok(app.indexOf("URL.createObjectURL") > 0 && app.indexOf("a.download") > 0, ".md と .html の保存はブラウザの中で作る（送信しない）");
ok(!/fetch\(|XMLHttpRequest|navigator\.sendBeacon/.test(app), "どこにも送信していない");
/* ファイル名は最初の見出しから。危ない文字は落とす */
var fileBaseSrc = app.match(/function fileBase\(\) \{[\s\S]*?\n  \}/)[0];
var fb = new Function("el", "return (" + fileBaseSrc.replace("function fileBase()", "function ()") + ")();");
ok(fb({ editor: { value: "# お願い：夏祭り/案内*文\n本文" } }) === "お願い：夏祭り案内文", "ファイル名は最初の見出しから、危ない文字を落として作る");
ok(/^markdown-\d{8}$/.test(fb({ editor: { value: "見出しなし" } })), "見出しが無ければ日付の名前になる");
var out = marked.parse("# 題\n\n- a\n- b\n\n| x | y |\n|---|---|\n| 1 | 2 |", { gfm: true, breaks: true });
ok(/<h1/.test(out) && /<ul>/.test(out) && /<table>/.test(out), "見出し・箇条書き・表が整形される");
ok(app.indexOf("html2canvas(") > 0 && app.indexOf('".png"') > 0, "画像（PNG）で保存できる");
ok(app.indexOf("window.print()") > 0, "PDF はブラウザの印刷で保存する");
ok(/@media print[\s\S]*\.editor-pane[^}]*display: none/.test(css), "印刷のときは書く欄を出さない（整形後だけ）");
ok(fs.existsSync(path.join(ROOT, "vendor", "html2canvas.min.js")), "html2canvas を同梱している");
var friend = SAMPLES.filter(function (x) { return x.id === "ai-friend"; })[0];
ok(!!friend && /ぼくも分からない/.test(friend.text) && /## 性格/.test(friend.text), "AIフレンドのお手本に「ぼくも分からない」と「性格」がある");

console.log("\n============================================");
console.log("  成功 " + pass + " 件 ／ 失敗 " + fail + " 件");
console.log("============================================\n");
process.exit(fail ? 1 : 0);
