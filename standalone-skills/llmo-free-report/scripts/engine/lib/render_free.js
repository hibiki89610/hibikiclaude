// 無料診断レンダラー：Emma LLMOツールの4分析（ファネルKPI／ブランドポジション／
// サイテーション／サイト診断）を、EmmaToolsデザインのpptxに描画する。
// 使い方：build.js が spec（D を export するファイル）を読み、renderFreeReport(pres, api, D) を呼ぶ。
// 旧版（Dify CSV版）の render.js の後継。固定パート（01 考え方 / 05 売上の測り方）は parts.js を共用。
const P = require("./parts");
const { C, F, footer, header, sectionDivider, vennMotif, numCircle, statCallout, card, pill, bl, bar, dataTable, rateBar, addKangaekata, addSalesAttribution } = P;

const CMAP = { OUR: C.OUR, ACCENT: C.ACCENT, DIGI: C.DIGI, NAVY: C.NAVY, USER: C.USER, MUTE: C.MUTE };
const col = k => CMAP[k] || C.OUR;

// ─── 無料版固定パート：当社のご支援メニュー ───
function addServiceMenu(api, sv = {}) {
  const { slide, st } = api;
  const s = slide();
  header(s, "SUPPORT MENU — ここから先のご支援", "無料分析の範囲と、次の選択肢");
  // 無料分析の範囲（スコープ明示）
  card(s, 0.55, 1.6, 12.23, 0.8, { fill: C.LIGHT, line: C.LINE });
  s.addText([
    { text: "本無料分析の範囲　", options: { bold: true, color: C.NAVY, fontSize: 11 } },
    { text: sv.scopeNote || "計測プロンプトは限定本数／掲載メディアリストは一部サンプルのみ／対策は「方向性」までのご提示です。詳細のタスク設計・実行はコンサルティング領域となります。", options: { color: C.INK, fontSize: 10.5 } },
  ], { x: 0.85, y: 1.66, w: 11.7, h: 0.68, margin: 0, fontFace: F, valign: "middle", lineSpacingMultiple: 1.25 });
  // 3プラン
  const plans = sv.plans || [
    { tag: "実行まで任せたい", t: "LLMOコンサルティング", price: "月60万円〜", b: "対策の詳細タスク設計から実行まで伴走。メディア掲載交渉・コンテンツ整備・構造化・月次モニタリングまで一気通貫で支援します。", c: "ACCENT" },
    { tag: "自社で回したい", t: "ツール契約", price: "要お見積り", b: "本分析で使用したモニタリング等、部分的な機能だけのツール契約が可能。自社チームでAI検索の定点観測を回せます。", c: "OUR" },
    { tag: "軽く続けたい", t: "レポーティング＋助言", price: "月1回", b: "本レポート形式での定期レポーティングと改善助言のみのご契約も可能。社内の意思決定材料としてご活用いただけます。", c: "DIGI" },
  ];
  plans.forEach((p, i) => {
    const x = 0.55 + i * 4.12;
    card(s, x, 2.62, 3.88, 2.9, { fill: C.WHITE, line: C.LINE, shadow: true });
    bar(s, x, 2.62, col(p.c), 3.88);
    pill(s, x + 0.28, 2.85, 1.9, p.tag, p.c === "ACCENT" ? C.ACCENT_T : C.OUR_T, col(p.c));
    s.addText(p.t, { x: x + 0.28, y: 3.3, w: 3.35, h: 0.45, margin: 0, fontFace: F, fontSize: 14.5, bold: true, color: C.INK });
    s.addText(p.price, { x: x + 0.28, y: 3.75, w: 3.35, h: 0.42, margin: 0, fontFace: F, fontSize: 16, bold: true, color: col(p.c) });
    s.addText(p.b, { x: x + 0.28, y: 4.22, w: 3.35, h: 1.2, margin: 0, fontFace: F, fontSize: 9.8, color: C.SUB, lineSpacingMultiple: 1.3 });
  });
  // ブランド定義の見直し支援（補足）
  card(s, 0.55, 5.75, 12.23, 1.0, { fill: C.NAVY });
  s.addText([
    { text: "ブランド定義から見直したい場合　", options: { bold: true, color: C.ICE, fontSize: 12, breakLine: true } },
    { text: sv.brandNote || "LLMOは「AIに何者として覚えてもらうか」＝ブランド定義が起点です。CEP分析・n1分析・カテゴリコンセプト開発など、定義そのものを作り直すご支援も可能です。", options: { color: C.WHITE, fontSize: 11 } },
  ], { x: 0.85, y: 5.85, w: 11.6, h: 0.85, margin: 0, fontFace: F, valign: "middle", lineSpacingMultiple: 1.3 });
  footer(s, st.pg);
}

