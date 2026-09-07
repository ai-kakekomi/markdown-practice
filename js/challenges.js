/* チャレンジ課題。
   「日記を書いてみよう」のような小さなお題を出し、書いたものが条件を満たすと
   その場でチェックが付く。全部付いたらクリア。

   test は、書いた文字（マークダウンそのもの）を受け取って true/false を返す。
   見ているのは記号の形だけで、内容の良し悪しは見ない（練習帳なので） */
window.MDP_CHALLENGES = [

  {
    id: "diary",
    title: "今日の日記を書いてみよう",
    hint: "見出しに日付、文を少し、よかったことを箇条書きで。1つだけ太字にしてみてください。",
    checks: [
      { label: "見出し（#）に今日の日付", test: function (md) { return /^#\s+.*\d+.*$/m.test(md); } },
      { label: "ふつうの文を2行以上", test: function (md) { return md.split("\n").filter(function (l) { return l.trim() && !/^(#|-|\d+\.|>|\||```|---)/.test(l.trim()); }).length >= 2; } },
      { label: "箇条書き（-）を3つ", test: function (md) { return (md.match(/^\s*-\s+\S/gm) || []).length >= 3; } },
      { label: "太字（**）を1つ", test: function (md) { return /\*\*[^*\n]+\*\*/.test(md); } }
    ]
  },

  {
    id: "shopping",
    title: "買い物メモを作ろう",
    hint: "見出しに店の名前、買うものを番号つきで。忘れやすいものは引用（>）で注意書きに。",
    checks: [
      { label: "見出し（#）", test: function (md) { return /^#\s+\S/m.test(md); } },
      { label: "番号つき（1.）を4つ以上", test: function (md) { return (md.match(/^\s*\d+\.\s+\S/gm) || []).length >= 4; } },
      { label: "引用（>）で注意書き", test: function (md) { return /^>\s*\S/m.test(md); } },
      { label: "区切り線（---）", test: function (md) { return /^---\s*$/m.test(md); } }
    ]
  },

  {
    id: "profile",
    title: "自己紹介を書こう",
    hint: "見出しに名前、小見出しで「すきなもの」「さいきんのこと」。すきなものは表にすると読みやすいです。",
    checks: [
      { label: "見出し（#）", test: function (md) { return /^#\s+\S/m.test(md); } },
      { label: "小見出し（##）を2つ", test: function (md) { return (md.match(/^##\s+\S/gm) || []).length >= 2; } },
      { label: "表（|）", test: function (md) { return /^\|.*\|\s*$/m.test(md) && /^\|?\s*-{3,}/m.test(md); } },
      { label: "リンク（[文字](アドレス)）", test: function (md) { return /\[[^\]]+\]\(https?:\/\/[^)]+\)/.test(md); } }
    ]
  },

  {
    id: "ask",
    title: "AIにお願いしてみよう（本番の型）",
    hint: "小見出しを「目的」「やってほしいこと」「やらないでほしいこと」「材料」の4つに分けます。材料は表に。",
    checks: [
      { label: "見出し（#）に何を頼むか", test: function (md) { return /^#\s+\S/m.test(md); } },
      { label: "## 目的", test: function (md) { return /^##\s*目的/m.test(md); } },
      { label: "## やってほしいこと（箇条書きつき）", test: function (md) { return /^##\s*やってほしいこと[\s\S]*?^\s*-\s+\S/m.test(md); } },
      { label: "## やらないでほしいこと（箇条書きつき）", test: function (md) { return /^##\s*やらないでほしいこと[\s\S]*?^\s*-\s+\S/m.test(md); } },
      { label: "## 材料（表つき）", test: function (md) { return /^##\s*材料[\s\S]*?^\|.*\|/m.test(md); } }
    ]
  },

  {
    id: "rules",
    title: "AIへの決まりごと（CLAUDE.md）を作ろう",
    hint: "自分や団体のことを書き、「いつも守ること」「やってはいけないこと」を箇条書きで。困ったときの一文も。",
    checks: [
      { label: "見出し（#）", test: function (md) { return /^#\s+\S/m.test(md); } },
      { label: "## いつも守ること（箇条書き3つ以上）", test: function (md) { var m = md.match(/^##\s*いつも守ること([\s\S]*?)(?=^##|\s*$(?![\s\S]))/m); return !!m && (m[1].match(/^\s*-\s+\S/gm) || []).length >= 3; } },
      { label: "## やってはいけないこと（箇条書き）", test: function (md) { return /^##\s*やってはいけないこと[\s\S]*?^\s*-\s+\S/m.test(md); } },
      { label: "太字（**）で一番大事なこと", test: function (md) { return /\*\*[^*\n]+\*\*/.test(md); } }
    ]
  },

  {
    id: "minutes",
    title: "走り書きを議事録にしよう",
    hint: "メモを「そのまま枠」に入れて、返し方を番号つきで指定します。決まったことは表に。",
    checks: [
      { label: "見出し（#）", test: function (md) { return /^#\s+\S/m.test(md); } },
      { label: "番号つき（1.）で返し方", test: function (md) { return (md.match(/^\s*\d+\.\s+\S/gm) || []).length >= 2; } },
      { label: "そのまま枠（```）にメモ", test: function (md) { return /^(```|~~~)[\s\S]+?^(```|~~~)/m.test(md); } },
      { label: "表（|）", test: function (md) { return /^\|.*\|\s*$/m.test(md); } }
    ]
  }
];
