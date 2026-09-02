// 新規資料のテンプレート。このフォルダごとコピーして engine/specs/<資料名>/spec.js にする。
// ★★…★★ を、input/deck-brief.md のブリーフと確認済みの事実で置き換える。
// スキーマ：engine/README.md ／ 完成例：engine/specs/sample/spec.js
// 色キー：our(メイン) / accent(オレンジ＝警告・即効) / digi(濃) / navy(強調) / user(明) / mute(灰)
//
// 使わないスライドは、その要素ごと削除してよい（順番も自由に入れ替えられる）。
module.exports = {
  meta: {
    title: "★★資料タイトル★★",
    credit: "★★社名 / CONFIDENTIAL など。空文字なら非表示★★",
  },
  // theme: { primary: "#8541dc", accent: "#f57527" }, // ブランド色に変えるときだけ指定

  slides: [
    // ── 表紙 ──
    {
      type: "cover",
      badge: "★★PROPOSAL / REPORT など★★",
      title: "★★結論が伝わる見出し（2行まで、\\n で改行）★★",
      subtitle: "★★1文で補足（省略可）★★",
      client: "★★宛先 御中★★",
      meta: "★★対象・条件★★\n作成日：★★YYYY-MM-DD★★ ｜ 作成：★★部署・氏名★★",
    },

    // ── 目次 ──
    {
      type: "agenda",
      items: [
        ["01", "★★章タイトル★★", "★★一言説明★★"],
        ["02", "★★★★", "★★★★"],
        ["03", "★★★★", "★★★★"],
      ],
      // highlight: 1,  // 今日いちばん話す章を強調（0始まり・省略可）
    },

    // ── 章扉 ──
    { type: "section", no: "01", title: "★★章タイトル★★", subtitle: "★★この章で何を揃えるか★★" },

    // ── 結論（数字カード2〜4枚） ──
    {
      type: "facts",
      kicker: "KEY FINDINGS",
      title: "★★わかった事実★★",
      cards: [
        { n: "★★", t: "★★事実の見出し★★", b: "★★根拠となる数値を添えて2〜3文★★", c: "accent" },
        { n: "★★", t: "★★★★", b: "★★★★", c: "navy" },
        { n: "★★", t: "★★★★", b: "★★★★", c: "our" },
      ],
      note: "🔵 観測（★★出典・取得日★★）",
    },

    // ── 指標（KPIカード2〜5枚＋読み取り） ──
    {
      type: "kpi",
      kicker: "★★現状分析①★★",
      title: "★★何の指標か★★",
      cards: [
        { stage: "★★段階名★★", kpi: "★★指標名★★", value: "★★値★★", detail: "★★補足★★", c: "our" },
        { stage: "★★★★", kpi: "★★★★", value: "★★★★", detail: "★★★★", c: "accent" },
      ],
      reading: ["★★数字から言えること★★", "★★原因の仮説まで★★"],
      note: "🔵 観測（★★★★）｜🟡 読み取りは推定を含みます",
    },

    // ── 2カラム比較 ──
    {
      type: "compare",
      kicker: "★★★★",
      title: "★★A / B の対比★★",
      left:  { t: "★★できていること★★", c: "our",    items: ["★★★★", "★★★★"] },
      right: { t: "★★できていないこと★★", c: "accent", items: ["★★★★", "★★★★"] },
      gap: { t: "差分から言えること", items: ["★★対比の意味を1〜2文で★★"] },
    },

    // ── 打ち手カード（2〜4枚） ──
    {
      type: "cards",
      kicker: "APPROACH",
      title: "★★打ち手★★",
      lead: "★★前置き（省略可）★★",
      cards: [
        { tag: "★★タグ★★", t: "★★打ち手名★★", b: "★★何を・なぜ★★", c: "accent" },
        { tag: "★★★★", t: "★★★★", b: "★★★★", c: "our" },
      ],
    },

    // ── 帯（フロー・レイヤー） ──
    {
      type: "bands",
      kicker: "WORKFLOW",
      title: "★★流れ★★",
      rows: [
        { label: "① ★★", c: "our",    desc: "★★★★" },
        { label: "② ★★", c: "digi",   desc: "★★★★" },
        { label: "③ ★★", c: "accent", desc: "★★★★" },
      ],
    },

    // ── 表（5〜7行まで。それ以上はスライドを分ける） ──
    {
      type: "table",
      kicker: "SCOPE",
      title: "★★表のタイトル★★",
      colW: [3, 2, 5],
      header: ["★★列1★★", "★★列2★★", "★★列3★★"],
      rows: [
        ["★★", "★★", "★★"],
        ["★★", "★★", "★★"],
      ],
      // highlightRow: 0,
      takeaway: "★★表から言いたいことを1文で★★",
    },

    // ── 大きい数字（2〜4個） ──
    {
      type: "stats",
      kicker: "IMPACT",
      title: "★★効果・規模★★",
      stats: [
        { n: "★★", label: "★★何の数字か★★", source: "★★算出根拠★★", c: "accent" },
        { n: "★★", label: "★★★★", source: "★★★★", c: "our" },
      ],
      note: "🟡 推定（★★試算の前提★★）",
    },

    // ── ロードマップ（2〜4列） ──
    {
      type: "timeline",
      kicker: "ROADMAP",
      title: "★★スケジュール★★",
      cols: [
        { t: "★★短期★★", c: "accent", items: ["★★", "★★"] },
        { t: "★★中期★★", c: "our",    items: ["★★", "★★"] },
        { t: "★★長期★★", c: "digi",   items: ["★★", "★★"] },
      ],
    },

    // ── 箇条書き（前提・注意点） ──
    {
      type: "bullets",
      kicker: "PRECONDITIONS",
      title: "★★前提・留意点★★",
      items: ["★★★★", "★★★★"],
      box: { title: "この資料に含まれないこと", body: "★★スコープ外を明記★★" },
    },

    // ── 濃色1枚メッセージ ──
    { type: "message", kicker: "SUMMARY", title: "★★いちばん言いたいこと★★", body: "★★補足1〜2文★★" },

    // ── 最終CTA ──
    {
      type: "cta",
      headline: "★★次の一歩★★",
      points: ["★★★★", "★★★★", "★★★★"],
    },
  ],
};