// ─── 無料版固定パート：ツール／モニタリングの対応範囲と料金（2枚） ───
// 出典：02_PJ/04_Partern Product IS/01_共通/01_営業資料/02_LLMO Tool&Monitoring/仮案/
//       LLMOツール・モニタリング_設計と料金案_v2.xlsx（サービス設計／ツール価格設計／モニタリング価格）
// spec で `pricing: null` を指定するとこの2枚をスキップ。個別に文言・行を差し替える場合は pricing に値を渡す。
function addPricingDetail(api, pr = {}) {
  const { slide, st } = api;

  { // 対応範囲（3層の差分）
    const s = slide();
    header(s, "SCOPE — ツール／モニタリングの対応範囲", pr.scopeSubtitle || "どこまでがツールで、どこからがモニタリング・コンサルティングか");
    const rows = pr.scopeRows || [
      ["提供価値", "低単価で定常チェックできる", "状況がわかり、実行に移す土台ができる", "結果が出るまで伴走・コミット"],
      ["プロンプトモニタリング（週3回）", "○ プラン本数まで", "○ ツールと同じ", "○ 業界・ブランドに合わせ設計"],
      ["サイテーション一覧", "○ 一覧表示のみ（優先度なし）", "○ 優先度付け＋狙うべき引用元の提案", "○ 選定から掲載獲得の実行まで"],
      ["サイト最適化診断", "○ 全ページ・制限なし（ページ別）", "○ 横断整理して「サイト共通対策」に", "○ 全ページ＋個別改善の実行"],
      ["ブランドポジション分析", "×（自社の出現率のみ）", "○ ファネル別・AI別に競合と比較", "○ 業界構造・KBFまで設計"],
      ["月1回の深掘りレポート", "×", "○ 前月比・前月アクションの振り返り付き", "○ より広範囲・深い分析"],
      ["実行プランの策定・伴走", "×", "×（対策の方向性まで）", "○ 個別策定＋定例で伴走"],
    ];
    dataTable(s, 0.55, 1.7, pr.scopeColW || [3.2, 3.0, 3.3, 2.73], pr.scopeHeader || ["提供項目", "ツール", "モニタリング", "コンサルティング"], rows, { rowH: pr.scopeRowH || 0.5 });
    s.addText(pr.scopeTakeaway || "本レポートの内容は「モニタリング」の月1レポートに相当します。継続してこの粒度で見ていくのがモニタリング、実行まで任せるのがコンサルティングです。", { x: 0.55, y: 5.5, w: 12.2, h: 0.55, margin: 0, fontFace: F, fontSize: 11, bold: true, color: C.ACCENT, lineSpacingMultiple: 1.25 });
    s.addText(pr.scopeNote || "○＝含む／△＝一部／×＝含まない。計測頻度は週3回・各1回（プロンプトあたり月約13回）で全プラン一律です。", { x: 0.55, y: 6.55, w: 12.2, h: 0.3, margin: 0, fontFace: F, fontSize: 9, color: C.MUTE });
    footer(s, st.pg);
  }

  { // 料金の考え方＋サンプル料金
    const s = slide();
    header(s, "PRICING — 料金の考え方とサンプル料金", pr.priceSubtitle || "プロンプト本数 × レポートの有無 × 計測するAIの数 で決まります");
    const axes = pr.priceAxes || [
      { t: "① プロンプト本数（従量）", b: "計測するプロンプト数に応じた従量制。本数が増えるほど1本あたりの単価は下がります（¥980/本 → ¥250/本）。", c: "OUR" },
      { t: "② モニタリング（月1レポート）", b: "ツール利用に月1回の深掘りレポートを追加。本数帯で上乗せ額が決まります（100本まで＋¥100,000／101〜500本＋¥150,000／501本〜＋¥200,000）。", c: "ACCENT" },
      { t: "③ 計測するAIの数", b: "標準はChatGPT・Gemini・AI Overviewsの3エンジン。Perplexity ＋¥100/本・月、Claude ＋¥450/本・月で追加できます。", c: "DIGI" },
    ];
    axes.forEach((a, i) => {
      const x = 0.55 + i * 4.12;
      card(s, x, 1.65, 3.88, 1.62, { fill: C.WHITE, line: C.LINE, shadow: true });
      bar(s, x, 1.65, col(a.c), 3.88);
      s.addText(a.t, { x: x + 0.28, y: 1.86, w: 3.35, h: 0.36, margin: 0, fontFace: F, fontSize: 12.5, bold: true, color: col(a.c) });
      s.addText(a.b, { x: x + 0.28, y: 2.26, w: 3.35, h: 0.95, margin: 0, fontFace: F, fontSize: 9.8, color: C.SUB, lineSpacingMultiple: 1.3 });
    });
    s.addText(pr.priceTableTitle || "サンプル料金（月額・税抜）", { x: 0.55, y: 3.42, w: 8, h: 0.35, margin: 0, fontFace: F, fontSize: 12.5, bold: true, color: C.OUR });
    const prows = pr.priceRows || [
      ["Starter", "10本", "¥9,800", "－（Standard以上が対象）", "¥980"],
      ["Standard", "50本", "¥50,000", "¥150,000", "¥1,000"],
      ["Pro", "125本", "¥100,000", "¥250,000", "¥800"],
      ["Enterprise（要見積）", "500本", "¥275,000", "¥425,000", "¥550"],
      ["Enterprise（要見積）", "2,000本", "¥500,000", "¥700,000", "¥250"],
    ];
    dataTable(s, 0.55, 3.82, pr.priceColW || [2.6, 1.9, 2.3, 3.3, 2.13], pr.priceHeader || ["プラン", "プロンプト数", "ツールのみ", "＋モニタリング", "1本あたり"], prows, { rowH: pr.priceRowH || 0.42, highlightRow: pr.priceHighlightRow });
    s.addText(pr.priceNote || "月額・税抜。Enterprise帯は要見積です（表の金額は本数逓減カーブに基づく参考単価）。導入前に1週間の無料トライアル（Starter相当をフル開放）をご用意しています。｜本ご案内は2026-09-01時点のものです。", { x: 0.55, y: 6.5, w: 12.2, h: 0.42, margin: 0, fontFace: F, fontSize: 9, color: C.MUTE, lineSpacingMultiple: 1.2 });
    footer(s, st.pg);
  }
}

