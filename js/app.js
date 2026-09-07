/* マークダウン練習帳
   ------------------------------------------------------------
   左（スマホでは下）に書くと、右（スマホでは上）に整形後がその場で出る。
   すべてこの端末の中だけで動く。書いたものはこのブラウザの保存領域にだけ残り、
   どこにも送られない。

   できること：
   - 記入例を入れて、書き換えて練習する
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
    el.preview.innerHTML = md.trim() ? render(md) : "<p>左（スマホでは下）に書くと、ここに整形後が出ます。<br>上の「記入例」を押すと、お手本が入ります。</p>";
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

  /* ---------- 見本 ---------- */
  function drawSamples() {
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
    if (cur && !isSample && !confirm("いま書いているものを消して、記入例「" + s.label + "」を入れます。よいですか？")) { return; }
    el.editor.value = s.text;
    try { localStorage.setItem(SAMPLE_KEY, s.id); } catch (e) {}
    markSample(s.id);
    paint(); saveSoon();
    el.editor.scrollTop = 0; el.preview.scrollTop = 0;
    toast("記入例「" + s.label + "」を入れました。自由に書き換えてください");
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

  /* ---------- 早見表 ---------- */
  function toggleCheat(open) {
    var on = (open === undefined) ? !el.cheat.classList.contains("is-open") : open;
    el.cheat.classList.toggle("is-open", on);
    el.cheatBtn.setAttribute("aria-expanded", on ? "true" : "false");
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
    ["editor", "preview", "samples", "count", "toast", "cheat", "cheatBtn"].forEach(function (k) {
      el[k] = $({ editor: "editor", preview: "preview", samples: "samples", count: "count", toast: "toast", cheat: "cheat", cheatBtn: "cheat-btn" }[k]);
    });
    drawSamples();

    var draft = loadDraft();
    if (draft) {
      el.editor.value = draft;
      try { markSample(localStorage.getItem(SAMPLE_KEY)); } catch (e) {}
    } else {
      /* 初めて開いた人には、いきなり白紙を見せない。基本の書き方を入れておく */
      var first = (window.MDP_SAMPLES || [])[0];
      if (first) { el.editor.value = first.text; markSample(first.id); }
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
    el.cheatBtn.addEventListener("click", function () { toggleCheat(); });
    $("cheat-close").addEventListener("click", function () { toggleCheat(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") toggleCheat(false); });
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); } else { boot(); }

  /* テストから触れるように */
  window.MDP = { render: render, fileBase: fileBase, exportHtml: exportHtml };
})();
