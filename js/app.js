/* マークダウン練習帳
   ------------------------------------------------------------
   左（スマホでは下）に書くと、右（スマホでは上）に整形後がその場で出る。
   すべてこの端末の中だけで動く。書いたものはこのブラウザの保存領域にだけ残り、
   どこにも送られない。

   できること：
   - ブロックを1つずつ押して組み上げる。お手本をまるごと入れて書き換える
   - 書いたものを .md（マークダウンのまま）か .html（整形後）で保存する
   - 書いたものをコピーする（AIに貼るため）
   ------------------------------------------------------------ */
(function () {
  "use strict";

  var STORE_KEY = "mdp.draft.v1";        /* 下書きの保存先（このブラウザの中） */
  var SAMPLE_KEY = "mdp.sample.v1";      /* いまどの見本を元にしているか */
  var el = {};

  function $(id) { return document.getElementById(id); }

  /* ---------- 整形 ---------- */
  function render(md) {
    if (!window.marked) { return "<p>整形の部品が読み込めませんでした。ページを再読み込みしてください。</p>"; }
    /* 改行はそのまま改行にする（見出しや箇条書きを知らない人が、Enterで行を変えたときに
       つながって表示されると「壊れた」と感じる。練習帳なので優しく倒す） */
    marked.setOptions({ gfm: true, breaks: true });
    return marked.parse(md || "");
  }

  function paint() {
    var md = el.editor.value;
    el.preview.innerHTML = md.trim() ? render(md) : "<p>書いたものが、ここに整形されて出ます。<br>「押すと入る」のボタンを1つずつ押して、組み上げてみてください。</p>";
    el.preview.classList.toggle("is-empty", !md.trim());
    el.count.textContent = md.length ? md.length.toLocaleString("ja-JP") + " 文字" : "";
  }

  /* ---------- 保存（このブラウザの中だけ） ---------- */
  var saveTimer = null;
  function saveSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try { localStorage.setItem(STORE_KEY, el.editor.value); } catch (e) { /* 保存できない環境でも書くのは止めない */ }
    }, 300);
  }
  function loadDraft() {
    try { return localStorage.getItem(STORE_KEY) || ""; } catch (e) { return ""; }
  }

  /* ---------- ブロック（押すと入る） ----------
     「やろうと思った → できた」を1押しで体験させる。
     見本の文字を選択した状態で入れるので、そのまま打てば置き換わる。
     sel は選択する文字。無ければ全体を選択 */
  var BLOCKS = [
    { id: "h1",    label: "見出し",     mark: "#",    text: "# 見出し",                       sel: "見出し" },
    { id: "h2",    label: "小見出し",   mark: "##",   text: "## 小見出し",                    sel: "小見出し" },
    { id: "p",     label: "文",         mark: "",     text: "ここに文を書きます。",            sel: "ここに文を書きます。" },
    { id: "ul",    label: "箇条書き",   mark: "-",    text: "- ひとつめ\n- ふたつめ\n- みっつめ", sel: "ひとつめ" },
    { id: "ol",    label: "番号つき",   mark: "1.",   text: "1. さいしょに\n2. つぎに\n3. さいごに", sel: "さいしょに" },
    { id: "bold",  label: "太字",       mark: "**",   text: "**大事なところ**",               sel: "大事なところ" },
    { id: "quote", label: "引用・注意", mark: ">",    text: "> 引用や注意書きは、ここに。",   sel: "引用や注意書きは、ここに。" },
    { id: "table", label: "表",         mark: "|",    text: "| 項目 | 内容 |\n|---|---|\n| 日時 | 10/17(土) 10:00 |\n| 場所 | 公民館 |", sel: "項目" },
    { id: "hr",    label: "区切り線",   mark: "---",  text: "---",                             sel: "" },
    { id: "link",  label: "リンク",     mark: "[ ]",  text: "[AIかけこみ寺](https://ai-kakekomi.com)", sel: "AIかけこみ寺" },
    { id: "code",  label: "そのまま枠", mark: "```",  text: "```\nこの枠の中は、書いたとおりに出ます。\n```", sel: "この枠の中は、書いたとおりに出ます。" }
  ];

  function drawBlocks() {
    BLOCKS.forEach(function (b) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("data-block", b.id);
      if (b.mark) { var m = document.createElement("b"); m.textContent = b.mark; btn.appendChild(m); }
      btn.appendChild(document.createTextNode(b.label));
      btn.addEventListener("click", function () { insertBlock(b); });
      el.blocks.appendChild(btn);
    });
  }

  /* カーソルの位置にブロックを入れる。
     前後に空の行を1つ置く（マークダウンは空の行で段落を切るため）。
     行の途中なら、いったん行を変えてから入れる */
  function insertBlock(b) {
    var t = el.editor, v = t.value;
    /* 選択は置き換えない。前に入れた見本の文字が選ばれたままの状態で次を押すと、
       その見本が消えてしまう（実際に起きた）。常にカーソルの後ろに足す */
    var s = t.selectionEnd, e = s;
    /* いまいる段落（かたまり）の終わりまで進めてから足す。
       箇条書きの1行目を選んだまま「表」を押すと、箇条書きの真ん中に表が刺さっていた */
    var gap = v.indexOf("\n\n", s);
    s = e = (gap === -1) ? v.length : gap;
    var before = v.slice(0, s), after = v.slice(e);
    var head = "";
    if (before.length && !/\n\n$/.test(before)) { head = /\n$/.test(before) ? "\n" : "\n\n"; }
    var tail = "";
    if (after.length && !/^\n\n/.test(after)) { tail = /^\n/.test(after) ? "\n" : "\n\n"; }
    var ins = head + b.text + tail;
    t.value = before + ins + after;
    /* 見本の文字を選択しておく。そのまま打てば置き換わる */
    var at = before.length + head.length + (b.sel ? b.text.indexOf(b.sel) : b.text.length);
    var len = b.sel ? b.sel.length : 0;
    t.focus();
    t.setSelectionRange(at, at + len);
    paint(); saveSoon();
    /* 入れた場所が見えるように */
    var line = t.value.slice(0, at).split("\n").length;
    t.scrollTop = Math.max(0, (line - 4) * 27);
    el.preview.scrollTop = el.preview.scrollHeight;
  }

  /* ---------- 見本 ---------- */
  function drawSamples() {
    $("samples-btn").addEventListener("click", function () {
      var open = el.samples.hidden;
      el.samples.hidden = !open;
      $("samples-btn").setAttribute("aria-expanded", open ? "true" : "false");
    });
    var list = window.MDP_SAMPLES || [];
    list.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = s.label;
      b.setAttribute("data-sample", s.id);
      b.addEventListener("click", function () { putSample(s); });
      el.samples.appendChild(b);
    });
  }
  function putSample(s) {
    /* 書きかけがあるときは、上書きしてよいか聞く。押し間違いで消えると練習の気が失せる */
    var cur = el.editor.value.trim();
    var isSample = (window.MDP_SAMPLES || []).some(function (x) { return x.text.trim() === cur; });
    if (cur && !isSample && !confirm("いま書いているものを消して、お手本「" + s.label + "」を入れます。よいですか？")) { return; }
    el.editor.value = s.text;
    try { localStorage.setItem(SAMPLE_KEY, s.id); } catch (e) {}
    markSample(s.id);
    paint(); saveSoon();
    el.editor.scrollTop = 0; el.preview.scrollTop = 0;
    toast("お手本「" + s.label + "」を入れました。自由に書き換えてください");
  }
  function markSample(id) {
    var bs = el.samples.querySelectorAll("button[data-sample]");
    for (var i = 0; i < bs.length; i++) { bs[i].classList.toggle("is-on", bs[i].getAttribute("data-sample") === id); }
  }

  /* ---------- 書き出し ---------- */
  /* 保存するファイルの名前。最初の見出しから作る。無ければ日付 */
  function fileBase() {
    var m = el.editor.value.match(/^#\s+(.+)$/m);
    var name = m ? m[1].trim() : "";
    name = name.replace(/[\\\/:*?"<>|]/g, "").slice(0, 40);
    if (!name) {
      var d = new Date();
      name = "markdown-" + d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
    }
    return name;
  }
  function download(name, text, type) {
    var blob = new Blob([text], { type: type + ";charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  /* 整形後をひとつのHTMLにする。見た目の指定もいっしょに入れて、
     どこで開いても同じに見えるようにする（このページの .md の指定を写す） */
  function exportHtml() {
    var title = fileBase();
    var css = "";
    try {
      var sheets = document.styleSheets;
      for (var i = 0; i < sheets.length; i++) {
        var rules = sheets[i].cssRules;
        if (!rules) continue;
        for (var j = 0; j < rules.length; j++) {
          var t = rules[j].cssText || "";
          if (t.indexOf(".md") === 0 || t.indexOf(":root") === 0) { css += t + "\n"; }
        }
      }
    } catch (e) { /* 読めない環境では飾りなしで出す */ }
    return "<!DOCTYPE html>\n<html lang=\"ja\">\n<head>\n<meta charset=\"UTF-8\">\n" +
      "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n" +
      "<title>" + escapeHtml(title) + "</title>\n<style>\n" +
      "body{margin:0;padding:24px 16px 60px;background:#FDF8F0;color:#2C2C2C;font-family:\"Hiragino Sans\",\"Yu Gothic\",\"Meiryo\",sans-serif;line-height:1.8}\n" +
      ".md{max-width:760px;margin:0 auto;background:#fff;padding:28px 24px;border-radius:14px;box-shadow:0 4px 20px rgba(45,106,79,.08)}\n" +
      css + "</style>\n</head>\n<body>\n<div class=\"md\">\n" + render(el.editor.value) + "\n</div>\n</body>\n</html>\n";
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }

  /* ---------- コピー ---------- */
  function copyText(text, msg) {
    function done(ok) { toast(ok ? msg : "コピーできませんでした。文章を選んでコピーしてください"); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      return;
    }
    var ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    ta.remove(); done(ok);
  }

  /* ---------- お知らせ ---------- */
  function toast(msg) {
    el.toast.textContent = msg; el.toast.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { el.toast.hidden = true; }, 2600);
  }

  /* ---------- Tab キーで空白を入れる（階層の練習で要る） ---------- */
  function tabKey(e) {
    if (e.key !== "Tab") return;
    e.preventDefault();
    var t = el.editor, s = t.selectionStart, n = t.selectionEnd;
    t.value = t.value.slice(0, s) + "  " + t.value.slice(n);
    t.selectionStart = t.selectionEnd = s + 2;
    paint(); saveSoon();
  }

  /* ---------- 起動 ---------- */
  function boot() {
    ["editor", "preview", "samples", "blocks", "count", "toast"].forEach(function (k) { el[k] = $(k); });
    drawBlocks();
    drawSamples();

    /* 初めて開いた人は白紙から。ブロックを1つずつ押して組み上げるのが、この練習帳の入口。
       まるごとのお手本は「お手本をまるごと入れる」の中に畳んである */
    var draft = loadDraft();
    if (draft) {
      el.editor.value = draft;
      try { markSample(localStorage.getItem(SAMPLE_KEY)); } catch (e) {}
    }
    paint();

    el.editor.addEventListener("input", function () { paint(); saveSoon(); });
    el.editor.addEventListener("keydown", tabKey);

    $("copy-md").addEventListener("click", function () { copyText(el.editor.value, "書いたものをコピーしました。AIの画面に貼ってください"); });
    $("dl-md").addEventListener("click", function () { download(fileBase() + ".md", el.editor.value, "text/markdown"); toast("マークダウンのまま保存しました（" + fileBase() + ".md）"); });
    $("dl-html").addEventListener("click", function () { download(fileBase() + ".html", exportHtml(), "text/html"); toast("整形後を保存しました（" + fileBase() + ".html）"); });
    $("copy-html").addEventListener("click", function () { copyText(exportHtml(), "整形後（ホームページの形）をコピーしました"); });
    $("clear").addEventListener("click", function () {
      if (!el.editor.value.trim()) return;
      if (!confirm("書いたものを全部消します。よいですか？（保存したファイルは残ります）")) return;
      el.editor.value = ""; markSample(null);
      try { localStorage.removeItem(STORE_KEY); localStorage.removeItem(SAMPLE_KEY); } catch (e) {}
      paint(); el.editor.focus();
    });
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); } else { boot(); }

  /* テストから触れるように */
  window.MDP = { render: render, fileBase: fileBase, exportHtml: exportHtml, blocks: BLOCKS, insertBlock: insertBlock };
})();