function renderFreeReport(pres, api, D) {
  const { slide, gradeSlide, st } = api;

  /* 表紙 */
  {
    const s = gradeSlide();
    vennMotif(s, 10.6, 3.6, 1.5, 0.30);
    s.addText(D.cover.badge, { x: 0.9, y: 1.5, w: 10, h: 0.35, margin: 0, fontFace: F, fontSize: 13, bold: true, color: C.ICE, charSpacing: 3 });
    s.addText(D.cover.titleLines, { x: 0.9, y: 2.05, w: 11, h: 1.9, margin: 0, fontFace: F, fontSize: 38, bold: true, color: C.WHITE, lineSpacingMultiple: 1.15 });
    s.addText(D.cover.client, { x: 0.92, y: 4.35, w: 9.5, h: 0.5, margin: 0, fontFace: F, fontSize: 17, bold: true, color: C.WHITE });
    s.addText(D.cover.meta, { x: 0.92, y: 4.95, w: 10.5, h: 0.9, margin: 0, fontFace: F, fontSize: 12.5, color: C.ICE, lineSpacingMultiple: 1.4 });
    footer(s, null, { dark: true, credit: D.cover.credit || "EXIDEA Inc. / EmmaTools LLMO" });
  }
  /* AGENDA */
  {
    const s = slide();
    header(s, "AGENDA", "本日お話しすること");
    const items = D.agenda;
    const step = items.length > 5 ? 0.84 : 1.0, ch = step - 0.14;
    items.forEach((it, i) => {
      const y = 1.6 + i * step;
      card(s, 0.55, y, 12.23, ch, { fill: i === 2 ? C.OUR_T : C.LIGHT });
      s.addText(it[0], { x: 0.85, y, w: 1.0, h: ch, margin: 0, fontFace: F, fontSize: 20, bold: true, color: C.OUR, valign: "middle" });
      s.addText(it[1], { x: 2.0, y, w: 4.3, h: ch, margin: 0, fontFace: F, fontSize: 13.5, bold: true, color: C.INK, valign: "middle" });
      s.addText(it[2], { x: 6.4, y, w: 6.1, h: ch, margin: 0, fontFace: F, fontSize: 10.5, color: C.SUB, valign: "middle" });
    });
    footer(s, st.pg);
  }

  /* 01 LLMOの考え方（固定8枚） */
  { const s = gradeSlide(); sectionDivider(s, "01", "LLMOの考え方", "まず「AIに選ばれる」とは何かを揃えます。", st.pg); }
  addKangaekata(pres, api);

  /* 02 調査の前提 */
  { const s = gradeSlide(); sectionDivider(s, "02", "調査の前提", "どのプロンプトで・どう読むか。", st.pg); }
  {
    const s = slide();
    header(s, "SCOPE — 計測対象", D.scope.title || "ファネル別の計測プロンプト（無料版・限定本数）");
    s.addText(D.scope.note, { x: 0.55, y: 1.55, w: 12.2, h: 0.4, margin: 0, fontFace: F, fontSize: 11, color: C.SUB });
    dataTable(s, 0.55, 2.05, D.scope.colW, D.scope.header, D.scope.rows, { rowH: D.scope.rowH || 0.62 });
    s.addText(D.scope.footnote, { x: 0.55, y: 6.5, w: 12.2, h: 0.4, margin: 0, fontFace: F, fontSize: 9.5, color: C.MUTE });
    footer(s, st.pg);
  }

  /* 03 現状分析 */
  { const s = gradeSlide(); sectionDivider(s, "03", "現状分析", "AI検索上のKPI・ブランド認識・引用元・サイト要因。", st.pg); }
  { // FACT
    const s = slide();
    header(s, "KEY FINDINGS — わかった事実", "本分析で判明した3つの事実");
    D.facts.forEach((f, i) => {
      const x = 0.55 + i * 4.12;
      card(s, x, 1.85, 3.88, 4.55, { fill: C.WHITE, line: C.LINE, shadow: true });
      bar(s, x, 1.85, col(f.c), 3.88);
      s.addText("FACT 0" + (i + 1), { x: x + 0.28, y: 2.05, w: 3.3, h: 0.32, margin: 0, fontFace: F, fontSize: 10, bold: true, color: col(f.c), charSpacing: 1 });
      s.addText(f.n, { x: x + 0.28, y: 2.35, w: 3.35, h: 0.8, margin: 0, fontFace: F, fontSize: f.n.length > 5 ? 24 : 40, bold: true, color: col(f.c) });
      s.addText(f.t, { x: x + 0.28, y: 3.25, w: 3.35, h: 0.95, margin: 0, fontFace: F, fontSize: 12.5, bold: true, color: C.INK, lineSpacingMultiple: 1.2 });
      s.addText(f.b, { x: x + 0.28, y: 4.25, w: 3.35, h: 2.0, margin: 0, fontFace: F, fontSize: 9.8, color: C.SUB, lineSpacingMultiple: 1.3 });
    });
    s.addText(D.factsNote || "🔵 観測（EmmaTools LLMOツール実測）", { x: 0.55, y: 6.55, w: 12.2, h: 0.3, margin: 0, fontFace: F, fontSize: 9, color: C.MUTE });
    footer(s, st.pg);
  }
  { // 現状分析① ファネル別KPI達成度（/monitoring）
    const K = D.funnelKpi;
    const s = slide();
    header(s, "現状分析① — ファネル別KPI", K.subtitle || "AI検索のカスタマージャーニー4段階での現在地");
    K.cards.forEach((k, i) => {
      const x = 0.55 + i * 3.12;
      card(s, x, 1.75, 2.92, 2.75, { fill: C.WHITE, line: C.LINE, shadow: true });
      bar(s, x, 1.75, col(k.c), 2.92);
      numCircle(s, x + 0.24, 1.98, i + 1, col(k.c), 0.38);
      s.addText(k.stage, { x: x + 0.72, y: 1.96, w: 2.1, h: 0.42, margin: 0, fontFace: F, fontSize: 12.5, bold: true, color: C.INK, valign: "middle" });
      s.addText(k.kpi, { x: x + 0.26, y: 2.5, w: 2.45, h: 0.32, margin: 0, fontFace: F, fontSize: 10, bold: true, color: C.MUTE });
      s.addText(k.value, { x: x + 0.26, y: 2.8, w: 2.45, h: 0.75, margin: 0, fontFace: F, fontSize: 32, bold: true, color: col(k.c) });
      s.addText(k.detail, { x: x + 0.26, y: 3.62, w: 2.45, h: 0.75, margin: 0, fontFace: F, fontSize: 9.5, color: C.SUB, lineSpacingMultiple: 1.25 });
      if (i < K.cards.length - 1) s.addText("▶", { x: x + 2.9, y: 2.85, w: 0.28, h: 0.4, margin: 0, fontFace: F, fontSize: 13, color: C.PALE ? col(k.c) : col(k.c), align: "center" });
    });
    card(s, 0.55, 4.75, 12.23, 1.7, { fill: C.LIGHT });
    s.addText("読み取り", { x: 0.85, y: 4.9, w: 4, h: 0.35, margin: 0, fontFace: F, fontSize: 12.5, bold: true, color: C.OUR });
    s.addText(bl(K.reading, 10.8), { x: 0.85, y: 5.28, w: 11.6, h: 1.1, margin: 0 });
    s.addText(K.note, { x: 0.55, y: 6.55, w: 12, h: 0.3, margin: 0, fontFace: F, fontSize: 9, color: C.MUTE });
    footer(s, st.pg);
  }
  { // 現状分析② ブランドポジション（/brand-listening + ヒアリング差分）
    const B = D.brandPosition;
    const s = slide();
    header(s, "現状分析② — AI上のブランド認識", B.subtitle || "AIの中で、何者として認識されているか");
    if (B.stats) s.addText(B.stats.map((t, i) => ({ text: (i ? "　｜　" : "") + t[0] + "：", options: { fontSize: 10.5, color: C.SUB } })).flatMap((o, i) => [o, { text: B.stats[i][1], options: { fontSize: 11.5, bold: true, color: C.OUR } }]), { x: 0.55, y: 1.5, w: 12.2, h: 0.32, margin: 0, fontFace: F });
    card(s, 0.55, 1.95, 6.05, 2.45, { fill: C.OUR_T });
    s.addText("🔵 強い認識（AIが自社の勝ち筋として語る軸）", { x: 0.85, y: 2.12, w: 5.5, h: 0.35, margin: 0, fontFace: F, fontSize: 12, bold: true, color: C.OUR });
    s.addText(bl(B.strong, 10, C.INK), { x: 0.85, y: 2.52, w: 5.5, h: 1.8, margin: 0 });
    card(s, 6.85, 1.95, 5.93, 2.45, { fill: C.LIGHT });
    s.addText("🔵 弱い認識（競合が支配・自社が圏外の軸）", { x: 7.15, y: 2.12, w: 5.4, h: 0.35, margin: 0, fontFace: F, fontSize: 12, bold: true, color: C.NAVY });
    s.addText(bl(B.weak, 10, C.INK), { x: 7.15, y: 2.52, w: 5.4, h: 1.8, margin: 0 });
    card(s, 0.55, 4.55, 12.23, 1.9, { fill: C.NAVY });
    s.addText("🟡 ブランド差分分析 — “ありたい認識”（ヒアリング）とのギャップ", { x: 0.85, y: 4.72, w: 11.6, h: 0.35, margin: 0, fontFace: F, fontSize: 12.5, bold: true, color: C.ICE });
    s.addText(bl(B.gap, 10.5, C.WHITE), { x: 0.85, y: 5.12, w: 11.6, h: 1.25, margin: 0 });
    s.addText(B.note, { x: 0.55, y: 6.55, w: 12, h: 0.3, margin: 0, fontFace: F, fontSize: 9, color: C.MUTE });
    footer(s, st.pg);
  }
  { // 現状分析③ サイテーション（/citation-list）
    const T = D.citations;
    const s = slide();
    header(s, "現状分析③ — サイテーション（AIの引用元）", T.subtitle || "AIが引用するメディアに、自社は載っているか");
    T.stats.forEach((t, i) => {
      const x = 0.55 + i * 4.12;
      card(s, x, 1.7, 3.88, 1.5, { fill: i === T.stats.length - 1 ? C.ACCENT_T : C.OUR_T });
      s.addText(t.n, { x: x + 0.26, y: 1.82, w: 3.4, h: 0.62, margin: 0, fontFace: F, fontSize: 26, bold: true, color: i === T.stats.length - 1 ? C.ACCENT : C.OUR });
      s.addText(t.label, { x: x + 0.26, y: 2.46, w: 3.4, h: 0.62, margin: 0, fontFace: F, fontSize: 10.5, bold: true, color: C.INK, lineSpacingMultiple: 1.2 });
    });
    s.addText(T.sampleTitle || "掲載ギャップの例（サンプル）", { x: 0.55, y: 3.45, w: 8, h: 0.35, margin: 0, fontFace: F, fontSize: 12.5, bold: true, color: C.OUR });
    dataTable(s, 0.55, 3.85, T.sample.colW, T.sample.header, T.sample.rows, { rowH: T.sample.rowH || 0.62 });
    s.addText(T.takeaway, { x: 0.55, y: 6.15, w: 12.2, h: 0.38, margin: 0, fontFace: F, fontSize: 11, bold: true, color: C.ACCENT });
    s.addText(T.note || "🔵 観測（EmmaTools LLMO）｜※無料版は一部サンプルのみのご提示です。対策対象の全メディアリストは有償分析でご提供します。", { x: 0.55, y: 6.55, w: 12.2, h: 0.3, margin: 0, fontFace: F, fontSize: 9, color: C.MUTE });
    footer(s, st.pg);
  }
  if (D.citationsDetail) { // 任意：サイテーション詳細（掲載ギャップの深掘り。specに書いたぶんだけスライドを足す）
    // 1要素＝1スライド。{title, subtitle, lead?, table?{colW,header,rows,rowH}, box?{title,body,h}, takeaway?, note?}
    D.citationsDetail.forEach(T => {
      const s = slide();
      header(s, T.title, T.subtitle || "");
      let y = 1.6;
      if (T.lead) {
        const lh = T.leadH || 0.66;
        card(s, 0.55, y, 12.23, lh, { fill: C.LIGHT });
        s.addText(T.lead, { x: 0.85, y: y + 0.03, w: 11.6, h: lh - 0.06, margin: 0, fontFace: F, fontSize: 10.8, color: C.INK, valign: "middle", lineSpacingMultiple: 1.25 });
        y += lh + 0.18;
      }
      if (T.table) {
        const rh = T.table.rowH || 0.58;
        dataTable(s, 0.55, y, T.table.colW, T.table.header, T.table.rows, { rowH: rh, highlightRow: T.table.highlightRow });
        y += (T.table.rows.length + 1) * rh + 0.18;
      }
      if (T.box) {
        const bh = T.box.h || 0.95;
        card(s, 0.55, y, 12.23, bh, { fill: C.NAVY });
        s.addText(T.box.title, { x: 0.85, y: y + 0.1, w: 11.6, h: 0.32, margin: 0, fontFace: F, fontSize: 12, bold: true, color: C.ICE });
        s.addText(T.box.body, { x: 0.85, y: y + 0.44, w: 11.6, h: bh - 0.52, margin: 0, fontFace: F, fontSize: 10.5, color: C.WHITE, lineSpacingMultiple: 1.3 });
        y += bh + 0.15;
      }
      if (T.takeaway) s.addText(T.takeaway, { x: 0.55, y: Math.min(y, 6.15), w: 12.2, h: 0.38, margin: 0, fontFace: F, fontSize: 11, bold: true, color: C.ACCENT });
      s.addText(T.note || "🔵 観測（EmmaTools LLMO）｜※無料版は一部サンプルのみのご提示です。", { x: 0.55, y: 6.55, w: 12.2, h: 0.3, margin: 0, fontFace: F, fontSize: 9, color: C.MUTE });
      footer(s, st.pg);
    });
  }
  if (D.siteAudit) { // 現状分析④ サイト要因診断（/site-audit）※未実行のときは spec で null にしてスキップ
    const A = D.siteAudit;
    const s = slide();
    header(s, "現状分析④ — サイト要因診断", A.subtitle || "AIに引用されやすいサイトになっているか（35シグナル評価）");
    card(s, 0.55, 1.75, 3.6, 2.9, { fill: C.OUR_T });
    s.addText(A.avg, { x: 0.85, y: 2.0, w: 3.0, h: 0.9, margin: 0, fontFace: F, fontSize: 42, bold: true, color: C.OUR });
    s.addText("平均スコア（100点満点）", { x: 0.85, y: 2.95, w: 3.0, h: 0.35, margin: 0, fontFace: F, fontSize: 11, bold: true, color: C.INK });
    s.addText("診断対象：" + A.pages + " ページ", { x: 0.85, y: 3.35, w: 3.0, h: 0.35, margin: 0, fontFace: F, fontSize: 10.5, color: C.SUB });
    s.addText(A.avgNote || "", { x: 0.85, y: 3.75, w: 3.0, h: 0.8, margin: 0, fontFace: F, fontSize: 9.5, color: C.MUTE, lineSpacingMultiple: 1.25 });
    card(s, 4.35, 1.75, 8.43, 2.9, { fill: C.WHITE, line: C.LINE });
    s.addText("スコア分布", { x: 4.65, y: 1.92, w: 4, h: 0.32, margin: 0, fontFace: F, fontSize: 11.5, bold: true, color: C.NAVY });
    A.dist.forEach((d, i) => {
      const y = 2.32 + i * 0.56;
      rateBar(s, 4.65, y, 7.85, d.g + "（" + d.label + "）", Math.round(d.count / A.pages * 100), col(d.c), d.count + "頁");
    });
    card(s, 0.55, 4.85, 12.23, 1.6, { fill: C.LIGHT });
    s.addText("主な所見", { x: 0.85, y: 5.0, w: 4, h: 0.35, margin: 0, fontFace: F, fontSize: 12.5, bold: true, color: C.OUR });
    s.addText(bl(A.findings, 10.3), { x: 0.85, y: 5.38, w: 11.6, h: 1.0, margin: 0 });
    s.addText(A.note, { x: 0.55, y: 6.55, w: 12, h: 0.3, margin: 0, fontFace: F, fontSize: 9, color: C.MUTE });
    footer(s, st.pg);
  }
  if (D.aivoice) { // AI Voice（任意：AIが自社をどう語るか＋Company Voice突き合わせ）
    const s = slide();
    header(s, "現状分析（補足）— 自社がAIにどう語られているか", "AI Voice：AIの中の“自社像”");
    card(s, 0.55, 1.7, 6.05, 2.5, { fill: C.OUR_T });
    s.addText("🔵 AIが語る自社像（観測）", { x: 0.85, y: 1.9, w: 5.4, h: 0.35, margin: 0, fontFace: F, fontSize: 12.5, bold: true, color: C.OUR });
    s.addText(bl(D.aivoice.obs, 10.5, C.INK), { x: 0.85, y: 2.32, w: 5.5, h: 1.8, margin: 0 });
    card(s, 6.85, 1.7, 5.93, 2.5, { fill: C.LIGHT });
    s.addText("🟡 想起の歪み・課題（推定）", { x: 7.15, y: 1.9, w: 5.4, h: 0.35, margin: 0, fontFace: F, fontSize: 12.5, bold: true, color: C.NAVY });
    s.addText(bl(D.aivoice.issues, 10.5, C.INK), { x: 7.15, y: 2.32, w: 5.4, h: 1.8, margin: 0 });
    card(s, 0.55, 4.35, 12.23, 2.1, { fill: C.NAVY });
    s.addText("Company Voice（自社サイト）との突き合わせ", { x: 0.85, y: 4.55, w: 11.6, h: 0.35, margin: 0, fontFace: F, fontSize: 12.5, bold: true, color: C.ICE });
    s.addText(bl(D.aivoice.band, 10.5, C.WHITE), { x: 0.85, y: 4.95, w: 11.6, h: 1.4, margin: 0 });
    footer(s, st.pg);
  }

  /* 04 対策の方向性 */
  { const s = gradeSlide(); sectionDivider(s, "04", "対策の方向性", "無料版では“方向性”までをご提示します。", st.pg); }
  {
    const s = slide();
    header(s, "DIRECTION — 対策の方向性", "事実をふまえた4つの方向性");
    D.strategy.forEach((p, i) => {
      const x = 0.55 + (i % 2) * 6.28, y = 1.85 + Math.floor(i / 2) * 2.35;
      card(s, x, y, 5.95, 2.1, { fill: C.WHITE, line: C.LINE, shadow: true });
      bar(s, x, y, col(p.c));
      s.addText(p.n, { x: x + 0.35, y: y + 0.2, w: 1.2, h: 0.35, margin: 0, fontFace: F, fontSize: 12, bold: true, color: col(p.c) });
      pill(s, x + 4.0, y + 0.2, 1.7, p.tag, p.c === "ACCENT" ? C.ACCENT_T : C.OUR_T, col(p.c));
      s.addText(p.t, { x: x + 0.35, y: y + 0.55, w: 5.3, h: 0.5, margin: 0, fontFace: F, fontSize: 13.5, bold: true, color: C.INK, lineSpacingMultiple: 1.1 });
      s.addText(p.b, { x: x + 0.35, y: y + 1.05, w: 5.35, h: 0.95, margin: 0, fontFace: F, fontSize: 10, color: C.SUB, lineSpacingMultiple: 1.28 });
    });
    s.addText(D.strategyNote || "🟡 提言（方向性）｜具体的なタスク設計・実行計画は、コンサルティングでご提供します。", { x: 0.55, y: 6.55, w: 12.2, h: 0.3, margin: 0, fontFace: F, fontSize: 9, color: C.MUTE });
    footer(s, st.pg);
  }
  if (D.roadmap) {
    const s = slide();
    header(s, "ROADMAP — 道筋", "効果が出るまでのロードマップ（概観）");
    const xs = [0.55, 4.73, 8.91];
    D.roadmap.forEach((p, i) => {
      const x = xs[i];
      card(s, x, 1.9, 3.87, 4.2, { fill: C.WHITE, line: C.LINE });
      bar(s, x, 1.9, col(p.c), 3.87);
      s.addText(p.t, { x: x + 0.25, y: 2.15, w: 3.4, h: 0.4, margin: 0, fontFace: F, fontSize: 12.5, bold: true, color: col(p.c) });
      s.addText(bl(p.items, 10.3, C.INK), { x: x + 0.25, y: 2.65, w: 3.4, h: 3.2, margin: 0 });
    });
    s.addText(D.roadmapNote, { x: 0.55, y: 6.3, w: 12.23, h: 0.4, margin: 0, fontFace: F, fontSize: 12, bold: true, color: C.ACCENT, align: "center" });
    footer(s, st.pg);
  }

  /* 05 AI経由売上の測り方（固定2枚） */
  { const s = gradeSlide(); sectionDivider(s, "05", "AI経由売上の測り方", "露出指標で終わらせず、AIが貢献した売上を金額で示す。", st.pg); }
  addSalesAttribution(pres, api, D.salesMode);

  /* 06 ご支援メニュー（固定） */
  { const s = gradeSlide(); sectionDivider(s, "06", "ここから先のご支援", "実行まで任せる／自社で回す／軽く続ける。", st.pg); }
  addServiceMenu(api, D.services);
  if (D.pricing !== null) addPricingDetail(api, D.pricing || {}); // 料金・対応範囲（既定で表示。spec で pricing: null にすると非表示）

  /* CTA */
  {
    const s = gradeSlide();
    vennMotif(s, 11.2, 5.7, 0.85, 0.25);
    s.addText("NEXT STEP", { x: 0.9, y: 1.6, w: 9, h: 0.35, margin: 0, fontFace: F, fontSize: 13, bold: true, color: C.ICE, charSpacing: 3 });
    s.addText(D.cta.headline, { x: 0.9, y: 2.1, w: 11, h: 1.7, margin: 0, fontFace: F, fontSize: 28, bold: true, color: C.WHITE, lineSpacingMultiple: 1.2 });
    s.addText(bl(D.cta.points, 13, C.ICE), { x: 0.95, y: 4.0, w: 10.7, h: 2.0, margin: 0 });
    s.addText("株式会社EXIDEA　EmmaTools / LLMO", { x: 0.9, y: 6.6, w: 8, h: 0.3, margin: 0, fontFace: F, fontSize: 11, color: "B9A7E0" });
    footer(s, null, { dark: true });
  }
}

module.exports = { renderFreeReport, addServiceMenu, addPricingDetail };
